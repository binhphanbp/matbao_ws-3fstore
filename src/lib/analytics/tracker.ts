"use client";

import { appendLiveAnalyticsEvent } from "@/lib/analytics/demo-store";
import type {
  AnalyticsEvent,
  AnalyticsEventName,
  DeviceType,
  TrafficSource,
  TrackPayload,
} from "@/lib/analytics/types";

const VISITOR_KEY = "3fstore-analytics-visitor-id";
const SESSION_KEY = "3fstore-analytics-session";
const SESSION_TTL = 30 * 60 * 1000;

type SessionRecord = {
  id: string;
  lastSeen: number;
};

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function getOrCreateVisitorId() {
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing) {
    return existing;
  }

  const visitorId = createId("visitor");
  localStorage.setItem(VISITOR_KEY, visitorId);
  return visitorId;
}

function getOrCreateSessionId() {
  const now = Date.now();

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const existing = raw ? (JSON.parse(raw) as SessionRecord) : null;

    if (existing && now - existing.lastSeen < SESSION_TTL) {
      const next = { ...existing, lastSeen: now };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      return existing.id;
    }
  } catch {
    // Fall through and create a new session.
  }

  const session = {
    id: createId("session"),
    lastSeen: now,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session.id;
}

export function getDeviceType(width = window.innerWidth): DeviceType {
  if (width < 768) {
    return "mobile";
  }

  if (width < 1024) {
    return "tablet";
  }

  return "desktop";
}

function normalizeSource(value: string | null): TrafficSource | null {
  if (!value) {
    return null;
  }

  const source = value.toLowerCase();

  if (source.includes("facebook") || source === "fb") {
    return "facebook";
  }

  if (source.includes("google")) {
    return "google";
  }

  if (source.includes("tiktok")) {
    return "tiktok";
  }

  if (source.includes("shopee")) {
    return "shopee";
  }

  if (source.includes("zalo")) {
    return "zalo";
  }

  if (source.includes("email")) {
    return "email";
  }

  if (source.includes("organic")) {
    return "organic";
  }

  return "direct";
}

function getTrafficSource(): TrafficSource {
  const params = new URLSearchParams(window.location.search);
  const utmSource = normalizeSource(params.get("utm_source"));
  if (utmSource) {
    return utmSource;
  }

  const referrer = document.referrer.toLowerCase();
  if (!referrer) {
    return "direct";
  }

  if (referrer.includes("facebook")) {
    return "facebook";
  }

  if (referrer.includes("google")) {
    return "google";
  }

  if (referrer.includes("tiktok")) {
    return "tiktok";
  }

  if (referrer.includes("shopee")) {
    return "shopee";
  }

  if (referrer.includes("zalo")) {
    return "zalo";
  }

  return "organic";
}

export function getAnalyticsContext() {
  const params = new URLSearchParams(window.location.search);

  return {
    sessionId: getOrCreateSessionId(),
    visitorId: getOrCreateVisitorId(),
    route: window.location.pathname,
    device: getDeviceType(),
    source: getTrafficSource(),
    campaign: params.get("utm_campaign") ?? undefined,
  };
}

export function trackAnalyticsEvent(
  name: AnalyticsEventName,
  payload: TrackPayload = {},
): AnalyticsEvent | null {
  if (typeof window === "undefined") {
    return null;
  }

  const context = getAnalyticsContext();
  const event: AnalyticsEvent = {
    eventId: createId("event"),
    name,
    timestamp: new Date().toISOString(),
    ...context,
    ...payload,
  };

  appendLiveAnalyticsEvent(event);
  return event;
}

export function readTrackAttributes(element: Element | null) {
  const trackedElement = element?.closest<HTMLElement>("[data-track-id]");
  const trackedSection = element?.closest<HTMLElement>("[data-track-section]");

  return {
    elementId: trackedElement?.dataset.trackId,
    sectionId: trackedSection?.dataset.trackSection,
    category: trackedElement?.dataset.trackCategory,
    productId: trackedElement?.dataset.trackProductId,
    productName: trackedElement?.dataset.trackProductName,
    brand: trackedElement?.dataset.trackBrand,
    price: trackedElement?.dataset.trackPrice
      ? Number(trackedElement.dataset.trackPrice)
      : undefined,
  };
}
