import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { cyrillicToLatin, latinToCyrillic, normalizeSearchText } from '../utils/transliterate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data/legal_documents');

const DOC_METADATA = {
  constitution: {
    id: 'constitution',
    title: 'Oʻzbekiston Respublikasi Konstitutsiyasi',
    short_title: 'Konstitutsiya',
    document_type: 'constitution',
    issuing_authority: 'Oʻzbekiston Respublikasi xalqi (Umumxalq referendumi)',
    official_source_url: 'https://lex.uz/docs/-6445145',
    version: '2023-04-30 tahriri (Yangi tahrir)',
    effective_from: '2023-05-01',
    effective_to: null,
    status: 'active',
    source_priority: 1,
    language: 'uz'
  },
  labor_code: {
    id: 'labor_code',
    title: 'Oʻzbekiston Respublikasining Mehnat kodeksi',
    short_title: 'Mehnat kodeksi',
    document_type: 'code',
    issuing_authority: 'Oʻzbekiston Respublikasi Oliy Majlisi',
    official_source_url: 'https://lex.uz/docs/-6257288',
    version: 'OʻRQ-798 (2022-10-28 qabul qilingan, 2023-04-30 dan kuchga kirgan)',
    effective_from: '2023-04-30',
    effective_to: null,
    status: 'active',
    source_priority: 1,
    language: 'uz'
  },
  civil_code: {
    id: 'civil_code',
    title: 'Oʻzbekiston Respublikasining Fuqarolik kodeksi',
    short_title: 'Fuqarolik kodeksi',
    document_type: 'code',
    issuing_authority: 'Oʻzbekiston Respublikasi Oliy Majlisi',
    official_source_url: 'https://lex.uz/docs/-111189',
    version: 'Amaldagi tahrir (1-qism va 2-qism)',
    effective_from: '1997-03-01',
    effective_to: null,
    status: 'active',
    source_priority: 1,
    language: 'uz'
  },
  criminal_code: {
    id: 'criminal_code',
    title: 'Oʻzbekiston Respublikasining Jinoyat kodeksi',
    short_title: 'Jinoyat kodeksi',
    document_type: 'code',
    issuing_authority: 'Oʻzbekiston Respublikasi Oliy Majlisi',
    official_source_url: 'https://lex.uz/docs/-111453',
    version: 'Amaldagi tahrir (barcha oʻzgartirish va qoʻshimchalar bilan)',
    effective_from: '1995-04-01',
    effective_to: null,
    status: 'active',
    source_priority: 1,
    language: 'uz'
  },
  administrative_code: {
    id: 'administrative_code',
    title: 'Oʻzbekiston Respublikasining Maʼmuriy javobgarlik toʻgʻrisidagi kodeksi',
    short_title: 'MJtK (Maʼmuriy javobgarlik toʻgʻrisidagi kodeks)',
    document_type: 'code',
    issuing_authority: 'Oʻzbekiston Respublikasi Oliy Majlisi',
    official_source_url: 'https://lex.uz/docs/97661',
    version: 'Amaldagi tahrir',
    effective_from: '1995-04-01',
    effective_to: null,
    status: 'active',
    source_priority: 1,
    language: 'uz'
  }
};

/**
 * Extracts exception clauses from article text.
 */
function extractExceptions(text) {
  if (!text) return [];
  const exceptions = [];
  const lines = text.split(/\n+/);

  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    if (
      /(bundan\s*mustasno|istisno\s*tariqasida|agar\s*.*bo['‘`]?lmasa|quyidagi\s*hollar(da)?\s*bundan\s*mustasno|haqli\s*emas|taqiqlanadi|yo['‘`]?l\s*qo['‘`]?yilmaydi)/i.test(l)
    ) {
      exceptions.push(l);
    }
  }

  return exceptions;
}

/**
 * Extracts cross-references to other articles or codes.
 */
