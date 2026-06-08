"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import gsap from "gsap";
import {
  ArrowUpRight,
  ChevronDown,
  Mail,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { useGsapContext } from "@/hooks/use-gsap-context";
import { trackAnalyticsEvent } from "@/lib/analytics/tracker";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

const productPicks = [
  {
    id: "hero-pate-ca-ngu",
    name: "Pate cá ngừ",
    label: "CÁ",
    category: "Pate & thức ăn ướt",
    price: 59000,
    className: "border-[#138a8d] bg-[#d7f4ef]",
    can: "from-[#ffe26b] via-[#f2b24e] to-[#e55c32]",
  },
  {
    id: "hero-sup-ga",
    name: "Súp gà",
    label: "SÚP",
    category: "Snack & bánh thưởng",
    price: 49000,
    className: "border-[#ff7256] bg-[#fff0e9]",
    can: "from-[#8ee2d2] via-[#49b8a9] to-[#247d74]",
  },
  {
    id: "hero-hat-dinh-duong",
    name: "Hạt dinh dưỡng",
    label: "HẠT",
    category: "Hạt & thức ăn khô",
    price: 89000,
    className: "border-[#9c55ff] bg-[#f2eaff]",
    can: "from-[#f6efe3] via-[#c6b5ff] to-[#7357dc]",
  },
];

const primaryNav = [
  {
    label: "Sản phẩm",
    href: "/products",
    items: [
      [
        "Pate & thức ăn ướt",
        "/products?category=Pate+%26+th%E1%BB%A9c+%C4%83n+%C6%B0%E1%BB%9Bt",
      ],
      [
        "Hạt & thức ăn khô",
        "/products?category=H%E1%BA%A1t+%26+th%E1%BB%A9c+%C4%83n+kh%C3%B4",
      ],
      ["Cát vệ sinh", "/products?category=C%C3%A1t+v%E1%BB%87+sinh"],
      ["Phụ kiện", "/products?category=Ph%E1%BB%A5+ki%E1%BB%87n"],
    ],
  },
  {
    label: "Ưu đãi",
    href: "/#bundle",
    items: [
      ["Combo tiết kiệm", "/#bundle"],
      ["Sản phẩm giảm sâu", "/products?sort=sale"],
      ["Gói 5 món bán chạy", "/#bundle"],
    ],
  },
  {
    label: "Thế giới 3F",
    href: "/#proof",
    items: [
      ["Review cộng đồng", "/#proof"],
      ["Snack hot", "/#snacks"],
      ["Sản phẩm bán chạy", "/products?sort=popular"],
    ],
  },
  {
    label: "Dịch vụ",
    href: "/#services",
    items: [
      ["Spa & grooming", "/#services"],
      ["Tư vấn dinh dưỡng", "/#services"],
      ["Giao hàng trong ngày", "/#services"],
    ],
  },
  {
    label: "Cẩm nang",
    href: "/#care-journey",
    items: [
      ["Chăm mèo mới nuôi", "/#care-journey"],
      ["Chọn cát vệ sinh", "/products?category=C%C3%A1t+v%E1%BB%87+sinh"],
      ["Lịch grooming", "/#services"],
    ],
  },
] as const;

const utilityNav = ["Giao hàng", "Đổi trả", "Hỏi đáp"];

const mobileNav = [
  { label: "Sản phẩm", href: "/products", highlight: true },
  { label: "Combo", href: "/#bundle-save" },
  { label: "Review", href: "/#proof" },
  { label: "Dịch vụ", href: "/#services" },
  { label: "Cẩm nang", href: "/#care-journey" },
] as const;

export function PetStoreHero() {
  const router = useRouter();
  const lastSearchQueryRef = useRef("");
  const navCloseTimerRef = useRef<number | null>(null);
  const [openNavLabel, setOpenNavLabel] = useState<string | null>(null);
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

    const introPaws = scope.querySelectorAll<HTMLElement>("[data-intro-paw]");
    const introRings = scope.querySelectorAll<HTMLElement>("[data-intro-ring]");
    const introGlow = scope.querySelector<HTMLElement>("[data-intro-glow]");
    const introRevealPaw = scope.querySelector<HTMLElement>(
      "[data-intro-reveal-paw]",
    );
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
    }, 3200);

    timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: releasePage,
    });

    timeline
      .addLabel("intro")
      .set(introRevealPaw, { autoAlpha: 0 })
      .set(introRevealPaw, {
        xPercent: -50,
        yPercent: -50,
        scale: 0.1,
        rotation: -12,
        transformOrigin: "50% 58%",
      })
      .set(introPaws, { autoAlpha: 0, scale: 0.28, y: 36 })
      .set(introRings, { autoAlpha: 0, scale: 0.28 })
      .fromTo(
        introGlow,
        { scale: 0.58, autoAlpha: 0.16 },
        {
          scale: 1.05,
          autoAlpha: 1,
          duration: 0.78,
          ease: "sine.out",
        },
        "intro",
      )
      .to(
        introPaws,
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.22,
          stagger: 0.055,
          ease: "back.out(2.4)",
        },
        "intro+=0.04",
      )
      .to(
        introPaws,
        {
          autoAlpha: 0.58,
          scale: 0.9,
          duration: 0.34,
          stagger: 0.045,
          ease: "power2.out",
        },
        "intro+=0.46",
      )
      .to(
        introRings,
        {
          autoAlpha: 1,
          scale: 1.4,
          duration: 0.48,
          stagger: 0.06,
          ease: "power3.out",
        },
        "intro+=0.72",
      )
      .fromTo(
        introRevealPaw,
        {
          autoAlpha: 1,
          scale: 0.1,
          rotation: -12,
        },
        {
          autoAlpha: 1,
          scale: 34,
          rotation: 4,
          duration: 0.94,
          ease: "expo.inOut",
        },
        "intro+=0.82",
      )
      .to(
        [introGlow, introPaws, introRings],
        {
          autoAlpha: 0,
          duration: 0.3,
          ease: "power2.out",
        },
        "intro+=1.05",
      )
      .to(
        intro,
        {
          autoAlpha: 0,
          duration: 0.24,
          ease: "power1.out",
        },
        "intro+=1.62",
      )
      .addLabel("open", "intro+=1.46")
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

  const trackSearch = (query: string) => {
    const cleanQuery = query.trim();

    if (!cleanQuery || lastSearchQueryRef.current === cleanQuery) {
      return;
    }

    lastSearchQueryRef.current = cleanQuery;
    trackAnalyticsEvent("search_performed", {
      sectionId: "hero",
      elementId: "hero:search",
      metadata: {
        query: cleanQuery,
      },
    });
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const cleanQuery = String(formData.get("site-search") ?? "").trim();

    trackSearch(cleanQuery);
    router.push(
      cleanQuery
        ? `/products?q=${encodeURIComponent(cleanQuery)}`
        : "/products",
    );
  };

  const clearNavCloseTimer = useCallback(() => {
    if (navCloseTimerRef.current !== null) {
      window.clearTimeout(navCloseTimerRef.current);
      navCloseTimerRef.current = null;
    }
  }, []);

  const openNavDropdown = useCallback(
    (label: string) => {
      clearNavCloseTimer();
      setOpenNavLabel(label);
    },
    [clearNavCloseTimer],
  );

  const scheduleNavClose = useCallback(() => {
    clearNavCloseTimer();
    navCloseTimerRef.current = window.setTimeout(() => {
      setOpenNavLabel(null);
      navCloseTimerRef.current = null;
    }, 160);
  }, [clearNavCloseTimer]);

  return (
    <div
      ref={scopeRef}
      className="min-h-[100dvh] bg-[#fbfffe] px-3 py-2 text-[#083f42] sm:px-6 sm:py-5 lg:px-7"
    >
      <div
        data-page-intro
        className="fixed inset-0 z-[100] overflow-hidden bg-[#073f42] motion-reduce:hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(189,233,226,0.2),transparent_30%),linear-gradient(135deg,rgba(255,117,88,0.14),transparent_34%,rgba(189,233,226,0.1)_70%,transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:54px_54px]" />
        <div
          data-intro-glow
          className="absolute top-1/2 left-1/2 size-[62vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#bde9e2]/18 blur-3xl"
        />
        <IntroRevealPaw />

        <span
          data-intro-ring
          className="absolute top-1/2 left-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ffb39f]/55"
        />
        <span
          data-intro-ring
          className="absolute top-1/2 left-1/2 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#bde9e2]/35"
        />
        <span
          data-intro-ring
          className="absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/14"
        />

        <IntroPaw className="top-[82%] left-[5%] rotate-[-31deg] text-[#ffb39f]" />
        <IntroPaw className="top-[72%] left-[16%] rotate-[-22deg] text-[#bde9e2]" />
        <IntroPaw className="top-[63%] left-[27%] rotate-[-14deg] text-[#ffb39f]" />
        <IntroPaw className="top-[54%] left-[39%] rotate-[-4deg] text-[#bde9e2]" />
        <IntroPaw className="top-[44%] left-[51%] rotate-[8deg] text-[#ffb39f]" />
        <IntroPaw className="top-[34%] left-[63%] rotate-[18deg] text-[#bde9e2]" />
        <IntroPaw className="top-[24%] left-[75%] rotate-[27deg] text-[#ffb39f]" />
        <IntroPaw className="top-[16%] left-[86%] rotate-[34deg] text-[#bde9e2]" />
      </div>

      <div className="mx-auto max-w-[1880px]">
        <header
          data-header
          className="fixed inset-x-0 top-0 z-[70] mx-auto w-full max-w-[1880px] rounded-b-[18px] border-b border-[#d9ece8] bg-white/96 px-3 py-2 shadow-[0_10px_32px_rgba(7,63,66,0.10)] backdrop-blur sm:rounded-b-[24px] sm:px-4 sm:py-2.5"
        >
          <div className="grid min-h-[44px] grid-cols-[46px_minmax(0,1fr)_42px] items-center gap-2 sm:min-h-[56px] sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:gap-4 lg:grid-cols-[150px_minmax(340px,1fr)_230px]">
            <a
              href="#"
              className="relative block h-10 w-[46px] sm:h-12 sm:w-28 lg:w-36"
              aria-label="3FStore"
            >
              <Image
                src="/logo/logo.webp"
                alt="3FStore"
                fill
                sizes="(min-width: 1024px) 144px, (min-width: 640px) 112px, 46px"
                className="object-contain object-left"
                priority
              />
            </a>

            <form
              className="flex h-10 min-w-0 items-center rounded-full bg-[#f3f6f5] px-2.5 shadow-[inset_0_0_0_1px_rgba(8,63,66,0.03)] sm:h-auto sm:px-4 sm:py-2.5"
              onSubmit={handleSearchSubmit}
            >
              <button
                data-track-action="true"
                data-track-id="header:category-select"
                data-track-section="header"
                className="hidden min-w-24 items-center justify-between border-r border-[#d9e5e2] pr-3 text-sm font-bold text-[#183f41] sm:flex sm:min-w-[7.5rem] sm:pr-4"
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
                name="site-search"
                data-track-action="true"
                data-track-id="hero:search"
                data-track-section="hero"
                className="min-w-0 flex-1 bg-transparent px-1 text-[13px] font-semibold text-[#183f41] outline-none placeholder:text-[#78918f] sm:px-6 sm:text-sm"
                placeholder="Tìm pate, cát..."
                type="search"
                onBlur={(event) => trackSearch(event.currentTarget.value)}
              />
              <button
                type="submit"
                aria-label="Tìm kiếm sản phẩm"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[#073f42] shadow-sm transition hover:text-[#ff4f2e] sm:size-9"
              >
                <Search className="size-4" aria-hidden />
              </button>
            </form>

            <div className="flex justify-self-end md:items-center md:gap-2.5">
              <HeaderIcon
                className="hidden md:grid"
                href="/products"
                label="Tìm kiếm"
              >
                <Search className="size-5" />
              </HeaderIcon>
              <HeaderIcon className="hidden md:grid" label="Tài khoản">
                <UserRound className="size-5" />
              </HeaderIcon>
              <HeaderIcon
                className="size-[42px] md:size-12"
                href="/cart"
                label={`Giỏ hàng có ${cartCount} sản phẩm`}
              >
                <ShoppingBag className="size-5" />
                <span className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-[#ff3f2d] text-xs font-black text-white">
                  {formattedCartCount}
                </span>
              </HeaderIcon>
            </div>
          </div>

          <div className="mt-2 flex min-h-9 flex-wrap items-center justify-between gap-3 sm:mt-3">
            <nav
              aria-label="Menu nhanh mobile"
              className="-mx-1 flex w-full min-w-0 [scrollbar-width:none] items-center gap-2 overflow-x-auto px-1 pb-0.5 text-sm font-black whitespace-nowrap text-[#173e40] sm:hidden [&::-webkit-scrollbar]:hidden"
            >
              {mobileNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "inline-flex h-9 items-center rounded-[12px] border border-[#d7e8e5] bg-white px-3 transition-colors active:scale-[0.98]",
                    "highlight" in item && item.highlight
                      ? "border-[#ffb8aa] bg-[#fff3ef] text-[#ff4f2e]"
                      : "text-[#073f42]",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <nav className="hidden w-full min-w-0 items-center gap-x-6 text-sm font-black whitespace-nowrap text-[#173e40] sm:flex sm:flex-wrap xl:w-auto">
              {primaryNav.map((item) => {
                const isOpen = openNavLabel === item.label;

                return (
                  <div
                    key={item.label}
                    className="relative"
                    onBlur={(event) => {
                      const nextTarget = event.relatedTarget;

                      if (
                        !(nextTarget instanceof Node) ||
                        !event.currentTarget.contains(nextTarget)
                      ) {
                        scheduleNavClose();
                      }
                    }}
                    onFocus={() => openNavDropdown(item.label)}
                    onPointerEnter={() => openNavDropdown(item.label)}
                    onPointerLeave={scheduleNavClose}
                  >
                    <button
                      aria-expanded={isOpen}
                      type="button"
                      className={cn(
                        "inline-flex h-9 items-center gap-1 rounded-full bg-[#f3faf8] px-3 transition-colors hover:text-[#ff4f2e] sm:h-auto sm:bg-transparent sm:px-1.5 sm:py-1",
                        isOpen && "text-[#ff4f2e]",
                      )}
                      onClick={() =>
                        setOpenNavLabel((current) =>
                          current === item.label ? null : item.label,
                        )
                      }
                    >
                      {item.label}
                      <ChevronDown className="size-4" aria-hidden />
                    </button>
                    <div
                      className={cn(
                        "absolute top-full left-0 z-50 w-72 pt-2 transition duration-150",
                        isOpen
                          ? "visible translate-y-0 opacity-100"
                          : "pointer-events-none invisible translate-y-1 opacity-0",
                      )}
                    >
                      <div className="rounded-[24px] border border-[#d7e8e5] bg-white p-3 shadow-[0_24px_80px_rgba(7,63,66,0.16)]">
                        <div className="grid gap-1">
                          {item.items.map(([label, href]) => (
                            <Link
                              key={label}
                              href={href}
                              className="flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-black text-[#073f42] hover:bg-[#f3faf8] hover:text-[#ff4f2e]"
                            >
                              {label}
                              <ArrowUpRight className="size-4" />
                            </Link>
                          ))}
                        </div>
                        <Link
                          href={item.href}
                          className="mt-2 flex items-center justify-center rounded-full bg-[#073f42] px-4 py-2.5 text-sm font-black text-white"
                        >
                          {item.label === "Sản phẩm"
                            ? "Xem tất cả sản phẩm"
                            : `Xem ${item.label.toLowerCase()}`}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>

            <nav className="hidden items-center gap-5 text-sm font-black text-[#173e40] xl:flex">
              {utilityNav.map((item) => (
                <a key={item} href="#" className="hover:text-[#ff4f2e]">
                  {item}
                </a>
              ))}
              <a
                href="mailto:support@3fstore.vn"
                className="inline-flex items-center gap-2 rounded-full bg-[#edf9f7] px-3.5 py-1.5 hover:text-[#ff4f2e]"
              >
                <span className="grid size-6 place-items-center rounded-full bg-[#073f42] text-white">
                  <Mail className="size-4" />
                </span>
                Hỗ trợ email
              </a>
            </nav>
          </div>
        </header>

        <div
          className="h-[100px] sm:h-[128px] lg:h-[124px]"
          aria-hidden="true"
        />

        <main
          data-hero-visual
          data-track-section="hero"
          className="relative overflow-hidden rounded-[18px] bg-[#eafdfe] shadow-[inset_0_0_0_1px_rgba(7,88,93,0.06)] sm:rounded-[22px] lg:min-h-[760px] xl:min-h-[805px]"
        >
          <div className="pointer-events-none absolute top-[18%] right-[13.5%] hidden size-32 rounded-full bg-[#bde9e2] sm:block" />
          <div className="pointer-events-none absolute top-[42%] right-[5.5%] hidden size-14 rounded-full bg-[#bde9e2] sm:block" />
          <div className="pointer-events-none absolute top-[47%] left-[72%] hidden size-11 rounded-full bg-[#acdeda] sm:block" />
          <div className="pointer-events-none absolute top-[29%] left-[18%] hidden h-24 w-28 rounded-[34px] bg-white/20 lg:block" />
          <div className="pointer-events-none absolute bottom-[21%] left-[5%] hidden size-24 rounded-[28px] bg-white/18 lg:block" />

          <div className="grid min-h-0 gap-3 px-4 py-4 sm:min-h-[760px] sm:px-10 sm:py-8 lg:grid-cols-[40%_40%_20%] lg:px-12 lg:py-12 xl:px-16">
            <section
              className="relative order-2 min-h-[292px] sm:min-h-[520px] lg:order-1 lg:min-h-0"
              aria-label="Thú cưng nổi bật"
            >
              <div
                data-main-pet
                className="absolute top-1 left-1/2 w-[78%] max-w-[290px] -translate-x-1/2 sm:top-[2%] sm:left-[2%] sm:w-[77%] sm:max-w-[520px] sm:translate-x-0"
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
                data-reveal
                className="absolute right-3 bottom-3 left-3 z-30 rounded-[14px] border border-white/80 bg-white/92 p-2.5 shadow-[0_12px_28px_rgba(7,63,66,0.12)] backdrop-blur sm:hidden"
              >
                <p className="text-[13px] leading-none font-black text-[#073f42]">
                  3FStore pet shop
                </p>
                <p className="mt-1 text-[12px] leading-4 font-bold text-[#52716f]">
                  Pate, hạt, cát, snack, phụ kiện và spa.
                </p>
              </div>

              <div
                data-float
                data-pop
                className="absolute top-[2%] left-[68%] z-20 hidden size-20 place-items-center rounded-full border-4 border-white bg-[#ffe19b] text-[#73590d] shadow-[0_20px_34px_rgba(132,105,20,0.14)] sm:grid sm:top-[6%] sm:size-28 sm:shadow-[0_24px_42px_rgba(132,105,20,0.16)] xl:size-32"
              >
                <ArrowUpRight
                  className="size-9 sm:size-12"
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

            <section className="relative z-10 order-1 flex flex-col justify-center pt-1 lg:order-2 lg:pt-0">
              <div
                data-reveal
                className="mb-2 inline-flex w-fit items-center rounded-full bg-white/78 px-3 py-1.5 text-[11px] font-black tracking-[0.08em] text-[#ff4f2e] uppercase shadow-[0_10px_28px_rgba(7,63,66,0.08)] sm:mb-4 sm:text-xs"
              >
                Shop đồ ăn, phụ kiện & spa thú cưng
              </div>

              <div
                data-reveal
                className="mb-3 flex flex-wrap gap-1.5 text-[11px] font-black text-[#0b7773] sm:mb-4 sm:gap-2"
              >
                <span className="rounded-full bg-white/75 px-2.5 py-1.5">
                  Pate
                </span>
                <span className="rounded-full bg-white/75 px-2.5 py-1.5">
                  Hạt khô
                </span>
                <span className="rounded-full bg-white/75 px-2.5 py-1.5">
                  Cát vệ sinh
                </span>
                <span className="rounded-full bg-white/75 px-2.5 py-1.5">
                  Snack
                </span>
              </div>

              <h1 className="max-w-[760px] text-[31px] leading-[1.04] font-black tracking-normal text-[#073f42] sm:text-[68px] lg:text-[58px] xl:text-[74px] 2xl:text-[88px]">
                <span className="block overflow-hidden py-1">
                  <span data-headline-line className="block sm:whitespace-nowrap">
                    Đồ ăn, phụ kiện
                  </span>
                </span>
                <span className="block overflow-hidden py-1">
                  <span data-headline-line className="block sm:whitespace-nowrap">
                    và spa cho
                  </span>
                </span>
                <span className="block overflow-hidden pt-1 pb-3">
                  <span
                    data-headline-line
                    className="block font-serif text-[0.82em] sm:whitespace-nowrap italic"
                  >
                    boss.
                  </span>
                </span>
              </h1>

              <p
                data-reveal
                className="mt-1 max-w-[520px] text-[13px] leading-5 font-bold text-[#3a6566] sm:mt-6 sm:text-lg sm:leading-8"
              >
                Pate, hạt, cát vệ sinh, snack, đồ chơi và dịch vụ grooming.
                Chọn nhanh, thêm giỏ trong một chạm.
              </p>

              <div
                data-reveal
                className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-9 sm:gap-5"
              >
                <Link
                  href="/products"
                  data-track-action="true"
                  data-track-id="hero:collection-cta"
                  data-track-section="hero"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#ff4f2e] px-5 text-sm font-black text-white shadow-[0_18px_34px_rgba(255,79,46,0.22)] transition hover:bg-[#e94427] sm:h-[58px] sm:px-10 sm:text-[15px] sm:shadow-[0_24px_44px_rgba(255,79,46,0.24)]"
                >
                  Mua sắm ngay
                </Link>
                <Link
                  href="/#bundle-save"
                  data-track-action="true"
                  data-track-id="hero:bundle-cta"
                  data-track-section="hero"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#ff9f8c] bg-white/40 px-4 text-sm font-black text-[#ff4f2e] transition hover:bg-white/75 sm:h-[58px] sm:px-7 sm:text-[15px]"
                >
                  Combo tiết kiệm
                </Link>
              </div>

              <div
                data-reveal
                className="mt-8 hidden flex-wrap items-center gap-3 sm:mt-16 sm:flex sm:gap-6"
                aria-label="Sản phẩm gợi ý"
              >
                {productPicks.map((product) => (
                  <Link
                    key={product.name}
                    href={`/products?category=${encodeURIComponent(product.category)}`}
                    data-track-action="true"
                    data-track-brand="3FStore"
                    data-track-category={product.category}
                    data-track-id={`hero:pick:${product.id}`}
                    data-track-price={product.price}
                    data-track-product-id={product.id}
                    data-track-product-name={product.name}
                    data-track-section="hero"
                    className={cn(
                      "grid size-16 place-items-center rounded-full border-2 transition-transform hover:-translate-y-1 sm:size-[86px]",
                      product.className,
                    )}
                    aria-label={product.name}
                    onClick={() =>
                      trackAnalyticsEvent("product_click", {
                        sectionId: "hero",
                        elementId: `hero:pick:${product.id}`,
                        productId: product.id,
                        productName: product.name,
                        category: product.category,
                        brand: "3FStore",
                        price: product.price,
                      })
                    }
                  >
                    <ProductCan label={product.label} className={product.can} />
                  </Link>
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

function IntroPaw({ className }: { className?: string }) {
  return (
    <span
      data-intro-paw
      className={cn(
        "absolute z-[6] block size-11 text-[#ffb39f] opacity-0 drop-shadow-[0_10px_18px_rgba(0,0,0,0.12)] will-change-transform sm:size-14",
        className,
      )}
      aria-hidden="true"
    >
      <span className="absolute bottom-1 left-1/2 h-5 w-7 -translate-x-1/2 rounded-[52%_52%_48%_48%/58%_58%_42%_42%] bg-current sm:h-6 sm:w-8" />
      <span className="absolute top-1 left-2 size-3 rounded-full bg-current sm:size-3.5" />
      <span className="absolute top-0 left-1/2 size-3.5 -translate-x-1/2 rounded-full bg-current sm:size-4" />
      <span className="absolute top-1 right-2 size-3 rounded-full bg-current sm:size-3.5" />
      <span className="absolute top-4 right-0 size-2.5 rounded-full bg-current sm:size-3" />
    </span>
  );
}

function IntroRevealPaw() {
  return (
    <span
      data-intro-reveal-paw
      className="absolute top-1/2 left-1/2 z-20 block size-32 text-[#fbfffe] opacity-0 will-change-transform"
      aria-hidden="true"
    >
      <span className="absolute bottom-1 left-1/2 h-14 w-20 -translate-x-1/2 rounded-[52%_52%_48%_48%/58%_58%_42%_42%] bg-current" />
      <span className="absolute top-3 left-5 size-8 rounded-full bg-current" />
      <span className="absolute top-0 left-1/2 size-9 -translate-x-1/2 rounded-full bg-current" />
      <span className="absolute top-3 right-5 size-8 rounded-full bg-current" />
      <span className="absolute top-11 right-0 size-7 rounded-full bg-current" />
    </span>
  );
}

function HeaderIcon({
  label,
  children,
  href,
  className,
}: {
  label: string;
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  const iconClassName = cn(
    "relative grid size-12 place-items-center rounded-full border border-[#d8e7e4] bg-white text-[#073f42] transition-colors hover:border-[#ffb6a5] hover:text-[#ff4f2e]",
    className,
  );

  if (href) {
    return (
      <Link className={iconClassName} aria-label={label} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={iconClassName} aria-label={label} type="button">
      {children}
    </button>
  );
}
