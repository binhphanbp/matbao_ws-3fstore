/* eslint-disable @next/next/no-img-element */
"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Heart,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { StorefrontPageShell } from "@/components/products/storefront-chrome";
import { trackAnalyticsEvent } from "@/lib/analytics/tracker";
import { useCartStore } from "@/store/cart-store";
import type { ProductAudience, ProductPreview } from "@/types/product";

type ProductListPageProps = {
  products: ProductPreview[];
  categories: string[];
  brands: string[];
};

const PAGE_SIZE = 12;

const audienceOptions: Array<{
  value: "all" | ProductAudience;
  label: string;
}> = [
  { value: "all", label: "Tất cả boss" },
  { value: "cat", label: "Cho mèo" },
  { value: "dog", label: "Cho chó" },
  { value: "both", label: "Chó & mèo" },
];

const priceOptions = [
  { value: "all", label: "Mọi mức giá" },
  { value: "under-100k", label: "Dưới 100k" },
  { value: "100-300k", label: "100k đến 300k" },
  { value: "over-300k", label: "Trên 300k" },
];

const sortOptions = [
  { value: "featured", label: "Gợi ý tốt nhất" },
  { value: "price-asc", label: "Giá thấp trước" },
  { value: "price-desc", label: "Giá cao trước" },
  { value: "sale", label: "Giảm nhiều nhất" },
  { value: "popular", label: "Bán chạy" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const normalize = (value: string) => value.toLowerCase().trim();

const getDiscount = (product: ProductPreview) => {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
    return 0;
  }

  return Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
  );
};

function productMatchesPrice(product: ProductPreview, price: string) {
  if (price === "under-100k") {
    return product.price < 100000;
  }

  if (price === "100-300k") {
    return product.price >= 100000 && product.price <= 300000;
  }

  if (price === "over-300k") {
    return product.price > 300000;
  }

  return true;
}

