"use client";

import Image from "next/image";
import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import {
  ArrowUpRight,
  ChevronDown,
  Heart,
  Mail,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGsapContext } from "@/hooks/use-gsap-context";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types/product";

const heroProduct: Product = {
  id: "pate-ca-ngu-3f",
  name: "Pate cá ngừ 3F",
  category: "Thức ăn mèo",
  price: 59000,
  accent: "bg-[#ff4f2e]",
};

const productPicks = [
  {
    name: "Pate cá ngừ",
    label: "CÁ",
    className: "border-[#138a8d] bg-[#d7f4ef]",
    can: "from-[#ffe26b] via-[#f2b24e] to-[#e55c32]",
  },
  {
    name: "Súp gà",
    label: "SÚP",
    className: "border-[#ff7256] bg-[#fff0e9]",
    can: "from-[#8ee2d2] via-[#49b8a9] to-[#247d74]",
  },
  {
    name: "Hạt dinh dưỡng",
    label: "HẠT",
    className: "border-[#9c55ff] bg-[#f2eaff]",
    can: "from-[#f6efe3] via-[#c6b5ff] to-[#7357dc]",
  },
];

const primaryNav = ["Sản phẩm", "Ưu đãi", "Thế giới 3F", "Dịch vụ", "Cẩm nang"];

const utilityNav = ["Giao hàng", "Đổi trả", "Hỏi đáp"];

