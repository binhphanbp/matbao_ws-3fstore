"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/tracker";

type RegisterMethod = "phone" | "zalo" | "email";

const methodLabels: Record<RegisterMethod, string> = {
  phone: "Số điện thoại",
  zalo: "Zalo",
  email: "Email",
};

const methodIcons = {
  phone: Phone,
  zalo: MessageCircle,
  email: Mail,
};

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "").slice(0, 11);
}

function normalizeOtp(value: string) {
  return value
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 6);
}

function isValidVietnamPhone(value: string) {
  return /^0\d{9}$/.test(value);
}

function maskPhone(value: string) {
  return `${value.slice(0, 3)} *** ${value.slice(-3)}`;
}

function maskEmail(value: string) {
  return value.replace(/^(.{2}).+(@.+)$/u, "$1***$2");
}

export function PhoneRegisterPage() {
  const searchParams = useSearchParams();
  const coupon = searchParams.get("coupon") ?? "BOSS50";
  const [method, setMethod] = useState<RegisterMethod>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [step, setStep] = useState<"input" | "otp" | "done">("input");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const formattedCoupon = useMemo(() => coupon.toUpperCase(), [coupon]);
  const cleanPhone = normalizePhone(phone);
  const ContactIcon = methodIcons[method];
  const contactLabel =
    method === "email" ? email : cleanPhone ? maskPhone(cleanPhone) : "";

  const resetVerification = (nextMethod: RegisterMethod) => {
    setMethod(nextMethod);
    setStep("input");
    setError("");
    setOtp("");
    setSentOtp("");
  };

  const handleSendOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (method === "phone" || method === "zalo") {
      if (!isValidVietnamPhone(cleanPhone)) {
        setError("Vui lòng nhập số điện thoại 10 số, bắt đầu bằng 0.");
        return;
      }
    }

    if (method === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }

    setIsSending(true);
    const demoOtp =
      method === "email" ? "3F2026" : `3F${cleanPhone.slice(-4)}`.slice(0, 6);

    window.setTimeout(() => {
      setSentOtp(demoOtp);
      setOtp(demoOtp);
      setStep("otp");
      setIsSending(false);
      trackAnalyticsEvent("service_interest", {
        sectionId: "register",
        elementId: "register:send-code",
        metadata: {
          method,
          coupon: formattedCoupon,
          contact:
            method === "email" ? maskEmail(email) : maskPhone(cleanPhone),
        },
      });
    }, 450);
  };

  const handleVerifyOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (normalizeOtp(otp) !== sentOtp) {
      setError("Mã xác thực chưa đúng.");
      return;
    }

    localStorage.setItem(
      "3fstore-demo-member",
      JSON.stringify({
        method,
        phone: method === "email" ? undefined : cleanPhone,
        email: method === "email" ? email : undefined,
        coupon: formattedCoupon,
        registeredAt: new Date().toISOString(),
      }),
    );
    setStep("done");
    trackAnalyticsEvent("service_interest", {
      sectionId: "register",
      elementId: "register:complete",
      metadata: {
        method,
        coupon: formattedCoupon,
      },
    });
  };

  const handleSocialDemo = (provider: "google" | "facebook") => {
    localStorage.setItem(
      "3fstore-demo-member",
      JSON.stringify({
        method: provider,
        coupon: formattedCoupon,
        registeredAt: new Date().toISOString(),
      }),
    );
    setStep("done");
    trackAnalyticsEvent("service_interest", {
      sectionId: "register",
      elementId: `register:${provider}`,
      metadata: {
        method: provider,
        coupon: formattedCoupon,
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#f7fbfa] text-[#073f42]">
      <header className="border-b border-[#d9ece8] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-black"
            aria-label="3FStore"
          >
            <span className="relative block size-10 overflow-hidden rounded-xl border border-[#e2eeeb] bg-white">
              <Image
                src="/logo/logo.webp"
                alt=""
                fill
                sizes="40px"
                className="object-contain p-1"
              />
            </span>
            <span>3FStore</span>
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#d7e8e5] px-3 text-sm font-black text-[#0b5557]"
          >
            <ChevronLeft className="size-4" />
            Quay lại
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[1120px] gap-5 px-4 py-5 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="rounded-[20px] border border-[#d7e8e5] bg-white p-4 shadow-[0_12px_40px_rgba(7,63,66,0.06)] sm:p-6">
          <div className="max-w-xl">
            <p className="text-sm font-black text-[#0b7773]">
              Đăng ký tài khoản
            </p>
            <h1 className="mt-2 text-3xl leading-tight font-black sm:text-4xl">
              Tạo tài khoản 3FStore
            </h1>
            <p className="mt-2 text-sm leading-6 font-semibold text-[#587a78]">
              Lưu thông tin mua hàng, nhận mã ưu đãi và đặt lại các món quen
              thuộc nhanh hơn.
            </p>
          </div>

          {step !== "done" ? (
            <>
              <div className="mt-6 grid grid-cols-3 rounded-[14px] bg-[#eef8f6] p-1">
                {(["phone", "zalo", "email"] as RegisterMethod[]).map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => resetVerification(item)}
                      className={`h-10 rounded-[11px] text-sm font-black transition ${
                        method === item
                          ? "bg-white text-[#073f42] shadow-sm"
                          : "text-[#587a78]"
                      }`}
                    >
                      {methodLabels[item]}
                    </button>
                  ),
                )}
              </div>

              {step === "input" ? (
                <form className="mt-5 grid gap-4" onSubmit={handleSendOtp}>
                  <label>
                    <span className="mb-2 block text-sm font-black">
                      {methodLabels[method]}
                    </span>
                    <div className="flex h-12 items-center gap-3 rounded-[14px] border border-[#d7e8e5] bg-white px-4 focus-within:border-[#ff4f3c]">
                      <ContactIcon className="size-5 shrink-0 text-[#0b7773]" />
                      {method === "email" ? (
                        <input
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="email@domain.com"
                          className="min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:text-[#91a8a6]"
                        />
                      ) : (
                        <input
                          value={phone}
                          onChange={(event) =>
                            setPhone(normalizePhone(event.target.value))
                          }
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder={
                            method === "zalo"
                              ? "Số điện thoại dùng Zalo"
                              : "0901234567"
                          }
                          className="min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:text-[#91a8a6]"
                        />
                      )}
                    </div>
                  </label>

                  {error ? (
                    <p className="rounded-[12px] bg-[#fff0ee] px-3 py-2 text-sm font-bold text-[#ff4f3c]">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSending}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#ff4f3c] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(255,79,60,0.22)] disabled:opacity-60"
                  >
                    {isSending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : null}
                    Gửi mã xác thực
                  </button>
                </form>
              ) : null}

              {step === "otp" ? (
                <form
                  className="mt-5 rounded-[16px] border border-[#d7e8e5] bg-[#f8fcfb] p-4"
                  onSubmit={handleVerifyOtp}
                >
                  <p className="text-sm font-bold text-[#587a78]">
                    Mã đã gửi tới{" "}
                    <span className="font-black text-[#073f42]">
                      {contactLabel}
                    </span>
                  </p>
                  <p className="mt-1 text-sm font-black text-[#0b7773]">
                    OTP demo: {sentOtp}
                  </p>
                  <label className="mt-4 block">
                    <span className="mb-2 block text-sm font-black">
                      Nhập mã xác thực
                    </span>
                    <input
                      value={otp}
                      onChange={(event) =>
                        setOtp(normalizeOtp(event.target.value))
                      }
                      className="h-12 w-full rounded-[14px] border border-[#d7e8e5] bg-white px-4 text-center text-xl font-black tracking-[0.16em] outline-none focus:border-[#ff4f3c]"
                    />
                  </label>
                  <button
                    type="submit"
                    className="mt-4 h-12 w-full rounded-[14px] bg-[#073f42] text-sm font-black text-white"
                  >
                    Xác nhận đăng ký
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("input");
                      setOtp("");
                      setSentOtp("");
                    }}
                    className="mt-2 h-11 w-full rounded-[14px] border border-[#d7e8e5] bg-white text-sm font-black"
                  >
                    Quay lại nhập thông tin
                  </button>
                </form>
              ) : null}

              <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-bold text-[#8aa5a2]">
                <span className="h-px bg-[#e1eeeb]" />
                hoặc
                <span className="h-px bg-[#e1eeeb]" />
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleSocialDemo("google")}
                  className="h-11 rounded-[14px] border border-[#d7e8e5] bg-white text-sm font-black"
                >
                  Tiếp tục với Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialDemo("facebook")}
                  className="h-11 rounded-[14px] border border-[#d7e8e5] bg-white text-sm font-black"
                >
                  Tiếp tục với Facebook
                </button>
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-[18px] border border-[#cfeee8] bg-[#effbf8] p-5">
              <CheckCircle2 className="size-10 text-[#0b7773]" />
              <h2 className="mt-3 text-2xl font-black">
                Đăng ký thành công
              </h2>
              <p className="mt-2 text-sm leading-6 font-semibold text-[#587a78]">
                Tài khoản demo đã sẵn sàng. Mã {formattedCoupon} đã được lưu
                cho lần mua đầu.
              </p>
              <Link
                href="/products"
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#ff4f3c] px-5 text-sm font-black text-white"
              >
                Mua sắm ngay
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}

          <p className="mt-5 text-xs leading-5 font-semibold text-[#7d9694]">
            Demo không gửi SMS thật. Khi triển khai production sẽ nối SMS/Zalo
            OTP, OAuth và backend tài khoản khách hàng.
          </p>
        </div>

        <aside className="rounded-[20px] border border-[#d7e8e5] bg-white p-4 shadow-[0_12px_40px_rgba(7,63,66,0.05)] sm:p-5">
          <div className="rounded-[16px] border border-dashed border-[#ffb8aa] bg-[#fff7f5] p-4">
            <p className="text-sm font-black text-[#ff4f3c]">Mã của bạn</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-3xl font-black tracking-tight">
                {formattedCoupon}
              </span>
              <span className="rounded-full bg-[#ff4f3c] px-3 py-1.5 text-xs font-black text-white">
                Lưu sau đăng ký
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 font-semibold text-[#6b7f7d]">
              Áp dụng cho khách mới. Ưu đãi sẽ nằm trong tài khoản demo sau khi
              xác thực.
            </p>
          </div>

          <div className="mt-4 grid gap-3 text-sm font-semibold text-[#587a78]">
            {[
              "Mua lại sản phẩm quen thuộc nhanh hơn.",
              "Lưu số điện thoại nhận hàng.",
              "Nhận tư vấn và nhắc lịch mua đồ cho boss.",
            ].map((item) => (
              <div key={item} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0b7773]" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <Link
            href="/products"
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[14px] border border-[#d7e8e5] text-sm font-black"
          >
            Xem sản phẩm trước
          </Link>
        </aside>
      </section>
    </main>
  );
}
