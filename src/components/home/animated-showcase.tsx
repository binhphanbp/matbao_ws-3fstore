"use client";

import { useCallback } from "react";
import gsap from "gsap";
import { ShoppingBag, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGsapContext } from "@/hooks/use-gsap-context";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types/product";

const featuredProducts: Product[] = [
  {
    id: "daily-carry-pack",
    name: "Daily Carry Pack",
    category: "Bags",
    price: 129,
    accent: "bg-[#f15a24]",
  },
  {
    id: "soft-shell-jacket",
    name: "Soft Shell Jacket",
    category: "Outerwear",
    price: 189,
    accent: "bg-[#00a896]",
  },
  {
    id: "trail-knit-sneaker",
    name: "Trail Knit Sneaker",
    category: "Footwear",
    price: 149,
    accent: "bg-[#2454ff]",
  },
];

export function AnimatedShowcase() {
  const addItem = useCartStore((state) => state.addItem);
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  const animate = useCallback((scope: HTMLElement) => {
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    timeline
      .from(scope.querySelectorAll("[data-hero-copy] > *"), {
        y: 28,
        opacity: 0,
        duration: 0.75,
        stagger: 0.08,
      })
      .from(
        scope.querySelectorAll("[data-product-card]"),
        {
          y: 36,
          opacity: 0,
          rotate: -2,
          duration: 0.85,
          stagger: 0.1,
        },
        "-=0.45",
      )
      .to(
        scope.querySelector("[data-float]"),
        {
          y: -10,
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        },
        "-=0.2",
      );
  }, []);

  const scopeRef = useGsapContext<HTMLDivElement>(animate);

  return (
    <section
      ref={scopeRef}
      className="bg-background text-foreground grid min-h-dvh overflow-hidden lg:grid-cols-[0.95fr_1.05fr]"
    >
      <div className="flex flex-col justify-between px-6 py-6 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between">
          <div className="text-lg font-black tracking-normal">3F Store</div>
          <div className="border-foreground/10 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <ShoppingBag className="size-4" aria-hidden />
            <span>{cartCount}</span>
          </div>
        </header>

        <div data-hero-copy className="max-w-xl py-20 lg:py-0">
          <div className="border-foreground/10 bg-foreground/[0.03] mb-5 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium">
            <Sparkles className="size-4 text-[#f15a24]" aria-hidden />
            Premium launch collection
          </div>
          <h1 className="max-w-[12ch] text-5xl leading-[0.95] font-black tracking-normal sm:text-7xl">
            Built for sharper everyday retail.
          </h1>
          <p className="text-foreground/68 mt-6 max-w-md text-base leading-7 sm:text-lg">
            A production-ready frontend foundation with App Router, Tailwind
            CSS, Zustand state, and GSAP motion ready for polished commerce
            flows.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => addItem(featuredProducts[0])}>
              Add first item
            </Button>
            <Button variant="secondary">View collection</Button>
          </div>
        </div>

        <div className="border-foreground/10 text-foreground/64 grid grid-cols-3 gap-3 border-t pt-5 text-sm">
          <span>Fast UI</span>
          <span>Typed state</span>
          <span>Smooth motion</span>
        </div>
      </div>

      <div className="relative flex min-h-[620px] items-center bg-[#e9edf3] px-6 py-10 text-[#111318] sm:px-10 lg:px-14">
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55),transparent)]" />
        <div className="relative grid w-full gap-4 lg:grid-cols-3">
          {featuredProducts.map((product, index) => (
            <article
              key={product.id}
              data-product-card
              data-float={index === 1 ? "" : undefined}
              className="group flex min-h-[440px] flex-col justify-between rounded-lg bg-white p-5 shadow-[0_24px_70px_rgba(17,19,24,0.14)]"
            >
              <div>
                <div className={`mb-8 size-12 rounded-md ${product.accent}`} />
                <p className="text-sm font-semibold text-black/50">
                  {product.category}
                </p>
                <h2 className="mt-2 text-3xl leading-none font-black tracking-normal">
                  {product.name}
                </h2>
              </div>

              <div>
                <div className="mb-5 aspect-[4/5] rounded-md bg-[radial-gradient(circle_at_40%_30%,#ffffff_0,#d8dde6_45%,#aeb7c5_100%)] transition-transform duration-500 group-hover:scale-[1.03]" />
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black">${product.price}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => addItem(product)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
