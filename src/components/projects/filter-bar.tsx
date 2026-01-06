'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  SortAsc, 
  Clock, 
  AlertTriangle,
  Building2,
  Briefcase,
  Stethoscope,
  RefreshCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category, Segment, ProjectStatus } from '@/types/database';

interface FilterBarProps {
  categoryFilter: Category | 'all';
  segmentFilter: Segment | 'all';
  statusFilter: ProjectStatus | 'all';
  sortBy: 'deadline' | 'elapsed' | 'updated' | 'client';
  onCategoryChange: (category: Category | 'all') => void;
  onSegmentChange: (segment: Segment | 'all') => void;
  onStatusChange: (status: ProjectStatus | 'all') => void;
  onSortChange: (sort: 'deadline' | 'elapsed' | 'updated' | 'client') => void;
  onReset: () => void;
}

const categories: { value: Category | 'all'; label: string; icon?: React.ElementType; color?: string }[] = [
  { value: 'all', label: '全業態' },
  { value: '就労', label: '就労', icon: Briefcase, color: 'text-emerald-600' },
  { value: 'GH', label: 'GH', icon: Building2, color: 'text-blue-600' },
  { value: '看護', label: '看護', icon: Stethoscope, color: 'text-purple-600' },
];

const segments: { value: Segment | 'all'; label: string }[] = [
  { value: 'all', label: '全セグメント' },
  { value: '新規', label: '新規' },
  { value: '既存', label: '既存' },
];

const statuses: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全ステータス' },
  { value: '採用活動中', label: '採用活動中' },
  { value: '対応完了', label: '対応完了' },
  { value: '保留', label: '保留' },
];

const sortOptions: { value: 'deadline' | 'elapsed' | 'updated' | 'client'; label: string; icon: React.ElementType }[] = [
  { value: 'deadline', label: '期限順', icon: AlertTriangle },
  { value: 'elapsed', label: '経過日数順', icon: Clock },
  { value: 'updated', label: '更新順', icon: RefreshCcw },
  { value: 'client', label: '五十音順', icon: SortAsc },
];

export function FilterBar({
  categoryFilter,
  segmentFilter,
  statusFilter,
  sortBy,
  onCategoryChange,
  onSegmentChange,
  onStatusChange,
  onSortChange,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters = 
    categoryFilter !== 'all' || 
    segmentFilter !== 'all' || 
    statusFilter !== 'all';

  return (
    <div className="rounded-2xl bg-white p-4 card-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Filter Icon */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
            <Filter className="h-4 w-4 text-gray-600" />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant="ghost"
                size="sm"
                onClick={() => onCategoryChange(cat.value)}
                className={cn(
                  'h-8 gap-1.5 rounded-lg px-3 text-xs font-medium transition-all',
                  categoryFilter === cat.value
                    ? 'bg-gray-900 text-white hover:bg-gray-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {cat.icon && <cat.icon className={cn('h-3.5 w-3.5', categoryFilter !== cat.value && cat.color)} />}
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-200" />

          {/* Segment Filter */}
          <div className="flex items-center gap-1.5">
            {segments.map((seg) => (
              <Button
                key={seg.value}
                variant="ghost"
                size="sm"
                onClick={() => onSegmentChange(seg.value)}
                className={cn(
                  'h-8 rounded-lg px-3 text-xs font-medium transition-all',
                  segmentFilter === seg.value
                    ? 'bg-gray-900 text-white hover:bg-gray-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {seg.label}
              </Button>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-200" />

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            {statuses.map((status) => (
              <Button
                key={status.value}
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange(status.value)}
                className={cn(
                  'h-8 rounded-lg px-3 text-xs font-medium transition-all',
                  statusFilter === status.value
                    ? 'bg-gray-900 text-white hover:bg-gray-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-gray-500 hover:text-gray-900"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              リセット
            </Button>
          )}

          <div className="h-6 w-px bg-gray-200" />

          {/* Sort Options */}
          <div className="flex items-center gap-1.5">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                size="sm"
                onClick={() => onSortChange(option.value)}
                className={cn(
                  'h-8 gap-1.5 rounded-lg px-3 text-xs font-medium transition-all',
                  sortBy === option.value
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                )}
              >
                <option.icon className="h-3.5 w-3.5" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

