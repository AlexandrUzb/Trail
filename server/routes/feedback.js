import express from 'express';
import { storageService } from '../services/storageService.js';

const router = express.Router();

// POST /api/feedback - submit rating on AI answer
router.post('/', (req, res) => {
  try {
    const { queryId, rating, reason, comment, userId } = req.body;

    if (!rating || !['positive', 'negative'].includes(rating)) {
      return res.status(400).json({ success: false, error: "rating 'positive' yoki 'negative' bo'lishi shart." });
    }

    const entry = storageService.saveFeedback({
      queryId,
      rating,
      reason,
      comment,
      userId
    });

    res.json({
      success: true,
      message: "Fikringiz uchun rahmat! Tizim sifatini yaxshilashda yordam beradi.",
      data: entry
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/feedback/stats
router.get('/stats', (req, res) => {
  try {
    const stats = storageService.getFeedbackStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
