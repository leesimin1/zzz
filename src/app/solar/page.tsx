import 'server-only';

import type { Metadata } from 'next';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Link from 'next/link';
import { DemoGuard, DemoHeader } from '../DemoAuth';
import DemoAccountFrame from '../DemoAccountFrame';
import MainNavigation from '../MainNavigation';
import { DemoBillSummary } from '../DemoElectricityBill';

export const metadata: Metadata = {
  title: '우리 집 그래프 | POLAR HOME',
  description:
    '태양광 발전량, 전력 사용량과 배터리를 조절하는 에너지 시뮬레이션',
};

const solarTheme = `
  :root {
    --bg:#f3fbff; --card:#ffffff; --tx:#17365e; --mu:#526c85;
    --bd:#dceef8; --ok:#047857; --bl:#047857; --bl2:#e8faf2;
    --pv:#eaa51b; --ld:#2584df; --dc:#8b6fcd;
    --sh:0 5px 18px rgba(25,91,133,.06);
  }
  html,body {
    background:var(--bg); color:var(--tx);
    font-family:Arial,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;
  }
  .wrap { max-width:512px; padding:0 16px 88px; }
  .wrap>header { margin:0 0 16px; }
  .ttl { display:none; }
  .mon {
    width:100%; margin:0; display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px;
  }
  .mon>div { min-width:0; padding:12px 10px; border:1px solid var(--bd); border-radius:20px; }
  .mon b { font-size:18px; }
  .mon small { font-size:11px; }
  .ic { width:30px; height:30px; border-radius:10px; }
  .grid { grid-template-columns:minmax(0,1fr); gap:14px; }
  .side { position:static; order:-1; }
  main { grid-template-columns:minmax(0,1fr); }
  .row { display:grid; grid-template-columns:minmax(0,1fr); gap:14px; }
  .row>.card:nth-child(2) { order:0; }
  .kpis { grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
  .k { border:1px solid var(--bd); border-radius:18px; padding:12px; }
  .k b { font-size:18px; }
  .card { border:1px solid var(--bd); border-radius:24px; padding:16px; }
  .ch { height:230px; }
  .chd h2 { font-size:15px; }
  .bcard { gap:12px; }
  .bs { gap:10px 18px; }
  .sum { gap:12px; }
  .sum big { font-size:26px; }
  .sum b { overflow-wrap:anywhere; }
  .se,.ctrl select,.ctrl button,.gbox .at,#play { min-height:44px; }
  .gbox .tpl button { min-height:60px; }
  .ctrl .cx { min-height:36px; width:36px; height:36px; }
  .fab { min-height:48px; background:#047857; box-shadow:0 6px 20px rgba(4,120,87,.22); }
  .ctrl { border:1px solid var(--bd); border-radius:24px; }
  .hint { line-height:1.6; }
  .solar-chart-error {
    padding:14px; margin:0 0 14px; border-radius:16px;
    background:#fff5e6; color:#854d0e; line-height:1.6;
  }
  .source-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:5px; }
  .source-grid .tpl { display:contents; }
  .source-card { position:relative; min-width:0; border:1.5px solid var(--bd); border-radius:14px; background:var(--card); }
  .source-card.on { border-color:var(--bl); background:var(--bl2); }
  .gbox .source-card .source-main { display:block; width:100%; min-height:60px; padding:6px 7px; border:0; background:transparent; text-align:left; font-size:.8rem; line-height:1.3; }
  .source-card .nm { display:block; padding-right:14px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .source-card small { display:block; margin-top:1px; font-size:.64rem; font-weight:400; color:var(--mu); white-space:nowrap; }
  .gbox .source-card .source-remove { position:absolute; top:1px; right:3px; width:24px; min-height:24px; padding:0; border:0; background:transparent; color:var(--mu); font-size:.95rem; }
  .source-card button:focus-visible { outline:2px solid var(--bl); outline-offset:2px; }
  @media(prefers-reduced-motion:reduce) {
    *,*::before,*::after { transition:none!important; scroll-behavior:auto!important; }
  }
`;

