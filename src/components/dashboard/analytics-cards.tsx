'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Archive, 
  Briefcase, 
  Clock, 
  MapPin,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/database';

interface AnalyticsCardsProps {
  projects: Project[];
}

interface StatItem {
  label: string;
  count: number;
  active: number;
  href: string;
  color: string;
  bgColor: string;
}

export function SegmentAnalytics({ projects }: AnalyticsCardsProps) {
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === '採用活動中');
    
    return [
      {
        label: '新規',
        count: projects.filter(p => p.segment === '新規').length,
        active: activeProjects.filter(p => p.segment === '新規').length,
        hired: projects.filter(p => p.segment === '新規').reduce((sum, p) => sum + p.currentHiringCount, 0),
        target: projects.filter(p => p.segment === '新規').reduce((sum, p) => sum + p.targetHiringCount, 0),
        href: '/projects?segment=新規',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        icon: Sparkles,
      },
      {
        label: '既存',
        count: projects.filter(p => p.segment === '既存').length,
        active: activeProjects.filter(p => p.segment === '既存').length,
        hired: projects.filter(p => p.segment === '既存').reduce((sum, p) => sum + p.currentHiringCount, 0),
        target: projects.filter(p => p.segment === '既存').reduce((sum, p) => sum + p.targetHiringCount, 0),
        href: '/projects?segment=既存',
        color: 'text-slate-600',
        bgColor: 'bg-slate-100',
        icon: Archive,
      },
    ];
  }, [projects]);

  return (
    <Card className="border-0 card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
            <Sparkles className="h-4 w-4 text-amber-600" />
          </div>
          セグメント別
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.map((stat) => {
            const rate = stat.target > 0 ? (stat.hired / stat.target * 100) : 0;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('rounded-lg p-2', stat.bgColor)}>
                    <stat.icon className={cn('h-4 w-4', stat.color)} />
                  </div>
                  <div className="min-w-[100px]">
                    <p className="text-sm font-medium text-gray-900">{stat.label}案件</p>
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      稼働 {stat.active}件・全{stat.count}件
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-0.5 min-w-[80px]">
                    <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {stat.hired}/{stat.target}名
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        'text-lg font-bold tabular-nums',
                        rate >= 80 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-gray-600'
                      )}>
                        {rate.toFixed(0)}%
                      </span>
                      <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                        達成
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function PositionAnalytics({ projects }: AnalyticsCardsProps) {
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === '採用活動中');
    const positions = ['サビ管', '管理者', '支援員', '看護師', '世話人', 'その他'];
    
    return positions.map(position => {
      const positionProjects = position === 'その他' 
        ? projects.filter(p => !['サビ管', '管理者', '支援員', '看護師', '世話人'].includes(p.position))
        : projects.filter(p => p.position === position);
      const activeCount = position === 'その他'
        ? activeProjects.filter(p => !['サビ管', '管理者', '支援員', '看護師', '世話人'].includes(p.position)).length
        : activeProjects.filter(p => p.position === position).length;
      
      return {
        label: position,
        count: positionProjects.length,
        active: activeCount,
        hired: positionProjects.reduce((sum, p) => sum + p.currentHiringCount, 0),
        target: positionProjects.reduce((sum, p) => sum + p.targetHiringCount, 0),
      };
    }).filter(s => s.count > 0).sort((a, b) => b.active - a.active);
  }, [projects]);

  return (
    <Card className="border-0 card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100">
            <Briefcase className="h-4 w-4 text-emerald-600" />
          </div>
          募集職種別
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stats.slice(0, 5).map((stat, index) => {
            const rate = stat.target > 0 ? (stat.hired / stat.target * 100) : 0;
            const barWidth = stat.active > 0 ? Math.max((stat.active / stats[0].active) * 100, 20) : 0;
            
            return (
              <div key={stat.label} className="group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] bg-gray-100">
                      {stat.active}件
                    </Badge>
                    <span className={cn(
                      'text-xs font-medium',
                      rate >= 80 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-gray-500'
                    )}>
                      {stat.hired}/{stat.target}
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div 
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      index === 0 ? 'bg-emerald-500' : 
                      index === 1 ? 'bg-teal-500' : 
                      index === 2 ? 'bg-cyan-500' : 
                      'bg-gray-300'
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function EmploymentTypeAnalytics({ projects }: AnalyticsCardsProps) {
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === '採用活動中');
    const types = ['正社員', 'パート', '契約職員', '要確認'];
    
    return types.map(type => {
      const typeProjects = projects.filter(p => p.employmentType === type);
      return {
        label: type,
        count: typeProjects.length,
        active: activeProjects.filter(p => p.employmentType === type).length,
        hired: typeProjects.reduce((sum, p) => sum + p.currentHiringCount, 0),
        target: typeProjects.reduce((sum, p) => sum + p.targetHiringCount, 0),
      };
    }).filter(s => s.count > 0);
  }, [projects]);

  const total = stats.reduce((sum, s) => sum + s.active, 0);

  return (
    <Card className="border-0 card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          勤務形態別
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            {/* Simple donut chart using CSS */}
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {stats.map((stat, index) => {
                const percentage = total > 0 ? (stat.active / total) * 100 : 0;
                const offset = stats.slice(0, index).reduce((sum, s) => sum + (total > 0 ? (s.active / total) * 100 : 0), 0);
                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#6B7280'];
                
                return (
                  <circle
                    key={stat.label}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={colors[index]}
                    strokeWidth="20"
                    strokeDasharray={`${percentage * 2.51} ${251 - percentage * 2.51}`}
                    strokeDashoffset={-offset * 2.51}
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{total}</p>
                <p className="text-[10px] text-gray-500">件</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat, index) => {
            const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-gray-400'];
            const percentage = total > 0 ? ((stat.active / total) * 100).toFixed(0) : 0;
            
            return (
              <div key={stat.label} className="flex items-center gap-2">
                <div className={cn('w-2.5 h-2.5 rounded-full', colors[index])} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{stat.label}</p>
                  <p className="text-[10px] text-gray-500">{stat.active}件 ({percentage}%)</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function PrefectureAnalytics({ projects }: AnalyticsCardsProps) {
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === '採用活動中');
    const prefectureCounts: { [key: string]: { count: number; active: number } } = {};
    
    projects.forEach(p => {
      if (!prefectureCounts[p.prefecture]) {
        prefectureCounts[p.prefecture] = { count: 0, active: 0 };
      }
      prefectureCounts[p.prefecture].count++;
    });
    
    activeProjects.forEach(p => {
      if (prefectureCounts[p.prefecture]) {
        prefectureCounts[p.prefecture].active++;
      }
    });
    
    return Object.entries(prefectureCounts)
      .map(([prefecture, data]) => ({
        label: prefecture,
        ...data,
      }))
      .sort((a, b) => b.active - a.active);
  }, [projects]);

  const topPrefectures = stats.slice(0, 6);
  const otherCount = stats.slice(6).reduce((sum, s) => sum + s.active, 0);

  return (
    <Card className="border-0 card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
            <MapPin className="h-4 w-4 text-purple-600" />
          </div>
          都道府県別（アクティブ案件）
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topPrefectures.map((stat, index) => {
            const maxActive = topPrefectures[0]?.active || 1;
            const barWidth = (stat.active / maxActive) * 100;
            
            return (
              <div key={stat.label} className="flex items-center gap-3">
                <span className="w-16 text-sm font-medium text-gray-700 truncate">{stat.label}</span>
                <div className="flex-1 h-6 rounded-lg bg-gray-100 overflow-hidden relative">
                  <div 
                    className={cn(
                      'h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2',
                      index === 0 ? 'bg-gradient-to-r from-purple-400 to-purple-500' : 
                      index === 1 ? 'bg-gradient-to-r from-purple-300 to-purple-400' : 
                      'bg-purple-200'
                    )}
                    style={{ width: `${Math.max(barWidth, 15)}%` }}
                  >
                    <span className={cn(
                      'text-xs font-semibold',
                      index < 2 ? 'text-white' : 'text-purple-700'
                    )}>
                      {stat.active}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {otherCount > 0 && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <span className="w-16 text-sm text-gray-500">その他</span>
              <div className="flex-1">
                <span className="text-sm text-gray-500">{otherCount}件</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

