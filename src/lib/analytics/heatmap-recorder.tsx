"use client";

import { useEffect, useRef } from "react";

import {
  readTrackAttributes,
  trackAnalyticsEvent,
} from "@/lib/analytics/tracker";
import type { AnalyticsEventName, TrackPayload } from "@/lib/analytics/types";

type RecentClick = {
  x: number;
  y: number;
  at: number;
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Number(value.toFixed(2))));
}

function getPageHeight() {
  return Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    window.innerHeight,
  );
}

function getCoordinatePayload(event: PointerEvent | MouseEvent): TrackPayload {
  const pageHeight = getPageHeight();
  const section = (event.target as Element | null)?.closest<HTMLElement>(
    "[data-track-section]",
  );
  const sectionRect = section?.getBoundingClientRect();

  return {
    xPct: clampPercent((event.clientX / window.innerWidth) * 100),
    yPct: clampPercent((event.clientY / window.innerHeight) * 100),
    pageYPct: clampPercent(
      ((window.scrollY + event.clientY) / Math.max(pageHeight, 1)) * 100,
    ),
    sectionXPct: sectionRect
      ? clampPercent(
          ((event.clientX - sectionRect.left) / sectionRect.width) * 100,
        )
      : undefined,
    sectionYPct: sectionRect
      ? clampPercent(
          ((event.clientY - sectionRect.top) / sectionRect.height) * 100,
        )
      : undefined,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    scrollY: Math.round(window.scrollY),
    pageHeight,
  };
}

function isInteractiveTarget(target: Element | null) {
  return Boolean(
    target?.closest(
      "a,button,input,select,textarea,[role='button'],[data-track-action='true']",
    ),
  );
}

export function HeatmapRecorder() {
  const recentClicksRef = useRef<RecentClick[]>([]);
  const lastPointerSampleRef = useRef(0);
  const lastScrollSampleRef = useRef(0);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) {
      return;
    }

    trackAnalyticsEvent("page_view", {
      elementId: "page",
      sectionId: "page",
    });

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const attributes = readTrackAttributes(target);
      const coordinatePayload = getCoordinatePayload(event);
      const eventName: AnalyticsEventName =
        event.pointerType === "touch" ? "heat_tap" : "heat_click";
      const isInteractive = isInteractiveTarget(target);
      const now = Date.now();

      trackAnalyticsEvent(eventName, {
        ...attributes,
        ...coordinatePayload,
        metadata: {
          pointerType: event.pointerType || "mouse",
        },
      });

      if (!isInteractive) {
        trackAnalyticsEvent("heat_dead_click", {
          ...attributes,
          ...coordinatePayload,
          metadata: {
            reason: "non_interactive_area",
          },
        });
      }

      const recentClicks = recentClicksRef.current
        .filter((click) => now - click.at < 900)
        .concat({ x: event.clientX, y: event.clientY, at: now });
      recentClicksRef.current = recentClicks;

      const clusteredClicks = recentClicks.filter((click) => {
        const dx = click.x - event.clientX;
        const dy = click.y - event.clientY;
        return Math.sqrt(dx * dx + dy * dy) < 42;
      });

      if (clusteredClicks.length >= 3) {
        trackAnalyticsEvent("heat_rage_click", {
          ...attributes,
          ...coordinatePayload,
          metadata: {
            clicks: clusteredClicks.length,
          },
        });
        recentClicksRef.current = [];
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const now = Date.now();
      if (now - lastPointerSampleRef.current < 420) {
        return;
      }

      lastPointerSampleRef.current = now;
      trackAnalyticsEvent("heat_pointer_sample", {
        ...readTrackAttributes(event.target as Element | null),
        ...getCoordinatePayload(event),
      });
    };

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollSampleRef.current < 900) {
        return;
      }

      lastScrollSampleRef.current = now;
      const pageHeight = getPageHeight();
      const viewportMiddle = window.scrollY + window.innerHeight / 2;
      const centerElement = document.elementFromPoint(
        window.innerWidth / 2,
        window.innerHeight / 2,
      );

      trackAnalyticsEvent("heat_scroll_depth", {
        ...readTrackAttributes(centerElement),
        xPct: 50,
        yPct: 50,
        pageYPct: clampPercent(
          (viewportMiddle / Math.max(pageHeight, 1)) * 100,
        ),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        scrollY: Math.round(window.scrollY),
        pageHeight,
      });
    };

    const attentionTimer = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }

      const centerElement = document.elementFromPoint(
        window.innerWidth / 2,
        window.innerHeight / 2,
      );
      const pageHeight = getPageHeight();

      trackAnalyticsEvent("heat_attention_tick", {
        ...readTrackAttributes(centerElement),
        xPct: 50,
        yPct: 50,
        pageYPct: clampPercent(
          ((window.scrollY + window.innerHeight / 2) /
            Math.max(pageHeight, 1)) *
            100,
        ),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        scrollY: Math.round(window.scrollY),
        pageHeight,
        metadata: {
          seconds: 5,
        },
      });
    }, 5000);

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-track-section]"),
    );
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.42) {
            return;
          }

          const section = entry.target as HTMLElement;
          trackAnalyticsEvent("section_view", {
            sectionId: section.dataset.trackSection,
            elementId: `${section.dataset.trackSection}:section`,
            metadata: {
              ratio: Number(entry.intersectionRatio.toFixed(2)),
            },
          });
          trackAnalyticsEvent("heat_element_exposure", {
            sectionId: section.dataset.trackSection,
            elementId: `${section.dataset.trackSection}:section`,
            metadata: {
              ratio: Number(entry.intersectionRatio.toFixed(2)),
            },
          });
          sectionObserver.unobserve(section);
        });
      },
      { threshold: [0.42, 0.68] },
    );
    sections.forEach((section) => sectionObserver.observe(section));

    window.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
      passive: true,
    });
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.clearInterval(attentionTimer);
      sectionObserver.disconnect();
      window.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      });
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}
