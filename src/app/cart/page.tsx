import type { Metadata } from "next";

import { CartPage } from "@/components/products/cart-page";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  description: "Xem và chỉnh giỏ hàng 3FStore trước khi thanh toán.",
};

export default function Page() {
  return <CartPage />;
}
