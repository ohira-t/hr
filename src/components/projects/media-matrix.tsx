'use client';

import { cn } from '@/lib/utils';
import type { MediaManagement, MediaName, MediaStatus } from '@/types/database';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MediaMatrixProps {
  media: MediaManagement[];
  compact?: boolean;
}

// 媒体の短縮名とアイコン色
const mediaConfig: Record<MediaName, { short: string; activeColor: string }> = {
  'ジョブメドレー': { short: 'JM', activeColor: 'bg-blue-500' },
  'ウェルミージョブ': { short: 'WM', activeColor: 'bg-teal-500' },
  'ハローワーク': { short: 'HW', activeColor: 'bg-green-500' },
  'エントリーポケット': { short: 'EP', activeColor: 'bg-orange-500' },
  '人材紹介': { short: '紹介', activeColor: 'bg-purple-500' },
  'リファラル': { short: 'Ref', activeColor: 'bg-pink-500' },
  'リジョブ': { short: 'RJ', activeColor: 'bg-red-500' },
  'indeed Plus': { short: 'In', activeColor: 'bg-indigo-500' },
  'engage': { short: 'En', activeColor: 'bg-cyan-500' },
  'バイトル': { short: 'BT', activeColor: 'bg-yellow-500' },
  'キャリアジョブズ': { short: 'CJ', activeColor: 'bg-lime-500' },
};

// ステータスに応じた表示スタイル
function getStatusStyle(status: MediaStatus): string {
  switch (status) {
    case '掲載中':
      return 'ring-2 ring-offset-1';
    case '掲載停止':
      return 'opacity-30';
    case '未掲載':
      return 'opacity-50 bg-gray-200';
    case '不要':
      return 'opacity-20 bg-gray-100';
    case '保留':
      return 'opacity-60 bg-amber-100';
    default:
      return 'opacity-40 bg-gray-200';
  }
}

export function MediaMatrix({ media, compact = false }: MediaMatrixProps) {
  return (
    <TooltipProvider>
      <div className={cn('flex gap-1', compact ? 'flex-wrap' : 'gap-1.5')}>
        {media.map((m) => {
          const config = mediaConfig[m.mediaName];
          const isActive = m.status === '掲載中';
          
          return (
            <Tooltip key={m.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'flex items-center justify-center rounded text-[10px] font-medium text-white cursor-default transition-all duration-200',
                    compact ? 'h-5 w-5' : 'h-6 min-w-[28px] px-1',
                    isActive ? config.activeColor : 'bg-gray-300',
                    getStatusStyle(m.status)
                  )}
                >
                  {compact ? config.short.charAt(0) : config.short}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-medium">{m.mediaName}</p>
                <p className="text-gray-400">{m.status}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

