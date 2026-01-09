'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  HandHeart,
  Home,
  HeartPulse,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Archive,
  Newspaper
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLayout } from './layout-provider';

const navigation = [
  {
    name: 'ダッシュボード',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: '採用案件一覧',
    href: '/projects',
    icon: Users,
  },
  {
    name: '採用媒体',
    href: '/media',
    icon: Newspaper,
  },
  {
    name: 'CSV入出力',
    href: '/csv',
    icon: FileSpreadsheet,
  },
  {
    name: '設定',
    href: '/settings',
    icon: Settings,
  },
];

const categoryLinks = [
  {
    name: '就労継続支援',
    href: '/projects?category=就労',
    category: '就労',
    icon: HandHeart,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    name: 'グループホーム',
    href: '/projects?category=GH',
    category: 'GH',
    icon: Home,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    name: '訪問看護',
    href: '/projects?category=看護',
    category: '看護',
    icon: HeartPulse,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

const segmentLinks = [
  {
    name: '新規案件',
    href: '/projects?segment=新規',
    segment: '新規',
    icon: Sparkles,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    name: '既存案件',
    href: '/projects?segment=既存',
    segment: '既存',
    icon: Archive,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useLayout();

  const currentCategory = searchParams.get('category');
  const currentSegment = searchParams.get('segment');

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-gray-200/60 bg-white/80 glass-effect transition-all duration-300 ease-out",
        isSidebarCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo - リンクでダッシュボードに戻る */}
        <Link
          href="/"
          className={cn(
            "flex h-16 items-center border-b border-gray-200/60 transition-all duration-300 hover:bg-gray-50/50 cursor-pointer",
            isSidebarCollapsed ? "justify-center px-3" : "gap-3 px-6"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 shrink-0">
            <span className="text-base font-bold text-white tracking-tight">HR</span>
          </div>
          {!isSidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-semibold tracking-tight text-gray-900 whitespace-nowrap">
                採用管理システム
              </h1>
              <p className="text-[11px] font-medium text-gray-500">HRチーム</p>
            </div>
          )}
        </Link>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {!isSidebarCollapsed && (
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              メインメニュー
            </div>
          )}
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-xl text-sm font-medium transition-all duration-200',
                  isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <item.icon 
                  className={cn(
                    'h-5 w-5 transition-colors shrink-0',
                    isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                  )} 
                />
                {!isSidebarCollapsed && item.name}
              </Link>
            );
          })}

          {/* Category Quick Access */}
          {!isSidebarCollapsed && (
            <div className="mt-8 mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              業態別
            </div>
          )}
          {isSidebarCollapsed && <div className="my-4 border-t border-gray-200" />}
          {categoryLinks.map((item) => {
            const isActive = pathname === '/projects' && currentCategory === item.category;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-xl text-sm font-medium transition-all duration-200',
                  isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? cn(item.bgColor, 'shadow-sm')
                    : 'text-gray-600 hover:bg-gray-100'
                )}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <div className={cn(
                  'rounded-lg p-1.5 transition-colors shrink-0',
                  isActive ? 'bg-white/60' : item.bgColor
                )}>
                  <item.icon className={cn('h-4 w-4', item.color)} />
                </div>
                {!isSidebarCollapsed && (
                  <span className={isActive ? item.color : undefined}>{item.name}</span>
                )}
              </Link>
            );
          })}

          {/* Segment Quick Access */}
          {!isSidebarCollapsed && (
            <div className="mt-6 mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              セグメント別
            </div>
          )}
          {isSidebarCollapsed && <div className="my-4 border-t border-gray-200" />}
          {segmentLinks.map((item) => {
            const isActive = pathname === '/projects' && currentSegment === item.segment;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-xl text-sm font-medium transition-all duration-200',
                  isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? cn(item.bgColor, 'shadow-sm')
                    : 'text-gray-600 hover:bg-gray-100'
                )}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <div className={cn(
                  'rounded-lg p-1.5 transition-colors shrink-0',
                  isActive ? 'bg-white/60' : item.bgColor
                )}>
                  <item.icon className={cn('h-4 w-4', item.color)} />
                </div>
                {!isSidebarCollapsed && (
                  <span className={isActive ? item.color : undefined}>{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse/Expand Button */}
        <div className="border-t border-gray-200/60 p-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={cn(
              'flex items-center rounded-xl text-sm font-medium transition-all duration-200 w-full',
              isSidebarCollapsed 
                ? 'justify-center p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100' 
                : 'gap-3 px-3 py-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            )}
            title={isSidebarCollapsed ? 'メニューを展開' : 'メニューを折りたたむ'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                メニューを折りたたむ
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        {!isSidebarCollapsed && (
          <div className="border-t border-gray-200/60 p-4">
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4">
              <p className="text-xs font-medium text-gray-600">HRチーム 業務管理</p>
              <p className="mt-1 text-[11px] text-gray-500">
                福祉事業採用支援
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
