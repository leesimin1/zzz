'use client';

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  demoSessionSnapshot,
  demoUserSchema,
  loginDemo,
  logoutDemo,
  registerDemo,
  subscribeDemoSession,
} from '@/lib/demo-auth';

export function useDemoUser() {
  const raw = useSyncExternalStore(
    subscribeDemoSession,
    demoSessionSnapshot,
    () => '',
  );
  const ready = useSyncExternalStore(
    subscribeDemoSession,
    () => true,
    () => false,
  );

  try {
    const result = demoUserSchema.safeParse(JSON.parse(raw));
    return { ready, user: result.success ? result.data : null };
  } catch {
    return { ready, user: null };
  }
}

export function DemoAuthForm({ signup = false }: { signup?: boolean }) {
  const { ready } = useDemoUser();
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);
  const submitting = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') ?? '');
    const password = String(data.get('password') ?? '');

    submitting.current = true;
    setBusy(true);
    setError('');

    try {
      if (signup) {
        await registerDemo({
          name: String(data.get('name') ?? ''),
          email,
          password,
          address: String(data.get('address') ?? ''),
        });
        form.reset();
        setCreated(true);
      } else {
        await loginDemo({ email, password });
        form.reset();
        router.replace('/');
      }
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : '처리하지 못했습니다. 다시 시도해 주세요.',
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  const fields = [
    { name: 'name', label: '이름', type: 'text', max: 40, auto: 'name' },
    {
      name: 'address',
      label: '집주소',
      type: 'text',
      max: 200,
      auto: 'street-address',
    },
    { name: 'email', label: '이메일', type: 'email', max: 254, auto: 'email' },
    {
      name: 'password',
      label: '비밀번호',
      type: 'password',
      max: 128,
      auto: signup ? 'new-password' : 'current-password',
    },
  ].filter((field) => signup || !['name', 'address'].includes(field.name));

  return (
    <main className="min-h-screen bg-[#eaf6fd] px-5 py-8 text-[#17365e]">
      <div className="mx-auto max-w-md">
        <Link href="/" className="inline-flex min-h-11 items-center font-bold">
          ← 메인페이지로 돌아가기
        </Link>
        <section className="mt-5 rounded-3xl bg-white p-6 shadow-lg">
          <p className="text-sm font-bold text-emerald-800">POLAR HOME</p>
          <h1 className="mt-3 text-2xl font-extrabold">
            {signup ? '데모 회원가입' : '데모 로그인'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            같은 브라우저에서 사용하는 발표용 계정입니다. 실제 사용하는
            비밀번호는 입력하지 마세요.
            {signup &&
              ' 집주소는 한전 연동 흐름을 보여주는 데모용이며, 가입 정보는 이 브라우저에만 저장됩니다.'}
          </p>

          {created ? (
            <div className="mt-6">
              <p role="status" className="font-bold text-emerald-800">
                데모 회원가입이 완료됐어요!
              </p>
              <Link
                href="/login"
                className="mt-4 block rounded-xl bg-emerald-700 p-3 text-center font-bold text-white"
              >
                가입한 정보로 로그인하기
              </Link>
            </div>
          ) : (
            <form method="post" onSubmit={submit} className="mt-5 space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="text-sm font-bold">
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    autoComplete={field.auto}
                    required
                    maxLength={field.max}
                    minLength={
                      field.name === 'password'
                        ? 10
                        : field.name === 'address'
                          ? 5
                          : 1
                    }
                    placeholder={
                      field.name === 'address'
                        ? '도로명·건물번호·동호수 (대회용 예시 주소 가능)'
                        : undefined
                    }
                    disabled={busy}
                    aria-describedby="demo-auth-error"
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 focus-visible:outline-2 focus-visible:outline-emerald-700"
                  />
                </div>
              ))}
              <p
                id="demo-auth-error"
                role="alert"
                className="text-sm text-red-700"
              >
                {error}
              </p>
              <button
                type="submit"
                disabled={busy || !ready}
                className="min-h-12 w-full rounded-xl bg-emerald-700 px-4 font-bold text-white disabled:opacity-50"
              >
                {busy ? '처리 중…' : signup ? '회원가입' : '로그인'}
              </button>
              <Link
                href={signup ? '/login' : '/signup'}
                className="flex min-h-11 items-center justify-center text-sm font-bold"
              >
                {signup ? '이미 가입했나요? 로그인' : '처음인가요? 회원가입'}
              </Link>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export function DemoHeader() {
  const { user } = useDemoUser();
  const router = useRouter();

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-white/85 px-4 py-3 text-sm font-bold"
      >
        로그인
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="max-w-20 truncate font-bold">{user.name}님</span>
      <button
        type="button"
        onClick={() => {
          logoutDemo();
          router.replace('/');
        }}
        className="rounded-full bg-white/85 px-3 py-3 font-bold"
      >
        로그아웃
      </button>
    </div>
  );
}

export function DemoMyPageLink({ active = false }: { active?: boolean }) {
  const { user } = useDemoUser();

  return (
    <Link
      href={user ? '/mypage' : '/login'}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 ${
        active
          ? 'bg-emerald-50 text-emerald-800'
          : 'text-slate-600 hover:bg-sky-50'
      }`}
    >
      <span aria-hidden="true" className="text-2xl">
        ♙
      </span>
      마이페이지
    </Link>
  );
}

export function DemoGuard({
  children,
  className,
  loginMessage,
}: {
  children: ReactNode;
  className?: string;
  loginMessage?: string;
}) {
  const { ready, user } = useDemoUser();
  const router = useRouter();
  const loggedIn = Boolean(user);

  useEffect(() => {
    if (ready && !loggedIn && !loginMessage) router.replace('/login');
  }, [ready, loggedIn, router, loginMessage]);

  if (ready && !user && loginMessage) {
    return (
      <section className="mx-auto my-6 w-[calc(100%-32px)] max-w-md rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-extrabold">먼저 로그인해 주세요</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{loginMessage}</p>
        <Link
          href="/login"
          className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-emerald-700 px-4 font-bold text-white"
        >
          로그인하러 가기
        </Link>
        <Link
          href="/"
          className="mt-2 flex min-h-11 items-center justify-center text-sm font-bold"
        >
          메인으로 돌아가기
        </Link>
      </section>
    );
  }

  if (!ready || !user) {
    return (
      <p role="status" className="p-6">
        로그인 상태를 확인하고 있어요.
      </p>
    );
  }

  return (
    <div
      key={user.email}
      className={className}
      onLoadCapture={(event) => {
        if (event.target instanceof HTMLIFrameElement) {
          event.target.contentDocument
            ?.querySelectorAll('.welcome h1, #home-title')
            .forEach((heading) => {
              heading.textContent = `안녕하세요, ${user.name}님`;
            });
        }
      }}
    >
      <p className="mx-auto max-w-lg px-5 py-3 text-sm font-bold">
        {user.name}님이 데모 계정으로 로그인 중입니다.
      </p>
      {children}
    </div>
  );
}
