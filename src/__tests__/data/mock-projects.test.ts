import { 
  mockProjects, 
  calculateStats, 
  getUrgentProjects, 
  getSlowProjects 
} from '@/data/mock-projects';
import { CATEGORIES, SEGMENTS, PROJECT_STATUSES, POSITIONS, EMPLOYMENT_TYPES } from '@/types/database';

describe('Mock Projects Data', () => {
  describe('Data Integrity', () => {
    it('should have at least one project', () => {
      expect(mockProjects.length).toBeGreaterThan(0);
    });

    it('should have valid category for all projects', () => {
      mockProjects.forEach(project => {
        expect(CATEGORIES).toContain(project.category);
      });
    });

    it('should have valid segment for all projects', () => {
      mockProjects.forEach(project => {
        expect(SEGMENTS).toContain(project.segment);
      });
    });

    it('should have valid status for all projects', () => {
      mockProjects.forEach(project => {
        expect(PROJECT_STATUSES).toContain(project.status);
      });
    });

    it('should have valid position for all projects', () => {
      mockProjects.forEach(project => {
        expect(POSITIONS).toContain(project.position);
      });
    });

    it('should have valid employment type for all projects', () => {
      mockProjects.forEach(project => {
        expect(EMPLOYMENT_TYPES).toContain(project.employmentType);
      });
    });

    it('should have unique HR IDs', () => {
      const hrIds = mockProjects.map(p => p.hrId);
      const uniqueHrIds = new Set(hrIds);
      expect(uniqueHrIds.size).toBe(hrIds.length);
    });

    it('should have non-negative hiring counts', () => {
      mockProjects.forEach(project => {
        expect(project.targetHiringCount).toBeGreaterThanOrEqual(0);
        expect(project.currentHiringCount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have current hiring not exceed target', () => {
      mockProjects.forEach(project => {
        expect(project.currentHiringCount).toBeLessThanOrEqual(project.targetHiringCount);
      });
    });
  });

  describe('calculateStats', () => {
    const stats = calculateStats();

    it('should return stats for all category-segment combinations', () => {
      expect(stats.length).toBeGreaterThan(0);
    });

    it('should have correct structure', () => {
      stats.forEach(stat => {
        expect(stat).toHaveProperty('category');
        expect(stat).toHaveProperty('segment');
        expect(stat).toHaveProperty('activeProjects');
        expect(stat).toHaveProperty('targetHirings');
        expect(stat).toHaveProperty('currentHirings');
        expect(stat).toHaveProperty('hiringRate');
      });
    });

    it('should have non-negative values', () => {
      stats.forEach(stat => {
        expect(stat.activeProjects).toBeGreaterThanOrEqual(0);
        expect(stat.targetHirings).toBeGreaterThanOrEqual(0);
        expect(stat.currentHirings).toBeGreaterThanOrEqual(0);
        expect(stat.hiringRate).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have hiring rate between 0 and 100', () => {
      stats.forEach(stat => {
        if (stat.targetHirings > 0) {
          expect(stat.hiringRate).toBeGreaterThanOrEqual(0);
          expect(stat.hiringRate).toBeLessThanOrEqual(100);
        }
      });
    });
  });

  describe('getUrgentProjects', () => {
    it('should return limited number of projects', () => {
      const limit = 5;
      const urgentProjects = getUrgentProjects(limit);
      expect(urgentProjects.length).toBeLessThanOrEqual(limit);
    });

    it('should only return active projects', () => {
      const urgentProjects = getUrgentProjects(10);
      urgentProjects.forEach(project => {
        expect(project.status).toBe('採用活動中');
      });
    });

    it('should be sorted by deadline (ascending)', () => {
      const urgentProjects = getUrgentProjects(10);
      for (let i = 1; i < urgentProjects.length; i++) {
        const prevDeadline = urgentProjects[i - 1].deadlineDate?.getTime() || Infinity;
        const currDeadline = urgentProjects[i].deadlineDate?.getTime() || Infinity;
        expect(prevDeadline).toBeLessThanOrEqual(currDeadline);
      }
    });
  });

  describe('getSlowProjects', () => {
    it('should return limited number of projects', () => {
      const limit = 5;
      const slowProjects = getSlowProjects(limit);
      expect(slowProjects.length).toBeLessThanOrEqual(limit);
    });

    it('should only return active projects', () => {
      const slowProjects = getSlowProjects(10);
      slowProjects.forEach(project => {
        expect(project.status).toBe('採用活動中');
      });
    });

    it('should be sorted by elapsed days (descending)', () => {
      const slowProjects = getSlowProjects(10);
      for (let i = 1; i < slowProjects.length; i++) {
        const prevHandover = slowProjects[i - 1].handoverDate?.getTime() || 0;
        const currHandover = slowProjects[i].handoverDate?.getTime() || 0;
        expect(prevHandover).toBeLessThanOrEqual(currHandover);
      }
    });
  });
});

