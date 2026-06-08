"use client";

import type { AnalyticsEvent } from "@/lib/analytics/types";

const LIVE_EVENTS_KEY = "3fstore-analytics-live-events";
const MAX_LIVE_EVENTS = 1400;

export const analyticsStoreEventName = "3fstore:analytics-event";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function readLiveAnalyticsEvents(): AnalyticsEvent[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(LIVE_EVENTS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as AnalyticsEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLiveAnalyticsEvents(events: AnalyticsEvent[]) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(
    LIVE_EVENTS_KEY,
    JSON.stringify(events.slice(-MAX_LIVE_EVENTS)),
  );
}

export function appendLiveAnalyticsEvent(event: AnalyticsEvent) {
  const events = readLiveAnalyticsEvents();
  writeLiveAnalyticsEvents([...events, event]);

  window.dispatchEvent(
    new CustomEvent(analyticsStoreEventName, {
      detail: event,
    }),
  );
}

export function clearLiveAnalyticsEvents() {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(LIVE_EVENTS_KEY);
  window.dispatchEvent(new CustomEvent(analyticsStoreEventName));
}
