import express from 'express';
import { storageService } from '../services/storageService.js';
import { getSupabaseServerClient, verifySupabaseToken } from '../services/supabaseClient.js';

const router = express.Router();
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Admin authorization middleware supporting both x-admin-key and Supabase profiles.role === 'admin'
async function adminAuth(req, res, next) {
  const secret = process.env.ADMIN_API_KEY || 'advokatai_admin_secret_2025';
  const provided = req.headers['x-admin-key'] || req.query.admin_key;

  if (provided && provided === secret) {
    return next();
  }

  // Support Supabase Auth token if the profile has admin role
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const sbResult = await verifySupabaseToken(token);
    if (sbResult.valid && sbResult.user && sbResult.user.role === 'admin') {
      req.user = sbResult.user;
      return next();
    }
  }

  return res.status(401).json({ success: false, error: "Ruxsat etilmagan: Noto'g'ri admin kaliti yoki admin huquqi talab qilinadi." });
}

router.use(adminAuth);

// GET /api/admin/users - list users from Supabase
router.get('/users', async (req, res) => {
  try {
    const sb = getSupabaseServerClient();
    if (sb) {
      try {
        const { data: profiles, error } = await sb
          .from('profiles')
          .select('id, full_name, email, role, created_at')
          .order('created_at', { ascending: false });

        if (!error && profiles) {
          const enriched = profiles.map(p => ({
            id: p.id,
            name: p.full_name,
            email: p.email,
            role: p.role || 'user',
            createdAt: p.created_at,
          }));
          return res.json({ success: true, count: enriched.length, data: enriched });
        }
      } catch (err) {
        console.warn('[AdminUsers] Supabase fetch warning:', err.message);
      }
    }

    const users = storageService.getAllUsers().map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'user',
      createdAt: u.created_at,
    }));
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/analytics - AI quality, latency, low-confidence queries
router.get('/analytics', async (req, res) => {
  try {
    const summary = storageService.getAnalyticsSummary();
    let feedback = storageService.getFeedbackStats();

    const sb = getSupabaseServerClient();
    if (sb) {
      try {
        const { data: dbFeedback } = await sb.from('feedback').select('*').order('created_at', { ascending: false });
        if (dbFeedback && dbFeedback.length > 0) {
          const positive = dbFeedback.filter(f => f.rating >= 4).length;
          const negative = dbFeedback.filter(f => f.rating <= 2).length;
          const satisfactionRate = Math.round((positive / dbFeedback.length) * 100);
          feedback = {
            total: dbFeedback.length,
            positive,
            negative,
            satisfactionRate,
            recent: dbFeedback.slice(0, 10)
          };
        }
      } catch (err) {
        console.warn('[AdminAnalytics] Feedback sync warning:', err.message);
      }
    }

    res.json({
      success: true,
      data: {
        analytics: summary,
        feedback
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
