"use client";

import { useCallback, useMemo } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BadgeCheck,
  CalendarCheck,
  ChevronRight,
  Clock3,
  PackageCheck,
  PawPrint,
  Scissors,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { useGsapContext } from "@/hooks/use-gsap-context";
import { trackAnalyticsEvent } from "@/lib/analytics/tracker";
import { cn } from "@/lib/utils";
import type { ProductPreview } from "@/types/product";

type NeedCard = {
  id: string;
  eyebrow: string;
  title: string;
  copy: string;
  metric: string;
  accent: string;
  background: string;
  category?: string;
  product?: ProductPreview;
};

type RoutineStep = {
  time: string;
  title: string;
  copy: string;
  detail: string;
  icon: typeof Clock3;
  product?: ProductPreview;
};

const needCards: NeedCard[] = [
  {
    id: "daily-meal",
    eyebrow: "Bữa ăn mỗi ngày",
    title: "Ăn ngon đủ chất",
    copy: "Pate, hạt và topping theo khẩu vị của từng bé.",
    metric: "7 ngày",
    accent: "#ff4f3c",
    background: "linear-gradient(145deg, #fff4ef 0%, #ffffff 62%)",
    category: "Pate & thức ăn ướt",
  },
  {
    id: "clean-home",
    eyebrow: "Nhà sạch mùi",
    title: "Khay sạch dễ thở",
    copy: "Cát vón nhanh, ít bụi và kiểm soát mùi tốt hơn.",
    metric: "5 phút",
    accent: "#0b6f69",
    background: "linear-gradient(145deg, #e7faf7 0%, #ffffff 66%)",
    category: "Cát vệ sinh",
  },
  {
    id: "reward-snack",
    eyebrow: "Snack thưởng",
    title: "Thưởng đúng lúc",
    copy: "Snack nhỏ gọn cho lúc tập lệnh, chơi hoặc dỗ bé.",
    metric: "3 vị",
    accent: "#f5b51b",
    background: "linear-gradient(145deg, #fff7d7 0%, #ffffff 64%)",
    category: "Snack & bánh thưởng",
  },
  {
    id: "carry-play",
    eyebrow: "Đi chơi gọn",
    title: "Ra ngoài gọn nhẹ",
    copy: "Balo, đồ chơi và phụ kiện theo size của boss.",
    metric: "24h",
    accent: "#2764d8",
    background: "linear-gradient(145deg, #edf4ff 0%, #ffffff 65%)",
    category: "Phụ kiện",
  },
  {
    id: "spa-care",
    eyebrow: "Spa tại nhà",
    title: "Thơm sạch mỗi tuần",
    copy: "Sữa tắm, lược chải và chăm da lông tại nhà.",
    metric: "4 bước",
    accent: "#9b6cff",
    background: "linear-gradient(145deg, #f5eeff 0%, #ffffff 62%)",
    category: "Chăm sóc & vệ sinh",
  },
];

const serviceCards = [
  {
    title: "Grooming đặt lịch",
    copy: "Tắm, cắt móng, vệ sinh tai và chăm lông theo giống.",
    icon: Scissors,
    value: "45-90 phút",
  },
  {
    title: "Giao nhanh nội thành",
    copy: "Ưu tiên cát, pate, hạt và combo dùng hằng ngày.",
    icon: Truck,
    value: "24h",
  },
  {
    title: "Tư vấn khẩu phần",
    copy: "Gợi ý theo cân nặng, tuổi và thói quen ăn.",
    icon: ShieldCheck,
    value: "1:1",
  },
];

