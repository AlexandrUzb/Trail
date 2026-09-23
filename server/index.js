import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`⚖️  AdvokatAI Backend Server ishga tushdi!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🤖 AI Rejimi: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' ? 'Google Gemini Live' : 'Mahalliy huquqiy baza (Local Knowledge Base)'}`);
  console.log(`=========================================`);
});
