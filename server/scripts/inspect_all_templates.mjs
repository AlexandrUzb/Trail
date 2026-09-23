import fs from 'fs';

const content = fs.readFileSync('./src/data/legalTemplates.ts', 'utf8');
const idMatches = [...content.matchAll(/id:\s*(\d+),/g)];
console.log('Total id occurrences:', idMatches.length);

const nameMatches = [...content.matchAll(/name:\s*["']([^"']+)["'],/g)];
console.log('Total name occurrences:', nameMatches.length);

const catMatches = [...content.matchAll(/category:\s*["']([^"']+)["'],/g)];
console.log('Total category occurrences:', catMatches.length);

const catCounts = {};
catMatches.forEach(m => {
  catCounts[m[1]] = (catCounts[m[1]] || 0) + 1;
});
console.log('Categories breakdown:', catCounts);
