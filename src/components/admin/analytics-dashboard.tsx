"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart3,
  Download,
  Eye,
  Filter,
  Flame,
  Lock,
  MousePointerClick,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import {
  analyticsStoreEventName,
  clearLiveAnalyticsEvents,
  readLiveAnalyticsEvents,
} from "@/lib/analytics/demo-store";
import {
  buildDashboardData,
  exportEventsAsCsv,
} from "@/lib/analytics/aggregate";
import { getSeedAnalyticsEvents } from "@/lib/analytics/seed";
import {
  defaultAnalyticsFilters,
  trackedSections,
  type AnalyticsEvent,
  type AnalyticsFilters,
  type DateRangeKey,
  type DeviceType,
  type HeatmapMode,
  type TrafficSource,
} from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

type DashboardTab = "overview" | "heatmaps" | "insights" | "exports";

type AnalyticsDashboardProps = {
  initialTab?: DashboardTab;
};

const passwordKey = "3fstore-admin-auth";
const demoPassword =
  process.env.NEXT_PUBLIC_ADMIN_DEMO_PASSWORD ?? "3fstore-demo";

const tabItems: Array<{ id: DashboardTab; label: string }> = [
  { id: "overview", label: "Tổng quan" },
  { id: "heatmaps", label: "Bản đồ nhiệt" },
  { id: "insights", label: "Insight" },
  { id: "exports", label: "Xuất dữ liệu" },
];

const deviceOptions: Array<"all" | DeviceType> = [
  "all",
  "desktop",
  "tablet",
  "mobile",
];
const sourceOptions: Array<"all" | TrafficSource> = [
  "all",
  "facebook",
  "google",
  "tiktok",
  "shopee",
  "zalo",
  "direct",
  "organic",
  "email",
];
const rangeOptions: DateRangeKey[] = ["7d", "30d", "60d"];
const heatmapModes: Array<{ value: HeatmapMode; label: string }> = [
  { value: "click", label: "Click/Tap" },
  { value: "scroll", label: "Độ sâu cuộn" },
  { value: "attention", label: "Thời gian chú ý" },
  { value: "pointer", label: "Mật độ rê chuột" },
  { value: "dead", label: "Click hụt" },
  { value: "rage", label: "Click liên tục" },
  { value: "element", label: "Theo phần tử" },
];

