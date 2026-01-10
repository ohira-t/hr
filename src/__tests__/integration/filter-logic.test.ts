import { mockProjects } from '@/data/mock-projects';
import type { Project, Category, Segment, ProjectStatus, Position, EmploymentType, MediaName } from '@/types/database';

/**
 * プロジェクトフィルタリングロジックの統合テスト
 */

// フィルタリングロジック（ProjectTableコンポーネントから抽出）
function filterProjects(
  projects: Project[],
  filters: {
    categoryFilter: Category | 'all';
    segmentFilter: Segment | 'all';
    statusFilter: ProjectStatus | 'all';
    positionFilter: Position | 'all';
    employmentTypeFilter: EmploymentType | 'all';
    assigneeFilter: string | 'all';
    mediaFilter: MediaName[];
    searchQuery: string;
  }
): Project[] {
  let result = [...projects];

  // テキスト検索
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase().trim();
    result = result.filter(p =>
      p.hrId.toLowerCase().includes(query) ||
      p.clientName.toLowerCase().includes(query) ||
      p.prefecture.toLowerCase().includes(query) ||
      p.city.toLowerCase().includes(query) ||
      p.position.toLowerCase().includes(query)
    );
  }

  // カテゴリフィルタ
  if (filters.categoryFilter !== 'all') {
    result = result.filter(p => p.category === filters.categoryFilter);
  }

  // セグメントフィルタ
  if (filters.segmentFilter !== 'all') {
    result = result.filter(p => p.segment === filters.segmentFilter);
  }

  // ステータスフィルタ
  if (filters.statusFilter !== 'all') {
    result = result.filter(p => p.status === filters.statusFilter);
  }

  // 担当者フィルタ
  if (filters.assigneeFilter !== 'all') {
    result = result.filter(p => p.assignee === filters.assigneeFilter);
  }

  // 募集職種フィルタ
  if (filters.positionFilter !== 'all') {
    result = result.filter(p => p.position === filters.positionFilter);
  }

  // 勤務形態フィルタ
  if (filters.employmentTypeFilter !== 'all') {
    result = result.filter(p => p.employmentType === filters.employmentTypeFilter);
  }

  // 媒体フィルタ（複数選択 - いずれかの媒体が掲載中なら表示）
  if (filters.mediaFilter.length > 0) {
    result = result.filter(p =>
      p.media.some(m =>
        filters.mediaFilter.includes(m.mediaName) && m.status === '掲載中'
      )
    );
  }

  return result;
}

const defaultFilters = {
  categoryFilter: 'all' as const,
  segmentFilter: 'all' as const,
  statusFilter: 'all' as const,
  positionFilter: 'all' as const,
  employmentTypeFilter: 'all' as const,
  assigneeFilter: 'all' as const,
  mediaFilter: [] as MediaName[],
  searchQuery: '',
};

describe('Filter Logic Integration Tests', () => {
  describe('Single Filter Tests', () => {
    it('should return all projects with no filters', () => {
      const result = filterProjects(mockProjects, defaultFilters);
      expect(result.length).toBe(mockProjects.length);
    });

    it('should filter by category correctly', () => {
      const result = filterProjects(mockProjects, {
        ...defaultFilters,
        categoryFilter: '就労',
      });
      expect(result.every(p => p.category === '就労')).toBe(true);
    });

    it('should filter by segment correctly', () => {
      const result = filterProjects(mockProjects, {
        ...defaultFilters,
        segmentFilter: '新規',
      });
      expect(result.every(p => p.segment === '新規')).toBe(true);
    });

    it('should filter by status correctly', () => {
      const result = filterProjects(mockProjects, {
        ...defaultFilters,
        statusFilter: '採用活動中',
      });
      expect(result.every(p => p.status === '採用活動中')).toBe(true);
    });

    it('should filter by search query in client name', () => {
      const testProject = mockProjects[0];
      const result = filterProjects(mockProjects, {
        ...defaultFilters,
        searchQuery: testProject.clientName.substring(0, 3),
      });
      expect(result.some(p => p.hrId === testProject.hrId)).toBe(true);
    });

    it('should filter by search query in HR ID', () => {
      const testProject = mockProjects[0];
      const result = filterProjects(mockProjects, {
        ...defaultFilters,
        searchQuery: testProject.hrId,
      });
      expect(result.length).toBe(1);
      expect(result[0].hrId).toBe(testProject.hrId);
    });
  });

  describe('Combined Filter Tests', () => {
    it('should combine category and segment filters', () => {
      const result = filterProjects(mockProjects, {
        ...defaultFilters,
        categoryFilter: '就労',
        segmentFilter: '新規',
      });
      expect(result.every(p => p.category === '就労' && p.segment === '新規')).toBe(true);
    });

    it('should combine category and status filters', () => {
      const result = filterProjects(mockProjects, {
        ...defaultFilters,
        categoryFilter: 'GH',
        statusFilter: '採用活動中',
      });
      expect(result.every(p => p.category === 'GH' && p.status === '採用活動中')).toBe(true);
    });

    it('should combine multiple filters', () => {
      const result = filterProjects(mockProjects, {
        ...defaultFilters,
        categoryFilter: '就労',
        segmentFilter: '新規',
        statusFilter: '採用活動中',
      });
      result.forEach(p => {
        expect(p.category).toBe('就労');
        expect(p.segment).toBe('新規');
        expect(p.status).toBe('採用活動中');
      });
    });

    it('should combine search query with filters', () => {
      const result = filterProjects(mockProjects, {
        ...defaultFilters,
        categoryFilter: '就労',
        searchQuery: '東京',
      });
      result.forEach(p => {
        expect(p.category).toBe('就労');
        expect(
          p.hrId.includes('東京') ||
          p.clientName.includes('東京') ||
          p.prefecture.includes('東京') ||
          p.city.includes('東京')
        ).toBe(true);
      });
    });
  });

  describe('Empty Result Tests', () => {
    it('should return empty array for impossible filter combination', () => {
      // 存在しない組み合わせを検索
      const result = filterProjects(mockProjects, {
        ...defaultFilters,
        searchQuery: 'XXXNONEXISTENTXXX',
      });
      expect(result.length).toBe(0);
    });
  });

  describe('Case Insensitive Search Tests', () => {
    it('should find projects regardless of case', () => {
      const testProject = mockProjects[0];
      const lowerCaseResult = filterProjects(mockProjects, {
        ...defaultFilters,
        searchQuery: testProject.clientName.toLowerCase(),
      });
      const upperCaseResult = filterProjects(mockProjects, {
        ...defaultFilters,
        searchQuery: testProject.clientName.toUpperCase(),
      });
      expect(lowerCaseResult.length).toBe(upperCaseResult.length);
    });
  });

  describe('Performance Tests', () => {
    it('should filter projects efficiently', () => {
      const startTime = performance.now();
      
      // 1000回フィルタリングを実行
      for (let i = 0; i < 1000; i++) {
        filterProjects(mockProjects, {
          ...defaultFilters,
          categoryFilter: '就労',
          segmentFilter: '新規',
          statusFilter: '採用活動中',
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 1000回の実行が1秒以内に完了することを確認
      expect(duration).toBeLessThan(1000);
    });
  });
});


