import { SHA256 } from 'crypto-js';
import DOMPurify from 'dompurify';
import { z } from 'zod';
import { UserRole } from '@/lib/types';

// Session token interface
export interface SessionToken {
  token: string;
  csrfToken: string;
  expiresAt: number;
  userId: string;
  lastRotated: number;
}

// Input validation schemas
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/^[A-Za-z0-9]+$/, "Password can only contain letters and numbers"),
  name: z.string().min(2),
  role: z.enum(['district_engineer', 'regional_engineer', 'global_engineer', 'system_admin', 'technician']),
  region: z.string().optional(),
  district: z.string().optional()
});

// Password hashing
export const hashPassword = (password: string): string => {
  // Compute MD5 hash of the password
  return SHA256(password).toString();
};

// CSRF token generation
export const generateCSRFToken = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Session token generation
export const generateSessionToken = (userId: string): SessionToken => {
  return {
    token: Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''),
    csrfToken: generateCSRFToken(),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    userId,
    lastRotated: Date.now()
  };
};

// Session validation
export const validateSessionToken = (token: SessionToken): boolean => {
  return token.expiresAt > Date.now();
};

// Session storage in httpOnly cookies
export const storeSession = (session: SessionToken): void => {
  const secure = window.location.protocol === 'https:';
  document.cookie = `session=${JSON.stringify(session)}; path=/; httpOnly; ${secure ? 'secure;' : ''} sameSite=strict`;
};

// XSS protection
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Only allow text
    ALLOWED_ATTR: []
  });
};

// Role-based access validation
export const hasRequiredRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  if (!userRole || !requiredRole) return false;
  
  const roleHierarchy: { [key in Exclude<UserRole, null>]: number } = {
    'technician': 1,
    'district_engineer': 2,
    'regional_engineer': 3,
    'global_engineer': 4,
    'system_admin': 5
  };

  // System admin has access to everything
  if (userRole === 'system_admin') {
    return true;
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Input validation
export const validateUserInput = (input: unknown) => {
  return userSchema.parse(input);
}; 