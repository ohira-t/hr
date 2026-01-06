import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// CSV列のマッピング
const CSV_COLUMN_MAP: Record<string, string> = {
  'HR ID': 'hrId',
  'セグメント': 'segment',
  '業態': 'category',
  'クライアント名': 'clientName',
  '補足': 'clientNameKana',
  'クライアントID': 'clientId',
  '申請ID': 'applicationId',
  '都道府県': 'prefecture',
  '市区町村': 'city',
  '事業所名': 'facilityName',
  '募集職種': 'position',
  '勤務形態': 'employmentType',
  '採用目標数': 'targetHiringCount',
  '現在採用数': 'currentHiringCount',
  'ステータス': 'status',
  '担当者': 'assignee',
  '管轄部署': 'department',
  '開業日': 'openingDate',
  '引継日': 'handoverDate',
  '期限': 'deadlineDate',
  'ハードル・アラーム': 'hurdles',
  '備考・状況': 'notes',
  '次アクション': 'nextAction',
};

// POST /api/csv/import - CSVをインポート
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rows, headers } = body;

    if (!rows || !Array.isArray(rows) || !headers || !Array.isArray(headers)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // ヘッダーをマッピング
    const columnMap: Record<number, string> = {};
    headers.forEach((header: string, index: number) => {
      const mappedKey = CSV_COLUMN_MAP[header.trim()];
      if (mappedKey) {
        columnMap[index] = mappedKey;
      }
    });

    // HR IDの列インデックスを取得
    const hrIdIndex = headers.findIndex((h: string) => h.trim() === 'HR ID');
    if (hrIdIndex === -1) {
      return NextResponse.json(
        { error: 'HR ID column is required' },
        { status: 400 }
      );
    }

    const result = {
      success: 0,
      failed: 0,
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    // 各行を処理
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const hrId = row[hrIdIndex]?.trim();

      if (!hrId) {
        result.errors.push(`行${i + 2}: HR IDが空です`);
        result.failed++;
        continue;
      }

      try {
        // 更新データを構築（空白は無視）
        const updateData: Record<string, unknown> = {};

        Object.entries(columnMap).forEach(([indexStr, key]) => {
          const index = parseInt(indexStr);
          const value = row[index];

          if (value !== undefined && value !== null && value.trim() !== '') {
            if (key === 'targetHiringCount' || key === 'currentHiringCount') {
              const parsed = parseInt(value);
              if (!isNaN(parsed)) {
                updateData[key] = parsed;
              }
            } else if (key === 'handoverDate' || key === 'deadlineDate') {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                updateData[key] = date;
              }
            } else {
              updateData[key] = value.trim();
            }
          }
        });

        // 既存プロジェクトを検索
        const existingProject = await prisma.project.findUnique({
          where: { hrId },
        });

        if (existingProject) {
          // 更新
          await prisma.project.update({
            where: { hrId },
            data: updateData,
          });
          result.updated++;
        } else {
          // 新規作成
          await prisma.project.create({
            data: {
              hrId,
              segment: (updateData.segment as string) || '新規',
              category: (updateData.category as string) || '就労',
              clientName: (updateData.clientName as string) || '',
              ...updateData,
            },
          });
          result.created++;
        }

        result.success++;
      } catch (error) {
        console.error(`Row ${i + 2} error:`, error);
        result.errors.push(`行${i + 2}: 処理中にエラーが発生しました`);
        result.failed++;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to import CSV:', error);
    return NextResponse.json(
      { error: 'Failed to import CSV' },
      { status: 500 }
    );
  }
}

