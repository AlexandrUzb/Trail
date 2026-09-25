import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { storageService } from '../services/storageService.js';
import { getSupabaseServerClient } from '../services/supabaseClient.js';

const router = express.Router();
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const templatesList = [
  {
    id: 1,
    name: "Ishdan bo'shash arizasi",
    category: "Mehnat",
    code: "mehnat_ariza",
    description: "Mehnat kodeksining 97-moddasiga muvofiq o'z xohishi bilan ishdan bo'shash arizasi."
  },
  {
    id: 2,
    name: "Turar joy ijara shartnomasi",
    category: "Ko'chmas mulk",
    code: "ijara_shartnoma",
    description: "Fuqarolik kodeksining 535-moddasiga asosan turar joyni ijaraga berish bo'yicha namunaviy shartnoma."
  },
  {
    id: 3,
    name: "Qarzdorlikni qaytarish talabnomasi (Pretenziya)",
    category: "Moliyaviy huquq",
    code: "pretenziya",
    description: "Qarz shartnomasi bo'yicha majburiyatni ixtiyoriy bajarish to'g'risida rasmiy talabnoma."
  },
  {
    id: 4,
    name: "Mehnat ta'tili berish arizasi",
    category: "Mehnat",
    code: "mehnat_tatil",
    description: "Mehnat kodeksining 119-moddasi bo'yicha yillik haq to'lanadigan mehnat ta'tili olish arizasi."
  },
  {
    id: 5,
    name: "Ishga qabul qilish to'g'risida ariza",
    category: "Mehnat",
    code: "ishga_qabul",
    description: "Xodimni ma'lum lavozimga ishga qabul qilish haqidagi standart ariza."
  },
  {
    id: 6,
    name: "Xizmat ko'rsatish shartnomasi",
    category: "Fuqarolik huquqi",
    code: "xizmat_shartnoma",
    description: "Fuqarolik kodeksiga muvofiq haq evaziga xizmat ko'rsatish shartnomasi."
  }
];

// Helper to find template by numeric or string code/id
function findTemplate(idOrCode) {
  const numId = parseInt(idOrCode, 10);
  if (!isNaN(numId)) {
    const byNum = templatesList.find(t => t.id === numId);
    if (byNum) return byNum;
  }
  return templatesList.find(t => t.code === idOrCode || String(t.id) === String(idOrCode)) || null;
}

// ==========================================
// PUBLIC ENDPOINTS (Browsing & Catalog)
// ==========================================

// GET /api/templates - Catalog list
router.get('/', async (req, res) => {
  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('document_templates')
        .select('*, legal_categories(name_uz)')
        .eq('is_active', true)
        .order('title_uz');
      if (!error && data && data.length > 0) {
        const mapped = data.map(d => ({
          id: d.id,
          name: d.title_uz,
          category: d.legal_categories?.name_uz || 'Boshqa',
          description: d.description_uz || '',
          content_template: d.content_template,
          requires_login: d.requires_login,
        }));
        return res.json({
          success: true,
          message: "Shablonlar roʻyxati muvaffaqiyatli olindi.",
          count: mapped.length,
          data: mapped
        });
      }
    } catch (e) {
      console.warn('[TemplatesRoute] Supabase fetch fallback to local:', e.message);
    }
  }

  res.json({ 
    success: true, 
    message: "Shablonlar roʻyxati muvaffaqiyatli olindi.",
    count: templatesList.length, 
    data: templatesList 
  });
});

// GET /api/templates/:id - Template metadata
router.get('/:id', async (req, res) => {
  const sb = getSupabaseServerClient();
  if (sb && UUID_REGEX.test(req.params.id)) {
    try {
      const { data, error } = await sb
        .from('document_templates')
        .select('*, legal_categories(name_uz)')
        .eq('id', req.params.id)
        .maybeSingle();

      if (!error && data) {
        return res.json({
          success: true,
          message: "Shablon maʼlumotlari olingan.",
          data: {
            id: data.id,
            name: data.title_uz,
            category: data.legal_categories?.name_uz || 'Boshqa',
            description: data.description_uz || '',
            content_template: data.content_template,
            requires_login: data.requires_login,
          }
        });
      }
    } catch {}
  }

  const tmpl = findTemplate(req.params.id);
  if (!tmpl) {
    return res.status(404).json({ 
      success: false, 
      message: "Shablon topilmadi.",
      error: "Shablon topilmadi." 
    });
  }
  res.json({ 
    success: true, 
    message: "Shablon maʼlumotlari olingan.",
    data: tmpl 
  });
});

// ==========================================
// PROTECTED HUJJAT INTERACTION ENDPOINTS
// (Download, Copy, Edit, Export, Save)
// Requires valid authentication token!
// ==========================================

/**
 * POST /api/templates/:id/download
 * Verifies authorization to download template in docx, pdf, or txt format.
 */
