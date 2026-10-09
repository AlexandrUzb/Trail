import fs from 'fs';
import { cyrillicToLatin } from '../utils/transliterate.js';

const html = fs.readFileSync('server/data/mjtk_full_raw.html', 'utf8');

// Notice how Lex.uz formats:
// <div name="(\d+)" id="\1">\s*(\d+(?:[‐\-\–\.]\d+)?)\s*[-‐–]\s*модда[\.\:\s]*([^<]*)<\/div>
// Let's test this regex across the entire 4.6MB document!

const titleRegex = /<div name="(\d+)" id="\1">\s*(\d+(?:[‐\-\–\.]\d+)?)\s*[-‐–]\s*модда[\.\:\s]*([^<]*)<\/div>/gi;

const articlesFound = [];
let match;
while ((match = titleRegex.exec(html)) !== null) {
  // Ignore table of contents: only match if past index 200000
  if (match.index > 200000) {
    articlesFound.push({
      anchor: match[1],
      modda: match[2],
      titleCyr: match[3].trim(),
      index: match.index
    });
  }
}

console.log('Total articles found in body:', articlesFound.length);
console.log('First 5:', articlesFound.slice(0, 5));
console.log('Sample 125:', articlesFound.find(a => a.modda === '125'));
console.log('Sample 65:', articlesFound.find(a => a.modda === '65'));
console.log('Sample 59:', articlesFound.find(a => a.modda === '59'));
console.log('Last 5:', articlesFound.slice(-5));
