import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getSupabaseServerClient } from './supabaseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveStoreDir() {
  const isServerless = Boolean(
    process.env.NETLIFY || 
    process.env.AWS_LAMBDA_FUNCTION_NAME || 
    process.env.LAMBDA_TASK_ROOT || 
    process.env.VERCEL ||
    process.env.NODE_ENV === 'production'
  );

  // If serverless or production, prefer os.tmpdir() which is guaranteed writable across all cloud environments
  if (isServerless) {
    const tmpDir = path.join(os.tmpdir(), 'advokatai_store');
    try {
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    } catch {}
    return tmpDir;
  }

  // Local development: check if server/data/store exists or is writable
  const localDir = path.resolve(__dirname, '../data/store');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return localDir;
  } catch {
    // If local dir fails (read-only filesystem), fallback to os.tmpdir()
    const tmpDir = path.join(os.tmpdir(), 'advokatai_store');
    try {
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    } catch {}
    return tmpDir;
  }
}

const STORE_DIR = resolveStoreDir();

const memoryStore = new Map();

// Ensure directory exists safely
try {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[StorageService] Operating with in-memory store fallback:', err.message);
}

function getFilePath(name) {
  return path.join(STORE_DIR, `${name}.json`);
}

function readJson(name, defaultValue) {
  if (memoryStore.has(name)) {
    return memoryStore.get(name);
  }
  const file = getFilePath(name);
  if (!fs.existsSync(file)) {
    writeJson(name, defaultValue);
    return defaultValue;
  }
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    const parsed = JSON.parse(raw);
    memoryStore.set(name, parsed);
    return parsed;
  } catch (e) {
    console.error(`[StorageService] Failed to parse ${name}.json:`, e.message);
    return defaultValue;
  }
}

