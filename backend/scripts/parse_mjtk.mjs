import fs from 'fs';
import { cyrillicToLatin } from '../utils/transliterate.js';

const html = fs.readFileSync('C:/Users/Envy/.gemini/antigravity/brain/b1fb4fd7-e9c3-473b-91d2-3048a61b4270/.system_generated/steps/3518/content.md', 'utf8');

// Let's find article anchors and titles
// Usually lex.uz has: <a name="XXXXXX"></a> followed by or around <b>X-модда. Title</b>
const articleRegex = /<a[^>]*name=["'](\d+)["'][^>]*>\s*<\/a>\s*<p[^>]*>\s*<b>\s*(\d+(?:[‐\-\–]\d+)?)\s*[-‐–]\s*модда[\.\:\s]*(.*?)<\/b>(.*?)<\/p>(.*?)(?=(?:<a[^>]*name=["']\d+["'][^>]*>\s*<\/a>\s*<p[^>]*>\s*<b>\s*\d+(?:[‐\-\–]\d+)?\s*[-‐–]\s*модда)|$)/gis;

const articles = new Map();

// Let's test a broader pattern if specific tags vary
let match;
const generalArticleRegex = /(?:<a[^>]*name=["'](\d+)["'][^>]*>\s*<\/a>)?[\s\S]{0,100}?<b>\s*(\d+(?:[‐\-\–]\d+)?)\s*[-‐–]\s*модда[\.\:\s]*([^<]*)<\/b>(.*?)(?=(?:<b>\s*\d+(?:[‐\-\–]\d+)?\s*[-‐–]\s*модда)|$)/gis;

let count = 0;
while ((match = generalArticleRegex.exec(html)) !== null) {
  const anchor = match[1] || '';
  const artNum = match[2].trim();
  const rawTitle = match[3].replace(/<[^>]+>/g, '').trim();
  const rawBody = match[4].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (!articles.has(artNum)) {
    articles.set(artNum, {
      anchor,
      artNum,
      rawTitle,
      rawBody: rawBody.slice(0, 500)
    });
    count++;
  }
}

console.log('Unique articles parsed:', count);
for (const testNum of ['1', '2', '10', '54', '125', '128', '131', '65', '90']) {
  const a = articles.get(testNum);
  if (a) {
    console.log(`\n--- Modda ${testNum} ---`);
    console.log('Title (Cyr):', a.rawTitle);
    console.log('Title (Lat):', cyrillicToLatin(a.rawTitle));
    console.log('Anchor:', a.anchor);
    console.log('Body (Lat):', cyrillicToLatin(a.rawBody).slice(0, 150));
  } else {
    console.log(`Modda ${testNum} not found!`);
  }
}
