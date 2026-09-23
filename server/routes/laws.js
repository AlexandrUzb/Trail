import express from 'express';
import { ragService } from '../services/ragService.js';
import { getSupabaseServerClient } from '../services/supabaseClient.js';

const router = express.Router();

// GET /api/laws/documents - list all official documents
router.get('/documents', (req, res) => {
  try {
    const stats = ragService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const CATEGORY_DOC_MAP = {
  'mehnat_huquqi': 'labor_code',
  'labor_code': 'labor_code',
  'kochmas_mulk': 'civil_code',
  'civil_code': 'civil_code',
  'oila_huquqi': 'civil_code',
  'soliq_huquqi': 'administrative_code',
  'jinoyat_huquqi': 'criminal_code',
  'criminal_code': 'criminal_code',
  'fuqarolik_huquqi': 'civil_code',
  'mamuriy_huquq': 'administrative_code',
  'administrative_code': 'administrative_code',
  'konstitutsiya': 'constitution',
  'constitution': 'constitution'
};

// GET /api/laws - get laws with search, filter, and pagination
router.get('/', async (req, res) => {
  try {
    const { q, doc, category, page = 1, limit = 30 } = req.query;

    // Check if Supabase has live legal_articles
    const sb = getSupabaseServerClient();
    if (sb) {
      try {
        let sbQuery = sb.from('legal_articles').select('*, legal_categories(name_uz, slug)').eq('is_active', true);
        if (q && q.trim()) {
          sbQuery = sbQuery.or(`title_uz.ilike.%${q.trim()}%,content_uz.ilike.%${q.trim()}%,summary_uz.ilike.%${q.trim()}%,article_number.ilike.%${q.trim()}%`);
        }
        const { data: dbArticles, error: dbErr } = await sbQuery;
        if (!dbErr && dbArticles && dbArticles.length > 0) {
          const mapped = dbArticles.map(a => ({
            id: a.id,
            title: a.title_uz,
            article_number: a.article_number,
            source: a.source_name,
            source_url: a.source_url,
            content: a.content_uz,
            short_description: a.summary_uz,
            category: a.legal_categories?.name_uz || 'Boshqa',
            category_id: a.category_id,
          }));
          return res.json({
            success: true,
            count: mapped.length,
            data: mapped
          });
        }
      } catch (err) {
        console.warn('[LawsRoute] Supabase fetch fallback to local:', err.message);
      }
    }

    ragService.loadDatabase();

    const targetDoc = doc || (category ? CATEGORY_DOC_MAP[category] : null);

    if (q && q.trim()) {
      const searchRes = ragService.searchLegalDatabase(q.trim(), {
        topK: parseInt(limit, 10) || 30,
        documentId: targetDoc && targetDoc !== 'all' ? targetDoc : null,
        minScore: 1
      });
      return res.json({
        success: true,
        count: searchRes.articles.length,
        data: searchRes.articles
      });
    }

    // Default list with document filter and pagination
    let all = ragService.articles;
    if (targetDoc && targetDoc !== 'all') {
      all = all.filter(a => a.document_id === targetDoc);
    } else if (category && category !== 'all' && category !== 'Barchasi') {
      all = all.filter(a => a.category === category || (a.category && a.category.toLowerCase() === category.toLowerCase()));
    }

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
    const offset = (p - 1) * l;
    const paginated = all.slice(offset, offset + l);

    res.json({
      success: true,
      total: all.length,
      page: p,
      limit: l,
      totalPages: Math.ceil(all.length / l),
      data: paginated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/laws/:id - get specific article by ID
router.get('/:id', async (req, res) => {
  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('legal_articles')
        .select('*, legal_categories(name_uz, slug)')
        .eq('id', req.params.id)
        .maybeSingle();

      if (!error && data) {
        return res.json({
          success: true,
          data: {
            id: data.id,
            title: data.title_uz,
            article_number: data.article_number,
            source: data.source_name,
            source_url: data.source_url,
            content: data.content_uz,
            short_description: data.summary_uz,
            category: data.legal_categories?.name_uz || 'Boshqa',
            category_id: data.category_id,
          }
        });
      }
    } catch {}
  }

  ragService.loadDatabase();
  const article = ragService.articlesById.get(req.params.id);
  if (!article) {
    return res.status(404).json({ success: false, error: "Qonun moddasi topilmadi." });
  }
  res.json({ success: true, data: article });
});

export default router;
