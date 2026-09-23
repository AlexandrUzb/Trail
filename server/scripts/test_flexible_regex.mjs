import fs from 'fs';

const html = fs.readFileSync('server/data/mjtk_full_raw.html', 'utf8');
const chunks = JSON.parse(fs.readFileSync('server/data/legal_documents/administrative_code/chunks.json', 'utf8'));

const titleRegex = /<div name="(\d+)" id="\1">\s*(?:<[^>]+>)*\s*(\d+(?:[\.\-\–\‐]\d+)?)\s*[-‐–]\s*модда[\.\:\s]*([\s\S]*?)<\/div>/gi;

const articlesMap = new Map();
let match;
while ((match = titleRegex.exec(html)) !== null) {
  if (match.index > 200000) {
    const modda = match[2].replace(/[‐\–\.]/g, '-');
    const titleClean = match[3].replace(/<[^>]+>/g, '').trim();
    articlesMap.set(modda, {
      anchor: match[1],
      modda,
      titleClean
    });
  }
}

for (const c of chunks) {
  const subId = c.id.replace('administrative_code_stat_ya_', '').replace(/_/g, '-');
  const digits = c.article_number_digits;
  const found = articlesMap.get(subId) || articlesMap.get(digits);
  if (!found) {
    console.log('Not found:', c.id, subId, digits);
  }
}
console.log('Done checking all 665 chunks against articlesMap!');
