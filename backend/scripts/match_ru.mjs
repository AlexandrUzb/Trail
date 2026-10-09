import fs from 'fs';

const dbJson = JSON.parse(fs.readFileSync('server/data/lawArticlesDatabase.json', 'utf8'));

const ruArticles = dbJson.filter(a =>
  /[а-яА-ЯёЁ]/.test(a.title + (a.short_description || '') + (a.content || '')) ||
  /\b(statьya|glava|razdel|narushenie|vlechet|nalojenie|shtrafa)\b/i.test(a.title + (a.short_description || '') + (a.content || ''))
);

console.log('Total Russian articles:', ruArticles.length);
ruArticles.forEach((a, i) => {
  const num = (a.article_number || '').replace(/\D+/g, '');
  console.log(`${i + 1}. ID: ${a.id}, Art: "${a.article_number}", digits: ${num}`);
});
