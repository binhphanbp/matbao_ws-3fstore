"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef } from "react";

export function BackToTopProgress() {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const button = buttonRef.current;

    if (!root || !button) {
      return;
    }

    let frameId = 0;

    const updateProgress = () => {
      frameId = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollable > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollable))
          : 0;

      root.style.setProperty("--scroll-ratio", progress.toFixed(4));
      root.style.setProperty(
        "--scroll-angle",
        `${Math.round(progress * 360)}deg`,
      );
      button.dataset.visible = window.scrollY > 360 ? "true" : "false";
    };

    const requestUpdate = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-x-0 top-0 z-[95] [--scroll-angle:0deg] [--scroll-ratio:0]"
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label="Lên đầu trang"
        data-visible="false"
        onClick={() => {
          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;

          window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        }}
        className="pointer-events-auto fixed right-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] grid size-12 translate-y-4 scale-95 place-items-center rounded-full bg-[conic-gradient(#ff4f3c_var(--scroll-angle),#dcefeb_0deg)] p-[3px] text-[#073f42] opacity-0 shadow-[0_12px_28px_rgba(7,63,66,0.18)] transition duration-300 hover:-translate-y-0.5 data-[visible=true]:translate-y-0 data-[visible=true]:scale-100 data-[visible=true]:opacity-100 sm:right-6 sm:bottom-6 sm:size-13"
      >
        <span className="grid size-full place-items-center rounded-full border border-[#d9ece8] bg-[#f8fffd] text-[#073f42]">
          <ArrowUp className="size-5" strokeWidth={2.4} aria-hidden />
        </span>
      </button>
    </div>
  );
}
