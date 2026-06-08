import { storeProducts } from "@/data/products";
import type {
  AnalyticsEvent,
  AnalyticsEventName,
  DeviceType,
  TrafficSource,
} from "@/lib/analytics/types";
import type { StoreProduct } from "@/types/product";

const sections = [
  "hero",
  "bundle",
  "snacks",
  "care-journey",
  "services",
  "proof",
];

const sectionCenters: Record<string, { x: number; y: number }> = {
  hero: { x: 54, y: 12 },
  bundle: { x: 61, y: 31 },
  snacks: { x: 58, y: 47 },
  "care-journey": { x: 48, y: 63 },
  services: { x: 52, y: 78 },
  proof: { x: 55, y: 90 },
};

function hashString(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return hash >>> 0;
}

function seededRandom(seed: string) {
  let state = hashString(seed);

  return () => {
    state += 0x6d2b79f5;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function choose<T>(items: T[], random: () => number) {
  return items[Math.floor(random() * items.length)] ?? items[0];
}

function weightedSource(random: () => number): TrafficSource {
  const roll = random();

  if (roll < 0.25) return "facebook";
  if (roll < 0.42) return "google";
  if (roll < 0.56) return "tiktok";
  if (roll < 0.69) return "shopee";
  if (roll < 0.8) return "zalo";
  if (roll < 0.91) return "direct";
  return "organic";
}

function weightedDevice(random: () => number): DeviceType {
  const roll = random();

  if (roll < 0.68) return "mobile";
  if (roll < 0.82) return "tablet";
  return "desktop";
}

function campaignFor(source: TrafficSource, category: string) {
  if (source === "facebook")
    return category.includes("Pate") ? "cat_combo" : "bundle_boost";
  if (source === "tiktok") return "snack_weekend";
  if (source === "google") return "search_intent";
  if (source === "shopee") return "marketplace_retarget";
  return undefined;
}

function randomAround(value: number, spread: number, random: () => number) {
  return Math.max(0, Math.min(100, value + (random() - 0.5) * spread));
}

function eventFactory(base: Omit<AnalyticsEvent, "eventId" | "name">) {
  return (
    name: AnalyticsEventName,
    extra: Partial<AnalyticsEvent> = {},
  ): AnalyticsEvent => ({
    ...base,
    eventId: `seed_${base.sessionId}_${name}_${hashString(
      `${name}:${base.timestamp}:${JSON.stringify(extra)}`,
    )}`,
    name,
    ...extra,
  });
}

function pickProductByCategory(category: string, random: () => number) {
  const products = storeProducts.filter(
    (product) => product.category === category && product.image,
  );

  return choose(
    products.length > 0 ? products : storeProducts,
    random,
  ) as StoreProduct;
}

function heatPayload(sectionId: string, random: () => number) {
  const center = sectionCenters[sectionId] ?? sectionCenters.hero;
  return {
    sectionId,
    elementId: `${sectionId}:primary`,
    xPct: Number(randomAround(center.x, 18, random).toFixed(2)),
    yPct: Number(randomAround(50, 34, random).toFixed(2)),
    pageYPct: Number(randomAround(center.y, 8, random).toFixed(2)),
    sectionXPct: Number(randomAround(50, 42, random).toFixed(2)),
    sectionYPct: Number(randomAround(50, 48, random).toFixed(2)),
    viewportWidth: 390,
    viewportHeight: 844,
    pageHeight: 5200,
  };
}

export function getSeedAnalyticsEvents(days = 60): AnalyticsEvent[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const events: AnalyticsEvent[] = [];
  const categories = Array.from(
    new Set(storeProducts.map((product) => product.category)),
  );

  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - dayOffset);

    const random = seededRandom(`3fstore-${day.toISOString().slice(0, 10)}`);
    const isWeekend = [0, 6].includes(day.getDay());
    const sessions = Math.round((isWeekend ? 42 : 30) + random() * 16);

    for (let index = 0; index < sessions; index += 1) {
      const sessionRandom = seededRandom(`${day.toISOString()}-${index}`);
      const hour = Math.floor(8 + sessionRandom() * 15);
      const minute = Math.floor(sessionRandom() * 60);
      const timestamp = new Date(day);
      timestamp.setHours(hour, minute, Math.floor(sessionRandom() * 60), 0);

      const source = weightedSource(sessionRandom);
      const device = weightedDevice(sessionRandom);
      const category =
        source === "tiktok"
          ? "Snack & bánh thưởng"
          : source === "google"
            ? choose(
                ["Cát vệ sinh", "Pate & thức ăn ướt", "Hạt & thức ăn khô"],
                sessionRandom,
              )
            : choose(categories, sessionRandom);
      const product = pickProductByCategory(category, sessionRandom);
      const sessionId = `seed_session_${dayOffset}_${index}`;
      const visitorId = `seed_visitor_${Math.floor(index * 0.62)}_${Math.floor(
        sessionRandom() * 180,
      )}`;
      const base = {
        timestamp: timestamp.toISOString(),
        sessionId,
        visitorId,
        route: "/",
        device,
        source,
        campaign: campaignFor(source, category),
      };
      const makeEvent = eventFactory(base);

      events.push(
        makeEvent("page_view", { sectionId: "page", elementId: "page" }),
      );

      const reachedSections = sections.filter((_, sectionIndex) => {
        const dropOff =
          device === "mobile" ? sectionIndex * 0.11 : sectionIndex * 0.07;
        return sessionRandom() > dropOff;
      });

      reachedSections.forEach((sectionId) => {
        events.push(
          makeEvent("section_view", {
            sectionId,
            elementId: `${sectionId}:section`,
          }),
        );
        events.push(
          makeEvent("heat_element_exposure", {
            ...heatPayload(sectionId, sessionRandom),
            elementId: `${sectionId}:section`,
          }),
        );
      });

      const productClickChance =
        category === "Snack & bánh thưởng" && isWeekend ? 0.48 : 0.36;
      const clickedProduct = sessionRandom() < productClickChance;
      const addToCartChance =
        category === "Cát vệ sinh" || category === "Pate & thức ăn ướt"
          ? 0.34
          : 0.22;
      const addedToCart = clickedProduct && sessionRandom() < addToCartChance;
      const bundleSelected =
        reachedSections.includes("bundle") && sessionRandom() < 0.3;
      const checkoutIntent = addedToCart && sessionRandom() < 0.46;
      const quantity = Math.max(1, Math.ceil(sessionRandom() * 2));
      const cartValue = Math.round(
        product.price * quantity + (bundleSelected ? 505000 : 0),
      );

      events.push(
        makeEvent("product_impression", {
          sectionId: category === "Snack & bánh thưởng" ? "snacks" : "bundle",
          elementId: `product:${product.id}`,
          productId: product.id,
          productName: product.shortName,
          category: product.category,
          brand: product.brand,
          audience: product.audience,
          price: product.price,
        }),
      );

      if (clickedProduct) {
        events.push(
          makeEvent("product_click", {
            ...heatPayload(
              category === "Snack & bánh thưởng" ? "snacks" : "bundle",
              sessionRandom,
            ),
            elementId: `product:${product.id}`,
            productId: product.id,
            productName: product.shortName,
            category: product.category,
            brand: product.brand,
            audience: product.audience,
            price: product.price,
          }),
        );
      }

      if (bundleSelected) {
        events.push(
          makeEvent("bundle_selected", {
            ...heatPayload("bundle", sessionRandom),
            sectionId: "bundle",
            elementId: "bundle:5-items",
            category: "Combo 3FStore",
            price: 505000,
            cartValue: 505000,
          }),
        );
      }

      if (addedToCart) {
        events.push(
          makeEvent("add_to_cart", {
            sectionId: category === "Snack & bánh thưởng" ? "snacks" : "bundle",
            elementId: `add-to-cart:${product.id}`,
            productId: product.id,
            productName: product.shortName,
            category: product.category,
            brand: product.brand,
            audience: product.audience,
            price: product.price,
            quantity,
            cartValue,
          }),
        );
      }

      if (bundleSelected && sessionRandom() < 0.52) {
        events.push(
          makeEvent("bundle_add_to_cart", {
            sectionId: "bundle",
            elementId: "bundle:add-to-cart",
            category: "Combo 3FStore",
            price: 505000,
            cartValue,
          }),
        );
      }

      if (checkoutIntent) {
        events.push(
          makeEvent("checkout_intent", {
            sectionId: "cart",
            elementId: "checkout:intent",
            category: product.category,
            cartValue,
          }),
        );
      }

      if (sessionRandom() < 0.16) {
        events.push(
          makeEvent("search_performed", {
            sectionId: "hero",
            elementId: "hero:search",
            category,
            metadata: {
              query:
                category === "Cát vệ sinh"
                  ? "cat dau nanh"
                  : category === "Snack & bánh thưởng"
                    ? "snack meo"
                    : "pate meo",
            },
          }),
        );
      }

      if (reachedSections.includes("services") && sessionRandom() < 0.14) {
        events.push(
          makeEvent("service_interest", {
            ...heatPayload("services", sessionRandom),
            elementId: "services:spa",
            category: "Dịch vụ",
          }),
        );
      }

      reachedSections.forEach((sectionId) => {
        const heatCount = sectionId === "bundle" ? 2 : 1;
        for (let heatIndex = 0; heatIndex < heatCount; heatIndex += 1) {
          events.push(
            makeEvent(
              sessionRandom() < 0.85 ? "heat_click" : "heat_pointer_sample",
              {
                ...heatPayload(sectionId, sessionRandom),
                category,
              },
            ),
          );
        }
      });

      const scrollDepth = Math.min(
        96,
        Math.max(18, reachedSections.length * 15 + sessionRandom() * 14),
      );
      events.push(
        makeEvent("heat_scroll_depth", {
          sectionId: reachedSections.at(-1) ?? "hero",
          elementId: "page:scroll-depth",
          xPct: 50,
          yPct: 50,
          pageYPct: Number(scrollDepth.toFixed(2)),
          viewportWidth: device === "mobile" ? 390 : 1440,
          viewportHeight: device === "mobile" ? 844 : 900,
          pageHeight: 5200,
        }),
      );

      if (sessionRandom() < 0.08) {
        events.push(
          makeEvent("heat_dead_click", {
            ...heatPayload("bundle", sessionRandom),
            elementId: "bundle:empty-space",
            category,
          }),
        );
      }

      if (sessionRandom() < 0.035) {
        events.push(
          makeEvent("heat_rage_click", {
            ...heatPayload("hero", sessionRandom),
            elementId: "hero:search",
            category,
          }),
        );
      }
    }
  }

  return events;
}