export function PetStoreHero() {
  const addItem = useCartStore((state) => state.addItem);
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  const animate = useCallback((scope: HTMLElement) => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const shouldSkipIntro =
      window.location.search.includes("skipIntro=1") ||
      window.location.hash === "#bundle-save";
    const intro = scope.querySelector<HTMLElement>("[data-page-intro]");
    const animatedPageElements = scope.querySelectorAll(
      "[data-header], [data-hero-visual], [data-main-pet], [data-side-pet], [data-headline-line], [data-reveal], [data-pop]",
    );
    const showPageImmediately = () => {
      gsap.set(animatedPageElements, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        yPercent: 0,
        scale: 1,
        clearProps: "transform,opacity,visibility",
      });
    };

    if (prefersReducedMotion || shouldSkipIntro) {
      gsap.set(intro, { display: "none" });
      showPageImmediately();
      return;
    }

    const introLeftPanel = scope.querySelector<HTMLElement>(
      "[data-intro-panel-left]",
    );
    const introRightPanel = scope.querySelector<HTMLElement>(
      "[data-intro-panel-right]",
    );
    const introLogo = scope.querySelector<HTMLElement>("[data-intro-logo]");
    const introTagline = scope.querySelector<HTMLElement>(
      "[data-intro-tagline]",
    );
    const introLine = scope.querySelector<HTMLElement>("[data-intro-line]");
    const previousBodyOverflow = document.body.style.overflow;
    let fallbackTimeout: number | undefined;
    let timeline: gsap.core.Timeline | null = null;

    document.body.style.overflow = "hidden";

    const releasePage = () => {
      if (fallbackTimeout) {
        window.clearTimeout(fallbackTimeout);
        fallbackTimeout = undefined;
      }
      document.body.style.overflow = previousBodyOverflow;
    };

    fallbackTimeout = window.setTimeout(() => {
      timeline?.progress(1).kill();
      showPageImmediately();
      gsap.set(intro, { display: "none" });
      releasePage();
    }, 4500);

    timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: releasePage,
    });

    timeline
      .addLabel("intro")
      .from(
        introLogo,
        {
          autoAlpha: 0,
          scale: 0.62,
          rotation: -5,
          duration: 0.72,
          ease: "back.out(1.55)",
        },
        "intro",
      )
      .from(
        introTagline,
        {
          autoAlpha: 0,
          y: 16,
          duration: 0.42,
        },
        "intro+=0.32",
      )
      .fromTo(
        introLine,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.62,
          ease: "power3.inOut",
        },
        "intro+=0.34",
      )
      .to(
        scope.querySelector("[data-intro-content]"),
        {
          autoAlpha: 0,
          y: -18,
          duration: 0.34,
          ease: "power2.in",
        },
        "intro+=1.1",
      )
      .addLabel("open", "intro+=1.25")
      .to(
        introLeftPanel,
        {
          xPercent: -100,
          duration: 0.82,
          ease: "power4.inOut",
        },
        "open",
      )
      .to(
        introRightPanel,
        {
          xPercent: 100,
          duration: 0.82,
          ease: "power4.inOut",
        },
        "open",
      )
      .from(
        scope.querySelector("[data-hero-visual]"),
        {
          scale: 0.985,
          opacity: 0,
          duration: 0.75,
        },
        "open+=0.25",
      )
      .from(
        scope.querySelector("[data-header]"),
        {
          y: -20,
          opacity: 0,
          duration: 0.58,
        },
        "open+=0.34",
      )
      .from(
        scope.querySelectorAll("[data-main-pet], [data-side-pet]"),
        {
          y: 38,
          scale: 0.9,
          opacity: 0,
          duration: 0.92,
          stagger: 0.12,
          ease: "power4.out",
        },
        "open+=0.42",
      )
      .from(
        scope.querySelectorAll("[data-headline-line]"),
        {
          yPercent: 115,
          duration: 0.78,
          stagger: 0.09,
          ease: "power4.out",
        },
        "open+=0.5",
      )
      .from(
        scope.querySelectorAll("[data-reveal]"),
        {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
        },
        "open+=0.52",
      )
      .from(
        scope.querySelectorAll("[data-pop]"),
        {
          scale: 0.65,
          opacity: 0,
          duration: 0.58,
          stagger: 0.08,
          ease: "back.out(1.55)",
        },
        "open+=0.72",
      )
      .set(intro, { display: "none" });

    gsap.to(scope.querySelectorAll("[data-float]"), {
      y: -12,
      rotate: 2,
      duration: 2.35,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.16,
    });

    const heroVisual = scope.querySelector<HTMLElement>("[data-hero-visual]");
    const mainPet = scope.querySelector<HTMLElement>("[data-main-pet]");
    const sidePet = scope.querySelector<HTMLElement>("[data-side-pet]");

    if (!heroVisual || !mainPet || !sidePet) {
      return releasePage;
    }

    const moveMainX = gsap.quickTo(mainPet, "x", {
      duration: 0.7,
      ease: "power3.out",
    });
    const moveMainY = gsap.quickTo(mainPet, "y", {
      duration: 0.7,
      ease: "power3.out",
    });
    const moveSideX = gsap.quickTo(sidePet, "x", {
      duration: 0.8,
      ease: "power3.out",
    });
    const moveSideY = gsap.quickTo(sidePet, "y", {
      duration: 0.8,
      ease: "power3.out",
    });

    const handlePointerMove = (event: PointerEvent) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      moveMainX(x * 14);
      moveMainY(y * 12);
      moveSideX(x * -12);
      moveSideY(y * -10);
    };

    const handlePointerLeave = () => {
      moveMainX(0);
      moveMainY(0);
      moveSideX(0);
      moveSideY(0);
    };

    heroVisual.addEventListener("pointermove", handlePointerMove);
    heroVisual.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      releasePage();
      heroVisual.removeEventListener("pointermove", handlePointerMove);
      heroVisual.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  const scopeRef = useGsapContext<HTMLDivElement>(animate);

  const formattedCartCount = useMemo(
    () => (cartCount > 9 ? "9+" : cartCount.toString()),
    [cartCount],
  );

  return (
    <div
      ref={scopeRef}
      className="min-h-[100dvh] bg-[#fbfffe] px-4 py-5 text-[#083f42] sm:px-6 lg:px-7"
    >
      <div
        data-page-intro
        className="fixed inset-0 z-[100] overflow-hidden motion-reduce:hidden"
        aria-hidden="true"
      >
        <div
          data-intro-panel-left
          className="absolute inset-y-0 left-0 w-1/2 bg-[#073f42] will-change-transform"
        />
        <div
          data-intro-panel-right
          className="absolute inset-y-0 right-0 w-1/2 bg-[#0a5558] will-change-transform"
        />

        <div
          data-intro-content
          className="absolute inset-0 z-10 grid place-items-center text-white will-change-transform"
        >
          <div className="flex flex-col items-center">
            <div
              data-intro-logo
              className="relative h-[116px] w-[210px] overflow-hidden rounded-[24px] bg-white shadow-[0_26px_60px_rgba(0,0,0,0.22)] will-change-transform sm:h-[142px] sm:w-[260px]"
            >
              <Image
                src="/logo/logo.webp"
                alt=""
                fill
                sizes="260px"
                className="object-contain p-3 sm:p-4"
                priority
              />
            </div>

            <p
              data-intro-tagline
              className="mt-6 text-sm font-bold text-[#bde9e2] sm:text-base"
            >
              Tốt hơn mỗi ngày cho thú cưng
            </p>

            <span className="mt-7 block h-0.5 w-44 overflow-hidden rounded-full bg-white/15 sm:w-56">
              <span
                data-intro-line
                className="block h-full origin-left rounded-full bg-[#ff7558] will-change-transform"
              />
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1880px]">
        <header data-header className="mb-6 bg-white">
          <div className="grid min-h-16 items-center gap-5 lg:grid-cols-[240px_minmax(360px,1fr)_260px]">
            <a
              href="#"
              className="relative block h-[68px] w-[170px]"
              aria-label="3FStore"
            >
              <Image
                src="/logo/logo.webp"
                alt="3FStore"
                fill
                sizes="170px"
                className="object-contain object-left"
                priority
              />
            </a>

            <div className="flex min-w-0 items-center rounded-full bg-[#f3f6f5] px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(8,63,66,0.03)] sm:px-5">
              <button
                className="flex min-w-24 items-center justify-between border-r border-[#d9e5e2] pr-3 text-sm font-bold text-[#183f41] sm:min-w-32 sm:pr-5"
                type="button"
              >
                Tất cả
                <ChevronDown className="size-4" aria-hidden />
              </button>
              <label className="sr-only" htmlFor="site-search">
                Tìm kiếm sản phẩm
              </label>
              <input
                id="site-search"
                className="min-w-0 flex-1 bg-transparent px-4 text-sm font-medium text-[#183f41] outline-none placeholder:text-[#78918f] sm:px-6"
                placeholder="Tìm pate, hạt, đồ chơi, spa thú cưng"
                type="search"
              />
            </div>

            <div className="hidden justify-self-end md:flex md:items-center md:gap-3">
              <HeaderIcon label="Tìm kiếm">
                <Search className="size-6" />
              </HeaderIcon>
              <HeaderIcon label="Tài khoản">
                <UserRound className="size-6" />
              </HeaderIcon>
              <HeaderIcon label="Giỏ hàng">
                <ShoppingBag className="size-6" />
                <span className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-[#ff3f2d] text-xs font-black text-white">
                  {formattedCartCount}
                </span>
              </HeaderIcon>
            </div>
          </div>

          <div className="mt-5 flex min-h-9 flex-wrap items-center justify-between gap-4">
            <nav className="grid w-full min-w-0 grid-cols-2 items-center gap-x-4 gap-y-3 text-sm font-black text-[#173e40] sm:flex sm:flex-wrap sm:gap-x-8 sm:text-[15px] xl:w-auto">
              {primaryNav.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#ff4f2e]"
                >
                  {item}
                  {item !== "Cẩm nang" ? (
                    <ChevronDown className="size-4" aria-hidden />
                  ) : null}
                </a>
              ))}
            </nav>

            <nav className="hidden items-center gap-7 text-[15px] font-black text-[#173e40] xl:flex">
              {utilityNav.map((item) => (
                <a key={item} href="#" className="hover:text-[#ff4f2e]">
                  {item}
                </a>
              ))}
              <a
                href="mailto:support@3fstore.vn"
                className="inline-flex items-center gap-2 rounded-full bg-[#edf9f7] px-4 py-2 hover:text-[#ff4f2e]"
              >
                <span className="grid size-6 place-items-center rounded-full bg-[#073f42] text-white">
                  <Mail className="size-4" />
                </span>
                Hỗ trợ email
              </a>
            </nav>
          </div>
        </header>

        <main
          data-hero-visual
          className="relative overflow-hidden rounded-[22px] bg-[#eafdfe] shadow-[inset_0_0_0_1px_rgba(7,88,93,0.06)] lg:min-h-[760px] xl:min-h-[805px]"
        >
          <div className="pointer-events-none absolute top-[18%] right-[13.5%] size-32 rounded-full bg-[#bde9e2]" />
          <div className="pointer-events-none absolute top-[42%] right-[5.5%] size-14 rounded-full bg-[#bde9e2]" />
          <div className="pointer-events-none absolute top-[47%] left-[72%] size-11 rounded-full bg-[#acdeda]" />
          <div className="pointer-events-none absolute top-[29%] left-[18%] hidden h-24 w-28 rounded-[34px] bg-white/20 lg:block" />
          <div className="pointer-events-none absolute bottom-[21%] left-[5%] hidden size-24 rounded-[28px] bg-white/18 lg:block" />

          <div className="grid min-h-[760px] gap-2 px-6 py-8 sm:px-10 lg:grid-cols-[41%_37%_22%] lg:px-12 lg:py-12 xl:px-16">
            <section
              className="relative order-2 min-h-[520px] lg:order-1 lg:min-h-0"
              aria-label="Thú cưng nổi bật"
            >
              <div
                data-main-pet
                className="absolute top-[2%] left-[2%] w-[77%] max-w-[520px]"
              >
                <div className="pointer-events-none absolute -bottom-8 -left-5 h-[calc(100%+46px)] w-[calc(100%+38px)] rounded-[47%_47%_43%_43%/35%_35%_47%_47%] border-2 border-[#8ed8d5]" />
                <div className="relative aspect-[0.76] overflow-hidden rounded-[47%_47%_43%_43%/35%_35%_47%_47%] bg-[#b7e6e7] shadow-[0_34px_80px_rgba(8,83,88,0.13)]">
                  <div className="absolute inset-[10px] overflow-hidden rounded-[46%_46%_42%_42%/34%_34%_46%_46%]">
                    <Image
                      src="/images/hero/cat-front-mint.png"
                      alt="Mèo xám đang nhìn trực diện"
                      fill
                      sizes="(min-width: 1280px) 600px, (min-width: 1024px) 42vw, 92vw"
                      className="object-cover object-[50%_48%]"
                      priority
                    />
                  </div>
                </div>
              </div>

              <div
                data-float
                data-pop
                className="absolute top-[6%] left-[66%] z-20 grid size-28 place-items-center rounded-full border-4 border-white bg-[#ffe19b] text-[#73590d] shadow-[0_24px_42px_rgba(132,105,20,0.16)] xl:size-32"
              >
                <ArrowUpRight
                  className="size-12"
                  strokeWidth={1.8}
                  aria-hidden
                />
              </div>

              <div
                data-pop
                className="absolute top-[3%] left-2 hidden h-20 w-16 text-[#073f42] lg:block"
                aria-hidden
              >
                <span className="absolute top-1 left-3 h-1.5 w-10 rotate-45 rounded-full bg-current" />
                <span className="absolute top-11 left-0 h-1.5 w-9 rotate-12 rounded-full bg-current" />
                <span className="absolute top-0 right-1 h-8 w-1.5 -rotate-4 rounded-full bg-current" />
              </div>
            </section>

            <section className="relative z-10 order-1 flex flex-col justify-center pt-4 lg:order-2 lg:pt-0">
              <h1 className="max-w-[760px] text-[52px] leading-[0.99] font-black tracking-normal text-[#073f42] sm:text-[72px] lg:text-[76px] xl:text-[88px]">
                <span className="block overflow-hidden">
                  <span data-headline-line className="block">
                    Chăm sóc tốt
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span data-headline-line className="block">
                    hơn cho
                  </span>
                </span>
                <span className="block overflow-hidden pb-2">
                  <span
                    data-headline-line
                    className="block font-serif text-[0.82em] whitespace-nowrap italic"
                  >
                    thú cưng.
                  </span>
                </span>
              </h1>

              <p
                data-reveal
                className="mt-6 max-w-[520px] text-lg leading-8 font-bold text-[#3a6566]"
              >
                Đồ ăn, phụ kiện và dịch vụ chăm sóc giúp thú cưng luôn khỏe mạnh
                mỗi ngày.
              </p>

              <div
                data-reveal
                className="mt-9 flex flex-wrap items-center gap-5"
              >
                <Button
                  className="h-[58px] rounded-full bg-[#ff4f2e] px-10 text-[15px] font-black text-white shadow-[0_24px_44px_rgba(255,79,46,0.24)] hover:bg-[#e94427]"
                  onClick={() => addItem(heroProduct)}
                >
                  Tất cả bộ sưu tập
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-[58px] rounded-full border-[#ff9f8c] bg-transparent text-[#ff4f2e] hover:bg-white/70"
                  aria-label="Thêm vào yêu thích"
                >
                  <Heart className="size-6" strokeWidth={1.8} />
                </Button>
              </div>

              <div
                data-reveal
                className="mt-16 flex flex-wrap items-center gap-6"
                aria-label="Sản phẩm gợi ý"
              >
                {productPicks.map((product) => (
                  <button
                    key={product.name}
                    className={cn(
                      "grid size-[86px] place-items-center rounded-full border-2 transition-transform hover:-translate-y-1",
                      product.className,
                    )}
                    aria-label={product.name}
                    type="button"
                  >
                    <ProductCan label={product.label} className={product.can} />
                  </button>
                ))}
              </div>
            </section>

            <section className="relative order-3 hidden lg:block">
              <div
                data-side-pet
                className="absolute right-[8%] bottom-[5%] w-[98%] max-w-[350px]"
              >
                <div className="relative aspect-[0.69] rounded-[50%_50%_48%_48%/34%_34%_32%_32%] border-2 border-[#e8aa32] p-[9px]">
                  <div className="relative h-full overflow-hidden rounded-[50%_50%_47%_47%/33%_33%_31%_31%]">
                    <Image
                      src="/images/hero/cat-profile-arch.png"
                      alt="Mèo xám nhìn lên"
                      fill
                      sizes="390px"
                      className="object-cover object-[52%_50%]"
                    />
                  </div>
                </div>
              </div>

              <div
                data-pop
                className="absolute right-[40%] bottom-[6%] z-20 flex w-[260px] items-center gap-3 rounded-full bg-white px-4 py-3 shadow-[0_18px_42px_rgba(10,91,89,0.14)]"
              >
                <div className="relative size-12 overflow-hidden rounded-full">
                  <Image
                    src="/images/hero/cat-front-mint.png"
                    alt="Mèo nhỏ"
                    fill
                    sizes="48px"
                    className="object-cover object-[50%_35%]"
                  />
                </div>
                <p className="text-[13px] leading-tight font-black text-[#3a6566]">
                  Lịch spa và giao hàng trong ngày
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function ProductCan({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span className="relative block h-11 w-16">
      <span className="absolute inset-x-1 top-0 h-4 rounded-[50%] bg-white/80 shadow-[inset_0_1px_4px_rgba(8,63,66,0.18)]" />
      <span
        className={cn(
          "absolute inset-x-0 top-2 h-8 rounded-[12px] bg-gradient-to-r shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]",
          className,
        )}
      >
        <span className="absolute inset-x-2 top-2 rounded-full bg-white/78 py-0.5 text-center text-[9px] font-black text-[#073f42]">
          {label}
        </span>
      </span>
      <span className="absolute inset-x-1 bottom-0 h-3 rounded-[50%] bg-[#0c4b4f]/18" />
    </span>
  );
}

function HeaderIcon({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      className="relative grid size-14 place-items-center rounded-full border border-[#d8e7e4] bg-white text-[#073f42] transition-colors hover:border-[#ffb6a5] hover:text-[#ff4f2e]"
      aria-label={label}
      type="button"
    >
      {children}
    </button>
  );
}
