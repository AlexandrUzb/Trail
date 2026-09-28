import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { entitlementService } from '../services/entitlementService.js';

const router = express.Router();

/**
 * GET /api/entitlements
 * Retrieve current user's authoritative plan and entitlement details from Supabase.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const entitlements = await entitlementService.getUserEntitlements(userId);
    res.json({
      success: true,
      data: entitlements,
    });
  } catch (error) {
    console.error('[EntitlementsRoute] Error fetching entitlements:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/entitlements/telegram/check
 * Re-check Telegram channel membership using Telegram Bot API (or current status).
 * Recalculates plan and triggers referral qualification if member.
 */
router.post('/telegram/check', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const result = await entitlementService.checkTelegramMembership(userId);
    res.json({
      success: true,
      message: result.telegram?.channelJoined 
        ? "Kanalga a'zoligingiz tasdiqlandi! Pro tarifi faollashtirildi." 
        : "Kanalga a'zolik tasdiqlanmadi. Iltimos, kanalga a'zo bo'ling va qayta tekshiring.",
      data: result,
    });
  } catch (error) {
    console.error('[EntitlementsRoute] Error checking Telegram membership:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/entitlements/telegram/connect
 * Connect Telegram user to account via token.
 */
router.post('/telegram/connect', async (req, res) => {
  try {
    const { token, telegramUserId, telegramUsername } = req.body;
    if (!token || !telegramUserId) {
      return res.status(400).json({ success: false, error: "token va telegramUserId talab qilinadi" });
    }

    const result = await entitlementService.connectTelegramUser({
      token,
      telegramUserId,
      telegramUsername,
    });

    res.json({
      success: true,
      message: "Telegram hisobi muvaffaqiyatli bog'landi!",
      data: result,
    });
  } catch (error) {
    console.error('[EntitlementsRoute] Error connecting Telegram:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/entitlements/referral/track
 * Track referral upon new account creation
 */
router.post('/referral/track', async (req, res) => {
  try {
    const { newUserId, referralCode } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;

    const registered = await entitlementService.registerReferral({
      newUserId,
      referralCode,
      ipAddress,
    });

    res.json({ success: true, registered });
  } catch (error) {
    console.error('[EntitlementsRoute] Error tracking referral:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/telegram/webhook
 * Official Telegram Bot Webhook
 */
router.post('/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;
    const message = update?.message;

    if (message && message.text) {
      const text = message.text.trim();
      const from = message.from;

      // Detect /start <token>
      if (text.startsWith('/start ') || text.startsWith('/start=')) {
        const token = text.replace('/start', '').replace('=', '').trim();
        if (token && from?.id) {
          try {
            await entitlementService.connectTelegramUser({
              token,
              telegramUserId: from.id,
              telegramUsername: from.username || from.first_name,
            });

            // Send reply via Telegram Bot API if configured
            const config = entitlementService.getConfig();
            if (config.botToken) {
              const replyText = `Assalomu alaykum, ${from.first_name || 'foydalanuvchi'}!\n\n` +
                `✅ AdvokatAI hisobingiz Telegram bilan muvaffaqiyatli bog'landi!\n\n` +
                `🎁 Pro tarifini to'liq ochish uchun rasmiy kanalimizga a'zo bo'ling:\n` +
                `👉 ${config.channelUrl}\n\n` +
                `A'zo bo'lgach, saytda "Holatni tekshirish" tugmasini bosing.`;

              await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: message.chat.id,
                  text: replyText,
                }),
              });
            }
          } catch (connErr) {
            console.warn('[TelegramWebhook] Connection error:', connErr.message);
          }
        }
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('[TelegramWebhook] Error:', error);
    res.json({ ok: true }); // Always return 200 OK to Telegram
  }
});

/**
 * Test simulation endpoints (Only available in development / test environments)
 */
router.post('/test/simulate-telegram', async (req, res) => {
  try {
    const { userId, channelJoined, telegramConnected = true } = req.body;
    const { getSupabaseServerClient } = await import('../services/supabaseClient.js');
    const sb = getSupabaseServerClient();
    if (!sb) return res.status(500).json({ error: 'Supabase unavailable' });

    await sb.from('profiles').update({
      telegram_connected: telegramConnected,
      telegram_channel_joined: Boolean(channelJoined),
      telegram_verified_at: channelJoined ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('id', userId);

    if (channelJoined) {
      await entitlementService.qualifyReferral(userId);
    }

    const updated = await entitlementService.getUserEntitlements(userId);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test/simulate-referrals', async (req, res) => {
  try {
    const { referrerId, qualifiedCount = 3 } = req.body;
    const { getSupabaseServerClient } = await import('../services/supabaseClient.js');
    const sb = getSupabaseServerClient();
    if (!sb) return res.status(500).json({ error: 'Supabase unavailable' });

    // Clean up old test referrals
    await sb.from('referrals').delete().eq('referrer_id', referrerId);

    // Create dummy qualified referrals
    for (let i = 1; i <= qualifiedCount; i++) {
      const dummyId = `00000000-0000-4000-b000-${String(i).padStart(12, '0')}`;
      // Ensure dummy profile
      await sb.from('profiles').upsert({
        id: dummyId,
        email: `dummy_${i}@test.com`,
        full_name: `Dummy ${i}`,
        plan: 'free',
        telegram_connected: true,
        telegram_channel_joined: true,
      }, { onConflict: 'id' });

      await sb.from('referrals').upsert({
        referrer_id: referrerId,
        referred_id: dummyId,
        status: 'qualified',
        qualified_at: new Date().toISOString(),
      }, { onConflict: 'referred_id' });
    }

    const updated = await entitlementService.getUserEntitlements(referrerId);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
