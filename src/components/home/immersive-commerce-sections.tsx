"use client";

import { useCallback, useMemo } from "react";
import gsap from "gsap";
import {
  ArrowRight,
  PackageCheck,
  PawPrint,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useGsapContext } from "@/hooks/use-gsap-context";
import { trackAnalyticsEvent } from "@/lib/analytics/tracker";
import type { ProductPreview } from "@/types/product";

type NeedCard = {
  id: string;
  title: string;
  copy: string;
  href: string;
  category: string;
  color: string;
  icon: typeof PawPrint;
};

const needCards: NeedCard[] = [
  {
    id: "meal",
    title: "Bữa ăn",
    copy: "Pate, hạt và topping dễ chọn theo khẩu vị.",
    href: "/products?category=Pate+%26+th%E1%BB%A9c+%C4%83n+%C6%B0%E1%BB%9Bt",
    category: "Pate & thức ăn ướt",
    color: "#ff4f3c",
    icon: ShoppingBag,
  },
  {
    id: "litter",
    title: "Vệ sinh",
    copy: "Cát vón nhanh, ít bụi, kiểm soát mùi tốt.",
    href: "/products?category=C%C3%A1t+v%E1%BB%87+sinh",
    category: "Cát vệ sinh",
    color: "#0b7773",
    icon: PackageCheck,
  },
  {
    id: "snack",
    title: "Món thưởng",
    copy: "Snack nhỏ gọn cho lúc tập lệnh hoặc dỗ bé.",
    href: "/products?category=Snack+%26+b%C3%A1nh+th%C6%B0%E1%BB%9Fng",
    category: "Snack & bánh thưởng",
    color: "#f4b400",
    icon: PawPrint,
  },
  {
    id: "care",
    title: "Chăm lông",
    copy: "Sữa tắm, lược chải và đồ vệ sinh tại nhà.",
    href: "/products?category=Ch%C4%83m+s%C3%B3c+%26+v%E1%BB%87+sinh",
    category: "Chăm sóc & vệ sinh",
    color: "#8b5cf6",
    icon: Sparkles,
  },
  {
    id: "service",
    title: "Dịch vụ",
    copy: "Grooming, giao nhanh và tư vấn khẩu phần.",
    href: "/#services",
    category: "Dịch vụ",
    color: "#ff7a45",
    icon: Scissors,
  },
];

