import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getSupabaseServerClient } from '../services/supabaseClient.js';

const router = express.Router();
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/notifications - fetch current user's notifications
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const sb = getSupabaseServerClient();

    if (sb && UUID_REGEX.test(userId)) {
      const { data, error } = await sb
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return res.json({ success: true, count: data.length, data });
      }
    }

    return res.json({ success: true, count: 0, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/notifications/:id/read - mark notification as read
router.post('/:id/read', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const sb = getSupabaseServerClient();

    if (sb && UUID_REGEX.test(userId)) {
      await sb
        .from('notifications')
        .update({ is_read: true })
        .eq('id', req.params.id)
        .eq('user_id', userId);

      return res.json({ success: true, message: "Bildirishnoma o'qildi deb belgilandi." });
    }

    return res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