export default function SolarPage() {
  const original = readFileSync(
    join(process.cwd(), '마이크로그리드 에너지 대시보드.html'),
    'utf8',
  );
  const document =
    original.match(
      /<!doctype html>\s*<html lang="ko">[\s\S]*?<\/html>/i,
    )?.[0] ?? original;

  const html = document
    .replace(/const DEV=\[[^\n]*\];/, 'const DEV=[];')
    .replace('let l=baseAt(h)', 'let l=0')
    .replace(
      'for(const d of DEV){if(h>=d.s&&h<d.e)',
      'for(const d of DEV){if(S.dev[d.k]&&h>=d.s&&h<d.e)',
    )
    .replaceAll('발전량 vs 부하 수요', '발전량 vs 가전기기별 사용량')
    .replaceAll('피크 부하 제어', '피크 시간 사용량 절감')
    .replaceAll('＋ 부하 직접 추가', '＋ 가전기기 추가')
    .replaceAll('부하 추가', '가전기기 추가')
    .replaceAll('경부하', '심야')
    .replaceAll('부하', '가전기기별 사용량')
    .replace('<html lang="ko">', '<html lang="ko" data-theme="light">')
    .replace(
      /<link\b[^>]*href="https:\/\/fonts\.googleapis\.com[^\"]*"[^>]*>\s*/g,
      '',
    )
    .replace('</head>', `<style>${solarTheme}</style></head>`)
    .replace(
      '</body>',
      '<script src="/solar-source-cards.js"></script><script src="/solar-appliances.js"></script></body>',
    )
    .replace('<body>', '<body class="editing">')
    .replace(
      '<div class="card fold" id="gcard">',
      '<div class="card" id="gcard">',
    )
    .replace(
      'aria-pressed="false">편집</button>',
      'aria-pressed="true">발전량 조절</button>',
    )
    .replace('gen:{},pv:null', 'gen:{},pv:{kw:5,on:true}')
    .replace(
      /\(async\(\)=>\{try\{\s*const \[db,user\]=await Promise\.all\(\[claude\.use\('db'\),claude\.use\('user'\)\]\);[\s\S]*?\}\)\(\);/,
      '',
    )
    .replace(
      '<div class="wrap">',
      '<div class="wrap"><p id="solar-chart-error" class="solar-chart-error" role="alert" hidden>차트를 불러오지 못했어요. 인터넷 연결을 확인한 뒤 화면을 새로고침해 주세요.</p>',
    )
    .replace(
      'src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"',
      'src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js" onerror="document.getElementById(\'solar-chart-error\').hidden=false"',
    );

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#eaf6fd] pb-[calc(76px+env(safe-area-inset-bottom))] text-[#17365e]">
      <header className="mx-auto w-full max-w-lg shrink-0 bg-gradient-to-b from-sky-100 to-[#f3fbff] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex min-h-11 items-center rounded-lg text-lg font-black focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            POLAR HOME
          </Link>
          <DemoHeader />
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-emerald-800">
              햇빛으로 채우는 더 푸른 내일
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
              우리 집 그래프
            </h1>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              발전량·사용량·배터리를 조절해 보세요.
              <br />
              실제 계량기와 연결되지 않은 시뮬레이션입니다.
            </p>
          </div>
          <span
            aria-hidden="true"
            className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-amber-100 text-4xl"
          >
            ☀
          </span>
        </div>
        <DemoBillSummary />
      </header>
      <DemoGuard
        className="flex min-h-0 flex-1 flex-col"
        loginMessage="우리 집 그래프와 사용 정보를 확인하려면 로그인해 주세요. 계정별로 별도의 데모를 이용할 수 있어요."
      >
        <DemoAccountFrame
          title="태양광 발전과 에너지 시뮬레이션"
          html={html}
          className="mx-auto block min-h-0 w-full max-w-lg flex-1 border-0 bg-[#f3fbff]"
        />
      </DemoGuard>
      <MainNavigation active="/solar" />
    </main>
  );
}
