'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useDemoUser } from './DemoAuth';
import { startAccountSync, type SyncStatus } from '@/lib/account-state-client';

export default function AccountDataSync({ children }: { children: ReactNode }) {
  const { user } = useDemoUser();
  const controller = useRef<ReturnType<typeof startAccountSync> | null>(null);
  const [status, setStatus] = useState<SyncStatus & { accountId: string }>({
    accountId: '',
    ready: false,
    saving: false,
    error: '',
    conflict: false,
  });
  const id = user?.id;
  const email = user?.email;
  useEffect(() => {
    if (!id || !email) return;
    const connection = startAccountSync({ id, email }, (value) =>
      setStatus({ ...value, accountId: id }),
    );
    controller.current = connection;
    return () => {
      connection.stop();
      if (controller.current === connection) controller.current = null;
    };
  }, [id, email]);

  if (!user) return children;
  if (!id)
    return (
      <p role="alert" className="p-6 text-center">
        계정을 확인하려면 다시 로그인해 주세요.
      </p>
    );
  const current = status.accountId === id;
  const waiting = !current || !status.ready;
  return (
    <>
      <div
        className={`px-4 py-2 text-center text-xs ${current && status.error ? 'bg-amber-50 text-amber-900' : 'bg-emerald-50 text-emerald-800'}`}
      >
        <span role={current && status.error ? 'alert' : 'status'}>
          {current && status.error
            ? status.error
            : waiting
              ? '계정에 저장된 기록을 불러오는 중입니다…'
              : status.saving
                ? '계정에 기록 저장 중…'
                : '북극곰·가전 설정이 계정에 저장됩니다.'}
        </span>
        {current && status.error && (
          <button
            type="button"
            className="ml-3 min-h-11 rounded-lg border border-current px-3 font-bold"
            onClick={() => controller.current?.retry()}
          >
            {status.conflict ? '최신 기록 불러오기' : '다시 시도'}
          </button>
        )}
      </div>
      {!waiting && !status.conflict ? (
        children
      ) : (
        <p className="p-6 text-center text-sm text-slate-600">
          개인 기록을 확인하고 있습니다.
        </p>
      )}
    </>
  );
}
