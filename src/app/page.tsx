import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import EnergyGoal from './EnergyGoal';
import FaqChatbot from './FaqChatbot';
import { DemoHeader } from './DemoAuth';
import MainNavigation from './MainNavigation';
import { HomeEnergyHero, HomeEnergyProvider } from './HomeEnergyDemo';
import {
  electricitySavings,
  estimatedElectricityBill,
  formatBillAmount,
} from '@/lib/demo-electricity';

export const metadata: Metadata = {
  title: 'POLAR HOME | 나의 작은 절약',
  description: '에너지를 아끼고 북극곰의 집을 함께 지켜요.',
};

const stats = [
  {
    icon: '⚡',
    label: '절약한 전력량',
    value: '18',
    unit: 'kWh',
    description: '지난달보다 6 kWh 더 절약했어요',
  },
  {
    icon: '🌿',
    label: '추정 탄소 감축량',
    value: '8.4',
    unit: 'kgCO₂e',
    description: '작은 절약이 만드는 변화',
  },
];

export default function Home() {
  return (
    <HomeEnergyProvider>
      <div className="min-h-screen bg-[#eaf5fb] text-[#123253]">
        <div className="relative mx-auto min-h-screen max-w-lg bg-[#f3fbff] pb-28 shadow-xl">
          <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6">
            <Link
              href="/"
              aria-label="POLAR HOME 홈"
              className="flex min-h-11 items-center gap-2 rounded-lg text-xl font-black focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <Image
                src="/polar-bear/wave.png"
                alt=""
                width={32}
                height={32}
                className="size-8 object-contain"
              />
              POLAR HOME
            </Link>
            <DemoHeader />
          </header>

          <main id="main-content">
            <HomeEnergyHero />

            <div className="relative -mt-6 space-y-4 rounded-t-[32px] bg-[#f3fbff] px-5 pt-5">
              <p className="text-right text-xs text-slate-600">
                예시 데이터 · 실제 사용량 연동 전
              </p>

              <Link
                href="/mypage#analysis"
                className="block rounded-3xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
              >
                <h2 className="flex items-center justify-between text-sm font-bold">
                  <span>
                    <span aria-hidden="true">⚡ </span>
                    이번 달 예상 전기요금
                  </span>
                  <span aria-hidden="true">›</span>
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <p className="text-4xl font-extrabold tracking-tight">
                    {formatBillAmount(estimatedElectricityBill)}
                    <span className="ml-1 text-lg">원</span>
                  </p>
                  <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                    지난달 대비 {formatBillAmount(electricitySavings)}원 절약
                  </span>
                </div>
                <p className="mt-3 text-xs font-bold text-emerald-800">
                  요금 분석 보기 →
                </p>
              </Link>

              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <section
                    key={stat.label}
                    className="rounded-3xl border border-white bg-[#eaf7ff] p-4 shadow-sm"
                  >
                    <h2 className="text-sm font-bold">
                      <span aria-hidden="true">{stat.icon} </span>
                      {stat.label}
                    </h2>
                    <p className="mt-4 text-3xl font-extrabold">
                      {stat.value}
                      <span className="ml-1 text-sm font-medium">
                        {stat.unit}
                      </span>
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      {stat.description}
                    </p>
                  </section>
                ))}
              </div>

              <EnergyGoal />

              <Link
                href="/missions"
                className="flex min-h-14 items-center justify-between rounded-2xl bg-emerald-700 px-6 py-4 font-bold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"
              >
                <span>🌱 오늘의 절약 미션</span>
                <span aria-hidden="true">→</span>
              </Link>
              <FaqChatbot />
              <p className="pb-2 text-center text-xs text-slate-600">
                오늘의 작은 실천으로 더 푸른 내일을 만들어요.
              </p>
            </div>
          </main>

          <MainNavigation />
        </div>
      </div>
    </HomeEnergyProvider>
  );
}
