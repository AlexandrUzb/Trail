import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cyrillicToLatin, normalizeSearchText } from '../utils/transliterate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

console.log('--- STARTING COMPREHENSIVE UZBEK LEGISLATION CONVERSION ---');

// 1. Read Lex.uz doc 97664 HTML
const rawHtmlPath = path.join(ROOT, 'server/data/mjtk_full_raw.html');
if (!fs.existsSync(rawHtmlPath)) {
  throw new Error('mjtk_full_raw.html does not exist! Download it first.');
}
const html = fs.readFileSync(rawHtmlPath, 'utf8');

// Parse all articles from body (past index 200000 to skip TOC)
const titleRegex = /<div name="(\d+)" id="\1">\s*(?:<[^>]+>)*\s*(\d+(?:[\.\-\–\‐]\d+)?)\s*[-‐–]\s*модда[\.\:\s]*([\s\S]*?)<\/div>/gi;
const parsedList = [];
let match;

while ((match = titleRegex.exec(html)) !== null) {
  if (match.index > 200000) {
    parsedList.push({
      anchor: match[1],
      modda: match[2].replace(/[‐\–\.]/g, '-'),
      rawModda: match[2],
      titleCyr: match[3].replace(/<[^>]+>/g, '').trim(),
      startIndex: match.index,
      headerLength: match[0].length
    });
  }
}

console.log(`Parsed ${parsedList.length} articles from Lex.uz HTML`);

