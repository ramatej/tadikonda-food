/**
 * Phone Number Normalization & Validation Utility for Indian Mobile Numbers (+91)
 *
 * Requirements:
 * - Must handle 10-digit mobile numbers starting with 6, 7, 8, or 9
 * - Must support inputs with leading '0', '91', or '+91'
 * - Formats consistently to E.164 standard (+91XXXXXXXXXX) required by Supabase Auth
 * - Formats cleanly for user-facing display (+91 XXXXX XXXXX)
 */

export interface PhoneValidationResult {
  isValid: boolean;
  /** Full E.164 formatted number: e.g. +919440123456 */
  e164: string;
  /** Human friendly display: e.g. +91 94401 23456 */
  display: string;
  /** Raw 10 digits without country code: e.g. 9440123456 */
  tenDigit: string;
  /** User-friendly validation error if invalid */
  error?: string;
}

export function validateAndNormalizeIndianPhone(rawInput: string): PhoneValidationResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      isValid: false,
      e164: '',
      display: '',
      tenDigit: '',
      error: 'Please enter a mobile number.',
    };
  }

  // Remove all non-digit characters except a leading '+'
  const trimmed = rawInput.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');

  let tenDigit = '';

  if (digitsOnly.length === 10) {
    tenDigit = digitsOnly;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    tenDigit = digitsOnly.slice(1);
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    tenDigit = digitsOnly.slice(2);
  } else if (digitsOnly.length === 13 && digitsOnly.startsWith('091')) {
    tenDigit = digitsOnly.slice(3);
  } else {
    return {
      isValid: false,
      e164: '',
      display: trimmed,
      tenDigit: digitsOnly,
      error: 'Indian mobile numbers must be exactly 10 digits.',
    };
  }

  // Indian mobile numbers must begin with 6, 7, 8, or 9 (DoT numbering plan)
  if (!/^[6-9]\d{9}$/.test(tenDigit)) {
    return {
      isValid: false,
      e164: '',
      display: trimmed,
      tenDigit,
      error: 'A valid Indian mobile number must begin with 6, 7, 8, or 9.',
    };
  }

  const e164 = `+91${tenDigit}`;
  const display = `+91 ${tenDigit.slice(0, 5)} ${tenDigit.slice(5)}`;

  return {
    isValid: true,
    e164,
    display,
    tenDigit,
  };
}
