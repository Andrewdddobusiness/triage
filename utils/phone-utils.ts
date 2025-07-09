/**
 * Phone number utility functions for handling Australian phone number formats
 * Handles conversions between different formats: +61, 0, and raw numbers
 */

/**
 * Normalize phone number to E.164 format (+61...)
 * @param phone - Phone number in any format
 * @returns Normalized phone number in E.164 format
 */
export function normalizeToE164(phone: string): string {
  if (!phone) return phone;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle different Australian number formats
  if (digits.startsWith('61')) {
    // Already has country code: 61412345678 or +61412345678
    return '+' + digits;
  } else if (digits.startsWith('0')) {
    // Local format with 0: 0412345678
    return '+61' + digits.slice(1);
  } else if (digits.length === 9) {
    // Raw mobile number: 412345678
    return '+61' + digits;
  } else if (digits.length === 10) {
    // Local format: 0412345678 (already handled above)
    return '+61' + digits.slice(1);
  }
  
  // If we can't normalize, return original
  return phone;
}

/**
 * Convert phone number to local Australian format (0...)
 * @param phone - Phone number in any format
 * @returns Phone number in local format (0...)
 */
export function normalizeToLocal(phone: string): string {
  if (!phone) return phone;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle different Australian number formats
  if (digits.startsWith('61')) {
    // Has country code: +61412345678 -> 0412345678
    return '0' + digits.slice(2);
  } else if (digits.startsWith('0')) {
    // Already local format: 0412345678
    return digits;
  } else if (digits.length === 9) {
    // Raw mobile number: 412345678 -> 0412345678
    return '0' + digits;
  }
  
  // If we can't normalize, return original
  return phone;
}

/**
 * Generate all possible phone number formats for a given phone number
 * Used for searching across different format variations
 * @param phone - Phone number in any format
 * @returns Array of all possible formats
 */
export function generatePhoneFormats(phone: string): string[] {
  if (!phone) return [];
  
  const formats = new Set<string>();
  
  // Add original format
  formats.add(phone);
  
  // Add E.164 format
  const e164 = normalizeToE164(phone);
  formats.add(e164);
  
  // Add local format
  const local = normalizeToLocal(phone);
  formats.add(local);
  
  // Add without country code (raw digits)
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('61')) {
    formats.add(digits.slice(2)); // Remove country code: 61412345678 -> 412345678
  } else if (digits.startsWith('0')) {
    formats.add(digits.slice(1)); // Remove leading 0: 0412345678 -> 412345678
  }
  
  // Add with spaces/formatting variations (common in VAPI)
  if (local.length === 10) {
    // 0412345678 -> 0412 345 678
    formats.add(`${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`);
    // 0412345678 -> (04) 1234 5678
    formats.add(`(${local.slice(0, 2)}) ${local.slice(2, 6)} ${local.slice(6)}`);
  }
  
  if (e164.length === 12) {
    // +61412345678 -> +61 412 345 678
    formats.add(`${e164.slice(0, 3)} ${e164.slice(3, 6)} ${e164.slice(6, 9)} ${e164.slice(9)}`);
    // +61412345678 -> +61 (0) 412 345 678
    formats.add(`${e164.slice(0, 3)} (0) ${e164.slice(3, 6)} ${e164.slice(6, 9)} ${e164.slice(9)}`);
  }
  
  // Remove empty strings and duplicates
  return Array.from(formats).filter(f => f && f.length > 0);
}

/**
 * Check if two phone numbers are equivalent (same number, different formats)
 * @param phone1 - First phone number
 * @param phone2 - Second phone number
 * @returns True if numbers are equivalent
 */
export function arePhoneNumbersEquivalent(phone1: string, phone2: string): boolean {
  if (!phone1 || !phone2) return false;
  
  // Normalize both to E.164 and compare
  const normalized1 = normalizeToE164(phone1);
  const normalized2 = normalizeToE164(phone2);
  
  return normalized1 === normalized2;
}

/**
 * Validate if a phone number is a valid Australian mobile number
 * @param phone - Phone number to validate
 * @returns True if valid Australian mobile number
 */
export function isValidAustralianMobile(phone: string): boolean {
  if (!phone) return false;
  
  const e164 = normalizeToE164(phone);
  
  // Australian mobile numbers start with +614 and have 11 digits total
  return /^\+614\d{8}$/.test(e164);
}

/**
 * Format phone number for display
 * @param phone - Phone number in any format
 * @param format - Desired format ('e164', 'local', 'display')
 * @returns Formatted phone number
 */
export function formatPhoneForDisplay(phone: string, format: 'e164' | 'local' | 'display' = 'display'): string {
  if (!phone) return '';
  
  switch (format) {
    case 'e164':
      return normalizeToE164(phone);
    case 'local':
      return normalizeToLocal(phone);
    case 'display':
      const local = normalizeToLocal(phone);
      if (local.length === 10) {
        // 0412345678 -> 0412 345 678
        return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
      }
      return local;
    default:
      return phone;
  }
}