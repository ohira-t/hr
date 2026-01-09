import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MEDIA_NAMES, MEDIA_STATUSES, type MediaName, type MediaStatus } from '@/types/database';

interface ImportRowHorizontal {
  hrId: string;
  media: { mediaName: MediaName; status: MediaStatus }[];
}

interface ImportRowVertical {
  hrId: string;
  mediaName: MediaName;
  status: MediaStatus;
  startDate: string | null;
  endDate: string | null;
}

// 日付文字列をパース（YYYY-MM-DD, YYYY/MM/DD, MM/DD/YYYY など）
function parseDate(dateStr: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  
  const trimmed = dateStr.trim();
  
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(trimmed);
  }
  
  // YYYY/MM/DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) {
    return new Date(trimmed.replace(/\//g, '-'));
  }
  
  // MM/DD/YYYY or M/D/YYYY
  const mdyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch;
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  }
  
  // Excelのシリアル値（数値として認識）
  const num = parseFloat(trimmed);
  if (!isNaN(num) && num > 10000 && num < 100000) {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + num * 24 * 60 * 60 * 1000);
  }
  
  return null;
}

// 縦持ち形式かどうかを判定
function isVerticalFormat(headers: string[]): boolean {
  const mediaNameColumns = ['媒体名', '媒体', 'メディア名', 'メディア', 'Media', 'MediaName'];
  return headers.some(h => mediaNameColumns.includes(h));
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

    // HR IDのインデックスを取得
    const hrIdIndex = headers.findIndex(
      (h: string) => h === 'HR ID' || h === 'hrId' || h === 'HRID'
    );

    if (hrIdIndex === -1) {
      return NextResponse.json(
        { error: 'HR ID column not found', errors: ['HR ID列が見つかりません'] },
        { status: 400 }
      );
    }

    // 縦持ち形式か横持ち形式かを判定
    if (isVerticalFormat(headers)) {
      return processVerticalFormat(headers, rows, hrIdIndex);
    } else {
      return processHorizontalFormat(headers, rows, hrIdIndex);
    }
  } catch (error) {
    console.error('Media import error:', error);
    return NextResponse.json(
      { error: 'Failed to import media status', errors: ['インポート処理中にエラーが発生しました'] },
      { status: 500 }
    );
  }
}

