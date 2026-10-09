import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cyrillicToLatin, latinToCyrillic, normalizeSearchText } from '../utils/transliterate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data/legal_documents');

// Ensure base dir
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const OFFICIAL_DOCUMENTS = [
  {
    id: 'constitution',
    folder: 'constitution',
    name: "Oʻzbekiston Respublikasi Konstitutsiyasi",
    type: "Konstitutsiya",
    source_url: "https://lex.uz/docs/-6445145",
    version_date: "2023-04-30",
    description: "2023-yil 30-apreldagi umumxalq referendumi asosida qabul qilingan yangi tahrirdagi Oʻzbekiston Respublikasi Konstitutsiyasi.",
    parts: [
      { url: "https://lex.uz/docs/-6445145", lang: "uz-Latn", label: "Asosiy matn" }
    ]
  },
  {
    id: 'labor_code',
    folder: 'labor_code',
    name: "Oʻzbekiston Respublikasining Mehnat kodeksi",
    type: "Kodeks",
    source_url: "https://lex.uz/docs/-6257288",
    version_date: "2022-10-28 (2023-04-30 dan amal qiladi, OʻRQ-798)",
    description: "Mehnat munosabatlarini tartibga soluvchi amaldagi Oʻzbekiston Respublikasi Mehnat kodeksi.",
    parts: [
      { url: "https://lex.uz/docs/-6257288", lang: "uz-Latn", label: "Toʻliq matn" }
    ]
  },
  {
    id: 'civil_code',
    folder: 'civil_code',
    name: "Oʻzbekiston Respublikasining Fuqarolik kodeksi",
    type: "Kodeks",
    source_url: "https://lex.uz/docs/-111189",
    version_date: "Amaldagi tahrir (1-qism va 2-qism)",
    description: "Fuqarolik-huquqiy munosabatlar, mulk huquqi, shartnomalar va majburiyatlarni belgilovchi asosiy kodeks.",
    parts: [
      { url: "https://lex.uz/docs/-111189", lang: "uz-Latn", label: "1-qism" },
      { url: "https://lex.uz/docs/-180552", lang: "uz-Latn", label: "2-qism" }
    ]
  },
  {
    id: 'criminal_code',
    folder: 'criminal_code',
    name: "Oʻzbekiston Respublikasining Jinoyat kodeksi",
    type: "Kodeks",
    source_url: "https://lex.uz/docs/-111453",
    version_date: "Amaldagi tahrir",
    description: "Jinoiy javobgarlik asoslari, jinoyat turlari va jazolarni belgilovchi qonunchilik hujjati.",
    parts: [
      { url: "https://lex.uz/docs/-111453", lang: "uz-Latn", label: "Toʻliq matn" }
    ]
  },
  {
    id: 'administrative_code',
    folder: 'administrative_code',
    name: "Oʻzbekiston Respublikasining Maʼmuriy javobgarlik toʻgʻrisidagi kodeksi",
    type: "Kodeks",
    source_url: "https://lex.uz/docs/97661",
    version_date: "Amaldagi tahrir",
    description: "Maʼmuriy huquqbuzarliklar, jarimalar va maʼmuriy jazo choralarini tartibga soluvchi kodeks.",
    parts: [
      { url: "https://lex.uz/docs/97661", lang: "uz-Cyrl", label: "Toʻliq matn" }
    ]
  }
];

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'uz,ru,en;q=0.9'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      console.warn(`[Retry ${i + 1}/${retries}] Fetch failed for ${url}: ${err.message}`);
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

