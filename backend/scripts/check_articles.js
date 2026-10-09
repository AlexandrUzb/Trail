import fs from 'fs';
import path from 'path';

const content = fs.readFileSync('src/data/lawArticles.ts', 'utf-8');
const lines = content.split('\n');
const counts = {};
let total = 0;
for (const line of lines) {
  const m = line.match(/"category":\s*"([^"]+)"/);
  if (m) {
    counts[m[1]] = (counts[m[1]] || 0) + 1;
    total++;
  }
}
console.log('Total articles in src/data/lawArticles.ts:', total);
console.log('Category breakdown:', counts);

// Check legal documents in server/data/legal_documents
const docsDir = 'server/data/legal_documents';
const subdirs = fs.readdirSync(docsDir);
console.log('\nAvailable in server/data/legal_documents:');
for (const dir of subdirs) {
  const full = path.join(docsDir, dir);
  if (fs.statSync(full).isDirectory()) {
    const chunksPath = path.join(full, 'chunks.json');
    if (fs.existsSync(chunksPath)) {
      const chunks = JSON.parse(fs.readFileSync(chunksPath, 'utf-8'));
      console.log(`- ${dir}: ${chunks.length} chunks`);
    }
  }
}
