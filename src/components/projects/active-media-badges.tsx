'use client';

import { cn } from '@/lib/utils';
import type { MediaName } from '@/types/database';
import { MEDIA_NAMES } from '@/types/database';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ActiveMediaBadgesProps {
  activeMedia: MediaName[];
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

export function ActiveMediaBadges({ activeMedia }: ActiveMediaBadgesProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-5 gap-1 w-[140px]">
        {MEDIA_NAMES.map((mediaName) => {
          const config = mediaConfig[mediaName];
          const isActive = activeMedia.includes(mediaName);
          
          return (
            <Tooltip key={mediaName}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'flex items-center justify-center rounded text-[10px] font-semibold cursor-default transition-all duration-200 h-6 w-6',
                    isActive 
                      ? cn(config.activeColor, 'text-white shadow-sm') 
                      : 'bg-gray-100 text-gray-400 opacity-30'
                  )}
                >
                  {config.short.substring(0, 2)}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-medium">{mediaName}</p>
                <p className="text-gray-400">{isActive ? 'アクティブ' : '未掲載'}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

