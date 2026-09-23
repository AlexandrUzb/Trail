import fs from 'fs';

let content = fs.readFileSync('src/data/legalTemplates.ts', 'utf8');

// Replace TEMPLATE_CATEGORIES
const oldCatDef = `export const TEMPLATE_CATEGORIES = [
  'Barchasi',
  'Ijara va ko‘chmas mulk',
  'Mehnat hujjatlari',
  'Umumiy arizalar',
  'Sud hujjatlari',
  'Qarzdorlik va pul',
  'Shartnomalar',
  'Ishonchnoma va vakolat',
  'Avtomobil',
  'Oila va fuqarolik',
  'Tadbirkorlik'
];`;

const newCatDef = `export const TEMPLATE_CATEGORIES = [
  'Barchasi',
  'Uy-joy va mulk',
  'Mehnat va bandlik',
  'Arizalar va murojaatlar',
  'Sud va nizolar',
  'Shartnomalar va biznes',
  'Oila va fuqarolik'
];`;

if (content.includes(oldCatDef)) {
  content = content.replace(oldCatDef, newCatDef);
} else {
  console.log('Warning: oldCatDef not found directly, replacing regex');
  content = content.replace(/export const TEMPLATE_CATEGORIES = \[[^\]]*\];/s, newCatDef);
}

// Map template categories
content = content.replace(/category:\s*["']Ijara va ko‘chmas mulk["']/g, 'category: "Uy-joy va mulk"');
content = content.replace(/category:\s*["']Avtomobil["']/g, 'category: "Uy-joy va mulk"');
content = content.replace(/category:\s*["']Mehnat hujjatlari["']/g, 'category: "Mehnat va bandlik"');
content = content.replace(/category:\s*["']Umumiy arizalar["']/g, 'category: "Arizalar va murojaatlar"');
content = content.replace(/category:\s*["']Ishonchnoma va vakolat["']/g, 'category: "Arizalar va murojaatlar"');
content = content.replace(/category:\s*["']Sud hujjatlari["']/g, 'category: "Sud va nizolar"');
content = content.replace(/category:\s*["']Qarzdorlik va pul["']/g, 'category: "Sud va nizolar"');
content = content.replace(/category:\s*["']Shartnomalar["']/g, 'category: "Shartnomalar va biznes"');
content = content.replace(/category:\s*["']Tadbirkorlik["']/g, 'category: "Shartnomalar va biznes"');
content = content.replace(/category:\s*["']Oila va fuqarolik["']/g, 'category: "Oila va fuqarolik"');

fs.writeFileSync('src/data/legalTemplates.ts', content, 'utf8');
console.log('Successfully updated src/data/legalTemplates.ts categories!');
