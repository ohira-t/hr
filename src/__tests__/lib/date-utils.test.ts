import { 
  calculateDateInfo, 
  formatElapsedDays, 
  formatRemainingDays, 
  formatDate,
} from '@/lib/date-utils';

describe('date-utils', () => {
  describe('calculateDateInfo', () => {
    it('should return null for elapsed days when handoverDate is null', () => {
      const result = calculateDateInfo(null, null);
      expect(result.elapsedDays).toBeNull();
    });

    it('should return null for remaining days when deadlineDate is null', () => {
      const result = calculateDateInfo(null, null);
      expect(result.remainingDays).toBeNull();
    });

    it('should calculate elapsed days correctly', () => {
      const today = new Date();
      const tenDaysAgo = new Date(today);
      tenDaysAgo.setDate(today.getDate() - 10);
      
      const result = calculateDateInfo(tenDaysAgo, null);
      // 日数計算は1日の誤差があり得る
      expect(result.elapsedDays).toBeGreaterThanOrEqual(9);
      expect(result.elapsedDays).toBeLessThanOrEqual(10);
    });

    it('should calculate remaining days correctly', () => {
      const today = new Date();
      const tenDaysLater = new Date(today);
      tenDaysLater.setDate(today.getDate() + 10);
      
      const result = calculateDateInfo(null, tenDaysLater);
      expect(result.remainingDays).toBeGreaterThanOrEqual(9);
      expect(result.remainingDays).toBeLessThanOrEqual(10);
    });

    it('should return negative remaining days for past deadlines', () => {
      const today = new Date();
      const fiveDaysAgo = new Date(today);
      fiveDaysAgo.setDate(today.getDate() - 5);
      
      const result = calculateDateInfo(null, fiveDaysAgo);
      expect(result.remainingDays).toBeLessThan(0);
    });
  });

  describe('formatElapsedDays', () => {
    it('should return text for null days', () => {
      const result = formatElapsedDays(null);
      expect(typeof result).toBe('string');
    });

    it('should format positive days correctly', () => {
      expect(formatElapsedDays(45)).toContain('45');
    });

    it('should format zero days correctly', () => {
      expect(formatElapsedDays(0)).toContain('0');
    });
  });

  describe('formatRemainingDays', () => {
    it('should return text for null days', () => {
      const result = formatRemainingDays(null);
      expect(typeof result).toBe('string');
    });

    it('should format positive remaining days correctly', () => {
      const result = formatRemainingDays(10);
      expect(result).toContain('10');
    });

    it('should format overdue days correctly', () => {
      const result = formatRemainingDays(-5);
      expect(result).toContain('5');
    });

    it('should handle today (0 days) correctly', () => {
      const result = formatRemainingDays(0);
      expect(typeof result).toBe('string');
    });
  });

  describe('formatDate', () => {
    it('should return text for null date', () => {
      const result = formatDate(null);
      expect(typeof result).toBe('string');
    });

    it('should format date correctly', () => {
      const date = new Date('2025-03-15');
      const result = formatDate(date);
      expect(result).toContain('2025');
      expect(result).toContain('03');
      expect(result).toContain('15');
    });
  });
});
