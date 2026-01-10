'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { ActiveMediaBadges } from './active-media-badges';
import { cn } from '@/lib/utils';
import { getCategoryColor, getSegmentColor, getStatusColor } from '@/lib/category-utils';
import { calculateDateInfo, formatElapsedDays, formatRemainingDays, formatDate } from '@/lib/date-utils';
import type { Category, Segment, ProjectStatus, MediaName, Position, EmploymentType, Department, TargetPeriod } from '@/types/database';
import { ChevronDown, ChevronUp, ChevronsUpDown, ExternalLink } from 'lucide-react';

// 一覧用の軽量Project型（page.tsxからexportされた型を使用）
interface ProjectLite {
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
  activeMedia: MediaName[];
}

interface ProjectTableProps {
  projects: ProjectLite[];
  categoryFilter: Category | 'all';
  segmentFilter: Segment | 'all';
  statusFilter: ProjectStatus | 'all';
  assigneeFilter: string | 'all';
  positionFilter: Position | 'all';
  employmentTypeFilter: EmploymentType | 'all';
  mediaFilter: MediaName[];
  searchQuery: string;
  sortBy: 'deadline' | 'elapsed' | 'updated' | 'client';
}

const columnHelper = createColumnHelper<ProjectLite>();

export function ProjectTable({
  projects,
  categoryFilter,
  segmentFilter,
  statusFilter,
  assigneeFilter,
  positionFilter,
  employmentTypeFilter,
  mediaFilter,
  searchQuery,
  sortBy,
}: ProjectTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);

  // フィルタリングとソート
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // テキスト検索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.hrId.toLowerCase().includes(query) ||
        p.clientName.toLowerCase().includes(query) ||
        p.prefecture.toLowerCase().includes(query) ||
        p.position.toLowerCase().includes(query) ||
        p.assignee.toLowerCase().includes(query)
      );
    }

    // カテゴリフィルタ
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    // セグメントフィルタ
    if (segmentFilter !== 'all') {
      result = result.filter(p => p.segment === segmentFilter);
    }
    // ステータスフィルタ
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    // 担当者フィルタ
    if (assigneeFilter !== 'all') {
      result = result.filter(p => p.assignee === assigneeFilter);
    }
    // 募集職種フィルタ
    if (positionFilter !== 'all') {
      result = result.filter(p => p.position === positionFilter);
    }
    // 勤務形態フィルタ
    if (employmentTypeFilter !== 'all') {
      result = result.filter(p => p.employmentType === employmentTypeFilter);
    }
    // 媒体フィルタ（掲載中のメディアでフィルタリング）
    if (mediaFilter.length > 0) {
      result = result.filter(p => 
        mediaFilter.some(filterMedia => p.activeMedia.includes(filterMedia))
      );
    }

    // ソート
    result.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          if (!a.deadlineDate && !b.deadlineDate) return 0;
          if (!a.deadlineDate) return 1;
          if (!b.deadlineDate) return -1;
          return a.deadlineDate.getTime() - b.deadlineDate.getTime();
        case 'elapsed':
          const aElapsed = a.handoverDate ? new Date().getTime() - a.handoverDate.getTime() : 0;
          const bElapsed = b.handoverDate ? new Date().getTime() - b.handoverDate.getTime() : 0;
          return bElapsed - aElapsed;
        case 'updated':
          return b.lastUpdated.getTime() - a.lastUpdated.getTime();
        case 'client':
          return a.clientName.localeCompare(b.clientName, 'ja');
        default:
          return 0;
      }
    });

    return result;
  }, [projects, categoryFilter, segmentFilter, statusFilter, assigneeFilter, positionFilter, employmentTypeFilter, mediaFilter, searchQuery, sortBy]);

  const columns = useMemo(() => [
    columnHelper.accessor('segment', {
      header: 'セグメント',
      cell: (info) => (
        <Badge 
          variant="outline" 
          className={cn('text-[11px] px-2 py-0.5 whitespace-nowrap', getSegmentColor(info.getValue()))}
        >
          {info.getValue()}
        </Badge>
      ),
      size: 90,
    }),
    columnHelper.accessor('hrId', {
      header: 'HR ID',
      cell: (info) => (
        <span className="font-mono text-[13px] text-gray-600 whitespace-nowrap">{info.getValue()}</span>
      ),
      size: 100,
    }),
    columnHelper.accessor('clientName', {
      header: 'クライアント名',
      cell: (info) => (
        <div className="min-w-[180px]">
          <p className="text-[13px] font-medium text-gray-900 whitespace-nowrap">{info.getValue()}</p>
          <p className="text-[12px] text-gray-500 whitespace-nowrap">
            {info.row.original.position} · {info.row.original.employmentType}
          </p>
        </div>
      ),
      size: 240,
    }),
    columnHelper.accessor('category', {
      header: '業態',
      cell: (info) => (
        <Badge 
          variant="outline" 
          className={cn('text-[11px] px-2 py-0.5 whitespace-nowrap', getCategoryColor(info.getValue()))}
        >
          {info.getValue()}
        </Badge>
      ),
      size: 80,
    }),
    columnHelper.accessor('prefecture', {
      header: 'エリア',
      cell: (info) => (
        <p className="text-[13px] text-gray-900 min-w-[80px]">{info.getValue() || '—'}</p>
      ),
      size: 100,
    }),
    columnHelper.accessor('handoverDate', {
      header: '経過',
      cell: (info) => {
        const dateInfo = calculateDateInfo(info.getValue(), info.row.original.deadlineDate);
        return (
          <div className="min-w-[80px]">
            <div className="flex items-center gap-1.5">
              {dateInfo.isSlow && (
                <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0">
                  Slow
                </Badge>
              )}
            </div>
            <p className={cn(
              'text-[13px]',
              dateInfo.isSlow ? 'text-amber-600 font-medium' : 'text-gray-600'
            )}>
              {formatElapsedDays(dateInfo.elapsedDays)}
            </p>
          </div>
        );
      },
      size: 100,
    }),
    columnHelper.accessor('deadlineDate', {
      header: '期限',
      cell: (info) => {
        const dateInfo = calculateDateInfo(info.row.original.handoverDate, info.getValue());
        return (
          <div className="min-w-[90px]">
            <p className={cn(
              'text-[13px] font-medium',
              dateInfo.isOverdue ? 'text-red-600' :
              dateInfo.isUrgent ? 'text-amber-600' : 'text-gray-600'
            )}>
              {formatRemainingDays(dateInfo.remainingDays)}
            </p>
            <p className="text-[12px] text-gray-400">
              {info.getValue() ? formatDate(info.getValue()) : '—'}
            </p>
          </div>
        );
      },
      size: 110,
    }),
    columnHelper.accessor('activeMedia', {
      header: '掲載媒体',
      cell: (info) => <ActiveMediaBadges activeMedia={info.getValue()} />,
      size: 160,
    }),
    columnHelper.accessor('status', {
      header: 'ステータス',
      cell: (info) => (
        <Badge className={cn('text-[11px] whitespace-nowrap', getStatusColor(info.getValue()))}>
          {info.getValue()}
        </Badge>
      ),
      size: 110,
    }),
    columnHelper.accessor('assignee', {
      header: '担当者',
      cell: (info) => (
        <span className="text-[13px] text-gray-700 whitespace-nowrap">{info.getValue()}</span>
      ),
      size: 70,
    }),
    columnHelper.accessor('nextAction', {
      header: '次アクション',
      cell: (info) => {
        const value = info.getValue();
        return value ? (
          <p className="text-[13px] text-gray-700 whitespace-nowrap max-w-[200px] truncate" title={value}>
            {value}
          </p>
        ) : (
          <span className="text-[12px] text-gray-400">—</span>
        );
      },
      size: 200,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <Link 
          href={`/projects/${info.row.original.id}`}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 inline-flex"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      ),
      size: 48,
    }),
  ], []);

  const table = useReactTable({
    data: filteredProjects,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const hasFilters = categoryFilter !== 'all' || segmentFilter !== 'all' || statusFilter !== 'all' || assigneeFilter !== 'all' || mediaFilter.length > 0 || searchQuery.trim();

  return (
    <div className="overflow-hidden rounded-2xl bg-white card-shadow">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200/80 bg-gray-50/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-2.5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'flex items-center gap-1.5',
                          header.column.getCanSort() && 'cursor-pointer select-none hover:text-gray-900 transition-colors'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {{
                              asc: <ChevronUp className="h-3.5 w-3.5" />,
                              desc: <ChevronDown className="h-3.5 w-3.5" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <p className="text-sm text-gray-500">条件に一致する案件がありません</p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-gray-100/80 transition-colors hover:bg-blue-50/30 cursor-pointer',
                    'opacity-0 animate-fade-in',
                    index < 5 && `stagger-${index + 1}`
                  )}
                  style={{ animationDelay: index >= 5 ? `${0.05 * index}s` : undefined }}
                  onClick={() => router.push(`/projects/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-2.5 py-3"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="border-t border-gray-200/80 bg-gray-50/50 px-3 py-3">
        <p className="text-[13px] text-gray-600">
          <span className="font-medium">{filteredProjects.length}件</span>の案件を表示中
          {hasFilters && (
            <span className="ml-2 text-gray-400">
              （フィルター適用中）
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
