"use client";

import { useCallback } from "react";
import gsap from "gsap";
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Heart,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { useGsapContext } from "@/hooks/use-gsap-context";
import { cn } from "@/lib/utils";
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
  const displayProducts = products.slice(0, 6);
  const leftFeature = displayProducts[0];
  const rightFeature = displayProducts[1] ?? displayProducts[0];
  const centerProducts = displayProducts.slice(2, 6);

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
  };

  if (!leftFeature || !rightFeature) {
    return null;
  }

  return (
    <section
      id="trending-snacks"
      ref={scopeRef}
      className="scroll-mt-10 text-[#171717]"
      aria-labelledby="trending-snacks-title"
    >
      <div className="mx-auto max-w-[1160px]">
        <header className="mb-4 flex items-start justify-between gap-5">
          <div data-snack-reveal>
            <div className="flex items-center gap-2">
              <Flame
                className="size-9 fill-[#ff4b3f] text-[#ff4b3f] sm:size-10"
                aria-hidden
              />
              <h2
                id="trending-snacks-title"
                className="origin-left scale-x-[0.9] text-[31px] leading-none font-black tracking-[-0.045em] text-[#151515] italic [word-spacing:0.12em] sm:text-[41px]"
              >
                SNACK HOT CHO BOSS
              </h2>
            </div>
            <p className="mt-1.5 text-[14px] font-bold text-[#786b62]">
              Món thưởng đang hot, mua ngay kẻo lỡ!
            </p>
          </div>

          <div
            data-snack-reveal
            className="hidden items-center gap-4 pt-1 sm:flex"
          >
            <Button className="h-9 rounded-full bg-[#ffe500] px-6 text-[11px] font-black text-[#1b1b16] shadow-[0_12px_22px_rgba(215,190,0,0.18)] hover:bg-[#f6dc00]">
              XEM TẤT CẢ
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="grid size-10 place-items-center rounded-full bg-white text-[#b9b4ae] shadow-[0_9px_22px_rgba(35,28,20,0.12)] transition-colors hover:text-[#171717]"
                aria-label="Sản phẩm trước"
              >
                <ArrowLeft className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                className="grid size-10 place-items-center rounded-full bg-white text-[#171717] shadow-[0_9px_22px_rgba(35,28,20,0.14)] transition-transform hover:scale-105"
                aria-label="Sản phẩm tiếp theo"
              >
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-3 lg:grid-cols-[245px_minmax(0,1fr)_245px]">
          <FeatureSnackCard
            product={leftFeature}
            tone="red"
            rotation="-rotate-[2.5deg]"
            onAdd={handleAddProduct}
          />

          <div className="grid min-h-[408px] grid-cols-1 gap-3 sm:grid-cols-2">
            {centerProducts.map((product, index) => (
              <SmallSnackCard
                key={product.id}
                product={product}
                showNew={index === 0}
                showHeart={index === centerProducts.length - 1}
                onAdd={handleAddProduct}
              />
            ))}
          </div>

          <FeatureSnackCard
            product={rightFeature}
            tone="green"
            rotation="rotate-[2.5deg]"
            onAdd={handleAddProduct}
          />
        </div>
      </div>
    </section>
  );
}

