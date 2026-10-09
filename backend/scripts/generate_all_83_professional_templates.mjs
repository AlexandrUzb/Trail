import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetPath = path.resolve(__dirname, '../../src/data/legalTemplates.ts');

console.log('Writing 83 authentic legal templates to:', targetPath);

// We will write a comprehensive generator
const scriptContent = `
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetFile = path.resolve(__dirname, '../../src/data/legalTemplates.ts');

// We assemble the TypeScript file
`;

