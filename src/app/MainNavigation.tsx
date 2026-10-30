import Link from 'next/link';
import { DemoMyPageLink } from './DemoAuth';

const navigation = [
  { icon: '⌂', label: '홈', href: '/' },
  { icon: '☀', label: '태양광', href: '/solar' },
  { icon: '🌱', label: '미션', href: '/missions' },
];

export default function MainNavigation({
  active = '/',
}: {
  active?: '/' | '/solar' | '/missions' | '/mypage';
}) {
  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto grid w-full max-w-lg grid-cols-4 border-t border-sky-100 bg-white/95 px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] text-[#17365e] backdrop-blur"
    >
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.href === active ? 'page' : undefined}
          className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 ${
            item.href === active
              ? 'bg-emerald-50 text-emerald-800'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <span aria-hidden="true" className="text-2xl">
            {item.icon}
          </span>
          {item.label}
        </Link>
      ))}
      <DemoMyPageLink active={active === '/mypage'} />
    </nav>
  );
}
