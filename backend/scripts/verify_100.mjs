import fs from 'fs';
import { cyrillicToLatin } from '../utils/transliterate.js';

const html = fs.readFileSync('server/data/mjtk_full_raw.html', 'utf8');
const dbJson = JSON.parse(fs.readFileSync('server/data/lawArticlesDatabase.json', 'utf8'));

const ruArticles = dbJson.filter(a =>
  /[а-яА-ЯёЁ]/.test(a.title + (a.short_description || '') + (a.content || '')) ||
  /\b(statьya|glava|razdel|narushenie|vlechet|nalojenie|shtrafa)\b/i.test(a.title + (a.short_description || '') + (a.content || ''))
);

// Match all articles
const titleRegex = /<div name="(\d+)" id="\1">\s*(\d+(?:[\.\-\–\‐]\d+)?)\s*[-‐–]\s*модда[\.\:\s]*([^<]*)<\/div>/gi;
const articlesMap = new Map();

let match;
const parsedList = [];
while ((match = titleRegex.exec(html)) !== null) {
  if (match.index > 200000) {
    parsedList.push({
      anchor: match[1],
      modda: match[2].replace(/[‐\–]/g, '-'),
      titleCyr: match[3].replace(/<[^>]+>/g, '').trim(),
      startIndex: match.index,
      headerLength: match[0].length
    });
  }
}

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
    if (cleanP) {
      paragraphs.push(cleanP);
    }
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
    if (cleanSlice) {
      paragraphs.push(cleanSlice);
    }
  }
  
  current.paragraphsLat = paragraphs.map(p => cyrillicToLatin(p));
  current.titleLat = cyrillicToLatin(current.titleCyr);
  current.contentLat = current.paragraphsLat.join('\n\n');
  
  if (!articlesMap.has(current.modda)) {
    articlesMap.set(current.modda, current);
  }
}

console.log('Total parsed moddas in map:', articlesMap.size);

const missing = [];
for (const a of ruArticles) {
  const num = (a.article_number || '').replace(/\D+/g, '');
  if (!articlesMap.has(num)) {
    missing.push({ id: a.id, num });
  }
}

console.log('Missing among the 100:', missing);
