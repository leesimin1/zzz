'use client';

import { z } from 'zod';
import {
  credentialsSchema,
  demoUserSchema,
  registrationSchema,
  profileSchema,
  type DemoUser,
} from './account-schema';
export { demoUserSchema, type DemoUser } from './account-schema';

const LEGACY_KEY = 'polar-demo-accounts-v1';
const SYNC_KEY = 'polar-account-session-sync-v2';
const listeners = new Set<() => void>();
let snapshot = '';
let ready = false;
let version = 0;
let refreshSerial = 0;
let pending = 0;
let timer: ReturnType<typeof setInterval> | undefined;

const payloadSchema = z.object({
  user: demoUserSchema.nullable().optional(),
  requiresEmailVerification: z.boolean().optional(),
  error: z.string().optional(),
  code: z.string().optional(),
});
class AccountError extends Error {
  constructor(
    message: string,
    readonly code = 'AUTH_ERROR',
  ) {
    super(message);
  }
}
function emit() {
  for (const callback of listeners) callback();
}
function setUser(user: DemoUser | null) {
  snapshot = user ? JSON.stringify(user) : '';
  ready = true;
  emit();
}
function publish() {
  try {
    localStorage.setItem(SYNC_KEY, `${Date.now()}:${Math.random()}`);
  } catch {
    /* Cookie login remains usable without local storage. */
  }
}
async function api(action: string, body?: unknown, method = 'POST') {
  let response: Response;
  try {
    response = await fetch(`/api/auth/${action}`, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers:
        body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new AccountError(
      '서버에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.',
    );
  }
  const value = payloadSchema.safeParse(
    await response.json().catch(() => null),
  );
  if (!value.success)
    throw new AccountError(
      '로그인 응답을 확인하지 못했습니다. 다시 시도해 주세요.',
    );
  if (!response.ok)
    throw new AccountError(
      value.data.error || '요청을 처리하지 못했습니다.',
      value.data.code,
    );
  return value.data;
}
async function refresh() {
  if (pending) return;
  const serial = ++refreshSerial,
    principal = version;
  try {
    const result = await api('session', undefined, 'GET');
    if (serial === refreshSerial && principal === version && !pending)
      setUser(result.user ?? null);
  } catch {
    if (serial === refreshSerial && principal === version && !pending)
      setUser(null);
  }
}
function onFocus() {
  void refresh();
}
function onVisibility() {
  if (!document.hidden) void refresh();
}
function onStorage(event: StorageEvent) {
  if (event.key === SYNC_KEY) void refresh();
}

async function legacyAccount(email: string, password: string) {
  try {
    const schema = z
      .array(
        demoUserSchema.extend({
          salt: z.string().regex(/^[a-f0-9]{32}$/),
          hash: z.string().regex(/^[a-f0-9]{64}$/),
        }),
      )
      .max(50);
    const parsed = schema.safeParse(
      JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]'),
    );
    const account = parsed.success
      ? parsed.data.find((item) => item.email === email)
      : undefined;
    if (!account) return null;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const salt = Uint8Array.from({ length: 16 }, (_, i) =>
      parseInt(account.salt.slice(i * 2, i * 2 + 2), 16),
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 600000 },
      key,
      256,
    );
    const hash = Array.from(new Uint8Array(bits), (value) =>
      value.toString(16).padStart(2, '0'),
    ).join('');
    return hash === account.hash ? account : null;
  } catch {
    return null;
  }
}

export async function registerDemo(input: {
  name: string;
  email: string;
  password: string;
  address: string;
}) {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success)
    throw new Error('이름·집주소·이메일과 비밀번호(10~128자)를 확인해 주세요.');
  const ticket = ++version;
  refreshSerial++;
  pending++;
  setUser(null);
  try {
    const result = await api('register', parsed.data);
    if (ticket === version) {
      setUser(result.user ?? null);
      publish();
    }
    return result;
  } catch (error) {
    pending--;
    await refresh();
    pending++;
    throw error;
  } finally {
    pending--;
  }
}
export async function loginDemo(input: { email: string; password: string }) {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) throw new Error('이메일과 비밀번호를 확인해 주세요.');
  const ticket = ++version;
  refreshSerial++;
  pending++;
  setUser(null);
  try {
    let result;
    try {
      result = await api('login', parsed.data);
    } catch (error) {
      if (
        !(error instanceof AccountError) ||
        error.code !== 'INVALID_CREDENTIALS'
      )
        throw error;
      const previous = await legacyAccount(
        parsed.data.email,
        parsed.data.password,
      );
      if (!previous || !profileSchema.safeParse(previous).success) throw error;
      result = await api('register', {
        name: previous.name,
        address: previous.address,
        ...parsed.data,
      });
      if (result.requiresEmailVerification)
        throw new Error('이메일 확인 후 다시 로그인해 주세요.');
    }
    if (ticket === version) {
      setUser(result.user ?? null);
      publish();
    }
  } finally {
    pending--;
  }
}
export async function logoutDemo() {
  const ticket = ++version;
  refreshSerial++;
  pending++;
  try {
    await api('logout', {});
    if (ticket === version) {
      setUser(null);
      publish();
    }
  } catch (error) {
    pending--;
    await refresh();
    pending++;
    throw error;
  } finally {
    pending--;
  }
}
export async function updateDemoProfile(input: {
  name: string;
  address: string;
}) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success)
    throw new Error('이름은 1~40자, 집주소는 5~200자로 입력해 주세요.');
  if (!snapshot) throw new Error('로그인 후 내 정보를 수정해 주세요.');
  const ticket = version;
  refreshSerial++;
  pending++;
  try {
    const result = await api('profile', parsed.data, 'PATCH');
    if (ticket === version) {
      refreshSerial++;
      setUser(result.user ?? null);
      publish();
    }
  } finally {
    pending--;
  }
}
export function demoSessionSnapshot() {
  return snapshot;
}
export function demoAuthReadySnapshot() {
  return ready;
}
export function subscribeDemoSession(callback: () => void) {
  listeners.add(callback);
  if (listeners.size === 1) {
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('storage', onStorage);
    timer = setInterval(onFocus, 15 * 60 * 1000);
    void refresh();
  }
  return () => {
    listeners.delete(callback);
    if (!listeners.size) {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('storage', onStorage);
      clearInterval(timer);
    }
  };
}
