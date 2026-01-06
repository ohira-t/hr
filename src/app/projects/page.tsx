'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { FilterBar } from '@/components/projects/filter-bar';
import { ProjectTable } from '@/components/projects/project-table';
import { mockProjects } from '@/data/mock-projects';
import type { Category, Segment, ProjectStatus } from '@/types/database';

export default function ProjectsPage() {
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [segmentFilter, setSegmentFilter] = useState<Segment | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('採用活動中');
  const [sortBy, setSortBy] = useState<'deadline' | 'elapsed' | 'updated' | 'client'>('deadline');

  const handleReset = () => {
    setCategoryFilter('all');
    setSegmentFilter('all');
    setStatusFilter('all');
    setSortBy('deadline');
  };

  const activeCount = mockProjects.filter(p => p.status === '採用活動中').length;
  const totalCount = mockProjects.length;

  return (
    <>
      <Header 
        title="採用案件一覧" 
        subtitle={`全${totalCount}件 | アクティブ${activeCount}件`}
      />
      
      <div className="p-8 space-y-6">
        {/* Filter Bar */}
        <FilterBar
          categoryFilter={categoryFilter}
          segmentFilter={segmentFilter}
          statusFilter={statusFilter}
          sortBy={sortBy}
          onCategoryChange={setCategoryFilter}
          onSegmentChange={setSegmentFilter}
          onStatusChange={setStatusFilter}
          onSortChange={setSortBy}
          onReset={handleReset}
        />

        {/* Project Table */}
        <ProjectTable
          projects={mockProjects}
          categoryFilter={categoryFilter}
          segmentFilter={segmentFilter}
          statusFilter={statusFilter}
          sortBy={sortBy}
        />
      </div>
    </>
  );
}

