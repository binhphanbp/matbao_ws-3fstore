import type { Metadata } from "next";

import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export const metadata: Metadata = {
  title: "Heatmaps - 3FStore Analytics",
  description: "Heatmap overlay dashboard demo for 3FStore.",
};

export default function AdminHeatmapsPage() {
  return <AnalyticsDashboard initialTab="heatmaps" />;
}