const serviceCards = [
  {
    title: "Giao nhanh",
    copy: "Ưu tiên pate, cát, hạt và combo dùng hằng ngày.",
    value: "24h",
    icon: Truck,
  },
  {
    title: "Spa gọn",
    copy: "Tắm, cắt móng, vệ sinh tai, chăm lông theo giống.",
    value: "45-90p",
    icon: Scissors,
  },
  {
    title: "Tư vấn đúng",
    copy: "Gợi ý theo cân nặng, tuổi và thói quen ăn.",
    value: "1:1",
    icon: ShieldCheck,
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

export function ImmersiveCommerceSections({
  products,
}: {
  products: ProductPreview[];
}) {
  const productPool = useMemo(
    () => products.filter((product) => product.image).slice(0, 10),
    [products],
  );

  const cards = useMemo(
    () =>
      needCards.map((card, index) => ({
        ...card,
        product:
          productPool.find((product) => product.category === card.category) ??
          productPool[index % Math.max(productPool.length, 1)],
      })),
    [productPool],
  );

  const animate = useCallback((scope: HTMLElement) => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const revealItems = scope.querySelectorAll("[data-home-compact-reveal]");

    if (prefersReducedMotion) {
      gsap.set(revealItems, { autoAlpha: 1, y: 0, scale: 1 });
      return;
    }

    gsap.set(revealItems, { autoAlpha: 0, y: 24, scale: 0.98 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        gsap.to(revealItems, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.68,
          ease: "power3.out",
          stagger: 0.055,
        });
        observer.disconnect();
      },
      { threshold: 0.16 },
    );

    observer.observe(scope);
    return () => observer.disconnect();
  }, []);

  const scopeRef = useGsapContext<HTMLDivElement>(animate);

  if (productPool.length === 0) {
    return null;
  }

  return (
    <div ref={scopeRef} className="bg-[#fbfffe] text-[#073f42]">
      <section
        id="care-journey"
        data-track-section="care-journey"
        className="py-8 sm:py-12"
        aria-labelledby="shop-by-need-title"
      >
        <div className="mx-auto max-w-[1160px] px-4 sm:px-0">
          <div
            data-home-compact-reveal
            className="mb-4 flex items-end justify-between gap-4 sm:mb-6"
          >
            <div>
              <p className="text-[12px] font-black tracking-[0.08em] text-[#ff4f3c] uppercase">
                Shop theo nhu cầu
              </p>
              <h2
                id="shop-by-need-title"
                className="mt-1 text-[30px] leading-none font-black tracking-[-0.045em] sm:text-[44px]"
              >
                Cần gì, chọn đó.
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden h-10 shrink-0 items-center gap-2 rounded-full border border-[#d7e8e5] bg-white px-4 text-sm font-black transition hover:border-[#ff4f3c] hover:text-[#ff4f3c] sm:inline-flex"
            >
              Xem sản phẩm
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
            {cards.map((card) => (
              <NeedTile key={card.id} card={card} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="services"
        data-track-section="services"
        className="pb-12 sm:pb-16"
        aria-labelledby="service-proof-title"
      >
        <div className="mx-auto grid max-w-[1160px] gap-4 px-4 sm:px-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div
            data-home-compact-reveal
            className="relative overflow-hidden rounded-[26px] bg-[#073f42] p-5 text-white shadow-[0_26px_70px_rgba(7,63,66,0.18)] sm:rounded-[32px] sm:p-7"
          >
            <div className="pointer-events-none absolute top-6 right-6 size-28 rounded-full bg-[#bde9e2]/18" />
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-black text-[#ffb39f]">
              <Scissors className="size-4" aria-hidden />
              3FCARE
            </p>
            <h2
              id="service-proof-title"
              className="mt-4 max-w-[460px] text-[34px] leading-[0.98] font-black tracking-[-0.045em] sm:text-[48px]"
            >
              Giao nhanh, spa gọn, tư vấn đúng.
            </h2>
            <div className="mt-6 grid gap-3">
              {serviceCards.map((service) => (
                <ServiceRow key={service.title} service={service} />
              ))}
            </div>
            <Link
              href="/products"
              data-track-action="true"
              data-track-category="Dịch vụ"
              data-track-id="services:cta"
              data-track-section="services"
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#ff4f3c] px-5 text-sm font-black text-white transition hover:bg-[#e94427]"
              onClick={() =>
                trackAnalyticsEvent("service_interest", {
                  sectionId: "services",
                  elementId: "services:cta",
                  category: "Dịch vụ",
                })
              }
            >
              Chọn món cho boss
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div
            id="proof"
            data-track-section="proof"
            className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:self-start"
          >
              {productPool.slice(0, 4).map((product) => (
                <ProductMiniTile key={product.id} product={product} />
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function NeedTile({
  card,
}: {
  card: NeedCard & { product?: ProductPreview };
}) {
  const Icon = card.icon;

  return (
    <Link
      href={card.href}
      data-home-compact-reveal
      data-track-action="true"
      data-track-category={card.category}
      data-track-id={`need:${card.id}`}
      data-track-product-id={card.product?.id}
      data-track-product-name={card.product?.shortName}
      data-track-section="care-journey"
      className="group grid min-h-[250px] w-[235px] shrink-0 snap-start grid-rows-[auto_1fr_auto] overflow-hidden rounded-[22px] border border-[#d9e9e6] bg-white p-4 shadow-[0_16px_42px_rgba(7,63,66,0.07)] transition hover:-translate-y-0.5 hover:border-[#ff9b8e] sm:w-auto"
      onClick={() =>
        trackAnalyticsEvent("product_click", {
          sectionId: "care-journey",
          elementId: `need:${card.id}`,
          productId: card.product?.id,
          productName: card.product?.shortName,
          category: card.category,
          price: card.product?.price,
        })
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="grid size-11 place-items-center rounded-[14px] text-white"
          style={{ backgroundColor: card.color }}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <ArrowRight className="size-5 text-[#8aa09d] transition group-hover:translate-x-0.5 group-hover:text-[#ff4f3c]" />
      </div>

      <div className="mt-4">
        <h3 className="text-[24px] leading-none font-black tracking-[-0.04em]">
          {card.title}
        </h3>
        <p className="mt-2 text-sm leading-6 font-bold text-[#5d7977]">
          {card.copy}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-[74px_1fr] items-center gap-3 rounded-[18px] bg-[#f5fbfa] p-2.5">
        <div className="relative size-[74px] rounded-[14px] bg-white">
          {card.product?.image ? (
            <Image
              src={card.product.image}
              alt={card.product.shortName}
              fill
              sizes="74px"
              className="object-contain p-2"
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-xs leading-5 font-black">
            {card.product?.shortName ?? card.category}
          </p>
          {card.product ? (
            <p className="mt-1 text-sm font-black text-[#ff4f3c]">
              {formatCurrency(card.product.price)}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function ServiceRow({ service }: { service: (typeof serviceCards)[number] }) {
  const Icon = service.icon;

  return (
    <div className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-[18px] bg-white/9 p-3 ring-1 ring-white/10">
      <span className="grid size-12 place-items-center rounded-[16px] bg-white text-[#073f42]">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-base leading-none font-black">
          {service.title}
        </span>
        <span className="mt-1 line-clamp-2 block text-xs leading-5 font-bold text-[#bde9e2]">
          {service.copy}
        </span>
      </span>
      <span className="rounded-full bg-[#ff7558] px-3 py-1.5 text-xs font-black text-white">
        {service.value}
      </span>
    </div>
  );
}

function ProductMiniTile({ product }: { product: ProductPreview }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      data-home-compact-reveal
      data-track-action="true"
      data-track-category={product.category}
      data-track-id={`proof:product:${product.id}`}
      data-track-price={product.price}
      data-track-product-id={product.id}
      data-track-product-name={product.shortName}
      data-track-section="proof"
      className="group rounded-[18px] border border-[#d9e9e6] bg-white p-2.5 shadow-[0_12px_32px_rgba(7,63,66,0.06)] transition hover:border-[#ff4f3c]"
    >
      <div className="relative aspect-square rounded-[14px] bg-[#f5fbfa]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.shortName}
            fill
            sizes="160px"
            className="object-contain p-2 transition group-hover:scale-105"
          />
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 min-h-9 text-xs leading-[1.45] font-black">
        {product.shortName}
      </p>
      <p className="mt-1 text-sm font-black text-[#ff4f3c]">
        {formatCurrency(product.price)}
      </p>
    </Link>
  );
}