function getPageFromParams(value: string | null) {
  const parsed = Number(value ?? "1");

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function getCardTitle(product: ProductPreview) {
  const cleaned = product.shortName
    .replace(/\s+\|\s+.*$/u, "")
    .replace(/\s+[–-]\s*3F\s*Store.*$/iu, "")
    .replace(/\s*3FStore\s*$/iu, "")
    .replace(/\s+[–-]\s*$/u, "")
    .trim();

  if (cleaned.length <= 74) {
    return cleaned;
  }

  const clipped = cleaned.slice(0, 74).replace(/\s+\S*$/u, "");
  return clipped.replace(/\s+[–-]\s*$/u, "").trim();
}

export function ProductListPage({
  products,
  categories,
  brands,
}: ProductListPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const [wishlist, setWishlist] = useState<Set<string>>(() => new Set());
  const [quickViewProduct, setQuickViewProduct] =
    useState<ProductPreview | null>(null);
  const [toast, setToast] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const query = searchParams.get("q") ?? "";
  const selectedCategory = searchParams.get("category") ?? "all";
  const selectedBrand = searchParams.get("brand") ?? "all";
  const selectedAudience = searchParams.get("audience") ?? "all";
  const selectedPrice = searchParams.get("price") ?? "all";
  const selectedSort = searchParams.get("sort") ?? "featured";
  const requestedPage = getPageFromParams(searchParams.get("page"));

  useEffect(() => {
    trackAnalyticsEvent("product_list_view", {
      sectionId: "products-list",
      elementId: "products-page",
      metadata: { totalProducts: products.length },
    });
  }, [products.length]);

  useEffect(() => {
    if (!quickViewProduct) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setQuickViewProduct(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quickViewProduct]);

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all" || (key === "sort" && value === "featured")) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    if (key !== "page") {
      params.delete("page");
    }

    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const filteredProducts = useMemo(() => {
    const queryText = normalize(query);

    const nextProducts = products.filter((product) => {
      const searchable = normalize(
        [
          product.name,
          product.shortName,
          product.category,
          product.brand,
          product.shortDescription,
          product.tags.join(" "),
        ]
          .filter(Boolean)
          .join(" "),
      );

      const matchesQuery = !queryText || searchable.includes(queryText);
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesBrand =
        selectedBrand === "all" || product.brand === selectedBrand;
      const matchesAudience =
        selectedAudience === "all" ||
        product.audience === selectedAudience ||
        product.audience === "both" ||
        product.audience === "all-pets";
      const matchesPrice = productMatchesPrice(product, selectedPrice);

      return (
        matchesQuery &&
        matchesCategory &&
        matchesBrand &&
        matchesAudience &&
        matchesPrice
      );
    });

    return [...nextProducts].sort((a, b) => {
      if (selectedSort === "price-asc") {
        return a.price - b.price;
      }

      if (selectedSort === "price-desc") {
        return b.price - a.price;
      }

      if (selectedSort === "sale") {
        return getDiscount(b) - getDiscount(a);
      }

      if (selectedSort === "popular") {
        return b.sold - a.sold;
      }

      return getDiscount(b) - getDiscount(a) || b.sold - a.sold;
    });
  }, [
    products,
    query,
    selectedAudience,
    selectedBrand,
    selectedCategory,
    selectedPrice,
    selectedSort,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleProducts = filteredProducts.slice(
    pageStart,
    pageStart + PAGE_SIZE,
  );
  const activeFilterCount = [
    query,
    selectedCategory !== "all" ? selectedCategory : "",
    selectedBrand !== "all" ? selectedBrand : "",
    selectedAudience !== "all" ? selectedAudience : "",
    selectedPrice !== "all" ? selectedPrice : "",
  ].filter(Boolean).length;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const handleFilter = (key: string, value: string) => {
    updateQuery(key, value);
    trackAnalyticsEvent("product_filter_used", {
      sectionId: "products-list",
      elementId: `filter-${key}`,
      metadata: { key, value },
    });
  };

  const handleQuickAdd = (
    product: ProductPreview,
    mode: "add" | "buy" = "add",
  ) => {
    addItem(product);
    openCart();
    trackAnalyticsEvent(mode === "buy" ? "buy_now" : "add_to_cart", {
      sectionId: "products-list",
      elementId: mode === "buy" ? "quick-buy" : "quick-add",
      productId: product.id,
      productName: product.shortName,
      category: product.category,
      brand: product.brand,
      audience: product.audience,
      price: product.price,
      quantity: 1,
      cartValue: product.price,
    });
    showToast(
      mode === "buy"
        ? "Đã thêm vào giỏ, sẵn sàng thanh toán nhanh."
        : "Đã thêm vào giỏ. Kiểm tra giỏ hàng bên phải.",
    );
  };

  const openQuickView = (product: ProductPreview) => {
    setQuickViewProduct(product);
    trackAnalyticsEvent("product_click", {
      sectionId: "products-list",
      elementId: "quick-view",
      productId: product.id,
      productName: product.shortName,
      category: product.category,
      brand: product.brand,
      audience: product.audience,
      price: product.price,
    });
  };

  const goToPage = (page: number) => {
    updateQuery("page", page <= 1 ? "all" : String(page));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  return (
    <StorefrontPageShell>
      <main data-track-section="products-list">
        <section className="mx-auto grid w-full max-w-[1480px] gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:grid-cols-[286px_minmax(0,1fr)] lg:px-8">
          <ProductFilters
            categories={categories}
            brands={brands}
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            selectedAudience={selectedAudience}
            selectedPrice={selectedPrice}
            activeFilterCount={activeFilterCount}
            onFilter={handleFilter}
            onReset={resetFilters}
          />

          <div className="min-w-0">
            <div className="sticky top-16 z-30 mb-3 rounded-[20px] border border-[#d7ebe8] bg-white/96 p-2.5 shadow-[0_12px_38px_rgba(7,63,66,0.08)] backdrop-blur sm:top-[72px] sm:mb-4 sm:rounded-[24px] sm:p-3">
              <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5f7c7b] sm:flex-wrap sm:text-sm">
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#073f42] px-3 text-sm font-black text-white lg:hidden"
                  >
                    <Filter className="size-4" />
                    Lọc
                    {activeFilterCount > 0 ? (
                      <span className="grid size-5 place-items-center rounded-full bg-[#ff4f3c] text-xs text-white">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </button>
                  <span className="min-w-0 truncate">
                    <strong className="text-[#073f42]">
                      {filteredProducts.length}
                    </strong>{" "}
                    sản phẩm
                  </span>
                  <span className="hidden text-[#9ab1af] sm:inline">/</span>
                  <span className="shrink-0">
                    Trang {currentPage}/{totalPages}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative block min-w-0 flex-1 sm:w-56">
                    <span className="sr-only">Sắp xếp</span>
                    <select
                      aria-label="Sắp xếp"
                      value={selectedSort}
                      onChange={(event) =>
                        handleFilter("sort", event.target.value)
                      }
                      className="h-11 w-full appearance-none rounded-full border border-[#d6e7e4] bg-white px-4 pr-10 text-sm font-extrabold text-[#073f42] outline-none focus:border-[#ff4f3c]"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-3 right-3 size-5 text-[#0d7773]" />
                  </label>
                </div>
              </div>
            </div>

            {visibleProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      wished={wishlist.has(product.id)}
                      onWishlist={() => {
                        setWishlist((current) => {
                          const next = new Set(current);
                          if (next.has(product.id)) {
                            next.delete(product.id);
                          } else {
                            next.add(product.id);
                          }
                          return next;
                        });
                      }}
                      onQuickAdd={() => handleQuickAdd(product)}
                      onQuickView={() => openQuickView(product)}
                    />
                  ))}
                </div>

                <ProductPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                />
              </>
            ) : (
              <EmptyProducts onReset={resetFilters} />
            )}
          </div>
        </section>
      </main>

      {mobileFiltersOpen ? (
        <div
          className="fixed inset-0 z-[70] bg-[#073f42]/40 lg:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setMobileFiltersOpen(false);
            }
          }}
        >
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[28px] bg-white p-4 shadow-[0_-24px_80px_rgba(7,63,66,0.22)]">
            <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-white pb-3">
              <div>
                <p className="text-lg font-black text-[#073f42]">Bộ lọc</p>
                <p className="mt-0.5 text-xs font-bold text-[#7b9694]">
                  Chọn xong sẽ đóng để xem sản phẩm ngay.
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng bộ lọc"
                onClick={() => setMobileFiltersOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d7e8e5]"
              >
                <X className="size-5" />
              </button>
            </div>
            <ProductFilters
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              selectedBrand={selectedBrand}
              selectedAudience={selectedAudience}
              selectedPrice={selectedPrice}
              activeFilterCount={activeFilterCount}
              onFilter={(key, value) => {
                handleFilter(key, value);
                setMobileFiltersOpen(false);
              }}
              onReset={() => {
                resetFilters();
                setMobileFiltersOpen(false);
              }}
              mobile
            />
          </div>
        </div>
      ) : null}

      {quickViewProduct ? (
        <QuickViewDialog
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onBuy={() => handleQuickAdd(quickViewProduct, "buy")}
        />
      ) : null}

      {toast ? (
        <div
          role="status"
          className="fixed right-3 bottom-3 left-3 z-[95] flex items-center gap-3 rounded-[20px] border-2 border-[#ffb4a8] bg-[#ff4f3c] px-4 py-3 text-sm font-black text-white shadow-[0_24px_70px_rgba(255,79,60,0.34)] sm:right-5 sm:bottom-5 sm:left-auto sm:max-w-md sm:rounded-[22px] sm:px-5 sm:py-4 sm:text-base"
        >
          <CheckCircle2 className="size-6 shrink-0" />
          <span>{toast}</span>
        </div>
      ) : null}
    </StorefrontPageShell>
  );
}

