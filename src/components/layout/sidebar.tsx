'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Briefcase,
  TrendingUp,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'ダッシュボード',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: '採用案件一覧',
    href: '/projects/',
    icon: Users,
  },
  {
    name: '設定',
    href: '/settings/',
    icon: Settings,
  },
];

const categoryLinks = [
  {
    name: '就労継続支援',
    href: '/projects/?category=就労',
    icon: Briefcase,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    name: 'グループホーム',
    href: '/projects/?category=GH',
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    name: '訪問看護',
    href: '/projects/?category=看護',
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200/60 bg-white/80 glass-effect">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-200/60 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <span className="text-lg font-bold text-white">T</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-gray-900">
              Talent Flow
            </h1>
            <p className="text-[11px] font-medium text-gray-500">HR管理システム</p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            メインメニュー
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href.replace(/\/$/, '')));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon 
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                  )} 
                />
                {item.name}
              </Link>
            );
          })}

          {/* Category Quick Access */}
          <div className="mt-8 mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            業態別
          </div>
          {categoryLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100"
            >
              <div className={cn('rounded-lg p-1.5', item.bgColor)}>
                <item.icon className={cn('h-4 w-4', item.color)} />
              </div>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200/60 p-4">
          <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <p className="text-xs font-medium text-gray-600">HR部 業務管理</p>
            <p className="mt-1 text-[11px] text-gray-500">
              福祉事業採用支援
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

