import { differenceInDays, parseISO, isValid, parse } from 'date-fns';
import type { DateCalculation } from '@/types/database';

/**
 * 日付文字列をパースする
 */
export function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString || dateString === '' || dateString === '-' || dateString === '不明') {
    return null;
  }
  
  // YYYY/MM/DD 形式
  const slashFormat = parse(dateString, 'yyyy/MM/dd', new Date());
  if (isValid(slashFormat)) {
    return slashFormat;
  }
  
  // YYYY-MM-DD 形式
  const dashFormat = parse(dateString, 'yyyy-MM-dd', new Date());
  if (isValid(dashFormat)) {
    return dashFormat;
  }
  
  // ISO形式
  try {
    const isoFormat = parseISO(dateString);
    if (isValid(isoFormat)) {
      return isoFormat;
    }
  } catch {
    return null;
  }
  
  return null;
}

/**
 * 日付計算を行う
 */
export function calculateDateInfo(
  handoverDate: Date | null,
  deadlineDate: Date | null
): DateCalculation {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let elapsedDays: number | null = null;
  let remainingDays: number | null = null;
  let isOverdue = false;
  let isUrgent = false;
  let isSlow = false;

  if (handoverDate) {
    elapsedDays = differenceInDays(today, handoverDate);
    isSlow = elapsedDays > 30;
  }

  if (deadlineDate) {
    remainingDays = differenceInDays(deadlineDate, today);
    isOverdue = remainingDays < 0;
    isUrgent = remainingDays >= 0 && remainingDays <= 14;
  }

  return {
    elapsedDays,
    remainingDays,
    isOverdue,
    isUrgent,
    isSlow,
  };
}

/**
 * 経過日数をフォーマットする
 */
export function formatElapsedDays(days: number | null): string {
  if (days === null) return '未設定';
  if (days < 0) return '未開始';
  return `${days}日目`;
}

/**
 * 残り日数をフォーマットする
 */
export function formatRemainingDays(days: number | null): string {
  if (days === null) return '未設定';
  if (days < 0) return `${Math.abs(days)}日超過`;
  if (days === 0) return '本日期限';
  return `残${days}日`;
}

/**
 * 日付を表示用にフォーマットする
 */
export function formatDate(date: Date | null): string {
  if (!date) return '-';
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}


