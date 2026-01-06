'use client';

import { Header } from '@/components/layout/header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { UrgentProjects } from '@/components/dashboard/urgent-projects';
import { SlowProjects } from '@/components/dashboard/slow-projects';
import { HiringChart } from '@/components/dashboard/hiring-chart';
import { 
  SegmentAnalytics, 
  PositionAnalytics, 
  EmploymentTypeAnalytics, 
  PrefectureAnalytics 
} from '@/components/dashboard/analytics-cards';
import { mockProjects, calculateStats, getUrgentProjects, getSlowProjects } from '@/data/mock-projects';
import type { Category } from '@/types/database';

export default function DashboardPage() {
  const stats = calculateStats();
  const urgentProjects = getUrgentProjects(5);
  const slowProjects = getSlowProjects(5);
  
  // カテゴリー別にスタッツを整理
  const categories: Category[] = ['就労', 'GH', '看護'];
  
  const categoryStats = categories.map((category) => {
    const newStats = stats.find(s => s.category === category && s.segment === '新規') || {
      activeProjects: 0, targetHirings: 0, currentHirings: 0, hiringRate: 0
    };
    const existingStats = stats.find(s => s.category === category && s.segment === '既存') || {
      activeProjects: 0, targetHirings: 0, currentHirings: 0, hiringRate: 0
    };
    return { category, newStats, existingStats };
  });

  // チャート用データ
  const chartData = categories.map((category) => {
    const newStats = stats.find(s => s.category === category && s.segment === '新規');
    const existingStats = stats.find(s => s.category === category && s.segment === '既存');
    return {
      category: category === 'GH' ? 'グループホーム' : category === '就労' ? '就労支援' : '訪問看護',
      新規: newStats?.currentHirings || 0,
      既存: existingStats?.currentHirings || 0,
    };
  });

  // サマリー数値
  const totalActive = mockProjects.filter(p => p.status === '採用活動中').length;
  const totalTarget = mockProjects.reduce((sum, p) => sum + p.targetHiringCount, 0);
  const totalCurrent = mockProjects.reduce((sum, p) => sum + p.currentHiringCount, 0);

  return (
    <>
      <Header 
        title="ダッシュボード" 
        subtitle={`アクティブ案件: ${totalActive}件 | 採用目標: ${totalCurrent}/${totalTarget}名`}
        showSearch={false}
      />
      
      <div className="p-6 lg:p-8">
        {/* Quick Stats */}
        <div className="mb-6 lg:mb-8 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="rounded-2xl bg-white border border-gray-200/60 p-4 lg:p-6 opacity-0 animate-fade-in card-shadow">
            <p className="text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">アクティブ案件</p>
            <p className="mt-1 lg:mt-2 text-2xl lg:text-3xl font-bold text-gray-900">{totalActive}<span className="text-sm lg:text-base font-normal text-gray-500 ml-1">件</span></p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 lg:p-6 text-white opacity-0 animate-fade-in stagger-1">
            <p className="text-[10px] lg:text-xs font-medium text-emerald-100 uppercase tracking-wider whitespace-nowrap">採用目標</p>
            <p className="mt-1 lg:mt-2 text-2xl lg:text-3xl font-bold">{totalTarget}<span className="text-sm lg:text-base font-normal text-emerald-200 ml-1">名</span></p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 lg:p-6 text-white opacity-0 animate-fade-in stagger-2">
            <p className="text-[10px] lg:text-xs font-medium text-blue-100 uppercase tracking-wider whitespace-nowrap">採用済み</p>
            <p className="mt-1 lg:mt-2 text-2xl lg:text-3xl font-bold">{totalCurrent}<span className="text-sm lg:text-base font-normal text-blue-200 ml-1">名</span></p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-4 lg:p-6 text-white opacity-0 animate-fade-in stagger-3">
            <p className="text-[10px] lg:text-xs font-medium text-purple-100 uppercase tracking-wider whitespace-nowrap">達成率</p>
            <p className="mt-1 lg:mt-2 text-2xl lg:text-3xl font-bold">
              {totalTarget > 0 ? ((totalCurrent / totalTarget) * 100).toFixed(0) : 0}%
              <span className="text-sm lg:text-base font-normal text-purple-200 ml-1">全体</span>
            </p>
          </div>
        </div>

        {/* Category Metrics */}
        <div className="mb-6 lg:mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {categoryStats.map(({ category, newStats, existingStats }, index) => (
            <MetricCard
              key={category}
              category={category}
              newStats={newStats}
              existingStats={existingStats}
              index={index}
            />
          ))}
        </div>

        {/* Analytics Section */}
        <div className="mb-6 lg:mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <SegmentAnalytics projects={mockProjects} />
          <PositionAnalytics projects={mockProjects} />
          <EmploymentTypeAnalytics projects={mockProjects} />
          <PrefectureAnalytics projects={mockProjects} />
        </div>

        {/* Charts and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Chart */}
          <div className="lg:col-span-1">
            <HiringChart data={chartData} />
          </div>
          
          {/* Urgent Projects */}
          <div className="lg:col-span-1">
            <UrgentProjects projects={urgentProjects} />
          </div>
          
          {/* Slow Projects */}
          <div className="lg:col-span-1">
            <SlowProjects projects={slowProjects} />
          </div>
        </div>
      </div>
    </>
  );
}
