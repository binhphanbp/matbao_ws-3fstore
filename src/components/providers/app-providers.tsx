"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { HeatmapRecorder } from "@/lib/analytics/heatmap-recorder";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <HeatmapRecorder />
      {children}
    </ThemeProvider>
  );
}
