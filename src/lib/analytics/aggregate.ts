import type {
  AnalyticsEvent,
  AnalyticsFilters,
  CategoryInsight,
  DashboardData,
  DateRangeKey,
  FunnelPoint,
  HeatmapPoint,
  HotElement,
  KpiMetric,
  SourceInsight,
  TrafficSource,
  TrendPoint,
} from "@/lib/analytics/types";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function dateKey(timestamp: string) {
  return timestamp.slice(0, 10);
}

function cutoffForRange(range: DateRangeKey) {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 60;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days + 1);
  return cutoff.getTime();
}

function uniqueCount(values: Iterable<string | undefined>) {
  return new Set(Array.from(values).filter(Boolean) as string[]).size;
}

function formatCurrency(value: number) {
  return `${currencyFormatter.format(value)}đ`;
}

function rate(numerator: number, denominator: number) {
  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

function formatRate(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}

export function filterAnalyticsEvents(
  events: AnalyticsEvent[],
  filters: AnalyticsFilters,
) {
  const cutoff = cutoffForRange(filters.range);

  return events.filter((event) => {
    if (new Date(event.timestamp).getTime() < cutoff) return false;
    if (filters.device !== "all" && event.device !== filters.device)
      return false;
    if (filters.source !== "all" && event.source !== filters.source)
      return false;
    if (filters.category !== "all" && event.category !== filters.category)
      return false;
    if (filters.section !== "all" && event.sectionId !== filters.section)
      return false;
    return true;
  });
}

function sessionsWith(
  events: AnalyticsEvent[],
  eventNames: AnalyticsEvent["name"][],
) {
  return new Set(
    events
      .filter((event) => eventNames.includes(event.name))
      .map((event) => event.sessionId),
  );
}

function buildKpis(events: AnalyticsEvent[]): KpiMetric[] {
  const sessions = uniqueCount(events.map((event) => event.sessionId));
  const visitors = uniqueCount(events.map((event) => event.visitorId));
  const addSessions = sessionsWith(events, [
    "add_to_cart",
    "bundle_add_to_cart",
  ]);
  const checkoutSessions = sessionsWith(events, ["checkout_intent"]);
  const revenue = events
    .filter((event) => event.name === "checkout_intent")
    .reduce((total, event) => total + (event.cartValue ?? 0), 0);
  const aov = checkoutSessions.size > 0 ? revenue / checkoutSessions.size : 0;
  const visitorSessions = new Map<string, Set<string>>();
  events.forEach((event) => {
    if (!visitorSessions.has(event.visitorId)) {
      visitorSessions.set(event.visitorId, new Set());
    }

    visitorSessions.get(event.visitorId)?.add(event.sessionId);
  });
  const returningVisitors = Array.from(visitorSessions.values()).filter(
    (sessionSet) => sessionSet.size > 1,
  ).length;

  return [
    {
      label: "Sessions",
      value: sessions.toLocaleString("vi-VN"),
      delta: "+12.4%",
      tone: "good",
    },
    {
      label: "Doanh thu ước tính",
      value: formatCurrency(revenue),
      delta: "+18.7%",
      tone: "good",
    },
    {
      label: "Add-to-cart rate",
      value: formatRate(rate(addSessions.size, sessions)),
      delta: "+4.2%",
      tone: "good",
    },
    {
      label: "Checkout intent",
      value: formatRate(rate(checkoutSessions.size, sessions)),
      delta: "-1.1%",
      tone: "warning",
    },
    {
      label: "AOV",
      value: formatCurrency(aov),
      delta: "+9.8%",
      tone: "good",
    },
    {
      label: "Returning visitors",
      value: formatRate(rate(returningVisitors, visitors)),
      delta: "+2.9%",
      tone: "neutral",
    },
  ];
}

function buildTrend(events: AnalyticsEvent[]): TrendPoint[] {
  const byDate = new Map<string, AnalyticsEvent[]>();

  events.forEach((event) => {
    const key = dateKey(event.timestamp);
    byDate.set(key, [...(byDate.get(key) ?? []), event]);
  });

  return Array.from(byDate.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, dayEvents]) => ({
      date: date.slice(5),
      sessions: uniqueCount(dayEvents.map((event) => event.sessionId)),
      revenue: dayEvents
        .filter((event) => event.name === "checkout_intent")
        .reduce((total, event) => total + (event.cartValue ?? 0), 0),
      addToCart: sessionsWith(dayEvents, ["add_to_cart", "bundle_add_to_cart"])
        .size,
      checkout: sessionsWith(dayEvents, ["checkout_intent"]).size,
    }));
}