function parseDocumentHtml(html, docMeta, partMeta) {
  const divContStart = html.indexOf('id="divCont"');
  if (divContStart === -1) {
    throw new Error('divCont element not found in HTML');
  }
  const contentHtml = html.slice(divContStart);

  const elemRegex = /<div class="([^"]+)"[^>]*>[\s\S]*?<div name="([^"]*)" id="([^"]*)">([\s\S]*?)<\/div>\s*<\/div>/gi;
  let m;

  let currentSection = partMeta.label !== 'Asosiy matn' && partMeta.label !== 'Toʻliq matn' ? partMeta.label : '';
  let currentChapter = '';
  let currentArticle = null;
  const articles = [];

  while ((m = elemRegex.exec(contentHtml)) !== null) {
    const cls = m[1];
    const elemId = m[3] || m[2];
    const rawText = m[4].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!rawText) continue;

    // Headings: Bo'lim / Bob
    if (cls.includes('TEXT_HEADER_DEFAULT') || cls.includes('TEXT_BOLD_CENTER')) {
      if (/bo[ʻ\'`’]lim|бўлим|қисм|qism/i.test(rawText)) {
        currentSection = rawText;
      } else if (/bob|боб/i.test(rawText)) {
        currentChapter = rawText;
      }
    } else if (cls.includes('CLAUSE_DEFAULT') || /^\d+(?:-[a-zа-я0-9]+)?-(?:modda|модда)/i.test(rawText)) {
      // Save previous article
      if (currentArticle) {
        articles.push(finalizeArticle(currentArticle, docMeta, partMeta));
      }

      const matchModda = rawText.match(/^(\d+(?:-[a-zа-я0-9]+)?-(?:modda|модда)\.?)\s*(.*)/i);
      const artNum = matchModda ? matchModda[1].replace(/\.$/, '') : rawText.split('.')[0];
      const artTitle = matchModda && matchModda[2] ? matchModda[2].trim() : '';

      currentArticle = {
        elementId: elemId,
        article_number: artNum,
        article_title: artTitle,
        section: currentSection,
        chapter: currentChapter,
        paragraphs: []
      };
    } else if (currentArticle && (cls.includes('ACT_TEXT') || cls.includes('BY_DEFAULT') || cls.includes('ACT_FORM'))) {
      if (
        !rawText.startsWith('Ҳужжатга таклиф') &&
        !rawText.startsWith('Hujjatga taklif') &&
        !rawText.startsWith('[ OKOZ:') &&
        !rawText.startsWith('[ TSZ:') &&
        !rawText.startsWith('[ ОКОЗ:') &&
        !rawText.startsWith('[ ТСЗ:')
      ) {
        currentArticle.paragraphs.push(rawText);
      }
    }
  }

  if (currentArticle) {
    articles.push(finalizeArticle(currentArticle, docMeta, partMeta));
  }

  return articles;
}

