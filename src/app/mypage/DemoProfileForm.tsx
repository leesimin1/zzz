'use client';

import { useState, type FormEvent } from 'react';
import { updateDemoProfile, type DemoUser } from '@/lib/demo-auth';
import { demoBillForUsage, formatBillAmount } from '@/lib/demo-electricity';
import { useDemoAppliances } from '../useDemoAppliances';

export default function DemoProfileForm({
  user,
  onClose,
}: {
  user: DemoUser;
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savedAddress, setSavedAddress] = useState(user.address);
  const { usage } = useDemoAppliances();

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      updateDemoProfile({
        name: String(data.get('name') ?? ''),
        address: String(data.get('address') ?? ''),
      });
      setSavedAddress(String(data.get('address') ?? '').trim());
      setMessage('내 정보를 저장했어요. 등록한 집의 데모 사용량도 반영됐어요.');
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : '저장하지 못했습니다. 다시 시도해 주세요.',
      );
    }
  }

  return (
    <div className="p-6 text-[#17365e]">
      <div className="flex items-center justify-between gap-3">
        <h2 id="demo-profile-title" className="text-xl font-extrabold">
          내 정보 · 우리 집
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="내 정보 닫기"
          className="size-11 rounded-full bg-sky-50 text-2xl"
        >
          ×
        </button>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        이름과 집주소를 확인하고 수정하세요. 가입 정보는 이 브라우저에
        저장됩니다.
      </p>
      <form method="post" onSubmit={save} className="mt-5 space-y-4">
        <label className="block text-sm font-bold">
          이름
          <input
            name="name"
            autoComplete="name"
            defaultValue={user.name}
            required
            minLength={1}
            maxLength={40}
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3"
          />
        </label>
        <label className="block text-sm font-bold">
          이메일
          <input
            type="email"
            value={user.email}
            readOnly
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-600"
          />
        </label>
        <label className="block text-sm font-bold">
          집주소
          <textarea
            name="address"
            autoComplete="street-address"
            defaultValue={user.address}
            required
            minLength={5}
            maxLength={200}
            rows={3}
            aria-describedby="demo-home-note"
            placeholder="도로명·건물번호·동호수 (대회용 예시 주소 가능)"
            className="mt-2 w-full rounded-xl border border-slate-300 p-3"
          />
        </label>
        <div className="rounded-2xl bg-sky-50 p-4 text-sm">
          <p className="font-bold">
            {user.address
              ? '등록한 우리 집의 이번 달 사용량'
              : '주소 미등록 · 기본 예시 사용량'}
          </p>
          <p className="mt-2 text-2xl font-extrabold">
            {usage} <span className="text-sm">kWh</span>
          </p>
          <p className="mt-2 font-bold">
            예상 전기요금 {formatBillAmount(demoBillForUsage(usage).amount)}원
          </p>
          <p
            id="demo-home-note"
            className="mt-2 text-xs leading-5 text-slate-600"
          >
            한전 미연동 · 대회용 예시 데이터입니다. 주소 저장 후 해당 주소의
            데모 사용량을 표시하며 실제 사용량을 조회하거나 추정하지 않습니다.
          </p>
        </div>
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
        <p role="status" className="text-sm text-emerald-800">
          {message}
        </p>
        {message && (
          <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
            저장된 집주소: {savedAddress}
          </p>
        )}
        <button
          type="submit"
          className="min-h-12 w-full rounded-xl bg-emerald-700 px-4 font-bold text-white"
        >
          내 정보 저장
        </button>
      </form>
    </div>
  );
}