function ProductFilters({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedAudience,
  selectedPrice,
  activeFilterCount,
  onFilter,
  onReset,
  mobile = false,
}: {
  categories: string[];
  brands: string[];
  selectedCategory: string;
  selectedBrand: string;
  selectedAudience: string;
  selectedPrice: string;
  activeFilterCount: number;
  onFilter: (key: string, value: string) => void;
  onReset: () => void;
  mobile?: boolean;
}) {
  return (
    <aside
      aria-label="Bộ lọc sản phẩm"
      className={
        mobile
          ? "block"
          : "hidden self-start rounded-[26px] border border-[#d7e8e5] bg-white p-4 shadow-[0_18px_60px_rgba(7,63,66,0.08)] lg:sticky lg:top-24 lg:block"
      }
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-black tracking-[0.14em] text-[#0d7773] uppercase">
            <SlidersHorizontal className="size-4" />
            Bộ lọc
          </p>
          <p className="mt-1 text-xs font-bold text-[#7b9694]">
            {activeFilterCount} điều kiện đang áp dụng
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-[#d7e8e5] px-3 py-2 text-xs font-black text-[#073f42] hover:border-[#ff4f3c] hover:text-[#ff4f3c]"
        >
          Xóa
        </button>
      </div>

      <FilterGroup title="Danh mục">
        <CategoryButton
          label="Tất cả"
          active={selectedCategory === "all"}
          onClick={() => onFilter("category", "all")}
        />
        {categories.map((category) => (
          <CategoryButton
            key={category}
            label={category}
            active={selectedCategory === category}
            onClick={() => onFilter("category", category)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Đối tượng">
        {audienceOptions.map((option) => (
          <CategoryButton
            key={option.value}
            label={option.label}
            active={selectedAudience === option.value}
            onClick={() => onFilter("audience", option.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Mức giá">
        {priceOptions.map((option) => (
          <CategoryButton
            key={option.value}
            label={option.label}
            active={selectedPrice === option.value}
            onClick={() => onFilter("price", option.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Thương hiệu">
        <label className="relative block">
          <span className="sr-only">Thương hiệu</span>
          <select
            aria-label="Thương hiệu"
            value={selectedBrand}
            onChange={(event) => onFilter("brand", event.target.value)}
            className="h-11 w-full appearance-none rounded-2xl border border-[#d6e7e4] bg-[#f8fcfb] px-4 pr-10 text-sm font-extrabold text-[#073f42] outline-none focus:border-[#ff4f3c]"
          >
            <option value="all">Mọi thương hiệu</option>
            {brands.slice(0, 36).map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-3 right-3 size-5 text-[#0d7773]" />
        </label>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-[#e1eeeb] py-4 first:border-t-0 first:pt-0">
      <h2 className="mb-3 text-sm font-black text-[#073f42]">{title}</h2>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}

function CategoryButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center justify-between rounded-2xl px-3 text-left text-sm font-extrabold transition ${
        active
          ? "bg-[#073f42] text-white"
          : "bg-[#f3faf8] text-[#315f5d] hover:bg-[#e0f3ef]"
      }`}
    >
      <span className="truncate">{label}</span>
      {active ? <CheckCircle2 className="size-4 shrink-0" /> : null}
    </button>
  );
}

function ProductCard({
  product,
  wished,
  onWishlist,
  onQuickAdd,
  onQuickView,
}: {
  product: ProductPreview;
  wished: boolean;
  onWishlist: () => void;
  onQuickAdd: () => void;
  onQuickView: () => void;
}) {
  const discount = getDiscount(product);
  const cardTitle = getCardTitle(product);

  return (
    <article
      data-testid="product-card"
      data-track-id="product-card"
      data-track-product-id={product.id}
      data-track-product-name={product.shortName}
      data-track-category={product.category}
      data-track-brand={product.brand}
      data-track-price={product.price}
      className="group flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-[#d9e9e6] bg-white shadow-[0_8px_22px_rgba(7,63,66,0.06)] transition hover:-translate-y-0.5 hover:border-[#b9dcd7] sm:rounded-[16px]"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <Link
          href={`/products/${product.slug}`}
          aria-label="Mở chi tiết sản phẩm"
          onClick={() =>
            trackAnalyticsEvent("product_click", {
              sectionId: "products-list",
              elementId: "product-image-link",
              productId: product.id,
              productName: product.shortName,
              category: product.category,
              brand: product.brand,
              audience: product.audience,
              price: product.price,
            })
          }
          className="block h-full w-full"
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.shortName}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full place-items-center rounded-3xl bg-white text-2xl font-black text-[#8fb7b2]">
              3F
            </div>
          )}
        </Link>
        {discount > 0 ? (
          <span className="absolute top-1.5 left-1.5 z-10 rounded-full bg-[#ff4f3c] px-2 py-0.5 text-[10px] font-black text-white sm:top-2 sm:left-2 sm:text-xs">
            -{discount}%
          </span>
        ) : null}
        <button
          type="button"
          onClick={onWishlist}
          aria-label={wished ? "Bỏ yêu thích" : "Thêm yêu thích"}
          className={`absolute top-1.5 right-1.5 z-10 grid size-8 place-items-center rounded-full border bg-white transition sm:top-2 sm:right-2 sm:size-9 ${
            wished
              ? "border-[#ff4f3c] text-[#ff4f3c]"
              : "border-[#d7e8e5] text-[#0b5557]"
          }`}
        >
          <Heart className="size-4" fill={wished ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-2 sm:gap-3 sm:p-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center justify-between gap-1.5 sm:mb-2 sm:gap-2">
            <span className="min-w-0 truncate rounded-full bg-[#e9f8f5] px-2 py-0.5 text-[10px] font-black text-[#0d7773] sm:px-2.5 sm:py-1 sm:text-[11px]">
              {product.category}
            </span>
            <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-black text-[#f4b400] sm:gap-1 sm:text-xs">
              <Star className="size-3.5" fill="currentColor" />
              {Math.max(4.6, Math.min(5, 4.7 + product.sold / 10000)).toFixed(
                1,
              )}
            </span>
          </div>
          <Link
            href={`/products/${product.slug}`}
            aria-label="Mở chi tiết sản phẩm"
            onClick={() =>
              trackAnalyticsEvent("product_click", {
                sectionId: "products-list",
                elementId: "product-name-link",
                productId: product.id,
                productName: product.shortName,
                category: product.category,
                brand: product.brand,
                audience: product.audience,
                price: product.price,
              })
            }
            className="line-clamp-2 min-h-[34px] text-[13px] leading-[1.35] font-black text-[#073f42] sm:min-h-11 sm:text-sm sm:leading-[1.45]"
            title={product.shortName}
          >
            {cardTitle}
          </Link>
        </div>

        <div className="mt-auto border-t border-[#e1eeeb] pt-2 sm:pt-3">
          <div className="mb-2 flex items-end justify-between gap-1.5 sm:mb-3 sm:gap-2">
            <div className="min-w-0">
              {product.compareAtPrice ? (
                <p className="truncate text-[11px] font-bold text-[#9aa7a5] line-through sm:text-xs">
                  {formatCurrency(product.compareAtPrice)}
                </p>
              ) : null}
              <p className="truncate text-base font-black text-[#111827] sm:text-xl">
                {formatCurrency(product.price)}
              </p>
            </div>
            <button
              type="button"
              onClick={onQuickView}
            className="hidden size-8 shrink-0 place-items-center rounded-full border border-[#d7e8e5] text-[#073f42] transition hover:border-[#ff4f3c] hover:text-[#ff4f3c] sm:grid sm:size-10"
            >
              <span className="sr-only">Xem nhanh</span>
              <Eye className="size-4 sm:size-5" />
            </button>
          </div>

          <div>
            <button
              type="button"
              aria-label="Thêm giỏ hàng"
              onClick={onQuickAdd}
              className="inline-flex h-9 w-full min-w-0 items-center justify-center gap-1 rounded-[12px] bg-[#ff4f3c] px-1.5 text-[12px] font-black whitespace-nowrap text-white shadow-[0_8px_18px_rgba(255,79,60,0.18)] transition hover:bg-[#e84231] sm:h-11 sm:gap-2 sm:rounded-[14px] sm:px-3 sm:text-sm"
            >
              <ShoppingBag className="size-4" />
              <span>Thêm giỏ hàng</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (page) =>
      page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
  );

  return (
    <nav
      aria-label="Phân trang sản phẩm"
      className="mt-5 flex flex-wrap items-center justify-center gap-2 rounded-[22px] border border-[#d7e8e5] bg-white p-2.5 sm:mt-6 sm:rounded-[24px] sm:p-3"
    >
      <button
        type="button"
        aria-label="Trang trước"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex h-10 items-center gap-1 rounded-full border border-[#d7e8e5] px-3 text-sm font-black text-[#073f42] disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:gap-2 sm:px-4"
      >
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">Trang trước</span>
      </button>

      {pages.map((page, index) => {
        const previous = pages[index - 1];
        const showGap = previous && page - previous > 1;

        return (
          <div key={page} className="flex items-center gap-2">
            {showGap ? (
              <span className="px-1 text-sm font-black text-[#8aa5a2]">
                ...
              </span>
            ) : null}
            <button
              type="button"
              aria-current={currentPage === page ? "page" : undefined}
              onClick={() => onPageChange(page)}
              className={`grid size-10 place-items-center rounded-full text-sm font-black sm:size-11 ${
                currentPage === page
                  ? "bg-[#073f42] text-white"
                  : "border border-[#d7e8e5] bg-white text-[#073f42] hover:border-[#ff4f3c]"
              }`}
            >
              {page}
            </button>
          </div>
        );
      })}

      <button
        type="button"
        aria-label="Trang sau"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex h-10 items-center gap-1 rounded-full border border-[#d7e8e5] px-3 text-sm font-black text-[#073f42] disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:gap-2 sm:px-4"
      >
        <span className="hidden sm:inline">Trang sau</span>
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

function QuickViewDialog({
  product,
  onClose,
  onBuy,
}: {
  product: ProductPreview;
  onClose: () => void;
  onBuy: () => void;
}) {
  const discount = getDiscount(product);

  return (
    <div
      className="fixed inset-0 z-[75] grid items-end bg-[#073f42]/45 sm:place-items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        className="grid max-h-[88dvh] w-full overflow-hidden rounded-t-[30px] bg-white shadow-[0_30px_90px_rgba(7,63,66,0.24)] sm:max-w-3xl sm:rounded-[30px] md:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="relative bg-[#eef8f6] p-4 sm:p-6">
          {discount > 0 ? (
            <span className="absolute top-4 left-4 rounded-full bg-[#ff4f3c] px-3 py-1 text-xs font-black text-white sm:top-5 sm:left-5">
              -{discount}%
            </span>
          ) : null}
          {product.image ? (
            <img
              src={product.image}
              alt={product.shortName}
              className="mx-auto aspect-square h-full max-h-[220px] w-full object-contain sm:max-h-[360px]"
            />
          ) : (
            <div className="grid aspect-square place-items-center rounded-3xl bg-white text-4xl font-black text-[#8fb7b2]">
              3F
            </div>
          )}
        </div>

        <div className="overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-2 inline-flex rounded-full bg-[#e9f8f5] px-3 py-1 text-xs font-black text-[#0d7773]">
                {product.category}
              </p>
              <h2
                id="quick-view-title"
                className="text-xl leading-tight font-black text-[#073f42] sm:text-2xl"
              >
                Xem nhanh sản phẩm
              </h2>
            </div>
            <button
              type="button"
              aria-label="Đóng xem nhanh"
              onClick={onClose}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d7e8e5] text-[#073f42]"
            >
              <X className="size-5" />
            </button>
          </div>

          <p className="line-clamp-2 text-base leading-6 font-black text-[#073f42] sm:line-clamp-3 sm:text-lg sm:leading-7">
            {product.shortName}
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-6 font-semibold text-[#587a78] sm:mt-3 sm:line-clamp-3">
            {product.shortDescription}
          </p>

          <div className="mt-4 rounded-[20px] bg-[#f5fbfa] p-3 sm:mt-5 sm:rounded-[22px] sm:p-4">
            {product.compareAtPrice ? (
              <p className="text-sm font-bold text-[#9aa7a5] line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            ) : null}
            <p className="text-2xl font-black text-[#111827] sm:text-3xl">
              {formatCurrency(product.price)}
            </p>
          </div>

          <div className="mt-4 grid gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              onClick={onBuy}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#ff4f3c] px-5 text-sm font-black text-white shadow-[0_14px_35px_rgba(255,79,60,0.25)]"
            >
              <ShoppingBag className="size-5" />
              Mua nhanh
            </button>
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#cfe3df] px-5 text-sm font-black text-[#073f42]"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyProducts({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#bdded9] bg-white p-6 text-center sm:rounded-[28px] sm:p-10">
      <p className="text-xl font-black text-[#073f42] sm:text-2xl">
        Chưa có sản phẩm phù hợp
      </p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 font-semibold text-[#66817f]">
        Hãy thử bỏ bớt bộ lọc hoặc tìm bằng tên ngắn hơn như pate, cát, snack,
        sữa tắm.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-full bg-[#ff4f3c] px-6 py-3 text-sm font-black text-white shadow-[0_14px_35px_rgba(255,79,60,0.25)]"
      >
        Xem toàn bộ sản phẩm
      </button>
    </div>
  );
}
