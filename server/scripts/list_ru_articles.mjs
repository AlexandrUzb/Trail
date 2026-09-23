import fs from 'fs';
const data = JSON.parse(fs.readFileSync('server/data/lawArticlesDatabase.json', 'utf8'));
const ru = data.filter(a =>
  /[а-яА-ЯёЁ]/.test(a.title + (a.short_description || '') + (a.content || '')) ||
  /\b(statьya|glava|razdel|narushenie|vlechet|nalojenie|shtrafa)\b/i.test(a.title + (a.short_description || '') + (a.content || ''))
);
console.log('Total found:', ru.length);
ru.forEach((a, idx) => {
  console.log(`${idx + 1}. [${a.id}] ${a.article_number} -> ${a.title}`);
});
