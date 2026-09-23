import express from 'express';
import { storageService } from '../services/storageService.js';
import { getSupabaseServerClient } from '../services/supabaseClient.js';

const router = express.Router();

// GET /api/plans - list all active subscription plans from public.plans (SOURCE OF TRUTH)
router.get('/', async (req, res) => {
  try {
    const sb = getSupabaseServerClient();
    if (sb) {
      const { data: dbPlans, error } = await sb
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price_uzs', { ascending: true });

      if (!error && dbPlans && dbPlans.length > 0) {
        const mapped = dbPlans.map(p => ({
          ...p,
          price: p.price_uzs,
          priceUzs: p.price_uzs,
          plan_id: p.name.toLowerCase().includes('standard') || p.name.toLowerCase().includes('pro') ? 'pro' : p.name.toLowerCase()
        }));
        return res.json({ success: true, count: mapped.length, data: mapped });
      }
    }

    const plans = storageService.getPlans();
    res.json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/plans/:id
router.get('/:id', async (req, res) => {
  try {
    const sb = getSupabaseServerClient();
    if (sb) {
      const { data: dbPlan, error } = await sb
        .from('plans')
        .select('*')
        .eq('id', req.params.id)
        .maybeSingle();

      if (!error && dbPlan) {
        return res.json({ success: true, data: dbPlan });
      }
    }

    const plan = storageService.getPlanById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, error: "Reja topilmadi." });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
