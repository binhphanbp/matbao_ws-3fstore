import type { Metadata } from "next";
import { Suspense } from "react";

import { PhoneRegisterPage } from "@/components/auth/phone-register-page";

export const metadata: Metadata = {
  title: "Đăng ký nhận mã",
  description:
    "Đăng ký nhanh bằng số điện thoại để nhận mã giảm giá 3FStore.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#f5fbfa] px-4 text-[#073f42]">
          <p className="rounded-full bg-white px-5 py-3 text-sm font-black shadow-sm">
            Đang mở đăng ký...
          </p>
        </main>
      }
    >
      <PhoneRegisterPage />
    </Suspense>
  );
}
