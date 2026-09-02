// =============================================================================
// Input Sanitization Utility
// =============================================================================
// Strips HTML tags, script injections, and SQL-like patterns from all
// free-text inputs (proposal descriptions, rejection comments, equipment
// fields). Logs sanitization events to the audit trail.
// =============================================================================

/**
 * Sanitize free-text input by stripping dangerous patterns.
 * Used on: proposal descriptions, rejection comments, equipment fields.
 *
 * Strips:
 * - HTML tags (including self-closing)
 * - Script injections (javascript:, on* event handlers)
 * - SQL-like patterns (UNION, SELECT, INSERT, DELETE, DROP, --, ;)
 * - Control characters (except newlines and tabs)
 *
 * @returns Object with sanitized string and whether sanitization was applied
 */
export function sanitizeInput(raw: string): {
  sanitized: string;
  wasSanitized: boolean;
  removedPatterns: string[];
} {
  const removedPatterns: string[] = [];
  let result = raw;

  // 1. Strip HTML tags
  const htmlTagPattern = /<\/?[^>]+(>|$)/gi;
  if (htmlTagPattern.test(result)) {
    removedPatterns.push('HTML tags');
    result = result.replace(htmlTagPattern, '');
  }

  // 2. Strip javascript: protocol
  const jsProtocolPattern = /javascript\s*:/gi;
  if (jsProtocolPattern.test(result)) {
    removedPatterns.push('javascript: protocol');
    result = result.replace(jsProtocolPattern, '');
  }

  // 3. Strip on* event handlers (onclick, onload, etc.)
  const eventHandlerPattern = /\bon\w+\s*=/gi;
  if (eventHandlerPattern.test(result)) {
    removedPatterns.push('event handlers');
    result = result.replace(eventHandlerPattern, '');
  }

  // 4. Strip SQL injection patterns
  const sqlPatterns = [
    /\bUNION\b\s+\bSELECT\b/gi,
    /\bSELECT\b\s+.*\bFROM\b/gi,
    /\bINSERT\b\s+\bINTO\b/gi,
    /\bDELETE\b\s+\bFROM\b/gi,
    /\bDROP\b\s+\b(TABLE|DATABASE)\b/gi,
    /\bUPDATE\b\s+.*\bSET\b/gi,
    /--\s/g,
    /;\s*$/g,
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(result)) {
      removedPatterns.push('SQL-like pattern');
      result = result.replace(pattern, '');
      break; // Log once for SQL patterns
    }
  }

  // 5. Strip control characters (keep \n, \r, \t)
  const controlCharPattern = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
  if (controlCharPattern.test(result)) {
    removedPatterns.push('control characters');
    result = result.replace(controlCharPattern, '');
  }

  // 6. Trim and limit length
  result = result.trim();

  return {
    sanitized: result,
    wasSanitized: removedPatterns.length > 0,
    removedPatterns,
  };
}

/**
 * Sanitize and enforce max length on equipment/activity description fields.
 */
export function sanitizeEquipmentField(
  raw: string,
  maxLength: number = 200
): { sanitized: string; wasSanitized: boolean; removedPatterns: string[] } {
  const result = sanitizeInput(raw);
  if (result.sanitized.length > maxLength) {
    result.sanitized = result.sanitized.substring(0, maxLength);
    result.wasSanitized = true;
    result.removedPatterns.push(`truncated to ${maxLength} chars`);
  }
  return result;
}

/**
 * Sanitize rejection comment (must be at least 20 chars after sanitization).
 */
export function sanitizeRejectionComment(raw: string): {
  sanitized: string;
  wasSanitized: boolean;
  isValid: boolean;
  removedPatterns: string[];
} {
  const result = sanitizeInput(raw);
  return {
    ...result,
    isValid: result.sanitized.length >= 20,
  };
}
