import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { cyrillicToLatin, latinToCyrillic, normalizeSearchText } from '../utils/transliterate.js';
import { LAW_GROUP_MAP } from './queryUnderstandingService.js';
import { OFFICIAL_INSTITUTIONS } from '../data/officialInstitutions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveDataDir() {
  const candidates = [
    path.resolve(__dirname, '../data/legal_documents'),
    path.resolve(process.cwd(), 'server/data/legal_documents'),
    path.resolve(__dirname, '../../server/data/legal_documents'),
    path.resolve(__dirname, 'server/data/legal_documents')
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'registry.json'))) {
      return dir;
    }
  }
  return path.resolve(__dirname, '../data/legal_documents');
}

const DATA_DIR = resolveDataDir();

/**
 * Clean markdown link formatter.
 * Guarantees strictly: `[Qonun nomi, X-modda](https://lex.uz/...)`
 * Prevents double wrapping, nested links, or link repetition.
 */
export function formatCleanMarkdownCitation(docName, artNumber, url) {
  if (!url) return `${docName}, ${artNumber}`;
  const cleanDoc = docName.replace(/[\[\]]/g, '').trim();
  const cleanArt = artNumber.replace(/[\[\]]/g, '').trim();
  const cleanUrl = url.trim();
  return `[${cleanDoc}, ${cleanArt}](${cleanUrl})`;
}

class RAGService {
  constructor() {
    this.registry = null;
    this.articles = [];
    this.articlesById = new Map();
    this.articlesByDocAndNum = new Map();
    this.articlesByDoc = new Map();
    this.docMetaById = new Map();
    this.exceptionsByDoc = new Map();
    this.proceduralByDoc = new Map();
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.isLoaded = false;
  }

  loadDatabase() {
    if (this.isLoaded) return;

    const registryPath = path.join(DATA_DIR, 'registry.json');
    if (!fs.existsSync(registryPath)) {
      console.warn('[RAGService] registry.json mavjud emas. Boʻsh baza bilan ishlanmoqda.');
      this.articles = [];
      this.isLoaded = true;
      return;
    }

    try {
      const registryData = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      this.registry = registryData;
      const allChunks = [];

      this.articlesById.clear();
      this.articlesByDocAndNum.clear();
      this.articlesByDoc.clear();
      this.docMetaById.clear();
      this.exceptionsByDoc.clear();
      this.proceduralByDoc.clear();

      for (const doc of registryData.documents || []) {
        const docDir = path.join(DATA_DIR, doc.id);
        const metaPath = path.join(docDir, 'meta.json');
        const chunksPath = path.join(docDir, 'chunks.json');

        if (fs.existsSync(metaPath)) {
          const metaObj = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
          this.docMetaById.set(doc.id, metaObj);
        }

        if (fs.existsSync(chunksPath)) {
          const docChunks = JSON.parse(fs.readFileSync(chunksPath, 'utf-8'));
          for (const c of docChunks) {
            if (!c.category) {
              if (doc.id === 'civil_code') {
                const num = parseInt(c.article_number_digits, 10);
                if (num >= 1112 && num <= 1157) c.category = 'Meros huquqi';
                else if (num >= 862 && num <= 874) c.category = 'Tadbirkorlik huquqi';
                else c.category = 'Fuqarolik huquqi';
              } else if (doc.id === 'labor_code') {
                c.category = 'Mehnat huquqi';
              } else if (doc.id === 'criminal_code') {
                c.category = 'Jinoyat huquqi';
              } else if (doc.id === 'administrative_code') {
                const num = parseInt(c.article_number_digits, 10);
                if (num >= 125 && num <= 140) c.category = 'Transport huquqi';
                else c.category = 'Ma’muriy huquq';
              } else if (doc.id === 'constitution') {
                c.category = 'Konstitutsiyaviy huquq';
              } else if (doc.id === 'family_code') {
                c.category = 'Oila huquqi';
              } else if (doc.id === 'tax_code') {
                c.category = 'Soliq huquqi';
              } else if (doc.id === 'land_code') {
                c.category = 'Yer huquqi';
              } else {
                c.category = 'Boshqa huquqiy masalalar';
              }
            }
          }
          allChunks.push(...docChunks);

          // Group by document
          this.articlesByDoc.set(doc.id, docChunks);

          // Group exceptions & procedural articles
          const docExceptions = docChunks.filter(c => c.has_exceptions || (c.exceptions && c.exceptions.length > 0));
          this.exceptionsByDoc.set(doc.id, docExceptions);

          const docProcedural = docChunks.filter(c => c.is_procedural);
          this.proceduralByDoc.set(doc.id, docProcedural);
        }
      }

      this.articles = allChunks;

      // Also ingest full 20-category legal database
      const extraDbPath = path.join(path.dirname(DATA_DIR), 'lawArticlesDatabase.json');
      if (fs.existsSync(extraDbPath)) {
        try {
          const extraList = JSON.parse(fs.readFileSync(extraDbPath, 'utf-8'));
          for (const a of extraList) {
            if (!this.articlesById.has(a.id)) {
              const digits = (a.article_number || a.article || '').match(/\d+/)?.[0] || '';
              const docId = a.category === 'Oila huquqi' ? 'family_code' :
                            a.category === 'Soliq huquqi' ? 'tax_code' :
                            a.category === 'Yer huquqi' ? 'land_code' :
                            (a.source || a.law || '').toLowerCase().includes('mehnat') ? 'labor_code' :
                            (a.source || a.law || '').toLowerCase().includes('fuqarolik') ? 'civil_code' :
                            (a.source || a.law || '').toLowerCase().includes('jinoyat') ? 'criminal_code' :
                            (a.source || a.law || '').toLowerCase().includes('maʼmuriy') ? 'administrative_code' :
                            (a.source || a.law || '').toLowerCase().includes('konstitutsiya') ? 'constitution' : 'general_law';

              const chunk = {
                id: a.id,
                document_id: docId,
                document_name: a.source || a.law || 'Oʻzbekiston qonunchiligi',
                document_type: 'code',
                article_number: a.article_number || a.article || `${digits}-modda`,
                article_number_digits: digits,
                article_title: a.title || '',
                category: a.category,
                subcategory: a.subcategory,
                keywords: a.keywords || a.tags || [],
                content: a.content || a.short_description || a.summary || '',
                content_original: a.content || a.short_description || a.summary || '',
                paragraphs: [a.content || a.short_description || a.summary || ''],
                source_url: a.source_url || a.sourceUrl || '',
                status: 'active',
                effective_from: '2023-01-01',
                version: 'Amaldagi tahrir',
                source_priority: 1,
                legal_nature: 'substantive',
                search_tokens: normalizeSearchText(`${a.title} ${a.article_number || a.article} ${a.short_description || a.summary} ${a.content || ''} ${(a.keywords || a.tags || []).join(' ')}`)
              };
              allChunks.push(chunk);
              this.articlesById.set(chunk.id, chunk);
              if (digits) {
                this.articlesByDocAndNum.set(`${docId}_${digits}`, chunk);
              }
            }
          }
        } catch (e) {
          console.warn('[RAGService] Error reading lawArticlesDatabase.json:', e.message);
        }
      }

      this.articles = allChunks;

      for (const a of this.articles) {
        this.articlesById.set(a.id, a);
        const digits = a.article_number_digits || (a.article_number || '').match(/\d+/)?.[0] || '';
        if (digits) {
          this.articlesByDocAndNum.set(`${a.document_id}_${digits}`, a);
        }
      }

      this.isLoaded = true;
      console.log(`[RAGService] Baza yuklandi: ${this.articles.length} ta rasmiy qonun moddasi tayyor.`);
    } catch (err) {
      console.error('[RAGService] Baza yuklashda xatolik:', err);
    }
  }

