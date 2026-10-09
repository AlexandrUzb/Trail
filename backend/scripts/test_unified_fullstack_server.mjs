import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../app.js';
import { getSupabaseServerClient, isSupabaseConfigured } from '../services/supabaseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server;
let baseUrl = '';

function startTestServer() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
}

function stopTestServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(resolve);
    } else {
      resolve();
    }
  });
}

async function request(reqPath, options = {}) {
  const url = `${baseUrl}${reqPath}`;
  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return {
    status: res.status,
    ok: res.ok,
    contentType: res.headers.get('content-type') || '',
    text,
    json,
  };
}

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

async function runFullStackAudit() {
  console.log('================================================================');
  console.log('ADVOKATAI UNIFIED FULL-STACK & SUPABASE DEPLOYMENT AUDIT');
  console.log('================================================================\n');

  await startTestServer();

  try {
    // 1. Root / Homepage Serving
    console.log('[TEST 1] Root route (GET /):');
    const rootRes = await request('/');
    assert(rootRes.status === 200, `GET / returns 200 OK (got ${rootRes.status})`);
    assert(rootRes.contentType.includes('text/html'), `Content-Type is text/html (got "${rootRes.contentType}")`);
    assert(rootRes.text.includes('AdvokatAI') || rootRes.text.includes('<!DOCTYPE html>'), 'Serves production HTML bundle');

    // 2. SPA Route Fallback (/login)
    console.log('\n[TEST 2] Client SPA fallback (GET /login):');
    const loginRes = await request('/login');
    assert(loginRes.status === 200, `GET /login returns 200 OK without 404 (got ${loginRes.status})`);
    assert(loginRes.contentType.includes('text/html'), 'Content-Type is text/html for React Router');
    assert(loginRes.text.includes('<!DOCTYPE html>'), 'Returns HTML shell for SPA routing');

    // 3. SPA Route Fallback (/chat)
    console.log('\n[TEST 3] Client SPA fallback (GET /chat):');
    const chatRes = await request('/chat');
    assert(chatRes.status === 200, `GET /chat returns 200 OK (got ${chatRes.status})`);
    assert(chatRes.contentType.includes('text/html'), 'Content-Type is text/html for React Router');

    // 4. API Endpoints on same origin
    console.log('\n[TEST 4] Unified API endpoints (GET /api/health):');
    const healthRes = await request('/api/health');
    assert(healthRes.status === 200, `GET /api/health returns 200 OK`);
    assert(healthRes.json?.status === 'online', `Health status is 'online' (got "${healthRes.json?.status}")`);
    assert(healthRes.contentType.includes('application/json'), 'Content-Type is application/json');

    // 5. API Info Endpoint (GET /api)
    console.log('\n[TEST 5] API directory info (GET /api):');
    const apiRes = await request('/api');
    assert(apiRes.status === 200, `GET /api returns 200 OK`);
    assert(apiRes.json?.success === true, 'API info success is true');
    assert(Boolean(apiRes.json?.endpoints), 'Endpoints map provided in JSON');

    // 6. Unmatched API route returns JSON 404, never falls through to HTML
    console.log('\n[TEST 6] Unmatched API 404 handler (GET /api/unknown_endpoint_xyz):');
    const unknownApiRes = await request('/api/unknown_endpoint_xyz');
    assert(unknownApiRes.status === 404, `Returns 404 Not Found (got ${unknownApiRes.status})`);
    assert(unknownApiRes.json?.success === false, 'Returns JSON error format');
    assert(unknownApiRes.contentType.includes('application/json'), 'Content-Type is application/json, not HTML');

    // 7. Supabase Schema Integrity
    console.log('\n[TEST 7] Supabase schema verification:');
    const schemaPath = path.resolve(__dirname, '../../supabase/schema.sql');
    assert(fs.existsSync(schemaPath), 'supabase/schema.sql exists in workspace');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.users'), 'Contains idempotent users table');
    assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.payments'), 'Contains idempotent payments table');
    assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.plans'), 'Contains idempotent plans table');
    assert(schemaSql.includes('ENABLE ROW LEVEL SECURITY'), 'Contains RLS activation commands');

    // 8. Supabase Client Integration
    console.log('\n[TEST 8] Supabase client initialization:');
    assert(isSupabaseConfigured() === true, 'Supabase is configured with URL and Key');
    const sb = getSupabaseServerClient();
    assert(sb !== null, 'Server Supabase client initializes cleanly');

    // 9. Deployment Files & Git Protection
    console.log('\n[TEST 9] Deployment & Git Protection:');
    const gitignorePath = path.resolve(__dirname, '../../.gitignore');
    assert(fs.existsSync(gitignorePath), '.gitignore exists in workspace');
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    assert(gitignoreContent.includes('.env'), '.gitignore excludes .env files');
    assert(gitignoreContent.includes('node_modules/'), '.gitignore excludes node_modules');

    const renderYamlPath = path.resolve(__dirname, '../../render.yaml');
    assert(fs.existsSync(renderYamlPath), 'render.yaml exists in workspace');

    const dockerfilePath = path.resolve(__dirname, '../../Dockerfile');
    assert(fs.existsSync(dockerfilePath), 'Dockerfile exists in workspace');

    const packageJsonPath = path.resolve(__dirname, '../../package.json');
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    assert(pkg.scripts?.start === 'node server/index.js', 'package.json start script is "node server/index.js"');
    assert(Boolean(pkg.dependencies?.['@supabase/supabase-js']), '@supabase/supabase-js is in dependencies');

    console.log('\n================================================================');
    console.log(`FULL-STACK AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    await stopTestServer();
  }
}

runFullStackAudit().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
