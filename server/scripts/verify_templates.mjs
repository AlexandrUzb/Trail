import { templatesPart1 } from './templates_part1.mjs';
import { templatesPart2 } from './templates_part2.mjs';
import { templatesPart3 } from './templates_part3.mjs';
import { templatesPart4 } from './templates_part4.mjs';

const allTemplates = [
  ...templatesPart1,
  ...templatesPart2,
  ...templatesPart3,
  ...templatesPart4
];

console.log('Total templates loaded:', allTemplates.length);
const ids = new Set(allTemplates.map(t => t.id));
console.log('Unique IDs:', ids.size);
for (let i = 1; i <= 83; i++) {
  if (!ids.has(i)) {
    console.error(`Missing template ID: ${i}`);
  }
}
