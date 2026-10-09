import fs from 'fs';

const f = fs.readFileSync('src/data/legalTemplates.ts', 'utf8');
const cats = [...f.matchAll(/category:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const counts = {};
cats.forEach(c => counts[c] = (counts[c] || 0) + 1);
console.log('Categories counts:', counts);
console.log('Total templates found:', cats.length);
