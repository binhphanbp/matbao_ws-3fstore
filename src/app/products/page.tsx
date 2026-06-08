import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductListPage } from "@/components/products/product-list-page";
import {
  getAllProductPreviews,
  productBrands,
  productCategories,
} from "@/data/products";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description:
    "Mua nhanh đồ ăn thú cưng, cát vệ sinh, phụ kiện và sản phẩm chăm sóc tại 3FStore.",
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#f5fbfa] px-4 text-[#073f42]">
          <p className="rounded-full bg-white px-5 py-3 text-sm font-black shadow-sm">
            Đang tải sản phẩm...
          </p>
        </main>
      }
    >
      <ProductListPage
        products={getAllProductPreviews()}
        categories={productCategories}
        brands={productBrands}
      />
    </Suspense>
  );
}
