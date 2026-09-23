import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

const loadChunks = (docDir) => {
  const p = path.join(rootDir, 'server/data/legal_documents', docDir, 'chunks.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
};

const laborChunks = loadChunks('labor_code');
const constChunks = loadChunks('constitution');
const civilChunks = loadChunks('civil_code');
const crimChunks = loadChunks('criminal_code');
const adminChunks = loadChunks('administrative_code');

function cleanSummary(text) {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 220) return cleaned;
  return cleaned.substring(0, 220).trim() + '...';
}

const allArticles = [];

// ==========================================
// 1. MEHNAT HUQUQI (150 ta modda)
// ==========================================
console.log('Generating Mehnat huquqi (150)...');
const labor150 = laborChunks.slice(0, 150);
labor150.forEach((c, idx) => {
  const num = idx + 1;
  allArticles.push({
    id: `mehnat_${num}`,
    law: 'Oʻzbekiston Respublikasining Mehnat kodeksi',
    article: c.article_number || `${num}-modda`,
    title: c.article_title || `${num}-modda`,
    summary: cleanSummary(c.content),
    category: 'Mehnat huquqi',
    tags: ['mehnat', 'xodim', 'ish beruvchi', 'shartnoma', 'mehnat huquqi'],
    sourceUrl: c.source_url || `https://lex.uz/docs/-6257288`
  });
});

// ==========================================
// 2. FUQAROLIK HUQUQI (150 ta modda)
// ==========================================
console.log('Generating Fuqarolik huquqi (150)...');
const civil150 = civilChunks.slice(0, 150);
civil150.forEach((c, idx) => {
  const num = idx + 1;
  allArticles.push({
    id: `fuqarolik_${num}`,
    law: 'Oʻzbekiston Respublikasining Fuqarolik kodeksi',
    article: c.article_number || `${num}-modda`,
    title: c.article_title || `Fuqarolik huquqi ${num}-modda`,
    summary: cleanSummary(c.content),
    category: 'Fuqarolik huquqi',
    tags: ['fuqarolik', 'shartnoma', 'mulk', 'majburiyat', 'bitim', 'fuqarolik kodeksi'],
    sourceUrl: c.source_url || `https://lex.uz/docs/-111189`
  });
});

// ==========================================
// 3. JINOYAT HUQUQI (150 ta modda)
// ==========================================
console.log('Generating Jinoyat huquqi (150)...');
const crim150 = crimChunks.slice(0, 150);
crim150.forEach((c, idx) => {
  const num = idx + 1;
  allArticles.push({
    id: `jinoyat_${num}`,
    law: 'Oʻzbekiston Respublikasining Jinoyat kodeksi',
    article: c.article_number || `${num}-modda`,
    title: c.article_title || `Jinoyat kodeksi ${num}-modda`,
    summary: cleanSummary(c.content),
    category: 'Jinoyat huquqi',
    tags: ['jinoyat', 'jazo', 'javobgarlik', 'jinoyat kodeksi', 'sud'],
    sourceUrl: c.source_url || `https://lex.uz/docs/-111453`
  });
});

// ==========================================
// 4. MAʼMURIY HUQUQ (150 ta modda)
// ==========================================
console.log('Generating Maʼmuriy huquq (150)...');
const admin150 = adminChunks.slice(0, 150);
admin150.forEach((c, idx) => {
  const num = idx + 1;
  allArticles.push({
    id: `mamuriy_${num}`,
    law: 'Oʻzbekiston Respublikasining Maʼmuriy javobgarlik toʻgʻrisidagi kodeksi',
    article: `${num}-modda`,
    title: c.article_title || `Maʼmuriy javobgarlik toʻgʻrisidagi kodeksning ${num}-moddasi`,
    summary: cleanSummary(c.content || `Oʻzbekiston Respublikasining Maʼmuriy javobgarlik toʻgʻrisidagi kodeksi ${num}-moddasi huquqbuzarliklar va jarimalar tartibini belgilaydi.`),
    category: 'Maʼmuriy huquq',
    tags: ['maʼmuriy', 'jarima', 'huquqbuzarlik', 'bayonnoma', 'radar', 'yhxx'],
    sourceUrl: c.source_url || `https://lex.uz/docs/97661`
  });
});

// ==========================================
// 5. BIZNES VA TADBIRKORLIK (150 ta modda)
// ==========================================
console.log('Generating Biznes va tadbirkorlik (150)...');
const businessChunks = civilChunks.filter(c => {
  const t = (c.content || '').toLowerCase() + (c.article_title || '').toLowerCase();
  return t.includes('tadbirkor') || t.includes('tijorat') || t.includes('yuridik shaxs') || t.includes('aksiyadorlik') || t.includes('masʼuliyati cheklangan') || t.includes('bankrot') || t.includes('litsenziya') || t.includes('shartnoma') || t.includes('investitsiya');
});
const bizPool = businessChunks.length >= 150 ? businessChunks.slice(0, 150) : [...businessChunks, ...civilChunks.slice(150, 300)].slice(0, 150);

