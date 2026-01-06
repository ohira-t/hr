'use client';

import { useEffect, useState } from 'react';
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
import type { Category, Project, Segment, Position, EmploymentType, ProjectStatus, MediaName, MediaManagement, Department } from '@/types/database';
import { MEDIA_NAMES } from '@/types/database';
import { Loader2 } from 'lucide-react';

// APIレスポンスの型
interface ApiProject {
  id: string;
  hrId: string;
  segment: string;
  category: string;
  clientName: string;
  clientNameKana: string;
  clientId: string;
  applicationId: string;
  prefecture: string;
  city: string;
  facilityName: string;
  position: string;
  employmentType: string;
  targetHiringCount: number;
  currentHiringCount: number;
  status: string;
  assignee: string;
  department: string;
  handoverDate: string | null;
  deadlineDate: string | null;
  openingDate: string | null;
  hurdles: string;
  notes: string;
  nextAction: string;
  createdAt: string;
  lastUpdated: string;
  media: {
    id: string;
    projectId: string;
    mediaName: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
    updatedAt: string;
  }[];
}

// APIレスポンスをProject型に変換
function convertApiToProject(api: ApiProject): Project {
  const mediaMap = new Map(api.media.map(m => [m.mediaName, m]));
  const allMedia: MediaManagement[] = MEDIA_NAMES.map(mediaName => {
    const existing = mediaMap.get(mediaName);
    return {
      id: existing?.id || `${api.id}-${mediaName}`,
      projectId: api.id,
      mediaName: mediaName as MediaName,
      status: (existing?.status || '未掲載') as MediaManagement['status'],
      startDate: existing?.startDate ? new Date(existing.startDate) : null,
      endDate: existing?.endDate ? new Date(existing.endDate) : null,
      updatedAt: existing ? new Date(existing.updatedAt) : new Date(),
    };
  });

  return {
    id: api.id,
    hrId: api.hrId,
    segment: api.segment as Segment,
    category: api.category as Category,
    clientName: api.clientName,
    clientNameKana: api.clientNameKana,
    clientId: api.clientId,
    applicationId: api.applicationId,
    prefecture: api.prefecture,
    city: api.city,
    facilityName: api.facilityName,
    position: api.position as Position,
    employmentType: api.employmentType as EmploymentType,
    targetHiringCount: api.targetHiringCount,
    currentHiringCount: api.currentHiringCount,
    status: api.status as ProjectStatus,
    assignee: api.assignee,
    department: api.department as Department,
    handoverDate: api.handoverDate ? new Date(api.handoverDate) : null,
    deadlineDate: api.deadlineDate ? new Date(api.deadlineDate) : null,
    openingDate: api.openingDate,
    hurdles: api.hurdles,
    notes: api.notes,
    nextAction: api.nextAction,
    createdAt: new Date(api.createdAt),
    lastUpdated: new Date(api.lastUpdated),
    media: allMedia,
  };
}

// 統計を計算
function calculateStats(projects: Project[]) {
  const categories: Category[] = ['就労', 'GH', '看護'];
  const segments: Segment[] = ['新規', '既存'];
  
  const stats = [];
  for (const category of categories) {
    for (const segment of segments) {
      const filtered = projects.filter(p => 
        p.category === category && 
        p.segment === segment && 
        p.status === '採用活動中'
      );
      stats.push({
        category,
        segment,
        activeProjects: filtered.length,
        targetHirings: filtered.reduce((sum, p) => sum + p.targetHiringCount, 0),
        currentHirings: filtered.reduce((sum, p) => sum + p.currentHiringCount, 0),
        hiringRate: filtered.length > 0 
          ? (filtered.reduce((sum, p) => sum + p.currentHiringCount, 0) / 
             filtered.reduce((sum, p) => sum + p.targetHiringCount, 0)) * 100 
          : 0,
      });
    }
  }
  return stats;
}

// 緊急案件を取得
function getUrgentProjects(projects: Project[], limit: number = 5) {
  const now = new Date();
  return projects
    .filter(p => p.status === '採用活動中' && p.deadlineDate)
    .sort((a, b) => {
      if (!a.deadlineDate || !b.deadlineDate) return 0;
      return a.deadlineDate.getTime() - b.deadlineDate.getTime();
    })
    .filter(p => p.deadlineDate && p.deadlineDate > now)
    .slice(0, limit);
}

// 停滞案件を取得
function getSlowProjects(projects: Project[], limit: number = 5) {
  return projects
    .filter(p => p.status === '採用活動中' && p.handoverDate)
    .sort((a, b) => {
      if (!a.handoverDate || !b.handoverDate) return 0;
      return a.handoverDate.getTime() - b.handoverDate.getTime();
    })
    .slice(0, limit);
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data: ApiProject[] = await response.json();
        setProjects(data.map(convertApiToProject));
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <>
        <Header title="ダッシュボード" subtitle="読み込み中..." showSearch={false} />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-500">読み込み中...</span>
        </div>
      </>
    );
  }

  const stats = calculateStats(projects);
  const urgentProjects = getUrgentProjects(projects, 5);
  const slowProjects = getSlowProjects(projects, 5);
  
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
  const totalActive = projects.filter(p => p.status === '採用活動中').length;
  const totalTarget = projects.reduce((sum, p) => sum + p.targetHiringCount, 0);
  const totalCurrent = projects.reduce((sum, p) => sum + p.currentHiringCount, 0);

  return (
    <>
      <Header 
        title="ダッシュボード" 
        subtitle={`アクティブ案件: ${totalActive}件 | 採用目標: ${totalCurrent}/${totalTarget}名`}
        showSearch={false}
      />
      
      <div className="p-4 sm:p-6 lg:p-8 overflow-x-hidden">
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
        <div className="mb-6 lg:mb-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          <SegmentAnalytics projects={projects} />
          <PositionAnalytics projects={projects} />
          <EmploymentTypeAnalytics projects={projects} />
          <PrefectureAnalytics projects={projects} />
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
