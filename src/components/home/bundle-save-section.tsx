"use client";

import { useCallback, useMemo, useState } from "react";
import gsap from "gsap";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { useGsapContext } from "@/hooks/use-gsap-context";
import { trackAnalyticsEvent } from "@/lib/analytics/tracker";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { Product, ProductPreview } from "@/types/product";

type Bundle = {
  id: string;
  title: string;
  note?: string;
  itemCount: number;
  oldPrice: number;
  price: number;
  discount: string;
  highlight?: boolean;
  colors: string[];
};

const bundles: Bundle[] = [
  {
    id: "bundle-3-mon",
    title: "3 MÓN",
    itemCount: 3,
    oldPrice: 357000,
    price: 321000,
    discount: "-10%",
    colors: ["#ff5538", "#ffc23d", "#2ec4b6"],
  },
  {
    id: "bundle-5-mon",
    title: "5 MÓN",
    itemCount: 5,
    oldPrice: 595000,
    price: 505000,
    discount: "-15%",
    highlight: true,
    colors: ["#ff5538", "#ffc23d", "#25b8a7", "#2877d9", "#ff8a2a"],
  },
  {
    id: "bundle-7-mon",
    title: "7 MÓN",
    itemCount: 7,
    oldPrice: 833000,
    price: 666000,
    discount: "-20%",
    colors: [
      "#ff5538",
      "#ffc23d",
      "#25b8a7",
      "#2877d9",
      "#ff8a2a",
      "#7b5cff",
      "#00a36c",
    ],
  },
  {
    id: "bundle-10-mon",
    title: "10 MÓN",
    note: "TIẾT KIỆM NHẤT",
    itemCount: 10,
    oldPrice: 1190000,
    price: 892000,
    discount: "-25%",
    colors: [
      "#ff5538",
      "#ffc23d",
      "#25b8a7",
      "#2877d9",
      "#ff8a2a",
      "#7b5cff",
      "#00a36c",
      "#f43f5e",
      "#14b8a6",
      "#f59e0b",
    ],
  },
];

