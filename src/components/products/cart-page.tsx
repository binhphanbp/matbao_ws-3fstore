/* eslint-disable @next/next/no-img-element */
"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";

import { StorefrontPageShell } from "@/components/products/storefront-chrome";
import { useCartStore } from "@/store/cart-store";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 300000 || subtotal === 0 ? 0 : 25000;
  const total = subtotal + shipping;

  return (
    <StorefrontPageShell>
      <main className="mx-auto grid w-full max-w-[1480px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <section className="min-w-0 rounded-[30px] border border-[#d7e8e5] bg-white p-5 shadow-[0_18px_60px_rgba(7,63,66,0.08)]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black tracking-[0.14em] text-[#0d7773] uppercase">
                Checkout demo
              </p>
              <h1 className="mt-2 text-3xl font-black text-[#073f42]">
                Giỏ hàng của bạn
              </h1>
            </div>
            {items.length > 0 ? (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-full border border-[#d7e8e5] px-4 py-2 text-sm font-black text-[#073f42] hover:border-[#ff4f3c] hover:text-[#ff4f3c]"
              >
                Xóa giỏ
              </button>
            ) : null}
          </div>

          {items.length > 0 ? (
            <div className="grid gap-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-[24px] border border-[#dcebe8] bg-[#f8fcfb] p-4 sm:grid-cols-[120px_minmax(0,1fr)_160px]"
                >
                  <div className="aspect-square overflow-hidden rounded-[20px] bg-white">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-2xl font-black text-[#9ab1af]">
                        3F
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-lg leading-7 font-black text-[#073f42]">
                      {item.name}
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#6d8a88]">
                      {item.category}
                    </p>
                    <p className="mt-3 text-xl font-black text-[#ff4f3c]">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <div className="flex h-11 items-center rounded-full border border-[#d7e8e5] bg-white">
                      <button
                        type="button"
                        aria-label="Giảm số lượng"
                        onClick={() =>
                          setItemQuantity(item.id, item.quantity - 1)
                        }
                        className="grid size-11 place-items-center"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-black">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Tăng số lượng"
                        onClick={() =>
                          setItemQuantity(item.id, item.quantity + 1)
                        }
                        className="grid size-11 place-items-center"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black text-[#8d6d68] hover:bg-[#fff0ee] hover:text-[#ff4f3c]"
                    >
                      <Trash2 className="size-4" />
                      Xóa
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid min-h-[420px] place-items-center rounded-[26px] border border-dashed border-[#bdded9] bg-[#f8fcfb] text-center">
              <div>
                <ShoppingBag className="mx-auto size-14 text-[#9ab1af]" />
                <p className="mt-4 text-2xl font-black text-[#073f42]">
                  Giỏ hàng đang trống
                </p>
                <Link
                  href="/products"
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#ff4f3c] px-6 text-sm font-black text-white"
                >
                  Mua sắm ngay
                </Link>
              </div>
            </div>
          )}
        </section>

        <aside className="self-start rounded-[30px] border border-[#d7e8e5] bg-white p-5 shadow-[0_18px_60px_rgba(7,63,66,0.08)] lg:sticky lg:top-24">
          <h2 className="text-2xl font-black text-[#073f42]">Tóm tắt đơn</h2>
          <div className="mt-5 grid gap-3 text-sm font-bold text-[#587a78]">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span className="text-[#073f42]">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Giao hàng</span>
              <span className="text-[#073f42]">
                {shipping === 0 ? "Miễn phí" : formatCurrency(shipping)}
              </span>
            </div>
            <div className="border-t border-[#e1eeeb] pt-4">
              <div className="flex items-end justify-between">
                <span className="text-base font-black text-[#073f42]">
                  Tổng cộng
                </span>
                <span className="text-3xl font-black text-[#111827]">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={items.length === 0}
            className="mt-6 h-[52px] w-full rounded-full bg-[#ff4f3c] px-5 text-sm font-black text-white shadow-[0_18px_45px_rgba(255,79,60,0.28)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Thanh toán nhanh
          </button>
          <Link
            href="/products"
            className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-full border border-[#cfe3df] px-5 text-sm font-black text-[#073f42]"
          >
            Tiếp tục mua
          </Link>
        </aside>
      </main>
    </StorefrontPageShell>
  );
}
