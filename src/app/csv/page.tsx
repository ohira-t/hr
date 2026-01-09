'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileDown,
  FileUp,
  RefreshCcw,
  Info,
  Newspaper
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MEDIA_NAMES } from '@/types/database';

// CSVカラム定義（レコードと一致）
const CSV_COLUMNS = [
  { key: 'hrId', label: 'HR ID', required: true },
  { key: 'segment', label: 'セグメント', required: false },
  { key: 'category', label: '業態', required: false },
  { key: 'clientName', label: 'クライアント名', required: false },
  { key: 'clientNameKana', label: '補足', required: false },
  { key: 'clientId', label: 'クライアントID', required: false },
  { key: 'applicationId', label: '申請ID', required: false },
  { key: 'prefecture', label: '都道府県', required: false },
  { key: 'city', label: '市区町村', required: false },
  { key: 'facilityName', label: '事業所名', required: false },
  { key: 'position', label: '募集職種', required: false },
  { key: 'employmentType', label: '勤務形態', required: false },
  { key: 'targetHiringCount', label: '採用目標数', required: false },
  { key: 'currentHiringCount', label: '現在採用数', required: false },
  { key: 'status', label: 'ステータス', required: false },
  { key: 'assignee', label: '担当者', required: false },
  { key: 'department', label: '管轄部署', required: false },
  { key: 'openingDate', label: '開業日', required: false },
  { key: 'handoverDate', label: '引継日', required: false },
  { key: 'deadlineDate', label: '期限', required: false },
  { key: 'hurdles', label: 'ハードル・アラーム', required: false },
  { key: 'notes', label: '備考・状況', required: false },
  { key: 'nextAction', label: '次アクション', required: false },
];

interface ImportResult {
  success: number;
  updated: number;
  created: number;
  errors: { row: number; message: string }[];
}

interface MediaImportResult {
  success: number;
  updated: number;
  skipped: number;
  errors: string[];
  mediaColumnsFound?: string[];
}

interface ApiProject {
  id: string;
  hrId: string;
  segment: string;
  category: string;
  clientName: string;
  clientNameKana: string;
  clientId: string;
  applicationId: string;
  prefecture: string;
  city: string;
  facilityName: string;
  position: string;
  employmentType: string;
  targetHiringCount: number;
  currentHiringCount: number;
  status: string;
  assignee: string;
  department: string;
  handoverDate: string | null;
  deadlineDate: string | null;
  openingDate: string | null;
  hurdles: string;
  notes: string;
  nextAction: string;
}

