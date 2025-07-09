import { generatePhoneFormats, normalizeToE164, normalizeToLocal, arePhoneNumbersEquivalent } from '../phone-utils';

describe('Phone Utils', () => {
  describe('generatePhoneFormats', () => {
    it('should generate all formats for E.164 number', () => {
      const formats = generatePhoneFormats('+61412345678');
      expect(formats).toContain('+61412345678');
      expect(formats).toContain('0412345678');
      expect(formats).toContain('412345678');
      expect(formats).toContain('0412 345 678');
    });

    it('should generate all formats for local number', () => {
      const formats = generatePhoneFormats('0412345678');
      expect(formats).toContain('+61412345678');
      expect(formats).toContain('0412345678');
      expect(formats).toContain('412345678');
      expect(formats).toContain('0412 345 678');
    });

    it('should generate all formats for raw number', () => {
      const formats = generatePhoneFormats('412345678');
      expect(formats).toContain('+61412345678');
      expect(formats).toContain('0412345678');
      expect(formats).toContain('412345678');
    });
  });

  describe('normalizeToE164', () => {
    it('should normalize various formats to E.164', () => {
      expect(normalizeToE164('+61412345678')).toBe('+61412345678');
      expect(normalizeToE164('0412345678')).toBe('+61412345678');
      expect(normalizeToE164('412345678')).toBe('+61412345678');
      expect(normalizeToE164('04 1234 5678')).toBe('+61412345678');
      expect(normalizeToE164('(04) 1234 5678')).toBe('+61412345678');
    });
  });

  describe('normalizeToLocal', () => {
    it('should normalize various formats to local', () => {
      expect(normalizeToLocal('+61412345678')).toBe('0412345678');
      expect(normalizeToLocal('0412345678')).toBe('0412345678');
      expect(normalizeToLocal('412345678')).toBe('0412345678');
      expect(normalizeToLocal('04 1234 5678')).toBe('0412345678');
    });
  });

  describe('arePhoneNumbersEquivalent', () => {
    it('should identify equivalent numbers', () => {
      expect(arePhoneNumbersEquivalent('+61412345678', '0412345678')).toBe(true);
      expect(arePhoneNumbersEquivalent('0412345678', '412345678')).toBe(true);
      expect(arePhoneNumbersEquivalent('+61412345678', '04 1234 5678')).toBe(true);
      expect(arePhoneNumbersEquivalent('0412345678', '0412345679')).toBe(false);
    });
  });
});