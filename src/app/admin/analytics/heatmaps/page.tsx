import type { Metadata } from "next";

import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export const metadata: Metadata = {
  title: "Bản đồ nhiệt 3FStore",
  description: "Báo cáo demo bản đồ nhiệt và hành vi khách hàng 3FStore.",
};

export default function AdminHeatmapsPage() {
  return <AnalyticsDashboard initialTab="heatmaps" />;
}
