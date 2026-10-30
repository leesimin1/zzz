'use client';

import { z } from 'zod';

const ACCOUNTS_KEY = 'polar-demo-accounts-v1';
const SESSION_KEY = 'polar-demo-session-v1';
const CHANGE_EVENT = 'polar-demo-auth-change';

export const demoUserSchema = z.object({
  name: z.string().trim().min(1).max(40),
  email: z.string().trim().toLowerCase().email().max(254),
  address: z.string().trim().max(200).default(''),
});

export type DemoUser = z.infer<typeof demoUserSchema>;

const profileSchema = z.object({
  name: demoUserSchema.shape.name,
  address: z.string().trim().min(5).max(200),
});

const credentialsSchema = z.object({
  email: demoUserSchema.shape.email,
  password: z.string().min(10).max(128),
});

const accountSchema = demoUserSchema.extend({
  salt: z.string().regex(/^[a-f0-9]{32}$/),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
});

function readAccounts() {
  try {
    return z
      .array(accountSchema)
      .max(50)
      .parse(JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]'));
  } catch {
    throw new Error(
      '브라우저의 가입 기록을 읽을 수 없습니다. 브라우저 저장 설정을 확인해 주세요.',
    );
  }
}

function hex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

async function passwordHash(password: string, salt: string) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('localhost 또는 HTTPS 주소에서 실행해 주세요.');
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const saltBytes = Uint8Array.from({ length: salt.length / 2 }, (_, index) =>
    parseInt(salt.slice(index * 2, index * 2 + 2), 16),
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: saltBytes,
      iterations: 600000,
    },
    key,
    256,
  );
  return hex(new Uint8Array(bits));
}

export async function registerDemo(input: {
  name: string;
  email: string;
  password: string;
  address: string;
}) {
  const userResult = demoUserSchema.safeParse(input);
  const profileResult = profileSchema.safeParse(input);
  const credentialsResult = credentialsSchema.safeParse(input);

  if (
    !userResult.success ||
    !profileResult.success ||
    !credentialsResult.success
  ) {
    throw new Error(
      '이름·이메일·집주소(5~200자)를 확인하고 비밀번호를 10~128자로 입력해 주세요.',
    );
  }

  const user = userResult.data;
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  const hash = await passwordHash(credentialsResult.data.password, salt);
  const accounts = readAccounts();

  if (accounts.some((account) => account.email === user.email)) {
    throw new Error('이미 가입한 이메일입니다. 로그인해 주세요.');
  }
  if (accounts.length >= 50) {
    throw new Error('이 브라우저의 데모 계정 생성 한도에 도달했습니다.');
  }

  try {
    localStorage.setItem(
      ACCOUNTS_KEY,
      JSON.stringify([...accounts, { ...user, salt, hash }]),
    );
  } catch {
    throw new Error(
      '가입 정보를 저장하지 못했습니다. 저장 설정을 확인해 주세요.',
    );
  }
}

export async function loginDemo(input: { email: string; password: string }) {
  const result = credentialsSchema.safeParse(input);
  if (!result.success) {
    throw new Error('이메일과 비밀번호를 확인해 주세요.');
  }

  const account = readAccounts().find(
    (item) => item.email === result.data.email,
  );

  if (
    !account ||
    (await passwordHash(result.data.password, account.salt)) !== account.hash
  ) {
    throw new Error('이메일 또는 비밀번호가 맞지 않습니다.');
  }

  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        name: account.name,
        email: account.email,
        address: account.address,
      }),
    );
  } catch {
    throw new Error('로그인 상태를 저장하지 못했습니다.');
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function logoutDemo() {
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function updateDemoProfile(input: { name: string; address: string }) {
  const profile = profileSchema.safeParse(input);
  if (!profile.success) {
    throw new Error('이름은 1~40자, 집주소는 5~200자로 입력해 주세요.');
  }
  let current: DemoUser;
  try {
    current = demoUserSchema.parse(JSON.parse(demoSessionSnapshot()));
  } catch {
    throw new Error('로그인 후 정보를 수정해 주세요.');
  }
  const accounts = readAccounts();
  const index = accounts.findIndex(
    (account) => account.email === current.email,
  );
  if (index < 0)
    throw new Error('가입 정보를 찾지 못했습니다. 다시 로그인해 주세요.');
  const user = { ...current, ...profile.data };
  accounts[index] = { ...accounts[index], ...profile.data };
  const previousAccounts = localStorage.getItem(ACCOUNTS_KEY);
  const previousSession = demoSessionSnapshot();
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    // Restore the previous profile when either storage write fails.
    try {
      if (previousAccounts !== null)
        localStorage.setItem(ACCOUNTS_KEY, previousAccounts);
      sessionStorage.setItem(SESSION_KEY, previousSession);
    } catch {
      throw new Error(
        '저장 공간에 접근할 수 없습니다. 브라우저 저장 설정을 확인해 주세요.',
      );
    }
    throw new Error('정보를 저장하지 못했습니다. 다시 시도해 주세요.');
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function demoSessionSnapshot() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) ?? '';
    if (!raw) return '';
    const session = demoUserSchema.safeParse(JSON.parse(raw));
    if (!session.success) return '';
    const account = readAccounts().find(
      (item) => item.email === session.data.email,
    );
    if (!account) return raw;
    // The persisted account is authoritative when a cached session is older.
    return JSON.stringify({
      name: account.name,
      email: account.email,
      address: account.address,
    });
  } catch {
    return '';
  }
}

export function subscribeDemoSession(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
