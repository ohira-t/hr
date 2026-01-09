'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatusSelect } from './status-select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaName, MediaStatus, MediaManagement } from '@/types/database';
import { MEDIA_NAMES } from '@/types/database';

interface MediaTableProps {
  projectId: string;
  initialMedia: MediaManagement[];
  onSave?: () => void;
}

interface MediaRow {
  mediaName: MediaName;
  status: MediaStatus;
  startDate: string;
  endDate: string;
}

// 媒体の短縮名
const mediaShortNames: Record<MediaName, string> = {
  'ジョブメドレー': 'JM',
  'ウェルミージョブ': 'WM',
  'ハローワーク': 'HW',
  'エントリーポケット': 'EP',
  '人材紹介': '紹介',
  'リファラル': 'Ref',
  'リジョブ': 'RJ',
  'indeed Plus': 'In',
  'engage': 'En',
  'バイトル': 'BT',
  'キャリアジョブズ': 'CJ',
};

// 媒体アイコンの色
const mediaColors: Record<MediaName, string> = {
  'ジョブメドレー': 'bg-blue-500',
  'ウェルミージョブ': 'bg-teal-500',
  'ハローワーク': 'bg-green-500',
  'エントリーポケット': 'bg-orange-500',
  '人材紹介': 'bg-purple-500',
  'リファラル': 'bg-pink-500',
  'リジョブ': 'bg-red-500',
  'indeed Plus': 'bg-indigo-500',
  'engage': 'bg-cyan-500',
  'バイトル': 'bg-yellow-500',
  'キャリアジョブズ': 'bg-lime-500',
};

function formatDateForInput(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function MediaTable({ projectId, initialMedia, onSave }: MediaTableProps) {
  const [mediaRows, setMediaRows] = useState<MediaRow[]>([]);
  const [originalRows, setOriginalRows] = useState<MediaRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 初期データを設定
  useEffect(() => {
    const rows: MediaRow[] = MEDIA_NAMES.map((mediaName) => {
      const existing = initialMedia.find((m) => m.mediaName === mediaName);
      return {
        mediaName,
        status: (existing?.status as MediaStatus) || '未掲載',
        startDate: formatDateForInput(existing?.startDate || null),
        endDate: formatDateForInput(existing?.endDate || null),
      };
    });
    setMediaRows(rows);
    setOriginalRows(JSON.parse(JSON.stringify(rows)));
  }, [initialMedia]);

  // 変更があるかチェック
  const hasChanges = useCallback(() => {
    return JSON.stringify(mediaRows) !== JSON.stringify(originalRows);
  }, [mediaRows, originalRows]);

  // 行を更新
  const updateRow = (index: number, field: keyof MediaRow, value: string) => {
    setMediaRows((prev) => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], [field]: value };
      return newRows;
    });
    setSaveSuccess(false);
  };

  // 保存
  const handleSave = async () => {
    if (!hasChanges()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media: mediaRows.map((row) => ({
            mediaName: row.mediaName,
            status: row.status,
            startDate: row.startDate || null,
            endDate: row.endDate || null,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      setOriginalRows(JSON.parse(JSON.stringify(mediaRows)));
      setSaveSuccess(true);
      onSave?.();

      // 3秒後に成功表示をリセット
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving media:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* テーブル */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                媒体名
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-[160px]">
                ステータス
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-[150px]">
                開始日
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-[150px]">
                終了日
              </th>
            </tr>
          </thead>
          <tbody>
            {mediaRows.map((row, index) => (
              <tr
                key={row.mediaName}
                className={cn(
                  'border-b border-gray-100 transition-colors hover:bg-gray-50/50',
                  index === mediaRows.length - 1 && 'border-b-0'
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white',
                        mediaColors[row.mediaName]
                      )}
                    >
                      {mediaShortNames[row.mediaName]}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {row.mediaName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusSelect
                    value={row.status}
                    onChange={(value) => updateRow(index, 'status', value)}
                    className="w-full"
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="date"
                    value={row.startDate}
                    onChange={(e) => updateRow(index, 'startDate', e.target.value)}
                    className="h-9 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="date"
                    value={row.endDate}
                    onChange={(e) => updateRow(index, 'endDate', e.target.value)}
                    className="h-9 text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 保存ボタン */}
      <div className="flex items-center justify-end gap-3">
        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-sm text-green-600">
            <Check className="h-4 w-4" />
            保存しました
          </div>
        )}
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!hasChanges() || isSaving}
          className="h-10 rounded-full px-6 gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              保存
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
