import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects - プロジェクト一覧を取得
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        media: true,
      },
      orderBy: {
        lastUpdated: 'desc',
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - プロジェクトを作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { media, ...projectData } = body;

    // プロジェクトを作成
    const project = await prisma.project.create({
      data: {
        ...projectData,
        handoverDate: projectData.handoverDate ? new Date(projectData.handoverDate) : null,
        deadlineDate: projectData.deadlineDate ? new Date(projectData.deadlineDate) : null,
        media: media ? {
          create: media.map((m: { mediaName: string; status: string; startDate?: string; endDate?: string }) => ({
            mediaName: m.mediaName,
            status: m.status || '未掲載',
            startDate: m.startDate ? new Date(m.startDate) : null,
            endDate: m.endDate ? new Date(m.endDate) : null,
          })),
        } : undefined,
      },
      include: {
        media: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