const pageMapSections = [
  { id: "hero", label: "Mở đầu", top: 0, height: 22 },
  { id: "bundle", label: "Combo", top: 22, height: 23 },
  { id: "snacks", label: "Món thưởng", top: 45, height: 18 },
  { id: "care-journey", label: "Chăm sóc", top: 63, height: 14 },
  { id: "services", label: "Dịch vụ", top: 77, height: 13 },
  { id: "proof", label: "Đánh giá", top: 90, height: 10 },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatRate(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}đ`;
}

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AnalyticsDashboard({
  initialTab = "overview",
}: AnalyticsDashboardProps) {
  const [isAuthed, setIsAuthed] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem(passwordKey) === "true",
  );
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = () => {
    if (password === demoPassword) {
      localStorage.setItem(passwordKey, "true");
      setIsAuthed(true);
      setPasswordError("");
      return;
    }

    setPasswordError("Mật khẩu demo chưa đúng.");
  };

  if (!isAuthed) {
    return (
      <main className="min-h-screen bg-[#f8fbfa] px-4 py-10 text-[#123d3f]">
        <section className="mx-auto flex min-h-[72vh] max-w-[520px] flex-col justify-center">
          <div className="rounded-[28px] border border-[#dce8e5] bg-white p-8 shadow-[0_26px_80px_rgba(13,64,66,0.08)]">
            <div className="mb-7 inline-grid size-14 place-items-center rounded-2xl bg-[#073f42] text-white">
              <Lock className="size-7" aria-hidden />
            </div>
            <h1 className="text-3xl font-black tracking-[-0.03em]">
              Báo cáo 3FStore
            </h1>
            <p className="mt-3 text-sm leading-6 font-semibold text-[#607b7a]">
              Báo cáo demo cho tracking, phễu, bản đồ nhiệt và insight ngành
              hàng thú cưng.
            </p>
            <div className="mt-8">
              <label
                className="mb-2 block text-sm font-black"
                htmlFor="admin-password"
              >
                Mật khẩu demo
              </label>
              <input
                id="admin-password"
                className="h-12 w-full rounded-xl border border-[#d7e4e1] bg-[#fbfffe] px-4 text-sm font-bold outline-none focus:border-[#ff6048]"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleLogin();
                  }
                }}
              />
              {passwordError ? (
                <p className="mt-2 text-sm font-bold text-[#ff4f3c]">
                  {passwordError}
                </p>
              ) : null}
              <button
                type="button"
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#ff4f3c] px-5 text-sm font-black text-white shadow-[0_18px_34px_rgba(255,79,60,0.22)]"
                onClick={handleLogin}
              >
                Vào dashboard
              </button>
              <p className="mt-4 text-xs font-semibold text-[#7b918f]">
                Demo password: 3fstore-demo
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return <AnalyticsDashboardContent initialTab={initialTab} />;
}

function AnalyticsDashboardContent({
  initialTab,
}: {
  initialTab: DashboardTab;
}) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    ...defaultAnalyticsFilters,
    heatmapMode:
      initialTab === "heatmaps" ? "click" : defaultAnalyticsFilters.heatmapMode,
  });
  const [liveEvents, setLiveEvents] = useState<AnalyticsEvent[]>(() =>
    typeof window !== "undefined" ? readLiveAnalyticsEvents() : [],
  );

  useEffect(() => {
    const handleLiveUpdate = () => setLiveEvents(readLiveAnalyticsEvents());
    window.addEventListener(analyticsStoreEventName, handleLiveUpdate);

    return () =>
      window.removeEventListener(analyticsStoreEventName, handleLiveUpdate);
  }, []);

  const seedEvents = useMemo(() => getSeedAnalyticsEvents(60), []);
  const allEvents = useMemo(
    () => [...seedEvents, ...liveEvents],
    [liveEvents, seedEvents],
  );
  const categories = useMemo(
    () =>
      Array.from(
        new Set(allEvents.map((event) => event.category).filter(Boolean)),
      )
        .sort()
        .slice(0, 28) as string[],
    [allEvents],
  );
  const data = useMemo(
    () => buildDashboardData(allEvents, filters),
    [allEvents, filters],
  );

  const updateFilter = <Key extends keyof AnalyticsFilters>(
    key: Key,
    value: AnalyticsFilters[Key],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const exportJson = () => {
    downloadText(
      `3fstore-analytics-${filters.range}.json`,
      JSON.stringify(data.filteredEvents, null, 2),
      "application/json",
    );
  };

  const exportCsv = () => {
    downloadText(
      `3fstore-analytics-${filters.range}.csv`,
      exportEventsAsCsv(data.filteredEvents),
      "text/csv;charset=utf-8",
    );
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8fbfa] px-4 py-6 text-[#123d3f] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1480px]">
        <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#e9f7f4] px-3 py-1 text-xs font-black text-[#0b696d]">
              <Activity className="size-4" aria-hidden />
              Live demo + 60 ngày seed data
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              Báo cáo 3FStore
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 font-semibold text-[#607b7a]">
              Theo dõi hành vi mua hàng, heatmaps và insight tối ưu doanh thu
              cho ngành hàng thú cưng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d8e5e2] bg-white px-4 text-xs font-black"
              onClick={() => {
                clearLiveAnalyticsEvents();
                setLiveEvents([]);
              }}
            >
              <RefreshCw className="size-4" aria-hidden />
              Clear live events
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#073f42] px-4 text-xs font-black text-white"
              onClick={exportJson}
            >
              <Download className="size-4" aria-hidden />
              Export JSON
            </button>
          </div>
        </header>

        <div className="mb-5 flex flex-col gap-3 rounded-[22px] border border-[#dce8e5] bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Tab báo cáo"
          >
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={activeTab === tab.id}
                className={cn(
                  "h-10 rounded-full px-4 text-sm font-black transition-colors",
                  activeTab === tab.id
                    ? "bg-[#ff4f3c] text-white"
                    : "bg-[#f2f7f6] text-[#315b5c]",
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <DashboardFilters
            categories={categories}
            filters={filters}
            onChange={updateFilter}
          />
        </div>

        {activeTab === "overview" ? <OverviewPanel data={data} /> : null}
        {activeTab === "heatmaps" ? (
          <HeatmapsPanel
            data={data}
            filters={filters}
            onChange={updateFilter}
          />
        ) : null}
        {activeTab === "insights" ? <InsightsPanel data={data} /> : null}
        {activeTab === "exports" ? (
          <ExportsPanel
            data={data}
            onExportCsv={exportCsv}
            onExportJson={exportJson}
          />
        ) : null}
      </div>
    </main>
  );
}

function DashboardFilters({
  categories,
  filters,
  onChange,
}: {
  categories: string[];
  filters: AnalyticsFilters;
  onChange: <Key extends keyof AnalyticsFilters>(
    key: Key,
    value: AnalyticsFilters[Key],
  ) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
      <SelectFilter
        id="range-filter"
        label="Range"
        value={filters.range}
        onChange={(value) => onChange("range", value as DateRangeKey)}
        options={rangeOptions.map((range) => ({ value: range, label: range }))}
      />
      <SelectFilter
        id="device-filter"
        label="Device"
        value={filters.device}
        onChange={(value) =>
          onChange("device", value as AnalyticsFilters["device"])
        }
        options={deviceOptions.map((device) => ({
          value: device,
          label: device,
        }))}
      />
      <SelectFilter
        id="source-filter"
        label="Source"
        value={filters.source}
        onChange={(value) =>
          onChange("source", value as AnalyticsFilters["source"])
        }
        options={sourceOptions.map((source) => ({
          value: source,
          label: source,
        }))}
      />
      <SelectFilter
        id="category-filter"
        label="Category"
        value={filters.category}
        onChange={(value) => onChange("category", value)}
        options={[
          { value: "all", label: "all" },
          ...categories.map((category) => ({
            value: category,
            label: category,
          })),
        ]}
      />
    </div>
  );
}

function SelectFilter({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className="grid gap-1 text-[11px] font-black text-[#607b7a]"
      htmlFor={id}
    >
      {label}
      <select
        id={id}
        className="h-10 min-w-0 rounded-xl border border-[#dce8e5] bg-[#fbfffe] px-3 text-xs font-black text-[#123d3f] outline-none focus:border-[#ff6048] md:min-w-32"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ChartFrame({
  height,
  children,
}: {
  height: number;
  children: (size: { width: number; height: number }) => ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const updateWidth = () => setWidth(Math.floor(frame.clientWidth));
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(frame);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className="mt-4 min-w-0" style={{ height }}>
      {width > 0 ? (
        children({ width, height })
      ) : (
        <div className="h-full rounded-2xl bg-[#f2f7f6]" />
      )}
    </div>
  );
}

function OverviewPanel({
  data,
}: {
  data: ReturnType<typeof buildDashboardData>;
}) {
  const categoryChartData = data.categories.map((category) => ({
    ...category,
    axisLabel: shortCategoryLabel(category.category),
  }));
  const sourceChartData = data.sources.map((source) => ({
    ...source,
    axisLabel: shortSourceLabel(source.source),
  }));

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {data.kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-[20px] border border-[#dce8e5] bg-white p-4"
          >
            <p className="text-xs font-black text-[#607b7a]">{kpi.label}</p>
            <p className="mt-3 text-2xl font-black tracking-[-0.03em] text-[#123d3f]">
              {kpi.value}
            </p>
            <p
              className={cn(
                "mt-2 text-xs font-black",
                kpi.tone === "warning" ? "text-[#ff4f3c]" : "text-[#0a9d80]",
              )}
            >
              {kpi.delta} vs kỳ trước
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-[24px] border border-[#dce8e5] bg-white p-5">
          <PanelTitle
            icon={TrendingUp}
            title="Doanh thu và sessions theo ngày"
          />
          <ChartFrame height={320}>
            {({ width, height }) => (
              <AreaChart width={width} height={height} data={data.trend}>
                <defs>
                  <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#ff4f3c" stopOpacity={0.34} />
                    <stop offset="95%" stopColor="#ff4f3c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e7efed" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatNumber(Number(value))} />
                <Area
                  dataKey="revenue"
                  fill="url(#revenue)"
                  name="Revenue"
                  stroke="#ff4f3c"
                  strokeWidth={3}
                />
                <Area
                  dataKey="sessions"
                  fill="transparent"
                  name="Sessions"
                  stroke="#0a7779"
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ChartFrame>
        </article>

        <article className="rounded-[24px] border border-[#dce8e5] bg-white p-5">
          <PanelTitle icon={Filter} title="Funnel mua hàng" />
          <div className="mt-5 space-y-4">
            {data.funnel.map((step) => (
              <div key={step.step}>
                <div className="flex items-center justify-between gap-4 text-sm font-black">
                  <span>{step.step}</span>
                  <span>{formatNumber(step.sessions)}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#eef6f4]">
                  <div
                    className="h-full rounded-full bg-[#ff4f3c]"
                    style={{ width: `${Math.max(6, step.rate * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs font-bold text-[#607b7a]">
                  {formatRate(step.rate)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <BarCard
          title="Category revenue"
          data={categoryChartData}
          dataKey="revenue"
          nameKey="axisLabel"
        />
        <BarCard
          title="Source sessions"
          data={sourceChartData}
          dataKey="sessions"
          nameKey="axisLabel"
        />
      </div>
    </section>
  );
}

function BarCard({
  title,
  data,
  dataKey,
  nameKey,
}: {
  title: string;
  data: Array<Record<string, string | number>>;
  dataKey: string;
  nameKey: string;
}) {
  return (
    <article className="rounded-[24px] border border-[#dce8e5] bg-white p-5">
      <PanelTitle icon={BarChart3} title={title} />
      <ChartFrame height={280}>
        {({ width, height }) => (
          <BarChart width={width} height={height} data={data.slice(0, 8)}>
            <CartesianGrid stroke="#e7efed" vertical={false} />
            <XAxis dataKey={nameKey} tick={{ fontSize: 10 }} interval={0} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => formatNumber(Number(value))} />
            <Bar dataKey={dataKey} fill="#0a7779" radius={[10, 10, 0, 0]} />
          </BarChart>
        )}
      </ChartFrame>
    </article>
  );
}

function shortCategoryLabel(value: string) {
  const labels: Record<string, string> = {
    "Phụ kiện": "Phụ kiện",
    "Snack & bánh thưởng": "Snack",
    "Hạt & thức ăn khô": "Hạt khô",
    "Cát vệ sinh": "Cát",
    "Pate & thức ăn ướt": "Pate ướt",
    "Chăm sóc & vệ sinh": "Chăm sóc",
    "Combo 3FStore": "Combo",
    "Dịch vụ": "Dịch vụ",
  };

  return labels[value] ?? value;
}

function shortSourceLabel(value: string) {
  const labels: Record<string, string> = {
    facebook: "Facebook",
    google: "Google",
    tiktok: "TikTok",
    shopee: "Shopee",
    zalo: "Zalo",
    direct: "Direct",
    organic: "Organic",
    email: "Email",
  };

  return labels[value] ?? value;
}

function HeatmapsPanel({
  data,
  filters,
  onChange,
}: {
  data: ReturnType<typeof buildDashboardData>;
  filters: AnalyticsFilters;
  onChange: <Key extends keyof AnalyticsFilters>(
    key: Key,
    value: AnalyticsFilters[Key],
  ) => void;
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <article className="rounded-[24px] border border-[#dce8e5] bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PanelTitle icon={MousePointerClick} title="Heatmap overlay" />
          <SelectFilter
            id="heatmap-mode-filter"
            label="Heatmap mode"
            value={filters.heatmapMode}
            onChange={(value) => onChange("heatmapMode", value as HeatmapMode)}
            options={heatmapModes}
          />
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[160px_1fr]">
          <div className="space-y-2">
            {trackedSections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-xs font-black",
                  filters.section === section.id
                    ? "bg-[#073f42] text-white"
                    : "bg-[#f2f7f6] text-[#315b5c]",
                )}
                onClick={() =>
                  onChange(
                    "section",
                    filters.section === section.id ? "all" : section.id,
                  )
                }
              >
                {section.label}
                <Eye className="size-4" aria-hidden />
              </button>
            ))}
          </div>
          <HeatmapOverlay data={data} />
        </div>
      </article>

      <aside className="grid gap-5">
        <article className="rounded-[24px] border border-[#dce8e5] bg-white p-5">
          <PanelTitle icon={Flame} title="Legend" />
          <div className="mt-4 h-4 rounded-full bg-[linear-gradient(90deg,#fff1ec,#ffb09e,#ff4f3c,#8a1d12)]" />
          <div className="mt-2 flex justify-between text-xs font-black text-[#607b7a]">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
          <p className="mt-4 text-sm leading-6 font-semibold text-[#607b7a]">
            Overlay dùng tọa độ phần trăm viewport/page để demo được trên nhiều
            kích thước màn hình mà không cần session replay.
          </p>
        </article>

        <article className="rounded-[24px] border border-[#dce8e5] bg-white p-5">
          <PanelTitle icon={MousePointerClick} title="Hot elements" />
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#e6efed]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f2f7f6] text-[#607b7a]">
                <tr>
                  <th className="px-3 py-2">Element</th>
                  <th className="px-3 py-2">Clicks</th>
                  <th className="px-3 py-2">CTR</th>
                  <th className="px-3 py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.hotElements.map((element) => (
                  <tr
                    key={element.elementId}
                    className="border-t border-[#e6efed]"
                  >
                    <td className="max-w-[170px] px-3 py-2 font-black">
                      {element.elementId}
                    </td>
                    <td className="px-3 py-2 font-bold">
                      {formatNumber(element.clicks)}
                    </td>
                    <td className="px-3 py-2 font-bold">
                      {formatRate(element.ctr)}
                    </td>
                    <td className="px-3 py-2 font-bold">
                      {formatCurrency(element.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </aside>
    </section>
  );
}

