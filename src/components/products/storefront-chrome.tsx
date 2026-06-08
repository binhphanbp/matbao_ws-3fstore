/* eslint-disable @next/next/no-img-element */
"use client";

import {
  ArrowRight,
  ChevronDown,
  Headphones,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useCartStore } from "@/store/cart-store";

const navGroups = [
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
    label: "Combo",
    href: "/#bundle",
    items: [
      ["Combo tiết kiệm", "/#bundle"],
      ["Gói 5 món bán chạy", "/#bundle"],
      ["Combo mèo mới nuôi", "/products?audience=cat"],
    ],
  },
  {
    label: "Snack hot",
    href: "/#snacks",
    items: [
      [
        "Snack thưởng",
        "/products?category=Snack+%26+b%C3%A1nh+th%C6%B0%E1%BB%9Fng",
      ],
      ["Pate ăn liền", "/products?q=pate"],
      ["Sản phẩm đang giảm", "/products?sort=sale"],
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
] as const;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export function StorefrontHeader() {
  const items = useCartStore((state) => state.items);
  const navCloseTimerRef = useRef<number | null>(null);
  const [openNavLabel, setOpenNavLabel] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
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

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#d9ece8] bg-[#f8fffd]/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1480px] items-center gap-2.5 px-3 sm:h-[72px] sm:px-6 lg:px-8">
        <button
          type="button"
          aria-expanded={isMobileMenuOpen}
          aria-label="Mở menu"
          onClick={() => setIsMobileMenuOpen(true)}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d7e8e5] bg-white text-[#073f42] lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 text-[#073f42]"
          aria-label="3FStore về trang chủ"
        >
          <span className="grid size-10 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm sm:size-11">
            <img
              src="/logo/logo.webp"
              alt=""
              className="h-full w-full object-contain p-1"
            />
          </span>
          <span className="hidden text-[26px] leading-none font-black tracking-tight sm:block">
            3FStore
          </span>
        </Link>

        <nav
          aria-label="Điều hướng cửa hàng"
          className="hidden items-center gap-5 text-sm font-extrabold text-[#315f5d] lg:flex"
        >
          {navGroups.map((group) => {
            const isOpen = openNavLabel === group.label;

            return (
              <div
                key={group.label}
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
                onFocus={() => openNavDropdown(group.label)}
                onPointerEnter={() => openNavDropdown(group.label)}
                onPointerLeave={scheduleNavClose}
              >
                <Link
                  href={group.href}
                  aria-expanded={isOpen}
                  className={`inline-flex h-10 items-center rounded-full px-1.5 text-[#315f5d] transition hover:text-[#ff4f3c] ${
                    isOpen ? "text-[#ff4f3c]" : ""
                  }`}
                >
                  {group.label}
                </Link>
                <div
                  className={`absolute top-full left-0 z-50 w-72 pt-2 transition duration-150 ${
                    isOpen
                      ? "visible translate-y-0 opacity-100"
                      : "pointer-events-none invisible translate-y-1 opacity-0"
                  }`}
                >
                  <div className="rounded-[22px] border border-[#d7e8e5] bg-white p-3 shadow-[0_22px_70px_rgba(7,63,66,0.16)]">
                    <div className="grid gap-1">
                      {group.items.map(([label, href]) => (
                        <Link
                          key={label}
                          href={href}
                          className="flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-black text-[#073f42] hover:bg-[#f3faf8] hover:text-[#ff4f3c]"
                        >
                          {label}
                          <ArrowRight className="size-4" />
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={group.href}
                      className="mt-2 flex items-center justify-center rounded-full bg-[#073f42] px-4 py-2.5 text-sm font-black text-white"
                    >
                      Xem tất cả {group.label.toLowerCase()}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
          <Link href="/admin/analytics">Analytics</Link>
        </nav>

        <div className="ml-auto hidden h-11 max-w-md flex-1 items-center gap-3 rounded-full border border-[#d7e8e5] bg-white px-4 shadow-sm md:flex">
          <Search className="size-5 text-[#0d7773]" />
          <span className="truncate text-sm font-bold text-[#72908e]">
            Tìm pate, cát vệ sinh, snack, phụ kiện...
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
          <Link
            href="/products"
            aria-label="Mở trang sản phẩm"
            className="grid size-10 place-items-center rounded-full border border-[#d7e8e5] bg-white text-[#073f42]"
          >
            <Search className="size-5" />
          </Link>
          <button
            type="button"
            aria-label="Tài khoản"
            className="hidden size-10 place-items-center rounded-full border border-[#d7e8e5] bg-white text-[#073f42] sm:grid"
          >
            <UserRound className="size-5" />
          </button>
          <Link
            href="/cart"
            aria-label={`Giỏ hàng có ${cartCount} sản phẩm`}
            className="relative grid size-10 place-items-center rounded-full border border-[#d7e8e5] bg-white text-[#073f42]"
          >
            <ShoppingBag className="size-5" />
            {cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-[#ff4f3c] px-1 text-xs font-black text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      ) : null}
    </header>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] bg-[#073f42]/45 backdrop-blur-sm lg:hidden"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="flex h-full w-[min(88vw,380px)] flex-col bg-white shadow-[0_28px_90px_rgba(7,63,66,0.28)]">
        <div className="flex items-center justify-between border-b border-[#d9ece8] px-4 py-3">
          <Link
            href="/"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-[#073f42]"
          >
            <span className="grid size-10 place-items-center overflow-hidden rounded-2xl bg-[#f5fbfa]">
              <img
                src="/logo/logo.webp"
                alt=""
                className="h-full w-full object-contain p-1"
              />
            </span>
            <span className="text-xl font-black">3FStore</span>
          </Link>
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-[#d7e8e5]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <Link
            href="/products"
            onClick={onClose}
            className="mb-4 flex h-12 items-center gap-3 rounded-full bg-[#f3faf8] px-4 text-sm font-black text-[#073f42]"
          >
            <Search className="size-5 text-[#0d7773]" />
            Tìm sản phẩm nhanh
          </Link>

          <nav aria-label="Menu mobile" className="grid gap-3">
            {navGroups.map((group) => (
              <details
                key={group.label}
                className="group rounded-[22px] border border-[#d7e8e5] bg-white open:bg-[#f8fcfb]"
                open={group.label === "Sản phẩm"}
              >
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-black text-[#073f42] [&::-webkit-details-marker]:hidden">
                  {group.label}
                  <ChevronDown className="size-4 transition group-open:rotate-180" />
                </summary>
                <div className="grid gap-1 border-t border-[#e1eeeb] p-2">
                  <Link
                    href={group.href}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-2xl bg-[#073f42] px-3 py-2.5 text-sm font-black text-white"
                  >
                    Xem tất cả
                    <ArrowRight className="size-4" />
                  </Link>
                  {group.items.map(([label, href]) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={onClose}
                      className="flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-black text-[#315f5d] hover:bg-[#eef8f6]"
                    >
                      {label}
                      <ArrowRight className="size-4" />
                    </Link>
                  ))}
                </div>
              </details>
            ))}
            <Link
              href="/admin/analytics"
              onClick={onClose}
              className="flex min-h-12 items-center justify-between rounded-[22px] border border-[#d7e8e5] px-4 text-sm font-black text-[#073f42]"
            >
              Analytics
              <ArrowRight className="size-4" />
            </Link>
          </nav>
        </div>
      </section>
    </div>
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
      <CartDrawer />
    </div>
  );
}

function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  useEffect(() => {
    if (!isCartOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeCart, isCartOpen]);

  if (!isCartOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90] bg-[#073f42]/40 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeCart();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="ml-auto flex h-full w-full max-w-[460px] flex-col bg-white shadow-[0_30px_90px_rgba(7,63,66,0.28)]"
      >
        <div className="flex items-center justify-between border-b border-[#d9ece8] px-5 py-4">
          <div>
            <h2 id="cart-drawer-title" className="text-2xl font-black">
              Giỏ hàng của bạn
            </h2>
            <p className="mt-1 text-sm font-bold text-[#6d8a88]">
              {items.length} sản phẩm trong giỏ
            </p>
          </div>
          <button
            type="button"
            aria-label="Đóng giỏ hàng"
            onClick={closeCart}
            className="grid size-11 place-items-center rounded-full border border-[#d7e8e5]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {items.length > 0 ? (
            <div className="grid gap-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[76px_minmax(0,1fr)] gap-3 rounded-[22px] border border-[#dcebe8] bg-[#f8fcfb] p-3"
                >
                  <div className="overflow-hidden rounded-2xl bg-white">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full min-h-[76px] w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full min-h-[76px] place-items-center text-lg font-black text-[#9ab1af]">
                        3F
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm leading-5 font-black">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm font-black text-[#ff4f3c]">
                      {formatCurrency(item.price)}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex h-9 items-center rounded-full border border-[#d7e8e5] bg-white">
                        <button
                          type="button"
                          aria-label="Giảm số lượng"
                          onClick={() =>
                            setItemQuantity(item.id, item.quantity - 1)
                          }
                          className="grid size-9 place-items-center"
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="min-w-7 text-center text-sm font-black">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Tăng số lượng"
                          onClick={() =>
                            setItemQuantity(item.id, item.quantity + 1)
                          }
                          className="grid size-9 place-items-center"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label="Xóa khỏi giỏ"
                        onClick={() => removeItem(item.id)}
                        className="grid size-9 place-items-center rounded-full text-[#8d6d68] hover:bg-[#fff0ee] hover:text-[#ff4f3c]"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid min-h-[360px] place-items-center text-center">
              <div>
                <ShoppingBag className="mx-auto size-12 text-[#9ab1af]" />
                <p className="mt-4 text-xl font-black">Giỏ hàng đang trống</p>
                <p className="mt-2 text-sm font-semibold text-[#6d8a88]">
                  Chọn vài món phù hợp cho boss rồi quay lại đây.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[#d9ece8] bg-white p-5">
          <div className="mb-4 flex items-end justify-between">
            <span className="text-sm font-black text-[#6d8a88]">Tạm tính</span>
            <span className="text-3xl font-black text-[#111827]">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="grid gap-3">
            <button
              type="button"
              className="h-[52px] rounded-full bg-[#ff4f3c] px-5 text-sm font-black text-white shadow-[0_18px_45px_rgba(255,79,60,0.28)]"
            >
              Thanh toán nhanh
            </button>
            <Link
              href="/cart"
              onClick={closeCart}
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#cfe3df] px-5 text-sm font-black text-[#073f42]"
            >
              Xem giỏ hàng
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
