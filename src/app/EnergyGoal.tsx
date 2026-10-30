'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useHomeEnergyDemo } from './HomeEnergyDemo';

export default function EnergyGoal() {
  const { goal, setGoal, usage, address, success } = useHomeEnergyDemo();
  const [draft, setDraft] = useState(String(goal));
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextGoal = Number(draft);

    if (!Number.isInteger(nextGoal) || nextGoal < 1 || nextGoal > 10000) {
      setError('목표는 1~10,000 사이의 정수로 입력해 주세요.');
      return;
    }

    setGoal(nextGoal);
    setError('');
  }

  return (
    <section
      aria-labelledby="energy-goal-title"
      className="rounded-3xl bg-white p-6 shadow-sm"
    >
      <h2 id="energy-goal-title" className="text-lg font-bold">
        나의 전기 절약 목표
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        한 달 동안 사용할 최대 전력량을 정해 보세요. 이번 달 사용량과 비교해
        북극곰의 표정이 자동으로 바뀌어요.
      </p>

      <form onSubmit={handleSubmit} className="mt-5">
        <label htmlFor="energy-goal" className="text-sm font-bold">
          월 목표 사용량 (kWh)
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            id="energy-goal"
            type="number"
            min={1}
            max={10000}
            step={1}
            required
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-describedby="energy-goal-help energy-goal-error"
            aria-invalid={Boolean(error)}
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 px-4 focus-visible:outline-2 focus-visible:outline-emerald-700"
          />
          <button
            type="submit"
            className="min-h-12 rounded-xl bg-emerald-700 px-5 font-bold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            목표 설정
          </button>
        </div>
        <p id="energy-goal-help" className="mt-2 text-xs text-slate-600">
          1~10,000kWh까지 입력할 수 있어요.
        </p>
        <p
          id="energy-goal-error"
          role="alert"
          className="mt-1 text-sm text-red-700"
        >
          {error}
        </p>
      </form>

      <div
        role="status"
        aria-atomic="true"
        className={`mt-5 rounded-2xl p-5 text-center ${
          success
            ? 'bg-emerald-50 text-emerald-900'
            : 'bg-rose-50 text-rose-900'
        }`}
      >
        <Image
          src={`/polar-bear/${success ? 'happy' : 'sad'}.png`}
          alt={
            success ? '절약 성공으로 웃는 북극곰' : '절약 실패로 우는 북극곰'
          }
          width={160}
          height={160}
          className="mx-auto size-40 object-contain"
        />
        <h3 className="mt-3 text-xl font-extrabold">
          {success
            ? '목표 성공! 북극곰이 기뻐해요'
            : '목표 초과! 북극곰이 슬퍼해요'}
        </h3>
        <p className="mt-2 text-sm">
          {usage === goal
            ? '목표 사용량을 지켰어요!'
            : success
              ? `목표보다 ${goal - usage}kWh 적게 사용했어요.`
              : `목표보다 ${usage - goal}kWh 많이 사용했어요.`}
        </p>
        <p className="mt-4 font-bold">
          이번 달 사용량 {usage}kWh / 목표 {goal}kWh
        </p>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-600">
          이번 달 사용량은 마이페이지와 동일한 {usage}kWh이며, 실제 전력 데이터
          연동 전의{' '}
          {address ? '등록한 집주소에 따른' : '주소 미등록 상태의 기본'} 데모
          값입니다. 목표 이하이면 기뻐하고, 초과하면 슬퍼해요.
        </p>
      </div>
    </section>
  );
}
