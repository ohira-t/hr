'use client';

import { useState, useRef, useEffect } from 'react';
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
  RefreshCcw,
  ChevronDown,
  X,
  Check,
  User,
  Newspaper
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category, Segment, ProjectStatus, MediaName, Position, EmploymentType } from '@/types/database';
import { POSITIONS, EMPLOYMENT_TYPES } from '@/types/database';

interface FilterBarProps {
  categoryFilter: Category | 'all';
  segmentFilter: Segment | 'all';
  statusFilter: ProjectStatus | 'all';
  assigneeFilter: string | 'all';
  positionFilter: Position | 'all';
  employmentTypeFilter: EmploymentType | 'all';
  mediaFilter: MediaName[];
  sortBy: 'deadline' | 'elapsed' | 'updated' | 'client';
  onCategoryChange: (category: Category | 'all') => void;
  onSegmentChange: (segment: Segment | 'all') => void;
  onStatusChange: (status: ProjectStatus | 'all') => void;
  onAssigneeChange: (assignee: string | 'all') => void;
  onPositionChange: (position: Position | 'all') => void;
  onEmploymentTypeChange: (employmentType: EmploymentType | 'all') => void;
  onMediaChange: (media: MediaName[]) => void;
  onSortChange: (sort: 'deadline' | 'elapsed' | 'updated' | 'client') => void;
  onReset: () => void;
  assignees: string[];
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
  { value: 'all', label: '全て' },
  { value: '未着手', label: '未着手' },
  { value: '手続き中', label: '手続き中' },
  { value: '採用活動中', label: '採用活動中' },
  { value: '入社待機中', label: '入社待機中' },
  { value: '対応完了', label: '対応完了' },
  { value: '保留', label: '保留' },
  { value: '停止手続き中', label: '停止手続き中' },
  { value: '解約', label: '解約' },
  { value: '不要', label: '不要' },
];

const mediaOptions: MediaName[] = [
  'ジョブメドレー',
  'ウェルミージョブ',
  'ハローワーク',
  'エントリーポケット',
  '人材紹介',
  'リファラル',
  'リジョブ',
  'indeed Plus',
  'engage',
  'バイトル',
  'キャリアジョブズ',
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
  assigneeFilter,
  positionFilter,
  employmentTypeFilter,
  mediaFilter,
  sortBy,
  onCategoryChange,
  onSegmentChange,
  onStatusChange,
  onAssigneeChange,
  onPositionChange,
  onEmploymentTypeChange,
  onMediaChange,
  onSortChange,
  onReset,
  assignees,
}: FilterBarProps) {
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Click outside to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowFilterPopover(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = 
    categoryFilter !== 'all' || 
    segmentFilter !== 'all' || 
    statusFilter !== 'all' ||
    assigneeFilter !== 'all' ||
    positionFilter !== 'all' ||
    employmentTypeFilter !== 'all' ||
    mediaFilter.length > 0;

  const detailFilterCount = 
    (statusFilter !== 'all' ? 1 : 0) +
    (assigneeFilter !== 'all' ? 1 : 0) +
    (positionFilter !== 'all' ? 1 : 0) +
    (employmentTypeFilter !== 'all' ? 1 : 0) +
    (mediaFilter.length > 0 ? 1 : 0);

  const toggleMedia = (media: MediaName) => {
    if (mediaFilter.includes(media)) {
      onMediaChange(mediaFilter.filter(m => m !== media));
    } else {
      onMediaChange([...mediaFilter, media]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Main Filter Bar */}
      <div className="rounded-2xl bg-white p-4 card-shadow">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Filter Icon with Popover */}
            <div className="relative" ref={popoverRef}>
              <button
                onClick={() => setShowFilterPopover(!showFilterPopover)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                  showFilterPopover || detailFilterCount > 0
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Filter className="h-4 w-4" />
                {detailFilterCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-medium text-white">
                    {detailFilterCount}
                  </span>
                )}
              </button>

              {/* Filter Popover */}
              {showFilterPopover && (
                <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl bg-white p-4 shadow-xl border border-gray-100 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">詳細フィルタ</h3>
                    <button
                      onClick={() => setShowFilterPopover(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Assignee Filter */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                      <User className="h-3.5 w-3.5" />
                      担当者
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => onAssigneeChange('all')}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                          assigneeFilter === 'all'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        全員
                      </button>
                      {assignees.map((assignee) => (
                        <button
                          key={assignee}
                          onClick={() => onAssigneeChange(assignee)}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                            assigneeFilter === assignee
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {assignee}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position Filter */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                      <Briefcase className="h-3.5 w-3.5" />
                      募集職種
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => onPositionChange('all')}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                          positionFilter === 'all'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        全て
                      </button>
                      {POSITIONS.map((position) => (
                        <button
                          key={position}
                          onClick={() => onPositionChange(position)}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                            positionFilter === position
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {position}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Employment Type Filter */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                      <Clock className="h-3.5 w-3.5" />
                      勤務形態
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => onEmploymentTypeChange('all')}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                          employmentTypeFilter === 'all'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        全て
                      </button>
                      {EMPLOYMENT_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => onEmploymentTypeChange(type)}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                            employmentTypeFilter === type
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      ステータス
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {statuses.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => onStatusChange(status.value)}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                            statusFilter === status.value
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Media Filter */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                      <Newspaper className="h-3.5 w-3.5" />
                      媒体（複数選択可）
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                      {mediaOptions.map((media) => (
                        <button
                          key={media}
                          onClick={() => toggleMedia(media)}
                          className={cn(
                            'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                            mediaFilter.includes(media)
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {mediaFilter.includes(media) && <Check className="h-3 w-3" />}
                          {media}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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

      {/* Active Filter Chips */}
      {(assigneeFilter !== 'all' || positionFilter !== 'all' || employmentTypeFilter !== 'all' || mediaFilter.length > 0 || statusFilter !== 'all') && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-gray-500">適用中:</span>
          {statusFilter !== 'all' && (
            <Badge 
              variant="secondary" 
              className="gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
              onClick={() => onStatusChange('all')}
            >
              {statusFilter}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {assigneeFilter !== 'all' && (
            <Badge 
              variant="secondary" 
              className="gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
              onClick={() => onAssigneeChange('all')}
            >
              担当: {assigneeFilter}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {positionFilter !== 'all' && (
            <Badge 
              variant="secondary" 
              className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer"
              onClick={() => onPositionChange('all')}
            >
              職種: {positionFilter}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {employmentTypeFilter !== 'all' && (
            <Badge 
              variant="secondary" 
              className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer"
              onClick={() => onEmploymentTypeChange('all')}
            >
              形態: {employmentTypeFilter}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {mediaFilter.length > 0 && (
            <Badge 
              variant="secondary" 
              className="gap-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 cursor-pointer"
              onClick={() => onMediaChange([])}
            >
              媒体: {mediaFilter.length}件
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
