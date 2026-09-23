import fs from 'fs';
import { cyrillicToLatin } from '../utils/transliterate.js';

const html = fs.readFileSync('server/data/mjtk_full_raw.html', 'utf8');

// Also notice that some articles might be formatted with other tags or sub-articles like 128-1
const titleRegex = /<div name="(\d+)" id="\1">\s*(\d+(?:[\.\-\–\‐]\d+)?)\s*[-‐–]\s*модда[\.\:\s]*([^<]*)<\/div>/gi;

const articles = [];
let match;
while ((match = titleRegex.exec(html)) !== null) {
  if (match.index > 200000) {
    articles.push({
      anchor: match[1],
      modda: match[2].replace(/[‐\–]/g, '-'),
      titleCyr: match[3].replace(/<[^>]+>/g, '').trim(),
      startIndex: match.index,
      headerLength: match[0].length
    });
  }
}

// Now extract the body text for each article: from end of its header to start of next article
for (let i = 0; i < articles.length; i++) {
  const current = articles[i];
  const nextStart = (i + 1 < articles.length) ? articles[i + 1].startIndex : html.length;
  
  // Extract text between current and nextStart
  const slice = html.slice(current.startIndex + current.headerLength, nextStart);
  
  // Extract ACT_TEXT paragraphs
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
  
  // If no ACT_TEXT divs matched, fallback to removing comments and tags
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
  
  current.paragraphsCyr = paragraphs;
  current.paragraphsLat = paragraphs.map(p => cyrillicToLatin(p));
  current.titleLat = cyrillicToLatin(current.titleCyr);
  current.contentLat = current.paragraphsLat.join('\n\n');
}

console.log('Processed', articles.length, 'articles');

// Let's test a few key articles
for (const testModda of ['1', '54', '59', '65', '125', '128', '131']) {
  const a = articles.find(x => x.modda === testModda);
  if (a) {
    console.log(`\n=================== MODDA ${a.modda} ===================`);
    console.log('Title (Lat):', a.titleLat);
    console.log('Anchor:', a.anchor);
    console.log('Paragraphs count:', a.paragraphsLat.length);
    console.log('Content sample:\n', a.contentLat.slice(0, 300));
  } else {
    console.log(`Modda ${testModda} not found!`);
  }
}
