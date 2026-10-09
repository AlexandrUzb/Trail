import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { templatesPart1 } from './templates_part1.mjs';
import { templatesPart2 } from './templates_part2.mjs';
import { templatesPart3 } from './templates_part3.mjs';
import { templatesPart4 } from './templates_part4.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gkztwgxxcahwmzwvimzi.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const allTemplates = [
  ...templatesPart1,
  ...templatesPart2,
  ...templatesPart3,
  ...templatesPart4
];

console.log(`Found ${allTemplates.length} templates to sync with Supabase...`);

function mapCategory(name, category) {
  const normName = name.toLowerCase();
  const normCat = (category || '').toLowerCase();
  
  if (normName.includes('ijara') || normCat.includes('ijara')) {
    return 'a0f29bef-18bc-402f-823e-fa4149778c9c'; // Ijara
  }
  if (normCat.includes('uy-joy') || normName.includes('uy-joy') || normName.includes('mulk') || normName.includes('kvartira') || normName.includes('yer')) {
    return 'd3e497a2-9351-43ad-86ad-7c91ba1c5c0f'; // Uy-joy huquqi
  }
  if (normCat.includes('mehnat') || normName.includes('ish') || normName.includes('xodim') || normName.includes('mehnat') || normName.includes('ta’til') || normName.includes('tatil')) {
    return 'fe4ee33c-7d46-4d72-96cf-18643c2b2b15'; // Mehnat huquqi
  }
  if (normName.includes('nikoh') || normName.includes('ajrashish') || normName.includes('ajrim')) {
    return '89f9ea80-e176-4123-9593-cd627791b150'; // Nikoh va ajrashish
  }
  if (normCat.includes('oila') || normName.includes('aliment') || normName.includes('vasiylik') || normName.includes('farzand')) {
    return '74dafc22-1f57-4276-9f93-cea8ce2b15c9'; // Oila huquqi
  }
  if (normName.includes('meros') || normCat.includes('meros')) {
    return 'd18e3bb7-e42e-46d4-9dd1-77acf20d4c2d'; // Meros
  }
  if (normCat.includes('shartnoma') || normCat.includes('biznes') || normName.includes('oldi-sotdi') || normName.includes('yetkazib berish') || normName.includes('xizmat ko‘rsatish') || normName.includes('kredit')) {
    return 'e39ab265-a19b-46e1-9618-425e2b4aaf62'; // Tadbirkorlik
  }
  if (normCat.includes('sud') || normCat.includes('nizo') || normName.includes('da’vo') || normName.includes('shikoyat') || normName.includes('sud')) {
    return 'aa20a296-ecdd-4572-a2a4-1250798624c4'; // Fuqarolik huquqi
  }
  if (normCat.includes('ariza') || normCat.includes('murojaat')) {
    return 'b61e8dec-5cd1-4023-ba03-c56dfa36572f'; // Ma'muriy huquq
  }
  return 'aa20a296-ecdd-4572-a2a4-1250798624c4'; // Fuqarolik huquqi
}

async function syncTemplates() {
  // 1. Fetch existing templates in public.document_templates
  const { data: existing, error: fetchErr } = await supabase
    .from('document_templates')
    .select('id, title_uz');

  if (fetchErr) {
    console.error('Error fetching existing templates:', fetchErr);
    process.exit(1);
  }

  const existingMap = new Map();
  (existing || []).forEach(t => {
    existingMap.set(t.title_uz.toLowerCase().trim(), t.id);
  });

  console.log(`Existing templates in Supabase: ${existingMap.size}`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const t of allTemplates) {
    const title = t.name.trim();
    const catId = mapCategory(title, t.category);
    const existingId = existingMap.get(title.toLowerCase());

    const fieldsList = (t.fields || [])
      .map(f => `- ${f.label}: [${f.placeholder || f.label}]`)
      .join('\n');

    const contentTemplate = `NAMUNAVIY HUJJAT SHABLONI — ADVOKATAI
${title.toUpperCase()}
Huquqiy asosi: ${t.legalBasis || 'O‘zbekiston Respublikasi amaldagi qonunchiligi'}

${t.disclaimer || 'Ushbu hujjat namunaviy loyiha hisoblanadi.'}

Sana va joy: [Sana, Shartnoma tuzilgan shahar/tuman]

Hujjat parametrlari va kiritilishi lozim bo‘lgan ma’lumotlar:
${fieldsList}

Hujjat mazmuni va asosiy shartlari:
[Tegishli holatlar va kelishuv shartlari batafsil bayoni]

Tomonlar imzolari:
[Imzo, F.I.Sh.]`;

    const payload = {
      title_uz: title,
      description_uz: t.desc || `Namunaviy yuridik hujjat: ${title}`,
      category_id: catId,
      content_template: contentTemplate,
      is_active: true,
      requires_login: true,
      updated_at: new Date().toISOString()
    };

    if (existingId) {
      // Update
      const { error: updErr } = await supabase
        .from('document_templates')
        .update(payload)
        .eq('id', existingId);

      if (updErr) {
        console.warn(`Warning updating "${title}":`, updErr.message);
      } else {
        updatedCount++;
      }
    } else {
      // Insert
      const { error: insErr } = await supabase
        .from('document_templates')
        .insert({
          ...payload,
          created_at: new Date().toISOString()
        });

      if (insErr) {
        console.warn(`Warning inserting "${title}":`, insErr.message);
      } else {
        insertedCount++;
      }
    }
  }

  console.log(`\n====================================================`);
  console.log(`SYNC COMPLETE: ${insertedCount} inserted, ${updatedCount} updated.`);
  const { count } = await supabase
    .from('document_templates')
    .select('*', { count: 'exact', head: true });
  console.log(`Total document_templates in Supabase now: ${count}`);
  console.log(`====================================================\n`);
}

syncTemplates().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
