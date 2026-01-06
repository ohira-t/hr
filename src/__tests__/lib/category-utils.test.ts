import { 
  getCategoryColor, 
  getCategoryLabel, 
  getSegmentColor, 
  getStatusColor 
} from '@/lib/category-utils';

describe('category-utils', () => {
  describe('getCategoryColor', () => {
    it('should return emerald colors for 就労', () => {
      const color = getCategoryColor('就労');
      expect(color).toContain('emerald');
    });

    it('should return blue colors for GH', () => {
      const color = getCategoryColor('GH');
      expect(color).toContain('blue');
    });

    it('should return purple colors for 看護', () => {
      const color = getCategoryColor('看護');
      expect(color).toContain('purple');
    });
  });

  describe('getCategoryLabel', () => {
    it('should return full label for 就労', () => {
      expect(getCategoryLabel('就労')).toBe('就労継続支援');
    });

    it('should return full label for GH', () => {
      expect(getCategoryLabel('GH')).toBe('グループホーム');
    });

    it('should return full label for 看護', () => {
      expect(getCategoryLabel('看護')).toBe('訪問看護');
    });
  });

  describe('getSegmentColor', () => {
    it('should return amber colors for 新規', () => {
      const color = getSegmentColor('新規');
      expect(color).toContain('amber');
    });

    it('should return slate colors for 既存', () => {
      const color = getSegmentColor('既存');
      expect(color).toContain('slate');
    });
  });

  describe('getStatusColor', () => {
    it('should return green colors for 採用活動中', () => {
      const color = getStatusColor('採用活動中');
      expect(color).toContain('green');
    });

    it('should return blue colors for 対応完了', () => {
      const color = getStatusColor('対応完了');
      expect(color).toContain('blue');
    });

    it('should return yellow colors for 保留', () => {
      const color = getStatusColor('保留');
      expect(color).toContain('yellow');
    });
  });
});
