'use client';

import { useDemoUser } from './DemoAuth';
import { scopeDemoAccountHtml } from '@/lib/demo-account-storage';
import { useEffect, useRef, useState } from 'react';
import { BEAR_REMOTE_EVENT } from '@/lib/account-state-client';
import { useDemoAppliances } from './useDemoAppliances';
import type { DemoAppliance } from '@/lib/demo-appliances';

export default function DemoAccountFrame({
  html,
  title,
  className,
  syncBear = false,
}: {
  html: string;
  title: string;
  className: string;
  syncBear?: boolean;
}) {
  const { user } = useDemoUser();
  const { devices, usage, change } = useDemoAppliances();
  const frame = useRef<HTMLIFrameElement>(null);
  const [bearRevision, setBearRevision] = useState(0);
  useEffect(() => {
    if (!syncBear) return;
    const refreshBear = () => setBearRevision((revision) => revision + 1);
    window.addEventListener(BEAR_REMOTE_EVENT, refreshBear);
    return () => window.removeEventListener(BEAR_REMOTE_EVENT, refreshBear);
  }, [syncBear]);
  function connect() {
    const content = frame.current?.contentWindow as
      | (Window & {
          applyDemoAppliances?: (
            items: DemoAppliance[],
            monthlyUsage: number,
          ) => void;
          requestDemoApplianceChange?: (command: unknown) => {
            ok: boolean;
            error?: string;
          };
        })
      | null;
    if (!content?.applyDemoAppliances) return;
    content.requestDemoApplianceChange = (command) => {
      try {
        change(command);
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error ? error.message : '변경하지 못했습니다.',
        };
      }
    };
    content.applyDemoAppliances(devices, usage);
  }
  useEffect(() => {
    const content = frame.current?.contentWindow as
      | (Window & {
          applyDemoAppliances?: (
            items: DemoAppliance[],
            monthlyUsage: number,
          ) => void;
        })
      | null;
    content?.applyDemoAppliances?.(devices, usage);
  }, [devices, usage]);
  if (!user) return null;
  return (
    <iframe
      ref={frame}
      onLoad={connect}
      key={`${user.email}:${bearRevision}`}
      title={title}
      srcDoc={scopeDemoAccountHtml(html, user.email)}
      sandbox="allow-scripts allow-same-origin"
      className={className}
    />
  );
}
