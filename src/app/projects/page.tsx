'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { FilterBar } from '@/components/projects/filter-bar';
import { ProjectTable } from '@/components/projects/project-table';
import { Button } from '@/components/ui/button';
import { mockProjects } from '@/data/mock-projects';
import type { Category, Segment, ProjectStatus, MediaName } from '@/types/database';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [segmentFilter, setSegmentFilter] = useState<Segment | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('採用活動中');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'all'>('all');
  const [mediaFilter, setMediaFilter] = useState<MediaName[]>([]);
  const [sortBy, setSortBy] = useState<'deadline' | 'elapsed' | 'updated' | 'client'>('deadline');

  // 担当者リストを取得
  const assignees = useMemo(() => {
    const uniqueAssignees = [...new Set(mockProjects.map(p => p.assignee))];
    return uniqueAssignees.sort((a, b) => a.localeCompare(b, 'ja'));
  }, []);

  const handleReset = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setSegmentFilter('all');
    setStatusFilter('採用活動中');
    setAssigneeFilter('all');
    setMediaFilter([]);
    setSortBy('deadline');
  };

  const activeCount = mockProjects.filter(p => p.status === '採用活動中').length;
  const totalCount = mockProjects.length;

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
          mediaFilter={mediaFilter}
          sortBy={sortBy}
          onCategoryChange={setCategoryFilter}
          onSegmentChange={setSegmentFilter}
          onStatusChange={setStatusFilter}
          onAssigneeChange={setAssigneeFilter}
          onMediaChange={setMediaFilter}
          onSortChange={setSortBy}
          onReset={handleReset}
          assignees={assignees}
        />

        {/* Project Table */}
        <ProjectTable
          projects={mockProjects}
          categoryFilter={categoryFilter}
          segmentFilter={segmentFilter}
          statusFilter={statusFilter}
          assigneeFilter={assigneeFilter}
          mediaFilter={mediaFilter}
          searchQuery={searchQuery}
          sortBy={sortBy}
        />
      </div>
    </>
  );
}
