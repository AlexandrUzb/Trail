import fs from 'fs';
import { cyrillicToLatin } from '../utils/transliterate.js';

const html = fs.readFileSync('server/data/mjtk_full_raw.html', 'utf8');
const chunks = JSON.parse(fs.readFileSync('server/data/legal_documents/administrative_code/chunks.json', 'utf8'));

const titleRegex = /<div name="(\d+)" id="\1">\s*(\d+(?:[\.\-\–\‐]\d+)?)\s*[-‐–]\s*модда[\.\:\s]*([^<]*)<\/div>/gi;
const articlesMap = new Map();

let match;
while ((match = titleRegex.exec(html)) !== null) {
  if (match.index > 200000) {
    const modda = match[2].replace(/[‐\–]/g, '-');
    if (!articlesMap.has(modda)) {
      articlesMap.set(modda, true);
    }
  }
}

const unmatched = chunks.filter(c => !articlesMap.has(c.article_number_digits));
console.log('Unmatched count:', unmatched.length);
console.log(unmatched.map(c => ({ id: c.id, num: c.article_number, digits: c.article_number_digits })));