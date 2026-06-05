"use client";

import { useCallback, useMemo } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
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
    title: "Pate, hạt và topping cho bé ăn ngon hơn.",
    copy: "Gợi ý theo thói quen ăn, độ tuổi và khẩu vị của từng bé.",
    metric: "7 ngày",
    accent: "#ff4f3c",
    background: "linear-gradient(145deg, #fff4ef 0%, #ffffff 62%)",
    category: "Pate & thức ăn ướt",
  },
  {
    id: "clean-home",
    eyebrow: "Nhà sạch mùi",
    title: "Cát vệ sinh, khử mùi và đồ dọn khay.",
    copy: "Ưu tiên ít bụi, vón nhanh và dễ dùng trong căn hộ.",
    metric: "5 phút",
    accent: "#0b6f69",
    background: "linear-gradient(145deg, #e7faf7 0%, #ffffff 66%)",
    category: "Cát vệ sinh",
  },
  {
    id: "reward-snack",
    eyebrow: "Snack thưởng",
    title: "Món thưởng nhỏ cho lúc huấn luyện hoặc dỗ bé.",
    copy: "Các vị dễ ăn, bao bì nhỏ, phù hợp thử nhiều loại.",
    metric: "3 vị",
    accent: "#f5b51b",
    background: "linear-gradient(145deg, #fff7d7 0%, #ffffff 64%)",
    category: "Snack & bánh thưởng",
  },
  {
    id: "carry-play",
    eyebrow: "Đi chơi gọn",
    title: "Balo, đồ chơi và phụ kiện đi chơi cuối tuần.",
    copy: "Chọn nhanh theo size, cân nặng và thói quen di chuyển.",
    metric: "24h",
    accent: "#2764d8",
    background: "linear-gradient(145deg, #edf4ff 0%, #ffffff 65%)",
    category: "Phụ kiện",
  },
  {
    id: "spa-care",
    eyebrow: "Spa tại nhà",
    title: "Sữa tắm, lược chải và chăm sóc lông da.",
    copy: "Lịch chăm sóc nhẹ nhàng để bé sạch, thơm và ít rụng lông.",
    metric: "4 bước",
    accent: "#9b6cff",
    background: "linear-gradient(145deg, #f5eeff 0%, #ffffff 62%)",
    category: "Chăm sóc & vệ sinh",
  },
];

