// 業態の種類
export type Category = '就労' | 'GH' | '看護';

// セグメント（新規・既存）
export type Segment = '新規' | '既存';

// ステータス
export type ProjectStatus = 
  | '採用活動中'
  | '対応完了'
  | '保留'
  | '停止'
  | '未着手';

// 媒体名
export type MediaName =
  | 'ジョブメドレー'
  | 'ウェルミージョブ'
  | 'ハローワーク'
  | 'エントリーポケット'
  | '人材紹介'
  | 'リファラル'
  | 'リジョブ'
  | 'indeed Plus'
  | 'engage'
  | 'バイトル'
  | 'キャリアジョブズ';

// 媒体ステータス
export type MediaStatus =
  | '掲載中'
  | '掲載停止'
  | '未掲載'
  | '不要'
  | '未着手'
  | '保留';

// 媒体管理
export interface MediaManagement {
  id: string;
  projectId: string;
  mediaName: MediaName;
  status: MediaStatus;
  updatedAt: Date;
}

// プロジェクト（案件）
export interface Project {
  id: string;
  hrId: string;               // HR管理ID
  clientName: string;         // クライアント名
  category: Category;         // 業態
  segment: Segment;           // 新規・既存
  status: ProjectStatus;      // ステータス
  position: string;           // 募集職種
  employmentType: string;     // 雇用形態
  prefecture: string;         // 都道府県
  city: string;               // 市区町村
  handoverDate: Date | null;  // 引継日
  deadlineDate: Date | null;  // 採用期日
  openingDate: string | null; // 開業予定日（文字列）
  targetHiringCount: number;  // 目標採用数
  currentHiringCount: number; // 現在採用数
  assignee: string;           // 担当者
  department: string;         // 管轄部署
  notes: string;              // 備考
  nextAction: string;         // 次アクション
  media: MediaManagement[];   // 媒体管理
  lastUpdated: Date;
}

// ダッシュボード用の統計データ
export interface DashboardStats {
  category: Category;
  segment: Segment;
  totalProjects: number;
  activeProjects: number;
  targetHirings: number;
  currentHirings: number;
  hiringRate: number;
}

// CSVからの生データ型
export interface RawCSVData {
  hrId: string;
  clientName: string;
  status: string;
  category: string;
  position: string;
  employmentType: string;
  prefecture: string;
  city: string;
  handoverDate: string;
  deadlineDate: string;
  openingDate: string;
  assignee: string;
  department: string;
  notes: string;
  nextAction: string;
  // 媒体情報
  jobMedley: string;
  wellmyJob: string;
  helloWork: string;
  entryPocket: string;
  jinzaiShokai: string;
  referral: string;
  rejob: string;
  indeedPlus: string;
  engage: string;
  baitoru: string;
  careerJobs: string;
}

// 日付計算ユーティリティ用の型
export interface DateCalculation {
  elapsedDays: number | null;     // 経過日数
  remainingDays: number | null;   // 残り日数
  isOverdue: boolean;             // 期限超過
  isUrgent: boolean;              // 期限間近（14日以内）
  isSlow: boolean;                // 進捗遅延（30日超）
}

// フィルター・ソートオプション
export interface FilterOptions {
  category: Category | 'all';
  segment: Segment | 'all';
  status: ProjectStatus | 'all';
  assignee: string | 'all';
  sortBy: 'deadline' | 'elapsed' | 'updated' | 'client';
  sortOrder: 'asc' | 'desc';
}

// 目標設定
export interface TargetSettings {
  category: Category;
  segment: Segment;
  targetCount: number;
  period: string; // 例: "2025-Q1"
}

