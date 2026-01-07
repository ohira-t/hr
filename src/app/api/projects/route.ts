import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects - プロジェクト一覧を取得
// ?lite=true で軽量版（メディア情報なし）を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isLite = searchParams.get('lite') === 'true';

    if (isLite) {
      // 軽量版: 一覧表示用（必要なフィールドのみ + アクティブメディア名）
      const projects = await prisma.project.findMany({
        select: {
          id: true,
          hrId: true,
          segment: true,
          category: true,
          clientName: true,
          clientNameKana: true,
          prefecture: true,
          position: true,
          employmentType: true,
          targetHiringCount: true,
          currentHiringCount: true,
          status: true,
          assignee: true,
          department: true,
          targetPeriod: true,
          handoverDate: true,
          deadlineDate: true,
          lastUpdated: true,
          nextAction: true,
          MediaManagement: {
            where: { status: { in: ['募集中', '準備中', '審査・同期中'] } },
            select: { mediaName: true, status: true },
          },
        },
        orderBy: {
          lastUpdated: 'desc',
        },
      });

      // 軽量版レスポンス: MediaManagement -> activeMedia（アクティブメディア名配列）
      const formattedProjects = projects.map(project => ({
        ...project,
        activeMedia: project.MediaManagement.map(m => m.mediaName),
        MediaManagement: undefined,
      }));

      // キャッシュヘッダーを追加（60秒間キャッシュ）
      return NextResponse.json(formattedProjects, {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      });
    }

    // 通常版: 全フィールド + メディア情報
    const projects = await prisma.project.findMany({
      include: {
        MediaManagement: true,
      },
      orderBy: {
        lastUpdated: 'desc',
      },
    });

    // レスポンス形式を整形（MediaManagement -> media）
    const formattedProjects = projects.map(project => ({
      ...project,
      media: project.MediaManagement,
      MediaManagement: undefined,
    }));

    return NextResponse.json(formattedProjects);
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
        MediaManagement: media ? {
          create: media.map((m: { mediaName: string; status: string; startDate?: string; endDate?: string }) => ({
            id: crypto.randomUUID(),
            mediaName: m.mediaName,
            status: m.status || '未掲載',
            startDate: m.startDate ? new Date(m.startDate) : null,
            endDate: m.endDate ? new Date(m.endDate) : null,
            updatedAt: new Date(),
          })),
        } : undefined,
      },
      include: {
        MediaManagement: true,
      },
    });

    // レスポンス形式を整形
    const formattedProject = {
      ...project,
      media: project.MediaManagement,
      MediaManagement: undefined,
    };

    return NextResponse.json(formattedProject, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}


