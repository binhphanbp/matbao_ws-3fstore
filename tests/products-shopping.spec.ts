import { expect, test } from "@playwright/test";

const liveEventsKey = "3fstore-analytics-live-events";

test("product list supports search, filters, sorting, and quick add", async ({
  page,
}) => {
  await page.goto("/products?utm_source=google&utm_campaign=shopping_demo");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(
    page.getByRole("banner").getByRole("link", { name: /3FStore/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Mua sắm 3FStore/i }),
  ).toBeVisible();
  await expect(page.getByLabel("Tìm sản phẩm")).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Bộ lọc sản phẩm" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Pate & thức ăn ướt" }),
  ).toBeVisible();

  await expect(page.locator("[data-testid='product-card']")).toHaveCount(12);
  await expect(
    page.getByRole("navigation", { name: "Phân trang sản phẩm" }),
  ).toBeVisible();

  await page.getByLabel("Tìm sản phẩm").fill("pate");
  await expect(page).toHaveURL(/q=pate/);

  await page.getByRole("button", { name: "Pate & thức ăn ướt" }).click();
  await expect(page).toHaveURL(/category=Pate/);

  await page.getByLabel("Sắp xếp").selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);

  await page
    .getByRole("button", { name: /Thêm nhanh/i })
    .first()
    .click();
  await expect(page.getByText(/Đã thêm vào giỏ/i)).toBeVisible();

  const quickAddWhiteSpace = await page
    .getByRole("button", { name: /Thêm nhanh/i })
    .first()
    .evaluate((button) => window.getComputedStyle(button).whiteSpace);
  expect(quickAddWhiteSpace).toBe("nowrap");

  const state = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem("3fstore-cart") ?? "{}"),
  );
  expect(state.state.items.length).toBeGreaterThan(0);

  const events = await page.evaluate((key) => {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as Array<{
      name: string;
      source?: string;
      campaign?: string;
    }>;
  }, liveEventsKey);

  expect(events.some((event) => event.name === "product_list_view")).toBe(true);
  expect(events.some((event) => event.name === "product_search")).toBe(true);
  expect(events.some((event) => event.name === "product_filter_used")).toBe(
    true,
  );
  expect(events.some((event) => event.name === "add_to_cart")).toBe(true);
  expect(events.some((event) => event.source === "google")).toBe(true);
  expect(events.some((event) => event.campaign === "shopping_demo")).toBe(true);
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("product list supports quick view and pagination without forcing detail navigation", async ({
  page,
}) => {
  await page.goto("/products");

  await page
    .getByRole("button", { name: /Xem nhanh/i })
    .first()
    .click();
  await expect(
    page.getByRole("dialog", { name: /Xem nhanh sản phẩm/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Mua nhanh/i })).toBeVisible();

  await page.getByRole("button", { name: /Mua nhanh/i }).click();
  await expect(page.getByText(/Đã thêm vào giỏ/i)).toBeVisible();
  await expect(page).toHaveURL(/\/products$/);

  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Trang sau" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator("[data-testid='product-card']")).toHaveCount(12);

  await page.getByRole("button", { name: "Trang trước" }).click();
  await expect(page).not.toHaveURL(/page=2/);
});

test("product detail renders purchase UX and records add to cart plus buy now", async ({
  page,
}) => {
  await page.goto("/products");

  await page
    .getByRole("link", { name: /Xem chi tiết/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/products\/[^/]+$/);

  await expect(
    page.getByRole("heading", { name: /Thông tin sản phẩm/i }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Số lượng" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Thêm vào giỏ/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Mua ngay/i })).toBeVisible();

  const variantButtons = page.locator("[data-testid='variant-option']");
  if ((await variantButtons.count()) > 0) {
    await variantButtons.first().click();
  }

  await page.getByRole("textbox", { name: "Số lượng" }).fill("2");
  await page.getByRole("button", { name: /Thêm vào giỏ/i }).click();
  await page.getByRole("button", { name: /Mua ngay/i }).click();

  await expect(page.getByText(/Đã thêm vào giỏ/i)).toBeVisible();

  const events = await page.evaluate((key) => {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as Array<{
      name: string;
      quantity?: number;
    }>;
  }, liveEventsKey);

  expect(events.some((event) => event.name === "product_detail_view")).toBe(
    true,
  );
  expect(events.some((event) => event.name === "variant_selected")).toBe(true);
  expect(
    events.some(
      (event) => event.name === "add_to_cart" && event.quantity === 2,
    ),
  ).toBe(true);
  expect(events.some((event) => event.name === "buy_now")).toBe(true);
});

test("product pages stay usable on mobile without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products");

  await expect(
    page.getByRole("button", { name: /Thêm nhanh/i }).first(),
  ).toBeVisible();

  let overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(overflow).toBe(false);

  await page
    .getByRole("link", { name: /Xem chi tiết/i })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: /Mua ngay/i }).last(),
  ).toBeVisible();

  overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(overflow).toBe(false);
});