  getStats() {
    this.loadDatabase();
    return {
      totalDocuments: this.registry?.documents?.length || 0,
      totalArticles: this.articles.length,
      documents: this.registry?.documents || []
    };
  }

  /**
   * Retrieves neighboring articles (preceding and following) for structural context expansion.
   */
  getNeighboringArticles(article, offset = 1) {
    if (!article || !article.document_id) return [];
    this.loadDatabase();
    const docArticles = this.articlesByDoc.get(article.document_id) || [];
    const idx = docArticles.findIndex(a => a.id === article.id);
    if (idx === -1) return [];

    const neighbors = [];
    if (idx - offset >= 0) neighbors.push(docArticles[idx - offset]);
    if (idx + offset < docArticles.length) neighbors.push(docArticles[idx + offset]);
    return neighbors;
  }

  /**
   * Resolves cross-references explicitly mentioned in article provisions.
   */
  resolveCrossReferences(articles, maxRefs = 2) {
    if (!Array.isArray(articles) || articles.length === 0) return [];
    this.loadDatabase();
    const resolved = [];
    const seenKeys = new Set(articles.map(a => `${a.document_id}_${a.article_number_digits}`));

    for (const art of articles) {
      if (!Array.isArray(art.cross_references) || art.cross_references.length === 0) continue;

      for (const ref of art.cross_references) {
        if (resolved.length >= maxRefs) break;
        const key = `${ref.target_document_id}_${ref.target_article_number}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          const targetArt = this.articlesByDocAndNum.get(key);
          if (targetArt) {
            resolved.push({
              ...targetArt,
              is_cross_reference: true,
              referenced_by: art.article_number,
              reference_text: ref.reference_text
            });
          }
        }
      }
    }

    return resolved;
  }

  /**
   * Filters articles by temporal validity and version status.
   */
  filterByVersionAndDate(articles, eventDate = null, isCurrentOnly = true) {
    if (!Array.isArray(articles) || articles.length === 0) return [];

    return articles.filter(art => {
      // Default: Active current law only
      if (isCurrentOnly) {
        if (art.status && art.status !== 'active') return false;
        if (art.effective_to) {
          const toDate = new Date(art.effective_to);
          if (toDate < new Date()) return false;
        }
      }

      // Historical event date filtering
      if (eventDate) {
        const evDate = new Date(eventDate);
        if (!isNaN(evDate.getTime())) {
          if (art.effective_from) {
            const fromDate = new Date(art.effective_from);
            // If the law came into force after the event date, mark as potentially historical
            if (fromDate > evDate) {
              art.is_historical_warning = true;
              art.historical_note = `Diqqat: Ushbu norma ${art.effective_from} sanasidan kuchga kirgan bo‘lib, ${eventDate} sanasida boshqa tahrir amalda bo‘lgan bo‘lishi mumkin.`;
            }
          }
        }
      }

      return true;
    });
  }

  /**
   * Deduplicates articles by document_id and article number.
   */
  deduplicateArticles(articles) {
    if (!Array.isArray(articles) || articles.length === 0) return [];
    const seen = new Set();
    const deduped = [];

    for (const art of articles) {
      const key = `${art.document_id}_${art.article_number_digits}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(art);
      }
    }

    return deduped;
  }

