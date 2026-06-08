/* eslint-disable @next/next/no-img-element */
"use client";

import {
  ChevronDown,
  Heart,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/tracker";
import { useCartStore } from "@/store/cart-store";
import type { ProductPreview, ProductAudience } from "@/types/product";

type ProductListPageProps = {
  products: ProductPreview[];
  categories: string[];
  brands: string[];
};

const audienceOptions: Array<{
  value: "all" | ProductAudience;
  label: string;
}> = [
  { value: "all", label: "Tất cả" },
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

const getDiscount = (product: ProductPreview) => {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
    return 0;
  }

  return Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
  );
};

const normalize = (value: string) => value.toLowerCase().trim();

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

export function ProductListPage({
  products,
  categories,
  brands,
}: ProductListPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const addItem = useCartStore((state) => state.addItem);
  const [wishlist, setWishlist] = useState<Set<string>>(() => new Set());

  const query = searchParams.get("q") ?? "";
  const selectedCategory = searchParams.get("category") ?? "all";
  const selectedBrand = searchParams.get("brand") ?? "all";
  const selectedAudience = searchParams.get("audience") ?? "all";
  const selectedPrice = searchParams.get("price") ?? "all";
  const selectedSort = searchParams.get("sort") ?? "featured";

  useEffect(() => {
    trackAnalyticsEvent("product_list_view", {
      sectionId: "products-list",
      elementId: "products-page",
      metadata: { totalProducts: products.length },
    });
  }, [products.length]);

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all" || (key === "sort" && value === "featured")) {
      params.delete(key);
    } else {
      params.set(key, value);
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

  const handleSearch = (value: string) => {
    updateQuery("q", value);
    if (value.trim()) {
      trackAnalyticsEvent("product_search", {
        sectionId: "products-list",
        elementId: "product-search",
        metadata: { query: value.trim() },
      });
    }
  };

  const handleFilter = (key: string, value: string) => {
    updateQuery(key, value);
    trackAnalyticsEvent("product_filter_used", {
      sectionId: "products-list",
      elementId: `filter-${key}`,
      metadata: { key, value },
    });
  };

  const handleQuickAdd = (product: ProductPreview) => {
    addItem(product);
    trackAnalyticsEvent("add_to_cart", {
      sectionId: "products-list",
      elementId: "quick-add",
      productId: product.id,
      productName: product.shortName,
      category: product.category,
      brand: product.brand,
      audience: product.audience,
      price: product.price,
      quantity: 1,
    });
  };

  const resetFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  return (
    <main className="min-h-screen bg-[#f5fbfa] text-[#073f42]">
      <section
        className="mx-auto flex w-full max-w-[1480px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8"
        data-track-section="products-list"
      >
        <div className="rounded-[32px] border border-[#cde9e5] bg-white p-4 shadow-[0_24px_80px_rgba(7,63,66,0.08)] sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_440px] lg:items-end">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e7fbf7] px-4 py-2 text-sm font-extrabold text-[#0b6b68]">
                <Sparkles className="size-4" />
                Mua nhanh cho boss trong 1 chạm
              </div>
              <h1 className="max-w-3xl text-4xl leading-[1.05] font-black tracking-normal text-[#073f42] sm:text-5xl lg:text-6xl">
                Mua sắm 3FStore
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 font-semibold text-[#4b7372] sm:text-lg">
                Tìm đúng đồ ăn, cát, phụ kiện và đồ chăm sóc chỉ trong vài giây.
                Thêm giỏ ngay trên danh sách hoặc xem chi tiết khi cần.
              </p>
            </div>

            <div className="rounded-[26px] bg-[#eef8f6] p-3">
              <label
                htmlFor="product-search"
                className="mb-2 block text-sm font-extrabold text-[#073f42]"
              >
                Tìm sản phẩm
              </label>
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                <Search className="size-5 shrink-0 text-[#0d7773]" />
                <input
                  id="product-search"
                  value={query}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Pate mèo, cát vệ sinh, snack..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#073f42] outline-none placeholder:text-[#7da09e]"
                  data-track-id="product-search"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-3 z-30 rounded-[28px] border border-[#d7ebe8] bg-white/95 p-3 shadow-[0_18px_60px_rgba(7,63,66,0.10)] backdrop-blur">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#073f42] px-4 py-2 text-sm font-extrabold text-white">
                <SlidersHorizontal className="size-4" />
                Lọc nhanh
              </span>
              <button
                type="button"
                onClick={() => handleFilter("category", "all")}
                className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                  selectedCategory === "all"
                    ? "bg-[#ff4f3c] text-white"
                    : "bg-[#f3faf8] text-[#285c5b] hover:bg-[#e0f3ef]"
                }`}
              >
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleFilter("category", category)}
                  className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                    selectedCategory === category
                      ? "bg-[#ff4f3c] text-white"
                      : "bg-[#f3faf8] text-[#285c5b] hover:bg-[#e0f3ef]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-3 xl:w-[620px]">
              <FilterSelect
                label="Đối tượng"
                value={selectedAudience}
                onChange={(value) => handleFilter("audience", value)}
                options={audienceOptions}
              />
              <FilterSelect
                label="Giá"
                value={selectedPrice}
                onChange={(value) => handleFilter("price", value)}
                options={priceOptions}
              />
              <label className="relative block">
                <span className="sr-only">Sắp xếp</span>
                <select
                  aria-label="Sắp xếp"
                  value={selectedSort}
                  onChange={(event) => handleFilter("sort", event.target.value)}
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

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-[#5f7c7b]">
            <span>
              Đang hiển thị{" "}
              <strong className="text-[#073f42]">
                {filteredProducts.length}
              </strong>{" "}
              sản phẩm phù hợp
            </span>
            <div className="flex flex-wrap gap-2">
              <FilterSelect
                label="Thương hiệu"
                value={selectedBrand}
                onChange={(value) => handleFilter("brand", value)}
                options={[
                  { value: "all", label: "Mọi thương hiệu" },
                  ...brands.slice(0, 24).map((brand) => ({
                    value: brand,
                    label: brand,
                  })),
                ]}
              />
              <button
                type="button"
                onClick={resetFilters}
                className="h-11 rounded-full border border-[#d7e8e5] px-4 text-sm font-extrabold text-[#073f42] transition hover:bg-[#f2faf8]"
              >
                Xóa lọc
              </button>
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map((product) => (
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
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[32px] border border-dashed border-[#bdded9] bg-white p-10 text-center">
            <p className="text-2xl font-black text-[#073f42]">
              Chưa có sản phẩm phù hợp
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 font-semibold text-[#66817f]">
              Hãy thử bỏ bớt bộ lọc hoặc tìm bằng tên ngắn hơn như pate, cát,
              snack, sữa tắm.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-full bg-[#ff4f3c] px-6 py-3 text-sm font-black text-white shadow-[0_14px_35px_rgba(255,79,60,0.25)]"
            >
              Xem toàn bộ sản phẩm
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-full border border-[#d6e7e4] bg-white px-4 pr-10 text-sm font-extrabold text-[#073f42] outline-none focus:border-[#ff4f3c]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-3 right-3 size-5 text-[#0d7773]" />
    </label>
  );
}

function ProductCard({
  product,
  wished,
  onWishlist,
  onQuickAdd,
}: {
  product: ProductPreview;
  wished: boolean;
  onWishlist: () => void;
  onQuickAdd: () => void;
}) {
  const discount = getDiscount(product);

  return (
    <article
      className="group flex min-w-0 flex-col overflow-hidden rounded-[28px] border border-[#d9e9e6] bg-white shadow-[0_18px_55px_rgba(7,63,66,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(7,63,66,0.14)]"
      data-track-id="product-card"
      data-track-product-id={product.id}
      data-track-product-name={product.shortName}
      data-track-category={product.category}
      data-track-brand={product.brand}
      data-track-price={product.price}
    >
      <div className="relative aspect-[4/3] bg-[#eef8f6] p-5">
        {discount > 0 ? (
          <span className="absolute top-4 left-4 z-10 rounded-full bg-[#ff4f3c] px-3 py-1 text-xs font-black text-white">
            -{discount}%
          </span>
        ) : null}
        <button
          type="button"
          onClick={onWishlist}
          aria-label={wished ? "Bỏ yêu thích" : "Thêm yêu thích"}
          className={`absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full border bg-white transition ${
            wished
              ? "border-[#ff4f3c] text-[#ff4f3c]"
              : "border-[#d7e8e5] text-[#0b5557]"
          }`}
        >
          <Heart className="size-5" fill={wished ? "currentColor" : "none"} />
        </button>
        {product.image ? (
          <img
            src={product.image}
            alt={product.shortName}
            className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center rounded-3xl bg-white text-2xl font-black text-[#8fb7b2]">
            3F
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="truncate rounded-full bg-[#e9f8f5] px-3 py-1 text-xs font-black text-[#0d7773]">
              {product.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-black text-[#f4b400]">
              <Star className="size-4" fill="currentColor" />
              {Math.max(4.6, Math.min(5, 4.7 + product.sold / 10000)).toFixed(
                1,
              )}
            </span>
          </div>
          <h2 className="line-clamp-2 min-h-[48px] text-base leading-6 font-black text-[#073f42]">
            {product.shortName}
          </h2>
          <p className="mt-2 line-clamp-2 min-h-[42px] text-sm leading-5 font-semibold text-[#66817f]">
            {product.shortDescription}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#e1eeeb] pt-4">
          <div className="min-w-0">
            {product.compareAtPrice ? (
              <p className="text-sm font-bold text-[#9aa7a5] line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            ) : null}
            <p className="text-2xl font-black text-[#111827]">
              {formatCurrency(product.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={onQuickAdd}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#ff4f3c] px-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(255,79,60,0.25)] transition hover:bg-[#e84231]"
          >
            <ShoppingBag className="size-5" />
            Thêm nhanh
          </button>
        </div>

        <Link
          href={`/products/${product.slug}`}
          onClick={() =>
            trackAnalyticsEvent("product_click", {
              sectionId: "products-list",
              elementId: "product-detail-link",
              productId: product.id,
              productName: product.shortName,
              category: product.category,
              brand: product.brand,
              audience: product.audience,
              price: product.price,
            })
          }
          className="inline-flex h-11 items-center justify-center rounded-full border border-[#cfe3df] text-sm font-black text-[#073f42] transition hover:border-[#ff4f3c] hover:text-[#ff4f3c]"
        >
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}