const serviceCards = [
  {
    title: "Grooming đặt lịch",
    copy: "Tắm, cắt móng, vệ sinh tai và tư vấn chăm lông theo giống.",
    icon: Scissors,
    value: "45-90 phút",
  },
  {
    title: "Giao nhanh nội thành",
    copy: "Ưu tiên đơn cần gấp: cát, pate, hạt và combo dùng hằng ngày.",
    icon: Truck,
    value: "24h",
  },
  {
    title: "Tư vấn khẩu phần",
    copy: "Gợi ý sản phẩm theo cân nặng, tuổi, lịch ăn và tình trạng sức khỏe.",
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
        title: "Bữa sáng đúng khẩu phần",
        copy: "Pate hoặc hạt dễ tiêu, đủ nước và theo dõi lượng ăn.",
        detail: "Ăn ngon",
        icon: Clock3,
        product:
          productPool.find(
            (product) => product.category === "Pate & thức ăn ướt",
          ) ?? productPool[0],
      },
      {
        time: "12:00",
        title: "Snack thưởng thông minh",
        copy: "Thưởng vừa đủ sau khi chơi, tập lệnh hoặc làm quen đồ mới.",
        detail: "Tập thói quen",
        icon: BadgeCheck,
        product:
          productPool.find(
            (product) => product.category === "Snack & bánh thưởng",
          ) ?? productPool[1],
      },
      {
        time: "18:30",
        title: "Dọn khay, khử mùi",
        copy: "Thay cát đúng lúc để nhà sạch và bé ít stress khi đi vệ sinh.",
        detail: "Sạch mùi",
        icon: PackageCheck,
        product:
          productPool.find((product) => product.category === "Cát vệ sinh") ??
          productPool[2],
      },
      {
        time: "Cuối tuần",
        title: "Spa nhẹ và kiểm tra lông da",
        copy: "Chải lông, vệ sinh tai, cắt móng và lên lịch grooming khi cần.",
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

    gsap.registerPlugin(ScrollTrigger);

    const matchMedia = gsap.matchMedia();
    const revealItems = Array.from(
      scope.querySelectorAll<HTMLElement>("[data-world-reveal]"),
    );
    const parallaxItems = Array.from(
      scope.querySelectorAll<HTMLElement>("[data-world-parallax]"),
    );
    const magneticItems = Array.from(
      scope.querySelectorAll<HTMLElement>("[data-world-magnetic]"),
    );
    const cleanupCallbacks: Array<() => void> = [];

    if (prefersReducedMotion) {
      gsap.set(revealItems, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        clearProps: "transform,opacity,visibility",
      });
      return;
    }

    gsap.set(revealItems, {
      autoAlpha: 0,
      y: 34,
      scale: 0.975,
      rotate: 0.001,
    });

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

    const routine = scope.querySelector<HTMLElement>("[data-routine-progress]");
    if (routine) {
      ScrollTrigger.create({
        trigger: routine,
        start: "top 74%",
        end: "bottom 38%",
        scrub: true,
        onUpdate: (self) => {
          gsap.set(routine, {
            "--routine-progress": `${Math.round(self.progress * 100)}%`,
          });
        },
      });
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
      className="relative overflow-hidden bg-[#fbfffe] py-16 lg:min-h-[100dvh] lg:py-20"
      aria-labelledby="shop-by-need-title"
    >
      <div className="pointer-events-none absolute top-16 right-[8%] size-44 rounded-full bg-[#c8f1eb]" />
      <div className="pointer-events-none absolute bottom-12 left-[6%] size-24 rounded-full bg-[#ffe5d7]" />

      <div className="mx-auto max-w-[1160px] px-4 sm:px-0">
        <div className="grid gap-8 lg:grid-cols-[330px_minmax(0,1fr)]">
          <div className="relative z-10 flex flex-col justify-between">
            <div>
              <p
                data-world-reveal
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-black text-[#ff4f3c] shadow-[0_12px_28px_rgba(10,64,66,0.08)]"
              >
                <PawPrint className="size-4" aria-hidden />
                SHOP THEO NHU CẦU
              </p>
              <h2
                id="shop-by-need-title"
                data-world-reveal
                className="mt-5 text-[42px] leading-[0.98] font-black tracking-[-0.045em] text-[#073f42] sm:text-[58px]"
              >
                Cuộn để chọn đúng món cho từng khoảnh khắc.
              </h2>
              <p
                data-world-reveal
                className="mt-5 max-w-[28rem] text-[16px] leading-7 font-bold text-[#557879]"
              >
                Một flow mua sắm gọn hơn: chọn nhu cầu trước, xem sản phẩm phù
                hợp sau. Mỗi thẻ là một tình huống chăm boss hằng ngày.
              </p>
            </div>

            <div
              data-world-reveal
              className="mt-8 grid grid-cols-3 gap-3 text-[#073f42] lg:mt-12"
            >
              <Metric label="nhóm hàng" value="5" />
              <Metric label="gợi ý nhanh" value="24h" />
              <Metric label="combo linh hoạt" value="10+" />
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
  const heroProduct = products[4] ?? products[0];

  return (
    <section
      data-routine-progress
      className="relative overflow-hidden bg-[#073f42] py-20 text-white"
      style={{ "--routine-progress": "0%" } as CSSProperties}
      aria-labelledby="routine-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute top-16 right-[12%] size-64 rounded-full bg-[#1aa79a]/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-8rem] left-[5%] size-80 rounded-full bg-[#ff7558]/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-[1160px] gap-10 px-4 sm:px-0 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-16 lg:self-start">
          <p
            data-world-reveal
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[12px] font-black text-[#bde9e2]"
          >
            <Sparkles className="size-4" aria-hidden />
            ROUTINE CHĂM BOSS
          </p>
          <h2
            id="routine-title"
            data-world-reveal
            className="mt-5 max-w-[540px] text-[42px] leading-[0.98] font-black tracking-[-0.045em] sm:text-[60px]"
          >
            Một ngày chăm thú cưng có nhịp, có gu, có kiểm soát.
          </h2>
          <p
            data-world-reveal
            className="mt-5 max-w-[32rem] text-[16px] leading-7 font-bold text-[#b8d8d5]"
          >
            Scroll xuống để thấy routine chuyển động theo tiến trình. Từ bữa ăn,
            snack thưởng đến vệ sinh và spa, mọi thứ được đóng thành luồng mua
            sắm dễ hiểu.
          </p>

          <div
            data-world-reveal
            data-world-parallax
            className="mt-9 max-w-[330px] rounded-[30px] border border-white/12 bg-white p-5 text-[#073f42] shadow-[0_30px_80px_rgba(0,0,0,0.18)]"
          >
            <div className="relative h-[210px] rounded-[24px] bg-[#eafdfe]">
              {heroProduct.image ? (
                <Image
                  src={heroProduct.image}
                  alt={heroProduct.shortName}
                  fill
                  sizes="330px"
                  className="object-contain p-8"
                />
              ) : null}
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="line-clamp-2 text-[15px] font-black">
                  {heroProduct.shortName}
                </p>
                <p className="mt-1 text-[13px] font-bold text-[#6b8583]">
                  Gợi ý nổi bật hôm nay
                </p>
              </div>
              <p className="text-[17px] font-black text-[#ff4f3c]">
                {formatCurrency(heroProduct.price)}
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute top-0 bottom-0 left-[27px] w-px bg-white/14">
            <span className="block h-[var(--routine-progress)] w-px bg-[#ff7558]" />
          </div>

          <div className="space-y-5">
            {steps.map((step, index) => (
              <RoutineStepCard key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RoutineStepCard({
  step,
  index,
}: {
  step: RoutineStep;
  index: number;
}) {
  const Icon = step.icon;

  return (
    <article
      data-world-reveal
      className="relative grid gap-5 rounded-[28px] border border-white/10 bg-white/[0.07] p-5 pl-20 shadow-[0_24px_70px_rgba(0,0,0,0.14)] backdrop-blur md:grid-cols-[1fr_160px]"
    >
      <div className="absolute top-6 left-3 grid size-11 place-items-center rounded-full border border-white/20 bg-[#073f42] text-[#ffb39f]">
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="absolute top-6 right-5 text-[44px] leading-none font-black text-white/5">
        0{index + 1}
      </div>

      <div>
        <p className="text-[12px] font-black text-[#ffb39f]">{step.time}</p>
        <h3 className="mt-2 text-[26px] leading-tight font-black tracking-[-0.035em]">
          {step.title}
        </h3>
        <p className="mt-3 max-w-[30rem] text-[14px] leading-6 font-bold text-[#bed9d6]">
          {step.copy}
        </p>
        <span className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-[12px] font-black text-[#073f42]">
          {step.detail}
        </span>
      </div>

      <div className="relative min-h-[145px] rounded-[22px] bg-white">
        {step.product?.image ? (
          <Image
            src={step.product.image}
            alt={step.product.shortName}
            fill
            sizes="170px"
            className="object-contain p-5"
          />
        ) : null}
      </div>
    </article>
  );
}

function ServiceStudioSection({ products }: { products: ProductPreview[] }) {
  return (
    <section
      className="relative overflow-hidden bg-[#fbfffe] py-20 text-[#073f42]"
      aria-labelledby="service-title"
    >
      <div className="mx-auto max-w-[1160px] px-4 sm:px-0">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-end">
          <div>
            <p
              data-world-reveal
              className="inline-flex items-center gap-2 rounded-full bg-[#eafdfe] px-4 py-2 text-[12px] font-black text-[#0b6f69]"
            >
              <Scissors className="size-4" aria-hidden />
              DỊCH VỤ 3FCARE
            </p>
            <h2
              id="service-title"
              data-world-reveal
              className="mt-5 max-w-[680px] text-[42px] leading-[0.98] font-black tracking-[-0.045em] sm:text-[62px]"
            >
              Không chỉ bán đồ. 3FStore giúp bạn chăm boss từ đầu đến đuôi.
            </h2>
          </div>

          <p
            data-world-reveal
            className="max-w-[32rem] text-[16px] leading-7 font-bold text-[#547574] lg:justify-self-end"
          >
            Website cần có cảm giác đang vận hành thật: đặt lịch, tư vấn, giao
            nhanh và combo đều nằm cùng một trải nghiệm.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div
            data-world-reveal
            className="relative min-h-[520px] overflow-hidden rounded-[34px] bg-[#eafdfe] p-6 shadow-[inset_0_0_0_1px_rgba(7,63,66,0.07)]"
          >
            <div className="absolute top-10 right-10 size-28 rounded-full bg-[#bde9e2]" />
            <div className="absolute bottom-16 left-12 size-16 rounded-full bg-[#ffe0a2]" />

            <div className="relative z-10 grid h-full gap-5 sm:grid-cols-2">
              <div className="flex flex-col justify-end">
                <div data-world-parallax className="relative h-[330px]">
                  <div className="absolute bottom-0 left-0 h-[295px] w-[235px] overflow-hidden rounded-[48%_48%_44%_44%/36%_36%_42%_42%] bg-white shadow-[0_28px_54px_rgba(8,63,66,0.12)]">
                    <Image
                      src="/images/hero/cat-front-mint.png"
                      alt="Mèo cần chăm sóc"
                      fill
                      sizes="260px"
                      className="object-cover object-[50%_40%]"
                    />
                  </div>
                  <div className="absolute right-0 bottom-8 rounded-full bg-white px-4 py-3 text-[13px] font-black shadow-[0_18px_36px_rgba(8,63,66,0.14)]">
                    Lịch spa hôm nay
                  </div>
                </div>
              </div>

              <div className="grid content-end gap-3">
                {serviceCards.map((card) => (
                  <ServiceCard key={card.title} card={card} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            {products.slice(0, 3).map((product, index) => (
              <FeaturedMiniProduct
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ card }: { card: (typeof serviceCards)[number] }) {
  const Icon = card.icon;

  return (
    <article
      data-world-reveal
      className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-[22px] bg-white/88 p-4 shadow-[0_16px_32px_rgba(8,63,66,0.08)]"
    >
      <span className="grid size-12 place-items-center rounded-full bg-[#073f42] text-white">
        <Icon className="size-5" aria-hidden />
      </span>
      <span>
        <span className="block text-[15px] font-black">{card.title}</span>
        <span className="mt-1 line-clamp-2 block text-[12px] leading-5 font-bold text-[#617d7a]">
          {card.copy}
        </span>
      </span>
      <span className="rounded-full bg-[#ff4f3c] px-3 py-1.5 text-[12px] font-black text-white">
        {card.value}
      </span>
    </article>
  );
}

function FeaturedMiniProduct({
  product,
  index,
}: {
  product: ProductPreview;
  index: number;
}) {
  return (
    <article
      data-world-reveal
      data-world-magnetic
      className={cn(
        "group grid min-h-[160px] grid-cols-[130px_1fr] items-center gap-4 rounded-[28px] border border-[#e0ebe8] bg-white p-4 shadow-[0_20px_44px_rgba(8,63,66,0.08)] will-change-transform",
        index === 1 ? "lg:translate-x-6" : "",
      )}
    >
      <div className="relative h-[128px] rounded-[22px] bg-[#f3faf8]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.shortName}
            fill
            sizes="140px"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
          />
        ) : null}
      </div>
      <div>
        <p className="text-[12px] font-black text-[#ff4f3c]">
          {product.category}
        </p>
        <h3 className="mt-2 line-clamp-2 text-[18px] leading-tight font-black tracking-[-0.025em]">
          {product.shortName}
        </h3>
        <p className="mt-3 text-[18px] font-black text-[#073f42]">
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
      className="overflow-hidden bg-[#fbfffe] pt-6 pb-20 text-[#073f42]"
      aria-labelledby="proof-title"
    >
      <div className="mx-auto max-w-[1160px] px-4 sm:px-0">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p
              data-world-reveal
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-black text-[#ff4f3c] shadow-[0_12px_28px_rgba(10,64,66,0.08)]"
            >
              <ShieldCheck className="size-4" aria-hidden />
              TIN TỪ NGƯỜI NUÔI THẬT
            </p>
            <h2
              id="proof-title"
              data-world-reveal
              className="mt-5 text-[42px] leading-[0.98] font-black tracking-[-0.045em] sm:text-[58px]"
            >
              Từ giỏ hàng đến thói quen chăm boss tốt hơn.
            </h2>
          </div>

          <div className="grid gap-3">
            {testimonials.map((testimonial) => (
              <article
                data-world-reveal
                key={testimonial.name}
                className="rounded-[24px] border border-[#e0ebe8] bg-white p-5 shadow-[0_16px_34px_rgba(8,63,66,0.06)]"
              >
                <p className="text-[15px] leading-7 font-bold text-[#466d6b]">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black">{testimonial.name}</p>
                    <p className="text-xs font-bold text-[#7a9290]">
                      {testimonial.pet}
                    </p>
                  </div>
                  <BadgeCheck className="size-6 fill-[#0b6f69] text-white" />
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

      <div className="mx-auto mt-10 flex max-w-[1160px] flex-col items-start justify-between gap-5 rounded-[30px] bg-[#073f42] p-6 text-white shadow-[0_28px_80px_rgba(7,63,66,0.18)] sm:flex-row sm:items-center sm:px-8">
        <div data-world-reveal>
          <p className="text-[13px] font-black text-[#ffb39f]">
            Sẵn sàng build giỏ hàng cho boss?
          </p>
          <h3 className="mt-2 text-[28px] leading-tight font-black tracking-[-0.035em]">
            Chọn combo, đặt lịch chăm sóc và nhận tư vấn trong một flow.
          </h3>
        </div>
        <Button className="h-14 rounded-full bg-[#ff4f3c] px-7 text-[14px] font-black text-white hover:bg-[#e94427]">
          Bắt đầu chọn món
          <ChevronRight className="size-5" aria-hidden />
        </Button>
      </div>
    </section>
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