function HeatmapOverlay({
  data,
}: {
  data: ReturnType<typeof buildDashboardData>;
}) {
  return (
    <div
      data-testid="heatmap-overlay"
      role="img"
      aria-label="Heatmap overlay canvas"
      className="relative h-[720px] overflow-hidden rounded-[24px] border border-[#dce8e5] bg-[#fbfffe]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(9,84,86,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(9,84,86,0.055)_1px,transparent_1px)] bg-[size:28px_28px]" />
      {pageMapSections.map((section) => (
        <div
          key={section.id}
          className="absolute right-4 left-4 rounded-2xl border border-[#dce8e5] bg-white/55"
          style={{ top: `${section.top}%`, height: `${section.height}%` }}
        >
          <span className="absolute top-2 left-3 text-xs font-black text-[#607b7a]">
            {section.label}
          </span>
        </div>
      ))}
      {data.heatmapPoints.map((point) => {
        const size = 18 + point.intensity * 34;

        return (
          <span
            key={point.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-multiply blur-[1px]"
            title={point.label}
            style={{
              left: `${point.xPct}%`,
              top: `${point.pageYPct}%`,
              width: size,
              height: size,
              background:
                point.eventName === "heat_dead_click" ||
                point.eventName === "heat_rage_click"
                  ? `rgba(255, 79, 60, ${0.34 + point.intensity * 0.42})`
                  : `rgba(255, 185, 44, ${0.28 + point.intensity * 0.34})`,
              boxShadow: `0 0 ${size}px rgba(255, 79, 60, 0.3)`,
            }}
          />
        );
      })}
      <div className="absolute right-4 bottom-4 left-4 rounded-2xl bg-white/88 p-3 text-xs font-bold text-[#607b7a] shadow-[0_16px_40px_rgba(13,64,66,0.08)]">
        {formatNumber(data.heatmapPoints.length)} điểm heatmap đang hiển thị
        theo filter hiện tại.
      </div>
    </div>
  );
}

function InsightsPanel({
  data,
}: {
  data: ReturnType<typeof buildDashboardData>;
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-[24px] border border-[#dce8e5] bg-white p-5">
        <PanelTitle icon={Activity} title="Insight tự động" />
        <div className="mt-5 grid gap-3">
          {data.insights.map((insight) => (
            <div
              key={insight}
              className="rounded-2xl border border-[#e6efed] bg-[#fbfffe] p-4 text-sm leading-6 font-bold text-[#315b5c]"
            >
              {insight}
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-[24px] border border-[#dce8e5] bg-white p-5">
        <PanelTitle icon={BarChart3} title="Category diagnostics" />
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#e6efed]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f7f6] text-[#607b7a]">
              <tr>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Clicks</th>
                <th className="px-3 py-2">Carts</th>
                <th className="px-3 py-2">Conv.</th>
                <th className="px-3 py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.categories.map((category) => (
                <tr
                  key={category.category}
                  className="border-t border-[#e6efed]"
                >
                  <td className="px-3 py-2 font-black">{category.category}</td>
                  <td className="px-3 py-2 font-bold">
                    {formatNumber(category.clicks)}
                  </td>
                  <td className="px-3 py-2 font-bold">
                    {formatNumber(category.carts)}
                  </td>
                  <td className="px-3 py-2 font-bold">
                    {formatRate(category.conversionRate)}
                  </td>
                  <td className="px-3 py-2 font-bold">
                    {formatCurrency(category.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function ExportsPanel({
  data,
  onExportCsv,
  onExportJson,
}: {
  data: ReturnType<typeof buildDashboardData>;
  onExportCsv: () => void;
  onExportJson: () => void;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <article className="rounded-[24px] border border-[#dce8e5] bg-white p-5">
        <PanelTitle icon={Download} title="Xuất dữ liệu" />
        <p className="mt-3 text-sm leading-6 font-semibold text-[#607b7a]">
          Xuất raw events hoặc CSV để demo cho khách cách đội vận hành có thể
          phân tích sâu hơn bằng BI/Sheets.
        </p>
        <div className="mt-5 grid gap-3">
          <button
            type="button"
            className="h-12 rounded-xl bg-[#073f42] text-sm font-black text-white"
            onClick={onExportJson}
          >
            Export JSON
          </button>
          <button
            type="button"
            className="h-12 rounded-xl border border-[#dce8e5] bg-white text-sm font-black"
            onClick={onExportCsv}
          >
            Export CSV
          </button>
        </div>
      </article>

      <article className="min-w-0 rounded-[24px] border border-[#dce8e5] bg-white p-5">
        <PanelTitle icon={Activity} title="Event sample" />
        <pre className="mt-4 max-h-[560px] overflow-auto rounded-2xl bg-[#102f31] p-4 text-xs leading-5 text-[#d7fffa]">
          {JSON.stringify(data.filteredEvents.slice(0, 20), null, 2)}
        </pre>
      </article>
    </section>
  );
}

function PanelTitle({
  icon: Icon,
  title,
}: {
  icon: typeof Activity;
  title: string;
}) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-black tracking-[-0.02em]">
      <span className="grid size-9 place-items-center rounded-xl bg-[#e9f7f4] text-[#0a7779]">
        <Icon className="size-5" aria-hidden />
      </span>
      {title}
    </h2>
  );
}
