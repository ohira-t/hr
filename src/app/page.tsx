'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { HiringChart } from '@/components/dashboard/hiring-chart';
import { UrgentProjects } from '@/components/dashboard/urgent-projects';
import { SlowProjects } from '@/components/dashboard/slow-projects';
import { SegmentAnalytics, PositionAnalytics, EmploymentTypeAnalytics, PrefectureAnalytics } from '@/components/dashboard/analytics-cards';
import type { Category, Segment, Project, MediaManagement, MediaName, Position, EmploymentType, ProjectStatus, Department } from '@/types/database';
import { MEDIA_NAMES } from '@/types/database';

// ダッシュボードで表示する主要カテゴリ（MetricCardがサポートするもの）
const DASHBOARD_CATEGORIES: Category[] = ['就労', 'GH', '看護'];
import { calculateDateInfo } from '@/lib/date-utils';

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

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // APIからプロジェクト一覧を取得
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

  // アクティブプロジェクトのみ
  const activeProjects = useMemo(() => 
    projects.filter(p => p.status === '採用活動中'), 
    [projects]
  );

  // カテゴリ別統計を計算（主要3カテゴリのみ）
  const categoryStats = useMemo(() => {
    return DASHBOARD_CATEGORIES.map(category => {
      const categoryProjects = activeProjects.filter(p => p.category === category);
      const newProjects = categoryProjects.filter(p => p.segment === '新規');
      const existingProjects = categoryProjects.filter(p => p.segment === '既存');
      
      return {
        category,
        newStats: {
          activeProjects: newProjects.length,
          targetHirings: newProjects.reduce((sum, p) => sum + p.targetHiringCount, 0),
          currentHirings: newProjects.reduce((sum, p) => sum + p.currentHiringCount, 0),
          hiringRate: 0,
        },
        existingStats: {
          activeProjects: existingProjects.length,
          targetHirings: existingProjects.reduce((sum, p) => sum + p.targetHiringCount, 0),
          currentHirings: existingProjects.reduce((sum, p) => sum + p.currentHiringCount, 0),
          hiringRate: 0,
        },
      };
    }).map(stat => ({
      ...stat,
      newStats: {
        ...stat.newStats,
        hiringRate: stat.newStats.targetHirings > 0 
          ? (stat.newStats.currentHirings / stat.newStats.targetHirings) * 100 
          : 0,
      },
      existingStats: {
        ...stat.existingStats,
        hiringRate: stat.existingStats.targetHirings > 0 
          ? (stat.existingStats.currentHirings / stat.existingStats.targetHirings) * 100 
          : 0,
      },
    }));
  }, [activeProjects]);

  // チャートデータを計算（主要3カテゴリのみ）
  const chartData = useMemo(() => {
    return DASHBOARD_CATEGORIES.map(category => {
      const categoryProjects = activeProjects.filter(p => p.category === category);
      return {
        category: category,
        新規: categoryProjects.filter(p => p.segment === '新規').reduce((sum, p) => sum + p.currentHiringCount, 0),
        既存: categoryProjects.filter(p => p.segment === '既存').reduce((sum, p) => sum + p.currentHiringCount, 0),
      };
    });
  }, [activeProjects]);

  // 期限間近の案件（14日以内）
  const urgentProjects = useMemo(() => {
    return activeProjects
      .filter(p => {
        const dateInfo = calculateDateInfo(p.handoverDate, p.deadlineDate);
        return dateInfo.remainingDays !== null && dateInfo.remainingDays <= 14;
      })
      .sort((a, b) => {
        const aInfo = calculateDateInfo(a.handoverDate, a.deadlineDate);
        const bInfo = calculateDateInfo(b.handoverDate, b.deadlineDate);
        return (aInfo.remainingDays ?? Infinity) - (bInfo.remainingDays ?? Infinity);
      })
      .slice(0, 5);
  }, [activeProjects]);

  // 長期対応中の案件（30日以上経過）
  const slowProjects = useMemo(() => {
    return activeProjects
      .filter(p => {
        const dateInfo = calculateDateInfo(p.handoverDate, p.deadlineDate);
        return dateInfo.elapsedDays !== null && dateInfo.elapsedDays >= 30;
      })
      .sort((a, b) => {
        const aInfo = calculateDateInfo(a.handoverDate, a.deadlineDate);
        const bInfo = calculateDateInfo(b.handoverDate, b.deadlineDate);
        return (bInfo.elapsedDays ?? 0) - (aInfo.elapsedDays ?? 0);
      })
      .slice(0, 5);
  }, [activeProjects]);

  // 統計情報
  const totalActive = activeProjects.length;
  const totalTarget = activeProjects.reduce((sum, p) => sum + p.targetHiringCount, 0);
  const totalHired = activeProjects.reduce((sum, p) => sum + p.currentHiringCount, 0);

  if (isLoading) {
    return (
      <>
        <Header title="ダッシュボード" showSearch={false} />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-500">読み込み中...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        title="ダッシュボード" 
        subtitle={`アクティブ案件 ${totalActive}件 | 採用目標 ${totalTarget}名 | 採用済 ${totalHired}名`}
        showSearch={false}
      />
      
      <div className="p-8 space-y-8">
        {/* カテゴリ別メトリクスカード */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            業態別 採用進捗
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryStats.map((stat, index) => (
              <MetricCard
                key={stat.category}
                category={stat.category}
                newStats={stat.newStats}
                existingStats={stat.existingStats}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* チャートとアラート */}
        <section className="grid gap-6 lg:grid-cols-2">
          <HiringChart data={chartData} />
          <div className="grid gap-6">
            <UrgentProjects projects={urgentProjects} />
            <SlowProjects projects={slowProjects} />
          </div>
        </section>

        {/* 分析カード */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            詳細分析
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <SegmentAnalytics projects={activeProjects} />
            <PositionAnalytics projects={activeProjects} />
            <EmploymentTypeAnalytics projects={activeProjects} />
            <PrefectureAnalytics projects={activeProjects} />
          </div>
        </section>
      </div>
    </>
  );
}