function writeJson(name, data) {
  memoryStore.set(name, data);
  try {
    const file = getFilePath(name);
    const tempFile = `${file}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, file);
  } catch (err) {
    // In serverless / read-only filesystem environments, memoryStore will preserve state
  }
}

// Default Seed Data
const DEFAULT_PLANS = [
  {
    plan_id: 'free',
    name: 'Bepul',
    price: 0,
    currency: 'so\'m',
    daily_limit: 10,
    monthly_limit: 300,
    document_limit: 2,
    search_limit: 3,
    features: [
      { label: 'AdvokatAI Chatbot', sub: 'Kuniga 10 ta savol', on: true },
      { label: 'Rasmiy Qonunchilik Bazasi', sub: 'Kuniga 3 ta qidiruv', on: true },
      { label: 'Hujjat Shablonlari', sub: '2 ta hujjat yaratish', on: true },
      { label: 'O\'zbek tili va qidiruv', sub: 'Lotin va Kirill', on: true },
      { label: 'Maxsus yurist konsultatsiyasi', sub: '', on: false },
      { label: 'Cheksiz savollar', sub: '', on: false }
    ],
    active: true,
    duration: 'doim',
    popular: false
  },
  {
    plan_id: 'pro',
    name: 'Pro',
    price: 18000,
    currency: 'so\'m',
    daily_limit: 100,
    monthly_limit: 3000,
    document_limit: 10,
    search_limit: 30,
    features: [
      { label: 'AdvokatAI Chatbot', sub: 'Kuniga 100 ta savol', on: true },
      { label: 'Rasmiy Qonunchilik Bazasi', sub: 'Kuniga 30 ta qidiruv', on: true },
      { label: 'Hujjat Shablonlari', sub: '10 ta hujjat yaratish', on: true },
      { label: 'O\'zbek tili va qidiruv', sub: 'Yuqori tezlikda tahlil', on: true },
      { label: 'Ustuvor javob vaqti', sub: '2 soniyadan kam', on: true },
      { label: 'Cheksiz savollar', sub: '', on: false }
    ],
    active: true,
    duration: '30 kun',
    popular: true
  },
  {
    plan_id: 'premium',
    name: 'Premium',
    price: 30000,
    currency: 'so\'m',
    daily_limit: 999999,
    monthly_limit: 999999,
    document_limit: 100,
    search_limit: 999999,
    features: [
      { label: 'AdvokatAI Chatbot', sub: 'Cheksiz savollar', on: true },
      { label: 'Rasmiy Qonunchilik Bazasi', sub: 'Cheksiz qonun qidiruv', on: true },
      { label: 'Hujjat Shablonlari', sub: '100 ta hujjat yaratish', on: true },
      { label: 'O\'zbek tili va qidiruv', sub: 'Eng yuqori ustuvorlik', on: true },
      { label: 'Ustuvor javob vaqti', sub: '500ms dan kam', on: true },
      { label: 'Tezkor texnik ko\'mak', sub: '24/7', on: true }
    ],
    active: true,
    duration: '30 kun',
    popular: false
  }
];

class StorageService {
  constructor() {
    this.init();
  }

  init() {
    // Ensure default files
    if (!fs.existsSync(getFilePath('plans'))) writeJson('plans', DEFAULT_PLANS);
    if (!fs.existsSync(getFilePath('users'))) {
      const salt = 'advokatai_salt_2026';
      writeJson('users', [
        {
          id: 'admin_default',
          name: 'AdvokatAI Boshqaruvchi',
          email: 'admin@advokatai.uz',
          role: 'admin',
          plan_id: 'premium',
          password_hash: crypto.pbkdf2Sync('admin123', salt, 1000, 64, 'sha512').toString('hex'),
          created_at: new Date().toISOString()
        },
        {
          id: 'demo_user',
          name: 'Namuna Foydalanuvchi',
          email: 'user@advokatai.uz',
          role: 'user',
          plan_id: 'free',
          password_hash: crypto.pbkdf2Sync('user123', salt, 1000, 64, 'sha512').toString('hex'),
          created_at: new Date().toISOString()
        }
      ]);
    }
    if (!fs.existsSync(getFilePath('usage'))) writeJson('usage', {});
    if (!fs.existsSync(getFilePath('payments'))) writeJson('payments', []);
    if (!fs.existsSync(getFilePath('analytics'))) writeJson('analytics', []);
    if (!fs.existsSync(getFilePath('feedback'))) writeJson('feedback', []);
    if (!fs.existsSync(getFilePath('settings'))) {
      writeJson('settings', {
        payment_card_number: process.env.PAYMENT_CARD_NUMBER || 'YOUR_CARD_NUMBER',
        payment_card_holder: process.env.PAYMENT_CARD_HOLDER || 'AdvokatAI Rasmiy',
        payment_bank_name: process.env.PAYMENT_BANK_NAME || 'TBC / Milliy Bank',
        payment_instructions: "Kartaga to'lovni o'tkazing va to'lov kvitansiyasi (cheki) yoki tranzaksiya ID raqamini kiriting. Admin tasdiqlashi bilan obuna avtomatik faollashadi."
      });
    }
  }

  // --- PLANS ---
  getPlans() {
    return readJson('plans', DEFAULT_PLANS).filter(p => p.active !== false);
  }

  getPlanById(planId) {
    const plans = readJson('plans', DEFAULT_PLANS);
    return plans.find(p => p.plan_id === planId) || plans.find(p => p.plan_id === 'free') || DEFAULT_PLANS[0];
  }

  updatePlan(planId, updates) {
    const plans = readJson('plans', DEFAULT_PLANS);
    const idx = plans.findIndex(p => p.plan_id === planId);
    if (idx === -1) return null;
    plans[idx] = { ...plans[idx], ...updates };
    writeJson('plans', plans);
    return plans[idx];
  }

  // --- USERS & SUBSCRIPTIONS ---
  getUser(userId) {
    const users = readJson('users', []);
    let user = users.find(u => u.id === userId);
    if (!user) {
      // Ephemeral guest object for unauthenticated requests - NEVER persisted as a fake user
      return {
        id: userId || 'guest',
        email: null,
        name: null,
        role: 'guest',
        plan: 'free',
        plan_id: 'free',
        plan_expires_at: null,
        created_at: null
      };
    }

    // Check expiry
    if (user.plan_expires_at && new Date(user.plan_expires_at) < new Date()) {
      user.plan_id = 'free';
      user.plan_expires_at = null;
      writeJson('users', users);
    }

    return user;
  }

  updateUserPlan(userId, planId, durationDays = 30) {
    const users = readJson('users', []);
    const idx = users.findIndex(u => u.id === userId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    if (idx !== -1) {
      users[idx].plan_id = planId;
      users[idx].plan_expires_at = expiresAt.toISOString();
      writeJson('users', users);
      return users[idx];
    } else {
      const newUser = {
        id: userId,
        email: `${userId}@advokatai.uz`,
        role: 'user',
        plan_id: planId,
        plan_expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      writeJson('users', users);
      return newUser;
    }
  }

  getAllUsers() {
    return readJson('users', []);
  }

  // --- ATOMIC USAGE TRACKING ---
  checkAndConsumeQuota(userId) {
    const user = this.getUser(userId);
    const plan = this.getPlanById(user.plan_id);

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const dayKey = `${userId}_${today}`;
    const colonDayKey = `${userId}:${today}`;
    const monthKey = `${userId}_${now.toISOString().slice(0, 7)}`;

    const usageStore = readJson('usage', {});
    const dailyUsed = usageStore[dayKey] ?? usageStore[colonDayKey] ?? 0;
    const monthlyUsed = usageStore[monthKey] ?? usageStore[`${userId}:${now.toISOString().slice(0, 7)}`] ?? 0;

    const dailyLimit = plan.daily_limit ?? (plan.plan_id === 'premium' ? 999999 : plan.plan_id === 'pro' ? 100 : 10);
    const monthlyLimit = plan.monthly_limit ?? (plan.plan_id === 'premium' ? 999999 : plan.plan_id === 'pro' ? 3000 : 300);

    if (dailyLimit < 999999 && dailyUsed >= dailyLimit) {
      return {
        allowed: false,
        reason: 'daily_limit',
        message: `Bugungi savollar limitingiz (${dailyLimit} ta) tugadi. Ertaga davom ettirishingiz yoki rejangizni yangilashingiz mumkin.`,
        usage: {
          daily_used: dailyUsed,
          daily_limit: dailyLimit,
          monthly_used: monthlyUsed,
          monthly_limit: monthlyLimit,
          plan: plan.name
        }
      };
    }

    if (monthlyLimit < 999999 && monthlyUsed >= monthlyLimit) {
      return {
        allowed: false,
        reason: 'monthly_limit',
        message: "Ushbu oy uchun belgilangan so'rovlar limitingiz tugadi. Rejangizni yangilang.",
        usage: {
          daily_used: dailyUsed,
          daily_limit: dailyLimit,
          monthly_used: monthlyUsed,
          monthly_limit: monthlyLimit,
          plan: plan.name
        }
      };
    }

    // Atomic increment
    usageStore[dayKey] = dailyUsed + 1;
    usageStore[monthKey] = monthlyUsed + 1;
    writeJson('usage', usageStore);

    // Sync to Supabase public.ai_usage if userId is valid UUID
    try {
      const sb = getSupabaseServerClient();
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (sb && UUID_REGEX.test(userId)) {
        sb.rpc('increment_user_usage', { p_user_id: userId, p_usage_type: 'question' }).catch(() => {});
      }
    } catch {}

    return {
      allowed: true,
      usage: {
        daily_used: dailyUsed + 1,
        daily_limit: dailyLimit,
        monthly_used: monthlyUsed + 1,
        monthly_limit: monthlyLimit,
        plan: plan.name
      }
    };
  }

  checkAndConsumeDocumentQuota(userId) {
    const user = this.getUser(userId);
    const plan = this.getPlanById(user.plan_id);
    const docLimit = plan.document_limit ?? (plan.plan_id === 'premium' ? 100 : plan.plan_id === 'pro' ? 10 : 2);

    const now = new Date();
    const dayKey = `${userId}_doc_${now.toISOString().slice(0, 10)}`;
    const usageStore = readJson('usage', {});
    const docUsed = usageStore[dayKey] || 0;

    if (docUsed >= docLimit) {
      return {
        allowed: false,
        reason: 'document_limit',
        message: `Hujjat yaratish limitingiz (${docLimit} ta) tugadi. Ko'proq hujjatlar yaratish uchun rejangizni yangilang.`,
        usage: {
          used: docUsed,
          limit: docLimit,
          plan: plan.name
        }
      };
    }

    usageStore[dayKey] = docUsed + 1;
    writeJson('usage', usageStore);

    try {
      const sb = getSupabaseServerClient();
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (sb && UUID_REGEX.test(userId)) {
        sb.rpc('increment_user_usage', { p_user_id: userId, p_usage_type: 'document' }).catch(() => {});
      }
    } catch {}

    return {
      allowed: true,
      usage: {
        used: docUsed + 1,
        limit: docLimit,
        plan: plan.name
      }
    };
  }

  checkAndConsumeSearchQuota(userId) {
    const user = this.getUser(userId);
    const plan = this.getPlanById(user.plan_id);
    const searchLimit = plan.search_limit ?? (plan.plan_id === 'premium' ? 999999 : plan.plan_id === 'pro' ? 30 : 3);

    const now = new Date();
    const dayKey = `${userId}_search_${now.toISOString().slice(0, 10)}`;
    const usageStore = readJson('usage', {});
    const searchUsed = usageStore[dayKey] || 0;

    if (searchLimit < 999999 && searchUsed >= searchLimit) {
      return {
        allowed: false,
        reason: 'search_limit',
        message: `Kunlik qonun qidiruv limitingiz (${searchLimit} ta) tugadi. Ko'proq qidiruvlar uchun rejangizni yangilang.`,
        usage: {
          used: searchUsed,
          limit: searchLimit,
          plan: plan.name
        }
      };
    }

    usageStore[dayKey] = searchUsed + 1;
    writeJson('usage', usageStore);

    try {
      const sb = getSupabaseServerClient();
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (sb && UUID_REGEX.test(userId)) {
        sb.rpc('increment_user_usage', { p_user_id: userId, p_usage_type: 'search' }).catch(() => {});
      }
    } catch {}

    return {
      allowed: true,
      usage: {
        used: searchUsed + 1,
        limit: searchLimit,
        plan: plan.name
      }
    };
  }

  logLoginEvent({ userId, email, timestamp }) {
    try {
      const analytics = readJson('analytics', {});
      if (!analytics.logins) analytics.logins = [];
      analytics.logins.push({
        userId: userId || 'anonymous',
        email: email || null,
        timestamp: timestamp || new Date().toISOString()
      });
      // Keep last 1000 logins
      if (analytics.logins.length > 1000) {
        analytics.logins = analytics.logins.slice(-1000);
      }
      writeJson('analytics', analytics);
    } catch {}
  }

  getUserUsage(userId) {
    const user = this.getUser(userId);
    const plan = this.getPlanById(user.plan_id);
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const dayKey = `${userId}_${today}`;
    const docKey = `${userId}_doc_${today}`;
    const searchKey = `${userId}_search_${today}`;
    const monthKey = `${userId}_${now.toISOString().slice(0, 7)}`;

    const usageStore = readJson('usage', {});
    return {
      daily_used: usageStore[dayKey] ?? usageStore[`${userId}:${today}`] ?? 0,
      daily_limit: plan.daily_limit ?? (plan.plan_id === 'premium' ? 999999 : plan.plan_id === 'pro' ? 100 : 10),
      document_used: usageStore[docKey] || 0,
      document_limit: plan.document_limit ?? (plan.plan_id === 'premium' ? 100 : plan.plan_id === 'pro' ? 10 : 2),
      search_used: usageStore[searchKey] || 0,
      search_limit: plan.search_limit ?? (plan.plan_id === 'premium' ? 999999 : plan.plan_id === 'pro' ? 30 : 3),
      monthly_used: usageStore[monthKey] ?? usageStore[`${userId}:${now.toISOString().slice(0, 7)}`] ?? 0,
      monthly_limit: plan.monthly_limit ?? (plan.plan_id === 'premium' ? 999999 : plan.plan_id === 'pro' ? 3000 : 300),
      plan: plan.name,
      plan_id: plan.plan_id,
      expires_at: user.plan_expires_at
    };
  }


  // --- PAYMENTS ---
  createPayment({ userId, planId, amount, currency = 'so\'m', paymentMethod = 'card', transactionReference, payerName }) {
    const payments = readJson('payments', []);
    const plan = this.getPlanById(planId);
    const newPayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      user_id: userId,
      plan_id: planId,
      plan_name: plan.name,
      amount: amount || plan.price,
      currency,
      payment_method: paymentMethod,
      transaction_reference: transactionReference || 'Noma\'lum',
      payer_name: payerName || 'Foydalanuvchi',
      status: 'PENDING', // PENDING | PAID | REJECTED | REFUNDED
      created_at: new Date().toISOString(),
      verified_at: null,
      verified_by: null
    };

    payments.unshift(newPayment);
    writeJson('payments', payments);

    return newPayment;
  }

  verifyPayment(paymentId, status, verifiedBy = 'admin') {
    const payments = readJson('payments', []);
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return null;

    payment.status = status; // PAID | REJECTED | REFUNDED
    payment.verified_at = new Date().toISOString();
    payment.verified_by = verifiedBy;

    if (status === 'PAID') {
      this.updateUserPlan(payment.user_id, payment.plan_id, 30);
    }

    writeJson('payments', payments);

    return payment;
  }

  getPayments(userId = null) {
    const payments = readJson('payments', []);
    if (userId) return payments.filter(p => p.user_id === userId);
    return payments;
  }

  // --- ANALYTICS & AUDIT LOGGING ---
  logQuery(record) {
    const analytics = readJson('analytics', []);
    const entry = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      compositeConfidence: record.compositeConfidence || {
        score: record.confidence || 0,
        level: record.confidenceLevel || 'LOW',
        breakdown: null
      },
      fallbackUsed: record.fallbackUsed || { used: false, type: 'none' },
      safetyInterception: record.safetyInterception || { intercepted: false, reason: null },
      contradictionDetected: Boolean(record.contradictionDetected),
      ...record
    };
    analytics.unshift(entry);
    if (analytics.length > 1000) analytics.length = 1000;
    writeJson('analytics', analytics);
    return entry;
  }

  getAnalyticsSummary() {
    const analytics = readJson('analytics', []);
    const total = analytics.length;
    const intents = {};
    let lowConfidenceCount = 0;
    let clarificationCount = 0;
    let errorsCount = 0;
    let totalLatency = 0;
    let safetyInterceptionsCount = 0;
    let contradictionsCount = 0;

    for (const a of analytics) {
      intents[a.intent] = (intents[a.intent] || 0) + 1;
      const conf = a.compositeConfidence?.score ?? a.confidence ?? 0;
      if (conf < 45 && a.intent === 'LEGAL') lowConfidenceCount++;
      if (a.needsClarification) clarificationCount++;
      if (a.isError) errorsCount++;
      if (a.latencyMs) totalLatency += a.latencyMs;
      if (a.safetyInterception?.intercepted) safetyInterceptionsCount++;
      if (a.contradictionDetected) contradictionsCount++;
    }

    const lowConfidenceQueries = analytics
      .filter(a => (a.intent === 'LEGAL' || a.intent === 'NON_EXISTENT_ARTICLE') && ((a.compositeConfidence?.score ?? a.confidence) < 45 || a.retrievedCount === 0))
      .slice(0, 25);

    return {
      totalQueries: total,
      intentsBreakdown: intents,
      safetyInterceptionsCount,
      contradictionsCount,
      lowConfidenceCount,
      clarificationCount,
      errorsCount,
      avgLatencyMs: total > 0 ? Math.round(totalLatency / total) : 0,
      recentLowConfidenceQueries: lowConfidenceQueries
    };
  }

  // --- USER FEEDBACK ---
  saveFeedback({ queryId, rating, reason, comment, userId = null }) {
    const feedback = readJson('feedback', []);
    const entry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      query_id: queryId,
      user_id: userId,
      rating, // 'positive' | 'negative' or 1-5
      reason: reason || null,
      comment: comment || null,
      created_at: new Date().toISOString()
    };
    feedback.unshift(entry);
    if (feedback.length > 1000) feedback.length = 1000;
    writeJson('feedback', feedback);

    // Sync to Supabase PostgreSQL public.feedback matching SOURCE OF TRUTH schema
    try {
      const sb = getSupabaseServerClient();
      if (sb) {
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const validUserId = (userId && UUID_REGEX.test(userId)) ? userId : null;
        const numericRating = typeof rating === 'number' 
          ? Math.max(1, Math.min(5, Math.round(rating)))
          : (rating === 'positive' ? 5 : 1);
        const combinedComment = [reason, comment].filter(Boolean).join(' - ') || null;

        sb.from('feedback').insert({
          user_id: validUserId,
          rating: numericRating,
          comment: combinedComment,
          status: 'new'
        }).then(() => {}).catch(() => {});
      }
    } catch {}

    return entry;
  }

  getFeedbackStats() {
    const feedback = readJson('feedback', []);
    const positive = feedback.filter(f => f.rating === 'positive' || f.rating >= 4).length;
    const negative = feedback.filter(f => f.rating === 'negative' || (typeof f.rating === 'number' && f.rating < 4)).length;
    const reasons = {};

    for (const f of feedback) {
      if (f.reason) {
        reasons[f.reason] = (reasons[f.reason] || 0) + 1;
      }
    }

    return {
      total: feedback.length,
      positive,
      negative,
      satisfactionRate: feedback.length > 0 ? Math.round((positive / feedback.length) * 100) : 100,
      negativeReasonsBreakdown: reasons,
      recentFeedback: feedback.slice(0, 30)
    };
  }

  // --- SETTINGS ---
  getSettings() {
    return readJson('settings', {
      payment_card_number: process.env.PAYMENT_CARD_NUMBER || 'YOUR_CARD_NUMBER',
      payment_card_holder: process.env.PAYMENT_CARD_HOLDER || 'AdvokatAI Rasmiy',
      payment_bank_name: process.env.PAYMENT_BANK_NAME || 'TBC / Milliy Bank',
      payment_instructions: "Kartaga to'lovni o'tkazing va to'lov kvitansiyasi (cheki) yoki tranzaksiya ID raqamini kiriting."
    });
  }

  updateSettings(updates) {
    const settings = this.getSettings();
    const updated = { ...settings, ...updates };
    writeJson('settings', updated);
    return updated;
  }

  // --- USERS & AUTHENTICATION ---
  createUser({ id, name, email, password, plan = 'free' }) {
    const users = readJson('users', []);
    const cleanEmail = (email || '').trim().toLowerCase();
    const existing = users.find(u => u.email === cleanEmail);
    if (existing) {
      const err = new Error("Bu email manzili bilan hisob allaqachon ro'yxatdan o'tgan.");
      err.statusCode = 409;
      throw err;
    }
    const salt = 'advokatai_salt_2026';
    const passwordHash = password ? crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex') : '';
    const user = {
      id: id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name?.trim() || 'Foydalanuvchi',
      email: cleanEmail,
      password_hash: passwordHash,
      plan: plan,
      created_at: new Date().toISOString()
    };
    users.push(user);
    writeJson('users', users);

    // Sync to Supabase PostgreSQL public.profiles (SOURCE OF TRUTH)
    try {
      const sb = getSupabaseServerClient();
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (sb && UUID_REGEX.test(user.id)) {
        sb.from('profiles').upsert({
          id: user.id,
          full_name: user.name,
          email: user.email,
          role: 'user',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' }).then(() => {}).catch(() => {});
      }
    } catch {}

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  findUserById(id) {
    const users = readJson('users', []);
    const user = users.find(u => u.id === id);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  findUserByEmail(email) {
    const users = readJson('users', []);
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = users.find(u => u.email === cleanEmail);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  // --- TEMPLATE ACTIONS & EDITS PERSISTENCE ---
  recordTemplateAction(userId, templateId, actionType, meta = {}) {
    const actions = readJson('template_actions', []);
    const record = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      template_id: templateId,
      action_type: actionType, // 'download' | 'copy' | 'edit' | 'export'
      meta,
      timestamp: new Date().toISOString()
    };
    actions.unshift(record);
    if (actions.length > 500) actions.length = 500;
    writeJson('template_actions', actions);

    return record;
  }

  saveUserTemplateEdit(userId, templateId, formData = {}) {
    const userTemplates = readJson('user_templates', []);
    const existingIndex = userTemplates.findIndex(t => t.user_id === userId && String(t.template_id) === String(templateId));
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      userTemplates[existingIndex].form_data = formData;
      userTemplates[existingIndex].updated_at = now;
      writeJson('user_templates', userTemplates);
      return userTemplates[existingIndex];
    } else {
      const entry = {
        id: `ut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        user_id: userId,
        template_id: templateId,
        form_data: formData,
        created_at: now,
        updated_at: now
      };
      userTemplates.push(entry);
      writeJson('user_templates', userTemplates);
      return entry;
    }
  }

  authenticateUser(email, password) {
    const users = readJson('users', []);
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = users.find(u => u.email === cleanEmail);
    if (!user) return null;
    const salt = 'advokatai_salt_2026';
    const computedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    if (user.password_hash !== computedHash) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  findOrCreateGoogleUser({ email, name, avatarUrl }) {
    const users = readJson('users', []);
    const cleanEmail = (email || '').trim().toLowerCase();
    let user = users.find(u => u.email === cleanEmail);
    if (!user) {
      user = {
        id: `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: name?.trim() || cleanEmail.split('@')[0] || 'Google Foydalanuvchisi',
        email: cleanEmail,
        avatar_url: avatarUrl || null,
        provider: 'google',
        authProvider: 'google',
        plan: 'free',
        created_at: new Date().toISOString()
      };
      users.push(user);
      writeJson('users', users);
    } else {
      let updated = false;
      if (name && user.name !== name) {
        user.name = name.trim();
        updated = true;
      }
      if (avatarUrl && user.avatar_url !== avatarUrl) {
        user.avatar_url = avatarUrl;
        updated = true;
      }
      if (!user.authProvider) {
        user.authProvider = 'google';
        updated = true;
      }
      if (updated) {
        writeJson('users', users);
      }
    }
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}

export const storageService = new StorageService();
export default storageService;
