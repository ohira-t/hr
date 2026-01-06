import type { Category, Segment } from '@/types/database';

/**
 * 業態文字列をカテゴリーにマッピングする
 */
export function mapCategory(rawCategory: string): Category {
  const normalized = rawCategory.trim();
  
  // 就労系
  if (
    normalized.includes('Ａ型') ||
    normalized.includes('A型') ||
    normalized.includes('Ｂ型') ||
    normalized.includes('B型') ||
    normalized.includes('就労')
  ) {
    return '就労';
  }
  
  // グループホーム系
  if (
    normalized.includes('ＧＨ') ||
    normalized.includes('GH') ||
    normalized.includes('グループホーム')
  ) {
    return 'GH';
  }
  
  // 訪問看護系
  if (
    normalized.includes('看護') ||
    normalized.includes('訪問') ||
    normalized.includes('育み')
  ) {
    return '看護';
  }
  
  // デフォルトは就労
  return '就労';
}

/**
 * セグメント（新規・既存）を判定する
 */
export function determineSegment(
  openingDate: string | null,
  status: string
): Segment {
  // 開業済みの場合は既存
  if (openingDate === '開業済' || openingDate === '開業済み') {
    return '既存';
  }
  
  // ステータスが未着手の場合は新規
  if (status === '未着手') {
    return '新規';
  }
  
  // 開業予定日が未来の日付の場合は新規
  if (openingDate) {
    const match = openingDate.match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
    if (match) {
      const date = new Date(
        parseInt(match[1]),
        parseInt(match[2]) - 1,
        parseInt(match[3])
      );
      if (date > new Date()) {
        return '新規';
      }
    }
  }
  
  // デフォルトは既存
  return '既存';
}

/**
 * カテゴリーの表示色を取得する
 */
export function getCategoryColor(category: Category): string {
  switch (category) {
    case '就労':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'GH':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case '看護':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case '兼務':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case '要確認':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * セグメントの表示色を取得する
 */
export function getSegmentColor(segment: Segment): string {
  switch (segment) {
    case '新規':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case '既存':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * ステータスの表示色を取得する
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case '未着手':
      return 'bg-slate-100 text-slate-600';
    case '手続き中':
      return 'bg-cyan-100 text-cyan-700';
    case '採用活動中':
      return 'bg-green-100 text-green-800';
    case '入社待機中':
      return 'bg-indigo-100 text-indigo-700';
    case '対応完了':
      return 'bg-blue-100 text-blue-800';
    case '保留':
      return 'bg-yellow-100 text-yellow-800';
    case '停止手続き中':
      return 'bg-orange-100 text-orange-700';
    case '解約':
      return 'bg-red-100 text-red-800';
    case '不要':
      return 'bg-gray-200 text-gray-500';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * カテゴリーの日本語名を取得する
 */
export function getCategoryLabel(category: Category): string {
  switch (category) {
    case '就労':
      return '就労継続支援';
    case 'GH':
      return 'グループホーム';
    case '看護':
      return '訪問看護';
    case '兼務':
      return '兼務';
    case '要確認':
      return '要確認';
    default:
      return category;
  }
}

/**
 * 媒体ステータスの表示色を取得する
 */
export function getMediaStatusColor(status: string): string {
  switch (status) {
    case '募集中':
      return 'bg-green-100 text-green-800';
    case '準備中':
      return 'bg-yellow-100 text-yellow-800';
    case '審査・同期中':
      return 'bg-blue-100 text-blue-800';
    case '一時停止':
      return 'bg-orange-100 text-orange-800';
    case '終了':
      return 'bg-gray-100 text-gray-600';
    case '未掲載':
    default:
      return 'bg-gray-50 text-gray-400';
  }
}