// 縦持ち形式を処理
async function processVerticalFormat(headers: string[], rows: string[][], hrIdIndex: number) {
  const mediaNameIndex = headers.findIndex(
    (h: string) => ['媒体名', '媒体', 'メディア名', 'メディア', 'Media', 'MediaName'].includes(h)
  );
  const statusIndex = headers.findIndex(
    (h: string) => ['ステータス', 'status', 'Status', '状態'].includes(h)
  );
  const startDateIndex = headers.findIndex(
    (h: string) => ['開始日', '開始', 'start', 'Start', 'StartDate', '掲載開始日', '掲載開始'].includes(h)
  );
  const endDateIndex = headers.findIndex(
    (h: string) => ['終了日', '終了', 'end', 'End', 'EndDate', '掲載終了日', '掲載終了'].includes(h)
  );

  if (mediaNameIndex === -1) {
    return NextResponse.json(
      { error: 'Media name column not found', errors: ['媒体名列が見つかりません'] },
      { status: 400 }
    );
  }

  if (statusIndex === -1) {
    return NextResponse.json(
      { error: 'Status column not found', errors: ['ステータス列が見つかりません'] },
      { status: 400 }
    );
  }

  const importRows: ImportRowVertical[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const hrId = row[hrIdIndex]?.trim();
    if (!hrId) {
      errors.push(`行${rowNum}: HR IDが空です`);
      continue;
    }

    const mediaNameValue = row[mediaNameIndex]?.trim();
    if (!mediaNameValue) {
      errors.push(`行${rowNum}: 媒体名が空です`);
      continue;
    }

    // 媒体名が有効かチェック
    if (!MEDIA_NAMES.includes(mediaNameValue as MediaName)) {
      errors.push(`行${rowNum}: 媒体名「${mediaNameValue}」は無効です`);
      continue;
    }

    const statusValue = row[statusIndex]?.trim();
    if (!statusValue) {
      errors.push(`行${rowNum}: ステータスが空です`);
      continue;
    }

    // ステータスが有効かチェック
    if (!MEDIA_STATUSES.includes(statusValue as MediaStatus)) {
      errors.push(`行${rowNum}: ステータス「${statusValue}」は無効です`);
      continue;
    }

    const startDate = startDateIndex !== -1 ? row[startDateIndex]?.trim() || null : null;
    const endDate = endDateIndex !== -1 ? row[endDateIndex]?.trim() || null : null;

    importRows.push({
      hrId,
      mediaName: mediaNameValue as MediaName,
      status: statusValue as MediaStatus,
      startDate,
      endDate,
    });
  }

  // データベースに反映
  let updated = 0;
  let skipped = 0;
  const hrIdSet = new Set<string>();

  for (const importRow of importRows) {
    const project = await prisma.project.findUnique({
      where: { hrId: importRow.hrId },
    });

    if (!project) {
      if (!hrIdSet.has(importRow.hrId)) {
        errors.push(`HR ID「${importRow.hrId}」に対応する案件が見つかりません`);
        hrIdSet.add(importRow.hrId);
      }
      skipped++;
      continue;
    }

    const updateData: {
      status: MediaStatus;
      updatedAt: Date;
      startDate?: Date | null;
      endDate?: Date | null;
    } = {
      status: importRow.status,
      updatedAt: new Date(),
    };

    // 開始日・終了日が指定されている場合のみ更新
    if (importRow.startDate !== null) {
      const parsedStart = parseDate(importRow.startDate);
      updateData.startDate = parsedStart;
    }
    if (importRow.endDate !== null) {
      const parsedEnd = parseDate(importRow.endDate);
      updateData.endDate = parsedEnd;
    }

    await prisma.mediaManagement.upsert({
      where: {
        projectId_mediaName: {
          projectId: project.id,
          mediaName: importRow.mediaName,
        },
      },
      update: updateData,
      create: {
        id: crypto.randomUUID(),
        projectId: project.id,
        mediaName: importRow.mediaName,
        status: importRow.status,
        startDate: importRow.startDate ? parseDate(importRow.startDate) : null,
        endDate: importRow.endDate ? parseDate(importRow.endDate) : null,
        updatedAt: new Date(),
      },
    });

    updated++;
  }

  return NextResponse.json({
    success: updated,
    updated,
    skipped,
    errors,
    format: 'vertical',
    columnsFound: ['HR ID', '媒体名', 'ステータス', 
      startDateIndex !== -1 ? '開始日' : null, 
      endDateIndex !== -1 ? '終了日' : null
    ].filter(Boolean),
  });
}

// 横持ち形式を処理（既存のロジック）
async function processHorizontalFormat(headers: string[], rows: string[][], hrIdIndex: number) {
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
  const importRows: ImportRowHorizontal[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const hrId = row[hrIdIndex]?.trim();
    if (!hrId) {
      errors.push(`行${rowNum}: HR IDが空です`);
      continue;
    }

    const media: { mediaName: MediaName; status: MediaStatus }[] = [];
    
    mediaIndexMap.forEach((index, mediaName) => {
      const statusValue = row[index]?.trim();
      if (statusValue) {
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
    const project = await prisma.project.findUnique({
      where: { hrId: importRow.hrId },
    });

    if (!project) {
      errors.push(`HR ID「${importRow.hrId}」に対応する案件が見つかりません`);
      skipped++;
      continue;
    }

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
    format: 'horizontal',
    mediaColumnsFound: Array.from(mediaIndexMap.keys()),
  });
}
