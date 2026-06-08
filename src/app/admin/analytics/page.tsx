import type { Metadata } from "next";

import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export const metadata: Metadata = {
  title: "3FStore Analytics",
  description: "Admin analytics dashboard demo for 3FStore.",
};

export default function AdminAnalyticsPage() {
  return <AnalyticsDashboard initialTab="overview" />;
}
