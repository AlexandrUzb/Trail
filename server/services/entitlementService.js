import crypto from 'crypto';
import { getSupabaseServerClient } from './supabaseClient.js';

export const LIMITS_CONFIG = {
  free: {
    plan: 'free',
    name: 'Bepul',
    dailyQuestionLimit: 10,
    documentLimit: 2,
    searchLimit: 3,
    canCopy: false,
    canDownload: false,
    canEdit: false,
  },
  pro: {
    plan: 'pro',
    name: 'Pro',
    dailyQuestionLimit: 100,
    documentLimit: 10,
    searchLimit: 30,
    canCopy: true,
    canDownload: true,
    canEdit: true,
  },
  premium: {
    plan: 'premium',
    name: 'Premium',
    dailyQuestionLimit: 999999,
    documentLimit: 100,
    searchLimit: 999999,
    canCopy: true,
    canDownload: true,
    canEdit: true,
  },
};

class EntitlementService {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.botUsername = process.env.TELEGRAM_BOT_USERNAME || 'advokataibot';
    this.channelId = process.env.TELEGRAM_CHANNEL_ID || '@advokatai';
    this.channelUrl = process.env.TELEGRAM_CHANNEL_URL || 'https://t.me/advokatai';
  }

  getConfig() {
    return {
      botToken: process.env.TELEGRAM_BOT_TOKEN || this.botToken,
      botUsername: process.env.TELEGRAM_BOT_USERNAME || this.botUsername,
      channelId: process.env.TELEGRAM_CHANNEL_ID || this.channelId,
      channelUrl: process.env.TELEGRAM_CHANNEL_URL || this.channelUrl,
      isConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    };
  }

  /**
   * Calculate plan strictly from verified Supabase data:
   * 1. 3+ qualified referrals => 'premium'
   * 2. Telegram connected AND channel joined => 'pro'
   * 3. Otherwise => 'free'
   */
  calculatePlan({ referralCount = 0, telegramConnected = false, telegramChannelJoined = false }) {
    if (Number(referralCount) >= 3) {
      return 'premium';
    }
    if (Boolean(telegramConnected) && Boolean(telegramChannelJoined)) {
      return 'pro';
    }
    return 'free';
  }

  /**
   * Authoritative entitlement fetch and sync for user
   */
  async getUserEntitlements(userId) {
    if (!userId) throw new Error('userId talab qilinadi');

    const sb = getSupabaseServerClient();
    if (!sb) throw new Error('Supabase ulanishi mavjud emas');

    // 1. Fetch user profile
    let { data: profile, error } = await sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) {
      console.warn(`[Entitlements] Profile not found for ${userId}, ensuring row exists`);
      // Auto-create profile if missing
      await sb.from('profiles').upsert({
        id: userId,
        plan: 'free',
        referral_code: this.generateReferralCode(userId),
        referral_count: 0,
      }, { onConflict: 'id' });

      const retry = await sb.from('profiles').select('*').eq('id', userId).single();
      profile = retry.data;
    }

    // 2. Ensure referral code exists
    if (!profile.referral_code) {
      const code = this.generateReferralCode(userId);
      await sb.from('profiles').update({ referral_code: code }).eq('id', userId);
      profile.referral_code = code;
    }

    // 3. Ensure telegram verification token exists
    if (!profile.telegram_token) {
      const token = 'tg_' + crypto.randomBytes(12).toString('hex');
      await sb.from('profiles').update({ telegram_token: token }).eq('id', userId);
      profile.telegram_token = token;
    }

    // 4. Calculate actual qualified referrals count from referrals table
    const { count: qualifiedCount } = await sb
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .eq('status', 'qualified');

    const realReferralCount = qualifiedCount !== null ? qualifiedCount : (profile.referral_count || 0);

    // 5. Determine plan: profiles.plan in Supabase is the authoritative source of truth
    const profilePlan = (profile.plan || 'free').toLowerCase();
    let calculatedPlan = profilePlan;
    if (!['free', 'pro', 'premium'].includes(calculatedPlan)) {
      calculatedPlan = 'free';
    }

    // 6. Keep profile in sync if plan format was normalized
    if (profile.plan !== calculatedPlan) {
      await sb.from('profiles').update({
        plan: calculatedPlan,
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
      profile.plan = calculatedPlan;
    }

    // 7. Keep public.subscriptions and public.user_subscriptions in sync
    await this.syncSubscriptions(sb, userId, calculatedPlan);

    const limits = LIMITS_CONFIG[calculatedPlan] || LIMITS_CONFIG.free;
    const config = this.getConfig();

    return {
      userId,
      plan: calculatedPlan,
      planName: limits.name,
      limits,
      telegram: {
        connected: Boolean(profile.telegram_connected),
        channelJoined: Boolean(profile.telegram_channel_joined),
        username: profile.telegram_username || null,
        verificationToken: profile.telegram_token,
        botUsername: config.botUsername,
        botUrl: `https://t.me/${config.botUsername}?start=${profile.telegram_token}`,
        channelUrl: config.channelUrl,
      },
      referral: {
        code: profile.referral_code,
        count: realReferralCount,
        target: 3,
        remaining: Math.max(0, 3 - realReferralCount),
        unlocked: realReferralCount >= 3,
        link: `${process.env.FRONTEND_URL || ''}/register?ref=${profile.referral_code}`,
      },
    };
  }

  /**
   * Sync active subscriptions in Supabase
   */
  async syncSubscriptions(sb, userId, plan) {
    try {
      const nowIso = new Date().toISOString();
      const expiresIso = new Date(Date.now() + 365 * 86400000).toISOString();

      // public.subscriptions
      await sb.from('subscriptions').upsert({
        user_id: userId,
        plan: plan,
        status: 'active',
        started_at: nowIso,
        expires_at: expiresIso,
        updated_at: nowIso,
      }, { onConflict: 'user_id' });

      // public.user_subscriptions matching public.plans
      const { data: dbPlans } = await sb.from('plans').select('id, name');
      if (dbPlans && dbPlans.length > 0) {
        const matched = dbPlans.find(p => p.name.toLowerCase().includes(plan)) || dbPlans[0];
        if (matched) {
          await sb.from('user_subscriptions').upsert({
            user_id: userId,
            plan_id: matched.id,
            status: 'active',
            started_at: nowIso,
            expires_at: expiresIso,
            updated_at: nowIso,
          }, { onConflict: 'user_id' });
        }
      }
    } catch (err) {
      console.warn('[EntitlementService] Subscription sync warning:', err.message);
    }
  }

  /**
   * Check Telegram channel membership in real-time
   */
  async checkTelegramMembership(userId) {
    const sb = getSupabaseServerClient();
    if (!sb) throw new Error('Supabase client mavjud emas');

    const { data: profile, error } = await sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) throw new Error('Foydalanuvchi profili topilmadi');

    if (!profile.telegram_connected || !profile.telegram_user_id) {
      return {
        success: false,
        connected: false,
        channelJoined: false,
        message: "Avval Telegram hisobingizni bot orqali bog'lang.",
      };
    }

    const config = this.getConfig();
    let isMember = false;

    if (config.botToken) {
      // Call Telegram getChatMember API
      try {
        const url = `https://api.telegram.org/bot${config.botToken}/getChatMember?chat_id=${encodeURIComponent(config.channelId)}&user_id=${profile.telegram_user_id}`;
        const tgRes = await fetch(url);
        const tgJson = await tgRes.json();

        if (tgJson.ok && tgJson.result) {
          const status = tgJson.result.status;
          // Valid membership statuses in Telegram
          isMember = ['creator', 'administrator', 'member', 'restricted'].includes(status);
        } else {
          console.warn('[TelegramCheck] Telegram API returned non-ok:', tgJson);
          isMember = false;
        }
      } catch (tgErr) {
        console.error('[TelegramCheck] Error querying Telegram API:', tgErr);
        isMember = false;
      }
    } else {
      // Fallback / mock mode if bot token is not configured
      console.warn('[TelegramCheck] TELEGRAM_BOT_TOKEN not configured in env, using current channel status');
      isMember = Boolean(profile.telegram_channel_joined);
    }

    const nowIso = new Date().toISOString();
    // Update channel joined status in Supabase
    await sb.from('profiles').update({
      telegram_channel_joined: isMember,
      telegram_verified_at: isMember ? nowIso : null,
      updated_at: nowIso,
    }).eq('id', userId);

    // If verified and this user was referred by someone, qualify the referral!
    if (isMember) {
      await this.qualifyReferral(userId);
    }

    // Refresh and return full updated entitlements
    return await this.getUserEntitlements(userId);
  }

  /**
   * Link Telegram user to website user using secure token
   */
  async connectTelegramUser({ token, telegramUserId, telegramUsername }) {
    if (!token || !telegramUserId) {
      throw new Error('token va telegramUserId talab qilinadi');
    }

    const sb = getSupabaseServerClient();
    if (!sb) throw new Error('Supabase client mavjud emas');

    // Find profile by verification token
    const { data: profile, error } = await sb
      .from('profiles')
      .select('id, full_name, email')
      .eq('telegram_token', token)
      .maybeSingle();

    if (error || !profile) {
      throw new Error("Yaroqsiz yoki eskirgan Telegram bog'lash tokeni");
    }

    const nowIso = new Date().toISOString();

    // Update profile with connected Telegram data
    await sb.from('profiles').update({
      telegram_connected: true,
      telegram_user_id: telegramUserId,
      telegram_username: telegramUsername || null,
      telegram_connected_at: nowIso,
      updated_at: nowIso,
    }).eq('id', profile.id);

    console.log(`[Entitlements] Connected Telegram for user ${profile.id}: TG ID ${telegramUserId}, @${telegramUsername}`);

    // Immediately check channel membership
    return await this.checkTelegramMembership(profile.id);
  }

  /**
   * Qualify a referral when the referred user completes Telegram verification
   */
  async qualifyReferral(referredUserId) {
    const sb = getSupabaseServerClient();
    if (!sb) return;

    // Check if there is a pending referral record
    const { data: referral } = await sb
      .from('referrals')
      .select('*')
      .eq('referred_id', referredUserId)
      .eq('status', 'pending')
      .maybeSingle();

    if (referral) {
      const nowIso = new Date().toISOString();
      // Mark referral as qualified
      await sb.from('referrals').update({
        status: 'qualified',
        qualified_at: nowIso,
      }).eq('id', referral.id);

      console.log(`[Entitlements] Referral qualified! Referrer: ${referral.referrer_id}, Referred: ${referredUserId}`);

      // Recalculate referrer's plan and entitlements
      await this.getUserEntitlements(referral.referrer_id);
    }
  }

  /**
   * Register a new referral link when a user signs up
   */
  async registerReferral({ newUserId, referralCode, ipAddress }) {
    if (!newUserId || !referralCode) return false;

    const cleanCode = referralCode.trim().toUpperCase();
    const sb = getSupabaseServerClient();
    if (!sb) return false;

    // 1. Find referrer by code
    const { data: referrer } = await sb
      .from('profiles')
      .select('id')
      .eq('referral_code', cleanCode)
      .maybeSingle();

    if (!referrer || referrer.id === newUserId) {
      // Disallow self-referral or non-existent code
      return false;
    }

    // 2. Prevent duplicate referral for same referred_id
    const { data: existingRef } = await sb
      .from('referrals')
      .select('id')
      .eq('referred_id', newUserId)
      .maybeSingle();

    if (existingRef) return false;

    // 3. Insert referral record
    await sb.from('referrals').insert({
      referrer_id: referrer.id,
      referred_id: newUserId,
      status: 'pending',
      ip_address: ipAddress || null,
      created_at: new Date().toISOString(),
    });

    // 4. Set referred_by on new user profile
    await sb.from('profiles').update({
      referred_by: referrer.id,
    }).eq('id', newUserId);

    console.log(`[Entitlements] Referral registered: referrer=${referrer.id}, referred=${newUserId}`);
    return true;
  }

  /**
   * Generate 8-character unique referral code
   */
  generateReferralCode(userId) {
    const raw = (userId || '') + Math.random().toString(36) + Date.now().toString(36);
    return crypto.createHash('md5').update(raw).digest('hex').substring(0, 8).toUpperCase();
  }
}

export const entitlementService = new EntitlementService();
export default entitlementService;
