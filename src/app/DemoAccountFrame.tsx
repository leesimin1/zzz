'use client';

import { useDemoUser } from './DemoAuth';
import { scopeDemoAccountHtml } from '@/lib/demo-account-storage';
import { useEffect, useRef } from 'react';
import { useDemoAppliances } from './useDemoAppliances';
import type { DemoAppliance } from '@/lib/demo-appliances';

export default function DemoAccountFrame({
  html,
  title,
  className,
}: {
  html: string;
  title: string;
  className: string;
}) {
  const { user } = useDemoUser();
  const { devices, change } = useDemoAppliances();
  const frame = useRef<HTMLIFrameElement>(null);
  function connect() {
    const content = frame.current?.contentWindow as
      | (Window & {
          applyDemoAppliances?: (items: DemoAppliance[]) => void;
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
    content.applyDemoAppliances(devices);
  }
  useEffect(() => {
    const content = frame.current?.contentWindow as
      | (Window & { applyDemoAppliances?: (items: DemoAppliance[]) => void })
      | null;
    content?.applyDemoAppliances?.(devices);
  }, [devices]);
  if (!user) return null;
  return (
    <iframe
      ref={frame}
      onLoad={connect}
      key={user.email}
      title={title}
      srcDoc={scopeDemoAccountHtml(html, user.email)}
      sandbox="allow-scripts allow-same-origin"
      className={className}
    />
  );
}
