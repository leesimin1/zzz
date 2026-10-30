'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useDemoUser } from './DemoAuth';
import {
  applianceSnapshot,
  demoAppliances,
  applianceTotal,
  subscribeAppliances,
  changeAppliances,
} from '@/lib/demo-appliances';

export function useDemoAppliances() {
  const { user } = useDemoUser();
  const email = user?.email ?? '';
  const address = user?.address ?? '';
  const read = useCallback(() => applianceSnapshot(email), [email]);
  const raw = useSyncExternalStore(subscribeAppliances, read, () => '');
  const devices = useMemo(() => demoAppliances(address, raw), [address, raw]);
  return {
    devices,
    usage: applianceTotal(devices),
    change: (command: unknown) => changeAppliances(email, command),
  };
}
