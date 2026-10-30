'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDemoUser } from '../DemoAuth';
import { useDemoAppliances } from '../useDemoAppliances';
import { demoBillForUsage } from '@/lib/demo-electricity';
import type { DemoAppliance } from '@/lib/demo-appliances';
import DemoProfileForm from './DemoProfileForm';
import { scopeDemoAccountHtml } from '@/lib/demo-account-storage';
import { withDemoElectricityBill } from '@/lib/demo-electricity-html';

export default function MyPageFrame({ html }: { html: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const profileDialog = useRef<HTMLDialogElement>(null);
  const [visit, setVisit] = useState(0);
  const { user } = useDemoUser();
  const { usage, devices } = useDemoAppliances();
  const energyAmount = demoBillForUsage(usage).items[0].amount;
  const applySharedAppliances = useCallback(() => {
    const content = frame.current?.contentWindow as
      | (Window & {
          applyDemoAppliances?: (
            items: DemoAppliance[],
            energyAmount: number,
          ) => void;
        })
      | null;
    content?.applyDemoAppliances?.(devices, energyAmount);
  }, [devices, energyAmount]);
  const homeHtml = useMemo(
    () =>
      scopeDemoAccountHtml(
        withDemoElectricityBill(html, usage),
        user?.email ?? '',
      )
        .replaceAll(
          `onclick="openDetail('profile')"`,
          `disabled data-demo-profile onclick="window.parent.dispatchEvent(new Event('polar-demo-profile-open'))"`,
        )
        .replaceAll(
          `onclick="openDetail('homeInfo')"`,
          `disabled data-demo-profile onclick="window.parent.dispatchEvent(new Event('polar-demo-profile-open'))"`,
        )
        .replaceAll('347 kWh', `${usage} kWh`)
        .replaceAll('347<small> kWh', `${usage}<small> kWh`)
        .replaceAll(
          '약 8% 적게',
          `약 ${Math.round((Math.abs(380 - usage) / 380) * 100)}% ${usage <= 380 ? '적게' : '많이'}`,
        )
        .replace(
          '</body>',
          `<script src="/mypage-home-usage.js"></script><script>applyDemoHomeUsage(${usage});</script><script src="/mypage-appliances.js"></script></body>`,
        ),
    [html, usage, user?.email],
  );

  const prepareFrame = useCallback(() => {
    const content = frame.current?.contentWindow as
      | (Window & {
          openDetail?: (key: string) => void;
          demoOriginalOpenDetail?: (key: string) => void;
        })
      | null;
    if (content?.openDetail) {
      content.demoOriginalOpenDetail ??= content.openDetail;
      content.openDetail = (key) => {
        if (key === 'profile' || key === 'homeInfo') {
          setVisit((value) => value + 1);
          profileDialog.current?.showModal();
        } else content.demoOriginalOpenDetail?.(key);
      };
      frame.current?.contentDocument
        ?.querySelectorAll<HTMLButtonElement>('button[data-demo-profile]')
        .forEach((button) => {
          button.disabled = false;
        });
    }
    openRequestedScreen();
    applySharedAppliances();
  }, [applySharedAppliances]);

  function openRequestedScreen() {
    const content = frame.current?.contentWindow as
      (Window & { showScreen?: (screen: string) => void }) | null;
    content?.showScreen?.(
      window.location.hash === '#analysis' ? 'analysis' : 'mypage',
    );
  }

  useLayoutEffect(() => {
    const openProfile = () => {
      setVisit((value) => value + 1);
      profileDialog.current?.showModal();
    };
    window.addEventListener('polar-demo-profile-open', openProfile);
    window.addEventListener('hashchange', openRequestedScreen);
    prepareFrame();
    const document = frame.current?.contentDocument;
    return () => {
      document
        ?.querySelectorAll<HTMLButtonElement>('button[data-demo-profile]')
        .forEach((button) => {
          button.disabled = true;
        });
      window.removeEventListener('polar-demo-profile-open', openProfile);
      window.removeEventListener('hashchange', openRequestedScreen);
    };
  }, [prepareFrame]);

  useEffect(() => {
    frame.current?.contentDocument
      ?.querySelectorAll('.welcome h1, #home-title')
      .forEach((heading) => {
        heading.textContent = `안녕하세요, ${user?.name ?? ''}님`;
      });
  }, [user?.name]);

  return (
    <>
      <iframe
        ref={frame}
        title="마이페이지와 전기요금 분석"
        srcDoc={homeHtml}
        onLoad={prepareFrame}
        sandbox="allow-scripts allow-same-origin allow-top-navigation-by-user-activation"
        className="mx-auto block h-[900px] w-full max-w-lg border-0"
      />
      <dialog
        ref={profileDialog}
        aria-labelledby="demo-profile-title"
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-32px)] max-w-md overflow-y-auto rounded-3xl border-0 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      >
        {user && (
          <DemoProfileForm
            key={`${user.email}:${visit}`}
            user={user}
            onClose={() => profileDialog.current?.close()}
          />
        )}
      </dialog>
    </>
  );
}
