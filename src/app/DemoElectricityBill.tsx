'use client';

import Link from 'next/link';
import { useDemoUser } from './DemoAuth';
import { demoBillForUsage, formatBillAmount } from '@/lib/demo-electricity';
import { useDemoAppliances } from './useDemoAppliances';

export function useDemoElectricityBill() {
  const { user } = useDemoUser();
  const { usage } = useDemoAppliances();
  return user ? demoBillForUsage(usage) : null;
}

export function DemoBillCard() {
  const bill = useDemoElectricityBill();
  if (!bill) return null;
  return (
    <Link
      href="/mypage#analysis"
      data-demo-bill={bill.amount}
      className="block rounded-3xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
    >
      <h2 className="flex items-center justify-between text-sm font-bold">
        <span>⚡ 이번 달 예상 전기요금</span>
        <span aria-hidden="true">›</span>
      </h2>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="text-4xl font-extrabold tracking-tight">
          {formatBillAmount(bill.amount)}
          <span className="ml-1 text-lg">원</span>
        </p>
        <span
          className={`rounded-full px-3 py-2 text-xs font-bold ${bill.savings >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}
        >
          지난달 대비 {formatBillAmount(Math.abs(bill.savings))}원{' '}
          {bill.savings >= 0 ? '절약' : '증가'}
        </span>
      </div>
      <p className="mt-3 text-xs font-bold text-emerald-800">
        요금 분석 보기 →
      </p>
    </Link>
  );
}

export function DemoBillSummary() {
  const bill = useDemoElectricityBill();
  if (!bill) return null;
  return (
    <p
      data-demo-bill={bill.amount}
      className="mt-3 rounded-xl bg-white/85 px-3 py-2 text-xs leading-5"
    >
      이번 달 예상 전기요금 <strong>{formatBillAmount(bill.amount)}원</strong>
      <span
        className={`ml-2 font-bold ${bill.savings >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}
      >
        지난달 대비 {formatBillAmount(Math.abs(bill.savings))}원{' '}
        {bill.savings >= 0 ? '절약' : '증가'}
      </span>
    </p>
  );
}
