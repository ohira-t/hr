import type { Project, MediaManagement, MediaName, MediaStatus, Category, Segment, ProjectStatus, Department, EmploymentType, TargetPeriod } from '@/types/database';
import { MEDIA_NAMES } from '@/types/database';

// targetPeriodを除いたProject型（内部使用）
type ProjectWithoutTargetPeriod = Omit<Project, 'targetPeriod'>;

// 媒体ステータスのマッピング
function mapMediaStatus(status: string): MediaStatus {
  if (status.includes('掲載中') || status.includes('募集中')) return '募集中';
  if (status.includes('掲載停止') || status.includes('停止') || status.includes('終了')) return '終了';
  if (status.includes('一時停止')) return '一時停止';
  if (status.includes('準備') || status.includes('作成中')) return '準備中';
  if (status.includes('審査') || status.includes('同期')) return '審査・同期中';
  if (status.includes('未掲載') || status.includes('不要') || status === '----') return '未掲載';
  return '未掲載';
}

// モックプロジェクトデータ（内部用）
const _mockProjectsData: ProjectWithoutTargetPeriod[] = [
  // 就労 - 新規
  {
    id: '1',
    hrId: 'T0009-03',
    segment: '新規' as Segment,
    category: '就労' as Category,
    clientName: '合同会社tanaka company',
    clientNameKana: 'タナカカンパニー',
    clientId: 'CL-0009',
    applicationId: 'AP-2025-001',
    prefecture: '島根県',
    city: '出雲市',
    facilityName: 'タナカワークス出雲',
    position: 'サビ管',
    employmentType: '正社員' as EmploymentType,
    targetHiringCount: 1,
    currentHiringCount: 0,
    status: '採用活動中' as ProjectStatus,
    assignee: '古橋',
    department: '推進部' as Department,
    handoverDate: new Date('2025-10-07'),
    deadlineDate: new Date('2025-12-25'),
    openingDate: '未定',
    media: createMediaList('1', ['募集中', '未掲載', '準備中', '未掲載', '準備中', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載']),
    hurdles: '',
    notes: '事業拡大のため追加募集',
    nextAction: '12/12本面接予定→合否決める',
    createdAt: new Date('2025-10-01'),
    lastUpdated: new Date(),
  },
  {
    id: '2',
    hrId: 'T0007-01',
    segment: '既存' as Segment,
    category: '就労' as Category,
    clientName: '株式会社OHANA',
    clientNameKana: 'オハナ',
    clientId: 'CL-0007',
    applicationId: '',
    prefecture: '茨城県',
    city: '牛久市',
    facilityName: 'OHANA就労支援センター',
    position: 'サビ管',
    employmentType: '正社員' as EmploymentType,
    targetHiringCount: 1,
    currentHiringCount: 0,
    status: '採用活動中' as ProjectStatus,
    assignee: '菊池',
    department: 'SV部' as Department,
    handoverDate: new Date('2023-08-25'),
    deadlineDate: new Date('2026-02-28'),
    openingDate: '開業済',
    media: createMediaList('2', ['募集中', '募集中', '未掲載', '募集中', '終了', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載']),
    hurdles: 'GH提案中',
    notes: 'A型のサビ管採用優先',
    nextAction: '支援員募集についてヒアリング',
    createdAt: new Date('2023-08-20'),
    lastUpdated: new Date(),
  },
  {
    id: '3',
    hrId: 'T0006-02',
    segment: '既存' as Segment,
    category: '就労' as Category,
    clientName: 'アプリコットマネジメント株式会社',
    clientNameKana: 'アプリコットマネジメント',
    clientId: 'CL-0006',
    applicationId: '',
    prefecture: '大阪府',
    city: '大阪市平野区',
    facilityName: 'アプリコット平野',
    position: 'サビ管',
    employmentType: 'パート' as EmploymentType,
    targetHiringCount: 1,
    currentHiringCount: 0,
    status: '採用活動中' as ProjectStatus,
    assignee: '市倉',
    department: 'SV部' as Department,
    handoverDate: new Date('2025-09-29'),
    deadlineDate: null,
    openingDate: '開業済',
    media: createMediaList('3', ['募集中', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載']),
    hurdles: 'JMは非積極',
    notes: 'メインはAirワーク',
    nextAction: '手伝い不要、必要に応じて連絡',
    createdAt: new Date('2025-09-25'),
    lastUpdated: new Date(),
  },
  {
    id: '4',
    hrId: 'T0006-03',
    segment: '既存' as Segment,
    category: '就労' as Category,
    clientName: 'アプリコットマネジメント株式会社',
    clientNameKana: 'アプリコットマネジメント',
    clientId: 'CL-0006',
    applicationId: '',
    prefecture: '大阪府',
    city: '大阪市平野区',
    facilityName: 'アプリコット平野',
    position: '支援員',
    employmentType: 'パート' as EmploymentType,
    targetHiringCount: 1,
    currentHiringCount: 0,
    status: '採用活動中' as ProjectStatus,
    assignee: '市倉',
    department: 'SV部' as Department,
    handoverDate: new Date('2025-09-29'),
    deadlineDate: null,
    openingDate: '開業済',
    media: createMediaList('4', ['募集中', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載']),
    hurdles: '',
    notes: '施設外ドーナツパート',
    nextAction: '手伝い不要、必要に応じて連絡',
    createdAt: new Date('2025-09-25'),
    lastUpdated: new Date(),
  },
  // GH - 新規
  {
    id: '5',
    hrId: 'T0050-01',
    segment: '新規' as Segment,
    category: 'GH' as Category,
    clientName: 'ケアサポート合同会社',
    clientNameKana: 'ケアサポート',
    clientId: 'CL-0050',
    applicationId: 'AP-2025-050',
    prefecture: '埼玉県',
    city: 'さいたま市',
    facilityName: 'ケアホームさいたま',
    position: 'サビ管',
    employmentType: '正社員' as EmploymentType,
    targetHiringCount: 2,
    currentHiringCount: 0,
    status: '採用活動中' as ProjectStatus,
    assignee: '山田',
    department: '推進部' as Department,
    handoverDate: new Date('2025-11-15'),
    deadlineDate: new Date('2026-01-15'),
    openingDate: '2026年3月予定',
    media: createMediaList('5', ['募集中', '募集中', '準備中', '未掲載', '準備中', '準備中', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載']),
    hurdles: '',
    notes: '新規GH開設に向けた採用',
    nextAction: '媒体掲載開始',
    createdAt: new Date('2025-11-10'),
    lastUpdated: new Date(),
  },
  {
    id: '6',
    hrId: 'T0051-01',
    segment: '新規' as Segment,
    category: 'GH' as Category,
    clientName: 'ライフケア株式会社',
    clientNameKana: 'ライフケア',
    clientId: 'CL-0051',
    applicationId: 'AP-2025-051',
    prefecture: '東京都',
    city: '足立区',
    facilityName: 'ライフケアホーム足立',
    position: '世話人',
    employmentType: 'パート' as EmploymentType,
    targetHiringCount: 3,
    currentHiringCount: 1,
    status: '採用活動中' as ProjectStatus,
    assignee: '佐藤',
    department: '推進部' as Department,
    handoverDate: new Date('2025-10-20'),
    deadlineDate: new Date('2026-01-05'),
    openingDate: '2026年2月予定',
    media: createMediaList('6', ['募集中', '募集中', '募集中', '募集中', '準備中', '準備中', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載']),
    hurdles: '',
    notes: '世話人3名体制で開設予定',
    nextAction: '候補者面接調整中',
    createdAt: new Date('2025-10-15'),
    lastUpdated: new Date(),
  },
  {
    id: '7',
    hrId: 'T0052-01',
    segment: '既存' as Segment,
    category: 'GH' as Category,
    clientName: 'ハートフルホーム株式会社',
    clientNameKana: 'ハートフルホーム',
    clientId: 'CL-0052',
    applicationId: '',
    prefecture: '神奈川県',
    city: '横浜市',
    facilityName: 'ハートフルホーム横浜',
    position: 'サビ管',
    employmentType: '正社員' as EmploymentType,
    targetHiringCount: 1,
    currentHiringCount: 0,
    status: '採用活動中' as ProjectStatus,
    assignee: '田中',
    department: 'SV部' as Department,
    handoverDate: new Date('2025-09-01'),
    deadlineDate: new Date('2025-12-31'),
    openingDate: '開業済',
    media: createMediaList('7', ['募集中', '募集中', '募集中', '募集中', '準備中', '準備中', '未掲載', '募集中', '未掲載', '未掲載', '未掲載']),
    hurdles: 'サビ管退職予定',
    notes: '後任募集',
    nextAction: '候補者スカウト送付',
    createdAt: new Date('2025-08-25'),
    lastUpdated: new Date(),
  },
  // 看護 - 新規
  {
    id: '8',
    hrId: 'T0080-01',
    segment: '新規' as Segment,
    category: '看護' as Category,
    clientName: '訪問看護ステーションあおぞら',
    clientNameKana: 'アオゾラ',
    clientId: 'CL-0080',
    applicationId: 'AP-2025-080',
    prefecture: '千葉県',
    city: '船橋市',
    facilityName: 'あおぞら訪問看護ステーション船橋',
    position: '看護師',
    employmentType: '正社員' as EmploymentType,
    targetHiringCount: 2,
    currentHiringCount: 0,
    status: '採用活動中' as ProjectStatus,
    assignee: '伊藤',
    department: '推進部' as Department,
    handoverDate: new Date('2025-12-01'),
    deadlineDate: new Date('2026-02-15'),
    openingDate: '2026年4月予定',
    media: createMediaList('8', ['準備中', '準備中', '未掲載', '未掲載', '準備中', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載']),
    hurdles: '',
    notes: '新規訪問看護ステーション開設',
    nextAction: '求人記事作成中',
    createdAt: new Date('2025-11-28'),
    lastUpdated: new Date(),
  },
  {
    id: '9',
    hrId: 'T0081-01',
    segment: '既存' as Segment,
    category: '看護' as Category,
    clientName: 'メディカルケア株式会社',
    clientNameKana: 'メディカルケア',
    clientId: 'CL-0081',
    applicationId: '',
    prefecture: '東京都',
    city: '世田谷区',
    facilityName: 'メディカルケア訪問看護世田谷',
    position: '看護師',
    employmentType: '正社員' as EmploymentType,
    targetHiringCount: 1,
    currentHiringCount: 0,
    status: '採用活動中' as ProjectStatus,
    assignee: '鈴木',
    department: 'SV部' as Department,
    handoverDate: new Date('2025-08-15'),
    deadlineDate: new Date('2026-01-10'),
    openingDate: '開業済',
    media: createMediaList('9', ['募集中', '募集中', '募集中', '募集中', '準備中', '未掲載', '未掲載', '募集中', '未掲載', '未掲載', '未掲載']),
    hurdles: '',
    notes: '増員のための採用',
    nextAction: '面接日程調整中',
    createdAt: new Date('2025-08-10'),
    lastUpdated: new Date(),
  },
  {
    id: '10',
    hrId: 'T0082-01',
    segment: '既存' as Segment,
    category: '看護' as Category,
    clientName: '育み看護ステーション',
    clientNameKana: 'ハグクミ',
    clientId: 'CL-0082',
    applicationId: '',
    prefecture: '大阪府',
    city: '大阪市中央区',
    facilityName: '育み訪問看護ステーション中央',
    position: '看護師',
    employmentType: 'パート' as EmploymentType,
    targetHiringCount: 2,
    currentHiringCount: 1,
    status: '採用活動中' as ProjectStatus,
    assignee: '高橋',
    department: 'SV部' as Department,
    handoverDate: new Date('2025-10-01'),
    deadlineDate: new Date('2026-01-20'),
    openingDate: '開業済',
    media: createMediaList('10', ['募集中', '募集中', '募集中', '未掲載', '準備中', '未掲載', '募集中', '募集中', '未掲載', '未掲載', '未掲載']),
    hurdles: '',
    notes: 'パートタイム准看護師の増員',
    nextAction: '候補者対応中',
    createdAt: new Date('2025-09-28'),
    lastUpdated: new Date(),
  },
  // 対応完了案件
  {
    id: '11',
    hrId: 'T0008-03',
    segment: '既存' as Segment,
    category: '就労' as Category,
    clientName: '株式会社テレーズ',
    clientNameKana: 'テレーズ',
    clientId: 'CL-0008',
    applicationId: '',
    prefecture: '群馬県',
    city: '高崎市',
    facilityName: 'テレーズ就労支援高崎',
    position: 'サビ管',
    employmentType: '正社員' as EmploymentType,
    targetHiringCount: 1,
    currentHiringCount: 1,
    status: '対応完了' as ProjectStatus,
    assignee: '菊池',
    department: 'SV部' as Department,
    handoverDate: new Date('2025-05-20'),
    deadlineDate: new Date('2025-06-24'),
    openingDate: '開業済',
    media: createMediaList('11', ['終了', '終了', '未掲載', '終了', '終了', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載']),
    hurdles: '',
    notes: '櫻井さん入社確認済み',
    nextAction: '完了',
    createdAt: new Date('2025-05-15'),
    lastUpdated: new Date(),
  },
  {
    id: '12',
    hrId: 'T0001-02',
    segment: '既存' as Segment,
    category: '就労' as Category,
    clientName: 'ニューライフ合同会社',
    clientNameKana: 'ニューライフ',
    clientId: 'CL-0001',
    applicationId: '',
    prefecture: '千葉県',
    city: '千葉市稲毛区',
    facilityName: 'ニューライフ就労支援稲毛',
    position: 'サビ管',
    employmentType: '正社員' as EmploymentType,
    targetHiringCount: 1,
    currentHiringCount: 1,
    status: '対応完了' as ProjectStatus,
    assignee: '円子',
    department: 'SV部' as Department,
    handoverDate: new Date('2025-04-10'),
    deadlineDate: null,
    openingDate: '開業済',
    media: createMediaList('12', ['終了', '終了', '準備中', '終了', '終了', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載', '未掲載']),
    hurdles: '',
    notes: '塚本さん7/1入社完了',
    nextAction: '完了',
    createdAt: new Date('2025-04-05'),
    lastUpdated: new Date(),
  },
];

// targetPeriodを追加してエクスポート（採用活動中のものは17期下半期、それ以外はnull）
export const mockProjects: Project[] = _mockProjectsData.map(p => ({
  ...p,
  targetPeriod: (p.status === '採用活動中' ? '17期下半期' : null) as TargetPeriod | null,
}));

function createMediaList(projectId: string, statuses: string[]): MediaManagement[] {
  return MEDIA_NAMES.map((name, index) => ({
    id: `${projectId}-media-${index}`,
    projectId,
    mediaName: name,
    status: mapMediaStatus(statuses[index] || '未掲載'),
    startDate: statuses[index]?.includes('募集中') ? new Date() : null,
    endDate: null,
    updatedAt: new Date(),
  }));
}

// アクティブな案件のみ取得
export function getActiveProjects(): Project[] {
  return mockProjects.filter(p => p.status === '採用活動中');
}

// カテゴリー別に取得
export function getProjectsByCategory(category: Category): Project[] {
  return mockProjects.filter(p => p.category === category);
}

// セグメント別に取得
export function getProjectsBySegment(segment: Segment): Project[] {
  return mockProjects.filter(p => p.segment === segment);
}

// ダッシュボード用の統計を計算
export function calculateStats() {
  const categories: Category[] = ['就労', 'GH', '看護'];
  const segments: Segment[] = ['新規', '既存'];
  
  const stats = [];
  
  for (const category of categories) {
    for (const segment of segments) {
      const projects = mockProjects.filter(
        p => p.category === category && p.segment === segment
      );
      const activeProjects = projects.filter(p => p.status === '採用活動中');
      const targetHirings = projects.reduce((sum, p) => sum + p.targetHiringCount, 0);
      const currentHirings = projects.reduce((sum, p) => sum + p.currentHiringCount, 0);
      
      stats.push({
        category,
        segment,
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        targetHirings,
        currentHirings,
        hiringRate: targetHirings > 0 ? (currentHirings / targetHirings) * 100 : 0,
      });
    }
  }
  
  return stats;
}

// 期限が近い案件を取得
export function getUrgentProjects(limit = 5): Project[] {
  const today = new Date();
  
  return mockProjects
    .filter(p => p.status === '採用活動中' && p.deadlineDate)
    .sort((a, b) => {
      if (!a.deadlineDate || !b.deadlineDate) return 0;
      return a.deadlineDate.getTime() - b.deadlineDate.getTime();
    })
    .filter(p => p.deadlineDate && p.deadlineDate > today)
    .slice(0, limit);
}

// 放置されている案件を取得
export function getSlowProjects(limit = 5): Project[] {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return mockProjects
    .filter(p => p.status === '採用活動中' && p.handoverDate && p.handoverDate < thirtyDaysAgo)
    .sort((a, b) => {
      if (!a.handoverDate || !b.handoverDate) return 0;
      return a.handoverDate.getTime() - b.handoverDate.getTime();
    })
    .slice(0, limit);
}

// IDで案件を取得
export function getProjectById(id: string): Project | undefined {
  return mockProjects.find(p => p.id === id);
}

// HR IDで案件を取得
export function getProjectByHrId(hrId: string): Project | undefined {
  return mockProjects.find(p => p.hrId === hrId);
}

// 案件を追加
export function addProject(project: Project): void {
  mockProjects.push(project);
}

// 案件を更新（既存データに空白以外の値をマージ）
export function updateProject(hrId: string, updates: Partial<Project>): boolean {
  const index = mockProjects.findIndex(p => p.hrId === hrId);
  if (index === -1) return false;
  
  // 空白でない値のみ更新
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      (mockProjects[index] as unknown as Record<string, unknown>)[key] = value;
    }
  });
  mockProjects[index].lastUpdated = new Date();
  return true;
}

// 新規プロジェクトのデフォルト値を作成
export function createDefaultProject(hrId: string): Project {
  return {
    id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    hrId,
    segment: '新規',
    category: '就労',
    clientName: '',
    clientNameKana: '',
    clientId: '',
    applicationId: '',
    prefecture: '',
    city: '',
    facilityName: '',
    position: 'サビ管',
    employmentType: '正社員',
    targetHiringCount: 1,
    currentHiringCount: 0,
    status: '採用活動中',
    assignee: '',
    department: '推進部',
    targetPeriod: '17期下半期',  // 新規作成時は今期をデフォルト設定
    handoverDate: null,
    deadlineDate: null,
    openingDate: null,
    media: createMediaList(`import-${Date.now()}`, Array(MEDIA_NAMES.length).fill('未掲載')),
    hurdles: '',
    notes: '',
    nextAction: '',
    createdAt: new Date(),
    lastUpdated: new Date(),
  };
}
