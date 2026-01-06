'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/database';
import { getCategoryLabel } from '@/lib/category-utils';
import { Briefcase, Building2, Stethoscope } from 'lucide-react';

interface MetricCardProps {
  category: Category;
  newStats: {
    activeProjects: number;
    targetHirings: number;
    currentHirings: number;
    hiringRate: number;
  };
  existingStats: {
    activeProjects: number;
    targetHirings: number;
    currentHirings: number;
    hiringRate: number;
  };
  index: number;
}

const categoryConfig = {
  '就労': {
    icon: Briefcase,
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-500',
    progressColor: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
  },
  'GH': {
    icon: Building2,
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-500',
    progressColor: 'bg-blue-500',
    lightBg: 'bg-blue-50',
  },
  '看護': {
    icon: Stethoscope,
    gradient: 'from-purple-500 to-pink-600',
    iconBg: 'bg-purple-500',
    progressColor: 'bg-purple-500',
    lightBg: 'bg-purple-50',
  },
};

export function MetricCard({ category, newStats, existingStats, index }: MetricCardProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;
  
  const totalActive = newStats.activeProjects + existingStats.activeProjects;
  const totalTarget = newStats.targetHirings + existingStats.targetHirings;
  const totalCurrent = newStats.currentHirings + existingStats.currentHirings;
  const totalRate = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  return (
    <Card 
      className={cn(
        'relative overflow-hidden border-0 card-shadow card-shadow-hover opacity-0 animate-fade-in',
        `stagger-${index + 1}`
      )}
    >
      {/* Background gradient decoration */}
      <div className={cn(
        'absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10 blur-2xl',
        `bg-gradient-to-br ${config.gradient}`
      )} />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl shadow-lg',
              `bg-gradient-to-br ${config.gradient}`
            )}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">
                {getCategoryLabel(category)}
              </CardTitle>
              <p className="text-xs text-gray-500">
                アクティブ案件: {totalActive}件
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-gray-900">
              {totalCurrent}
              <span className="ml-1 text-lg font-normal text-gray-400">/ {totalTarget}</span>
            </span>
            <span className={cn(
              'text-sm font-semibold',
              totalRate >= 80 ? 'text-emerald-600' : 
              totalRate >= 50 ? 'text-amber-600' : 'text-gray-500'
            )}>
              {totalRate.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div 
              className={cn('h-full rounded-full transition-all duration-500', config.progressColor)}
              style={{ width: `${Math.min(totalRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Segment Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className={cn('rounded-xl p-3', config.lightBg)}>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0">
                新規
              </Badge>
              <span className="text-xs text-gray-500">{newStats.activeProjects}件</span>
            </div>
            <p className="mt-1.5 text-lg font-semibold text-gray-900">
              {newStats.currentHirings}/{newStats.targetHirings}
            </p>
          </div>
          <div className={cn('rounded-xl p-3', config.lightBg)}>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-[10px] px-1.5 py-0">
                既存
              </Badge>
              <span className="text-xs text-gray-500">{existingStats.activeProjects}件</span>
            </div>
            <p className="mt-1.5 text-lg font-semibold text-gray-900">
              {existingStats.currentHirings}/{existingStats.targetHirings}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

