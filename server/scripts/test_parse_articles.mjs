import fs from 'fs';
import { cyrillicToLatin } from '../utils/transliterate.js';

const html = fs.readFileSync('C:/Users/Envy/.gemini/antigravity/brain/b1fb4fd7-e9c3-473b-91d2-3048a61b4270/.system_generated/steps/3518/content.md', 'utf8');

// Match <div name="(\d+)" id="\1">(\d+(?:[‐\-\–]\d+)?)-модда\.?\s*(.*?)<\/div>
const titleRegex = /<div name="(\d+)" id="\1">\s*(\d+(?:[‐\-\–]\d+)?)-модда[\.\:\s]*([^<]*)<\/div>/gi;

const articlesFound = [];
let match;
while ((match = titleRegex.exec(html)) !== null) {
  // Check that this is in the main body (pos > 200000 to avoid TOC)
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
if (articlesFound.length > 0) {
  console.log('First 5:', articlesFound.slice(0, 5));
  console.log('Sample around 125:', articlesFound.filter(a => a.modda.startsWith('125') || a.modda === '128' || a.modda === '131'));
  console.log('Sample around 65:', articlesFound.filter(a => a.modda === '65' || a.modda === '66'));
}
