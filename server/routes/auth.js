import express from 'express';
import { storageService } from '../services/storageService.js';
import { generateToken, requireAuth } from '../middleware/auth.js';
import { getSupabaseServerClient } from '../services/supabaseClient.js';

const router = express.Router();

// Strict anti-caching headers across all authentication endpoints:
// Prevents Vercel/CDN edge nodes and browser caches from reusing session or user identity responses across visitors.
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register
 * Registers a new user with secure password validation and token generation.
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body || {};

    // 1. Basic presence and whitespace checks
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Ismingizni kiriting.",
        error: "Ismingizni kiriting." 
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ 
        success: false, 
        message: "Ism juda uzun (maksimal 100 belgi).",
        error: "Ism juda uzun (maksimal 100 belgi)." 
      });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Email manzilingizni kiriting.",
        error: "Email manzilingizni kiriting." 
      });
    }

    const cleanEmail = email.trim();
    if (cleanEmail.length > 255 || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: "Notoʻgʻri email formati.",
        error: "Notoʻgʻri email formati." 
      });
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Parolni kiriting.",
        error: "Parolni kiriting." 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Parol kamida 6 ta belgidan iborat boʻlishi kerak.",
        error: "Parol kamida 6 ta belgidan iborat boʻlishi kerak." 
      });
    }

    if (password.length > 128) {
      return res.status(400).json({ 
        success: false, 
        message: "Parol juda uzun (maksimal 128 belgi).",
        error: "Parol juda uzun (maksimal 128 belgi)." 
      });
    }

    // 2. Strict password confirmation match (Server-side validation)
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Kiritilgan parollar bir-biriga mos kelmadi.",
        error: "Kiritilgan parollar bir-biriga mos kelmadi." 
      });
    }

    // 3. User creation
    const user = storageService.createUser({
      name: name.trim(),
      email: cleanEmail,
      password,
      plan: 'free'
    });

    // 4. Provision user in Supabase Auth (confirmed email) and public.profiles
    const sb = getSupabaseServerClient();
    if (sb && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data: sbUser, error: sbErr } = await sb.auth.admin.createUser({
          email: cleanEmail,
          password: password,
          email_confirm: true,
          user_metadata: { full_name: name.trim() }
        });
        if (!sbErr && sbUser?.user) {
          user.id = sbUser.user.id;
          await sb.from('profiles').upsert({
            id: sbUser.user.id,
            email: cleanEmail,
            full_name: name.trim(),
            role: 'user',
            updated_at: new Date().toISOString()
          });
        }
      } catch (sbE) {
        console.warn('[Auth] Supabase sync warning:', sbE.message);
      }
    }

    // 5. Generate signed stateless auth token
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Roʻyxatdan oʻtish muvaffaqiyatli yakunlandi.",
      data: {
        user,
        token
      }
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const msg = err.message || "Roʻyxatdan oʻtishda kutilmagan xatolik yuz berdi.";
    return res.status(statusCode).json({
      success: false,
      message: msg,
      error: msg
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticates user credentials and returns user profile + session token.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string' || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Email va parolni kiriting.",
        error: "Email va parolni kiriting." 
      });
    }

    const cleanEmail = email.trim();
    if (cleanEmail.length > 255 || !EMAIL_REGEX.test(cleanEmail) || password.length > 128) {
      return res.status(400).json({ 
        success: false, 
        message: "Notoʻgʻri email yoki parol formati.",
        error: "Notoʻgʻri email yoki parol formati." 
      });
    }

    const user = storageService.authenticateUser(cleanEmail, password);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Email yoki parol notoʻgʻri.",
        error: "Email yoki parol notoʻgʻri." 
      });
    }

    // Generate signed stateless auth token
    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Tizimga muvaffaqiyatli kirildi.",
      data: {
        user,
        token
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Tizimga kirishda xatolik yuz berdi.",
      error: err.message || "Tizimga kirishda xatolik yuz berdi."
    });
  }
});

/**
 * GET /api/auth/me
 * Verifies current authentication token and returns user identity.
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: "Foydalanuvchi sessiyasi faol.",
    data: {
      user: req.user
    }
  });
});

/**
 * POST /api/auth/logout
 * Explicit logout endpoint: clears any potential cookies and confirms session termination.
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: "Tizimdan muvaffaqiyatli chiqildi."
  });
});

export default router;
