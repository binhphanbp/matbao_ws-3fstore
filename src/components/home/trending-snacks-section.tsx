"use client";

import { useCallback } from "react";
import gsap from "gsap";
import { ArrowRight, Flame, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useGsapContext } from "@/hooks/use-gsap-context";
import { trackAnalyticsEvent } from "@/lib/analytics/tracker";
import { useCartStore } from "@/store/cart-store";
import type { Product, ProductPreview } from "@/types/product";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

export function TrendingSnacksSection({
  products,
}: {
  products: ProductPreview[];
}) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const displayProducts = products.slice(0, 8);

  const animate = useCallback((scope: HTMLElement) => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const revealItems = scope.querySelectorAll("[data-snack-reveal]");

    if (prefersReducedMotion) {
      gsap.set(revealItems, { y: 0, scale: 1 });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        gsap.fromTo(
          revealItems,
          { y: 26, scale: 0.97 },
          {
            y: 0,
            scale: 1,
            duration: 0.72,
            ease: "power3.out",
            stagger: 0.06,
          },
        );
        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(scope);
    return () => observer.disconnect();
  }, []);

  const scopeRef = useGsapContext<HTMLElement>(animate);

  const handleAddProduct = (product: ProductPreview) => {
    const cartProduct: Product = {
      id: product.id,
      name: product.shortName,
      category: product.category,
      price: product.price,
      image: product.image,
      slug: product.slug,
      brand: product.brand,
      accent: "bg-[#ffe500]",
    };

    addItem(cartProduct);
    openCart();
    trackAnalyticsEvent("add_to_cart", {
      sectionId: "snacks",
      elementId: `snacks:add-to-cart:${product.id}`,
      productId: product.id,
      productName: product.shortName,
      category: product.category,
      brand: product.brand,
      audience: product.audience,
      price: product.price,
      quantity: 1,
      cartValue: product.price,
    });
  };

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section
      id="trending-snacks"
      ref={scopeRef}
      data-track-section="snacks"
      className="scroll-mt-10 text-[#171717]"
      aria-labelledby="trending-snacks-title"
    >
      <div className="mx-auto max-w-[1160px] px-4 sm:px-0">
        <header className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
          <div data-snack-reveal>
            <div className="flex items-center gap-2">
              <Flame
                className="size-7 fill-[#ff4b3f] text-[#ff4b3f] sm:size-9"
                aria-hidden
              />
              <h2
                id="trending-snacks-title"
                className="text-[26px] leading-none font-black tracking-[-0.035em] text-[#151515] italic sm:text-[38px]"
              >
                MÓN THƯỞNG HOT
              </h2>
            </div>
            <p className="mt-1.5 max-w-[560px] text-[13px] font-bold text-[#786b62] sm:text-[15px]">
              Snack, pate thưởng và đồ ăn vặt boss dễ mê. Chọn nhanh, thêm giỏ
              ngay.
            </p>
          </div>

          <Link
            href="/products?category=Snack+%26+b%C3%A1nh+th%C6%B0%E1%BB%9Fng"
            data-snack-reveal
            className="hidden h-10 items-center gap-2 rounded-full bg-[#ffe500] px-5 text-xs font-black text-[#1b1b16] shadow-[0_12px_22px_rgba(215,190,0,0.18)] transition hover:bg-[#f6dc00] sm:inline-flex"
          >
            Xem tất cả
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </header>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {displayProducts.map((product, index) => (
            <SnackShopCard
              key={product.id}
              product={product}
              priority={index < 4}
              onAdd={handleAddProduct}
            />
          ))}
        </div>

        <Link
          href="/products?category=Snack+%26+b%C3%A1nh+th%C6%B0%E1%BB%9Fng"
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#eadfd7] bg-white text-sm font-black text-[#073f42] sm:hidden"
        >
          Xem thêm món thưởng
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

