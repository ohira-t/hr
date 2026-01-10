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
function getStatusStyle(status: MediaStatus): { isActive: boolean; style: string } {
  switch (status) {
    case '掲載中':
      return { isActive: true, style: '' };
    case '準備中':
      return { isActive: true, style: 'opacity-70' };
    case '審査・同期中':
      return { isActive: true, style: 'opacity-80' };
    case '一時停止':
      return { isActive: false, style: 'opacity-40' };
    case '終了':
      return { isActive: false, style: 'opacity-30' };
    case '未掲載':
    default:
      return { isActive: false, style: 'opacity-30' };
  }
}

export function MediaMatrix({ media, compact = false }: MediaMatrixProps) {
  return (
    <TooltipProvider>
      <div className={cn(
        'grid gap-1',
        compact ? 'grid-cols-5 w-[140px]' : 'grid-cols-6 gap-1.5'
      )}>
        {media.map((m) => {
          const config = mediaConfig[m.mediaName];
          const statusInfo = getStatusStyle(m.status);
          
          return (
            <Tooltip key={m.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'flex items-center justify-center rounded text-[10px] font-semibold cursor-default transition-all duration-200',
                    compact ? 'h-6 w-6' : 'h-7 min-w-[32px] px-1.5',
                    statusInfo.isActive 
                      ? cn(config.activeColor, 'text-white shadow-sm') 
                      : 'bg-gray-100 text-gray-400',
                    statusInfo.style
                  )}
                >
                  {compact ? config.short.substring(0, 2) : config.short}
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