function FeatureSnackCard({
  product,
  tone,
  rotation,
  onAdd,
}: {
  product: ProductPreview;
  tone: "red" | "green";
  rotation: string;
  onAdd: (product: ProductPreview) => void;
}) {
  const isRed = tone === "red";

  return (
    <article
      data-snack-reveal
      className={cn(
        "group relative min-h-[408px] overflow-hidden rounded-[21px] border-[6px] border-white p-4 text-white shadow-[0_18px_34px_rgba(37,31,25,0.16)] will-change-transform",
        rotation,
        isRed ? "bg-[#ff6065]" : "bg-[#94bd57]",
      )}
    >
      <SnackDoodles tone={tone} />
      {!isRed ? <NewBurst className="top-[-7px] right-[-8px]" /> : null}

      <div className="relative z-10 flex h-full min-h-[364px] flex-col">
        <div className="relative mx-auto mt-1 h-[238px] w-full transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03]">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.shortName}
              fill
              sizes="240px"
              className="object-contain drop-shadow-[0_20px_16px_rgba(0,0,0,0.2)]"
            />
          ) : null}
        </div>

        <div className="mt-auto">
          <h3 className="line-clamp-3 max-w-[174px] text-[17px] leading-[1.08] font-black tracking-[-0.025em]">
            {displaySnackName(product.shortName)}
          </h3>

          <div className="mt-6 flex items-end justify-between gap-4">
            <p className="text-[18px] leading-none font-black">
              {formatCurrency(product.price)}
            </p>
            <CartButton
              product={product}
              onAdd={onAdd}
              variant="white"
              size="lg"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function SmallSnackCard({
  product,
  showNew,
  showHeart,
  onAdd,
}: {
  product: ProductPreview;
  showNew?: boolean;
  showHeart?: boolean;
  onAdd: (product: ProductPreview) => void;
}) {
  return (
    <article
      data-snack-reveal
      className="group relative min-h-[198px] rounded-[17px] border border-[#ece5df] bg-white p-3 shadow-[0_10px_24px_rgba(39,32,23,0.08)] will-change-transform"
    >
      {showNew ? <NewBurst className="top-[-16px] right-[-10px]" /> : null}

      <div className="relative h-[122px] rounded-[13px] bg-[#f1efe9]">
        <span className="absolute top-3 left-3 size-1.5 rounded-full bg-white" />
        <span className="absolute top-5 right-5 size-1 rounded-full bg-white" />
        {product.image ? (
          <Image
            src={product.image}
            alt={product.shortName}
            fill
            sizes="210px"
            className="object-contain p-2.5 drop-shadow-[0_12px_12px_rgba(0,0,0,0.12)] transition-transform duration-300 group-hover:scale-[1.06]"
          />
        ) : null}
      </div>

      <div className="mt-2.5 grid grid-cols-[1fr_38px] items-end gap-3">
        <div>
          <h3 className="line-clamp-2 min-h-[31px] text-[12px] leading-[1.2] font-extrabold tracking-[-0.01em] text-[#2b2926]">
            {displaySnackName(product.shortName)}
          </h3>
          <p className="mt-2 text-[13px] leading-none font-black text-[#171717]">
            {formatCurrency(product.price)}
          </p>
        </div>

        <CartButton product={product} onAdd={onAdd} variant="yellow" />
      </div>

      {showHeart ? (
        <div className="absolute -right-2 -bottom-3 rotate-[-17deg] text-[#ff4f47] drop-shadow-[0_4px_0_white]">
          <Heart className="size-10 fill-[#ff4f47]" aria-hidden />
        </div>
      ) : null}
    </article>
  );
}

function CartButton({
  product,
  onAdd,
  variant,
  size = "md",
}: {
  product: ProductPreview;
  onAdd: (product: ProductPreview) => void;
  variant: "white" | "yellow";
  size?: "md" | "lg";
}) {
  return (
    <button
      type="button"
      className={cn(
        "grid shrink-0 place-items-center rounded-full text-[#191714] shadow-[0_10px_22px_rgba(27,22,15,0.12)] transition-transform hover:scale-105",
        variant === "yellow" ? "bg-[#ffe500]" : "bg-white",
        size === "lg" ? "size-14" : "size-10",
      )}
      aria-label={`Thêm ${product.shortName} vào giỏ`}
      onClick={() => onAdd(product)}
    >
      <ShoppingCart className={size === "lg" ? "size-6" : "size-5"} />
    </button>
  );
}

function NewBurst({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute z-20 grid size-[60px] rotate-[-10deg] place-items-center",
        className,
      )}
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-[#ffe500]"
        style={{
          clipPath:
            "polygon(50% 0%, 58% 25%, 82% 10%, 72% 36%, 100% 42%, 75% 54%, 92% 78%, 64% 69%, 53% 100%, 43% 70%, 15% 88%, 27% 61%, 0% 50%, 27% 39%, 11% 13%, 39% 26%)",
        }}
      />
      <span className="relative text-[10px] font-black text-[#191714]">
        NEW
      </span>
    </div>
  );
}

function SnackDoodles({ tone }: { tone: "red" | "green" }) {
  if (tone === "red") {
    return (
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <span className="absolute top-10 left-8 h-16 w-5 -rotate-45 rounded-full bg-[#ffe85c]" />
        <span className="absolute top-11 left-20 h-11 w-3 rotate-[25deg] rounded-full bg-[#ffe85c]" />
        <span className="absolute top-16 right-9 h-8 w-2 rotate-[38deg] rounded-full bg-white/80" />
        <span className="absolute top-24 right-10 h-12 w-2 rotate-[38deg] rounded-full bg-white/80" />
        <span className="absolute bottom-28 left-9 h-10 w-1.5 rotate-[22deg] rounded-full bg-[#ffe85c]" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <span className="absolute top-9 left-9 size-2 rounded-full bg-white" />
      <span className="absolute top-24 right-12 size-3 rounded-full bg-white/80" />
      <span className="absolute bottom-28 left-7 h-16 w-1.5 rotate-[42deg] rounded-full bg-white/75" />
      <span className="absolute bottom-24 left-14 h-10 w-1.5 rotate-[18deg] rounded-full bg-white/75" />
      <span className="absolute right-10 bottom-24 h-12 w-2 rotate-[-24deg] rounded-full bg-[#efffd2]" />
    </div>
  );
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
