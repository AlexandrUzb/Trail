import fs from 'fs';
const content = fs.readFileSync('server/scripts/generate_templates_data.js', 'utf8');
const names = [...content.matchAll(/name:\s*"([^"]+)"/g)].map(m => m[1]);
console.log('Total templates found:', names.length);
for (let i = 0; i < names.length; i++) {
  console.log(`${i + 1}. ${names[i]}`);
}
