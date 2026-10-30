import 'server-only';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Link from 'next/link';
import { withPolarBearAssets } from '@/lib/polar-bear-html';

export default function MissionsPage() {
  const original = readFileSync(join(process.cwd(), 'server.py.html'), 'utf8');
  const html = withPolarBearAssets(original).replace(
    '</body>',
    '<script src="/mission-cycle.js"></script><script src="/mission-effects.js"></script><script src="/mission-activity.js"></script></body>',
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
          미션·먹이·북극곰 성장 데모입니다. 진행 상황은 이 브라우저에
          저장됩니다.
        </p>
      </div>
      <iframe
        title="미션과 북극곰 성장"
        srcDoc={html}
        sandbox="allow-scripts allow-same-origin"
        className="mx-auto block min-h-0 w-full max-w-lg flex-1 border-0"
      />
    </main>
  );
}
