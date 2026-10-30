'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import Image from 'next/image';
import { demoUsageForAddress } from '@/lib/demo-home';
import { useDemoUser } from './DemoAuth';

type EnergyDemo = {
  goal: number;
  usage: number;
  address: string;
  success: boolean;
  setGoal: Dispatch<SetStateAction<number>>;
};

const EnergyDemoContext = createContext<EnergyDemo | null>(null);

export function HomeEnergyProvider({ children }: { children: ReactNode }) {
  const [goal, setGoal] = useState(200);
  const { user } = useDemoUser();
  const address = user?.address ?? '';
  const usage = demoUsageForAddress(address);

  return (
    <EnergyDemoContext.Provider
      value={{ goal, usage, address, success: usage <= goal, setGoal }}
    >
      {children}
    </EnergyDemoContext.Provider>
  );
}

export function useHomeEnergyDemo() {
  const demo = useContext(EnergyDemoContext);
  if (!demo) throw new Error('HomeEnergyProvider 안에서 사용해야 합니다.');
  return demo;
}

export function HomeEnergyHero() {
  const { success, goal, usage } = useHomeEnergyDemo();
  const [celebration, setCelebration] = useState(0);
  const cheering = celebration > 0;

  useEffect(() => {
    if (!celebration) return;
    const timer = window.setTimeout(() => setCelebration(0), 2000);
    return () => window.clearTimeout(timer);
  }, [celebration]);

  return (
    <section
      aria-labelledby="welcome-title"
      className="relative isolate h-[560px] overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-[#dff8ff]"
    >
      <div
        aria-hidden="true"
        className="absolute -right-12 top-28 h-16 w-48 rounded-full bg-white/60 blur-sm"
      />
      <div
        aria-hidden="true"
        className="absolute -left-12 top-60 h-12 w-40 rounded-full bg-white/60 blur-sm"
      />
      <div className="relative z-10 px-6 pt-28">
        <p
          className={`mb-2 text-sm font-bold ${success ? 'text-emerald-800' : 'text-rose-800'}`}
        >
          {success
            ? '절약 성공 · 북극곰이 웃고 있어요'
            : '절약 실패 · 북극곰이 울고 있어요'}
        </p>
        <h1
          id="welcome-title"
          className="text-2xl leading-snug font-extrabold tracking-tight"
        >
          {success ? (
            <>
              오늘의 절약이
              <br />
              북극곰을 웃게 했어요!
            </>
          ) : (
            <>
              조금만 더 아껴서
              <br />
              북극곰의 웃음을 찾아줘요.
            </>
          )}
        </h1>
        <p className="mt-3 text-sm">
          이번 달 사용량 {usage}kWh / 목표 {goal}kWh
        </p>
      </div>
      <svg
        aria-hidden="true"
        viewBox="0 0 512 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[200px] w-full"
      >
        <defs>
          <linearGradient id="home-arctic-water" x2="0" y2="1">
            <stop stopColor="#bcefff" stopOpacity="0" />
            <stop offset="1" stopColor="#65cde9" />
          </linearGradient>
          <linearGradient id="home-ice-front" x2="0" y2="1">
            <stop stopColor="#c7f2ff" />
            <stop offset="1" stopColor="#63bce5" />
          </linearGradient>
        </defs>
        <path fill="#d7f5ff" d="M0 94 29 58 42 76 64 34 88 75 111 99Z" />
        <path fill="#fff" d="m29 58-11 32 24-14 22-42-7 39 31 2-24-41-22 42Z" />
        <path fill="#a4def5" d="m64 34 24 41 23 24-40-9Z" />
        <path fill="#c4ecfb" d="m400 100 35-30 20-45 24 44 33 22v22Z" />
        <path fill="#fff" d="m435 70 20-45 24 44-21-9-12 24Z" />
        <path fill="url(#home-arctic-water)" d="M0 76h512v124H0Z" />
        <g fill="none" stroke="#e6faff" strokeWidth="2" opacity=".8">
          <path d="M9 123h55m-39 23h46m365-24h61m-49 30h48M9 178h55m381 8h43" />
          <ellipse cx="256" cy="175" rx="193" ry="17" />
        </g>
        <path
          fill="url(#home-ice-front)"
          d="m76 137 36-25 75-13 110-3 92 19 49 25-18 32-79 18-143-1-96-19Z"
        />
        <path
          fill="#f5fdff"
          d="m76 137 36-25 75-13 110-3 92 19 49 25-82 18-156 2-89-11Z"
        />
        <path
          fill="#fff"
          d="m112 112 75-13 110-3 92 19-60 15-145 6-73 13-35-12Z"
        />
        <path
          fill="#93d9f3"
          d="m76 137 35 12-9 21-17-11Zm124 23 18 29-63-4 9-27Zm156-2 33-43-12 37-18 34-18 4Z"
        />
        <path
          fill="#dcf8ff"
          d="m111 149 53 9-9 27-53-15Zm107 40 21-29 38-1 11 31Zm159-37 61-12-18 32-61 14Z"
        />
        <path
          fill="none"
          stroke="#a9e4f7"
          strokeWidth="2"
          d="m137 129 24 8-8 11m180-36-13 13 13 9m-74 26-4 19"
        />
        <path
          fill="#f6fdff"
          d="m15 158 27-8 30 8-11 10-32 1Zm430 12 22-7 29 9-13 9-28-2Z"
        />
        <path
          fill="#a4def5"
          d="m15 158 14 11 32-1 11-10-6 17-37 2Zm430 12 10 9 28 2 13-9-10 17-32-4Z"
        />
      </svg>
      <button
        type="button"
        aria-label="북극곰을 눌러 응원하기"
        onClick={() => setCelebration((current) => current + 1)}
        className="absolute inset-x-4 bottom-6 h-[300px] cursor-pointer rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        <span
          key={celebration}
          className={`absolute inset-0 ${cheering ? 'home-bear-cheer' : ''}`}
        >
          <Image
            src={`/polar-bear/${cheering ? 'cheer' : success ? 'happy' : 'sad'}.png`}
            alt={
              cheering
                ? '응원을 받아 기뻐하는 북극곰'
                : success
                  ? '절약에 성공해 두 팔을 들고 웃는 북극곰'
                  : '목표 사용량을 초과해 눈물을 흘리는 북극곰'
            }
            fill
            priority
            sizes="(max-width: 512px) 90vw, 480px"
            className="object-contain drop-shadow-lg"
          />
        </span>
        {cheering && (
          <span
            key={`hearts-${celebration}`}
            aria-hidden="true"
            className="home-bear-hearts absolute inset-x-0 top-8 text-3xl"
          >
            💚 ✨ 💚
          </span>
        )}
      </button>
    </section>
  );
}
