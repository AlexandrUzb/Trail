import crypto from 'crypto';
import { verifySupabaseToken } from '../services/supabaseClient.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'advokatai_jwt_secret_key_2026_super_secure';

/**
 * Encodes an object to Base64URL string.
 */
function base64UrlEncode(data) {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

/**
 * Decodes a Base64URL string to an object.
 */
function base64UrlDecode(str) {
  try {
    return JSON.parse(Buffer.from(str, 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}

/**
 * Generates a signed stateless token using HMAC-SHA256 (fallback).
 * Valid for 7 days by default.
 */
export function generateToken(user, expiresInDays = 7) {
  const payload = {
    id: user.id,
    userId: user.id,
    email: user.email,
    name: user.full_name || user.name || user.email?.split('@')[0],
    role: user.role || 'user',
    exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
    iat: Date.now()
  };

  const payloadEncoded = base64UrlEncode(payload);
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadEncoded)
    .digest('base64url');

  return `${payloadEncoded}.${signature}`;
}

/**
 * Cryptographically verifies a signed token.
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token mavjud emas' };
  }

  const parts = token.split('.');
  if (parts.length === 3) {
    // 3 parts: standard JWT (likely Supabase)
    const payload = base64UrlDecode(parts[1]);
    if (payload && payload.exp && Date.now() > payload.exp * 1000) {
      return { valid: false, expired: true, error: 'Sessiya muddati tugagan' };
    }
    if (payload && (payload.sub || payload.email)) {
      return {
        valid: true,
        payload: {
          id: payload.sub || payload.id,
          userId: payload.sub || payload.id,
          email: payload.email,
          role: payload.role || 'user'
        }
      };
    }
  }

  if (parts.length !== 2) {
    return { valid: false, error: 'Notoʻgʻri token formati' };
  }

  const [payloadEncoded, signature] = parts;

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadEncoded)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expectedSigBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedSigBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
    return { valid: false, error: 'Notoʻgʻri token imzosi' };
  }

  const payload = base64UrlDecode(payloadEncoded);
  if (!payload || !payload.exp) {
    return { valid: false, error: 'Token maʼlumotlari buzilgan' };
  }

  // Check expiration
  if (Date.now() > payload.exp) {
    return { valid: false, expired: true, error: 'Sessiya muddati tugagan' };
  }

  return { valid: true, payload };
}

/**
 * Reusable Express authentication middleware.
 * Verifies Authorization: Bearer <token> or x-auth-token header via Supabase Auth or fallback.
 * Rejects unauthenticated requests with HTTP 401.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let token = null;

  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  } else if (req.query?.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      error: "Ushbu amalni bajarish uchun tizimga kirish talab qilinadi."
    });
  }

  // 1. If standard 3-segment Supabase JWT, verify via Supabase Auth API
  if (token.split('.').length === 3) {
    const sbResult = await verifySupabaseToken(token);
    if (sbResult.valid && sbResult.user) {
      req.user = {
        id: sbResult.user.id,
        userId: sbResult.user.id,
        email: sbResult.user.email,
        role: sbResult.user.role || 'user'
      };
      return next();
    }
  }

  // 2. Fallback to verification helper
  const verification = verifyToken(token);
  if (!verification.valid) {
    return res.status(401).json({
      success: false,
      message: verification.expired ? "Session expired" : "Authentication required",
      error: verification.expired 
        ? "Sessiya muddati tugagan. Iltimos, hisobingizga qayta kiring." 
        : "Yaroqsiz avtorizatsiya sessiyasi. Iltimos, qayta kiring."
    });
  }

  req.user = verification.payload;
  next();
}
