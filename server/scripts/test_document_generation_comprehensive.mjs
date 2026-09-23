import { legalTemplatesDatabase } from '../../src/data/legalTemplates.js';
import { exportToDocx, renderToPlainText, formatUzbekDate, formatMoney, cleanField } from '../../src/utils/documentRenderer.js';
import fs from 'fs';

console.log('=== COMPREHENSIVE LEGAL DOCUMENT GENERATION VERIFICATION ===\n');
console.log(`Total templates in database: ${legalTemplatesDatabase.length}`);

if (legalTemplatesDatabase.length !== 83) {
  console.error(`ERROR: Expected 83 templates, found ${legalTemplatesDatabase.length}`);
  process.exit(1);
}

// 1. Test User Sample for "Uy-joy ijara shartnomasi"
console.log('\n--- 1. Testing Uy-joy ijara shartnomasi with real user sample data ---');
const leaseTemplate = legalTemplatesDatabase.find(t => t.id === 1);
if (!leaseTemplate) {
  console.error('ERROR: Template #1 (Uy-joy ijara shartnomasi) not found!');
  process.exit(1);
}

const userSampleData = {
  city: 'Termiz shahri',
  date: '2026-09-19',
  landlordName: 'Aliyev Anvar Akmalovich',
  landlordPassport: 'AB 1234567, 15.02.2021 da berilgan',
  landlordAddress: 'Termiz sh., Markaziy ko‘cha, 5-uy',
  tenantName: 'Karimov Javohir Zafarovich',
  tenantPassport: 'AA 7654321, 10.05.2022 da berilgan',
  tenantAddress: 'Samarqand sh., Registon ko‘chasi, 10-uy',
  propertyAddress: 'Termiz shahri, Mustaqillik ko‘chasi, 12-uy, 4-xonadon',
  propertyDetails: '3 xonali xonadon, to‘liq jihozlangan',
  rentAmount: '2000000',
  paymentDay: 'Har oyning 5-sanasiga qadar',
  periodMonths: '12',
  startDate: '2026-10-01',
  endDate: '2027-09-30'
};

const model1 = leaseTemplate.generateModel(userSampleData);
const text1 = leaseTemplate.generate(userSampleData);

console.log('Generated Title:', model1.title);
console.log('Generated City/Date:', model1.city, '|', model1.date);
console.log('Sections Count:', model1.sections.length);

// Check forbidden artifacts
const forbiddenRegex = /(\$\{.*\}|d\.[a-zA-Z0-9_]+|undefined|null|\\n)/g;

function checkClean(output, name) {
  const matches = output.match(forbiddenRegex);
  if (matches) {
    console.error(`FAILED: Forbidden pattern found in ${name}:`, matches);
    return false;
  }
  return true;
}

if (!checkClean(text1, 'Sample Lease text')) {
  process.exit(1);
}

// Verify key data appears
if (!text1.includes('Aliyev Anvar Akmalovich')) {
  console.error('ERROR: landlordName "Aliyev Anvar Akmalovich" missing from generated text');
  process.exit(1);
}
if (!text1.includes('Karimov Javohir Zafarovich')) {
  console.error('ERROR: tenantName "Karimov Javohir Zafarovich" missing from generated text');
  process.exit(1);
}
if (!text1.includes('2 000 000 so‘m')) {
  console.error('ERROR: rentAmount formatted "2 000 000 so‘m" missing from generated text');
  process.exit(1);
}
if (!text1.includes('Termiz shahri')) {
  console.error('ERROR: city "Termiz shahri" missing from generated text');
  process.exit(1);
}

console.log('✓ Sample Lease test PASSED: Real names and formatted money cleanly present!');

// 2. Test Empty Data on Lease
console.log('\n--- 2. Testing Empty Input Data on Uy-joy ijara shartnomasi ---');
const emptyModel = leaseTemplate.generateModel({});
const emptyText = leaseTemplate.generate({});

if (!checkClean(emptyText, 'Empty Lease text')) {
  process.exit(1);
}
if (emptyText.includes('undefined') || emptyText.includes('null')) {
  console.error('ERROR: "undefined" or "null" found in empty lease text');
  process.exit(1);
}
console.log('✓ Empty input test PASSED: Safe underlines and defaults rendered cleanly!');

// 3. Test Across Diverse Categories
console.log('\n--- 3. Testing 10 Diverse Template Categories ---');
const testTemplateIds = [
  1,  // Ijara
  11, // Mehnat shartnomasi
  13, // Ishdan bo'shash arizasi
  21, // Umumiy ariza
  31, // Da'vo arizasi
  41, // Tilxat — pul qarzi
  47, // Oldi-sotdi shartnomasi
  56, // Umumiy ishonchnoma
  62, // Avtomobil oldi-sotdi
  68, // Nikohdan ajratish da'vosi
  74  // B2B Xizmat ko'rsatish
];

for (const id of testTemplateIds) {
  const t = legalTemplatesDatabase.find(tpl => tpl.id === id);
  if (!t) {
    console.error(`ERROR: Template #${id} missing!`);
    process.exit(1);
  }
  const model = t.generateModel({});
  const txt = t.generate({});
  if (!checkClean(txt, `Template #${id} (${t.name})`)) {
    process.exit(1);
  }
  console.log(`✓ Template #${id} [${t.category}] "${t.name}" passed (Sections: ${model.sections.length}, Signatures: ${model.signatures?.length || 0})`);
}

// 4. Test ALL 83 Templates for Syntax Safety
console.log('\n--- 4. Validating ALL 83 templates for zero syntax leaks ---');
let allPassed = true;
for (const t of legalTemplatesDatabase) {
  const txtEmpty = t.generate({});
  const matches = txtEmpty.match(forbiddenRegex);
  if (matches) {
    console.error(`Template #${t.id} (${t.name}) leak:`, matches);
    allPassed = false;
  }
}

if (!allPassed) {
  console.error('ERROR: Some templates failed validation.');
  process.exit(1);
}
console.log('✓ All 83 templates verified: 100% CLEAN of template syntax, variables, or undefined!');

console.log('\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===\n');
