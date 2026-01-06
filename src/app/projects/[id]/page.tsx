import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProjectDetailClient } from './project-detail-client';
import type { Project, MediaManagement, MediaName, Segment, Category, Position, EmploymentType, ProjectStatus, Department, TargetPeriod } from '@/types/database';
import { MEDIA_NAMES } from '@/types/database';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// 静的に生成されていないパラメータでも動的にレンダリング
export const dynamicParams = true;

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  
  const dbProject = await prisma.project.findUnique({
    where: { id },
    include: { MediaManagement: true },
  });

  if (!dbProject) {
    notFound();
  }

  // DBの結果をProject型に変換
  const mediaMap = new Map(dbProject.MediaManagement.map(m => [m.mediaName, m]));
  const allMedia: MediaManagement[] = MEDIA_NAMES.map(mediaName => {
    const existing = mediaMap.get(mediaName);
    return {
      id: existing?.id || `${dbProject.id}-${mediaName}`,
      projectId: dbProject.id,
      mediaName: mediaName as MediaName,
      status: (existing?.status || '未掲載') as MediaManagement['status'],
      startDate: existing?.startDate ? new Date(existing.startDate) : null,
      endDate: existing?.endDate ? new Date(existing.endDate) : null,
      updatedAt: existing ? new Date(existing.updatedAt) : new Date(),
    };
  });

  const project: Project = {
    id: dbProject.id,
    hrId: dbProject.hrId,
    segment: dbProject.segment as Segment,
    category: dbProject.category as Category,
    clientName: dbProject.clientName,
    clientNameKana: dbProject.clientNameKana,
    clientId: dbProject.clientId,
    applicationId: dbProject.applicationId,
    prefecture: dbProject.prefecture,
    city: dbProject.city,
    facilityName: dbProject.facilityName,
    position: dbProject.position as Position,
    employmentType: dbProject.employmentType as EmploymentType,
    targetHiringCount: dbProject.targetHiringCount,
    currentHiringCount: dbProject.currentHiringCount,
    status: dbProject.status as ProjectStatus,
    assignee: dbProject.assignee,
    department: dbProject.department as Department,
    targetPeriod: dbProject.targetPeriod as TargetPeriod | null,
    handoverDate: dbProject.handoverDate,
    deadlineDate: dbProject.deadlineDate,
    openingDate: dbProject.openingDate,
    hurdles: dbProject.hurdles,
    notes: dbProject.notes,
    nextAction: dbProject.nextAction,
    createdAt: dbProject.createdAt,
    lastUpdated: dbProject.lastUpdated,
    media: allMedia,
  };

  return <ProjectDetailClient project={project} />;
}
