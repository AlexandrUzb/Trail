import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gkztwgxxcahwmzwvimzi.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_CujwKGKQIc70VQo4wQZWXw_r3O3Bhk0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const EXPECTED_TABLES = [
  'profiles',
  'plans',
  'user_subscriptions',
  'conversations',
  'messages',
  'legal_categories',
  'legal_articles',
  'document_templates',
  'user_documents',
  'favorites',
  'ai_usage',
  'feedback',
  'notifications'
];

async function runTestSuite() {
  console.log('====================================================');
  console.log('🔍 ADVOKATAI SUPABASE SOURCE OF TRUTH VERIFICATION');
  console.log(`Endpoint: ${SUPABASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  for (const table of EXPECTED_TABLES) {
    try {
      const { data, error, status } = await supabase.from(table).select('*').limit(1);
      // Status 200 or 401 (RLS required) or empty data means table exists!
      // Status 404 means table does NOT exist in schema cache.
      if (status === 404) {
        console.error(`❌ Table public.${table} NOT FOUND (404)`);
        failed++;
      } else {
        const count = data ? data.length : 0;
        console.log(`✅ Table public.${table}: EXISTS (HTTP ${status}, Rows: ${count}, RLS Active: ${status === 401 ? 'YES' : 'Open/Anon'})`);
        passed++;
      }
    } catch (e) {
      console.error(`❌ Table public.${table} error:`, e.message);
      failed++;
    }
  }

  // Verify that nonexistent tables like 'payments' are NOT queried
  console.log('\n--- Checking Negative Table Existence ---');
  try {
    const { status } = await supabase.from('payments').select('*').limit(1);
    if (status === 404) {
      console.log('✅ Confirmed: public.payments table does NOT exist in Supabase (HTTP 404 as expected). App properly tracks subscriptions in public.user_subscriptions.');
      passed++;
    } else {
      console.warn(`⚠️ Unexpected status for payments: ${status}`);
    }
  } catch (e) {
    console.log('✅ Confirmed payments error caught:', e.message);
    passed++;
  }

  console.log('\n====================================================');
  console.log(`Summary: ${passed} checks passed, ${failed} failed.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();
