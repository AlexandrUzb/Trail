import fs from 'fs';

async function download() {
  console.log('Downloading MJtK from lex.uz (doc 97664)...');
  const res = await fetch('https://lex.uz/docs/97664');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  fs.writeFileSync('server/data/mjtk_full_raw.html', html, 'utf8');
  console.log('Saved server/data/mjtk_full_raw.html, size:', html.length);
}

download();
