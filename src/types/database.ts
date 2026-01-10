// ============================================
// 固定マスター（システム組み込み）
// ============================================

// 業態の種類
export type Category = '就労' | 'GH' | '看護' | '兼務' | '要確認';

// セグメント（新規・既存）
export type Segment = '新規' | '既存';

// 案件ステータス
export type ProjectStatus = 
  | '未着手'
  | '手続き中'
  | '採用活動中'
  | '入社待機中'
  | '対応完了'
  | '保留'
  | '停止手続き中'
  | '解約'
  | '不要';

// 管轄部署
export type Department = '推進部' | 'SV部' | 'その他' | '要確認';

// 募集職種
export type Position = 
  | 'サビ管'
  | '管理者'
  | '支援員'
  | 'サ管兼務'
  | '世話人'
  | '夜間支援員'
  | '看護師'
  | '看・管理者'
  | 'その他';

// 勤務形態
export type EmploymentType = '正社員' | 'パート' | '契約職員' | '要確認';

// ターゲット期（KPI管理用）
export type TargetPeriod = 
  | '17期下半期'   // 2026年1月〜2026年6月
  | '18期上半期'   // 2026年7月〜2026年12月
  | '18期下半期'   // 2027年1月〜2027年6月
  | '19期上半期';  // 2027年7月〜2027年12月

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

// 媒体ステータス（設定で変更可能だが、初期値として定義）
export type MediaStatus =
  | '未掲載'
  | '準備中'
  | '審査・同期中'
  | '掲載中'
  | '一時停止'
  | '終了';

// ============================================
// 設定可能なマスターデータ
// ============================================

// 担当者（設定で追加・編集・削除可能）
export interface Assignee {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}

// ============================================
// メインデータ構造
// ============================================

// 媒体管理
export interface MediaManagement {
  id: string;
  projectId: string;
  mediaName: MediaName;
  status: MediaStatus;
  startDate: Date | null;    // 掲載開始日
  endDate: Date | null;      // 掲載停止日
  updatedAt: Date;
}

// プロジェクト（案件）
export interface Project {
  id: string;
  
  // 案件情報
  hrId: string;               // HR管理ID（ユニーク）
  segment: Segment;           // 新規・既存
  category: Category;         // 業態
  
  // クライアント情報
  clientName: string;         // クライアント名
  clientNameKana: string;     // 補足（カナ、状態など）
  clientId: string;           // クライアントID
  applicationId: string;      // 申請ID
  
  // 勤務地
  prefecture: string;         // 都道府県
  city: string;               // 市区町村
  facilityName: string;       // 事業所名
  
  // 募集内容
  position: Position | string;         // 募集職種
  employmentType: EmploymentType;      // 勤務形態
  targetHiringCount: number;  // 目標採用数
  currentHiringCount: number; // 現在採用数
  
  // 社内管理
  status: ProjectStatus;      // ステータス
  assignee: string;           // 担当者
  department: Department;     // 管轄部署
  targetPeriod: TargetPeriod | null;  // ターゲット期
  handoverDate: Date | null;  // 引継日
  deadlineDate: Date | null;  // 期限（採用期日）
  openingDate: string | null; // 開業日（文字列）
  
  // 採用媒体
  media: MediaManagement[];   // 媒体管理
  
  // メモ
  hurdles: string;            // ハードル、アラーム
  notes: string;              // 備考、状況
  nextAction: string;         // 次アクション
  
  // システム
  createdAt: Date;
  lastUpdated: Date;
}

// ============================================
// ダッシュボード・統計
// ============================================

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

// 日付計算ユーティリティ用の型
export interface DateCalculation {
  elapsedDays: number | null;     // 経過日数
  remainingDays: number | null;   // 残り日数
  isOverdue: boolean;             // 期限超過
  isUrgent: boolean;              // 期限間近（14日以内）
  isSlow: boolean;                // 進捗遅延（30日超）
}

// ============================================
// フィルター・ソート
// ============================================

// フィルター・ソートオプション
export interface FilterOptions {
  category: Category | 'all';
  segment: Segment | 'all';
  status: ProjectStatus | 'all';
  assignee: string | 'all';
  sortBy: 'deadline' | 'elapsed' | 'updated' | 'client';
  sortOrder: 'asc' | 'desc';
}

// ============================================
// 設定
// ============================================

// 目標設定
export interface TargetSettings {
  category: Category;
  segment: Segment;
  targetCount: number;
  period: string; // 例: "2025-Q1"
}

// アプリケーション設定
export interface AppSettings {
  assignees: Assignee[];
  // 将来的に追加: カスタムステータス、カスタムフィールドなど
}

// ============================================
// フォーム用
// ============================================

// 案件登録・編集フォーム用の型
export interface ProjectFormData {
  // 案件情報
  hrId: string;
  segment: Segment;
  category: Category;
  
  // クライアント情報
  clientName: string;
  clientNameKana: string;
  clientId: string;
  applicationId: string;
  
  // 勤務地
  prefecture: string;
  city: string;
  facilityName: string;
  
  // 募集内容
  position: Position | string;
  employmentType: EmploymentType;
  targetHiringCount: number;
  currentHiringCount: number;
  
  // 社内管理
  status: ProjectStatus;
  assignee: string;
  department: Department;
  targetPeriod: TargetPeriod | '';  // フォームでは空文字も許容
  handoverDate: string;  // フォームではstring
  deadlineDate: string;
  openingDate: string;
  
  // メモ
  hurdles: string;
  notes: string;
  nextAction: string;
}

// 媒体フォーム用
export interface MediaFormData {
  mediaName: MediaName;
  status: MediaStatus;
  startDate: string;
  endDate: string;
}

// ============================================
// 定数（選択肢リスト）
// ============================================

export const CATEGORIES: Category[] = ['就労', 'GH', '看護', '兼務', '要確認'];
export const SEGMENTS: Segment[] = ['新規', '既存'];
export const PROJECT_STATUSES: ProjectStatus[] = [
  '未着手',
  '手続き中',
  '採用活動中',
  '入社待機中',
  '対応完了',
  '保留',
  '停止手続き中',
  '解約',
  '不要',
];
export const DEPARTMENTS: Department[] = ['推進部', 'SV部', 'その他', '要確認'];
export const TARGET_PERIODS: TargetPeriod[] = ['17期下半期', '18期上半期', '18期下半期', '19期上半期'];

// 現在のターゲット期（ダッシュボード表示用）
export const CURRENT_TARGET_PERIOD: TargetPeriod = '17期下半期';
export const POSITIONS: Position[] = ['サビ管', '管理者', '支援員', 'サ管兼務', '世話人', '夜間支援員', '看護師', '看・管理者', 'その他'];
export const EMPLOYMENT_TYPES: EmploymentType[] = ['正社員', 'パート', '契約職員', '要確認'];
export const MEDIA_NAMES: MediaName[] = [
  'ジョブメドレー',
  'ウェルミージョブ',
  'ハローワーク',
  'エントリーポケット',
  '人材紹介',
  'リファラル',
  'リジョブ',
  'indeed Plus',
  'engage',
  'バイトル',
  'キャリアジョブズ',
];
export const MEDIA_STATUSES: MediaStatus[] = ['未掲載', '準備中', '審査・同期中', '掲載中', '一時停止', '終了'];

// 都道府県リスト
export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
] as const;
