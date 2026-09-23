import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gkztwgxxcahwmzwvimzi.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_CujwKGKQIc70VQo4wQZWXw_r3O3Bhk0';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDiscrepancy() {
  const { data: dbTemplates, error } = await sb
    .from('document_templates')
    .select('id, title_uz, description_uz, category_id, legal_categories(name_uz)')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching templates:', error);
    process.exit(1);
  }

  const content = fs.readFileSync('./src/data/legalTemplates.ts', 'utf8');
  const nameMatches = [...content.matchAll(/name:\s*["']([^"']+)["'],/g)].map(m => m[1].toLowerCase().trim());
  const localSet = new Set(nameMatches);

  console.log(`Total active document_templates in Supabase: ${dbTemplates.length}`);
  console.log(`Total templates in local legalTemplatesDatabase: ${localSet.size}`);

  const additional = [];
  const matched = [];

  dbTemplates.forEach(t => {
    if (localSet.has(t.title_uz.toLowerCase().trim())) {
      matched.push(t);
    } else {
      additional.push(t);
    }
  });

  console.log(`\nMatched templates count: ${matched.length}`);
  console.log(`Additional records count: ${additional.length}`);
  console.log('\n--- The 4 Additional Templates in Supabase ---');
  additional.forEach((t, i) => {
    console.log(`${i + 1}. ID: ${t.id}`);
    console.log(`   Title: "${t.title_uz}"`);
    console.log(`   Category: "${t.legal_categories?.name_uz || 'N/A'}"`);
    console.log(`   Description: "${t.description_uz || 'N/A'}"\n`);
  });
}

checkDiscrepancy().catch(console.error);