function finalizeArticle(art, docMeta, partMeta) {
  const isCyrillic = partMeta.lang === 'uz-Cyrl';
  const rawNum = art.article_number.trim();
  const rawTitle = art.article_title.trim();
  const rawSection = art.section.trim();
  const rawChapter = art.chapter.trim();
  const paragraphs = art.paragraphs.filter(p => p && p.trim().length > 0);
  const rawContent = paragraphs.join('\n\n');

  // Latin standard representation
  const articleNumLat = isCyrillic ? cyrillicToLatin(rawNum) : rawNum;
  const articleTitleLat = isCyrillic ? cyrillicToLatin(rawTitle) : rawTitle;
  const sectionLat = isCyrillic ? cyrillicToLatin(rawSection) : rawSection;
  const chapterLat = isCyrillic ? cyrillicToLatin(rawChapter) : rawChapter;
  const contentLat = isCyrillic ? cyrillicToLatin(rawContent) : rawContent;

  // Cyrillic representation for dual-script search
  const contentCyr = isCyrillic ? rawContent : latinToCyrillic(rawContent);

  // Extract clean number digits (e.g. "97" from "97-modda")
  const numDigitsMatch = articleNumLat.match(/\d+/);
  const numDigits = numDigitsMatch ? numDigitsMatch[0] : '';

  // Source URL with direct element anchor
  const directUrl = `${partMeta.url}#${art.elementId || ''}`;

  // Unique ID
  const chunkId = `${docMeta.id}_${articleNumLat.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  // Search tokens
  const searchTokens = normalizeSearchText(`
    ${articleNumLat} modda ${numDigits} ${articleTitleLat} ${sectionLat} ${chapterLat} ${contentLat}
    ${latinToCyrillic(articleNumLat)} модда ${latinToCyrillic(articleTitleLat)} ${contentCyr}
  `);

  return {
    id: chunkId,
    document_id: docMeta.id,
    document_name: docMeta.name,
    document_type: docMeta.type,
    article_number: articleNumLat,
    article_number_digits: numDigits,
    article_title: articleTitleLat,
    chapter: chapterLat,
    section: sectionLat,
    source_url: directUrl,
    language: partMeta.lang,
    document_version: docMeta.version_date,
    content: contentLat,
    content_original: rawContent,
    paragraphs: paragraphs,
    search_tokens: searchTokens
  };
}

export async function ingestAllDocuments() {
  console.log('======================================================');
  console.log('🚀 Advokat AI: Rasmiy 5 ta qonunchilik hujjatini yuklash boshlandi...');
  console.log('Manba: LEX.UZ (Oʻzbekiston Respublikasi Milliy Qonunchilik Bazasi)');
  console.log('======================================================\n');

  const registry = [];
  let totalArticlesIngested = 0;

  for (const doc of OFFICIAL_DOCUMENTS) {
    const docFolder = path.join(DATA_DIR, doc.folder);
    if (!fs.existsSync(docFolder)) {
      fs.mkdirSync(docFolder, { recursive: true });
    }

    console.log(`📥 [${doc.name}] yuklanmoqda...`);
    let docArticles = [];

    for (const part of doc.parts) {
      console.log(`   -> Havola: ${part.url} (${part.label}, ${part.lang})`);
      try {
        const html = await fetchWithRetry(part.url);
        console.log(`   ✓ Matn olindi (${(html.length / 1024).toFixed(1)} KB). Moddalar ajratilmoqda...`);
        const parsed = parseDocumentHtml(html, doc, part);
        console.log(`   ✓ ${parsed.length} ta modda ajratildi.`);
        docArticles.push(...parsed);
      } catch (err) {
        console.error(`   ❌ Xatolik (${part.url}):`, err.message);
      }
    }

    // Save chunks.json
    const chunksPath = path.join(docFolder, 'chunks.json');
    fs.writeFileSync(chunksPath, JSON.stringify(docArticles, null, 2), 'utf-8');

    // Save meta.json
    const metaPath = path.join(docFolder, 'meta.json');
    const docMeta = {
      id: doc.id,
      name: doc.name,
      type: doc.type,
      source_url: doc.source_url,
      version_date: doc.version_date,
      description: doc.description,
      article_count: docArticles.length,
      updated_at: new Date().toISOString()
    };
    fs.writeFileSync(metaPath, JSON.stringify(docMeta, null, 2), 'utf-8');

    registry.push(docMeta);
    totalArticlesIngested += docArticles.length;
    console.log(`   💾 Saqlandi: ${chunksPath} (${docArticles.length} ta modda)\n`);
  }

  // Save master registry.json
  const registryPath = path.join(DATA_DIR, 'registry.json');
  fs.writeFileSync(registryPath, JSON.stringify({
    total_documents: registry.length,
    total_articles: totalArticlesIngested,
    updated_at: new Date().toISOString(),
    documents: registry
  }, null, 2), 'utf-8');

  console.log('======================================================');
  console.log(`🎉 Ingest jarayoni muvaffaqiyatli yakunlandi!`);
  console.log(`📚 Jami rasmiy hujjatlar: ${registry.length}`);
  console.log(`📑 Jami indekslangan moddalar: ${totalArticlesIngested}`);
  console.log(`📁 Saqlangan joy: ${DATA_DIR}`);
  console.log('======================================================');

  return { totalDocuments: registry.length, totalArticles: totalArticlesIngested };
}

// Run directly if invoked as CLI script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ingestAllDocuments()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal ingest error:', err);
      process.exit(1);
    });
}
