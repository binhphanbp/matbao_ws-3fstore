import { expect, test } from "@playwright/test";

const liveEventsKey = "3fstore-analytics-live-events";

test("homepage records live analytics for search, click, and add to cart", async ({
  page,
}) => {
  await page.goto("/?skipIntro=1&utm_source=facebook&utm_campaign=cat_combo");

  await page.getByLabel("Tìm kiếm sản phẩm").fill("pate mèo");
  await page.getByLabel("Tìm kiếm sản phẩm").press("Enter");
  await page.getByRole("button", { name: /Tất cả bộ sưu tập/i }).click();

  const events = await page.evaluate((key) => {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as Array<{
      name: string;
      source?: string;
      campaign?: string;
      sectionId?: string;
    }>;
  }, liveEventsKey);

  expect(events.some((event) => event.name === "page_view")).toBe(true);
  expect(events.some((event) => event.name === "search_performed")).toBe(true);
  expect(events.some((event) => event.name === "add_to_cart")).toBe(true);
  expect(events.some((event) => event.name === "heat_click")).toBe(true);
  expect(events.some((event) => event.source === "facebook")).toBe(true);
  expect(events.some((event) => event.campaign === "cat_combo")).toBe(true);
});

test("admin analytics gate, filters, heatmap overlay, and export work", async ({
  page,
}) => {
  await page.goto("/admin/analytics");

  await expect(
    page.getByRole("heading", { name: /3FStore Analytics/i }),
  ).toBeVisible();
  await page.getByLabel("Mật khẩu demo").fill("3fstore-demo");
  await page.getByRole("button", { name: /Vào dashboard/i }).click();

  await expect(page.getByText("Sessions", { exact: true })).toBeVisible();

  const categoryChart = page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "Category revenue" }) });
  const categoryChartText = (await categoryChart.textContent()) ?? "";
  expect(categoryChartText).not.toContain("Snack & bánh thưởng");
  expect(categoryChartText).not.toContain("Hạt & thức ăn khô");
  expect(categoryChartText).not.toContain("Pate & thức ăn ướt");
  expect(categoryChartText).not.toContain("Chăm sóc & vệ sinh");
  expect(categoryChartText).not.toContain("Combo 3FStore");

  await page.getByRole("tab", { name: "Heatmaps" }).click();
  await page.getByLabel("Device").selectOption("mobile");
  await page.getByLabel("Heatmap mode").selectOption("rage");

  await expect(
    page.getByRole("img", { name: "Heatmap overlay canvas" }),
  ).toBeVisible();
  await expect(page.getByText(/Hot elements/i)).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(overflow).toBe(false);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export JSON/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/3fstore-analytics.*\.json/);
});

test("heatmap-focused route renders directly after auth", async ({ page }) => {
  await page.goto("/admin/analytics/heatmaps");

  await page.getByLabel("Mật khẩu demo").fill("3fstore-demo");
  await page.getByRole("button", { name: /Vào dashboard/i }).click();

  await expect(page.getByRole("tab", { name: "Heatmaps" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.getByRole("img", { name: "Heatmap overlay canvas" }),
  ).toBeVisible();
});
