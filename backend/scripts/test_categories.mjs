import fs from 'fs';
const content = fs.readFileSync('./src/data/lawArticles.ts', 'utf8');
const list = JSON.parse(content.match(/export const lawArticlesDatabase: LawArticle\[\] = (\[[\s\S]*\]);/)[1]);

const categories = [
  'Barchasi',
  'Mehnat huquqi',
  "Ko'chmas mulk",
  'Oila huquqi',
  'Soliq huquqi',
  'Jinoyat huquqi',
  'Fuqarolik huquqi',
  'Maʼmuriy huquq',
  'Konstitutsiya',
];

for (const c of categories) {
  if (c === 'Barchasi') continue;
  const matches = list.filter(a => a.category === c);
  console.log(c, 'count exact:', matches.length);
}

const dbCats = {};
list.forEach(a => {
  dbCats[a.category] = (dbCats[a.category] || 0) + 1;
});
console.log('DB Cats:', dbCats);
