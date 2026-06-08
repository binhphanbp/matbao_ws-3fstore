import type { Metadata } from "next";

import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export const metadata: Metadata = {
  title: "Báo cáo 3FStore",
  description: "Báo cáo demo tracking, phễu, bản đồ nhiệt và insight 3FStore.",
};

export default function AdminAnalyticsPage() {
  return <AnalyticsDashboard initialTab="overview" />;
}