const steps = [
  {
    title: "CHỌN SẢN PHẨM",
    copy: "Pate, hạt, snack hoặc đồ chơi",
  },
  {
    title: "TIẾT KIỆM HƠN",
    copy: "Giảm giá theo số lượng",
  },
  {
    title: "THANH TOÁN",
    copy: "Giao nhanh tận nơi",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

export function BundleSaveSection({
  products,
}: {
  products: ProductPreview[];
}) {
  const [selectedBundleId, setSelectedBundleId] = useState("bundle-5-mon");
  const addItem = useCartStore((state) => state.addItem);

  const visibleProducts = useMemo(
    () => products.filter((product) => product.image).slice(0, 20),
    [products],
  );

  const selectedBundle = useMemo(
    () =>
      bundles.find((bundle) => bundle.id === selectedBundleId) ?? bundles[1],
    [selectedBundleId],
  );

  const selectedSaving = selectedBundle.oldPrice - selectedBundle.price;

  const animate = useCallback((scope: HTMLElement) => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const revealItems = scope.querySelectorAll("[data-bundle-reveal]");

    if (prefersReducedMotion) {
      gsap.set(revealItems, { autoAlpha: 1, y: 0, scale: 1 });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        gsap.fromTo(
          revealItems,
          { autoAlpha: 0, y: 28, scale: 0.98 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.72,
            stagger: 0.055,
            ease: "power3.out",
          },
        );
        observer.disconnect();
      },
      { threshold: 0.18 },
    );

    observer.observe(scope);

    return () => observer.disconnect();
  }, []);

  const scopeRef = useGsapContext<HTMLElement>(animate);

  const handleSelectBundle = (bundle: Bundle) => {
    setSelectedBundleId(bundle.id);
    trackAnalyticsEvent("bundle_selected", {
      sectionId: "bundle",
      elementId: `bundle:${bundle.itemCount}-items`,
      category: "Combo 3FStore",
      price: bundle.price,
      cartValue: bundle.price,
      metadata: {
        title: bundle.title,
        discount: bundle.discount,
        itemCount: bundle.itemCount,
      },
    });
  };

  const handleAddBundle = () => {
    const bundleProduct: Product = {
      id: selectedBundle.id,
      name: `Combo tiết kiệm ${selectedBundle.title}`,
      category: "Combo 3FStore",
      price: selectedBundle.price,
      accent: "bg-[#ff4f3c]",
    };

    addItem(bundleProduct);
    trackAnalyticsEvent("bundle_add_to_cart", {
      sectionId: "bundle",
      elementId: "bundle:add-to-cart",
      category: "Combo 3FStore",
      price: selectedBundle.price,
      quantity: 1,
      cartValue: selectedBundle.price,
      metadata: {
        title: selectedBundle.title,
        discount: selectedBundle.discount,
        itemCount: selectedBundle.itemCount,
      },
    });
    trackAnalyticsEvent("add_to_cart", {
      sectionId: "bundle",
      elementId: "bundle:add-to-cart",
      productId: selectedBundle.id,
      productName: `Combo tiết kiệm ${selectedBundle.title}`,
      category: "Combo 3FStore",
      price: selectedBundle.price,
      quantity: 1,
      cartValue: selectedBundle.price,
    });
  };

  return (
    <section
      id="bundle-save"
      ref={scopeRef}
      data-track-section="bundle"
      className="bg-[#fbfffe] py-14 text-[#1f1f1f]"
      aria-labelledby="bundle-save-title"
    >
      <div className="mx-auto max-w-[1160px]">
        <div className="relative">
          <div className="relative">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div data-bundle-reveal>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 -rotate-12 place-items-center rounded-[12px] bg-[#ff4f3c] text-[24px] font-black text-white shadow-[0_12px_24px_rgba(255,79,60,0.28)]">
                    %
                  </span>
                  <h2
                    id="bundle-save-title"
                    className="text-[34px] leading-none font-black tracking-[-0.04em] text-[#171717] italic sm:text-[48px]"
                  >
                    COMBO TIẾT KIỆM
                  </h2>
                </div>
                <p className="mt-2 text-[15px] font-semibold text-[#7e7068]">
                  Chọn nhiều, tiết kiệm nhiều!
                </p>
              </div>

              <div
                data-bundle-reveal
                className="inline-flex w-fit items-center gap-2 rounded-full border border-[#f0dcd3] bg-white px-5 py-3 text-xs font-black tracking-[0.02em] text-[#4b3930] shadow-[0_10px_30px_rgba(72,43,31,0.06)]"
              >
                <Sparkles className="size-4 text-[#ffbe3d]" aria-hidden />
                CÀNG MUA NHIỀU - GIẢM CÀNG SÂU
                <Sparkles className="size-4 text-[#ffbe3d]" aria-hidden />
              </div>
            </header>

            <div className="mt-6 grid gap-4 lg:grid-cols-[255px_minmax(0,1fr)]">
              <aside
                data-bundle-reveal
                className="rounded-[24px] bg-white/55 p-2 lg:pt-9"
                aria-label="Cách mua combo"
              >
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div
                      key={step.title}
                      className="grid grid-cols-[44px_1fr] items-center gap-3 rounded-[18px] bg-white/70 px-3 py-3"
                    >
                      <span className="grid size-9 place-items-center rounded-full bg-[#ffd7cc] text-sm font-black text-[#4f312b]">
                        {index + 1}
                      </span>
                      <span>
                        <span className="block text-[11px] font-black tracking-[0.02em] text-[#302b28]">
                          {step.title}
                        </span>
                        <span className="mt-1 block text-[11px] leading-snug font-semibold text-[#8b7b72]">
                          {step.copy}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </aside>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {bundles.map((bundle) => (
                  <BundleCard
                    key={bundle.id}
                    bundle={bundle}
                    products={visibleProducts.slice(
                      0,
                      Math.min(bundle.itemCount, 7),
                    )}
                    isSelected={selectedBundleId === bundle.id}
                    onSelect={() => handleSelectBundle(bundle)}
                  />
                ))}
              </div>
            </div>

            <div
              data-bundle-reveal
              className="mt-5 flex flex-col gap-4 rounded-[24px] border border-[#e7e0db] bg-white p-3 shadow-[0_14px_40px_rgba(54,37,27,0.06)] lg:flex-row lg:items-center lg:gap-8"
            >
              <div className="bundle-scrollbar flex max-w-full snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-3 lg:min-w-0 lg:flex-1">
                {visibleProducts.map((item) => (
                  <ProductThumb key={item.id} item={item} />
                ))}
              </div>

              <div className="flex flex-col gap-4 border-t border-[#eee3dc] pt-4 sm:flex-row sm:items-center lg:min-h-[104px] lg:shrink-0 lg:border-t-0 lg:border-l lg:border-[#eee3dc] lg:pl-9">
                <div className="min-w-[190px]">
                  <p className="text-sm font-bold text-[#87776f]">Tổng cộng:</p>
                  <p className="mt-0.5 text-[25px] leading-none font-black text-[#3b3430]">
                    {formatCurrency(selectedBundle.price)}
                  </p>
                  <p className="mt-1 text-xs font-black text-[#ff4f3c]">
                    Tiết kiệm {formatCurrency(selectedSaving)} (
                    {selectedBundle.discount.replace("-", "")})
                  </p>
                </div>

                <Button
                  data-track-action="true"
                  data-track-category="Combo 3FStore"
                  data-track-id="bundle:add-to-cart"
                  data-track-price={selectedBundle.price}
                  data-track-product-id={selectedBundle.id}
                  data-track-product-name={`Combo tiết kiệm ${selectedBundle.title}`}
                  data-track-section="bundle"
                  className="h-[62px] rounded-full bg-[#ff4f3c] px-9 text-[15px] font-black text-white shadow-[0_18px_34px_rgba(255,79,60,0.24)] hover:bg-[#ea422f]"
                  onClick={handleAddBundle}
                >
                  THÊM VÀO GIỎ
                  <ArrowRight className="size-5" aria-hidden />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BundleCard({
  bundle,
  products,
  isSelected,
  onSelect,
}: {
  bundle: Bundle;
  products: ProductPreview[];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const saving = bundle.oldPrice - bundle.price;

  return (
    <article
      data-bundle-reveal
      data-track-category="Combo 3FStore"
      data-track-id={`bundle:${bundle.itemCount}-items`}
      data-track-price={bundle.price}
      data-track-section="bundle"
      className={cn(
        "relative flex min-h-[342px] flex-col rounded-[24px] border bg-white p-4 text-center shadow-[0_14px_34px_rgba(54,37,27,0.06)] transition-all duration-300",
        isSelected
          ? "border-[#ff6b58] bg-[#fff3ef] pt-7 shadow-[0_20px_44px_rgba(255,79,60,0.15)]"
          : "border-[#e9e2dd]",
      )}
    >
      {bundle.highlight ? (
        <div className="absolute -top-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#ff4f3c] px-5 py-2 text-[11px] leading-none font-black text-white shadow-[0_10px_24px_rgba(255,79,60,0.25)]">
          BÁN CHẠY
        </div>
      ) : null}

      <div className="min-h-[46px]">
        <h3 className="text-[20px] leading-tight font-black text-[#25201d]">
          {bundle.title}
        </h3>
        {bundle.note ? (
          <p className="mt-1 text-[11px] font-black text-[#ff4f3c]">
            {bundle.note}
          </p>
        ) : null}
      </div>

      <div className="mt-2 overflow-hidden rounded-[18px] bg-[#f8f5f2] px-1 py-2">
        <BundleBox colors={bundle.colors} products={products} />
      </div>

      <div className="mt-4 flex items-end justify-center gap-2">
        <span className="text-[12px] font-bold text-[#b2aaa5] line-through">
          {formatCurrency(bundle.oldPrice)}
        </span>
        <span className="rounded-full bg-[#ff6a58] px-3 py-1 text-[11px] font-black text-white">
          {bundle.discount}
        </span>
      </div>

      <p className="mt-1 text-[25px] leading-none font-black text-[#292521]">
        {formatCurrency(bundle.price)}
      </p>
      <p className="mt-2 text-[12px] font-bold text-[#8b7b72]">
        Tiết kiệm{" "}
        <span className={isSelected ? "text-[#ff4f3c]" : "text-[#4f4640]"}>
          {formatCurrency(saving)}
        </span>
      </p>

      <button
        type="button"
        data-track-action="true"
        data-track-category="Combo 3FStore"
        data-track-id={`bundle:${bundle.itemCount}-items:select`}
        data-track-price={bundle.price}
        data-track-section="bundle"
        onClick={onSelect}
        className={cn(
          "mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-[12px] font-black transition-colors",
          isSelected
            ? "border-[#ff4f3c] bg-[#ff4f3c] text-white"
            : "border-[#ded7d2] bg-white text-[#292521] hover:border-[#ff9a88] hover:text-[#ff4f3c]",
        )}
      >
        {isSelected ? <Check className="size-4" aria-hidden /> : null}
        CHỌN GÓI
      </button>
    </article>
  );
}

function BundleBox({
  colors,
  products,
}: {
  colors: string[];
  products: ProductPreview[];
}) {
  const visibleColors = colors.slice(0, 7);
  const visibleProducts = products.slice(0, 7);

  return (
    <div
      className="relative mx-auto h-[132px] w-full max-w-[178px]"
      aria-hidden
    >
      <div className="absolute bottom-1 left-1/2 h-[60px] w-[124px] -translate-x-1/2 rounded-b-[18px] bg-[#d8643f] shadow-[0_16px_22px_rgba(88,45,25,0.18)]">
        <div className="absolute inset-x-0 top-0 h-7 rounded-t-[6px] bg-[#f27a4b]" />
        <div className="absolute inset-x-4 bottom-3 rounded-full bg-white/22 py-1 text-center text-[12px] font-black text-white">
          3F
        </div>
      </div>

      <div className="absolute right-5 bottom-[55px] h-11 w-[52px] rotate-[18deg] rounded-[11px] bg-[#c64f32]" />
      <div className="absolute bottom-[54px] left-5 h-11 w-[52px] -rotate-[18deg] rounded-[11px] bg-[#e9754a]" />

      {visibleProducts.length > 0
        ? visibleProducts.map((product, index) => {
            const offset = index - (visibleProducts.length - 1) / 2;

            return (
              <span
                key={product.id}
                className="absolute bottom-[52px] left-1/2 h-[78px] w-[48px] origin-bottom overflow-hidden rounded-[10px] border border-white bg-white shadow-[0_12px_16px_rgba(55,35,22,0.18)]"
                style={{
                  transform: `translateX(calc(-50% + ${offset * 17}px)) translateY(${Math.abs(offset) * 3}px) rotate(${offset * 5}deg)`,
                  zIndex: 10 + index,
                }}
              >
                {product.image ? (
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : null}
              </span>
            );
          })
        : visibleColors.map((color, index) => {
            const offset = index - (visibleColors.length - 1) / 2;

            return (
              <span
                key={`${color}-${index}`}
                className="absolute bottom-[48px] left-1/2 h-[62px] w-[29px] origin-bottom rounded-[7px] border border-white/70 shadow-[0_8px_12px_rgba(55,35,22,0.14)]"
                style={{
                  background: `linear-gradient(180deg, ${color}, #fff1df 128%)`,
                  transform: `translateX(calc(-50% + ${offset * 17}px)) rotate(${offset * 5}deg)`,
                  zIndex: 10 + index,
                }}
              >
                <span className="absolute inset-x-1 top-1 h-2 rounded-full bg-white/75" />
                <span className="absolute inset-x-1 bottom-2 h-5 rounded-[4px] bg-white/85" />
                <span className="absolute inset-x-2 bottom-3 h-1 rounded-full bg-[#173e40]/30" />
              </span>
            );
          })}
    </div>
  );
}

function ProductThumb({ item }: { item: ProductPreview }) {
  return (
    <button
      type="button"
      data-track-action="true"
      data-track-brand={item.brand}
      data-track-category={item.category}
      data-track-id={`bundle:thumb:${item.id}`}
      data-track-price={item.price}
      data-track-product-id={item.id}
      data-track-product-name={item.shortName}
      data-track-section="bundle"
      className="relative grid size-[76px] shrink-0 snap-start place-items-center rounded-[16px] border border-[#eee2dc] bg-[#fff8f2]"
      title={item.shortName}
      onClick={() =>
        trackAnalyticsEvent("product_click", {
          sectionId: "bundle",
          elementId: `bundle:thumb:${item.id}`,
          productId: item.id,
          productName: item.shortName,
          category: item.category,
          brand: item.brand,
          audience: item.audience,
          price: item.price,
        })
      }
    >
      <span
        aria-hidden="true"
        className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full border border-[#dcd2cc] bg-white text-[#8a7a72]"
      >
        <X className="size-3" aria-hidden />
      </span>
      <span className="relative block h-14 w-14 overflow-hidden rounded-[12px] bg-white shadow-[0_8px_14px_rgba(71,43,29,0.12)]">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.shortName}
            fill
            sizes="56px"
            className="object-contain p-1.5"
          />
        ) : null}
      </span>
    </button>
  );
}
