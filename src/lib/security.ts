/**
 * Security utilities for form submissions and API calls
 * Implements rate limiting, input sanitization, and validation
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();

  constructor(private config: RateLimitConfig) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(key);

    if (!entry || now > entry.resetTime) {
      this.attempts.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (entry.count >= this.config.maxAttempts) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingTime(key: string): number {
    const entry = this.attempts.get(key);
    if (!entry) return 0;

    const remaining = entry.resetTime - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Rate limiters for different form types
export const contactFormLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

export const newsletterLimiter = new RateLimiter({
  maxAttempts: 2,
  windowMs: 60 * 60 * 1000, // 1 hour
});

export const membershipFormLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 30 * 60 * 1000, // 30 minutes
});

export const eventRegistrationLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 10 * 60 * 1000, // 10 minutes
});

/**
 * Input sanitization functions
 */
export const sanitizeInput = {
  /**
   * Remove HTML tags and dangerous characters
   */
  text: (input: string): string => {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"]/g, '') // Remove dangerous characters
      .trim();
  },

  /**
   * Sanitize email addresses
   */
  email: (input: string): string => {
    return input.toLowerCase().trim();
  },

  /**
   * Sanitize phone numbers (remove non-numeric except +)
   */
  phone: (input: string): string => {
    return input.replace(/[^\d+]/g, '');
  },

  /**
   * Sanitize URLs
   */
  url: (input: string): string => {
    try {
      const url = new URL(input);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }
      return url.toString();
    } catch {
      return '';
    }
  },

  /**
   * Sanitize multiline text (preserve line breaks)
   */
  multiline: (input: string): string => {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"]/g, '') // Remove dangerous characters
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .trim();
  },
};

/**
 * Input validation functions
 */
export const validate = {
  /**
   * Validate email format
   */
  email: (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number format
   */
  phone: (phone: string): boolean => {
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  },

  /**
   * Validate URL format
   */
  url: (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },

  /**
   * Check if string contains SQL injection patterns
   */
  noSqlInjection: (input: string): boolean => {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
      /(--|\|\||;|\/\*|\*\/)/,
      /(\bOR\b.*=.*)/i,
      /(\bAND\b.*=.*)/i,
    ];
    return !sqlPatterns.some(pattern => pattern.test(input));
  },

  /**
   * Check if string contains XSS patterns
   */
  noXSS: (input: string): boolean => {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // onclick, onload, etc.
      /<iframe[^>]*>/gi,
      /eval\(/gi,
    ];
    return !xssPatterns.some(pattern => pattern.test(input));
  },

  /**
   * Validate file upload
   */
  file: (file: File, options?: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }): { valid: boolean; error?: string } => {
    const maxSize = options?.maxSize || 50 * 1024 * 1024; // 50MB default
    const allowedTypes = options?.allowedTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/zip',
      'video/mp4',
    ];

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`,
      };
    }

    // Check MIME type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not allowed',
      };
    }

    // Check file extension
    if (options?.allowedExtensions) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !options.allowedExtensions.includes(extension)) {
        return {
          valid: false,
          error: 'File extension not allowed',
        };
      }
    }

    return { valid: true };
  },
};

/**
 * Generate a fingerprint for rate limiting
 */
export const generateFingerprint = (): string => {
  // In a real application, you might want to use more sophisticated fingerprinting
  // For now, we'll use a combination of user agent and a session identifier
  const userAgent = navigator.userAgent;
  const sessionId = sessionStorage.getItem('session_id') || generateSessionId();

  return btoa(`${userAgent}-${sessionId}`);
};

/**
 * Generate a session ID
 */
const generateSessionId = (): string => {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('session_id', id);
  return id;
};

/**
 * Check if user is submitting too quickly (honeypot timing)
 */
export const checkSubmissionTiming = (formStartTime: number): boolean => {
  const submissionTime = Date.now() - formStartTime;
  // If form is submitted in less than 2 seconds, likely a bot
  return submissionTime >= 2000;
};

/**
 * CSRF token management
 */
export const csrfToken = {
  generate: (): string => {
    const token = btoa(
      `${Date.now()}-${Math.random().toString(36).substr(2, 18)}`
    );
    sessionStorage.setItem('csrf_token', token);
    return token;
  },

  get: (): string | null => {
    return sessionStorage.getItem('csrf_token');
  },

  validate: (token: string): boolean => {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token;
  },

  refresh: (): string => {
    sessionStorage.removeItem('csrf_token');
    return csrfToken.generate();
  },
};

/**
 * Secure form submission wrapper
 */
export interface SecureSubmissionOptions {
  rateLimiter: RateLimiter;
  sanitize?: boolean;
  validateTiming?: boolean;
  csrfCheck?: boolean;
}

export const secureSubmit = async <T>(
  data: T,
  submitFn: (data: T) => Promise<void>,
  options: SecureSubmissionOptions
): Promise<void> => {
  const fingerprint = generateFingerprint();

  // Check rate limiting
  if (!options.rateLimiter.isAllowed(fingerprint)) {
    const remainingTime = options.rateLimiter.getRemainingTime(fingerprint);
    throw new Error(
      `Trop de tentatives. Veuillez réessayer dans ${remainingTime} secondes.`
    );
  }

  // Execute submission
  try {
    await submitFn(data);
    // Reset rate limiter on successful submission
    options.rateLimiter.reset(fingerprint);
  } catch (error) {
    // Don't reset rate limiter on error to prevent spam
    throw error;
  }
};
