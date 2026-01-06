import { notFound } from 'next/navigation';
import { getProjectById, mockProjects } from '@/data/mock-projects';
import { ProjectDetailClient } from './project-detail-client';

// 動的レンダリングを強制（インポートされた新規データにも対応）
export const dynamic = 'force-dynamic';

// 静的に生成されていないパラメータでも動的にレンダリング
export const dynamicParams = true;

// 静的エクスポート用のパラメータ生成（output: 'export'時に必要）
export function generateStaticParams() {
  return mockProjects.map((project) => ({
    id: project.id,
  }));
}

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={project} />;
}