function SnackShopCard({
  product,
  priority,
  onAdd,
}: {
  product: ProductPreview;
  priority: boolean;
  onAdd: (product: ProductPreview) => void;
}) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : 0;

  const trackProductClick = () => {
    trackAnalyticsEvent("product_click", {
      sectionId: "snacks",
      elementId: `snacks:shop-card:${product.id}`,
      productId: product.id,
      productName: product.shortName,
      category: product.category,
      brand: product.brand,
      audience: product.audience,
      price: product.price,
    });
  };

  return (
    <article
      data-snack-reveal
      data-track-action="true"
      data-track-brand={product.brand}
      data-track-category={product.category}
      data-track-id={`snacks:shop-card:${product.id}`}
      data-track-price={product.price}
      data-track-product-id={product.id}
      data-track-product-name={product.shortName}
      data-track-section="snacks"
      className="group overflow-hidden rounded-[14px] border border-[#eadfd7] bg-white shadow-[0_10px_28px_rgba(39,32,23,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(39,32,23,0.10)] sm:rounded-[16px]"
    >
      <Link
        href={`/products/${product.slug}`}
        onClick={trackProductClick}
        className="relative block aspect-square bg-[#f3f0eb]"
        aria-label={product.shortName}
      >
        {discount > 0 ? (
          <span className="absolute top-2 left-2 z-10 rounded-full bg-[#ff4b3f] px-2.5 py-1 text-[11px] font-black text-white">
            -{discount}%
          </span>
        ) : null}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.shortName}
            fill
            sizes="(min-width: 1024px) 260px, 50vw"
            priority={priority}
            className="object-cover transition duration-300 group-hover:scale-[1.035]"
          />
        ) : null}
      </Link>

      <div className="grid min-h-[148px] grid-rows-[auto_1fr_auto] p-2.5 sm:min-h-[178px] sm:p-4">
        <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
          <span
            className="min-w-0 truncate rounded-full bg-[#e6f8f4] px-2.5 py-1 text-[11px] font-black text-[#087c78]"
            title={product.category}
          >
            {displayCategoryName(product.category)}
          </span>
          <span className="shrink-0 text-xs font-black text-[#f2ae00]">
            ★ 4.8
          </span>
        </div>

        <Link href={`/products/${product.slug}`} onClick={trackProductClick}>
          <h3 className="line-clamp-2 min-h-10 text-[13px] leading-[1.25] font-black tracking-[-0.015em] text-[#083f42] sm:text-[15px]">
            {displaySnackName(product.shortName)}
          </h3>
        </Link>

        <div className="mt-2 self-end border-t border-[#edf0ee] pt-2 sm:mt-3 sm:pt-3">
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <p className="text-xs font-bold text-[#99a4a1] line-through">
              {formatCurrency(product.compareAtPrice)}
            </p>
          ) : (
            <p className="text-xs font-bold text-[#99a4a1]">Giá tốt hôm nay</p>
          )}
          <p className="mt-0.5 text-[17px] leading-none font-black text-[#07141f] sm:text-[20px]">
            {formatCurrency(product.price)}
          </p>
        </div>

        <button
          type="button"
          data-track-action="true"
          data-track-brand={product.brand}
          data-track-category={product.category}
          data-track-id={`snacks:add-to-cart:${product.id}`}
          data-track-price={product.price}
          data-track-product-id={product.id}
          data-track-product-name={product.shortName}
          data-track-section="snacks"
          className="mt-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-[12px] bg-[#ff4f3c] px-2 text-[13px] font-black text-white shadow-[0_12px_22px_rgba(255,79,60,0.18)] transition hover:bg-[#e94736] sm:h-11 sm:gap-2 sm:px-3 sm:text-sm"
          onClick={() => onAdd(product)}
        >
          <ShoppingCart className="size-4" aria-hidden />
          Thêm giỏ hàng
        </button>
      </div>
    </article>
  );
}

function displayCategoryName(category: string) {
  if (/snack|bánh thưởng/i.test(category)) {
    return "Snack";
  }

  if (/pate|ướt/i.test(category)) {
    return "Pate";
  }

  if (/hạt|khô/i.test(category)) {
    return "Hạt";
  }

  return category;
}

function compactTitle(title: string) {
  return title
    .replace(/^Deal\s+\d+-\d+\s+\S+\s+\S+\s*\|\s*/i, "")
    .replace(/\s*[|–-]\s*3F\s*Store.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function displaySnackName(title: string) {
  const cleanTitle = compactTitle(title);
  const aliases: Array<[RegExp, string]> = [
    [/master.?xcat/i, "MASTER-XCAT vị thịt sấy"],
    [/masti/i, "Masti ức gà mềm"],
    [/petq.*gà/i, "PetQ gà sấy đông khô"],
    [/ciao|churu/i, "Ciao Churu hộp đỏ"],
    [/catnip.*biscuits/i, "Catnip Biscuits Matchwell"],
    [/me-?o/i, "Me-O vị cá ngừ gà trứng"],
  ];

  const matchedAlias = aliases.find(([pattern]) => pattern.test(cleanTitle));
  return matchedAlias?.[1] ?? cleanTitle;
}