const testimonials = [
  {
    name: "Linh Nguyen",
    pet: "Mèo Anh lông ngắn",
    quote:
      "Mình mua combo pate và cát vệ sinh, shop gợi ý đúng loại bé nhà mình chịu ăn.",
  },
  {
    name: "Minh Tran",
    pet: "Golden Retriever",
    quote:
      "Đặt phụ kiện đi chơi cuối tuần, giao nhanh và đóng gói gọn hơn mình nghĩ.",
  },
  {
    name: "Hana Le",
    pet: "Hai bé mèo rescue",
    quote: "Phần bundle dễ chọn, giá rõ ràng, không phải tự lọc từng món nhỏ.",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

const morphBlobPath =
  "M56 2C86 4 108 32 101 64C94 99 63 116 30 106C-4 96-6 52 13 24C25 7 37 0 56 2Z";

const morphPillPath =
  "M52 7C83 7 105 30 105 59C105 88 83 111 52 111C22 111 0 88 0 59C0 30 22 7 52 7Z";

export function ImmersiveCommerceSections({
  products,
}: {
  products: ProductPreview[];
}) {
  const productPool = useMemo(
    () => products.filter((product) => product.image).slice(0, 24),
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

  const routineSteps = useMemo<RoutineStep[]>(
    () => [
      {
        time: "07:30",
        title: "Bữa sáng gọn",
        copy: "Pate hoặc hạt dễ tiêu, thêm nước và đúng lượng.",
        detail: "Ăn ngon",
        icon: Clock3,
        product:
          productPool.find(
            (product) => product.category === "Pate & thức ăn ướt",
          ) ?? productPool[0],
      },
      {
        time: "12:00",
        title: "Snack đúng lúc",
        copy: "Thưởng vừa đủ sau khi chơi hoặc tập lệnh.",
        detail: "Tập thói quen",
        icon: BadgeCheck,
        product:
          productPool.find(
            (product) => product.category === "Snack & bánh thưởng",
          ) ?? productPool[1],
      },
      {
        time: "18:30",
        title: "Khay sạch mùi",
        copy: "Thay cát đúng lúc để nhà thoáng và bé dễ chịu.",
        detail: "Sạch mùi",
        icon: PackageCheck,
        product:
          productPool.find((product) => product.category === "Cát vệ sinh") ??
          productPool[2],
      },
      {
        time: "Cuối tuần",
        title: "Spa cuối tuần",
        copy: "Chải lông, vệ sinh tai, cắt móng khi cần.",
        detail: "Khỏe da lông",
        icon: CalendarCheck,
        product:
          productPool.find(
            (product) => product.category === "Chăm sóc & vệ sinh",
          ) ?? productPool[3],
      },
    ],
    [productPool],
  );

  const animate = useCallback((scope: HTMLElement) => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    gsap.registerPlugin(
      ScrollTrigger,
      CustomEase,
      DrawSVGPlugin,
      MorphSVGPlugin,
      MotionPathPlugin,
      Observer,
    );

    const storeEase = CustomEase.create(
      "threeFStoreEase",
      "M0,0 C0.16,0.84 0.32,1 1,1",
    );

    const matchMedia = gsap.matchMedia();
    const revealItems = Array.from(
      scope.querySelectorAll<HTMLElement>("[data-world-reveal]"),
    ).filter((item) => !item.closest("[data-section-intro]"));
    const parallaxItems = Array.from(
      scope.querySelectorAll<HTMLElement>("[data-world-parallax]"),
    );
    const magneticItems = Array.from(
      scope.querySelectorAll<HTMLElement>("[data-world-magnetic]"),
    );
    const sectionIntros = Array.from(
      scope.querySelectorAll<HTMLElement>("[data-section-intro]"),
    );
    const drawLines = Array.from(
      scope.querySelectorAll<SVGPathElement>("[data-draw-line]"),
    );
    const morphBlobs = Array.from(
      scope.querySelectorAll<SVGPathElement>("[data-morph-blob]"),
    );
    const servicePaths = Array.from(
      scope.querySelectorAll<SVGPathElement>("[data-service-path]"),
    );
    const cleanupCallbacks: Array<() => void> = [];

    if (prefersReducedMotion) {
      gsap.set(
        [
          ...revealItems,
          ...sectionIntros.flatMap((intro) =>
            Array.from(intro.querySelectorAll("[data-intro-item]")),
          ),
        ],
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotate: 0,
          clearProps: "transform,opacity,visibility",
        },
      );
      gsap.set(drawLines, { drawSVG: "0% 100%" } as gsap.TweenVars);
      gsap.set(servicePaths, { drawSVG: "0% 100%" } as gsap.TweenVars);
      return;
    }

    gsap.set(revealItems, {
      autoAlpha: 0,
      y: 34,
      scale: 0.975,
      rotate: 0.001,
    });
    gsap.set(drawLines, { drawSVG: "0% 0%" } as gsap.TweenVars);
    gsap.set(servicePaths, { drawSVG: "0% 0%" } as gsap.TweenVars);

    const revealTriggers = ScrollTrigger.batch(revealItems, {
      start: "top 86%",
      once: true,
      interval: 0.08,
      batchMax: 5,
      onEnter: (batch) => {
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.82,
          ease: "power3.out",
          stagger: 0.07,
          overwrite: true,
        });
      },
    });

    cleanupCallbacks.push(() =>
      revealTriggers.forEach((trigger) => trigger.kill()),
    );

    sectionIntros.forEach((intro) => {
      const introItems =
        intro.querySelectorAll<HTMLElement>("[data-intro-item]");
      const introDrawLines =
        intro.querySelectorAll<SVGPathElement>("[data-draw-line]");

      const timeline = gsap.timeline({
        defaults: { duration: 0.72, ease: storeEase },
        scrollTrigger: {
          trigger: intro,
          start: "top 78%",
          once: true,
        },
      });

      timeline.fromTo(
        introItems,
        {
          autoAlpha: 0,
          y: 30,
          clipPath: "inset(0% 0% 18% 0%)",
        },
        {
          autoAlpha: 1,
          y: 0,
          clipPath: "inset(0% 0% 0% 0%)",
          stagger: 0.08,
        },
      );

      if (introDrawLines.length > 0) {
        timeline.to(
          introDrawLines,
          {
            drawSVG: "0% 100%",
            duration: 1.05,
            stagger: 0.08,
            ease: "power2.inOut",
          } as gsap.TweenVars,
          "-=0.36",
        );
      }
    });

    parallaxItems.forEach((item, index) => {
      gsap.to(item, {
        y: index % 2 === 0 ? -44 : 36,
        rotate: index % 2 === 0 ? -1.2 : 1.2,
        ease: "none",
        scrollTrigger: {
          trigger: item.closest("section") ?? item,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.1,
        },
      });
    });

    const careStage = scope.querySelector<HTMLElement>("[data-care-stage]");
    if (careStage) {
      const careSteps = gsap.utils.toArray<HTMLElement>(
        "[data-care-step]",
        careStage,
      );
      const careProducts = gsap.utils.toArray<HTMLElement>(
        "[data-care-product]",
        careStage,
      );
      const careProgress = careStage.querySelector<HTMLElement>(
        "[data-care-progress]",
      );
      const careOrbit =
        careStage.querySelector<HTMLElement>("[data-care-orbit]");

      const setCareStep = (activeIndex: number) => {
        careSteps.forEach((step, index) => {
          gsap.to(step, {
            autoAlpha: index === activeIndex ? 1 : 0.52,
            x: index === activeIndex ? 0 : 14,
            scale: index === activeIndex ? 1 : 0.97,
            duration: 0.52,
            ease: storeEase,
            overwrite: true,
          });
        });

        careProducts.forEach((product, index) => {
          gsap.to(product, {
            autoAlpha: index === activeIndex ? 1 : 0,
            y: index === activeIndex ? 0 : 24,
            scale: index === activeIndex ? 1 : 0.88,
            rotate: index === activeIndex ? 0 : index % 2 === 0 ? -8 : 8,
            duration: 0.62,
            ease: storeEase,
            overwrite: true,
          });
        });

        if (careProgress) {
          gsap.to(careProgress, {
            width: `${((activeIndex + 1) / careSteps.length) * 100}%`,
            duration: 0.5,
            ease: storeEase,
            overwrite: true,
          });
        }

        if (careOrbit) {
          gsap.to(careOrbit, {
            rotate: activeIndex * 34,
            duration: 0.7,
            ease: storeEase,
            overwrite: true,
          });
        }
      };

      gsap.set(careProducts, { autoAlpha: 0, y: 24, scale: 0.88 });
      setCareStep(0);

      careSteps.forEach((step, index) => {
        const trigger = ScrollTrigger.create({
          trigger: step,
          start: "top 58%",
          end: "bottom 42%",
          onEnter: () => setCareStep(index),
          onEnterBack: () => setCareStep(index),
        });

        cleanupCallbacks.push(() => trigger.kill());
      });
    }

    const serviceJourney = scope.querySelector<HTMLElement>(
      "[data-service-journey]",
    );
    const servicePath = serviceJourney?.querySelector<SVGPathElement>(
      "[data-service-path]",
    );
    const serviceDot =
      serviceJourney?.querySelector<HTMLElement>("[data-service-dot]");

    if (serviceJourney && servicePath) {
      gsap.to(servicePath, {
        drawSVG: "0% 100%",
        ease: "none",
        scrollTrigger: {
          trigger: serviceJourney,
          start: "top 72%",
          end: "bottom 52%",
          scrub: 1,
        },
      } as gsap.TweenVars);
    }

    if (serviceJourney && servicePath && serviceDot) {
      gsap.to(serviceDot, {
        motionPath: {
          path: servicePath,
          align: servicePath,
          alignOrigin: [0.5, 0.5],
        },
        ease: "none",
        scrollTrigger: {
          trigger: serviceJourney,
          start: "top 72%",
          end: "bottom 52%",
          scrub: 1,
        },
      } as gsap.TweenVars);
    }

    const marqueeTrack = scope.querySelector<HTMLElement>(
      "[data-world-marquee-track]",
    );
    if (marqueeTrack) {
      const marqueeTween = gsap.to(marqueeTrack, {
        xPercent: -50,
        duration: 28,
        repeat: -1,
        ease: "none",
      });
      cleanupCallbacks.push(() => marqueeTween.kill());
    }

    morphBlobs.forEach((blob, index) => {
      const morphTween = gsap.to(blob, {
        morphSVG: {
          shape: index % 2 === 0 ? morphBlobPath : morphPillPath,
          type: "rotational",
          shapeIndex: 2,
        },
        duration: 5.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      } as gsap.TweenVars);

      cleanupCallbacks.push(() => morphTween.kill());
    });

    matchMedia.add("(min-width: 1024px)", () => {
      const section = scope.querySelector<HTMLElement>(
        "[data-horizontal-section]",
      );
      const viewport = scope.querySelector<HTMLElement>(
        "[data-horizontal-viewport]",
      );
      const track = scope.querySelector<HTMLElement>("[data-horizontal-track]");

      if (!section || !viewport || !track) {
        return;
      }

      const getDistance = () =>
        Math.max(0, track.scrollWidth - viewport.clientWidth);

      const scrollTween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () =>
            `+=${Math.max(960, getDistance() + window.innerHeight * 0.8)}`,
          scrub: 0.85,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.utils
        .toArray<HTMLElement>("[data-horizontal-card]", section)
        .forEach((card) => {
          gsap.fromTo(
            card,
            { scale: 0.92, rotateY: -8 },
            {
              scale: 1,
              rotateY: 0,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: scrollTween,
                start: "left 82%",
                end: "right 34%",
                scrub: true,
              },
            },
          );
        });
    });

    magneticItems.forEach((item) => {
      const moveX = gsap.quickTo(item, "x", {
        duration: 0.45,
        ease: "power3.out",
      });
      const moveY = gsap.quickTo(item, "y", {
        duration: 0.45,
        ease: "power3.out",
      });

      const handlePointerMove = (event: PointerEvent) => {
        const rect = item.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        moveX(x * 0.12);
        moveY(y * 0.12);
      };

      const handlePointerLeave = () => {
        moveX(0);
        moveY(0);
      };

      item.addEventListener("pointermove", handlePointerMove);
      item.addEventListener("pointerleave", handlePointerLeave);
      cleanupCallbacks.push(() => {
        item.removeEventListener("pointermove", handlePointerMove);
        item.removeEventListener("pointerleave", handlePointerLeave);
      });
    });

    const horizontalSection = scope.querySelector<HTMLElement>(
      "[data-horizontal-section]",
    );
    const gestureCue = scope.querySelector<HTMLElement>("[data-gesture-cue]");
    const gestureArrow = scope.querySelector<HTMLElement>(
      "[data-gesture-arrow]",
    );

    if (horizontalSection && gestureCue) {
      const pulseGestureCue = (direction: 1 | -1) => {
        gsap
          .timeline({ defaults: { ease: storeEase } })
          .to(gestureCue, {
            x: direction * 12,
            scale: 1.045,
            duration: 0.24,
            overwrite: true,
          })
          .to(gestureCue, { x: 0, scale: 1, duration: 0.52 });

        if (gestureArrow) {
          gsap.fromTo(
            gestureArrow,
            { x: direction * -8, autoAlpha: 0.35 },
            {
              x: direction * 5,
              autoAlpha: 1,
              duration: 0.42,
              ease: storeEase,
              overwrite: true,
            },
          );
        }
      };

      const observer = Observer.create({
        target: horizontalSection,
        type: "wheel,touch,pointer",
        tolerance: 12,
        onDown: () => pulseGestureCue(1),
        onUp: () => pulseGestureCue(-1),
        onRight: () => pulseGestureCue(1),
        onLeft: () => pulseGestureCue(-1),
      });

      cleanupCallbacks.push(() => observer.kill());
    }

    const refreshTimeout = window.setTimeout(
      () => ScrollTrigger.refresh(),
      120,
    );

    return () => {
      window.clearTimeout(refreshTimeout);
      cleanupCallbacks.forEach((cleanup) => cleanup());
      matchMedia.revert();
    };
  }, []);

  const scopeRef = useGsapContext<HTMLDivElement>(animate);

  if (productPool.length === 0) {
    return null;
  }

  return (
    <div ref={scopeRef} className="bg-[#fbfffe] text-[#173e40]">
      <ShopByNeedSection cards={cards} />
      <CareRoutineSection steps={routineSteps} products={productPool} />
      <ServiceStudioSection products={productPool} />
      <CommunityProofSection products={productPool} />
    </div>
  );
}

