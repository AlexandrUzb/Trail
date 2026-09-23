import express from 'express';
import { storageService } from '../services/storageService.js';
import { getSupabaseServerClient } from '../services/supabaseClient.js';

const router = express.Router();
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Admin authorization middleware
function adminAuth(req, res, next) {
  const secret = process.env.ADMIN_API_KEY || 'advokatai_admin_secret_2025';
  const provided = req.headers['x-admin-key'] || req.query.admin_key;

  if (!provided || provided !== secret) {
    return res.status(401).json({ success: false, error: "Ruxsat etilmagan: Noto'g'ri admin kaliti." });
  }
  next();
}

router.use(adminAuth);

// GET /api/admin/users - list users and their usage
router.get('/users', async (req, res) => {
  try {
    const sb = getSupabaseServerClient();
    if (sb) {
      try {
        const { data: profiles, error } = await sb
          .from('profiles')
          .select('id, full_name, email, role, created_at, user_subscriptions(status, expires_at, plans(name, price_uzs, daily_question_limit))');

        if (!error && profiles && profiles.length > 0) {
          const enriched = profiles.map(p => {
            const activeSub = (p.user_subscriptions || []).find(s => s.status === 'active');
            const planName = activeSub?.plans?.name || 'Bepul';
            const dailyLimit = activeSub?.plans?.daily_question_limit || 5;
            return {
              id: p.id,
              name: p.full_name,
              email: p.email,
              role: p.role || 'user',
              plan: planName,
              planExpiresAt: activeSub?.expires_at,
              createdAt: p.created_at,
              usage: {
                dailyUsed: 0,
                monthlyUsed: 0,
                dailyLimit: dailyLimit,
              }
            };
          });
          return res.json({ success: true, count: enriched.length, data: enriched });
        }
      } catch (err) {
        console.warn('[AdminUsers] Supabase fetch fallback to local:', err.message);
      }
    }

    const users = storageService.getAllUsers();
    const enriched = users.map(u => ({
      ...u,
      usage: storageService.getUserUsage(u.id)
    }));
    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/payments - list all payment records
router.get('/payments', (req, res) => {
  try {
    const payments = storageService.getPayments();
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/payments/:id/verify - approve or reject payment
router.post('/payments/:id/verify', async (req, res) => {
  try {
    const { status } = req.body; // 'PAID' | 'REJECTED' | 'REFUNDED'
    if (!['PAID', 'REJECTED', 'REFUNDED'].includes(status)) {
      return res.status(400).json({ success: false, error: "Status noto'g'ri (PAID, REJECTED, REFUNDED)." });
    }

    const updated = storageService.verifyPayment(req.params.id, status, 'admin');
    if (!updated) {
      return res.status(404).json({ success: false, error: "To'lov arizasi topilmadi." });
    }

    // Sync to Supabase user_subscriptions and notifications
    const sb = getSupabaseServerClient();
    if (sb && updated.user_id && UUID_REGEX.test(updated.user_id)) {
      try {
        if (status === 'PAID') {
          // Find matching plan id in Supabase
          const { data: dbPlans } = await sb.from('plans').select('id, name').eq('is_active', true);
          let planUuid = null;
          if (dbPlans && dbPlans.length > 0) {
            const match = dbPlans.find(p => p.name.toLowerCase().includes(String(updated.plan_id || '').toLowerCase()));
            planUuid = match ? match.id : dbPlans[0].id;
          }

          if (planUuid) {
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            await sb.from('user_subscriptions').upsert({
              user_id: updated.user_id,
              plan_id: planUuid,
              status: 'active',
              started_at: new Date().toISOString(),
              expires_at: expiresAt,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
          }

          await sb.from('notifications').insert({
            user_id: updated.user_id,
            title: "To'lov tasdiqlandi",
            message: "Sizning to'lovingiz muvaffaqiyatli tasdiqlandi va obunangiz 30 kunga faollashtirildi.",
            type: 'payment_success',
            is_read: false
          });
        }
      } catch (sbErr) {
        console.warn('[AdminVerify] Supabase sync warning:', sbErr.message);
      }
    }

    res.json({
      success: true,
      message: `To'lov holati "${status}" ga o'zgartirildi.`,
      data: updated
    });
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

// GET /api/admin/settings
router.get('/settings', (req, res) => {
  try {
    const settings = storageService.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/settings - update payment card number, holder, etc.
router.post('/settings', (req, res) => {
  try {
    const updated = storageService.updateSettings(req.body);
    res.json({ success: true, message: "Sozlamalar yangilandi.", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/plans/:id - update plan prices or limits
router.post('/plans/:id', (req, res) => {
  try {
    const updated = storageService.updatePlan(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Reja topilmadi." });
    }
    res.json({ success: true, message: "Reja parametrlari yangilandi.", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
