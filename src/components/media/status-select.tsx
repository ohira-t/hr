'use client';

import { cn } from '@/lib/utils';
import type { MediaStatus } from '@/types/database';
import { MEDIA_STATUSES } from '@/types/database';

interface StatusSelectProps {
  value: MediaStatus;
  onChange: (value: MediaStatus) => void;
  className?: string;
}

// ステータスごとの背景色とテキスト色
const statusStyles: Record<MediaStatus, { bg: string; text: string; border: string }> = {
  '未掲載': {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
  '準備中': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
  },
  '審査・同期中': {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
  },
  '掲載中': {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
  },
  '一時停止': {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
  },
  '終了': {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
  },
};

export function StatusSelect({ value, onChange, className }: StatusSelectProps) {
  const currentStyle = statusStyles[value] || statusStyles['未掲載'];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as MediaStatus)}
      className={cn(
        'h-9 px-3 rounded-lg border text-sm font-medium cursor-pointer transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        currentStyle.bg,
        currentStyle.text,
        currentStyle.border,
        'focus:ring-indigo-500',
        className
      )}
    >
      {MEDIA_STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}
