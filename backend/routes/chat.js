import express from 'express';
import { generateLegalAdvice } from '../services/aiService.js';
import { storageService } from '../services/storageService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, history = [], law_group = null, userId = 'anonymous', language = 'uz' } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: "Savol matni (message) kiritilishi shart." 
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        success: false,
        error: "Savol matni juda uzun (maksimal 4000 belgi)."
      });
    }

    // Server-side usage quota verification
    const quotaCheck = storageService.checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: quotaCheck.reason,
        message: quotaCheck.message,
        data: {
          text: quotaCheck.message,
          usage: quotaCheck.usage,
          needs_clarification: false,
          sources: []
        }
      });
    }

    // Process legal advice through pipeline
    const result = await generateLegalAdvice({
      message: message.trim(),
      law_group,
      history,
      userId,
      language
    });

    return res.json({
      success: true,
      data: {
        ...result,
        usage: quotaCheck.usage
      }
    });
  } catch (error) {
    console.error('[Chat API Error]:', error);
    return res.status(500).json({
      success: false,
      error: "Serverda kutilmagan xatolik yuz berdi.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/chat/usage/:userId - get user usage stats
router.get('/usage/:userId', (req, res) => {
  try {
    const usage = storageService.getUserUsage(req.params.userId);
    res.json({ success: true, data: usage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
