'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hourglass, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryColor, getSegmentColor } from '@/lib/category-utils';
import { formatElapsedDays, calculateDateInfo } from '@/lib/date-utils';
import type { Project } from '@/types/database';
import Link from 'next/link';

interface SlowProjectsProps {
  projects: Project[];
}

export function SlowProjects({ projects }: SlowProjectsProps) {
  return (
    <Card className="border-0 card-shadow opacity-0 animate-fade-in stagger-5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
            <Hourglass className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">
              長期対応中の案件
            </CardTitle>
            <p className="text-xs text-gray-500">引継から30日以上経過</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {projects.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">長期対応中の案件はありません</p>
          </div>
        ) : (
          projects.map((project, index) => {
            const dateInfo = calculateDateInfo(project.handoverDate, project.deadlineDate);
            
            return (
              <Link
                key={project.id}
                href={`/projects/?id=${project.id}`}
                className={cn(
                  'group flex items-center gap-4 rounded-xl p-3 transition-all duration-200 hover:bg-gray-50',
                  'opacity-0 animate-slide-in',
                  `stagger-${index + 1}`
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', getSegmentColor(project.segment))}>
                      {project.segment}
                    </Badge>
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', getCategoryColor(project.category))}>
                      {project.category}
                    </Badge>
                    <span className="text-xs text-gray-400">{project.hrId}</span>
                  </div>
                  <p className="truncate text-sm font-medium text-gray-900">
                    {project.clientName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {project.position} · {project.assignee}担当
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {dateInfo.isSlow && (
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0">
                          Slow
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-600 mt-0.5">
                      {formatElapsedDays(dateInfo.elapsedDays)}
                    </p>
                    <p className="text-[10px] text-gray-400">経過</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-500" />
                </div>
              </Link>
            );
          })
        )}
        
        {projects.length > 0 && (
          <Link 
            href="/projects/?sort=elapsed"
            className="block text-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors pt-2"
          >
            すべて表示 →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

