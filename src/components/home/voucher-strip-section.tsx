"use client";

import {
  BadgePercent,
  ChevronDown,
  Gift,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/tracker";

type VoucherGroup = "Tất cả" | "Khách mới" | "Freeship" | "Combo" | "Dịch vụ";

type Voucher = {
  code: string;
  title: string;
  note: string;
  group: Exclude<VoucherGroup, "Tất cả">;
  accent: string;
  priority?: boolean;
};

const vouchers: Voucher[] = [
  {
    code: "BOSS50",
    title: "Giảm 50k",
    note: "Đơn từ 399k cho khách mới",
    group: "Khách mới",
    accent: "bg-[#ff4f3c]",
    priority: true,
  },
  {
    code: "FREESHIP",
    title: "Miễn phí giao",
    note: "Nội thành, đơn từ 199k",
    group: "Freeship",
    accent: "bg-[#0b7773]",
    priority: true,
  },
  {
    code: "NEWBOSS",
    title: "Quà cho boss",
    note: "Tặng quà nhỏ khi đăng ký",
    group: "Khách mới",
    accent: "bg-[#f4b400]",
    priority: true,
  },
  {
    code: "PATE30",
    title: "Pate giảm 30k",
    note: "Cho nhóm pate & thức ăn ướt",
    group: "Combo",
    accent: "bg-[#ff7a45]",
  },
  {
    code: "CATLITTER40",
    title: "Cát giảm 40k",
    note: "Đơn cát vệ sinh từ 299k",
    group: "Combo",
    accent: "bg-[#2563eb]",
  },
  {
    code: "COMBO15",
    title: "Combo -15%",
    note: "Áp dụng gói combo 5 món",
    group: "Combo",
    accent: "bg-[#7c3aed]",
  },
  {
    code: "SPA100",
    title: "Spa giảm 100k",
    note: "Dịch vụ grooming lần đầu",
    group: "Dịch vụ",
    accent: "bg-[#db2777]",
  },
  {
    code: "CARE20",
    title: "Care giảm 20k",
    note: "Sữa tắm, lược, vệ sinh",
    group: "Dịch vụ",
    accent: "bg-[#0891b2]",
  },
  {
    code: "SHIPNOW",
    title: "Giao nhanh",
    note: "Hỗ trợ giao trong ngày",
    group: "Freeship",
    accent: "bg-[#059669]",
  },
];

const groups: VoucherGroup[] = [
  "Tất cả",
  "Khách mới",
  "Freeship",
  "Combo",
  "Dịch vụ",
];

function trackVoucher(code: string, source: string) {
  trackAnalyticsEvent("service_interest", {
    sectionId: "vouchers",
    elementId: `voucher:${source}:${code}`,
    metadata: { coupon: code },
  });
}

export function VoucherStripSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<VoucherGroup>("Tất cả");
  const featuredVouchers = vouchers.filter((voucher) => voucher.priority);
  const filteredVouchers = useMemo(
    () =>
      selectedGroup === "Tất cả"
        ? vouchers
        : vouchers.filter((voucher) => voucher.group === selectedGroup),
    [selectedGroup],
  );

  return (
    <section
      id="vouchers"
      data-track-section="vouchers"
      className="bg-[#fbfffe] py-4 text-[#073f42] sm:py-6"
      aria-labelledby="voucher-strip-title"
    >
      <div className="mx-auto max-w-[1160px] px-4 sm:px-0">
        <div className="rounded-[18px] border border-[#d7e8e5] bg-white p-3 shadow-[0_12px_34px_rgba(7,63,66,0.06)] sm:rounded-[22px] sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 text-xs font-black tracking-[0.08em] text-[#ff4f3c] uppercase">
                <BadgePercent className="size-4" aria-hidden />
                Mã ưu đãi
              </p>
              <h2
                id="voucher-strip-title"
                className="mt-1 text-xl leading-tight font-black sm:text-2xl"
              >
                Lưu mã trước khi mua.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-[#d7e8e5] bg-white px-3 text-sm font-black text-[#073f42] transition hover:border-[#ff4f3c] hover:text-[#ff4f3c]"
            >
              Xem tất cả
              <ChevronDown className="size-4" aria-hidden />
            </button>
          </div>

          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {featuredVouchers.map((voucher) => (
              <VoucherCard key={voucher.code} voucher={voucher} compact />
            ))}
          </div>
        </div>
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[90] bg-[#073f42]/45 p-3 backdrop-blur-sm sm:grid sm:place-items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <section className="mt-auto flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_28px_90px_rgba(7,63,66,0.24)] sm:mt-0 sm:max-w-3xl">
            <header className="flex items-start justify-between gap-3 border-b border-[#e1eeeb] p-4">
              <div>
                <h3 className="text-2xl font-black">Kho mã 3FStore</h3>
                <p className="mt-1 text-sm font-semibold text-[#66817f]">
                  Chọn mã phù hợp, lưu mã sẽ chuyển qua đăng ký nhanh.
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng kho mã"
                onClick={() => setIsOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d7e8e5]"
              >
                <X className="size-5" aria-hidden />
              </button>
            </header>

            <div className="border-b border-[#e1eeeb] px-4 py-3">
              <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {groups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setSelectedGroup(group)}
                    className={`h-9 shrink-0 rounded-full px-3 text-sm font-black ${
                      selectedGroup === group
                        ? "bg-[#073f42] text-white"
                        : "bg-[#f3faf8] text-[#315f5d]"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredVouchers.map((voucher) => (
                  <VoucherCard key={voucher.code} voucher={voucher} />
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function VoucherCard({
  voucher,
  compact = false,
}: {
  voucher: Voucher;
  compact?: boolean;
}) {
  const Icon = voucher.group === "Freeship" ? Truck : voucher.code === "NEWBOSS" ? Gift : BadgePercent;

  return (
    <Link
      href={`/register?coupon=${voucher.code}`}
      data-track-action="true"
      data-track-id={`voucher:save:${voucher.code}`}
      data-track-section="vouchers"
      onClick={() => trackVoucher(voucher.code, compact ? "featured" : "list")}
      className={`group grid shrink-0 grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border border-[#dcebe8] bg-[#f8fcfb] p-2.5 transition hover:border-[#ff9b8e] sm:rounded-[16px] sm:p-3 ${
        compact ? "w-[280px] sm:w-auto" : ""
      }`}
    >
      <span
        className={`grid size-12 place-items-center rounded-[14px] text-white ${voucher.accent}`}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-black">{voucher.title}</span>
        <span className="mt-0.5 block truncate text-xs font-bold text-[#66817f]">
          {voucher.note}
        </span>
        {!compact ? (
          <span className="mt-1 block text-[11px] font-black text-[#0b7773]">
            {voucher.code}
          </span>
        ) : null}
      </span>
      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#ff4f3c] shadow-sm group-hover:bg-[#ff4f3c] group-hover:text-white">
        Lưu
      </span>
    </Link>
  );
}
