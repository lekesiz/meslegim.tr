/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user input and prevent XSS, SQL injection, and other attacks.
 */

/**
 * Sanitize HTML string to prevent XSS attacks
 * Removes potentially dangerous HTML tags and attributes
 */
export function sanitizeHtml(input: string): string {
  if (!input) return input;
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  return sanitized;
}

/**
 * Sanitize string for safe database insertion
 * Escapes special characters that could be used in SQL injection
 */
export function sanitizeForDatabase(input: string): string {
  if (!input) return input;
  
  // Drizzle ORM already handles SQL injection, but we add extra layer
  // Escape single quotes
  let sanitized = input.replace(/'/g, "''");
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  return sanitized;
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string | null {
  if (!email) return null;
  
  // Remove whitespace
  const trimmed = email.trim().toLowerCase();
  
  // Basic email regex validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmed)) {
    return null;
  }
  
  // Check for dangerous characters
  if (trimmed.includes('<') || trimmed.includes('>') || trimmed.includes('"')) {
    return null;
  }
  
  return trimmed;
}

/**
 * Validate and sanitize phone number (Turkish format)
 */
export function sanitizePhone(phone: string): string | null {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Turkish phone numbers are 10 digits (without country code)
  // or 12 digits (with country code 90)
  if (digits.length === 10) {
    return digits;
  } else if (digits.length === 12 && digits.startsWith('90')) {
    return digits.substring(2); // Remove country code
  } else if (digits.length === 13 && digits.startsWith('90')) {
    return digits.substring(3); // Remove country code and leading 0
  }
  
  return null;
}

/**
 * Validate and sanitize TC Kimlik No (Turkish ID number)
 */
export function sanitizeTcKimlik(tcKimlik: string): string | null {
  if (!tcKimlik) return null;
  
  // Remove all non-digit characters
  const digits = tcKimlik.replace(/\D/g, '');
  
  // TC Kimlik must be exactly 11 digits
  if (digits.length !== 11) {
    return null;
  }
  
  // First digit cannot be 0
  if (digits[0] === '0') {
    return null;
  }
  
  // Basic TC Kimlik validation algorithm
  const d = digits.split('').map(Number);
  
  // 10th digit check
  const sum1 = (d[0] + d[2] + d[4] + d[6] + d[8]) * 7;
  const sum2 = d[1] + d[3] + d[5] + d[7];
  const digit10 = (sum1 - sum2) % 10;
  
  if (digit10 !== d[9]) {
    return null;
  }
  
  // 11th digit check
  const sum3 = d.slice(0, 10).reduce((a, b) => a + b, 0);
  const digit11 = sum3 % 10;
  
  if (digit11 !== d[10]) {
    return null;
  }
  
  return digits;
}

/**
 * Sanitize filename for safe file upload
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed';
  
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');
  
  // Remove special characters except dot, dash, underscore
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    sanitized = sanitized.substring(0, 240) + '.' + ext;
  }
  
  return sanitized;
}

/**
 * Validate file type against whitelist
 */
export function validateFileType(filename: string, allowedTypes: string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? allowedTypes.includes(ext) : false;
}

/**
 * Validate file size
 */
export function validateFileSize(sizeInBytes: number, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
}

/**
 * Sanitize JSON input
 */
export function sanitizeJson(input: any): any {
  if (typeof input === 'string') {
    return sanitizeHtml(input);
  } else if (Array.isArray(input)) {
    return input.map(sanitizeJson);
  } else if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      sanitized[key] = sanitizeJson(input[key]);
    }
    return sanitized;
  }
  return input;
}
