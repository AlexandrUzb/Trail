import express from 'express';
import { storageService } from '../services/storageService.js';
import { getSupabaseServerClient } from '../services/supabaseClient.js';

const router = express.Router();

// GET /api/payments/config - get public payment instructions and placeholder card
router.get('/config', (req, res) => {
  try {
    const settings = storageService.getSettings();
    res.json({
      success: true,
      data: {
        cardNumber: settings.payment_card_number,
        cardHolder: settings.payment_card_holder,
        bankName: settings.payment_bank_name,
        instructions: settings.payment_instructions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/payments/submit - user submits manual payment with transaction receipt
router.post('/submit', async (req, res) => {
  try {
    const { userId, planId, transactionReference, payerName } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({ success: false, error: "userId va planId kiritilishi shart." });
    }

    const VALID_PAID_PLANS = ['pro', 'premium'];
    if (!VALID_PAID_PLANS.includes(planId)) {
      return res.status(400).json({
        success: false,
        error: "Noto'g'ri yoki mavjud bo'lmagan obuna tarifi tanlandi (faqat Pro va Premium)."
      });
    }

    // 1. Strict Payer Name validation (Mandatory full name, 2+ words, letters only)
    if (!payerName || typeof payerName !== 'string' || !payerName.trim()) {
      return res.status(400).json({
        success: false,
        error: "Toʻlovchi ismi-sharifi kiritilishi shart."
      });
    }

    const cleanName = payerName.trim();
    const nameWords = cleanName.split(/\s+/).filter(Boolean);
    const validNameRegex = /^[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ\s'-]{4,60}$/u;

    if (nameWords.length < 2 || !validNameRegex.test(cleanName) || /\d/.test(cleanName)) {
      return res.status(400).json({
        success: false,
        error: "Iltimos, haqiqiy ism va familiyangizni toʻliq kiriting (masalan: Ali Valiyev). Raqamlar va ramzlar qabul qilinmaydi."
      });
    }

    // 2. Strict Transaction ID validation (Reject date/time patterns, require valid ID)
    if (!transactionReference || typeof transactionReference !== 'string' || !transactionReference.trim()) {
      return res.status(400).json({
        success: false,
        error: "Tranzaksiya ID raqami kiritilishi shart."
      });
    }

    const cleanTxRef = transactionReference.trim();

    // Check for date/time mentions
    const dateTimeKeywordsRegex = /(soat|vaqt|kecha|bugun|ertaga|kun|oyda|yilda|otkazdim|o'tkazdim|o‘tkazdim|tashladim|tolandi|to'landi|\b\d{1,2}[:.]\d{2}\b|\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b)/i;
    if (dateTimeKeywordsRegex.test(cleanTxRef)) {
      return res.status(400).json({
        success: false,
        error: "Sana yoki vaqtni matn koʻrinishida kiritish qabul qilinmaydi. Faqat chekdagi rasmiy Tranzaksiya ID raqamini kiriting (masalan: 38472910593 yoki PAYME-98234120)."
      });
    }

    // Require valid transaction ID format (alphanumeric, dash, underscore, 6-40 chars)
    const validTxIdRegex = /^[A-Za-z0-9_-]{6,40}$/;
    if (!validTxIdRegex.test(cleanTxRef)) {
      return res.status(400).json({
        success: false,
        error: "Tranzaksiya ID formati notoʻgʻri. Faqat toʻlov ilovasi (Payme, Click, Uzum) chekidagi 6 tadan 40 tagacha belgidan iborat rasmiy ID raqamini kiriting."
      });
    }

    const payment = storageService.createPayment({
      userId,
      planId,
      transactionReference: cleanTxRef,
      payerName: cleanName
    });

    // Instant plan activation upon submitting valid receipt details
    payment.status = 'PAID';
    payment.verified_at = new Date().toISOString();
    payment.verified_by = 'system_instant_activation';
    const updatedUser = storageService.updateUserPlan(userId, planId, 30);

    // Sync active subscription to Supabase public.user_subscriptions (SOURCE OF TRUTH)
    try {
      const sb = getSupabaseServerClient();
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (sb && UUID_REGEX.test(userId)) {
        let targetPlanUuid = UUID_REGEX.test(planId) ? planId : null;
        if (!targetPlanUuid) {
          const { data: matchedPlans } = await sb.from('plans').select('id, duration_days').ilike('name', `%${planId}%`).limit(1);
          if (matchedPlans && matchedPlans.length > 0) {
            targetPlanUuid = matchedPlans[0].id;
          }
        }
        if (targetPlanUuid) {
          const nowIso = new Date().toISOString();
          const expiresIso = new Date(Date.now() + 30 * 86400000).toISOString();
          await sb.from('user_subscriptions').insert({
            user_id: userId,
            plan_id: targetPlanUuid,
            status: 'active',
            started_at: nowIso,
            expires_at: expiresIso
          });
        }
      }
    } catch (e) {
      console.warn('[Payments] Supabase subscription sync notice:', e.message);
    }

    res.json({
      success: true,
      message: "Toʻlov muvaffaqiyatli qabul qilindi va tarifingiz darhol faollashtirildi! AI Maslahatdan toʻliq foydalanishingiz mumkin.",
      data: {
        payment,
        user: updatedUser,
        planId: planId,
        activated: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/payments/status/:userId - get user's active plan status
router.get('/status/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = storageService.getUser(userId);
    const plan = storageService.getPlanById(user.plan_id);
    const usage = storageService.getUserUsage(userId);
    res.json({
      success: true,
      data: {
        userId,
        planId: user.plan_id,
        planName: plan.name,
        expiresAt: user.plan_expires_at,
        usage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/payments/my - get user's payments
router.get('/my', (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, error: "userId parametri kerak." });
    }

    const payments = storageService.getPayments(userId);
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
