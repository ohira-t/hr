import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[id] - プロジェクト詳細を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        MediaManagement: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // レスポンス形式を整形
    const formattedProject = {
      ...project,
      media: project.MediaManagement,
      MediaManagement: undefined,
    };

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - プロジェクトを更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { media, ...projectData } = body;

    // プロジェクトを更新
    await prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        handoverDate: projectData.handoverDate ? new Date(projectData.handoverDate) : null,
        deadlineDate: projectData.deadlineDate ? new Date(projectData.deadlineDate) : null,
        lastUpdated: new Date(),
      },
    });

    // メディアを更新（存在する場合）
    if (media && Array.isArray(media)) {
      for (const m of media) {
        await prisma.mediaManagement.upsert({
          where: {
            projectId_mediaName: {
              projectId: id,
              mediaName: m.mediaName,
            },
          },
          update: {
            status: m.status,
            startDate: m.startDate ? new Date(m.startDate) : null,
            endDate: m.endDate ? new Date(m.endDate) : null,
            updatedAt: new Date(),
          },
          create: {
            id: crypto.randomUUID(),
            projectId: id,
            mediaName: m.mediaName,
            status: m.status || '未掲載',
            startDate: m.startDate ? new Date(m.startDate) : null,
            endDate: m.endDate ? new Date(m.endDate) : null,
            updatedAt: new Date(),
          },
        });
      }
    }

    // 更新後のプロジェクトを取得
    const updatedProject = await prisma.project.findUnique({
      where: { id },
      include: {
        MediaManagement: true,
      },
    });

    // レスポンス形式を整形
    const formattedProject = updatedProject ? {
      ...updatedProject,
      media: updatedProject.MediaManagement,
      MediaManagement: undefined,
    } : null;

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - プロジェクトを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
