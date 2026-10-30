import 'server-only';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Link from 'next/link';
import { withPolarBearAssets } from '@/lib/polar-bear-html';
import { DemoGuard } from '../DemoAuth';
import DemoAccountFrame from '../DemoAccountFrame';

export default function MissionsPage() {
  const original = readFileSync(join(process.cwd(), 'server.py.html'), 'utf8');
  const html = withPolarBearAssets(original).replace(
    '</body>',
    '<script src="/mission-cycle.js"></script><script src="/mission-effects.js"></script><script src="/mission-activity.js"></script><script src="/bear-hunger.js"></script></body>',
  );

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#eaf6fd] text-[#17365e]">
      <div className="mx-auto w-full max-w-lg shrink-0 px-5 py-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-lg px-3 font-bold focus-visible:outline-2"
        >
          ← 메인페이지로 돌아가기
        </Link>
        <p className="mt-2 text-xs text-slate-600">
          미션·먹이·북극곰 성장 데모입니다. 진행 상황은 로그인한 계정에 저장되어
          다른 기기에서도 이어서 사용할 수 있습니다.
        </p>
      </div>
      <DemoGuard
        className="flex min-h-0 flex-1 flex-col"
        loginMessage="내 미션 기록과 북극곰, 수집 배지는 계정별로 저장돼요. 로그인 후 미션을 시작해 주세요."
      >
        <DemoAccountFrame
          syncBear
          title="미션과 북극곰 성장"
          html={html}
          className="mx-auto block min-h-0 w-full max-w-lg flex-1 border-0"
        />
      </DemoGuard>
    </main>
  );
}
