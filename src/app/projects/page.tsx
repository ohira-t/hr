'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { FilterBar } from '@/components/projects/filter-bar';
import { ProjectTable } from '@/components/projects/project-table';
import { Button } from '@/components/ui/button';
import type { Category, Segment, ProjectStatus, MediaName, Position, EmploymentType, Project, Department, TargetPeriod } from '@/types/database';
import { CATEGORIES, SEGMENTS } from '@/types/database';

// 一覧用軽量APIレスポンスの型
interface ApiProjectLite {
  id: string;
  hrId: string;
  segment: string;
  category: string;
  clientName: string;
  clientNameKana: string;
  prefecture: string;
  position: string;
  employmentType: string;
  targetHiringCount: number;
  currentHiringCount: number;
  status: string;
  assignee: string;
  department: string;
  targetPeriod: string | null;
  handoverDate: string | null;
  deadlineDate: string | null;
  lastUpdated: string;
  nextAction: string;
  activeMedia: string[]; // 募集中のメディア名の配列
}

// 一覧用の軽量Project型
export interface ProjectLite {
  id: string;
  hrId: string;
  segment: Segment;
  category: Category;
  clientName: string;
  clientNameKana: string;
  prefecture: string;
  position: Position;
  employmentType: EmploymentType;
  targetHiringCount: number;
  currentHiringCount: number;
  status: ProjectStatus;
  assignee: string;
  department: Department;
  targetPeriod: TargetPeriod | null;
  handoverDate: Date | null;
  deadlineDate: Date | null;
  lastUpdated: Date;
  nextAction: string;
  activeMedia: MediaName[]; // 募集中のメディア名の配列
}

// APIレスポンスをProjectLite型に変換（軽量版）
function convertApiToProjectLite(api: ApiProjectLite): ProjectLite {
  return {
    id: api.id,
    hrId: api.hrId,
    segment: api.segment as Segment,
    category: api.category as Category,
    clientName: api.clientName,
    clientNameKana: api.clientNameKana,
    prefecture: api.prefecture,
    position: api.position as Position,
    employmentType: api.employmentType as EmploymentType,
    targetHiringCount: api.targetHiringCount,
    currentHiringCount: api.currentHiringCount,
    status: api.status as ProjectStatus,
    assignee: api.assignee,
    department: api.department as Department,
    targetPeriod: api.targetPeriod as TargetPeriod | null,
    handoverDate: api.handoverDate ? new Date(api.handoverDate) : null,
    deadlineDate: api.deadlineDate ? new Date(api.deadlineDate) : null,
    lastUpdated: new Date(api.lastUpdated),
    nextAction: api.nextAction,
    activeMedia: api.activeMedia as MediaName[],
  };
}

function ProjectsContent() {
  const searchParams = useSearchParams();
  
  const [projects, setProjects] = useState<ProjectLite[]>([]);
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

  // APIからプロジェクト一覧を取得（軽量版）
  useEffect(() => {
    async function fetchProjects() {
      try {
        // キャッシュを回避して常に最新データを取得
        const response = await fetch('/api/projects?lite=true', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data: ApiProjectLite[] = await response.json();
        setProjects(data.map(convertApiToProjectLite));
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
