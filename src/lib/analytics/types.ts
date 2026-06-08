import type { ProductAudience } from "@/types/product";

export type AnalyticsEventName =
  | "page_view"
  | "section_view"
  | "product_impression"
  | "product_click"
  | "product_list_view"
  | "product_filter_used"
  | "product_search"
  | "product_detail_view"
  | "variant_selected"
  | "buy_now"
  | "search_performed"
  | "filter_used"
  | "add_to_cart"
  | "remove_from_cart"
  | "bundle_selected"
  | "bundle_add_to_cart"
  | "service_interest"
  | "checkout_intent"
  | "heat_click"
  | "heat_tap"
  | "heat_scroll_depth"
  | "heat_attention_tick"
  | "heat_pointer_sample"
  | "heat_dead_click"
  | "heat_rage_click"
  | "heat_element_exposure";

export type DeviceType = "desktop" | "tablet" | "mobile";

export type TrafficSource =
  | "direct"
  | "facebook"
  | "google"
  | "tiktok"
  | "shopee"
  | "zalo"
  | "email"
  | "organic";

export type HeatmapMode =
  | "click"
  | "scroll"
  | "attention"
  | "pointer"
  | "dead"
  | "rage"
  | "element";

export type DateRangeKey = "7d" | "30d" | "60d";

export type AnalyticsMetadata = Record<
  string,
  string | number | boolean | null | undefined
>;

export type AnalyticsEvent = {
  eventId: string;
  name: AnalyticsEventName;
  timestamp: string;
  sessionId: string;
  visitorId: string;
  route: string;
  device: DeviceType;
  source: TrafficSource;
  campaign?: string;
  sectionId?: string;
  elementId?: string;
  productId?: string;
  productName?: string;
  category?: string;
  brand?: string;
  audience?: ProductAudience;
  price?: number;
  quantity?: number;
  cartValue?: number;
  xPct?: number;
  yPct?: number;
  pageYPct?: number;
  sectionXPct?: number;
  sectionYPct?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  scrollY?: number;
  pageHeight?: number;
  metadata?: AnalyticsMetadata;
};

export type TrackPayload = Partial<
  Omit<
    AnalyticsEvent,
    | "eventId"
    | "name"
    | "timestamp"
    | "sessionId"
    | "visitorId"
    | "route"
    | "device"
    | "source"
  >
>;

export type AnalyticsFilters = {
  range: DateRangeKey;
  device: "all" | DeviceType;
  source: "all" | TrafficSource;
  category: "all" | string;
  section: "all" | string;
  heatmapMode: HeatmapMode;
};

export type KpiMetric = {
  label: string;
  value: string;
  delta: string;
  tone: "good" | "neutral" | "warning";
};

export type TrendPoint = {
  date: string;
  sessions: number;
  revenue: number;
  addToCart: number;
  checkout: number;
};

export type FunnelPoint = {
  step: string;
  sessions: number;
  rate: number;
};

export type CategoryInsight = {
  category: string;
  impressions: number;
  clicks: number;
  carts: number;
  revenue: number;
  conversionRate: number;
};

export type SourceInsight = {
  source: TrafficSource;
  sessions: number;
  carts: number;
  revenue: number;
  conversionRate: number;
};

export type HeatmapPoint = {
  id: string;
  xPct: number;
  yPct: number;
  pageYPct: number;
  intensity: number;
  sectionId?: string;
  elementId?: string;
  label?: string;
  eventName: AnalyticsEventName;
  device: DeviceType;
  source: TrafficSource;
  category?: string;
};

export type HotElement = {
  elementId: string;
  sectionId: string;
  clicks: number;
  exposures: number;
  carts: number;
  revenue: number;
  ctr: number;
};

export type DashboardData = {
  kpis: KpiMetric[];
  trend: TrendPoint[];
  funnel: FunnelPoint[];
  categories: CategoryInsight[];
  sources: SourceInsight[];
  heatmapPoints: HeatmapPoint[];
  hotElements: HotElement[];
  insights: string[];
  filteredEvents: AnalyticsEvent[];
};

export const defaultAnalyticsFilters: AnalyticsFilters = {
  range: "60d",
  device: "all",
  source: "all",
  category: "all",
  section: "all",
  heatmapMode: "click",
};

export const trackedSections = [
  { id: "hero", label: "Hero" },
  { id: "bundle", label: "Bundle & Save" },
  { id: "snacks", label: "Snack hot" },
  { id: "care-journey", label: "Care journey" },
  { id: "services", label: "Dịch vụ" },
  { id: "proof", label: "Community proof" },
] as const;