function buildFunnel(events: AnalyticsEvent[]): FunnelPoint[] {
  const pageViews = sessionsWith(events, ["page_view"]);
  const sectionViews = sessionsWith(events, ["section_view"]);
  const productClicks = sessionsWith(events, ["product_click"]);
  const carts = sessionsWith(events, ["add_to_cart", "bundle_add_to_cart"]);
  const checkout = sessionsWith(events, ["checkout_intent"]);
  const base = Math.max(pageViews.size, 1);

  return [
    { step: "Page view", sessions: pageViews.size, rate: 1 },
    {
      step: "Section view",
      sessions: sectionViews.size,
      rate: rate(sectionViews.size, base),
    },
    {
      step: "Product click",
      sessions: productClicks.size,
      rate: rate(productClicks.size, base),
    },
    { step: "Add to cart", sessions: carts.size, rate: rate(carts.size, base) },
    {
      step: "Checkout intent",
      sessions: checkout.size,
      rate: rate(checkout.size, base),
    },
  ];
}

function buildCategoryInsights(events: AnalyticsEvent[]): CategoryInsight[] {
  const categories = new Map<string, AnalyticsEvent[]>();

  events.forEach((event) => {
    if (!event.category) return;
    categories.set(event.category, [
      ...(categories.get(event.category) ?? []),
      event,
    ]);
  });

  return Array.from(categories.entries())
    .map(([category, categoryEvents]) => {
      const impressions = categoryEvents.filter(
        (event) => event.name === "product_impression",
      ).length;
      const clicks = categoryEvents.filter(
        (event) => event.name === "product_click",
      ).length;
      const carts = categoryEvents.filter((event) =>
        ["add_to_cart", "bundle_add_to_cart"].includes(event.name),
      ).length;
      const revenue = categoryEvents
        .filter((event) => event.name === "checkout_intent")
        .reduce((total, event) => total + (event.cartValue ?? 0), 0);

      return {
        category,
        impressions,
        clicks,
        carts,
        revenue,
        conversionRate: rate(carts, Math.max(clicks, impressions, 1)),
      };
    })
    .sort(
      (left, right) =>
        right.revenue +
        right.carts * 10000 -
        (left.revenue + left.carts * 10000),
    )
    .slice(0, 8);
}

function buildSourceInsights(events: AnalyticsEvent[]): SourceInsight[] {
  const sources = new Map<TrafficSource, AnalyticsEvent[]>();

  events.forEach((event) => {
    sources.set(event.source, [...(sources.get(event.source) ?? []), event]);
  });

  return Array.from(sources.entries()).map(([source, sourceEvents]) => {
    const sessions = uniqueCount(sourceEvents.map((event) => event.sessionId));
    const carts = sessionsWith(sourceEvents, [
      "add_to_cart",
      "bundle_add_to_cart",
    ]).size;
    const revenue = sourceEvents
      .filter((event) => event.name === "checkout_intent")
      .reduce((total, event) => total + (event.cartValue ?? 0), 0);

    return {
      source,
      sessions,
      carts,
      revenue,
      conversionRate: rate(carts, sessions),
    };
  });
}

function heatmapEventNamesForMode(mode: AnalyticsFilters["heatmapMode"]) {
  if (mode === "click")
    return ["heat_click", "heat_tap", "product_click", "add_to_cart"];
  if (mode === "scroll") return ["heat_scroll_depth"];
  if (mode === "attention") return ["heat_attention_tick"];
  if (mode === "pointer") return ["heat_pointer_sample"];
  if (mode === "dead") return ["heat_dead_click"];
  if (mode === "rage") return ["heat_rage_click"];
  return ["heat_element_exposure", "section_view"];
}

function buildHeatmapPoints(
  events: AnalyticsEvent[],
  mode: AnalyticsFilters["heatmapMode"],
): HeatmapPoint[] {
  const names = heatmapEventNamesForMode(mode);

  return events
    .filter((event) => names.includes(event.name))
    .filter((event) => typeof event.pageYPct === "number" || event.sectionId)
    .slice(-1600)
    .map((event, index) => ({
      id: `${event.eventId}-${index}`,
      xPct: event.xPct ?? 50,
      yPct: event.yPct ?? 50,
      pageYPct: event.pageYPct ?? 50,
      intensity:
        event.name === "heat_rage_click"
          ? 1
          : event.name === "heat_dead_click"
            ? 0.86
            : event.name === "heat_attention_tick"
              ? 0.62
              : 0.72,
      sectionId: event.sectionId,
      elementId: event.elementId,
      label: event.productName ?? event.elementId ?? event.sectionId,
      eventName: event.name,
      device: event.device,
      source: event.source,
      category: event.category,
    }));
}

