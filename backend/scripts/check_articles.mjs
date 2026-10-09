import fs from 'fs';

const dbJson = JSON.parse(fs.readFileSync('server/data/lawArticlesDatabase.json', 'utf8'));
console.log('lawArticlesDatabase.json count:', dbJson.length);

const tsContent = fs.readFileSync('src/data/lawArticles.ts', 'utf8');
const jsonMatch = tsContent.indexOf('= [') + 2;
const jsonEnd = tsContent.lastIndexOf(']');
const tsArray = JSON.parse(tsContent.slice(jsonMatch, jsonEnd + 1));
console.log('src/data/lawArticles.ts count:', tsArray.length);

const ruInDb = dbJson.filter(a =>
  /[а-яА-ЯёЁ]/.test(a.title + (a.short_description || '') + (a.content || '')) ||
  /\b(statьya|glava|razdel|narushenie|vlechet|nalojenie|shtrafa)\b/i.test(a.title + (a.short_description || '') + (a.content || ''))
);
console.log('Russian in DB:', ruInDb.length);

const ruInTs = tsArray.filter(a =>
  /[а-яА-ЯёЁ]/.test(a.title + (a.short_description || '') + (a.content || '')) ||
  /\b(statьya|glava|razdel|narushenie|vlechet|nalojenie|shtrafa)\b/i.test(a.title + (a.short_description || '') + (a.content || ''))
);
console.log('Russian in TS:', ruInTs.length);
