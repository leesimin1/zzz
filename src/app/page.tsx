import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import EnergyGoal from './EnergyGoal';

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

const navigation = [
  { icon: '⌂', label: '홈', href: '/' },
  { icon: '☀', label: '태양광', href: '/solar' },
  { icon: '🌱', label: '미션', href: '/missions' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#eaf5fb] text-[#123253]">
      <div className="relative mx-auto min-h-screen max-w-lg bg-[#f3fbff] pb-28 shadow-xl">
        <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6">
          <Link
            href="/"
            aria-label="POLAR HOME 홈"
            className="flex min-h-11 items-center gap-2 rounded-lg text-xl font-black focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <span aria-hidden="true">🐻‍❄️</span>
            POLAR HOME
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-white/85 px-4 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            로그인
          </Link>
        </header>

        <main id="main-content">
          <section
            aria-labelledby="welcome-title"
            className="relative h-[520px] overflow-hidden bg-sky-200"
          >
            <Image
              src="/main/polar-hero.png"
              alt="초록 목도리를 두르고 빙하 위에 앉아 있는 북극곰"
              fill
              priority
              sizes="(max-width: 512px) 100vw, 512px"
              className="object-cover"
            />
            <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-sky-100/95 to-transparent" />
            <div className="relative px-6 pt-28">
              <p className="mb-2 text-sm font-bold text-[#126b92]">
                나의 작은 절약, 북극곰의 행복
              </p>
              <h1
                id="welcome-title"
                className="text-2xl leading-snug font-extrabold tracking-tight"
              >
                오늘도 지구를 위한
                <br />
                좋은 선택을 해볼까요?
              </h1>
              <p className="mt-3 text-sm">
                당신의 실천이 북극곰의 집을 지켜요.
              </p>
            </div>
          </section>

          <div className="relative -mt-6 space-y-4 rounded-t-[32px] bg-[#f3fbff] px-5 pt-5">
            <p className="text-right text-xs text-slate-600">
              예시 데이터 · 실제 사용량 연동 전
            </p>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold">
                <span aria-hidden="true">⚡ </span>
                이번 달 예상 전기요금
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-4xl font-extrabold tracking-tight">
                  75,000<span className="ml-1 text-lg">원</span>
                </p>
                <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                  지난달 대비 12,000원 절약
                </span>
              </div>
            </section>

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
            <p className="pb-2 text-center text-xs text-slate-600">
              오늘의 작은 실천으로 더 푸른 내일을 만들어요.
            </p>
          </div>
        </main>

        <nav
          aria-label="주요 메뉴"
          className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-lg grid-cols-4 border-t border-sky-100 bg-white/95 px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.href === '/' ? 'page' : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 ${
                item.href === '/'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:bg-sky-50'
              }`}
            >
              <span aria-hidden="true" className="text-2xl">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
          <details className="relative">
            <summary className="flex min-h-14 cursor-pointer list-none flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold text-slate-600 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
              <span aria-hidden="true" className="text-2xl">
                ♙
              </span>
              마이페이지
            </summary>

            <div className="absolute right-0 bottom-[calc(100%+12px)] w-60 rounded-2xl border border-sky-100 bg-white p-3 shadow-xl">
              <p className="px-3 py-2 text-sm font-bold">내 계정</p>
              <Link
                href="/login"
                className="mt-2 block rounded-xl bg-emerald-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="mt-2 block rounded-xl border border-emerald-700 px-4 py-3 text-center text-sm font-bold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                회원가입
              </Link>
              <Link
                href="/mypage"
                className="mt-2 block rounded-xl px-4 py-3 text-center text-sm text-slate-600 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                마이페이지로 이동 →
              </Link>
            </div>
          </details>
        </nav>
      </div>
    </div>
  );
}