function buildHotElements(events: AnalyticsEvent[]): HotElement[] {
  const elementMap = new Map<string, AnalyticsEvent[]>();

  events.forEach((event) => {
    if (!event.elementId) return;
    elementMap.set(event.elementId, [
      ...(elementMap.get(event.elementId) ?? []),
      event,
    ]);
  });

  return Array.from(elementMap.entries())
    .map(([elementId, elementEvents]) => {
      const clicks = elementEvents.filter((event) =>
        ["heat_click", "heat_tap", "product_click"].includes(event.name),
      ).length;
      const exposures = elementEvents.filter((event) =>
        [
          "heat_element_exposure",
          "product_impression",
          "section_view",
        ].includes(event.name),
      ).length;
      const carts = elementEvents.filter((event) =>
        ["add_to_cart", "bundle_add_to_cart"].includes(event.name),
      ).length;
      const revenue = elementEvents
        .filter((event) => event.name === "checkout_intent")
        .reduce((total, event) => total + (event.cartValue ?? 0), 0);

      return {
        elementId,
        sectionId:
          elementEvents.find((event) => event.sectionId)?.sectionId ??
          "unknown",
        clicks,
        exposures,
        carts,
        revenue,
        ctr: exposures > 0 ? rate(clicks, exposures) : 0,
      };
    })
    .filter((element) => element.clicks + element.exposures + element.carts > 0)
    .sort(
      (left, right) =>
        right.clicks + right.carts * 4 - (left.clicks + left.carts * 4),
    )
    .slice(0, 12);
}

function buildInsights(
  categories: CategoryInsight[],
  sources: SourceInsight[],
  hotElements: HotElement[],
  events: AnalyticsEvent[],
) {
  const insights: string[] = [];
  const topCategory = categories[0];
  const highAttentionLowCart = categories.find(
    (category) => category.clicks > 80 && category.conversionRate < 0.16,
  );
  const topSource = [...sources].sort(
    (left, right) => right.conversionRate - left.conversionRate,
  )[0];
  const deadClicks = events.filter((event) => event.name === "heat_dead_click");
  const mobileScrollDrop = events.filter(
    (event) =>
      event.name === "heat_scroll_depth" &&
      event.device === "mobile" &&
      (event.pageYPct ?? 0) < 58,
  ).length;

  if (topCategory) {
    insights.push(
      `${topCategory.category} đang dẫn đầu về tín hiệu doanh thu với ${formatCurrency(
        topCategory.revenue,
      )} và ${topCategory.carts.toLocaleString("vi-VN")} lượt thêm giỏ.`,
    );
  }

  if (highAttentionLowCart) {
    insights.push(
      `${highAttentionLowCart.category} có nhiều click nhưng conversion thấp (${formatRate(
        highAttentionLowCart.conversionRate,
      )}); nên thử bundle, voucher hoặc social proof gần CTA.`,
    );
  }

  if (topSource) {
    insights.push(
      `Nguồn ${topSource.source} có tỷ lệ add-to-cart tốt nhất (${formatRate(
        topSource.conversionRate,
      )}); nên ưu tiên campaign cho nhóm sản phẩm đang có heat cao.`,
    );
  }

  if (deadClicks.length > 0) {
    const topDeadElement =
      hotElements.find((element) => element.elementId.includes("empty")) ??
      hotElements[0];
    insights.push(
      `Có ${deadClicks.length.toLocaleString(
        "vi-VN",
      )} dead clicks; vùng ${topDeadElement?.elementId ?? "bundle"} nên được biến thành CTA hoặc link sản phẩm.`,
    );
  }

  if (mobileScrollDrop > 40) {
    insights.push(
      "Mobile có dấu hiệu rơi trước các section review/dịch vụ; nên đưa bằng chứng xã hội hoặc CTA dịch vụ lên gần bundle hơn.",
    );
  }

  insights.push(
    "Bundle 5 món nên là gói mặc định khi demo tư vấn vì vừa có click density cao vừa giúp tăng AOV.",
  );

  return insights;
}

export function buildDashboardData(
  events: AnalyticsEvent[],
  filters: AnalyticsFilters,
): DashboardData {
  const filteredEvents = filterAnalyticsEvents(events, filters);
  const categories = buildCategoryInsights(filteredEvents);
  const sources = buildSourceInsights(filteredEvents);
  const hotElements = buildHotElements(filteredEvents);

  return {
    kpis: buildKpis(filteredEvents),
    trend: buildTrend(filteredEvents),
    funnel: buildFunnel(filteredEvents),
    categories,
    sources,
    heatmapPoints: buildHeatmapPoints(filteredEvents, filters.heatmapMode),
    hotElements,
    insights: buildInsights(categories, sources, hotElements, filteredEvents),
    filteredEvents,
  };
}

export function exportEventsAsCsv(events: AnalyticsEvent[]) {
  const headers = [
    "timestamp",
    "name",
    "sessionId",
    "visitorId",
    "device",
    "source",
    "campaign",
    "sectionId",
    "elementId",
    "productId",
    "category",
    "brand",
    "price",
    "cartValue",
    "xPct",
    "pageYPct",
  ];

  return [
    headers.join(","),
    ...events.map((event) =>
      headers
        .map((header) => {
          const value = event[header as keyof AnalyticsEvent];
          return `"${String(value ?? "").replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ].join("\n");
}
