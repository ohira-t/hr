import type { Assignee } from '@/types/database';

// 担当者マスター（初期データ）
export const initialAssignees: Assignee[] = [
  { id: '1', name: '杉本', isActive: true, order: 1 },
  { id: '2', name: '円子', isActive: true, order: 2 },
  { id: '3', name: '橋本', isActive: true, order: 3 },
  { id: '4', name: '山根', isActive: true, order: 4 },
  { id: '5', name: '安野', isActive: true, order: 5 },
  { id: '6', name: '市倉', isActive: true, order: 6 },
  { id: '7', name: '菊池', isActive: true, order: 7 },
  { id: '8', name: '三森', isActive: true, order: 8 },
  { id: '9', name: '古橋', isActive: true, order: 9 },
  { id: '10', name: '小山', isActive: true, order: 10 },
  { id: '11', name: '荒川', isActive: true, order: 11 },
  { id: '12', name: '土田', isActive: true, order: 12 },
  { id: '13', name: '平田', isActive: true, order: 13 },
  { id: '14', name: '大木', isActive: true, order: 14 },
  { id: '15', name: '木村', isActive: true, order: 15 },
  { id: '16', name: '飯塚', isActive: true, order: 16 },
  { id: '17', name: '佐久間', isActive: true, order: 17 },
  { id: '18', name: '佐藤', isActive: true, order: 18 },
  { id: '19', name: '山本', isActive: true, order: 19 },
  { id: '20', name: '新山', isActive: true, order: 20 },
  { id: '21', name: '町田', isActive: true, order: 21 },
  { id: '22', name: '千田', isActive: true, order: 22 },
  { id: '23', name: '柴田', isActive: true, order: 23 },
  { id: '24', name: '千葉', isActive: true, order: 24 },
  { id: '25', name: '後藤', isActive: true, order: 25 },
  { id: '26', name: '片浦', isActive: true, order: 26 },
];

// アクティブな担当者のみを取得（表示順でソート）
export function getActiveAssignees(assignees: Assignee[] = initialAssignees): string[] {
  return assignees
    .filter(a => a.isActive)
    .sort((a, b) => a.order - b.order)
    .map(a => a.name);
}


