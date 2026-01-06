'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { FilterBar } from '@/components/projects/filter-bar';
import { ProjectTable } from '@/components/projects/project-table';
import { Button } from '@/components/ui/button';
import type { Category, Segment, ProjectStatus, MediaName, Position, EmploymentType, Project, MediaManagement, Department } from '@/types/database';
import { CATEGORIES, SEGMENTS, MEDIA_NAMES } from '@/types/database';

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
  // 全メディアのリストを作成（APIにあるものは使用、ないものは未掲載）
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

function ProjectsContent() {
  const searchParams = useSearchParams();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [segmentFilter, setSegmentFilter] = useState<Segment | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('採用活動中');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'all'>('all');
  const [positionFilter, setPositionFilter] = useState<Position | 'all'>('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<EmploymentType | 'all'>('all');
  const [mediaFilter, setMediaFilter] = useState<MediaName[]>([]);
  const [sortBy, setSortBy] = useState<'deadline' | 'elapsed' | 'updated' | 'client'>('deadline');

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

  // URLパラメータからフィルターを初期化
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const segmentParam = searchParams.get('segment');
    
    if (categoryParam && CATEGORIES.includes(categoryParam as Category)) {
      setCategoryFilter(categoryParam as Category);
      setSegmentFilter('all'); // カテゴリ指定時はセグメントをリセット
    }
    
    if (segmentParam && SEGMENTS.includes(segmentParam as Segment)) {
      setSegmentFilter(segmentParam as Segment);
      setCategoryFilter('all'); // セグメント指定時はカテゴリをリセット
    }
  }, [searchParams]);

  // 担当者リストを取得
  const assignees = useMemo(() => {
    const uniqueAssignees = [...new Set(projects.map(p => p.assignee))];
    return uniqueAssignees.sort((a, b) => a.localeCompare(b, 'ja'));
  }, [projects]);

  const handleReset = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setSegmentFilter('all');
    setStatusFilter('採用活動中');
    setAssigneeFilter('all');
    setPositionFilter('all');
    setEmploymentTypeFilter('all');
    setMediaFilter([]);
    setSortBy('deadline');
  };

  const activeCount = projects.filter(p => p.status === '採用活動中').length;
  const totalCount = projects.length;

  return (
    <>
      <Header 
        title="採用案件一覧" 
        subtitle={`全${totalCount}件 | アクティブ${activeCount}件`}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch={true}
        actions={
          <Link href="/projects/new">
            <Button 
              variant="primary" 
              className="h-9 rounded-full pl-3.5 pr-5 gap-2"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              <span className="leading-none tracking-[-0.01em]">新規登録</span>
            </Button>
          </Link>
        }
      />
      
      <div className="p-8 space-y-6">
        {/* Filter Bar */}
        <FilterBar
          categoryFilter={categoryFilter}
          segmentFilter={segmentFilter}
          statusFilter={statusFilter}
          assigneeFilter={assigneeFilter}
          positionFilter={positionFilter}
          employmentTypeFilter={employmentTypeFilter}
          mediaFilter={mediaFilter}
          sortBy={sortBy}
          onCategoryChange={setCategoryFilter}
          onSegmentChange={setSegmentFilter}
          onStatusChange={setStatusFilter}
          onAssigneeChange={setAssigneeFilter}
          onPositionChange={setPositionFilter}
          onEmploymentTypeChange={setEmploymentTypeFilter}
          onMediaChange={setMediaFilter}
          onSortChange={setSortBy}
          onReset={handleReset}
          assignees={assignees}
        />

        {/* Project Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-500">読み込み中...</span>
          </div>
        ) : (
          <ProjectTable
            projects={projects}
            categoryFilter={categoryFilter}
            segmentFilter={segmentFilter}
            statusFilter={statusFilter}
            assigneeFilter={assigneeFilter}
            positionFilter={positionFilter}
            employmentTypeFilter={employmentTypeFilter}
            mediaFilter={mediaFilter}
            searchQuery={searchQuery}
            sortBy={sortBy}
          />
        )}
      </div>
    </>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-500">読み込み中...</span>
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}
