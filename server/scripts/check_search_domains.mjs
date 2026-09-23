import fs from 'fs';

const db = JSON.parse(fs.readFileSync('server/data/lawArticlesDatabase.json', 'utf8'));

const CATEGORY_MAP = {
  'Konstitutsiyaviy huquq': 'Konstitutsiya va davlat',
  'Mehnat huquqi': 'Mehnat va bandlik',
  'Fuqarolik huquqi': 'Fuqarolik va mulk',
  'Meros huquqi': 'Fuqarolik va mulk',
  'Intellektual mulk': 'Fuqarolik va mulk',
  'Iste’molchilar huquqlari': 'Fuqarolik va mulk',
  'Oila huquqi': 'Oila va nikoh',
  'Uy-joy huquqi': 'Uy-joy va yer',
  'Yer huquqi': 'Uy-joy va yer',
  'Ekologiya huquqi': 'Uy-joy va yer',
  'Soliq huquqi': 'Soliq va tadbirkorlik',
  'Tadbirkorlik huquqi': 'Soliq va tadbirkorlik',
  'Moliya va bank huquqi': 'Soliq va tadbirkorlik',
  'Jinoyat huquqi': 'Jinoyat va javobgarlik',
  'Jinoyat-protsessual huquq': 'Jinoyat va javobgarlik',
  'Ma’muriy huquq': 'Ma’muriy masalalar',
  'Transport huquqi': 'Ma’muriy masalalar',
  'Sud va protsessual masalalar': 'Sud va protsess',
  'Fuqarolik protsessual huquqi': 'Sud va protsess',
  'Boshqa huquqiy masalalar': 'Sud va protsess',
};

const counts = {};
const unmapped = [];

for (const a of db) {
  const primary = CATEGORY_MAP[a.category] || a.category;
  counts[primary] = (counts[primary] || 0) + 1;
  if (!CATEGORY_MAP[a.category]) {
    unmapped.push(a.category);
  }
}

console.log('9 Primary Domain counts:', counts);
console.log('Unmapped categories count:', unmapped.length);
