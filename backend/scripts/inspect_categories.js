import fs from 'fs';

const code = fs.readFileSync('src/data/lawArticles.ts', 'utf-8');
const articles = eval(code.replace('export interface LawArticle {', '/*').replace('export const lawArticlesDatabase: LawArticle[] =', '*/ const list =') + '; list');

const categories = [...new Set(articles.map(a => a.category))];
for (const cat of categories) {
  const filtered = articles.filter(a => a.category === cat);
  console.log(`Category: "${cat}" (${filtered.length} articles)`);
  console.log(`  First: ${filtered[0].article} - ${filtered[0].title}`);
  console.log(`  Last:  ${filtered[filtered.length - 1].article} - ${filtered[filtered.length - 1].title}`);
  console.log(`  Law:   ${filtered[0].law}`);
}
