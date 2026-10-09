import fs from 'fs';
const content = fs.readFileSync('./src/data/lawArticles.ts', 'utf8');
const list = JSON.parse(content.match(/export const lawArticlesDatabase: LawArticle\[\] = (\[[\s\S]*\]);/)[1]);

const catLaws = {};
list.forEach(a => {
  catLaws[a.category] = catLaws[a.category] || new Set();
  catLaws[a.category].add(a.law);
});
for (const [k, v] of Object.entries(catLaws)) {
  console.log(k, '->', Array.from(v));
}
