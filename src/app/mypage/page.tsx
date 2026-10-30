import 'server-only';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Link from 'next/link';
import { DemoGuard } from '../DemoAuth';
import MainNavigation from '../MainNavigation';
import { withPolarBearAssets } from '@/lib/polar-bear-html';
import { withDemoElectricityBill } from '@/lib/demo-electricity-html';
import MyPageFrame from './MyPageFrame';

export default function MyPage() {
  const original = readFileSync(
    join(process.cwd(), 'polar_home_final_bear_mission_demo.html'),
    'utf8',
  );

  const html = withPolarBearAssets(withDemoElectricityBill(original))
    .replace(
      /<article class="card toggle-line">[\s\S]*?id="easyToggle"[\s\S]*?<\/article>/,
      '',
    )
    .replace(
      /document\.getElementById\('easyToggle'\)\.addEventListener[^\r\n]*/,
      '',
    )
    .replace(
      /<button class="menu-row" onclick="openDetail\('(missions|quiz)'\)">[\s\S]*?<\/button>\s*/g,
      '',
    )
    .replace('</head>', '<style>.tabbar{display:none!important}</style></head>')
    .replace('</body>', "<script>showScreen('mypage');</script></body>");

  return (
    <main className="min-h-screen bg-[#eaf6fd] pb-28 text-[#17365e]">
      <div className="mx-auto max-w-lg px-5 py-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-lg px-3 font-bold focus-visible:outline-2"
        >
          ← 메인페이지로 돌아가기
        </Link>
        <p className="mt-2 text-xs text-slate-600">
          팀원의 마이페이지·요금 분석 데모입니다. 기존 미션과 이 화면의 퀴즈
          진행 상황은 별도로 관리됩니다.
        </p>
      </div>
      <DemoGuard>
        <MyPageFrame html={html} />
        <MainNavigation active="/mypage" />
      </DemoGuard>
    </main>
  );
}