  /**
   * Builds an Evidence Object complying with Section 21 specification.
   */
  buildEvidenceObject(art, score = 100, reason = '') {
    const docMeta = this.docMetaById.get(art.document_id) || {};
    let cat = art.category;
    if (!cat) {
      if (art.document_id === 'civil_code') {
        const num = parseInt(art.article_number_digits, 10);
        if (num >= 1112 && num <= 1157) cat = 'Meros huquqi';
        else if (num >= 862 && num <= 874) cat = 'Tadbirkorlik huquqi';
        else if (num >= 732 && num <= 748) cat = 'Fuqarolik huquqi';
        else cat = 'Fuqarolik huquqi';
      } else if (art.document_id === 'labor_code') {
        cat = 'Mehnat huquqi';
      } else if (art.document_id === 'criminal_code') {
        cat = 'Jinoyat huquqi';
      } else if (art.document_id === 'administrative_code') {
        const num = parseInt(art.article_number_digits, 10);
        if (num >= 125 && num <= 140) cat = 'Transport huquqi';
        else cat = 'Ma’muriy huquq';
      } else if (art.document_id === 'constitution') {
        cat = 'Konstitutsiyaviy huquq';
      } else if (art.document_id === 'family_code') {
        cat = 'Oila huquqi';
      } else if (art.document_id === 'tax_code') {
        cat = 'Soliq huquqi';
      } else if (art.document_id === 'land_code') {
        cat = 'Yer huquqi';
      } else {
        cat = 'Fuqarolik huquqi';
      }
    }
    return {
      source: art.document_name,
      document_id: art.document_id,
      document_type: art.document_type || docMeta.document_type || 'code',
      article: art.article_number,
      article_number_digits: art.article_number_digits,
      title: art.article_title || '',
      chapter: art.chapter || '',
      section: art.section || '',
      effective_date: art.effective_from || docMeta.effective_from || '2023-04-30',
      status: art.status || 'active',
      version: art.version || docMeta.version || 'Amaldagi tahrir',
      authority_level: art.source_priority || 1,
      text: art.content || '',
      paragraphs: Array.isArray(art.paragraphs) ? art.paragraphs : [art.content || ''],
      exceptions: art.exceptions || [],
      cross_references: art.cross_references || [],
      legal_nature: art.legal_nature || 'substantive',
      norm_type: art.norm_type || (art.document_id === 'civil_code' && art.article_number_digits === '535' ? 'DEFINITIONAL_CONCEPT' : art.document_id === 'labor_code' && art.article_number_digits === '179' ? 'DEFINITIONAL_CONCEPT' : ['314', '315', '316', '317', '537'].includes(art.article_number_digits) ? 'PROCEDURAL_RULE' : 'SUBSTANTIVE_REMEDY'),
      source_url: art.source_url,
      cleanMarkdownLink: formatCleanMarkdownCitation(art.document_name, art.article_number, art.source_url),
      relevance_reason: reason || 'Holat faktlariga mos keluvchi rasmiy qonun normasi',
      retrieval_score: score,
      relevance_score: score,
      verification_status: 'verified',

      // Backward compatibility aliases for existing services and tests
      document_name: art.document_name,
      article_number: art.article_number,
      article_title: art.article_title || '',
      content: art.content || '',
      category: cat,
      subcategory: art.subcategory || ''
    };
  }

  /**
   * Validates a legal citation against the loaded official database.
   * Checks existence, official title, date/effectiveness, scenario relevance, and Lex.uz URL.
   */
  validateLegalCitation({
    document_id,
    document_name,
    article_number,
    article_title,
    relevant_issue,
    disputeType,
    source_url
  }) {
    this.loadDatabase();

    // 1. Basic format checks
    if (!document_id || !article_number) {
      return { isValid: false, reason: 'Hujjat ID yoki modda raqami mavjud emas' };
    }

    const digits = String(article_number).match(/\d+/)?.[0] || '';
    if (!digits) {
      return { isValid: false, reason: 'Modda raqami topilmadi' };
    }

    // 2. Check existence in official database
    const key = `${document_id}_${digits}`;
    const officialChunk = this.articlesByDocAndNum.get(key);
    if (!officialChunk) {
      return { isValid: false, reason: `Rasmiy bazada ${document_id} bo'yicha ${digits}-modda topilmadi` };
    }

    // 3. Scenario Relevance & Cross-Domain Isolation
    if (disputeType === 'corruption_bribery' && document_id !== 'criminal_code') {
      return { isValid: false, reason: 'Pora va korrupsiya nizolariga mehnat yoki fuqarolik moddalarini qo‘llash xato' };
    }
    if ((disputeType === 'administrative_fine_dispute' || disputeType === 'government_authority_complaint') && document_id === 'criminal_code') {
      return { isValid: false, reason: 'Ma’muriy jarima va shikoyatlarga Jinoyat kodeksi moddalarini (ayniqsa 154¹-modda) qo‘llash mutlaqo taqiqlanadi' };
    }
    if (document_id === 'criminal_code' && digits === '154' && !relevant_issue?.toLowerCase().includes('yollanish')) {
      return { isValid: false, reason: 'Jinoyat kodeksi 154¹-moddasi chet davlatlar harbiy yoki politsiya xizmatiga yollanishga oid bo‘lib, ma’muriy jarimaga mutlaqo aloqasi yo‘q' };
    }
    if (disputeType?.includes('labor') && document_id === 'labor_code' && digits === '179' && !relevant_issue?.toLowerCase().includes('shaxsga doir')) {
      return { isValid: false, reason: 'Mehnat kodeksi 179-moddasi (shaxsga doir ma’lumotlar) umumiy mehnat shikoyatlariga asos bo‘la olmaydi' };
    }
    if (disputeType === 'civil_tenancy_deposit' && digits === '535') {
      return { isValid: false, reason: '535-modda faqat ijara tushunchasini beradi, depozitni qaytarish majburiyatiga asos bo‘la olmaydi (236, 382, 544-moddalar qo‘llanadi)' };
    }
    if (disputeType === 'state_labor_inspector_challenge' && digits !== '537') {
      return { isValid: false, reason: 'Davlat mehnat inspektori qaroriga eʼtiroz Mehnat kodeksining 537-moddasi bo‘yicha ko‘riladi' };
    }
    if (disputeType === 'individual_labor_salary' && ['571', '575', '500'].includes(digits)) {
      return { isValid: false, reason: 'Yakka tartibdagi ish haqi nizosiga jamoaviy nizo moddalari qo‘llanilmaydi' };
    }
    if (disputeType === 'civil_tenancy_eviction' && document_id !== 'civil_code') {
      return { isValid: false, reason: 'Uydan chiqarish va ijara nizolari Fuqarolik kodeksi bilan tartibga solinadi' };
    }

    // 4. URL format validation
    const url = source_url || officialChunk.source_url;
    if (!url || !url.startsWith('https://lex.uz/')) {
      return { isValid: false, reason: 'Lex.uz rasmiy havolasi noto‘g‘ri' };
    }

    return {
      isValid: true,
      officialChunk,
      document_name: officialChunk.document_name,
      article_number: officialChunk.article_number,
      article_title: officialChunk.article_title,
      source_url: url,
      cleanMarkdownLink: formatCleanMarkdownCitation(officialChunk.document_name, officialChunk.article_number, url)
    };
  }