function extractCrossReferences(text, currentDocId, currentArtNum) {
  if (!text) return [];
  const refs = [];
  const seen = new Set();

  // Pattern A: "X-modda..." or "ushbu Kodeksning X-moddasi..."
  const intraCodeRegex = /(?:ushbu\s+kodeksning\s+)?(\d+)-modda(?:si|sida|siga|sining)?/gi;
  let match;
  while ((match = intraCodeRegex.exec(text)) !== null) {
    const num = match[1];
    if (num !== String(currentArtNum) && !seen.has(`${currentDocId}_${num}`)) {
      seen.add(`${currentDocId}_${num}`);
      refs.push({
        target_document_id: currentDocId,
        target_article_number: num,
        reference_text: match[0],
        type: 'intra_code'
      });
    }
  }

  // Pattern B: Cross-code references
  const crossCodePatterns = [
    { regex: /fuqarolik\s+kodeksining\s+(\d+)-modda/gi, docId: 'civil_code' },
    { regex: /mehnat\s+kodeksining\s+(\d+)-modda/gi, docId: 'labor_code' },
    { regex: /jinoyat\s+kodeksining\s+(\d+)-modda/gi, docId: 'criminal_code' },
    { regex: /ma['‘`]?muriy\s+javobgarlik\s+to['‘`]?g['‘`]?risidagi\s+kodeksning\s+(\d+)-modda/gi, docId: 'administrative_code' },
    { regex: /konstitutsiyaning\s+(\d+)-modda/gi, docId: 'constitution' }
  ];

  for (const { regex, docId } of crossCodePatterns) {
    let cm;
    while ((cm = regex.exec(text)) !== null) {
      const num = cm[1];
      const key = `${docId}_${num}`;
      if (!seen.has(key)) {
        seen.add(key);
        refs.push({
          target_document_id: docId,
          target_article_number: num,
          reference_text: cm[0],
          type: 'cross_code'
        });
      }
    }
  }

  return refs;
}

/**
 * Classifies an article as substantive, procedural, or both.
 */
function classifySubstantiveOrProcedural(title, content) {
  const combined = `${title} ${content}`.toLowerCase();
  const isProcedural = /(shikoyat\s*qilish|sudga\s*murojaat|tartibi|ariza\s*berish|muddati|ijro\s*etish|javobgarlikka\s*tortish|jarima\s*solish\s*to['‘`]?g['‘`]?risida|da['‘`]?vo\s*muddati|undirish\s*tartibi)/i.test(combined);
  const isSubstantive = /(huquqi|majburiyati|kafolatlari|taqiqlanadi|asosiy\s*prinsiplari|tushunchasi|shartlari|asoslari)/i.test(combined);

  if (isProcedural && isSubstantive) return 'both';
  if (isProcedural) return 'procedural';
  return 'substantive';
}