function ShopByNeedSection({ cards }: { cards: NeedCard[] }) {
  return (
    <section
      data-horizontal-section
      data-track-section="care-journey"
      className="relative overflow-hidden bg-[#fbfffe] py-16 lg:min-h-[100dvh] lg:py-20"
      aria-labelledby="shop-by-need-title"
    >
      <div className="pointer-events-none absolute top-16 right-[8%] size-44 rounded-full bg-[#c8f1eb]" />
      <div className="pointer-events-none absolute bottom-12 left-[6%] size-24 rounded-full bg-[#ffe5d7]" />
      <MorphBlob className="pointer-events-none absolute top-12 right-[14%] hidden h-28 w-28 text-[#bde9e2] lg:block" />

      <div className="mx-auto max-w-[1160px] px-4 sm:px-0">
        <div className="grid gap-8 lg:grid-cols-[330px_minmax(0,1fr)]">
          <div
            data-section-intro
            className="relative z-10 flex flex-col justify-between"
          >
            <div>
              <p
                data-intro-item
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-black text-[#ff4f3c] shadow-[0_12px_28px_rgba(10,64,66,0.08)]"
              >
                <PawPrint className="size-4" aria-hidden />
                SHOP THEO NHU CẦU
              </p>
              <h2
                id="shop-by-need-title"
                data-intro-item
                className="mt-5 text-[42px] leading-[0.98] font-black tracking-[-0.045em] text-[#073f42] sm:text-[58px]"
              >
                Chọn nhanh theo nhu cầu.
              </h2>
              <MotionScribble className="mt-4 h-7 w-44 text-[#ff4f3c]" />
              <p
                data-intro-item
                className="mt-5 max-w-[28rem] text-[16px] leading-7 font-bold text-[#557879]"
              >
                Ăn, vệ sinh, snack, phụ kiện hay spa tại nhà. Mỗi thẻ là một
                tình huống chăm boss hằng ngày.
              </p>
            </div>

            <div
              data-intro-item
              className="mt-8 grid grid-cols-3 gap-3 text-[#073f42] lg:mt-12"
            >
              <Metric label="nhóm hàng" value="5" />
              <Metric label="gợi ý nhanh" value="24h" />
              <Metric label="combo linh hoạt" value="10+" />
            </div>

            <div
              data-intro-item
              data-gesture-cue
              className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#073f42] px-4 py-2 text-[12px] font-black text-white shadow-[0_16px_34px_rgba(7,63,66,0.16)] will-change-transform"
            >
              Cuộn để khám phá
              <ChevronRight data-gesture-arrow className="size-4" aria-hidden />
            </div>
          </div>

          <div
            data-horizontal-viewport
            className="relative min-w-0 overflow-visible lg:overflow-hidden"
          >
            <div
              data-horizontal-track
              className="flex w-max gap-5 pr-[28vw] will-change-transform lg:pr-[42vw]"
            >
              {cards.map((card, index) => (
                <NeedProductCard key={card.id} card={card} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NeedProductCard({ card, index }: { card: NeedCard; index: number }) {
  const product = card.product;

  return (
    <article
      data-horizontal-card
      data-world-reveal
      data-world-magnetic
      className="group relative flex h-[470px] w-[295px] shrink-0 flex-col overflow-hidden rounded-[28px] border border-[#e4e9e5] bg-white p-5 shadow-[0_24px_60px_rgba(11,72,73,0.1)] will-change-transform sm:w-[330px]"
      style={{ background: card.background }}
    >
      <div className="absolute top-5 right-5 rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-black text-[#173e40] shadow-[0_10px_22px_rgba(14,75,72,0.08)]">
        0{index + 1}
      </div>
      <div
        className="absolute -right-14 -bottom-12 size-40 rounded-full opacity-15"
        style={{ backgroundColor: card.accent }}
      />

      <p className="text-[12px] font-black tracking-[0.08em] text-[#6a8583] uppercase">
        {card.eyebrow}
      </p>
      <h3 className="mt-3 max-w-[15rem] text-[29px] leading-[1.02] font-black tracking-[-0.04em] text-[#073f42]">
        {card.title}
      </h3>
      <p className="mt-4 text-[14px] leading-6 font-bold text-[#5b7775]">
        {card.copy}
      </p>

      <div className="relative mt-auto h-[190px]">
        <div
          className="absolute right-0 bottom-0 grid size-[92px] place-items-center rounded-full text-[24px] font-black text-white shadow-[0_18px_32px_rgba(7,63,66,0.16)]"
          style={{ backgroundColor: card.accent }}
        >
          {card.metric}
        </div>

        <div className="absolute bottom-1 left-0 h-[174px] w-[178px] rounded-[28px] bg-white shadow-[0_18px_34px_rgba(9,75,76,0.1)]">
          {product?.image ? (
            <Image
              src={product.image}
              alt={product.shortName}
              fill
              sizes="190px"
              className="object-contain p-5 transition-transform duration-500 group-hover:scale-110"
            />
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[#dce8e4] pt-4">
        <span className="line-clamp-1 text-[13px] font-black text-[#173e40]">
          {product?.shortName ?? card.eyebrow}
        </span>
        <span className="shrink-0 text-[13px] font-black text-[#ff4f3c]">
          {product ? formatCurrency(product.price) : "Xem thêm"}
        </span>
      </div>
    </article>
  );
}

function CareRoutineSection({
  steps,
  products,
}: {
  steps: RoutineStep[];
  products: ProductPreview[];
}) {
  const spotlightProducts = steps.map(
    (step, index) => step.product ?? products[index] ?? products[0],
  );

  return (
    <section
      data-care-stage
      data-track-section="care-journey"
      className="relative overflow-hidden bg-[#073f42] py-20 text-white"
      aria-labelledby="routine-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,117,88,0.2),transparent_30%),radial-gradient(circle_at_78%_22%,rgba(189,233,226,0.22),transparent_31%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative mx-auto grid max-w-[1160px] gap-10 px-4 sm:px-0 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="lg:sticky lg:top-8">
          <div data-section-intro>
            <p
              data-intro-item
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[12px] font-black text-[#bde9e2] ring-1 ring-white/10"
            >
              <Sparkles className="size-4" aria-hidden />
              3F CARE JOURNEY
            </p>
            <h2
              id="routine-title"
              data-intro-item
              className="mt-5 max-w-[520px] text-[42px] leading-[0.96] font-black tracking-[-0.05em] sm:text-[64px]"
            >
              Chăm boss theo nhịp sống thật.
            </h2>
            <MotionScribble className="mt-4 h-7 w-48 text-[#ffb39f]" />
            <p
              data-intro-item
              className="mt-5 max-w-[31rem] text-[16px] leading-7 font-bold text-[#b8d8d5]"
            >
              Mỗi lần cuộn là một việc cần làm: ăn, thưởng, vệ sinh, spa. Sản
              phẩm đổi theo ngữ cảnh để người mua hiểu ngay nên chọn gì.
            </p>
          </div>

          <div
            data-world-reveal
            className="relative mt-9 overflow-hidden rounded-[36px] border border-white/12 bg-[#0c5356] p-5 shadow-[0_34px_90px_rgba(0,0,0,0.22)]"
          >
            <div
              data-care-orbit
              className="pointer-events-none absolute top-8 right-7 size-28 rounded-full border border-dashed border-[#bde9e2]/36"
            >
              <span className="absolute top-[-7px] left-1/2 size-3 -translate-x-1/2 rounded-full bg-[#ffb39f]" />
              <span className="absolute right-[-5px] bottom-8 size-2.5 rounded-full bg-[#bde9e2]" />
            </div>

            <div className="relative h-[360px] rounded-[30px] bg-[#eafdfe]">
              <div className="absolute inset-6 rounded-[26px] bg-white/72" />
              {spotlightProducts.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  data-care-product
                  className={cn(
                    "absolute inset-0 grid place-items-center opacity-0 will-change-transform",
                    index === 0 ? "opacity-100" : "",
                  )}
                >
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.shortName}
                      fill
                      sizes="430px"
                      className="object-contain p-12 drop-shadow-[0_26px_22px_rgba(7,63,66,0.18)]"
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-5 overflow-hidden rounded-full bg-white/10">
              <span
                data-care-progress
                className="block h-2 w-1/4 rounded-full bg-[#ff7558]"
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-[18px] bg-white/10 p-3">
                <p className="text-xl font-black text-white">4</p>
                <p className="text-[10px] font-black text-[#bde9e2]">nhịp</p>
              </div>
              <div className="rounded-[18px] bg-white/10 p-3">
                <p className="text-xl font-black text-white">24h</p>
                <p className="text-[10px] font-black text-[#bde9e2]">gợi ý</p>
              </div>
              <div className="rounded-[18px] bg-white/10 p-3">
                <p className="text-xl font-black text-white">1:1</p>
                <p className="text-[10px] font-black text-[#bde9e2]">tư vấn</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 lg:pt-28">
          {steps.map((step, index) => (
            <CareStepCard key={step.title} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CareStepCard({ step, index }: { step: RoutineStep; index: number }) {
  const Icon = step.icon;

  return (
    <article
      data-care-step
      data-world-reveal
      className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.075] p-5 shadow-[0_26px_74px_rgba(0,0,0,0.14)] backdrop-blur will-change-transform"
    >
      <div className="absolute -right-10 -bottom-12 size-40 rounded-full bg-[#bde9e2]/10" />
      <div className="relative grid gap-4 md:grid-cols-[76px_1fr_130px] md:items-center">
        <div className="grid size-16 place-items-center rounded-[22px] bg-[#ff7558] text-white shadow-[0_18px_34px_rgba(255,117,88,0.26)]">
          <Icon className="size-7" aria-hidden />
        </div>

        <div>
          <p className="text-[12px] font-black tracking-[0.08em] text-[#ffb39f] uppercase">
            {step.time} / 0{index + 1}
          </p>
          <h3 className="mt-2 text-[30px] leading-none font-black tracking-[-0.045em]">
            {step.title}
          </h3>
          <p className="mt-3 max-w-[30rem] text-[14px] leading-6 font-bold text-[#bed9d6]">
            {step.copy}
          </p>
        </div>

        <div className="flex md:justify-end">
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-[12px] font-black text-[#073f42]">
            {step.detail}
          </span>
        </div>
      </div>
    </article>
  );
}

function ServiceStudioSection({ products }: { products: ProductPreview[] }) {
  const featuredProducts = products.slice(0, 4);

  return (
    <section
      data-service-journey
      data-track-section="services"
      className="relative overflow-hidden bg-[#fbfffe] py-20 text-[#073f42]"
      aria-labelledby="service-title"
    >
      <div className="mx-auto max-w-[1160px] px-4 sm:px-0">
        <div
          data-section-intro
          className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-end"
        >
          <div>
            <p
              data-intro-item
              className="inline-flex items-center gap-2 rounded-full bg-[#eafdfe] px-4 py-2 text-[12px] font-black text-[#0b6f69]"
            >
              <Scissors className="size-4" aria-hidden />
              DỊCH VỤ 3FCARE
            </p>
            <h2
              id="service-title"
              data-intro-item
              className="mt-5 max-w-[680px] text-[42px] leading-[0.96] font-black tracking-[-0.05em] sm:text-[64px]"
            >
              Giao nhanh. Spa gọn. Tư vấn đúng.
            </h2>
            <MotionScribble className="mt-4 h-7 w-48 text-[#0b6f69]" />
          </div>

          <p
            data-intro-item
            className="max-w-[32rem] text-[16px] leading-7 font-bold text-[#547574] lg:justify-self-end"
          >
            Dịch vụ nên rõ như giỏ hàng: biết việc gì, mất bao lâu, và có gì đi
            kèm. 3FCare biến chăm thú cưng thành một flow gọn.
          </p>
        </div>

        <div
          data-world-reveal
          className="relative mt-11 overflow-hidden rounded-[38px] border border-[#dce8e4] bg-white p-4 shadow-[0_30px_90px_rgba(8,63,66,0.1)] sm:p-6"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(7,63,66,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(7,63,66,0.045)_1px,transparent_1px)] bg-[size:38px_38px]" />
          <MorphBlob className="pointer-events-none absolute top-7 right-12 h-28 w-28 text-[#bde9e2]" />

          <svg
            className="pointer-events-none absolute top-20 left-[21%] hidden h-[280px] w-[58%] overflow-visible text-[#ff7558] lg:block"
            viewBox="0 0 640 280"
            fill="none"
            aria-hidden
          >
            <path
              data-service-path
              d="M20 224C145 54 250 262 374 98C455 -7 525 86 620 36"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="10 16"
            />
          </svg>
          <span
            data-service-dot
            className="pointer-events-none absolute top-0 left-0 z-20 hidden size-5 rounded-full border-[5px] border-white bg-[#ff7558] shadow-[0_12px_26px_rgba(255,117,88,0.34)] lg:block"
          />

          <div className="relative z-10 grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="relative min-h-[470px] overflow-hidden rounded-[32px] bg-[#eafdfe] p-6">
              <div className="absolute top-8 right-8 size-24 rounded-full bg-[#bde9e2]" />
              <div className="absolute bottom-12 left-8 size-16 rounded-full bg-[#ffe19b]" />

              <div data-world-parallax className="relative h-[330px]">
                <div className="absolute bottom-0 left-4 h-[302px] w-[242px] overflow-hidden rounded-[48%_48%_44%_44%/36%_36%_42%_42%] bg-white shadow-[0_28px_54px_rgba(8,63,66,0.12)]">
                  <Image
                    src="/images/hero/cat-front-mint.png"
                    alt="Mèo cần chăm sóc"
                    fill
                    sizes="280px"
                    className="object-cover object-[50%_40%]"
                  />
                </div>
                <div className="absolute right-2 bottom-8 max-w-[210px] rounded-[24px] bg-white px-5 py-4 text-[14px] font-black shadow-[0_18px_36px_rgba(8,63,66,0.14)]">
                  Đặt lịch spa, thêm cát/pate, giao trong ngày.
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {["Tắm sạch", "Cắt móng", "Khử mùi", "Giao nhanh"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white px-4 py-2 text-[12px] font-black text-[#073f42]"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="grid content-between gap-5 py-1">
              <div className="grid gap-4">
                {serviceCards.map((card, index) => (
                  <ServiceRailCard key={card.title} card={card} index={index} />
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {featuredProducts.map((product) => (
                  <ProductMiniTile key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceRailCard({
  card,
  index,
}: {
  card: (typeof serviceCards)[number];
  index: number;
}) {
  const Icon = card.icon;

  return (
    <article
      data-world-reveal
      className="grid grid-cols-[58px_1fr_auto] items-center gap-4 rounded-[26px] border border-[#dce8e4] bg-[#fbfffe] p-4 shadow-[0_18px_38px_rgba(8,63,66,0.07)]"
    >
      <span className="grid size-14 place-items-center rounded-[20px] bg-[#073f42] text-white">
        <Icon className="size-6" aria-hidden />
      </span>
      <span>
        <span className="block text-[18px] leading-none font-black tracking-[-0.025em]">
          {card.title}
        </span>
        <span className="mt-2 line-clamp-2 block text-[13px] leading-5 font-bold text-[#617d7a]">
          {card.copy}
        </span>
      </span>
      <span className="grid size-12 place-items-center rounded-full bg-[#ff7558] text-[12px] font-black text-white">
        {index + 1}
      </span>
    </article>
  );
}

function ProductMiniTile({ product }: { product: ProductPreview }) {
  return (
    <article
      data-world-reveal
      data-world-magnetic
      className="group grid min-h-[118px] grid-cols-[92px_1fr] items-center gap-3 rounded-[24px] border border-[#e0ebe8] bg-white p-3 shadow-[0_16px_34px_rgba(8,63,66,0.06)] will-change-transform"
    >
      <div className="relative size-[92px] rounded-[20px] bg-[#f3faf8]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.shortName}
            fill
            sizes="96px"
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-110"
          />
        ) : null}
      </div>
      <div>
        <p className="text-[12px] font-black text-[#ff4f3c]">
          {product.category}
        </p>
        <h3 className="mt-2 line-clamp-2 text-[15px] leading-tight font-black tracking-[-0.02em]">
          {product.shortName}
        </h3>
        <p className="mt-2 text-[15px] font-black text-[#073f42]">
          {formatCurrency(product.price)}
        </p>
      </div>
    </article>
  );
}

function CommunityProofSection({ products }: { products: ProductPreview[] }) {
  const marqueeProducts = [...products.slice(0, 8), ...products.slice(0, 8)];

  return (
    <section
      data-track-section="proof"
      className="overflow-hidden bg-[#fbfffe] pt-8 pb-20 text-[#073f42]"
      aria-labelledby="proof-title"
    >
      <div className="mx-auto max-w-[1160px] px-4 sm:px-0">
        <div className="relative overflow-hidden rounded-[40px] bg-[#073f42] p-5 text-white shadow-[0_34px_90px_rgba(7,63,66,0.16)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,117,88,0.26),transparent_32%),radial-gradient(circle_at_88%_28%,rgba(189,233,226,0.2),transparent_30%)]" />
          <div className="pointer-events-none absolute right-8 bottom-8 hidden text-[#bde9e2]/20 lg:block">
            <PawPrint className="size-40 fill-current" aria-hidden />
          </div>

          <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div data-section-intro>
              <p
                data-intro-item
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[12px] font-black text-[#ffb39f] ring-1 ring-white/10"
              >
                <ShieldCheck className="size-4" aria-hidden />
                KHÁCH CHỌN LẠI
              </p>
              <h2
                id="proof-title"
                data-intro-item
                className="mt-5 max-w-[560px] text-[42px] leading-[0.96] font-black tracking-[-0.05em] sm:text-[64px]"
              >
                Giỏ hàng tự quay lại.
              </h2>
              <MotionScribble className="mt-4 h-7 w-48 text-[#ffb39f]" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ProofMetric label="đơn combo" value="10+" />
              <ProofMetric label="giao nhanh" value="24h" />
              <ProofMetric label="tư vấn" value="1:1" />
            </div>
          </div>

          <div className="relative z-10 mt-9 grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                data-world-reveal
                key={testimonial.name}
                className="min-h-[230px] rounded-[30px] border border-white/12 bg-white/[0.08] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.1)] backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full bg-[#ff7558] text-sm font-black">
                    3F
                  </span>
                  <BadgeCheck className="size-6 fill-[#bde9e2] text-[#073f42]" />
                </div>
                <p className="mt-6 text-[17px] leading-7 font-bold text-[#ecfffb]">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-white/12 pt-4">
                  <p className="text-sm font-black">{testimonial.name}</p>
                  <p className="mt-1 text-xs font-bold text-[#bde9e2]">
                    {testimonial.pet}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 overflow-hidden border-y border-[#dce9e6] bg-white py-5">
        <div
          data-world-marquee-track
          className="flex w-max gap-4 will-change-transform"
        >
          {marqueeProducts.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="grid w-[260px] shrink-0 grid-cols-[74px_1fr] items-center gap-3 rounded-[22px] bg-[#f6fbfa] p-3"
            >
              <div className="relative size-[74px] rounded-[18px] bg-white">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.shortName}
                    fill
                    sizes="74px"
                    className="object-contain p-2"
                  />
                ) : null}
              </div>
              <div>
                <p className="line-clamp-2 text-[13px] leading-tight font-black">
                  {product.shortName}
                </p>
                <p className="mt-1 text-[13px] font-black text-[#ff4f3c]">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-[1160px] gap-5 px-4 sm:px-0 lg:grid-cols-[1fr_auto] lg:items-center">
        <div data-section-intro>
          <p
            data-intro-item
            className="text-[13px] font-black tracking-[0.08em] text-[#ff4f3c] uppercase"
          >
            Sẵn sàng build giỏ hàng cho boss?
          </p>
          <h3
            data-intro-item
            className="mt-2 max-w-[760px] text-[34px] leading-tight font-black tracking-[-0.045em] text-[#073f42] sm:text-[46px]"
          >
            Chọn combo, đặt lịch spa và nhận gợi ý trong một lần cuộn.
          </h3>
        </div>

        <Button
          data-track-action="true"
          data-track-category="Dịch vụ"
          data-track-id="proof:start-shopping"
          data-track-section="proof"
          className="h-[60px] rounded-full bg-[#ff4f3c] px-8 text-[14px] font-black text-white shadow-[0_20px_40px_rgba(255,79,60,0.22)] hover:bg-[#e94427]"
          onClick={() =>
            trackAnalyticsEvent("service_interest", {
              sectionId: "proof",
              elementId: "proof:start-shopping",
              category: "Dịch vụ",
            })
          }
        >
          Bắt đầu chọn món
          <ChevronRight className="size-5" aria-hidden />
        </Button>
      </div>
    </section>
  );
}

function ProofMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      data-world-reveal
      className="rounded-[24px] border border-white/12 bg-white/[0.08] p-4 text-center backdrop-blur"
    >
      <p className="text-[34px] leading-none font-black tracking-[-0.045em]">
        {value}
      </p>
      <p className="mt-2 text-[11px] font-black text-[#bde9e2]">{label}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[#dfeae7] bg-white p-4 shadow-[0_14px_32px_rgba(8,63,66,0.06)]">
      <p className="text-[25px] leading-none font-black tracking-[-0.04em]">
        {value}
      </p>
      <p className="mt-1 text-[11px] font-black text-[#6d8785]">{label}</p>
    </div>
  );
}

function MotionScribble({ className }: { className?: string }) {
  return (
    <svg
      className={cn("overflow-visible", className)}
      viewBox="0 0 180 32"
      fill="none"
      aria-hidden
    >
      <path
        data-draw-line
        d="M4 18C31 9 63 8 92 15C119 21 143 21 176 10"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        data-draw-line
        d="M18 27C48 22 85 24 121 28"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.42"
      />
    </svg>
  );
}

function MorphBlob({ className }: { className?: string }) {
  return (
    <svg
      className={cn("overflow-visible opacity-80", className)}
      viewBox="-8 0 122 120"
      aria-hidden
    >
      <path data-morph-blob d={morphPillPath} fill="currentColor" />
    </svg>
  );
}