router.post('/:id/download', requireAuth, async (req, res) => {
  const tmpl = findTemplate(req.params.id);
  const { format = 'docx', title, content } = req.body || {};
  const userId = req.user.id || req.user.userId;

  // Persist to Supabase public.user_documents if user ID is a valid UUID
  const sb = getSupabaseServerClient();
  if (sb && UUID_REGEX.test(userId)) {
    try {
      const isTemplateUuid = UUID_REGEX.test(req.params.id);
      await sb.from('user_documents').insert({
        user_id: userId,
        template_id: isTemplateUuid ? req.params.id : null,
        title: title || tmpl?.name || 'Hujjat',
        content: content || 'Hujjat matni yuklab olindi',
        status: 'completed'
      });
    } catch (err) {
      console.warn('[TemplatesRoute] user_documents insert warning:', err.message);
    }
  }

  const action = storageService.recordTemplateAction(
    userId,
    tmpl ? tmpl.id : req.params.id,
    'download',
    { format, templateName: tmpl ? tmpl.name : 'Hujjat' }
  );

  return res.json({
    success: true,
    message: "Hujjatni yuklab olishga ruxsat berildi.",
    data: {
      templateId: req.params.id,
      templateName: tmpl ? tmpl.name : 'Hujjat',
      format,
      actionId: action.id,
      authorizedUser: req.user.email
    }
  });
});

/**
 * POST /api/templates/:id/copy
 * Verifies authorization to copy template content.
 */
router.post('/:id/copy', requireAuth, async (req, res) => {
  const tmpl = findTemplate(req.params.id);
  const { title, content } = req.body || {};
  const userId = req.user.id || req.user.userId;

  // Persist to Supabase public.user_documents if user ID is a valid UUID
  const sb = getSupabaseServerClient();
  if (sb && UUID_REGEX.test(userId)) {
    try {
      const isTemplateUuid = UUID_REGEX.test(req.params.id);
      await sb.from('user_documents').insert({
        user_id: userId,
        template_id: isTemplateUuid ? req.params.id : null,
        title: title || tmpl?.name || 'Hujjat',
        content: content || 'Hujjat matnidan nusxa olindi',
        status: 'completed'
      });
    } catch (err) {
      console.warn('[TemplatesRoute] user_documents insert warning:', err.message);
    }
  }

  const action = storageService.recordTemplateAction(
    userId,
    tmpl ? tmpl.id : req.params.id,
    'copy',
    { templateName: tmpl ? tmpl.name : 'Hujjat' }
  );

  return res.json({
    success: true,
    message: "Hujjat matnidan nusxa olishga ruxsat berildi.",
    data: {
      templateId: req.params.id,
      templateName: tmpl ? tmpl.name : 'Hujjat',
      actionId: action.id,
      authorizedUser: req.user.email
    }
  });
});

/**
 * POST /api/templates/:id/edit
 * Verifies authorization and saves customized edits / form data.
 */
router.post('/:id/edit', requireAuth, async (req, res) => {
  const tmpl = findTemplate(req.params.id);
  const { formData = {}, title, content } = req.body || {};
  const userId = req.user.id || req.user.userId;

  // Persist to Supabase public.user_documents if user ID is a valid UUID
  const sb = getSupabaseServerClient();
  if (sb && UUID_REGEX.test(userId)) {
    try {
      const isTemplateUuid = UUID_REGEX.test(req.params.id);
      await sb.from('user_documents').insert({
        user_id: userId,
        template_id: isTemplateUuid ? req.params.id : null,
        title: title || tmpl?.name || 'Hujjat tahriri',
        content: content || JSON.stringify(formData),
        status: 'draft'
      });
    } catch (err) {
      console.warn('[TemplatesRoute] user_documents edit warning:', err.message);
    }
  }

  const savedEdit = storageService.saveUserTemplateEdit(
    userId,
    tmpl ? tmpl.id : req.params.id,
    formData
  );

  const action = storageService.recordTemplateAction(
    userId,
    tmpl ? tmpl.id : req.params.id,
    'edit',
    { templateName: tmpl ? tmpl.name : 'Hujjat' }
  );

  return res.json({
    success: true,
    message: "Hujjat tahriri muvaffaqiyatli saqlandi.",
    data: {
      templateId: req.params.id,
      templateName: tmpl ? tmpl.name : 'Hujjat',
      savedEdit,
      authorizedUser: req.user.email
    }
  });
});

/**
 * POST /api/templates/:id/export
 * Verifies authorization to export document.
 */
router.post('/:id/export', requireAuth, (req, res) => {
  const tmpl = findTemplate(req.params.id);
  const { format = 'docx' } = req.body || {};
  const userId = req.user.id || req.user.userId;

  const action = storageService.recordTemplateAction(
    userId,
    tmpl ? tmpl.id : req.params.id,
    'export',
    { format, templateName: tmpl ? tmpl.name : 'Hujjat' }
  );

  return res.json({
    success: true,
    message: "Hujjat eksport qilishga ruxsat berildi.",
    data: {
      templateId: req.params.id,
      templateName: tmpl ? tmpl.name : 'Hujjat',
      format,
      actionId: action.id,
      authorizedUser: req.user.email
    }
  });
});

/**
 * POST /api/templates/track-document
 * Consumes document generation/export quota for user
 */
router.post('/track-document', (req, res) => {
  try {
    const { userId } = req.body || {};
    if (!userId) return res.json({ allowed: true });
    const result = storageService.checkAndConsumeDocumentQuota(userId);
    return res.json(result);
  } catch (err) {
    return res.json({ allowed: true });
  }
});

export default router;
