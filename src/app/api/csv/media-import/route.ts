import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MEDIA_NAMES, MEDIA_STATUSES, type MediaName, type MediaStatus } from '@/types/database';

interface ImportRow {
  hrId: string;
  media: { mediaName: MediaName; status: MediaStatus }[];
}

// POST /api/csv/media-import - 媒体ステータスをCSVからインポート
export async function POST(request: NextRequest) {
  try {
    const { headers, rows } = await request.json();

    if (!headers || !rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // ヘッダーのインデックスを取得
    const hrIdIndex = headers.findIndex(
      (h: string) => h === 'HR ID' || h === 'hrId' || h === 'HRID'
    );

    if (hrIdIndex === -1) {
      return NextResponse.json(
        { error: 'HR ID column not found', errors: ['HR ID列が見つかりません'] },
        { status: 400 }
      );
    }

    // 媒体名のインデックスをマッピング
    const mediaIndexMap: Map<MediaName, number> = new Map();
    MEDIA_NAMES.forEach((mediaName) => {
      const index = headers.findIndex(
        (h: string) => h === mediaName || h.includes(mediaName)
      );
      if (index !== -1) {
        mediaIndexMap.set(mediaName, index);
      }
    });

    if (mediaIndexMap.size === 0) {
      return NextResponse.json(
        { error: 'No media columns found', errors: ['媒体名の列が見つかりません。ヘッダーに媒体名を含めてください。'] },
        { status: 400 }
      );
    }

    // データをパース
    const importRows: ImportRow[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // ヘッダー行 + 0-indexed

      const hrId = row[hrIdIndex]?.trim();
      if (!hrId) {
        errors.push(`行${rowNum}: HR IDが空です`);
        continue;
      }

      const media: { mediaName: MediaName; status: MediaStatus }[] = [];
      
      mediaIndexMap.forEach((index, mediaName) => {
        const statusValue = row[index]?.trim();
        if (statusValue) {
          // ステータスが有効な値かチェック
          if (MEDIA_STATUSES.includes(statusValue as MediaStatus)) {
            media.push({ mediaName, status: statusValue as MediaStatus });
          } else {
            errors.push(`行${rowNum}: ${mediaName}のステータス「${statusValue}」は無効です`);
          }
        }
      });

      if (media.length > 0) {
        importRows.push({ hrId, media });
      }
    }

    // データベースに反映
    let updated = 0;
    let skipped = 0;

    for (const importRow of importRows) {
      // HR IDからプロジェクトを検索
      const project = await prisma.project.findUnique({
        where: { hrId: importRow.hrId },
      });

      if (!project) {
        errors.push(`HR ID「${importRow.hrId}」に対応する案件が見つかりません`);
        skipped++;
        continue;
      }

      // 媒体ステータスを更新
      for (const mediaData of importRow.media) {
        await prisma.mediaManagement.upsert({
          where: {
            projectId_mediaName: {
              projectId: project.id,
              mediaName: mediaData.mediaName,
            },
          },
          update: {
            status: mediaData.status,
            updatedAt: new Date(),
          },
          create: {
            id: crypto.randomUUID(),
            projectId: project.id,
            mediaName: mediaData.mediaName,
            status: mediaData.status,
            updatedAt: new Date(),
          },
        });
      }

      updated++;
    }

    return NextResponse.json({
      success: updated,
      updated,
      skipped,
      errors,
      mediaColumnsFound: Array.from(mediaIndexMap.keys()),
    });
  } catch (error) {
    console.error('Media import error:', error);
    return NextResponse.json(
      { error: 'Failed to import media status', errors: ['インポート処理中にエラーが発生しました'] },
      { status: 500 }
    );
  }
}