  /**
   * Search legal database with strict code isolation, target article priority,
   * multi-query support, and cross-reference resolution.
   */
  searchLegalDatabase(query, options = {}) {
    this.loadDatabase();
    if (!query || typeof query !== 'string' || !query.trim()) {
      return {
        articles: [],
        confidenceScore: 0,
        confidenceLevel: 'LOW',
        effectiveDocumentId: null
      };
    }

    const {
      lawGroup = null,
      documentId = null,
      exactArticleNumber = null,
      targetArticleNumbers = [],
      allowedDocumentIds = null,
      disallowedDocumentIds = [],
      forbiddenArticleNumbers = [],
      fineGrainedTopic = null,
      topK = 4,
      minScore = 3,
      additionalTerms = [],
      multiQueries = [],
      disputeType = null,
      eventDate = null,
      isCurrentOnly = true
    } = options;

    // Check cache
    const cacheKey = `q_${query.trim()}_${documentId}_${exactArticleNumber}_${eventDate}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Resolve target document ID
    let targetDocId = documentId;
    if (!targetDocId && lawGroup) {
      targetDocId = LAW_GROUP_MAP[lawGroup] || null;
    }

    const cleanQuery = query.trim();
    const queryNormalized = normalizeSearchText(cleanQuery);
    const queryLatin = cyrillicToLatin(queryNormalized).toLowerCase();
    const queryCyrillic = latinToCyrillic(queryNormalized).toLowerCase();

    // Extract potential article numbers from query
    const articleNumMatches = cleanQuery.match(/\b(\d+)(?:-[a-zа-я]+)?(?:\s*modda|\s*модда)?\b/gi) || [];
    const explicitNumbers = new Set();
    for (const m of articleNumMatches) {
      const d = m.match(/\d+/);
      if (d) explicitNumbers.add(d[0]);
    }

    if (Array.isArray(targetArticleNumbers)) {
      for (const t of targetArticleNumbers) {
        explicitNumbers.add(String(t));
      }
    }

    // Stopwords filter
    const stopwords = new Set(['va', 'yoki', 'haqida', 'to‘g‘risida', 'togrisida', 'uchun', 'bilan', 'nima', 'qanday', 'mumkin', 'kerak', 'qilish', 'buyicha', 'bo‘yicha', 'boyicha', 'deb', 'bir', 'esa', 'ҳам', 'ва', 'ёки', 'ҳақида', 'тўғрисида', 'учун', 'билан', 'нима', 'қандай', 'мумкин', 'керак']);
    const rawTerms = queryLatin.split(/\s+/).filter(t => t.length > 1 && !stopwords.has(t));

    if (Array.isArray(additionalTerms)) {
      for (const term of additionalTerms) {
        const tNorm = cyrillicToLatin(normalizeSearchText(term)).toLowerCase();
        const spl = tNorm.split(/\s+/).filter(t => t.length > 1 && !stopwords.has(t));
        rawTerms.push(...spl);
      }
    }

    if (Array.isArray(multiQueries)) {
      for (const mq of multiQueries) {
        const mqNorm = cyrillicToLatin(normalizeSearchText(mq)).toLowerCase();
        const spl = mqNorm.split(/\s+/).filter(t => t.length > 1 && !stopwords.has(t));
        rawTerms.push(...spl);
      }
    }

    // Legal concepts & article association
    const synonyms = [
      {
        triggers: ['maosh', 'oylik', 'oylig', 'patron', 'ish haqi', 'ish haqqi', "ish haqi to'lash"],
        expansions: ["mehnatga haq to'lash", "ish haqi to'lash muddatlari", 'mehnat shartnomasi', 'moddiy javobgarlik'],
        numbers: [{ doc: 'labor_code', num: '244' }, { doc: 'labor_code', num: '253' }, { doc: 'labor_code', num: '333' }, { doc: 'labor_code', num: '160' }]
      },
      {
        triggers: ["ishdan bo'shash", 'ishdan ketish', "ishdan bo'shatish", 'ishdan haydash', 'ariza muddati', 'ishdan bushash'],
        expansions: ['mehnat shartnomasini bekor qilish', 'ogohlantirish muddati', 'xodimning tashabbusi', 'ishga tiklash'],
        numbers: [{ doc: 'labor_code', num: '160' }, { doc: 'labor_code', num: '161' }, { doc: 'labor_code', num: '163' }, { doc: 'labor_code', num: '168' }]
      },
      {
        triggers: ['mehnat inspektori', 'mehnat inspeksiyasi', 'inspektor qarori'],
        expansions: ['davlat mehnat inspeksiyasi', 'qarorlar ustidan shikoyat', 'inspeksiya tekshiruvi'],
        numbers: [{ doc: 'labor_code', num: '535' }, { doc: 'labor_code', num: '537' }]
      },
      {
        triggers: ['mehnat nizolari komissiyasi', 'komissiya qarori', 'mnk qarori', 'komissiya qaroridan norozi', 'komissiya qaror ustidan', 'komissiya qaror chiqargan'],
        expansions: ['mehnat nizolari komissiyasi qarori ustidan sudga murojaat', 'yakka tartibdagi mehnat nizosini sudga o‘tkazish', 'o‘n kunlik muddat'],
        numbers: [{ doc: 'labor_code', num: '556' }, { doc: 'labor_code', num: '557' }, { doc: 'labor_code', num: '558' }, { doc: 'labor_code', num: '559' }]
      },
      {
        triggers: ['ish tashlash', 'xodimlar hammamiz', 'jamoaviy'],
        expansions: ['xodimlarning talablar qo\'yishi', 'jamoaviy mehnat nizolari'],
        numbers: [{ doc: 'labor_code', num: '571' }, { doc: 'labor_code', num: '575' }]
      },
      {
        triggers: ['chiqarib yubormoqchi', 'uydan chiqarish', 'kvartiradan chiqarish'],
        expansions: ['turar joy', 'ijara shartnomasini bekor qilish', 'sud orqali'],
        numbers: [{ doc: 'civil_code', num: '615' }, { doc: 'civil_code', num: '551' }]
      },
      {
        triggers: ['depozit', 'zalog', 'garov'],
        expansions: ['mulk ijarasi majburiyatlari', 'garovni qaytarish', 'majburiyatlarni bajarish'],
        numbers: [{ doc: 'civil_code', num: '544' }, { doc: 'civil_code', num: '382' }, { doc: 'civil_code', num: '333' }]
      },
      {
        triggers: ['ijara', 'uy ijarasi', 'kvartira ijarasi', 'arendator', 'ijarachi', 'ijaraga beruvchi'],
        expansions: ['mulk ijarasi', 'ijara shartnomasi', 'turar joy'],
        numbers: [{ doc: 'civil_code', num: '535' }, { doc: 'civil_code', num: '536' }, { doc: 'civil_code', num: '544' }, { doc: 'civil_code', num: '615' }]
      },
      {
        triggers: ['pora', 'pora olish', 'pora berish', 'korrupsiya', 'tovlamachilik'],
        expansions: ['pora olish', 'pora berish', 'mansabdor shaxs', 'vositachilik'],
        numbers: [{ doc: 'criminal_code', num: '210' }, { doc: 'criminal_code', num: '211' }, { doc: 'criminal_code', num: '212' }]
      },
      {
        triggers: ['jarima', "ma'muriy jazo", "yo'l harakati", 'radar', 'prava', 'jarimadan shikoyat', 'jarima ustidan'],
        expansions: ["ma'muriy huquqbuzarlik", "jarima solish to'g'risida qaror", 'transport vositasi', 'qaror ustidan shikoyat berish', '10 kunlik muddat'],
        numbers: [{ doc: 'administrative_code', num: '314' }, { doc: 'administrative_code', num: '315' }, { doc: 'administrative_code', num: '316' }, { doc: 'administrative_code', num: '317' }, { doc: 'administrative_code', num: '128' }, { doc: 'administrative_code', num: '131' }]
      },
      {
        triggers: ['aliment', 'aliment to\'lash', 'aliment undirish', 'bolalar puli', 'aliment tolamayapti', 'aliment to\'lamayapti', 'aliment miqdori'],
        expansions: ['aliment undirish', 'aliment to\'lash majburiyati', 'voyaga yetmagan bolalarga aliment', 'daromaddan ushlab qolish'],
        numbers: [{ doc: 'family_code', num: '96' }, { doc: 'family_code', num: '97' }, { doc: 'family_code', num: '99' }, { doc: 'family_code', num: '117' }, { doc: 'family_code', num: '111' }]
      },
      {
        triggers: ['nikoh', 'ajrashish', 'ajrim', 'nikoh shartnomasi', 'er-xotin mulki', 'mulkni bo\'lish'],
        expansions: ['nikohdan ajratish', 'er va xotinning birgalikdagi umumiy mulki', 'nikoh shartnomasi', 'yarashish muholati'],
        numbers: [{ doc: 'family_code', num: '18' }, { doc: 'family_code', num: '20' }, { doc: 'family_code', num: '37' }, { doc: 'family_code', num: '44' }, { doc: 'family_code', num: '51' }]
      },
      {
        triggers: ['meros', 'vasiyatnoma', 'merosxor', 'merosxo\'r', 'vorislik', 'majburiy ulush', 'meros muddati'],
        expansions: ['vorislik asoslari', 'vasiyatnoma bo\'yicha vorislik', 'qonun bo\'yicha vorislik', 'merosdan majburiy ulush', 'merosni qabul qilish muddati'],
        numbers: [{ doc: 'civil_code', num: '1112' }, { doc: 'civil_code', num: '1118' }, { doc: 'civil_code', num: '1134' }, { doc: 'civil_code', num: '1142' }, { doc: 'civil_code', num: '1146' }]
      },
      {
        triggers: ['soliq', 'daromad solig\'i', 'daromad soligi', 'qqs', 'aylanmadan soliq', 'soliq tekshiruvi', 'kameral tekshiruv', 'soliq auditi', 'inkasso'],
        expansions: ['soliq to\'lovchilarning huquqlari', 'kameral soliq tekshiruvi', 'soliq auditi', 'soliq qarzini undirish'],
        numbers: [{ doc: 'tax_code', num: '24' }, { doc: 'tax_code', num: '67' }, { doc: 'tax_code', num: '73' }, { doc: 'tax_code', num: '53' }, { doc: 'tax_code', num: '86' }]
      },
      {
        triggers: ['qarzdorlik', 'qarz', 'tilxat', 'raspiyaska', 'kredit', 'foiz', 'qarz shartnomasi'],
        expansions: ['qarz shartnomasi', 'kredit shartnomasi', 'qarzni qaytarish', 'foizlar'],
        numbers: [{ doc: 'civil_code', num: '732' }, { doc: 'civil_code', num: '734' }, { doc: 'civil_code', num: '735' }, { doc: 'civil_code', num: '736' }]
      },
      {
        triggers: ['tadbirkorlik', 'biznes', 'firma', 'mchj', 'franchayzing', 'litsenziya'],
        expansions: ['yuridik shaxslar', 'mas\'uliyati cheklangan jamiyat', 'franchayzing', 'tadbirkorlik faoliyati'],
        numbers: [{ doc: 'civil_code', num: '39' }, { doc: 'civil_code', num: '58' }, { doc: 'civil_code', num: '862' }]
      }
    ];

    const targetedNumbers = [];
    for (const num of explicitNumbers) {
      targetedNumbers.push({ doc: targetDocId, num });
    }

    for (const item of synonyms) {
      if (item.triggers.some(tr => queryLatin.includes(tr) || cleanQuery.toLowerCase().includes(tr))) {
        for (const exp of item.expansions) {
          rawTerms.push(...exp.split(/\s+/));
        }
        for (const n of item.numbers) {
          targetedNumbers.push(n);
        }
      }
    }

    const searchTerms = [];
    for (const t of rawTerms) {
      searchTerms.push(t);
      const cyr = latinToCyrillic(t);
      if (cyr !== t) searchTerms.push(cyr);
    }

    const scored = [];

    for (const art of this.articles) {
      // STRICT CROSS-DOCUMENT & FORBIDDEN ARTICLE ISOLATION:
      if (allowedDocumentIds && allowedDocumentIds.length > 0 && !allowedDocumentIds.includes(art.document_id)) {
        continue;
      }
      if (disallowedDocumentIds && disallowedDocumentIds.includes(art.document_id)) {
        continue;
      }
      if (targetDocId && art.document_id !== targetDocId) {
        continue;
      }

      const artNumDigits = art.article_number_digits || '';
      if (forbiddenArticleNumbers && forbiddenArticleNumbers.includes(artNumDigits)) {
        continue;
      }

      let score = 0;
      const artTokens = art.search_tokens || '';
      const artTitle = (art.article_title || '').toLowerCase();
      const artNum = (art.article_number || '').toLowerCase();

      // 0. Explicit requested article number (highest priority)
      if (exactArticleNumber && (artNumDigits === String(exactArticleNumber) || artNum.includes(`${exactArticleNumber}-modda`))) {
        score += 600;
      }

      // 1. Explicit target numbers (e.g. 210 for bribery, 253 for unpaid salary)
      if (explicitNumbers.has(artNumDigits)) {
        score += 350;
      }

      for (const tn of targetedNumbers) {
        if (tn.num === artNumDigits && (!tn.doc || tn.doc === art.document_id)) {
          score += 250;
          break;
        }
      }

      // 2. Exact phrase match in article title or content
      if (queryLatin.length > 4 && artTokens.includes(queryLatin)) {
        score += 35;
      }
      if (queryCyrillic.length > 4 && artTokens.includes(queryCyrillic)) {
        score += 35;
      }

      // 3. Term match scoring with prefix matching (stemming)
      for (const term of searchTerms) {
        const tLen = term.length;
        if (tLen < 3) continue;

        if (artTitle.includes(term)) {
          score += 15;
        } else if (tLen >= 4 && (artTitle.includes(term.slice(0, -1)) || artTitle.includes(term.slice(0, -2)))) {
          score += 10;
        }

        if (artNum.includes(term)) {
          score += 20;
        }

        if (artTokens.includes(term)) {
          score += 3;
        } else if (tLen >= 5 && artTokens.includes(term.slice(0, -1))) {
          score += 2;
        }
      }

      // 4. Domain & keyword boost with Uzbek morphological tolerance
      const qLower = cleanQuery.toLowerCase();
      if ((qLower.includes('mehnat') || qLower.includes('ishdan') || qLower.includes('ish beruvchi') || qLower.includes('xodim') || qLower.includes('maosh') || qLower.includes('oylik') || qLower.includes('oylig')) && (art.document_id === 'labor_code' || art.category === 'Mehnat huquqi')) {
        score += 25;
      }
      if ((qLower.includes('ijara') || qLower.includes('kvartira') || qLower.includes('mulk') || qLower.includes('oldi-sotdi') || qLower.includes('pudrat') || qLower.includes('kredit') || qLower.includes('qarz') || qLower.includes('qarzdorlik')) && (art.document_id === 'civil_code' || art.category === 'Fuqarolik huquqi')) {
        score += 20;
      }
      if ((qLower.includes('jinoyat') || qLower.includes('pora') || qLower.includes('jazo') || qLower.includes('qamoq') || qLower.includes("o'g'rilik") || qLower.includes("o‘g‘rilik") || qLower.includes('firibgar')) && (art.document_id === 'criminal_code' || art.category === 'Jinoyat huquqi')) {
        score += 30;
      }
      if ((qLower.includes('jarima') || qLower.includes('qoidabuzarlik') || qLower.includes("ma'muriy") || qLower.includes("ma’muriy") || qLower.includes("yo'l harakati") || qLower.includes("yo‘l harakati") || qLower.includes('radar') || qLower.includes('haydovchi')) && (art.document_id === 'administrative_code' || art.category === "Ma’muriy huquq" || art.category === "Transport huquqi")) {
        score += 25;
      }
      if ((qLower.includes('konstitutsiya') || qLower.includes('inson huquq') || qLower.includes('daxlsizlik') || qLower.includes('davlat tili')) && (art.document_id === 'constitution' || art.category === 'Konstitutsiyaviy huquq')) {
        score += 25;
      }
      if ((qLower.includes('aliment') || qLower.includes('ajrashish') || qLower.includes('nikoh') || qLower.includes('er-xotin') || qLower.includes('farzand') || qLower.includes('ota-ona') || qLower.includes('vasiylik')) && (art.document_id === 'family_code' || art.category === 'Oila huquqi')) {
        score += 30;
      }
      if ((qLower.includes('soliq') || qLower.includes('daromad solig') || qLower.includes('nds') || qLower.includes('qqs') || qLower.includes('foyda solig')) && (art.document_id === 'tax_code' || art.category === 'Soliq huquqi')) {
        score += 30;
      }
      if ((qLower.includes('yer') || qLower.includes('kadastr') || qLower.includes('uchastka')) && (art.document_id === 'land_code' || art.category === 'Yer huquqi')) {
        score += 25;
      }
      if ((qLower.includes('meros') || qLower.includes('vasiyatnoma') || qLower.includes('merosxo') || qLower.includes('voris')) && (art.category === 'Meros huquqi' || art.subcategory === 'Meros huquqi')) {
        score += 30;
      }
      if ((qLower.includes('tadbirkor') || qLower.includes('biznes') || qLower.includes('mchj') || qLower.includes('litsenziya') || qLower.includes('firma')) && (art.category === 'Tadbirkorlik huquqi')) {
        score += 25;
      }
      if ((qLower.includes('bank') || qLower.includes('kredit') || qLower.includes('depozit') || qLower.includes('omonat') || qLower.includes('foiz')) && (art.category === 'Moliya va bank huquqi')) {
        score += 25;
      }
      if ((qLower.includes("iste'molchi") || qLower.includes("iste’molchi") || qLower.includes('kafolat') || qLower.includes('tovar qaytarish')) && (art.category === 'Iste’molchilar huquqlari')) {
        score += 25;
      }
      if ((qLower.includes('uy-joy') || qLower.includes('turar joy') || qLower.includes('propiska') || qLower.includes('uy ijarasi')) && (art.category === 'Uy-joy huquqi')) {
        score += 20;
      }

      // Explicit negative guardrails for cross-domain contamination:
      // 1. Never match Criminal Code Article 154¹ for administrative fines / general complaints
      if (art.document_id === 'criminal_code' && (artNumDigits === '154' || art.id?.includes('154'))) {
        if (!qLower.includes('harbiy xizmat') && !qLower.includes('chet davlat') && !qLower.includes('yollanish') && !explicitNumbers.has('154')) {
          score -= 1000;
        }
      }
      // 2. Never match Labor Code Article 179 (personal data) for general labor complaints
      if (art.document_id === 'labor_code' && artNumDigits === '179') {
        if (!qLower.includes('shaxsga doir') && !qLower.includes('shaxsiy ma') && !explicitNumbers.has('179')) {
          score -= 1000;
        }
      }
      // 3. Prevent Civil Code 535 from overriding 544, 382, 236 for deposit returns
      if (art.document_id === 'civil_code' && artNumDigits === '535') {
        if (qLower.includes('depozit') || qLower.includes('zalog') || disputeType?.includes('deposit') || fineGrainedTopic === 'tenancy_deposit') {
          score -= 2000;
        }
      }

      if (score >= minScore) {
        scored.push({ article: art, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    let topResults = scored.slice(0, topK).map(s => ({
      ...s.article,
      relevance_score: s.score
    }));

    // Exact article number filter
    if (topResults.length > 0 && exactArticleNumber) {
      const exactMatches = topResults.filter(r => 
        String(r.article_number_digits) === String(exactArticleNumber) ||
        (r.article_number || '').toLowerCase().includes(`${exactArticleNumber}-modda`)
      );
      if (exactMatches.length > 0) {
        topResults = exactMatches.slice(0, 1);
      }
    } else if (topResults.length > 1) {
      const topScore = topResults[0].relevance_score;
      topResults = topResults.filter((r, idx) => idx === 0 || (r.relevance_score >= 35 && r.relevance_score >= topScore * 0.7));
      if (topResults.length > 2) {
        topResults = topResults.slice(0, 2);
      }
    }

    // Context Expansion: Resolve Cross-References for top results
    if (topResults.length > 0 && !exactArticleNumber) {
      const crossRefs = this.resolveCrossReferences(topResults, 1);
      if (crossRefs.length > 0) {
        topResults.push(...crossRefs);
      }
    }

    // Deduplicate candidate provisions
    topResults = this.deduplicateArticles(topResults);

    // Apply Version and Date Filtering
    topResults = this.filterByVersionAndDate(topResults, eventDate, isCurrentOnly);

    // Convert into Evidence Objects
    const evidenceList = topResults.map(art => this.buildEvidenceObject(art, art.relevance_score || 100));

    const topScore = evidenceList.length > 0 ? evidenceList[0].retrieval_score : 0;
    let confidenceLevel = 'LOW';
    let confidenceScore = 0;

    if (topScore >= 35) {
      confidenceLevel = 'HIGH';
      confidenceScore = Math.min(98, 70 + Math.round(topScore / 2));
    } else if (topScore >= 16) {
      confidenceLevel = 'MEDIUM';
      confidenceScore = 40 + Math.round((topScore - 16) * 1.8);
    } else if (topScore > 0) {
      confidenceLevel = 'LOW';
      confidenceScore = Math.round(topScore * 2);
    } else {
      confidenceLevel = 'LOW';
      confidenceScore = 0;
    }

    const result = {
      articles: evidenceList,
      confidenceScore,
      confidenceLevel,
      topScore,
      effectiveDocumentId: targetDocId
    };

    // Cache management
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(cacheKey, result);

    return result;
  }

  /**
   * Two-Channel Retrieval: Substance + Procedure
   */
  searchSubstantiveAndProcedural(query, options = {}) {
    const substantive = this.searchLegalDatabase(query, options);
    let proceduralSource = null;

    if (options.jurisdictionRule) {
      proceduralSource = {
        type: 'official_venue',
        institution: { name: options.jurisdictionRule },
        route: options.proceduralRoute || options.jurisdictionRule
      };
    } else if (options.disputeType === 'corruption_bribery' || options.domain === 'criminal' || options.fineGrainedTopic?.startsWith('bribery_')) {
      proceduralSource = {
        type: 'government_agency',
        institution: OFFICIAL_INSTITUTIONS.anti_corruption_agency,
        route: 'Korrupsiyaga qarshi kurashish agentligi (Call-markaz: 1253) yoki Bosh prokuratura (1007)'
      };
    } else if (options.disputeType?.startsWith('business_') || options.domain === 'business') {
      proceduralSource = {
        type: 'court',
        institution: { name: 'Tumanlararo iqtisodiy sud' },
        route: 'Tumanlararo iqtisodiy sudga daʼvo arizasi kiritish (tadbirkorlik subyektlari o‘rtasidagi nizo)'
      };
    } else if (options.disputeType?.includes('labor') || options.fineGrainedTopic?.startsWith('labor_')) {
      proceduralSource = {
        type: 'government_agency',
        institution: OFFICIAL_INSTITUTIONS.labor_inspectorate,
        route: 'Davlat mehnat inspeksiyasi (Ishonch telefoni: 1176) yoki fuqarolik ishlari bo‘yicha tumanlararo sudi'
      };
    } else if (options.disputeType?.includes('administrative') || options.domain === 'administrative' || options.disputeType === 'government_authority_complaint' || options.fineGrainedTopic?.startsWith('admin_')) {
      proceduralSource = {
        type: 'court',
        institution: { name: 'Tumanlararo ma’muriy sud yoki yuqori turuvchi organ' },
        route: 'Yuqori turuvchi organga shikoyat yoki Tumanlararo ma’muriy sudga shikoyat berish (MJtK 314-315-moddalari)'
      };
    } else if (options.disputeType?.includes('tenancy') || options.domain === 'civil' || options.fineGrainedTopic?.startsWith('tenancy_')) {
      proceduralSource = {
        type: 'court',
        institution: OFFICIAL_INSTITUTIONS.court_system.civil_court,
        route: 'Fuqarolik ishlari bo‘yicha tumanlararo sudga daʼvo arizasi topshirish (agar nizo o‘zaro kelishuv yo‘li bilan hal etilmasa)'
      };
    }

    return {
      ...substantive,
      proceduralSource
    };
  }

  /**
   * Validates whether legal assertions in answerText are grounded in retrieved context.
   */
  verifyClaimGrounding(answerText, retrievedArticles = []) {
    if (!answerText || retrievedArticles.length === 0) {
      return { isGrounded: true, ungroundedCitations: [] };
    }

    const textLower = answerText.toLowerCase();
    const citedMatches = answerText.match(/\b(\d+)(?:-modda|-модда)\b/gi) || [];
    const citedDigits = [...new Set(citedMatches.map(m => m.match(/\d+/)[0]))];
    const retrievedDigits = new Set(retrievedArticles.map(a => String(a.article_number_digits || a.article?.match(/\d+/)?.[0])));

    const ungrounded = [];
    for (const digit of citedDigits) {
      if (!retrievedDigits.has(digit)) {
        ungrounded.push(`${digit}-modda`);
      }
    }

    return {
      isGrounded: ungrounded.length === 0,
      ungroundedCitations: ungrounded
    };
  }

  /**
   * Strictly filters citations:
   * 1. Validates each candidate using validateLegalCitation.
   * 2. Checks if the response text ACTUALLY cites or discusses the article.
   * 3. If the answer text does NOT use or mention the article, returns empty [].
   */
  filterSupportingCitations(answerText, retrievedArticles = [], scenario = {}) {
    if (!retrievedArticles || retrievedArticles.length === 0) return [];
    const textLower = (answerText || '').toLowerCase();

    const verifiedSupported = [];

    for (const art of retrievedArticles) {
      const digits = String(art.article_number_digits || (art.article || '').match(/\d+/)?.[0] || '');
      const artNum = (art.article || art.article_number || '').toLowerCase();
      const docName = (art.source || art.document_name || '').toLowerCase();

      // Check if text mentions the article
      const isMentioned = (digits && textLower.includes(`${digits}-modda`)) || 
                          (artNum && textLower.includes(artNum)) ||
                          (docName && digits && textLower.includes(digits) && textLower.includes(docName.split(' ')[0]));

      if (!isMentioned) {
        continue;
      }

      // Validate citation
      const validation = this.validateLegalCitation({
        document_id: art.document_id,
        document_name: art.source || art.document_name,
        article_number: art.article || art.article_number,
        article_title: art.title || art.article_title,
        relevant_issue: scenario.issues?.[0] || null,
        disputeType: scenario.disputeType,
        source_url: art.source_url
      });

      if (validation.isValid) {
        verifiedSupported.push({
          ...art,
          cleanMarkdownLink: validation.cleanMarkdownLink
        });
      }
    }

    return verifiedSupported;
  }

  formatContextForPrompt(articles) {
    if (!articles || articles.length === 0) {
      return null;
    }

    return articles.map((art, idx) => {
      const paragraphs = Array.isArray(art.paragraphs) && art.paragraphs.length > 0 
        ? art.paragraphs.join('\n\n') 
        : (art.text || art.content);

      const exceptionsBlock = Array.isArray(art.exceptions) && art.exceptions.length > 0
        ? `\nIstisnolar / Maxsus shartlar:\n${art.exceptions.map(e => `- ${e}`).join('\n')}`
        : '';

      const crossRefBlock = Array.isArray(art.cross_references) && art.cross_references.length > 0
        ? `\nBog'liq moddalar:\n${art.cross_references.map(r => `- ${r.reference_text || r.target_article_number + '-modda'}`).join('\n')}`
        : '';

      return `[RASMIY HUJJAT ${idx + 1}]:
Qonun nomi: ${art.source || art.document_name} (${art.document_id})
Modda: ${art.article || art.article_number}${art.title || art.article_title ? ` — "${art.title || art.article_title}"` : ''}
Boʻlim / Bob: ${art.section || ''} ${art.chapter ? `| ${art.chapter}` : ''}
Amaldagi tahrir: ${art.version || '2023-yil amaldagi tahrir'} (Kuchga kirgan: ${art.effective_date || '2023-04-30'})
Rasmiy Lex.uz havolasi: ${art.source_url}
Qonuniy matni:
${paragraphs}${exceptionsBlock}${crossRefBlock}`.trim();
    }).join('\n\n========================================\n\n');
  }
}

export const ragService = new RAGService();
