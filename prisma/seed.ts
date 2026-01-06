import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 媒体名リスト
const MEDIA_NAMES = [
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

// 担当者リスト
const ASSIGNEES = [
  { id: 'assignee-001', name: '小山', order: 1 },
  { id: 'assignee-002', name: '木村', order: 2 },
  { id: 'assignee-003', name: '山根', order: 3 },
  { id: 'assignee-004', name: '土田', order: 4 },
  { id: 'assignee-005', name: '新山', order: 5 },
  { id: 'assignee-006', name: '片浦', order: 6 },
  { id: 'assignee-007', name: '平田', order: 7 },
  { id: 'assignee-008', name: '荒川', order: 8 },
  { id: 'assignee-009', name: '菊池', order: 9 },
  { id: 'assignee-010', name: '古橋', order: 10 },
  { id: 'assignee-011', name: '橋本', order: 11 },
  { id: 'assignee-012', name: '市倉', order: 12 },
  { id: 'assignee-013', name: '大木', order: 13 },
  { id: 'assignee-014', name: '町田', order: 14 },
  { id: 'assignee-015', name: '円子', order: 15 },
  { id: 'assignee-016', name: '佐久間', order: 16 },
  { id: 'assignee-017', name: '三森', order: 17 },
  { id: 'assignee-018', name: '千田', order: 18 },
  { id: 'assignee-019', name: '飯塚', order: 19 },
  { id: 'assignee-020', name: '佐藤', order: 20 },
  { id: 'assignee-021', name: '冨岡', order: 21 },
  { id: 'assignee-022', name: '後藤', order: 22 },
  { id: 'assignee-023', name: '千葉', order: 23 },
  { id: 'assignee-024', name: '柴田', order: 24 },
  { id: 'assignee-025', name: '山本', order: 25 },
  { id: 'assignee-026', name: '杉本', order: 26 },
  { id: 'assignee-027', name: '安野', order: 27 },
];

// サンプルプロジェクトデータ
const SAMPLE_PROJECTS = [
  {
    hrId: 'T0009-03',
    segment: '新規',
    category: '就労',
    clientName: '合同会社tanaka company',
    clientNameKana: 'タナカカンパニー',
    clientId: 'CL-0009',
    applicationId: 'AP-2025-001',
    prefecture: '島根県',
    city: '出雲市',
    facilityName: 'タナカワークス出雲',
    position: 'サビ管',
    employmentType: '正社員',
    targetHiringCount: 1,
    currentHiringCount: 0,
    status: '採用活動中',
    assignee: '古橋',
    department: '推進部',
    handoverDate: new Date('2025-10-07'),
    deadlineDate: new Date('2025-12-25'),
    openingDate: '未定',
    hurdles: '',
    notes: '事業拡大のため追加募集',
    nextAction: '12/12本面接予定→合否決める',
    media: [
      { mediaName: 'ジョブメドレー', status: '募集中' },
      { mediaName: 'ウェルミージョブ', status: '未掲載' },
      { mediaName: 'ハローワーク', status: '準備中' },
    ],
  },
  {
    hrId: 'T0007-01',
    segment: '既存',
    category: '就労',
    clientName: '株式会社OHANA',
    clientNameKana: 'オハナ',
    clientId: 'C000323',
    applicationId: 'G46-1',
    prefecture: '茨城県',
    city: '牛久市',
    facilityName: '就労継続支援A型事業所　健康弁当ohana',
    position: 'サビ管',
    employmentType: '正社員',
    targetHiringCount: 2,
    currentHiringCount: 1,
    status: '採用活動中',
    assignee: '菊池',
    department: '運営部',
    handoverDate: new Date('2023-08-25'),
    deadlineDate: new Date('2026-01-31'),
    openingDate: null,
    hurdles: 'サビ管は少し前にうつ病になって退職',
    notes: '採用活動中',
    nextAction: 'JM候補者見学',
    media: [
      { mediaName: 'ジョブメドレー', status: '募集中' },
      { mediaName: 'ハローワーク', status: '募集中' },
    ],
  },
  {
    hrId: 'T0010-02',
    segment: '既存',
    category: 'GH',
    clientName: '株式会社颯爽',
    clientNameKana: 'ソウソウ',
    clientId: '',
    applicationId: 'G44-1',
    prefecture: '愛知県',
    city: '刈谷市',
    facilityName: 'WITH YOUR SMILE',
    position: 'サビ管',
    employmentType: 'パート',
    targetHiringCount: 1,
    currentHiringCount: 0,
    status: '採用活動中',
    assignee: '荒川',
    department: '運営部',
    handoverDate: new Date('2024-02-02'),
    deadlineDate: new Date('2026-02-28'),
    openingDate: '2024-08-01',
    hurdles: '自社サビ管しかいないため募集',
    notes: 'KJ：クライアントで出している？',
    nextAction: '',
    media: [
      { mediaName: 'ジョブメドレー', status: '準備中' },
    ],
  },
  {
    hrId: 'T0134-10',
    segment: '新規',
    category: '看護',
    clientName: '合同会社GEN',
    clientNameKana: 'ゲン',
    clientId: '',
    applicationId: '',
    prefecture: '長野県',
    city: '御代田町',
    facilityName: '元気ステーション',
    position: '看・管理者',
    employmentType: '正社員',
    targetHiringCount: 1,
    currentHiringCount: 0,
    status: '採用活動中',
    assignee: '荒川',
    department: '推進部',
    handoverDate: new Date('2025-10-29'),
    deadlineDate: new Date('2025-11-30'),
    openingDate: '2026-01-01',
    hurdles: '看護師のみ記事を書き換えているため注意',
    notes: '',
    nextAction: '2025/12/28以降に停止',
    media: [],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // 担当者を作成
  console.log('Creating assignees...');
  for (const assignee of ASSIGNEES) {
    await prisma.assignee.upsert({
      where: { name: assignee.name },
      update: {},
      create: assignee,
    });
  }
  console.log(`✅ Created ${ASSIGNEES.length} assignees`);

  // プロジェクトを作成
  console.log('Creating projects...');
  for (const projectData of SAMPLE_PROJECTS) {
    const { media, ...project } = projectData;
    const projectId = crypto.randomUUID();
    const now = new Date();
    
    const createdProject = await prisma.project.upsert({
      where: { hrId: project.hrId },
      update: project,
      create: {
        ...project,
        id: projectId,
        lastUpdated: now,
      },
    });

    // メディアを作成
    if (media && media.length > 0) {
      for (const m of media) {
        await prisma.mediaManagement.upsert({
          where: {
            projectId_mediaName: {
              projectId: createdProject.id,
              mediaName: m.mediaName,
            },
          },
          update: { status: m.status },
          create: {
            id: crypto.randomUUID(),
            projectId: createdProject.id,
            mediaName: m.mediaName,
            status: m.status,
            updatedAt: now,
          },
        });
      }
    }
  }
  console.log(`✅ Created ${SAMPLE_PROJECTS.length} projects`);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

