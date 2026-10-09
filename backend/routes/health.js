import express from 'express';
import { ragService } from '../services/ragService.js';

const router = express.Router();

router.get('/', (req, res) => {
  const geminiConfigured = Boolean(
    process.env.GEMINI_API_KEY && 
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );

  const ragStats = ragService.getStats();
  const memoryUsage = process.memoryUsage();

  res.json({
    status: 'online',
    app: 'AdvokatAI Backend',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
      heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
      rssMb: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
    },
    ai: {
      provider: 'AdvokatAI',
      model: 'advokatai-legal-v2',
      configured: geminiConfigured,
      mode: geminiConfigured ? 'AdvokatAI Live' : 'local_rag_fallback'
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
    }
  });
});

export default router;
