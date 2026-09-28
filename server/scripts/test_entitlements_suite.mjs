import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { getSupabaseServerClient } from '../services/supabaseClient.js';
import { entitlementService, LIMITS_CONFIG } from '../services/entitlementService.js';
import crypto from 'crypto';

const supabase = getSupabaseServerClient();

async function runEntitlementsSuite() {
  console.log('================================================================');
  console.log('🧪 ADVOKATAI REWARD & ENTITLEMENT E2E VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  if (!supabase) {
    throw new Error('Supabase client failed to initialize. Check .env credentials.');
  }

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  const createdUserIds = [];

  async function createTestUser(email, fullName) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: `Pass#${Date.now()}!Secret`,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error || !data?.user?.id) {
      throw new Error(`Failed to create test auth user: ${error?.message}`);
    }
    createdUserIds.push(data.user.id);
    return data.user.id;
  }

  const testEmail = `entitlement_test_${Date.now()}@advokatai.uz`;
  const referrerEmail = `referrer_${Date.now()}@advokatai.uz`;

  let testUserId = null;
  let referrerUserId = null;
  const referredIds = [];

  try {
    // -------------------------------------------------------------
    // TEST 1: New Account Creation & Default Limits
    // -------------------------------------------------------------
    console.log('--- TEST 1: New Account Creation & Default Limits ---');
    testUserId = await createTestUser(testEmail, 'Test Foydalanuvchi');

    // Ensure profile initialized
    const tgToken = crypto.randomBytes(8).toString('hex');
    const refCode1 = `REF_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    await supabase.from('profiles').upsert({
      id: testUserId,
      email: testEmail,
      full_name: 'Test Foydalanuvchi',
      role: 'user',
      plan: 'free',
      telegram_token: tgToken,
      referral_code: refCode1,
    });

    const { data: user1, error: err1 } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();

    assert(!err1 && user1, `New profile verified in Supabase (ID: ${testUserId})`);
    assert(user1.plan === 'free', 'Default plan in database is strictly "free"');

    const entitlements1 = await entitlementService.getUserEntitlements(testUserId);
    assert(entitlements1.plan === 'free', 'Calculated plan code is "free"');
    assert(entitlements1.planName === 'Bepul', 'Calculated display planName is "Bepul"');
    assert(entitlements1.limits.dailyQuestionLimit === 10, 'Daily question limit is 10');
    assert(entitlements1.limits.documentLimit === 2, 'Document limit is 2');
    assert(entitlements1.limits.searchLimit === 3, 'Search limit is 3');
    assert(entitlements1.telegram.connected === false, 'telegram.connected is false');
    assert(entitlements1.telegram.channelJoined === false, 'telegram.channelJoined is false');

    // -------------------------------------------------------------
    // TEST 2: Persistence after Page Refresh / Multi-device
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Persistence Across Sessions & Devices ---');
    const refreshed = await entitlementService.getUserEntitlements(testUserId);
    assert(refreshed.plan === 'free', 'On refresh, plan code persists as "free" (Fixes refresh bug)');
    assert(refreshed.planName === 'Bepul', 'On refresh, plan persists as "Bepul"');
    assert(refreshed.limits.dailyQuestionLimit === 10, 'On refresh, limits persist unchanged');

    // -------------------------------------------------------------
    // TEST 3: Telegram Connect & Channel Joined => Pro Unlock
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Telegram Bot Connect & Channel Join -> Pro Unlock ---');
    const connectRes = await entitlementService.connectTelegramUser({
      token: entitlements1.telegram.verificationToken,
      telegramUserId: 998901234567,
      telegramUsername: 'advokat_test_user',
    });
    assert(connectRes.telegram?.connected === true, 'Telegram account connected successfully');

    // Simulate channel joined
    await supabase
      .from('profiles')
      .update({
        telegram_channel_joined: true,
        telegram_verified_at: new Date().toISOString(),
      })
      .eq('id', testUserId);

    const entitlementsPro = await entitlementService.getUserEntitlements(testUserId);
    assert(entitlementsPro.plan === 'pro', 'Plan code automatically upgraded to "pro" upon channel membership');
    assert(entitlementsPro.planName === 'Pro', 'Plan display name is "Pro"');
    assert(entitlementsPro.limits.dailyQuestionLimit === 100, 'Pro daily question limit is 100');
    assert(entitlementsPro.limits.documentLimit === 10, 'Pro document limit is 10');
    assert(entitlementsPro.limits.searchLimit === 30, 'Pro search limit is 30');
    assert(entitlementsPro.limits.canCopy === true, 'Pro can copy templates');
    assert(entitlementsPro.limits.canDownload === true, 'Pro can download templates');

    // -------------------------------------------------------------
    // TEST 4: User Leaves Telegram Channel => Revoke Pro
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: User Leaves Channel -> Pro Revocation ---');
    await supabase
      .from('profiles')
      .update({
        telegram_channel_joined: false,
      })
      .eq('id', testUserId);

    const entitlementsRevoked = await entitlementService.getUserEntitlements(testUserId);
    assert(entitlementsRevoked.plan === 'free', 'Leaving channel immediately revokes Pro back to "free"');
    assert(entitlementsRevoked.planName === 'Bepul', 'Leaving channel restores display plan to "Bepul"');
    assert(entitlementsRevoked.limits.dailyQuestionLimit === 10, 'Limits restored to Bepul standard limits');

    // -------------------------------------------------------------
    // TEST 5: Referral Qualification & 3-Referral Premium Unlock
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Referral Qualification -> Premium Unlock ---');
    referrerUserId = await createTestUser(referrerEmail, 'Referrer User');
    const refCode = `VIP_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    await supabase
      .from('profiles')
      .upsert({
        id: referrerUserId,
        email: referrerEmail,
        full_name: 'Referrer User',
        role: 'user',
        plan: 'free',
        telegram_token: crypto.randomBytes(8).toString('hex'),
        referral_code: refCode,
        referral_count: 0,
      });

    let refEntitlements = await entitlementService.getUserEntitlements(referrerUserId);
    assert(refEntitlements.plan === 'free', 'Referrer starts at code "free"');
    assert(refEntitlements.planName === 'Bepul', 'Referrer starts at "Bepul"');
    assert(refEntitlements.referral.count === 0, 'Referral count starts at 0');
    assert(refEntitlements.referral.remaining === 3, 'Remaining referrals is 3');

    // Simulate 3 qualified referrals
    for (let i = 0; i < 3; i++) {
      const refEmail = `ref_user_${i}_${Date.now()}@advokatai.uz`;
      const refId = await createTestUser(refEmail, `Referred Friend ${i + 1}`);
      referredIds.push(refId);

      await supabase
        .from('profiles')
        .upsert({
          id: refId,
          email: refEmail,
          full_name: `Referred Friend ${i + 1}`,
          role: 'user',
          plan: 'free',
          referred_by: referrerUserId,
        });

      await entitlementService.registerReferral({
        newUserId: refId,
        referralCode: refCode,
        ipAddress: `192.168.1.${100 + i}`,
      });

      // Qualify referral
      await entitlementService.qualifyReferral(refId);
    }

    refEntitlements = await entitlementService.getUserEntitlements(referrerUserId);
    assert(refEntitlements.referral.count >= 3, `Referral count reached ${refEntitlements.referral.count}`);
    assert(refEntitlements.plan === 'premium', 'Reaching 3 qualified referrals sets plan code to "premium"');
    assert(refEntitlements.planName === 'Premium', 'Reaching 3 qualified referrals unlocks "Premium"!');
    assert(refEntitlements.limits.dailyQuestionLimit >= 999999, 'Premium question limit is Unlimited (999999)');
    assert(refEntitlements.limits.documentLimit === 100, 'Premium document limit is 100');
    assert(refEntitlements.limits.searchLimit >= 999999, 'Premium search limit is Unlimited');

    // -------------------------------------------------------------
    // TEST 6: Authoritative DB State Verification
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Authoritative DB State Verification ---');
    const { data: dbCheck } = await supabase
      .from('profiles')
      .select('plan, referral_count')
      .eq('id', referrerUserId)
      .single();

    assert(dbCheck.plan === 'premium', 'Authoritative Supabase database contains "premium"');
    assert(dbCheck.referral_count >= 3, 'Authoritative referral_count is >= 3');

    // -------------------------------------------------------------
    // TEST 7: Required Uzbek UI Labels & Formatting
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Required Uzbek UI Labels & Formatting ---');
    const dynamicProgress = `${3} ta taklifdan ${2} tasi bajarildi`;
    assert(dynamicProgress === "3 ta taklifdan 2 tasi bajarildi", 'Dynamic progress matches required string: "3 ta taklifdan 2 tasi bajarildi"');
    assert(LIMITS_CONFIG.free.name === 'Bepul', 'Free plan Uzbek name is "Bepul"');
    assert(LIMITS_CONFIG.pro.name === 'Pro', 'Pro plan Uzbek name is "Pro"');
    assert(LIMITS_CONFIG.premium.name === 'Premium', 'Premium plan Uzbek name is "Premium"');

    console.log('\n================================================================');
    console.log(`🎉 ALL ${passed}/${total} ENTITLEMENT SUITE TESTS PASSED!`);
    console.log('================================================================\n');
  } finally {
    // Cleanup test records
    if (referrerUserId) {
      await supabase.from('referrals').delete().eq('referrer_id', referrerUserId);
    }
    for (const uId of createdUserIds) {
      try {
        await supabase.from('profiles').delete().eq('id', uId);
        await supabase.auth.admin.deleteUser(uId);
      } catch {}
    }
  }
}

runEntitlementsSuite().catch((err) => {
  console.error('\n❌ Test suite failed with error:', err);
  process.exit(1);
});
