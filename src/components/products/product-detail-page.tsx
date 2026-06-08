/* eslint-disable @next/next/no-img-element */
"use client";

import {
  BadgeCheck,
  ChevronLeft,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { StorefrontPageShell } from "@/components/products/storefront-chrome";
import { trackAnalyticsEvent } from "@/lib/analytics/tracker";
import { useCartStore } from "@/store/cart-store";
import type {
  Product,
  ProductPreview,
  ProductVariant,
  StoreProduct,
} from "@/types/product";

type ProductDetailPageProps = {
  product: StoreProduct;
  relatedProducts: ProductPreview[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const audienceLabel = {
  cat: "Cho mèo",
  dog: "Cho chó",
  both: "Chó & mèo",
  "all-pets": "Mọi thú cưng",
};

function getDiscount(price: number, compareAtPrice?: number | null) {
  if (!compareAtPrice || compareAtPrice <= price) {
    return 0;
  }

  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

function getDescriptionLines(description: string) {
  return description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 18);
}

function clampQuantity(value: number) {
  if (Number.isNaN(value)) {
    return 1;
  }

  return Math.min(99, Math.max(1, Math.floor(value)));
}

export function ProductDetailPage({
  product,
  relatedProducts,
}: ProductDetailPageProps) {
  const addItem = useCartStore((state) => state.addItem);
  const firstVariant = product.variants[0] ?? null;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    firstVariant?.id ?? null,
  );
  const selectedVariant = useMemo(
    () =>
      product.variants.find((variant) => variant.id === selectedVariantId) ??
      firstVariant,
    [firstVariant, product.variants, selectedVariantId],
  );
  const images = useMemo(() => {
    const ordered = [
      selectedVariant?.image,
      product.image,
      ...product.images,
    ].filter((image): image is string => Boolean(image));

    return Array.from(new Set(ordered));
  }, [product.image, product.images, selectedVariant?.image]);
  const [selectedImage, setSelectedImage] = useState(images[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");

  const price = selectedVariant?.price ?? product.price;
  const compareAtPrice =
    selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const discount = getDiscount(price, compareAtPrice);
  const descriptionLines = getDescriptionLines(product.description);
  const cartProduct: Product = {
    id: selectedVariant ? `${product.id}:${selectedVariant.id}` : product.id,
    name: selectedVariant
      ? `${product.shortName} - ${selectedVariant.name}`
      : product.shortName,
    category: product.category,
    price,
    image: selectedVariant?.image ?? product.image,
    slug: product.slug,
    brand: product.brand,
    compareAtPrice,
    variantId: selectedVariant?.id,
    variantName: selectedVariant?.name,
  };

  useEffect(() => {
    trackAnalyticsEvent("product_detail_view", {
      sectionId: "product-detail",
      elementId: "product-detail-page",
      productId: product.id,
      productName: product.shortName,
      category: product.category,
      brand: product.brand,
      audience: product.audience,
      price,
      metadata: {
        variantCount: product.variants.length,
        imageCount: images.length,
      },
    });
  }, [
    images.length,
    price,
    product.audience,
    product.brand,
    product.category,
    product.id,
    product.shortName,
    product.variants.length,
  ]);

  const selectVariant = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id);
    if (variant.image) {
      setSelectedImage(variant.image);
    }
    trackAnalyticsEvent("variant_selected", {
      sectionId: "product-detail",
      elementId: "variant-option",
      productId: product.id,
      productName: product.shortName,
      category: product.category,
      brand: product.brand,
      audience: product.audience,
      price: variant.price,
      metadata: {
        variantId: variant.id,
        variantName: variant.name,
      },
    });
  };

  const addToCart = (mode: "add" | "buy") => {
    addItem(cartProduct, quantity);
    trackAnalyticsEvent(mode === "buy" ? "buy_now" : "add_to_cart", {
      sectionId: "product-detail",
      elementId: mode === "buy" ? "buy-now" : "add-to-cart",
      productId: product.id,
      productName: product.shortName,
      category: product.category,
      brand: product.brand,
      audience: product.audience,
      price,
      quantity,
      cartValue: price * quantity,
      metadata: {
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
      },
    });
    setNotice(
      mode === "buy"
        ? "Đã thêm vào giỏ, sẵn sàng thanh toán nhanh."
        : "Đã thêm vào giỏ.",
    );
  };

  return (
    <StorefrontPageShell>
      <main className="pb-28 lg:pb-0" data-track-section="product-detail">
        <section className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#0c595b] shadow-sm transition hover:text-[#ff4f3c]"
          >
            <ChevronLeft className="size-4" />
            Quay lại sản phẩm
          </Link>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <div className="min-w-0 rounded-[32px] border border-[#d3e9e5] bg-white p-4 shadow-[0_24px_80px_rgba(7,63,66,0.08)] sm:p-6">
              <div className="grid gap-4 md:grid-cols-[92px_minmax(0,1fr)]">
                <div className="order-2 flex gap-2 overflow-x-auto pb-1 md:order-1 md:flex-col md:overflow-visible md:pb-0">
                  {images.slice(0, 8).map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`size-20 shrink-0 rounded-2xl border bg-[#f4faf8] p-2 transition md:size-[86px] ${
                        selectedImage === image
                          ? "border-[#ff4f3c]"
                          : "border-[#d8e8e5] hover:border-[#0d7773]"
                      }`}
                    >
                      <img
                        src={image}
                        alt={product.shortName}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>

                <div className="order-1 min-w-0 overflow-hidden rounded-[28px] bg-[#eef8f6] p-6 md:order-2">
                  <div className="relative aspect-square">
                    {discount > 0 ? (
                      <span className="absolute top-0 left-0 z-10 rounded-full bg-[#ff4f3c] px-4 py-2 text-sm font-black text-white">
                        Tiết kiệm {discount}%
                      </span>
                    ) : null}
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt={product.shortName}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="grid h-full place-items-center rounded-3xl bg-white text-5xl font-black text-[#9cc7c1]">
                        3F
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-[32px] border border-[#d3e9e5] bg-white p-5 shadow-[0_24px_80px_rgba(7,63,66,0.08)] sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#e9f8f5] px-3 py-1 text-xs font-black text-[#0d7773]">
                    {product.category}
                  </span>
                  <span className="rounded-full bg-[#fff4e7] px-3 py-1 text-xs font-black text-[#bb6a00]">
                    {audienceLabel[product.audience]}
                  </span>
                  {product.brand ? (
                    <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-black text-[#4b5563]">
                      {product.brand}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-4 text-3xl leading-tight font-black tracking-normal text-[#073f42] sm:text-4xl">
                  {product.shortName}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-bold text-[#66817f]">
                  <span className="inline-flex items-center gap-1 text-[#f4b400]">
                    <Star className="size-4" fill="currentColor" />
                    4.9
                  </span>
                  <span>Đã bán {product.sold || 120}+</span>
                  <span>Giao nhanh trong ngày</span>
                </div>

                <div className="mt-5 rounded-[24px] bg-[#f5fbfa] p-4">
                  {compareAtPrice ? (
                    <p className="text-base font-bold text-[#9aa7a5] line-through">
                      {formatCurrency(compareAtPrice)}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap items-end gap-3">
                    <p className="text-4xl font-black text-[#111827]">
                      {formatCurrency(price)}
                    </p>
                    {discount > 0 ? (
                      <span className="mb-2 rounded-full bg-[#ff4f3c] px-3 py-1 text-sm font-black text-white">
                        -{discount}%
                      </span>
                    ) : null}
                  </div>
                </div>

                {product.variants.length > 0 ? (
                  <div className="mt-5">
                    <p className="mb-3 text-sm font-black text-[#073f42]">
                      Chọn phân loại
                    </p>
                    <div className="grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                      {product.variants.slice(0, 16).map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          data-testid="variant-option"
                          aria-pressed={selectedVariant?.id === variant.id}
                          onClick={() => selectVariant(variant)}
                          className={`min-w-0 rounded-2xl border px-3 py-3 text-left text-sm leading-5 font-extrabold transition ${
                            selectedVariant?.id === variant.id
                              ? "border-[#ff4f3c] bg-[#fff0ee] text-[#073f42]"
                              : "border-[#d9e9e6] bg-white text-[#426765] hover:border-[#0d7773]"
                          }`}
                        >
                          <span className="line-clamp-2">{variant.name}</span>
                          <span className="mt-1 block text-[#ff4f3c]">
                            {formatCurrency(variant.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <label className="shrink-0">
                    <span className="mb-2 block text-sm font-black text-[#073f42]">
                      Số lượng
                    </span>
                    <div className="flex h-12 w-full items-center rounded-full border border-[#d7e8e5] bg-white sm:w-36">
                      <button
                        type="button"
                        aria-label="Giảm số lượng"
                        onClick={() =>
                          setQuantity((current) => clampQuantity(current - 1))
                        }
                        className="grid size-12 place-items-center text-[#0d7773]"
                      >
                        <Minus className="size-4" />
                      </button>
                      <input
                        aria-label="Số lượng"
                        value={quantity}
                        onChange={(event) =>
                          setQuantity(clampQuantity(Number(event.target.value)))
                        }
                        className="min-w-0 flex-1 bg-transparent text-center text-sm font-black text-[#073f42] outline-none"
                      />
                      <button
                        type="button"
                        aria-label="Tăng số lượng"
                        onClick={() =>
                          setQuantity((current) => clampQuantity(current + 1))
                        }
                        className="grid size-12 place-items-center text-[#0d7773]"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </label>

                  <div className="grid flex-1 gap-3 sm:grid-cols-2 sm:items-end">
                    <button
                      type="button"
                      onClick={() => addToCart("add")}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#ff4f3c] bg-white px-5 text-sm font-black text-[#ff4f3c] transition hover:bg-[#fff0ee]"
                    >
                      <ShoppingBag className="size-5" />
                      Thêm vào giỏ
                    </button>
                    <button
                      type="button"
                      onClick={() => addToCart("buy")}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#ff4f3c] px-5 text-sm font-black text-white shadow-[0_14px_35px_rgba(255,79,60,0.25)] transition hover:bg-[#e84231]"
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>

                {notice ? (
                  <p className="mt-4 rounded-2xl bg-[#e7fbf7] px-4 py-3 text-sm font-extrabold text-[#0b6b68]">
                    {notice}
                  </p>
                ) : null}

                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  <TrustBadge
                    icon={<Truck className="size-5" />}
                    label="Giao nhanh"
                  />
                  <TrustBadge
                    icon={<ShieldCheck className="size-5" />}
                    label="Đổi trả dễ"
                  />
                  <TrustBadge
                    icon={<BadgeCheck className="size-5" />}
                    label="Tư vấn đúng"
                  />
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-[32px] border border-[#d3e9e5] bg-white p-5 shadow-[0_18px_60px_rgba(7,63,66,0.06)] sm:p-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e7fbf7] px-4 py-2 text-sm font-black text-[#0b6b68]">
                <Sparkles className="size-4" />
                Thông tin sản phẩm
              </div>
              <h2 className="text-2xl font-black text-[#073f42]">
                Thông tin sản phẩm
              </h2>
              <div className="mt-5 grid gap-3 text-sm leading-7 font-semibold text-[#426765]">
                {descriptionLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-[#d3e9e5] bg-white p-5 shadow-[0_18px_60px_rgba(7,63,66,0.06)] sm:p-7">
              <h2 className="text-2xl font-black text-[#073f42]">
                Điểm chốt đơn nhanh
              </h2>
              <div className="mt-5 grid gap-3">
                {[
                  "Chọn đúng phân loại trước khi đặt.",
                  "Phù hợp mua lẻ hoặc gom combo theo tuần.",
                  "3FStore hỗ trợ tư vấn theo giống, tuổi và nhu cầu.",
                  "Đóng gói kỹ, ưu tiên sản phẩm còn hạn dùng tốt.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-2xl bg-[#f5fbfa] p-4 text-sm leading-6 font-bold text-[#426765]"
                  >
                    <PackageCheck className="mt-0.5 size-5 shrink-0 text-[#0d7773]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {relatedProducts.length > 0 ? (
            <section className="mt-6 rounded-[32px] border border-[#d3e9e5] bg-white p-5 shadow-[0_18px_60px_rgba(7,63,66,0.06)] sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black text-[#073f42]">
                  Sản phẩm nên mua kèm
                </h2>
                <Link
                  href="/products"
                  className="rounded-full border border-[#d7e8e5] px-4 py-2 text-sm font-black text-[#073f42] transition hover:border-[#ff4f3c] hover:text-[#ff4f3c]"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    className="group rounded-[24px] border border-[#d9e9e6] bg-[#f8fcfb] p-4 transition hover:border-[#ff4f3c]"
                  >
                    <div className="aspect-square rounded-2xl bg-white p-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.shortName}
                          className="h-full w-full object-contain transition group-hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <p className="mt-3 line-clamp-2 min-h-[44px] text-sm leading-5 font-black text-[#073f42]">
                      {item.shortName}
                    </p>
                    <p className="mt-2 text-lg font-black text-[#ff4f3c]">
                      {formatCurrency(item.price)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d5e8e4] bg-white/95 p-3 shadow-[0_-18px_40px_rgba(7,63,66,0.12)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-[720px] items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-[#66817f]">Tổng tạm tính</p>
              <p className="truncate text-xl font-black text-[#111827]">
                {formatCurrency(price * quantity)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => addToCart("buy")}
              className="h-12 shrink-0 rounded-full bg-[#ff4f3c] px-6 text-sm font-black text-white shadow-[0_14px_35px_rgba(255,79,60,0.25)]"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </main>
    </StorefrontPageShell>
  );
}

function TrustBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex min-h-16 items-center gap-2 rounded-2xl bg-[#f5fbfa] px-3 text-sm font-black text-[#0c595b]">
      {icon}
      <span>{label}</span>
    </div>
  );
}
