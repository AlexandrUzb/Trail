import fs from 'fs';

const html = fs.readFileSync('C:/Users/Envy/.gemini/antigravity/brain/b1fb4fd7-e9c3-473b-91d2-3048a61b4270/.system_generated/steps/3518/content.md', 'utf8');

console.log(html.slice(383000, 385500));
