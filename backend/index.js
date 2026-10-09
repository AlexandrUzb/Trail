import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  const geminiActive = Boolean(
    process.env.GEMINI_API_KEY && 
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );
  const supabaseActive = Boolean(process.env.SUPABASE_URL);

  console.log('====================================================');
  console.log('⚖️   AdvokatAI Production API Server');
  console.log(`📡  Status:       Online (Port: ${PORT})`);
  console.log(`🌍  Environment:  ${NODE_ENV}`);
  console.log(`🤖  AI Provider:  ${geminiActive ? 'Gemini 3.5 Flash-Lite (Active)' : 'Local RAG Lex.uz Fallback'}`);
  console.log(`🗄️   Database:     ${supabaseActive ? 'Supabase PostgreSQL (Connected)' : 'Local Store Fallback'}`);
  console.log(`🏥  Health Check: http://localhost:${PORT}/api/health`);
  console.log('====================================================');
});

// Graceful Shutdown for Cloud Platforms (Render, Railway, Docker, K8s)
function handleGracefulShutdown(signal) {
  console.log(`\n🛑 [Shutdown] ${signal} signal qabul qilindi. Server to'xtatilmoqda...`);
  server.close(() => {
    console.log('✅ [Shutdown] Barcha ulanishlar yopildi. Server xavfsiz to\'xtadi.');
    process.exit(0);
  });

  // Force shutdown if connections do not close within 10 seconds
  setTimeout(() => {
    console.error('⚠️  [Shutdown] 10 soniyada ulanishlar yopilmadi. Majburiy to\'xtatilmoqda.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
