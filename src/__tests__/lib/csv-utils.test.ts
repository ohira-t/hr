/**
 * CSV入出力機能のテスト
 */

describe('CSV Utils', () => {
  describe('CSV Escape', () => {
    const escapeCSV = (value: string | number | null | undefined): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    it('should return empty string for null', () => {
      expect(escapeCSV(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(escapeCSV(undefined)).toBe('');
    });

    it('should return string as-is if no special characters', () => {
      expect(escapeCSV('Simple text')).toBe('Simple text');
    });

    it('should wrap in quotes if contains comma', () => {
      expect(escapeCSV('Hello, World')).toBe('"Hello, World"');
    });

    it('should wrap in quotes and escape double quotes', () => {
      expect(escapeCSV('Say "Hello"')).toBe('"Say ""Hello"""');
    });

    it('should wrap in quotes if contains newline', () => {
      expect(escapeCSV('Line1\nLine2')).toBe('"Line1\nLine2"');
    });

    it('should convert numbers to string', () => {
      expect(escapeCSV(123)).toBe('123');
    });
  });

  describe('CSV Parse', () => {
    const parseCSV = (text: string): string[][] => {
      const rows: string[][] = [];
      let currentRow: string[] = [];
      let currentCell = '';
      let inQuotes = false;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (inQuotes) {
          if (char === '"' && nextChar === '"') {
            currentCell += '"';
            i++;
          } else if (char === '"') {
            inQuotes = false;
          } else {
            currentCell += char;
          }
        } else {
          if (char === '"') {
            inQuotes = true;
          } else if (char === ',') {
            currentRow.push(currentCell.trim());
            currentCell = '';
          } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
            currentRow.push(currentCell.trim());
            if (currentRow.some(cell => cell !== '')) {
              rows.push(currentRow);
            }
            currentRow = [];
            currentCell = '';
            if (char === '\r') i++;
          } else if (char !== '\r') {
            currentCell += char;
          }
        }
      }

      if (currentCell !== '' || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell !== '')) {
          rows.push(currentRow);
        }
      }

      return rows;
    };

    it('should parse simple CSV', () => {
      const csv = 'a,b,c\n1,2,3';
      const result = parseCSV(csv);
      expect(result).toEqual([['a', 'b', 'c'], ['1', '2', '3']]);
    });

    it('should parse CSV with quoted fields', () => {
      const csv = '"Hello, World",test\nvalue1,value2';
      const result = parseCSV(csv);
      expect(result[0][0]).toBe('Hello, World');
    });

    it('should parse CSV with escaped quotes', () => {
      const csv = '"Say ""Hello""",test';
      const result = parseCSV(csv);
      expect(result[0][0]).toBe('Say "Hello"');
    });

    it('should parse CSV with newlines in quoted fields', () => {
      const csv = '"Line1\nLine2",test';
      const result = parseCSV(csv);
      expect(result[0][0]).toBe('Line1\nLine2');
    });

    it('should handle empty rows', () => {
      const csv = 'a,b\n\nc,d';
      const result = parseCSV(csv);
      expect(result.length).toBe(2);
    });

    it('should handle CRLF line endings', () => {
      const csv = 'a,b\r\nc,d';
      const result = parseCSV(csv);
      expect(result).toEqual([['a', 'b'], ['c', 'd']]);
    });
  });

  describe('HR ID Validation', () => {
    const isValidHrId = (id: string): boolean => {
      // HR IDのフォーマット: T0000-00 (例: T0052-01)
      const pattern = /^T\d{4}-\d{2}$/;
      return pattern.test(id);
    };

    it('should validate correct HR ID format', () => {
      expect(isValidHrId('T0052-01')).toBe(true);
      expect(isValidHrId('T0001-99')).toBe(true);
    });

    it('should reject invalid HR ID format', () => {
      expect(isValidHrId('0052-01')).toBe(false);
      expect(isValidHrId('T052-01')).toBe(false);
      expect(isValidHrId('T0052-1')).toBe(false);
      expect(isValidHrId('T0052')).toBe(false);
    });
  });

  describe('Import Data Validation', () => {
    const validateSegment = (value: string): boolean => {
      const validSegments = ['新規', '既存'];
      return validSegments.includes(value);
    };

    const validateCategory = (value: string): boolean => {
      const validCategories = ['就労', 'GH', '看護'];
      return validCategories.includes(value);
    };

    const validateStatus = (value: string): boolean => {
      const validStatuses = [
        '未着手', '手続き中', '採用活動中', '入社待機中', 
        '対応完了', '保留', '停止手続き中', '解約', '不要'
      ];
      return validStatuses.includes(value);
    };

    it('should validate segment values', () => {
      expect(validateSegment('新規')).toBe(true);
      expect(validateSegment('既存')).toBe(true);
      expect(validateSegment('無効')).toBe(false);
    });

    it('should validate category values', () => {
      expect(validateCategory('就労')).toBe(true);
      expect(validateCategory('GH')).toBe(true);
      expect(validateCategory('看護')).toBe(true);
      expect(validateCategory('無効')).toBe(false);
    });

    it('should validate status values', () => {
      expect(validateStatus('未着手')).toBe(true);
      expect(validateStatus('手続き中')).toBe(true);
      expect(validateStatus('採用活動中')).toBe(true);
      expect(validateStatus('入社待機中')).toBe(true);
      expect(validateStatus('対応完了')).toBe(true);
      expect(validateStatus('保留')).toBe(true);
      expect(validateStatus('停止手続き中')).toBe(true);
      expect(validateStatus('解約')).toBe(true);
      expect(validateStatus('不要')).toBe(true);
      expect(validateStatus('無効')).toBe(false);
    });
  });
});

