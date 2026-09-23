import express from 'express';
import { ragService } from '../services/ragService.js';

const router = express.Router();

router.get('/', (req, res) => {
  const geminiConfigured = Boolean(
    process.env.GEMINI_API_KEY && 
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );

  const ragStats = ragService.getStats();

  res.json({
    status: 'online',
    app: 'AdvokatAI Backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    ai: {
      provider: 'Google Gemini',
      model: 'gemini-3.6-flash',
      configured: geminiConfigured,
      mode: geminiConfigured ? 'live_rag_gemini' : 'local_rag_fallback'
    },
    rag: {
      totalDocuments: ragStats.totalDocuments,
      totalArticles: ragStats.totalArticles,
      source: 'LEX.UZ Milliy Qonunchilik Bazasi',
      documents: ragStats.documents.map(d => ({
        id: d.id,
        name: d.name,
        articles: d.article_count,
        version: d.version_date,
        url: d.source_url
      }))
    },
    uptimeSeconds: Math.floor(process.uptime())
  });
});

export default router;