function cleanUzbekText(cyrText) {
  if (!cyrText) return '';
  let lat = cyrillicToLatin(cyrText);
  // Fix common transliteration artifacts
  lat = lat
    .replace(/\bEtarli\b/g, 'Yetarli')
    .replace(/\betarli\b/g, 'yetarli')
    .replace(/\bErlardan\b/g, 'Yerlardan')
    .replace(/\berlardan\b/g, 'yerlardan')
    .replace(/\bEr\b/g, 'Yer')
    .replace(/\ber\b/g, 'yer')
    .replace(/\bOb'ekt\b/g, 'Obyekt')
    .replace(/\bob'ekt\b/g, 'obyekt')
    .replace(/\bOb'ektlar\b/g, 'Obyektlar')
    .replace(/\bob'ektlar\b/g, 'obyektlar')
    .replace(/\bavtomobilь\b/gi, 'avtomobil')
    .replace(/\brulь\b/gi, 'rul')
    .replace(/\bneftь\b/gi, 'neft')
    .replace(/\bdizelь\b/gi, 'dizel')
    .replace(/\bstatьya\b/gi, 'modda')
    .replace(/\bglava\b/gi, 'bob')
    .replace(/\brazdel\b/gi, 'boʻlim')
    .replace(/\bnarushenie\b/gi, 'buzish')
    .replace(/\bvlechet\b/gi, 'olib keladi')
    .replace(/\bnalojenie\b/gi, 'solish')
    .replace(/\bshtrafa\b/gi, 'jarima')
    .replace(/ь/gi, '')
    .replace(/['`’]/g, '’')
    .replace(/o’/g, 'oʻ')
    .replace(/O’/g, 'Oʻ')
    .replace(/g’/g, 'gʻ')
    .replace(/G’/g, 'Gʻ');
  return lat;
}

const articlesMap = new Map();

for (let i = 0; i < parsedList.length; i++) {
  const current = parsedList[i];
  const nextStart = (i + 1 < parsedList.length) ? parsedList[i + 1].startIndex : html.length;
  const slice = html.slice(current.startIndex + current.headerLength, nextStart);
  
  const actTextRegex = /<div class="ACT_TEXT[^"]*"[^>]*>[\s\S]*?<div name="\d+" id="\d+">([\s\S]*?)<\/div>\s*<\/div>/gi;
  let pMatch;
  const paragraphs = [];
  while ((pMatch = actTextRegex.exec(slice)) !== null) {
    const cleanP = pMatch[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleanP) paragraphs.push(cleanP);
  }
  
  if (paragraphs.length === 0) {
    const cleanSlice = slice
      .replace(/<div class="COMMENT[\s\S]*?<\/div>\s*<\/div>/gi, '')
      .replace(/<div class="CHANGES_ORIGINS[\s\S]*?<\/div>\s*<\/div>/gi, '')
      .replace(/<div class="lx_elem[\s\S]*?<\/div>\s*<\/div>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleanSlice) paragraphs.push(cleanSlice);
  }
  
  const titleLat = cleanUzbekText(current.titleCyr);
  const paragraphsLat = paragraphs.map(p => cleanUzbekText(p));
  const contentLat = paragraphsLat.join('\n\n');
  
  const articleObj = {
    anchor: current.anchor,
    modda: current.modda,
    titleCyr: current.titleCyr,
    titleLat,
    paragraphsLat,
    contentLat
  };
  
  articlesMap.set(current.modda, articleObj);
  const digits = current.modda.replace(/\D+/g, '');
  if (!articlesMap.has(digits)) {
    articlesMap.set(digits, articleObj);
  }
}

console.log(`Articles indexed in map: ${articlesMap.size}`);

// 2. Update lawArticlesDatabase.json (100 articles)
const dbJsonPath = path.join(ROOT, 'server/data/lawArticlesDatabase.json');
const dbJson = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

let updatedDbCount = 0;

for (let i = 0; i < dbJson.length; i++) {
  const item = dbJson[i];
  const digits = (item.article_number || '').replace(/\D+/g, '') || item.id.replace(/\D+/g, '');
  
  const isRu = (
    /[а-яА-ЯёЁ]/.test(item.title + (item.short_description || '') + (item.content || '')) ||
    /\b(statьya|glava|razdel|narushenie|vlechet|nalojenie|shtrafa)\b/i.test(item.title + (item.short_description || '') + (item.content || '')) ||
    item.id.startsWith('mamuriy_') ||
    item.id.startsWith('transport_1') ||
    item.id.startsWith('ekologiya_')
  );

  if (isRu) {
    const uzbekData = articlesMap.get(digits);
    if (!uzbekData) {
      console.warn(`Warning: No Uzbek match found for article digit ${digits} (id: ${item.id})`);
      continue;
    }
    
    const artNumber = `${digits}-modda`;
    const titleBase = uzbekData.titleLat;
    let fullTitle = '';
    let category = item.category || 'Ma’muriy huquq';
    let subcategory = item.subcategory || 'Maʼmuriy javobgarlik';
    let defaultKeywords = ['maʼmuriy', 'jarima', 'javobgarlik', 'kodeks', 'mjtk', 'qonun'];
    
    if (item.id.startsWith('transport_')) {
      fullTitle = `Yoʻl harakati xavfsizligiga oid ${artNumber}: ${titleBase}`;
      category = 'Ma’muriy huquq';
      subcategory = 'Yoʻl harakati xavfsizligi qoidalari';
      defaultKeywords = ['yoʻl harakati', 'jarima', 'haydovchi', 'yoʻl qoidalari', 'yhx', 'transport', 'mjtk'];
    } else if (item.id.startsWith('ekologiya_')) {
      fullTitle = `Ekologiya va atrof-muhit muhofazasiga oid ${artNumber}: ${titleBase}`;
      category = 'Ma’muriy huquq';
      subcategory = 'Atrof-muhit va tabiatni muhofaza qilish';
      defaultKeywords = ['ekologiya', 'tabiat', 'atrof-muhit', 'yer', 'suv', 'oʻrmon', 'muhofaza', 'jarima', 'mjtk'];
    } else {
      fullTitle = `Maʼmuriy javobgarlik toʻgʻrisidagi kodeks ${artNumber}: ${titleBase}`;
      category = 'Ma’muriy huquq';
      subcategory = item.subcategory || 'Maʼmuriy javobgarlik asoslari va prinsiplari';
      defaultKeywords = ['maʼmuriy', 'javobgarlik', 'jazo', 'jarima', 'sud', 'bayonnoma', 'mjtk'];
    }
    
    const content = uzbekData.contentLat || `${fullTitle}. Ushbu modda qonunchilikda belgilangan javobgarlik normalarini tartibga soladi.`;
    const shortDesc = content.length > 220 ? content.slice(0, 217) + '...' : content;
    const lexUrl = `https://lex.uz/docs/97664#${uzbekData.anchor}`;
    
    const titleWords = titleBase.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const combinedKeywords = Array.from(new Set([...defaultKeywords, ...titleWords])).slice(0, 8);
    
    item.title = fullTitle;
    item.article_number = artNumber;
    item.article = artNumber;
    item.category = category;
    item.subcategory = subcategory;
    item.content = content;
    item.short_description = shortDesc;
    item.summary = shortDesc;
    item.source = 'Oʻzbekiston Respublikasining Maʼmuriy javobgarlik toʻgʻrisidagi kodeksi';
    item.law = 'Oʻzbekiston Respublikasining Maʼmuriy javobgarlik toʻgʻrisidagi kodeksi';
    item.source_url = lexUrl;
    item.sourceUrl = lexUrl;
    item.keywords = combinedKeywords;
    item.tags = combinedKeywords;
    item.updated_at = '2026-09-19';
    
    updatedDbCount++;
  }
}

console.log(`Updated ${updatedDbCount} articles in lawArticlesDatabase.json`);
fs.writeFileSync(dbJsonPath, JSON.stringify(dbJson, null, 2), 'utf8');

// 3. Update src/data/lawArticles.ts with the exact same updated database
const tsPath = path.join(ROOT, 'src/data/lawArticles.ts');
const tsContent = `export interface LawArticle {
  id: string;
  title: string;
  short_description: string;
  article_number: string;
  category: string;
  subcategory: string;
  keywords: string[];
  source: string;
  source_url: string;
  content: string;
  updated_at: string;
  // Backward compatibility aliases
  law?: string;
  article?: string;
  summary?: string;
  tags?: string[];
  sourceUrl?: string;
}

export const lawArticlesDatabase: LawArticle[] = ${JSON.stringify(dbJson, null, 2)};
`;

fs.writeFileSync(tsPath, tsContent, 'utf8');
console.log('Updated src/data/lawArticles.ts');

// 4. Update server/data/legal_documents/administrative_code/chunks.json (all 665 chunks)
const chunksPath = path.join(ROOT, 'server/data/legal_documents/administrative_code/chunks.json');
const chunks = JSON.parse(fs.readFileSync(chunksPath, 'utf8'));

let updatedChunksCount = 0;

for (const chunk of chunks) {
  const digits = chunk.article_number_digits;
  const subId = chunk.id.replace('administrative_code_stat_ya_', '').replace(/_/g, '-');
  const uzbekData = articlesMap.get(subId) || articlesMap.get(digits);
  
  const artNumber = `${digits}-modda`;
  chunk.article_number = artNumber;
  chunk.language = 'uz';
  
  if (uzbekData) {
    const titleLat = uzbekData.titleLat;
    const lexUrl = `https://lex.uz/docs/97664#${uzbekData.anchor}`;
    
    chunk.article_title = titleLat;
    chunk.official_source_url = lexUrl;
    chunk.source_url = lexUrl;
    chunk.content = uzbekData.contentLat;
    chunk.content_original = uzbekData.titleCyr + '\n\n' + uzbekData.contentLat;
    chunk.paragraphs = uzbekData.paragraphsLat;
    chunk.search_tokens = normalizeSearchText(
      `${titleLat} ${artNumber} ${uzbekData.contentLat} ${(chunk.keywords || []).join(' ')}`
    );
    updatedChunksCount++;
  } else {
    // Transliterate and clean fallback chunk
    chunk.official_source_url = `https://lex.uz/docs/97664`;
    chunk.source_url = `https://lex.uz/docs/97664`;
    chunk.article_title = cleanUzbekText(chunk.article_title || '');
    chunk.content = cleanUzbekText(chunk.content || '');
    chunk.content_original = cleanUzbekText(chunk.content_original || '');
    chunk.paragraphs = (chunk.paragraphs || []).map(p => cleanUzbekText(p));
    chunk.search_tokens = normalizeSearchText(
      `${chunk.article_title} ${artNumber} ${chunk.content}`
    );
    updatedChunksCount++;
  }
}

console.log(`Updated ${updatedChunksCount} chunks in administrative_code/chunks.json`);
fs.writeFileSync(chunksPath, JSON.stringify(chunks, null, 2), 'utf8');

// 5. Update meta.json and registry.json
const metaPath = path.join(ROOT, 'server/data/legal_documents/administrative_code/meta.json');
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
meta.official_source_url = 'https://lex.uz/docs/97664';
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');

const registryPath = path.join(ROOT, 'server/data/legal_documents/registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const adminDoc = registry.documents.find(d => d.id === 'administrative_code');
if (adminDoc) {
  adminDoc.source_url = 'https://lex.uz/docs/97664';
}
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
console.log('Updated meta.json and registry.json official URLs to doc 97664');

// 6. Verification: Check for any remaining Russian in the 3 targets
const testDb = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
const remainingDbRu = testDb.filter(a =>
  /[а-яА-ЯёЁ]/.test(a.title + (a.short_description || '') + (a.content || '')) ||
  /\b(statьya|glava|razdel|narushenie|vlechet|nalojenie|shtrafa)\b/i.test(a.title + (a.short_description || '') + (a.content || ''))
);
console.log(`Remaining Russian articles in DB: ${remainingDbRu.length}`);

const testChunks = JSON.parse(fs.readFileSync(chunksPath, 'utf8'));
const remainingChunksRu = testChunks.filter(c =>
  /\b(statьya|glava|razdel|narushenie|vlechet|nalojenie|shtrafa)\b/i.test(c.article_number + ' ' + c.article_title + ' ' + c.content)
);
console.log(`Remaining Russian Statya / Russian chunks in administrative_code: ${remainingChunksRu.length}`);

console.log('--- CONVERSION COMPLETED SUCCESSFULLY ---');