function runEnrichment() {
  console.log('================================================================');
  console.log('ADVOKATAI KNOWLEDGE BASE ENRICHMENT & METADATA PIPELINE');
  console.log('================================================================\n');

  const registryPath = path.join(DATA_DIR, 'registry.json');
  if (!fs.existsSync(registryPath)) {
    console.error('registry.json not found in', DATA_DIR);
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  const now = '2026-09-19T00:00:00.000Z';
  let totalArticlesEnriched = 0;
  const updatedDocs = [];

  for (const docInfo of registry.documents) {
    const docId = docInfo.id;
    const metaConfig = DOC_METADATA[docId];
    if (!metaConfig) {
      console.warn(`[Skip] No metaConfig for ${docId}`);
      continue;
    }

    const docDir = path.join(DATA_DIR, docId);
    const chunksPath = path.join(docDir, 'chunks.json');
    if (!fs.existsSync(chunksPath)) {
      console.warn(`[Skip] chunks.json missing in ${docDir}`);
      continue;
    }

    console.log(`Processing ${metaConfig.title} (${docId})...`);
    const rawChunks = JSON.parse(fs.readFileSync(chunksPath, 'utf-8'));
    let docCombinedContent = '';

    const enrichedChunks = rawChunks.map(chunk => {
      const artDigits = chunk.article_number_digits || (chunk.article_number || '').match(/\d+/)?.[0] || '';
      const text = chunk.content || chunk.content_original || '';
      docCombinedContent += text + '\n';

      // SHA256 content hash
      const contentHash = crypto.createHash('sha256').update(text.trim()).digest('hex');

      // Exceptions extraction
      const exceptions = extractExceptions(text);

      // Cross-references extraction
      const crossRefs = extractCrossReferences(text, docId, artDigits);

      // Substantive vs Procedural
      const legalNature = classifySubstantiveOrProcedural(chunk.article_title || '', text);

      // Ensure paragraphs array
      let paragraphs = chunk.paragraphs;
      if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
        paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
      }

      // Enhanced search tokens with Cyrillic & Latin transliterations
      const searchTokensLatin = cyrillicToLatin(normalizeSearchText(`${chunk.article_number} ${chunk.article_title} ${chunk.chapter || ''} ${chunk.section || ''} ${text}`));
      const searchTokensCyrillic = latinToCyrillic(searchTokensLatin);
      const combinedSearchTokens = `${searchTokensLatin} ${searchTokensCyrillic}`;

      return {
        // Core Identification
        id: chunk.id || `${docId}_${artDigits}_modda`,
        document_id: docId,
        document_name: metaConfig.title,
        short_title: metaConfig.short_title,
        document_type: metaConfig.document_type,
        parent_document_id: null,
        issuing_authority: metaConfig.issuing_authority,
        source_priority: metaConfig.source_priority,
        official_source_url: chunk.source_url,
        source_url: chunk.source_url,
        language: 'uz',

        // Versioning & Effectiveness
        version: metaConfig.version,
        document_version: metaConfig.version,
        status: metaConfig.status,
        effective_from: metaConfig.effective_from,
        effective_to: metaConfig.effective_to,
        last_verified_at: now,
        retrieved_at: now,

        // Article Structure & Granularity
        article_number: chunk.article_number,
        article_number_digits: artDigits,
        article_title: chunk.article_title || '',
        chapter: chunk.chapter || '',
        section: chunk.section || '',
        content: text,
        content_original: chunk.content_original || text,
        paragraphs,
        
        // Advanced Legal Metadata
        hash: contentHash,
        content_hash: contentHash,
        exceptions,
        has_exceptions: exceptions.length > 0,
        cross_references: crossRefs,
        has_cross_references: crossRefs.length > 0,
        legal_nature: legalNature,
        is_procedural: legalNature === 'procedural' || legalNature === 'both',
        is_substantive: legalNature === 'substantive' || legalNature === 'both',
        
        // Search & Retrieval Indexing
        search_tokens: combinedSearchTokens
      };
    });

    // Write enriched chunks
    fs.writeFileSync(chunksPath, JSON.stringify(enrichedChunks, null, 2), 'utf-8');
    totalArticlesEnriched += enrichedChunks.length;

    // Compute Document Hash
    const docHash = crypto.createHash('sha256').update(docCombinedContent).digest('hex');

    // Write enriched meta.json
    const metaData = {
      ...metaConfig,
      article_count: enrichedChunks.length,
      document_hash: docHash,
      last_verified_at: now,
      updated_at: now
    };
    fs.writeFileSync(path.join(docDir, 'meta.json'), JSON.stringify(metaData, null, 2), 'utf-8');

    updatedDocs.push({
      id: docId,
      name: metaConfig.title,
      short_title: metaConfig.short_title,
      type: metaConfig.document_type,
      source_url: metaConfig.official_source_url,
      version_date: metaConfig.effective_from,
      status: metaConfig.status,
      source_priority: metaConfig.source_priority,
      article_count: enrichedChunks.length,
      document_hash: docHash,
      updated_at: now
    });

    console.log(`  -> ${enrichedChunks.length} articles enriched with hashes, exceptions, cross-refs!`);
  }

  // Update registry.json
  const updatedRegistry = {
    total_documents: updatedDocs.length,
    total_articles: totalArticlesEnriched,
    updated_at: now,
    source_hierarchy: {
      level_1: 'Primary Legislation (Lex.uz - Constitution, Codes, Laws)',
      level_2: 'Official Government Bodies & Hotlines (1176, 1253, 1007, etc.)',
      level_3: 'Court & Authority Procedures',
      level_4: 'Secondary Educational Materials'
    },
    documents: updatedDocs
  };

  fs.writeFileSync(registryPath, JSON.stringify(updatedRegistry, null, 2), 'utf-8');

  console.log('\n----------------------------------------------------------------');
  console.log(`SUCCESS! Enriched ${totalArticlesEnriched} articles across ${updatedDocs.length} legal documents.`);
  console.log(`Saved updated registry to ${registryPath}`);
  console.log('----------------------------------------------------------------\n');
}

runEnrichment();