export default function CSVPage() {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [mediaImportResult, setMediaImportResult] = useState<MediaImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMediaProcessing, setIsMediaProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mediaDragActive, setMediaDragActive] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  // プロジェクト数を取得
  useEffect(() => {
    async function fetchCount() {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          setProjectCount(data.length);
        }
      } catch (error) {
        console.error('Failed to fetch project count:', error);
      }
    }
    fetchCount();
  }, [importResult]); // インポート後に再取得

  // CSVエスケープ処理
  const escapeCSV = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // 日付フォーマット
  const formatDateForCSV = (date: Date | null | undefined): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // 雛形CSVダウンロード
  const handleDownloadTemplate = () => {
    const headers = CSV_COLUMNS.map(col => col.label).join(',');
    const sampleRow = [
      'T0000-00', // HR ID
      '新規', // セグメント
      '就労', // 業態
      '株式会社サンプル', // クライアント名
      '補足情報など', // 補足
      'CL-0000', // クライアントID
      'AP-2025-000', // 申請ID
      '東京都', // 都道府県
      '渋谷区', // 市区町村
      'サンプル事業所', // 事業所名
      'サビ管', // 募集職種
      '正社員', // 勤務形態
      '1', // 採用目標数
      '0', // 現在採用数
      '採用活動中', // ステータス
      '', // 担当者
      '', // 管轄部署
      '', // 開業日
      '', // 引継日
      '', // 期限
      '', // ハードル・アラーム
      '', // 備考・状況
      '', // 次アクション
    ].map(v => escapeCSV(v)).join(',');

    const bom = '\uFEFF';
    const csv = bom + headers + '\n' + sampleRow;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `採用案件_インポート雛形_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // データエクスポート
  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const projects: ApiProject[] = await response.json();

      const headers = CSV_COLUMNS.map(col => col.label).join(',');
      const rows = projects.map(project => {
        return [
          project.hrId,
          project.segment,
          project.category,
          project.clientName,
          project.clientNameKana,
          project.clientId,
          project.applicationId,
          project.prefecture,
          project.city,
          project.facilityName,
          project.position,
          project.employmentType,
          project.targetHiringCount,
          project.currentHiringCount,
          project.status,
          project.assignee,
          project.department,
          project.openingDate || '',
          project.handoverDate ? project.handoverDate.split('T')[0] : '',
          project.deadlineDate ? project.deadlineDate.split('T')[0] : '',
          project.hurdles,
          project.notes,
          project.nextAction,
        ].map(v => escapeCSV(v)).join(',');
      }).join('\n');

      const bom = '\uFEFF';
      const csv = bom + headers + '\n' + rows;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `採用案件_エクスポート_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('エクスポートに失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // CSVパース
  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          currentCell += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          currentCell += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          currentRow.push(currentCell.trim());
          currentCell = '';
        } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
          currentRow.push(currentCell.trim());
          if (currentRow.some(cell => cell !== '')) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentCell = '';
          if (char === '\r') i++;
        } else if (char !== '\r') {
          currentCell += char;
        }
      }
    }

    if (currentCell !== '' || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell !== '')) {
        rows.push(currentRow);
      }
    }

    return rows;
  };

  // インポート処理
  const handleImport = async (file: File) => {
    setIsProcessing(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length < 2) {
        setImportResult({
          success: 0,
          updated: 0,
          created: 0,
          errors: [{ row: 0, message: 'CSVファイルにデータがありません' }],
        });
        return;
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);

      // APIにリクエスト
      const response = await fetch('/api/csv/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headers,
          rows: dataRows,
        }),
      });

      if (!response.ok) {
        throw new Error('Import API failed');
      }

      const result = await response.json();
      setImportResult({
        success: result.success,
        updated: result.updated,
        created: result.created,
        // APIから返されるエラーメッセージをそのまま使用（行番号は既に含まれている）
        errors: result.errors?.map((e: string, i: number) => ({ row: i, message: e })) || [],
      });
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: 0,
        updated: 0,
        created: 0,
        errors: [{ row: 0, message: 'ファイルの読み込みに失敗しました' }],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 媒体ステータス雛形ダウンロード（縦持ち形式）
  const handleDownloadMediaTemplate = () => {
    const headers = ['HR ID', '媒体名', 'ステータス', '開始日', '終了日'].join(',');
    const sampleRows = [
      ['T0001-01', 'ジョブメドレー', '募集中', '2025-01-01', ''],
      ['T0001-01', 'ハローワーク', '準備中', '', ''],
      ['T0001-02', 'ジョブメドレー', '未掲載', '', ''],
    ].map(row => row.map(v => escapeCSV(v)).join(',')).join('\n');

    const bom = '\uFEFF';
    const csv = bom + headers + '\n' + sampleRows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `媒体ステータス_インポート雛形_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 媒体ステータスエクスポート（縦持ち形式：開始日・終了日含む）
  const handleMediaExport = async () => {
    setIsMediaProcessing(true);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const projects = await response.json();

      const headers = ['HR ID', '媒体名', 'ステータス', '開始日', '終了日'].join(',');
      const rows: string[] = [];

      projects.forEach((project: ApiProject & { 
        media?: { 
          mediaName: string; 
          status: string; 
          startDate?: string | null; 
          endDate?: string | null;
        }[] 
      }) => {
        // 各媒体について1行ずつ出力
        MEDIA_NAMES.forEach(mediaName => {
          const media = project.media?.find(m => m.mediaName === mediaName);
          const status = media?.status || '未掲載';
          const startDate = media?.startDate ? media.startDate.split('T')[0] : '';
          const endDate = media?.endDate ? media.endDate.split('T')[0] : '';
          
          rows.push([
            project.hrId,
            mediaName,
            status,
            startDate,
            endDate,
          ].map(v => escapeCSV(v)).join(','));
        });
      });

      const bom = '\uFEFF';
      const csv = bom + headers + '\n' + rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `媒体ステータス_エクスポート_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Media export error:', error);
      alert('エクスポートに失敗しました');
    } finally {
      setIsMediaProcessing(false);
    }
  };

  // 媒体ステータスインポート処理
  const handleMediaImport = async (file: File) => {
    setIsMediaProcessing(true);
    setMediaImportResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length < 2) {
        setMediaImportResult({
          success: 0,
          updated: 0,
          skipped: 0,
          errors: ['CSVファイルにデータがありません'],
        });
        return;
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);

      // APIにリクエスト
      const response = await fetch('/api/csv/media-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headers,
          rows: dataRows,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        setMediaImportResult({
          success: 0,
          updated: 0,
          skipped: 0,
          errors: result.errors || ['インポート処理に失敗しました'],
        });
        return;
      }

      setMediaImportResult({
        success: result.success,
        updated: result.updated,
        skipped: result.skipped,
        errors: result.errors || [],
        mediaColumnsFound: result.mediaColumnsFound,
      });
    } catch (error) {
      console.error('Media import error:', error);
      setMediaImportResult({
        success: 0,
        updated: 0,
        skipped: 0,
        errors: ['ファイルの読み込みに失敗しました'],
      });
    } finally {
      setIsMediaProcessing(false);
    }
  };

  // 媒体ドラッグ&ドロップハンドラー
  const handleMediaDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setMediaDragActive(true);
    } else if (e.type === 'dragleave') {
      setMediaDragActive(false);
    }
  };

  const handleMediaDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMediaDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        handleMediaImport(file);
      }
    }
  };

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleMediaImport(e.target.files[0]);
    }
  };

  // ドラッグ&ドロップハンドラー
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        handleImport(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImport(e.target.files[0]);
    }
  };

  return (
    <>
      <Header 
        title="CSV入出力" 
        subtitle="採用案件データのインポート・エクスポート"
        showSearch={false}
      />
      
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        {/* 概要説明 */}
        <Card className="border-0 card-shadow bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
                <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-2">CSV入出力について</h3>
                <ul className="text-sm text-gray-600 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span><strong>HR ID</strong>を主キーとして、既存データの上書き更新が可能</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>変更したい項目だけ入力すれば、その項目のみ更新（空白セルは無視）</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>UTF-8形式でExcel/Googleスプレッドシートとの互換性あり</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-8">
          {/* インポート */}
          <Card className="border-0 card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-base font-semibold">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <FileUp className="h-5 w-5 text-emerald-600" />
                </div>
                インポート
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ドロップエリア */}
              <div
                className={cn(
                  'relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200',
                  dragActive
                    ? 'border-indigo-400 bg-indigo-50/50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className={cn(
                  'mx-auto h-10 w-10 mb-4 transition-colors',
                  dragActive ? 'text-indigo-500' : 'text-gray-400'
                )} />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  CSVファイルをドラッグ＆ドロップ
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  または
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="rounded-full"
                >
                  ファイルを選択
                </Button>
              </div>

              {/* 雛形ダウンロード */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <Info className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">インポート用の雛形をダウンロード</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                >
                  <Download className="h-4 w-4" />
                  雛形
                </Button>
              </div>

              {/* 処理結果 */}
              {isProcessing && (
                <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-indigo-50">
                  <RefreshCcw className="h-5 w-5 text-indigo-600 animate-spin" />
                  <span className="text-sm font-medium text-indigo-700">処理中...</span>
                </div>
              )}

              {importResult && (
                <div className={cn(
                  'p-4 rounded-xl',
                  importResult.errors.length > 0 && importResult.success === 0
                    ? 'bg-red-50'
                    : importResult.errors.length > 0
                    ? 'bg-amber-50'
                    : 'bg-emerald-50'
                )}>
                  <div className="flex items-center gap-3 mb-3">
                    {importResult.errors.length > 0 && importResult.success === 0 ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : importResult.errors.length > 0 ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    )}
                    <span className="text-sm font-semibold text-gray-900">
                      処理完了
                    </span>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <Badge variant="secondary" className="bg-white">
                      成功: {importResult.success}件
                    </Badge>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      更新: {importResult.updated}件
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      新規: {importResult.created}件
                    </Badge>
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-red-600 mb-2">
                        エラー ({importResult.errors.length}件)
                      </p>
                      <ul className="text-xs text-red-600 space-y-1">
                        {importResult.errors.slice(0, 5).map((error, i) => (
                          <li key={i}>{error.message}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li>...他 {importResult.errors.length - 5}件</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* エクスポート */}
          <Card className="border-0 card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-base font-semibold">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <FileDown className="h-5 w-5 text-blue-600" />
                </div>
                エクスポート
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-center">
                <Download className="mx-auto h-10 w-10 text-blue-500 mb-4" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  全データをCSVでダウンロード
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  {projectCount}件の案件データ
                </p>
                <Button
                  variant="primary"
                  onClick={handleExport}
                  className="rounded-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  エクスポート
                </Button>
              </div>

              {/* エクスポート項目一覧 */}
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs font-medium text-gray-500 mb-3">出力項目</p>
                <div className="flex flex-wrap gap-1.5">
                  {CSV_COLUMNS.map(col => (
                    <Badge key={col.key} variant="secondary" className="text-[10px] bg-white">
                      {col.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 媒体ステータスCSV */}
        <Card className="border-0 card-shadow bg-gradient-to-br from-purple-50/50 to-pink-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
                <Newspaper className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-2">媒体ステータス一括更新</h3>
                <p className="text-sm text-gray-600">
                  HR IDを主キーに、各案件の媒体掲載ステータス・開始日・終了日を一括で更新できます。
                </p>
                <div className="mt-3 p-3 rounded-lg bg-white/50 text-xs text-gray-500">
                  <p className="font-medium text-gray-700 mb-1">CSVフォーマット（縦持ち形式）</p>
                  <code className="block bg-gray-100 p-2 rounded text-[10px] overflow-x-auto">
                    HR ID, 媒体名, ステータス, 開始日, 終了日<br/>
                    T0001-01, ジョブメドレー, 募集中, 2025-01-01,<br/>
                    T0001-01, ハローワーク, 準備中, ,
                  </code>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* 媒体インポート */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">インポート</h4>
                <div
                  className={cn(
                    'relative rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200',
                    mediaDragActive
                      ? 'border-purple-400 bg-purple-50/50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  )}
                  onDragEnter={handleMediaDrag}
                  onDragLeave={handleMediaDrag}
                  onDragOver={handleMediaDrag}
                  onDrop={handleMediaDrop}
                >
                  <input
                    ref={mediaFileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleMediaFileChange}
                    className="hidden"
                  />
                  <Upload className={cn(
                    'mx-auto h-8 w-8 mb-3 transition-colors',
                    mediaDragActive ? 'text-purple-500' : 'text-gray-400'
                  )} />
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    CSVファイルをドロップ
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => mediaFileInputRef.current?.click()}
                    disabled={isMediaProcessing}
                    className="rounded-full"
                  >
                    ファイルを選択
                  </Button>
                </div>

                {/* 雛形ダウンロード */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/60">
                  <span className="text-xs text-gray-600">インポート用雛形</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadMediaTemplate}
                    className="gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-8"
                  >
                    <Download className="h-3.5 w-3.5" />
                    雛形
                  </Button>
                </div>

                {/* 処理結果 */}
                {isMediaProcessing && (
                  <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-purple-50">
                    <RefreshCcw className="h-4 w-4 text-purple-600 animate-spin" />
                    <span className="text-sm font-medium text-purple-700">処理中...</span>
                  </div>
                )}

                {mediaImportResult && (
                  <div className={cn(
                    'p-4 rounded-xl',
                    mediaImportResult.errors.length > 0 && mediaImportResult.success === 0
                      ? 'bg-red-50'
                      : mediaImportResult.errors.length > 0
                      ? 'bg-amber-50'
                      : 'bg-emerald-50'
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      {mediaImportResult.errors.length > 0 && mediaImportResult.success === 0 ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : mediaImportResult.errors.length > 0 ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                      <span className="text-sm font-semibold text-gray-900">処理完了</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <Badge variant="secondary" className="bg-white">
                        更新: {mediaImportResult.updated}件
                      </Badge>
                      {mediaImportResult.skipped > 0 && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                          スキップ: {mediaImportResult.skipped}件
                        </Badge>
                      )}
                    </div>
                    {mediaImportResult.errors.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <ul className="text-xs text-red-600 space-y-0.5">
                          {mediaImportResult.errors.slice(0, 3).map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                          {mediaImportResult.errors.length > 3 && (
                            <li>...他 {mediaImportResult.errors.length - 3}件</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 媒体エクスポート */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">エクスポート</h4>
                <div className="p-6 rounded-2xl bg-white/60 text-center">
                  <Download className="mx-auto h-8 w-8 text-purple-500 mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    媒体ステータスをダウンロード
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    全案件の媒体ステータス
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleMediaExport}
                    disabled={isMediaProcessing}
                    className="rounded-full gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Download className="h-4 w-4" />
                    エクスポート
                  </Button>
                </div>

                {/* 有効なステータス値 */}
                <div className="p-3 rounded-xl bg-white/60">
                  <p className="text-xs font-medium text-gray-500 mb-2">有効なステータス値</p>
                  <div className="flex flex-wrap gap-1">
                    {['未掲載', '準備中', '審査・同期中', '募集中', '一時停止', '終了'].map(status => (
                      <Badge key={status} variant="secondary" className="text-[10px] bg-white">
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 注意事項 */}
        <Card className="border-0 card-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">インポート時の注意事項</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• HR IDは必須項目です。既存のHR IDと一致する場合は上書き更新されます。</li>
                  <li>• 空白のセルは「変更なし」として扱われ、既存の値が保持されます。</li>
                  <li>• 日付は「YYYY-MM-DD」形式で入力してください。</li>
                  <li>• セグメント、業態、ステータス等は定義済みの値のみ有効です。</li>
                  <li>• 媒体ステータスは「未掲載」「準備中」「審査・同期中」「募集中」「一時停止」「終了」のいずれかを指定してください。</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

