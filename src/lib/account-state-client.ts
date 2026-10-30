'use client';

import { z } from 'zod';
import { demoAccountStorageKey } from './demo-account-storage';
import {
  parseAccountState,
  stateRowSchema,
  stateWriteSchema,
  type StateKind,
  type StateRow,
} from './account-state-schema';

export const BEAR_LOCAL_EVENT = 'polar-bear-state-change';
export const BEAR_REMOTE_EVENT = 'polar-bear-remote-updated';
const APPLIANCE_EVENT = 'polar-demo-appliances-change';
const kinds: StateKind[] = ['bear', 'appliances'];
export type SyncStatus = {
  ready: boolean;
  saving: boolean;
  error: string;
  conflict: boolean;
};
type Pending = {
  data: ReturnType<typeof parseAccountState>;
  baseVersion: number;
};
const listSchema = z.object({
  accountId: z.uuid(),
  records: z.array(stateRowSchema).max(2),
});
class StateSyncError extends Error {}

// JSONB는 객체 키 순서를 바꿀 수 있으므로 내용이 같으면 동일 기록으로 비교한다.
function ordered(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(ordered);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, item]) => [key, ordered(item)]),
    );
  return value;
}
const serialize = (value: unknown) => JSON.stringify(ordered(value));

export function startAccountSync(
  user: { id: string; email: string },
  update: (status: SyncStatus) => void,
) {
  let active = true,
    loaded = false,
    busy = false,
    reading = false,
    conflict = false;
  let error = '';
  let debounce: ReturnType<typeof setTimeout>;
  const versions: Record<StateKind, number> = { bear: 0, appliances: 0 };
  const known: Record<StateKind, string> = { bear: '', appliances: '' };
  const pending = new Map<StateKind, Pending>();
  const controllers = new Set<AbortController>();
  const key = (kind: StateKind) =>
    demoAccountStorageKey(
      kind === 'bear' ? 'polarHomeV2' : 'polar-appliances-v1',
      user.email,
    );
  const journalKey = (kind: StateKind) => `${key(kind)}:cloud-pending-v1`;
  const emit = () => {
    if (active)
      update({
        ready: loaded,
        saving: busy || pending.size > 0,
        error,
        conflict,
      });
  };

  async function request(method: 'GET' | 'PUT', body?: unknown) {
    const controller = new AbortController();
    controllers.add(controller);
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/account-state', {
        method,
        credentials: 'same-origin',
        cache: 'no-store',
        signal: controller.signal,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const value: unknown = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          const current = z
            .object({ accountId: z.uuid(), record: stateRowSchema })
            .safeParse(value);
          const submitted = stateWriteSchema.safeParse(body);
          if (
            current.success &&
            submitted.success &&
            current.data.accountId === user.id &&
            current.data.record.kind === submitted.data.kind &&
            serialize(
              parseAccountState(
                current.data.record.kind,
                current.data.record.data,
              ),
            ) ===
              serialize(
                parseAccountState(submitted.data.kind, submitted.data.data),
              )
          )
            return current.data;
          conflict = true;
          throw new StateSyncError(
            '다른 기기에서 기록이 변경됐어요. 최신 기록을 불러와 주세요. 현재 기록은 이 브라우저에 보관합니다.',
          );
        }
        throw new StateSyncError(
          response.status === 401 || response.status === 403
            ? '로그인 계정을 다시 확인해 주세요.'
            : '서버에 저장하지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.',
        );
      }
      return value;
    } catch (cause) {
      if (cause instanceof StateSyncError) throw cause;
      throw new StateSyncError(
        '서버에 연결하지 못했어요. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.',
      );
    } finally {
      clearTimeout(timeout);
      controllers.delete(controller);
    }
  }

  function remember(kind: StateKind, item: Pending) {
    localStorage.setItem(journalKey(kind), JSON.stringify(item));
    pending.set(kind, item);
  }

  function applyRemote(kind: StateKind, row?: StateRow) {
    const raw = row ? serialize(parseAccountState(kind, row.data)) : '';
    const changed = localStorage.getItem(key(kind)) !== (raw || null);
    known[kind] = raw;
    versions[kind] = row?.version ?? 0;
    if (raw) localStorage.setItem(key(kind), raw);
    else localStorage.removeItem(key(kind));
    if (changed)
      window.dispatchEvent(
        new Event(kind === 'bear' ? BEAR_REMOTE_EVENT : APPLIANCE_EVENT),
      );
  }

  async function flush() {
    if (!active || !loaded || busy || conflict || !pending.size) return;
    busy = true;
    error = '';
    emit();
    try {
      while (active && pending.size) {
        const entry = pending.entries().next().value;
        if (!entry) break;
        const [kind, item] = entry;
        const value = await request('PUT', {
          accountId: user.id,
          kind,
          expectedVersion: versions[kind],
          data: item.data,
        });
        if (!active) return;
        const result = z
          .object({ accountId: z.uuid(), record: stateRowSchema })
          .parse(value);
        if (result.accountId !== user.id || result.record.kind !== kind)
          throw new Error('저장 계정을 확인하지 못했습니다.');
        versions[kind] = result.record.version;
        known[kind] = serialize(parseAccountState(kind, result.record.data));
        if (pending.get(kind) === item) {
          pending.delete(kind);
          localStorage.removeItem(journalKey(kind));
        } else {
          const next = pending.get(kind);
          if (next) remember(kind, { ...next, baseVersion: versions[kind] });
        }
      }
    } catch (cause) {
      if (active)
        error =
          cause instanceof Error
            ? cause.message
            : '기록을 저장하지 못했습니다.';
    } finally {
      busy = false;
      emit();
    }
  }

  function capture(kind: StateKind) {
    if (!active || !loaded || conflict) return;
    try {
      const raw = localStorage.getItem(key(kind));
      if (!raw) return;
      const data = parseAccountState(kind, JSON.parse(raw));
      if (serialize(data) === known[kind] && !busy && !pending.has(kind))
        return;
      remember(kind, { data, baseVersion: versions[kind] });
      clearTimeout(debounce);
      debounce = setTimeout(() => void flush(), 300);
      emit();
    } catch {
      error =
        '브라우저 기록을 저장하지 못했어요. 저장 공간과 기록 형식을 확인해 주세요.';
      emit();
    }
  }

  async function load(forceServer = false) {
    if (reading || busy || !active) return;
    reading = true;
    try {
      const result = listSchema.parse(await request('GET'));
      if (!active) return;
      if (result.accountId !== user.id)
        throw new Error('로그인 계정이 변경됐습니다. 새로고침해 주세요.');
      if (loaded && !forceServer) {
        for (const kind of kinds) {
          if (pending.has(kind) || busy) continue;
          const row = result.records.find((r) => r.kind === kind);
          if (row && row.version > versions[kind]) applyRemote(kind, row);
        }
        error = '';
        return;
      }
      for (const kind of kinds) {
        const row = result.records.find((r) => r.kind === kind);
        const savedJournal = localStorage.getItem(journalKey(kind));
        const raw = localStorage.getItem(key(kind));
        if (forceServer) {
          if (raw)
            localStorage.setItem(`${key(kind)}:before-cloud-reload`, raw);
          pending.delete(kind);
          localStorage.removeItem(journalKey(kind));
          applyRemote(kind, row);
          continue;
        }
        versions[kind] = row?.version ?? 0;
        known[kind] = row ? serialize(parseAccountState(kind, row.data)) : '';
        if (savedJournal) {
          const journal = z
            .object({ baseVersion: z.number().int().min(0), data: z.unknown() })
            .parse(JSON.parse(savedJournal));
          const data = parseAccountState(kind, journal.data);
          if (serialize(data) === known[kind]) {
            localStorage.removeItem(journalKey(kind));
            applyRemote(kind, row);
          } else if (journal.baseVersion === versions[kind]) {
            localStorage.setItem(key(kind), serialize(data));
            remember(kind, { data, baseVersion: versions[kind] });
          } else {
            conflict = true;
            throw new Error(
              '다른 기기에 더 최신 기록이 있어요. 최신 기록 불러오기를 눌러 주세요. 현재 브라우저 기록도 보관합니다.',
            );
          }
        } else if (!row && raw) {
          // 서버 기록이 없는 최초 연결에서만 기존 계정별 브라우저 기록을 가져온다.
          remember(kind, {
            data: parseAccountState(kind, JSON.parse(raw)),
            baseVersion: 0,
          });
        } else {
          applyRemote(kind, row);
        }
      }
      loaded = true;
      error = '';
      conflict = false;
    } catch (cause) {
      if (active)
        error =
          cause instanceof Error
            ? cause.message
            : '기록을 불러오지 못했습니다.';
    } finally {
      reading = false;
      emit();
      if (loaded && pending.size && !error) void flush();
    }
  }

  const onAppliance = () => capture('appliances');
  const onBear = (event: Event) => {
    if ((event as CustomEvent<{ key?: string }>).detail?.key === key('bear'))
      capture('bear');
  };
  const onStorage = (event: StorageEvent) => {
    for (const kind of kinds) if (event.key === key(kind)) capture(kind);
  };
  const refresh = () => {
    if (!active || conflict || busy || document.hidden) return;
    if (pending.size) void flush();
    else void load();
  };
  const beforeUnload = (event: BeforeUnloadEvent) => {
    if (!pending.size && !busy) return;
    event.preventDefault();
  };
  window.addEventListener(APPLIANCE_EVENT, onAppliance);
  window.addEventListener(BEAR_LOCAL_EVENT, onBear);
  window.addEventListener('storage', onStorage);
  window.addEventListener('focus', refresh);
  window.addEventListener('online', refresh);
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('beforeunload', beforeUnload);
  const poll = setInterval(refresh, 15000);
  void load();
  return {
    retry() {
      if (conflict) void load(true);
      else if (!loaded || !pending.size) void load();
      else void flush();
    },
    stop() {
      active = false;
      clearTimeout(debounce);
      clearInterval(poll);
      for (const controller of controllers) controller.abort();
      window.removeEventListener(APPLIANCE_EVENT, onAppliance);
      window.removeEventListener(BEAR_LOCAL_EVENT, onBear);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('beforeunload', beforeUnload);
    },
  };
}