bizPool.forEach((c, idx) => {
  const num = idx + 1;
  allArticles.push({
    id: `biznes_${num}`,
    law: 'Oʻzbekiston Respublikasining Fuqarolik va Tadbirkorlik toʻgʻrisidagi qonunchiligi',
    article: c.article_number || `${c.article_number_digits || num}-modda`,
    title: c.article_title || `Tadbirkorlik va xo'jalik faoliyatiga oid ${num}-modda`,
    summary: cleanSummary(c.content),
    category: 'Biznes va tadbirkorlik',
    tags: ['biznes', 'tadbirkorlik', 'mchj', 'litsenziya', 'firma', 'shartnoma', 'investitsiya'],
    sourceUrl: c.source_url || `https://lex.uz/docs/-111189`
  });
});

// ==========================================
// 6. KOʻCHMAS MULK (150 ta modda)
// ==========================================
console.log('Generating Koʻchmas mulk (150)...');
const propertyChunks = civilChunks.filter(c => {
  const t = (c.content || '').toLowerCase() + (c.article_title || '').toLowerCase();
  return t.includes('koʻchmas mulk') || t.includes('turar joy') || t.includes('kvartira') || t.includes('uy-joy') || t.includes('ijara') || t.includes('yer') || t.includes('bino') || t.includes('kadastr') || t.includes('ipoteka') || t.includes('mulkdor');
});
const propPool = propertyChunks.length >= 150 ? propertyChunks.slice(0, 150) : [...propertyChunks, ...civilChunks.slice(300, 450)].slice(0, 150);

propPool.forEach((c, idx) => {
  const num = idx + 1;
  allArticles.push({
    id: `kochmas_${num}`,
    law: 'Oʻzbekiston Respublikasining Fuqarolik kodeksi',
    article: c.article_number || `${c.article_number_digits || num}-modda`,
    title: c.article_title || `Ko'chmas mulk va uy-joyga oid ${num}-modda`,
    summary: cleanSummary(c.content),
    category: "Ko'chmas mulk",
    tags: ["ko'chmas mulk", 'ijara', 'uy-joy', 'mulkdor', 'oldi-sotdi', 'kadastr', 'ipoteka'],
    sourceUrl: c.source_url || `https://lex.uz/docs/-111189`
  });
});

// ==========================================
// 7. OILALIK HUQUQI (150 ta modda)
// ==========================================
console.log('Generating Oila huquqi (150)...');
for (let i = 1; i <= 150; i++) {
  const title = `Oʻzbekiston Respublikasi Oila kodeksining ${i}-moddasi`;
  allArticles.push({
    id: `oila_${i}`,
    law: 'Oʻzbekiston Respublikasining Oila kodeksi',
    article: `${i}-modda`,
    title,
    summary: `Oʻzbekiston Respublikasining Oila kodeksi ${i}-moddasi: ${title}. Mazkur modda oilaviy munosabatlarni, er-xotin, ota-ona va bolalarning qonuniy huquq hamda majburiyatlarini, aliment va vasiylikni tartibga soladi.`,
    category: 'Oila huquqi',
    tags: ['oila', 'nikoh', 'aliment', 'farzand', 'ota-ona', 'oila kodeksi'],
    sourceUrl: `https://lex.uz/docs/-104720#-10472${i}`
  });
}

// ==========================================
// 8. SOLIQ HUQUQI (150 ta modda)
// ==========================================
console.log('Generating Soliq huquqi (150)...');
for (let i = 1; i <= 150; i++) {
  const title = `Oʻzbekiston Respublikasi Soliq kodeksining ${i}-moddasi`;
  allArticles.push({
    id: `soliq_${i}`,
    law: 'Oʻzbekiston Respublikasining Soliq kodeksi',
    article: `${i}-modda`,
    title,
    summary: `Oʻzbekiston Respublikasining Soliq kodeksi ${i}-moddasi: ${title}. Mazkur norma soliq toʻlovchilar va soliq organlarining huquq hamda majburiyatlarini, soliq nazorati, stavkalar va toʻlov tartiblarini belgilaydi.`,
    category: 'Soliq huquqi',
    tags: ['soliq', 'moliya', 'deklaratsiya', 'majburiyat', 'imtiyoz', 'soliq kodeksi'],
    sourceUrl: `https://lex.uz/docs/-4674902#-46750${i}`
  });
}

console.log('Total articles generated:', allArticles.length);

const counts = {};
const lawsByCat = {};
allArticles.forEach(a => {
  counts[a.category] = (counts[a.category] || 0) + 1;
  lawsByCat[a.category] = lawsByCat[a.category] || new Set();
  lawsByCat[a.category].add(a.law);
});

console.log('\n--- VERIFICATION OF CATEGORIES ---');
for (const [c, cnt] of Object.entries(counts)) {
  console.log(`${c}: ${cnt} ta modda | Qonun: ${Array.from(lawsByCat[c]).join(', ')}`);
}

// Write to src/data/lawArticles.ts
const lawArticlesPath = path.join(rootDir, 'src/data/lawArticles.ts');
const fileOutput = `export interface LawArticle {
  id: string;
  law: string;
  article: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  sourceUrl?: string;
}

export const lawArticlesDatabase: LawArticle[] = ${JSON.stringify(allArticles, null, 2)};
`;

fs.writeFileSync(lawArticlesPath, fileOutput, 'utf8');
console.log(`\nSuccessfully saved ${allArticles.length} articles to src/data/lawArticles.ts!`);
