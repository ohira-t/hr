import type { Project, MediaManagement, MediaName, MediaStatus, Category, Segment, ProjectStatus } from '@/types/database';

// 媒体のマッピング
const MEDIA_NAMES: MediaName[] = [
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

// 媒体ステータスのマッピング
function mapMediaStatus(status: string): MediaStatus {
  if (status.includes('掲載中')) return '掲載中';
  if (status.includes('掲載停止') || status.includes('停止')) return '掲載停止';
  if (status.includes('不要') || status === '----') return '不要';
  if (status.includes('未掲載')) return '未掲載';
  if (status.includes('保留')) return '保留';
  return '未着手';
}

// モックプロジェクトデータ
export const mockProjects: Project[] = [
  // 就労 - 新規
  {
    id: '1',
    hrId: 'T0009-03',
    clientName: '合同会社tanaka company',
    category: '就労' as Category,
    segment: '新規' as Segment,
    status: '採用活動中' as ProjectStatus,
    position: 'サビ管',
    employmentType: '正社員',
    prefecture: '島根県',
    city: '出雲市',
    handoverDate: new Date('2025-10-07'),
    deadlineDate: new Date('2025-12-25'),
    openingDate: '未定',
    targetHiringCount: 1,
    currentHiringCount: 0,
    assignee: '古橋',
    department: '運営部',
    notes: '事業拡大のため追加募集',
    nextAction: '12/12本面接予定→合否決める',
    media: createMediaList('1', ['掲載中', '不要', '作成中', '不要', '対象', '不要', '不要', '不要', '不要', '不要', '不要']),
    lastUpdated: new Date(),
  },
  {
    id: '2',
    hrId: 'T0007-01',
    clientName: '株式会社OHANA',
    category: '就労' as Category,
    segment: '既存' as Segment,
    status: '採用活動中' as ProjectStatus,
    position: 'サビ管',
    employmentType: '正社員',
    prefecture: '茨城県',
    city: '牛久市',
    handoverDate: new Date('2023-08-25'),
    deadlineDate: new Date('2026-02-28'),
    openingDate: '開業済',
    targetHiringCount: 1,
    currentHiringCount: 0,
    assignee: '菊池',
    department: '運営部',
    notes: 'GH提案中、A型のサビ管採用優先',
    nextAction: '支援員募集についてヒアリング',
    media: createMediaList('2', ['掲載中', '掲載中', '未掲載', '掲載中', '停止', '不要', '不要', '不要', '不要', '不要', '不要']),
    lastUpdated: new Date(),
  },
  {
    id: '3',
    hrId: 'T0006-02',
    clientName: 'アプリコットマネジメント株式会社',
    category: '就労' as Category,
    segment: '既存' as Segment,
    status: '採用活動中' as ProjectStatus,
    position: 'サビ管',
    employmentType: 'パート',
    prefecture: '大阪府',
    city: '大阪市平野区',
    handoverDate: new Date('2025-09-29'),
    deadlineDate: null,
    openingDate: '開業済',
    targetHiringCount: 1,
    currentHiringCount: 0,
    assignee: '市倉',
    department: '運営部',
    notes: 'JMは非積極、メインはAirワーク',
    nextAction: '手伝い不要、必要に応じて連絡',
    media: createMediaList('3', ['掲載中', '不要', '不要', '不要', '不要', '不要', '不要', '不要', '不要', '不要', '不要']),
    lastUpdated: new Date(),
  },
  {
    id: '4',
    hrId: 'T0006-03',
    clientName: 'アプリコットマネジメント株式会社',
    category: '就労' as Category,
    segment: '既存' as Segment,
    status: '採用活動中' as ProjectStatus,
    position: '支援員',
    employmentType: 'パート',
    prefecture: '大阪府',
    city: '大阪市平野区',
    handoverDate: new Date('2025-09-29'),
    deadlineDate: null,
    openingDate: '開業済',
    targetHiringCount: 1,
    currentHiringCount: 0,
    assignee: '市倉',
    department: '運営部',
    notes: '施設外ドーナツパート',
    nextAction: '手伝い不要、必要に応じて連絡',
    media: createMediaList('4', ['掲載中', '不要', '不要', '不要', '不要', '不要', '不要', '不要', '不要', '不要', '不要']),
    lastUpdated: new Date(),
  },
  // GH - 新規
  {
    id: '5',
    hrId: 'T0050-01',
    clientName: 'ケアサポート合同会社',
    category: 'GH' as Category,
    segment: '新規' as Segment,
    status: '採用活動中' as ProjectStatus,
    position: 'サビ管',
    employmentType: '正社員',
    prefecture: '埼玉県',
    city: 'さいたま市',
    handoverDate: new Date('2025-11-15'),
    deadlineDate: new Date('2026-01-15'),
    openingDate: '2026年3月予定',
    targetHiringCount: 2,
    currentHiringCount: 0,
    assignee: '山田',
    department: '推進部',
    notes: '新規GH開設に向けた採用',
    nextAction: '媒体掲載開始',
    media: createMediaList('5', ['掲載中', '掲載中', '作成中', '未掲載', '対象', '対象', '不要', '不要', '不要', '不要', '不要']),
    lastUpdated: new Date(),
  },
  {
    id: '6',
    hrId: 'T0051-01',
    clientName: 'ライフケア株式会社',
    category: 'GH' as Category,
    segment: '新規' as Segment,
    status: '採用活動中' as ProjectStatus,
    position: '世話人',
    employmentType: 'パート',
    prefecture: '東京都',
    city: '足立区',
    handoverDate: new Date('2025-10-20'),
    deadlineDate: new Date('2026-01-05'),
    openingDate: '2026年2月予定',
    targetHiringCount: 3,
    currentHiringCount: 1,
    assignee: '佐藤',
    department: '推進部',
    notes: '世話人3名体制で開設予定',
    nextAction: '候補者面接調整中',
    media: createMediaList('6', ['掲載中', '掲載中', '掲載中', '掲載中', '対象', '対象', '不要', '不要', '不要', '不要', '不要']),
    lastUpdated: new Date(),
  },
  {
    id: '7',
    hrId: 'T0052-01',
    clientName: 'ハートフルホーム株式会社',
    category: 'GH' as Category,
    segment: '既存' as Segment,
    status: '採用活動中' as ProjectStatus,
    position: 'サビ管',
    employmentType: '正社員',
    prefecture: '神奈川県',
    city: '横浜市',
    handoverDate: new Date('2025-09-01'),
    deadlineDate: new Date('2025-12-31'),
    openingDate: '開業済',
    targetHiringCount: 1,
    currentHiringCount: 0,
    assignee: '田中',
    department: '運営部',
    notes: 'サビ管退職予定のため後任募集',
    nextAction: '候補者スカウト送付',
    media: createMediaList('7', ['掲載中', '掲載中', '掲載中', '掲載中', '対象', '対象', '不要', '掲載中', '不要', '不要', '不要']),
    lastUpdated: new Date(),
  },
  // 看護 - 新規
  {
    id: '8',
    hrId: 'T0080-01',
    clientName: '訪問看護ステーションあおぞら',
    category: '看護' as Category,
    segment: '新規' as Segment,
    status: '採用活動中' as ProjectStatus,
    position: '看護師',
    employmentType: '正社員',
    prefecture: '千葉県',
    city: '船橋市',
    handoverDate: new Date('2025-12-01'),
    deadlineDate: new Date('2026-02-15'),
    openingDate: '2026年4月予定',
    targetHiringCount: 2,
    currentHiringCount: 0,
    assignee: '伊藤',
    department: '推進部',
    notes: '新規訪問看護ステーション開設',
    nextAction: '求人記事作成中',
    media: createMediaList('8', ['作成中', '作成中', '未掲載', '未掲載', '対象', '不要', '不要', '不要', '不要', '不要', '不要']),
    lastUpdated: new Date(),
  },
  {
    id: '9',
    hrId: 'T0081-01',
    clientName: 'メディカルケア株式会社',
    category: '看護' as Category,
    segment: '既存' as Segment,
    status: '採用活動中' as ProjectStatus,
    position: '看護師',
    employmentType: '正社員',
    prefecture: '東京都',
    city: '世田谷区',
    handoverDate: new Date('2025-08-15'),
    deadlineDate: new Date('2026-01-10'),
    openingDate: '開業済',
    targetHiringCount: 1,
    currentHiringCount: 0,
    assignee: '鈴木',
    department: '運営部',
    notes: '増員のための採用',
    nextAction: '面接日程調整中',
    media: createMediaList('9', ['掲載中', '掲載中', '掲載中', '掲載中', '対象', '不要', '不要', '掲載中', '不要', '不要', '不要']),
    lastUpdated: new Date(),
  },
  {
    id: '10',
    hrId: 'T0082-01',
    clientName: '育み看護ステーション',
    category: '看護' as Category,
    segment: '既存' as Segment,
    status: '採用活動中' as ProjectStatus,
    position: '准看護師',
    employmentType: 'パート',
    prefecture: '大阪府',
    city: '大阪市中央区',
    handoverDate: new Date('2025-10-01'),
    deadlineDate: new Date('2026-01-20'),
    openingDate: '開業済',
    targetHiringCount: 2,
    currentHiringCount: 1,
    assignee: '高橋',
    department: '運営部',
    notes: 'パートタイム准看護師の増員',
    nextAction: '候補者対応中',
    media: createMediaList('10', ['掲載中', '掲載中', '掲載中', '不要', '対象', '不要', '掲載中', '掲載中', '不要', '不要', '不要']),
    lastUpdated: new Date(),
  },
  // 対応完了案件
  {
    id: '11',
    hrId: 'T0008-03',
    clientName: '株式会社テレーズ',
    category: '就労' as Category,
    segment: '既存' as Segment,
    status: '対応完了' as ProjectStatus,
    position: 'サビ管',
    employmentType: '正社員',
    prefecture: '群馬県',
    city: '高崎市',
    handoverDate: new Date('2025-05-20'),
    deadlineDate: new Date('2025-06-24'),
    openingDate: '開業済',
    targetHiringCount: 1,
    currentHiringCount: 1,
    assignee: '菊池',
    department: '運営部',
    notes: '櫻井さん入社確認済み',
    nextAction: '完了',
    media: createMediaList('11', ['掲載停止', '停止', '未掲載', '掲載停止', '停止', '不要', '不要', '不要', '不要', '不要', '不要']),
    lastUpdated: new Date(),
  },
  {
    id: '12',
    hrId: 'T0001-02',
    clientName: 'ニューライフ合同会社',
    category: '就労' as Category,
    segment: '既存' as Segment,
    status: '対応完了' as ProjectStatus,
    position: 'サビ管',
    employmentType: '正社員',
    prefecture: '千葉県',
    city: '千葉市稲毛区',
    handoverDate: new Date('2025-04-10'),
    deadlineDate: null,
    openingDate: '開業済',
    targetHiringCount: 1,
    currentHiringCount: 1,
    assignee: '円子',
    department: '運営部',
    notes: '塚本さん7/1入社完了',
    nextAction: '完了',
    media: createMediaList('12', ['掲載停止', '停止', '作成中', '掲載停止', '停止', '不要', '不要', '不要', '不要', '不要', '不要']),
    lastUpdated: new Date(),
  },
];

function createMediaList(projectId: string, statuses: string[]): MediaManagement[] {
  return MEDIA_NAMES.map((name, index) => ({
    id: `${projectId}-media-${index}`,
    projectId,
    mediaName: name,
    status: mapMediaStatus(statuses[index] || '不要'),
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

