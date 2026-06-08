/* eslint-disable @next/next/no-img-element */
"use client";

import { Headphones, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { useCartStore } from "@/store/cart-store";

export function StorefrontHeader() {
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-[#d9ece8] bg-[#f8fffd]/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-[1480px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Mở menu"
          className="grid size-11 place-items-center rounded-full border border-[#d7e8e5] bg-white text-[#073f42] lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 text-[#073f42]"
          aria-label="3FStore về trang chủ"
        >
          <span className="grid size-12 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm">
            <img
              src="/logo/logo.webp"
              alt=""
              className="h-full w-full object-contain p-1"
            />
          </span>
          <span className="hidden text-2xl font-black tracking-tight sm:block">
            3FStore
          </span>
        </Link>

        <nav
          aria-label="Điều hướng cửa hàng"
          className="hidden items-center gap-6 text-sm font-extrabold text-[#315f5d] lg:flex"
        >
          <Link href="/products" className="text-[#ff4f3c]">
            Sản phẩm
          </Link>
          <Link href="/#bundle">Combo</Link>
          <Link href="/#snacks">Snack hot</Link>
          <Link href="/#services">Dịch vụ</Link>
          <Link href="/admin/analytics">Analytics</Link>
        </nav>

        <div className="ml-auto hidden h-12 max-w-md flex-1 items-center gap-3 rounded-full border border-[#d7e8e5] bg-white px-4 shadow-sm md:flex">
          <Search className="size-5 text-[#0d7773]" />
          <span className="truncate text-sm font-bold text-[#72908e]">
            Tìm pate, cát vệ sinh, snack, phụ kiện...
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
          <Link
            href="/products"
            aria-label="Mở trang sản phẩm"
            className="grid size-11 place-items-center rounded-full border border-[#d7e8e5] bg-white text-[#073f42]"
          >
            <Search className="size-5" />
          </Link>
          <button
            type="button"
            aria-label="Tài khoản"
            className="hidden size-11 place-items-center rounded-full border border-[#d7e8e5] bg-white text-[#073f42] sm:grid"
          >
            <UserRound className="size-5" />
          </button>
          <button
            type="button"
            aria-label={`Giỏ hàng có ${cartCount} sản phẩm`}
            className="relative grid size-11 place-items-center rounded-full border border-[#d7e8e5] bg-white text-[#073f42]"
          >
            <ShoppingBag className="size-5" />
            {cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-[#ff4f3c] px-1 text-xs font-black text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="border-t border-[#d9ece8] bg-[#073f42] text-white">
      <div className="mx-auto grid w-full max-w-[1480px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid size-12 place-items-center overflow-hidden rounded-2xl bg-white">
              <img
                src="/logo/logo.webp"
                alt=""
                className="h-full w-full object-contain p-1"
              />
            </span>
            <span className="text-2xl font-black">3FStore</span>
          </Link>
          <p className="mt-4 max-w-lg text-sm leading-6 font-semibold text-[#c8e3df]">
            Cửa hàng đồ ăn thú cưng, phụ kiện và dịch vụ chăm sóc. Mục tiêu là
            giúp khách chọn đúng sản phẩm nhanh, dễ hiểu và dễ chốt đơn.
          </p>
        </div>

        <FooterGroup
          title="Mua sắm"
          links={[
            ["Sản phẩm", "/products"],
            ["Combo tiết kiệm", "/#bundle"],
            ["Snack hot", "/#snacks"],
            ["Dịch vụ", "/#services"],
          ]}
        />

        <div>
          <h2 className="text-sm font-black tracking-[0.18em] text-[#9fd5ce] uppercase">
            Hỗ trợ nhanh
          </h2>
          <div className="mt-4 rounded-3xl bg-white/10 p-4">
            <div className="flex items-center gap-3">
              <Headphones className="size-5 text-[#ffcf66]" />
              <p className="text-sm font-black">Tư vấn chọn đồ cho boss</p>
            </div>
            <p className="mt-2 text-sm leading-6 font-semibold text-[#c8e3df]">
              Gợi ý theo giống, độ tuổi, cân nặng và ngân sách. Demo hiện dùng
              dữ liệu nội bộ từ sản phẩm Shopee đã import.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: Array<[string, string]>;
}) {
  return (
    <div>
      <h2 className="text-sm font-black tracking-[0.18em] text-[#9fd5ce] uppercase">
        {title}
      </h2>
      <div className="mt-4 grid gap-3 text-sm font-bold text-[#e8f7f4]">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="hover:text-[#ffcf66]">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function StorefrontPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5fbfa] text-[#073f42]">
      <StorefrontHeader />
      {children}
      <StorefrontFooter />
    </div>
  );
}
