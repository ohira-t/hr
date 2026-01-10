'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { MediaTable } from '@/components/media/media-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, ExternalLink, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryColor, getSegmentColor } from '@/lib/category-utils';
import type { MediaManagement, Segment, Category } from '@/types/database';

interface ProjectListItem {
  id: string;
  hrId: string;
  clientName: string;
  segment: Segment;
  category: Category;
  prefecture: string;
  status: string;
}

interface ProjectDetail {
  id: string;
  hrId: string;
  clientName: string;
  segment: Segment;
  category: Category;
  prefecture: string;
  status: string;
  media: MediaManagement[];
}

function MediaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get('project');

  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // プロジェクト一覧を取得
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects?lite=true', {
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        // アクティブなプロジェクトのみフィルタリング
        const activeProjects = data.filter(
          (p: ProjectListItem) => !['対応完了', '解約', '不要'].includes(p.status)
        );
        setProjects(activeProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    }
    fetchProjects();
  }, []);

  // URLパラメータから選択プロジェクトを復元
  useEffect(() => {
    if (projectIdFromUrl && projects.length > 0 && !selectedProject) {
      handleSelectProject(projectIdFromUrl);
    }
  }, [projectIdFromUrl, projects]);

  // プロジェクト詳細を取得
  const handleSelectProject = async (projectId: string) => {
    setIsLoadingDetail(true);
    setIsDropdownOpen(false);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      setSelectedProject(data);
      // URLを更新
      router.push(`/media?project=${projectId}`, { scroll: false });
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // 検索フィルター
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.hrId.toLowerCase().includes(query) ||
        p.clientName.toLowerCase().includes(query) ||
        p.prefecture.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  // 保存後に詳細を再取得
  const handleSave = async () => {
    if (selectedProject) {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedProject(data);
      }
    }
  };

  return (
    <>
      <Header
        title="採用媒体管理"
        subtitle="案件ごとの掲載媒体ステータスを管理"
        showSearch={false}
      />

      <div className="p-8 space-y-6">
        {/* 案件選択 */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            案件を選択
          </label>

          {isLoadingProjects ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              案件を読み込み中...
            </div>
          ) : (
            <div className="relative">
              {/* 選択ボタン */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all',
                  'text-left bg-white hover:bg-gray-50',
                  isDropdownOpen
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-gray-200'
                )}
              >
                {selectedProject ? (
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-mono text-sm text-gray-500">
                      {selectedProject.hrId}
                    </span>
                    <span className="font-medium text-gray-900 truncate">
                      {selectedProject.clientName}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn('text-xs shrink-0', getSegmentColor(selectedProject.segment))}
                    >
                      {selectedProject.segment}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn('text-xs shrink-0', getCategoryColor(selectedProject.category))}
                    >
                      {selectedProject.category}
                    </Badge>
                    <span className="text-sm text-gray-500 shrink-0">
                      {selectedProject.prefecture}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">案件を選択してください</span>
                )}
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-gray-400 transition-transform shrink-0',
                    isDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* ドロップダウン */}
              {isDropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                  {/* 検索 */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="HR ID、クライアント名、エリアで検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* 案件リスト */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredProjects.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
                        該当する案件がありません
                      </div>
                    ) : (
                      filteredProjects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleSelectProject(project.id)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-indigo-50',
                            selectedProject?.id === project.id && 'bg-indigo-50'
                          )}
                        >
                          <span className="font-mono text-sm text-gray-500 w-20 shrink-0">
                            {project.hrId}
                          </span>
                          <span className="font-medium text-gray-900 flex-1 truncate">
                            {project.clientName}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn('text-xs shrink-0', getSegmentColor(project.segment))}
                          >
                            {project.segment}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn('text-xs shrink-0', getCategoryColor(project.category))}
                          >
                            {project.category}
                          </Badge>
                          <span className="text-sm text-gray-500 w-16 text-right shrink-0">
                            {project.prefecture}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 案件詳細へのリンク */}
          {selectedProject && (
            <div className="mt-3 flex items-center justify-end">
              <Link
                href={`/projects/${selectedProject.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                案件詳細を開く
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* 媒体テーブル */}
        {isLoadingDetail ? (
          <div className="bg-white rounded-2xl card-shadow p-8">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              読み込み中...
            </div>
          </div>
        ) : selectedProject ? (
          <div className="bg-white rounded-2xl card-shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                掲載媒体ステータス
              </h2>
              <p className="text-sm text-gray-500">
                {selectedProject.media.filter((m) => 
                  ['掲載中', '準備中', '審査・同期中'].includes(m.status)
                ).length}
                媒体がアクティブ
              </p>
            </div>
            <MediaTable
              projectId={selectedProject.id}
              initialMedia={selectedProject.media}
              onSave={handleSave}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl card-shadow p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Search className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                案件を選択してください
              </h3>
              <p className="text-sm text-gray-500">
                上のドロップダウンから案件を選択すると、
                <br />
                掲載媒体のステータスを編集できます
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ドロップダウン背景クリックで閉じる */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  );
}

export default function MediaPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-500">読み込み中...</span>
      </div>
    }>
      <MediaContent />
    </Suspense>
  );
}
