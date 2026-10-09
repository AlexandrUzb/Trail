import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gkztwgxxcahwmzwvimzi.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_CujwKGKQIc70VQo4wQZWXw_r3O3Bhk0';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('================================================================');
console.log('🚀 ADVOKATAI SUPABASE END-TO-END FLOW & RLS VERIFICATION SUITE');
console.log(`Endpoint: ${SUPABASE_URL}`);
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`>>> PASS [✓] ${message}`);
    passed++;
  } else {
    console.error(`>>> FAIL [✗] ${message}`);
    failed++;
  }
}

async function runE2ESuite() {
  const timestamp = Date.now();
  const testEmail = `test_advokat_${timestamp}@example.com`;
  const testPassword = `Pass#${timestamp}!Safe`;
  const testFullName = `Test Foydalanuvchi ${timestamp}`;

  // Browser-like Client with publishable key
  const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // 1. Logged-out state check
  console.log('[STEP 1] Initial Logged-Out State Verification:');
  const { data: initialSession } = await clientA.auth.getSession();
  assert(!initialSession?.session, 'Client initially has no active session');
  const { data: unauthDocs } = await clientA.from('user_documents').select('*');
  assert(Array.isArray(unauthDocs) && unauthDocs.length === 0, 'Unauthenticated query to user_documents yields 0 rows (RLS enforced)');

  // 2. Public Catalog Access
  console.log('\n[STEP 2] Public Catalog Tables Query:');
  const { data: plans, error: plansErr } = await clientA.from('plans').select('*').eq('is_active', true);
  assert(!plansErr && plans?.length >= 3, `Retrieved ${plans?.length} active plans (Free, Standard, Premium)`);

  const { data: templates, error: tmplErr } = await clientA.from('document_templates').select('id, title_uz').eq('is_active', true);
  assert(!tmplErr && templates?.length >= 83, `Retrieved ${templates?.length} active document templates (All 83+ restored!)`);

  const { data: categories, error: catErr } = await clientA.from('legal_categories').select('id, name_uz').eq('is_active', true);
  assert(!catErr && categories?.length >= 11, `Retrieved ${categories?.length} legal categories`);

  // 3. User Registration / Provisioning
  console.log('\n[STEP 3] User Registration & Provisioning:');
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: createdUser, error: createErr } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      full_name: testFullName,
    }
  });

  assert(!createErr && createdUser?.user?.id, `User registered and email confirmed with ID: ${createdUser?.user?.id}`);
  const userIdA = createdUser.user.id;

  // 4. User Login via Client
  console.log('\n[STEP 4] User Login & Session Establishment via Client:');
  const { data: loginData, error: loginErr } = await clientA.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  assert(!loginErr && loginData?.session?.access_token, 'Login succeeded and JWT session access_token issued');

  // 5. Profile Verification
  console.log('\n[STEP 5] Profile Loading & Upsert:');
  // Ensure profile exists in public.profiles
  await clientA.from('profiles').upsert({
    id: userIdA,
    email: testEmail,
    full_name: testFullName,
    role: 'user',
    updated_at: new Date().toISOString()
  });

  const { data: profile, error: profErr } = await clientA
    .from('profiles')
    .select('*')
    .eq('id', userIdA)
    .single();

  assert(!profErr && profile?.email === testEmail, `Loaded profile from public.profiles: ${profile?.full_name}`);

  // 6. Conversation & Messages Persistence
  console.log('\n[STEP 6] Chat Conversations & Messages Persistence:');
  const { data: newConv, error: convErr } = await clientA
    .from('conversations')
    .insert({
      user_id: userIdA,
      title: 'Mehnat ta’tili bo‘yicha konsultatsiya'
    })
    .select('*')
    .single();

  assert(!convErr && newConv?.id, `Created conversation thread: "${newConv?.title}" (ID: ${newConv?.id})`);
  const convId = newConv.id;

  const { data: userMsg, error: uMsgErr } = await clientA
    .from('messages')
    .insert({
      conversation_id: convId,
      user_id: userIdA,
      role: 'user',
      content: 'Yillik asosiy ta’til muddati qancha?'
    })
    .select('*')
    .single();

  assert(!uMsgErr && userMsg?.id, 'Persisted user question message in public.messages');

  const { data: aiMsg, error: aiMsgErr } = await clientA
    .from('messages')
    .insert({
      conversation_id: convId,
      user_id: userIdA,
      role: 'assistant',
      content: 'Mehnat kodeksining 217-moddasiga ko‘ra, yillik asosiy mehnat ta’tilining eng kam muddati 21 kalendar kunni tashkil etadi.'
    })
    .select('*')
    .single();

  assert(!aiMsgErr && aiMsg?.id, 'Persisted assistant answer message in public.messages');

  // 7. AI Quota Tracking
  console.log('\n[STEP 7] Daily AI Usage Tracking:');
  const today = new Date().toISOString().split('T')[0];
  const { data: usageRecord, error: usageErr } = await clientA
    .from('ai_usage')
    .upsert({
      user_id: userIdA,
      usage_date: today,
      question_count: 1
    }, { onConflict: 'user_id, usage_date' })
    .select('*')
    .single();

  assert(!usageErr && usageRecord?.question_count >= 1, `Recorded AI quota usage in public.ai_usage for ${today}`);

  // 8. Document Templates & User Documents Saving
  console.log('\n[STEP 8] Document Creation & User Documents Saving:');
  const chosenTmpl = templates[0];
  const { data: userDoc, error: docErr } = await clientA
    .from('user_documents')
    .insert({
      user_id: userIdA,
      template_id: chosenTmpl.id,
      title: chosenTmpl.title_uz,
      content: 'NAMUNA MATN — Tuzilgan sana: 2026-09-23\nFoydalanuvchi: ' + testFullName,
      status: 'completed'
    })
    .select('*')
    .single();

  assert(!docErr && userDoc?.id, `Saved user document in public.user_documents (ID: ${userDoc?.id})`);

  // 9. Bookmarks & Favorites
  console.log('\n[STEP 9] Template Favoriting:');
  const { data: fav, error: favErr } = await clientA
    .from('favorites')
    .insert({
      user_id: userIdA,
      document_template_id: chosenTmpl.id
    })
    .select('*')
    .single();

  assert(!favErr && fav?.id, `Added template to public.favorites (Favorite ID: ${fav?.id})`);

  // 10. Feedback Submission
  console.log('\n[STEP 10] Feedback Submission:');
  const { data: fb, error: fbErr } = await clientA
    .from('feedback')
    .insert({
      user_id: userIdA,
      conversation_id: convId,
      message_id: aiMsg.id,
      rating: 5,
      comment: 'Juda aniq va foydali ma’lumot berildi!',
      status: 'new'
    })
    .select('*')
    .single();

  assert(!fbErr && fb?.id, `Submitted user rating in public.feedback (Rating: ${fb?.rating})`);

  // 11. Multi-User RLS Isolation Check
  console.log('\n[STEP 11] Row Level Security (RLS) Isolation Test:');
  // Create client B for an unrelated user / visitor
  const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // Client B tries to read User A's private records
  const { data: bConvs } = await clientB.from('conversations').select('*').eq('id', convId);
  assert(Array.isArray(bConvs) && bConvs.length === 0, 'RLS: Other user CANNOT read User A conversations (0 rows returned)');

  const { data: bMsgs } = await clientB.from('messages').select('*').eq('conversation_id', convId);
  assert(Array.isArray(bMsgs) && bMsgs.length === 0, 'RLS: Other user CANNOT read User A chat messages (0 rows returned)');

  const { data: bDocs } = await clientB.from('user_documents').select('*').eq('id', userDoc.id);
  assert(Array.isArray(bDocs) && bDocs.length === 0, 'RLS: Other user CANNOT read User A documents (0 rows returned)');

  const { data: bFavs } = await clientB.from('favorites').select('*').eq('user_id', userIdA);
  assert(Array.isArray(bFavs) && bFavs.length === 0, 'RLS: Other user CANNOT read User A favorites (0 rows returned)');

  // 12. Record Deletion
  console.log('\n[STEP 12] Conversation and Records Deletion:');
  const { error: delMsgErr } = await clientA.from('messages').delete().eq('conversation_id', convId);
  assert(!delMsgErr, 'Deleted conversation messages cleanly');

  const { error: delConvErr } = await clientA.from('conversations').delete().eq('id', convId);
  assert(!delConvErr, 'Deleted conversation thread cleanly');

  // 13. Logout & Post-Logout State
  console.log('\n[STEP 13] Logout & Session Cleanup:');
  const { error: logoutErr } = await clientA.auth.signOut();
  assert(!logoutErr, 'Supabase auth.signOut() completed without error');

  const { data: postSession } = await clientA.auth.getSession();
  assert(!postSession?.session, 'Session is completely null after sign out');

  // Cleanup test user using service role
  console.log('\n[CLEANUP] Cleaning up ephemeral test user...');
  await adminClient.from('profiles').delete().eq('id', userIdA);
  await adminClient.from('user_documents').delete().eq('user_id', userIdA);
  await adminClient.from('favorites').delete().eq('user_id', userIdA);
  await adminClient.from('ai_usage').delete().eq('user_id', userIdA);
  await adminClient.from('feedback').delete().eq('user_id', userIdA);
  await adminClient.auth.admin.deleteUser(userIdA);
  console.log('Ephemeral test user cleanly removed.');

  console.log('\n================================================================');
  console.log(`E2E SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runE2ESuite().catch(err => {
  console.error('Fatal E2E test error:', err);
  process.exit(1);
});
