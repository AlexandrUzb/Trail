/**
 * Official Institution Registry for AdvokatAI (Uzbekistan - 2026 Data)
 * Provides verified official names, hotlines, web portals, and jurisdictions.
 */

export const OFFICIAL_INSTITUTIONS = {
  // 1. Mehnat sohasidagi davlat organlari
  labor_inspectorate: {
    id: 'labor_inspectorate',
    official_name: 'O‘zbekiston Respublikasi Kambag‘allikni qisqartirish va bandlik vazirligi huzuridagi Davlat mehnat inspeksiyasi',
    short_name: 'Davlat mehnat inspeksiyasi',
    hotline: '1176',
    phone: '+998 (71) 200-06-00',
    portal: 'https://dmi.mehnat.uz',
    telegram_bot: '@dmi_vazirlik_bot',
    jurisdiction: 'Mehnat huquqlari buzilishi, oylik maosh kechiktirilishi, noqonuniy bo‘shatish va mehnat xavfsizligi'
  },

  // 2. Korrupsiyaga qarshi kurashish
  anti_corruption_agency: {
    id: 'anti_corruption_agency',
    official_name: 'O‘zbekiston Respublikasi Korrupsiyaga qarshi kurashish agentligi',
    short_name: 'Korrupsiyaga qarshi kurashish agentligi',
    hotline: '1253',
    phone: '+998 (71) 207-04-04',
    portal: 'https://antikor.uz',
    jurisdiction: 'Korrupsiya holatlari, pora talab qilish, manfaatlar to‘qnashuvi'
  },

  // 3. Bosh prokuratura
  prosecutor_general: {
    id: 'prosecutor_general',
    official_name: 'O‘zbekiston Respublikasi Bosh prokuraturasi',
    short_name: 'Bosh prokuratura',
    hotline: '1007',
    phone: '+998 (71) 232-10-07',
    portal: 'https://prokuratura.uz',
    jurisdiction: 'Qonun ustuvorligi, mansab vakolatini suiisteʼmol qilish, jinoyatlar'
  },

  // 4. Inson huquqlari (Ombudsman)
  ombudsman: {
    id: 'ombudsman',
    official_name: 'Oliy Majlisning Inson huquqlari bo‘yicha vakili (Ombudsman)',
    short_name: 'Ombudsman',
    hotline: '1096',
    phone: '+998 (71) 200-10-96',
    portal: 'https://ombudsman.uz',
    jurisdiction: 'Davlat organlari va mansabdor shaxslar tomonidan inson huquqlari buzilishi'
  },

  // 5. Yo'l harakati xavfsizligi
  traffic_safety: {
    id: 'traffic_safety',
    official_name: 'Ichki ishlar vazirligi Jamoat xavfsizligi departamenti Yo‘l harakati xavfsizligi xizmati',
    short_name: 'YHXX (Yo‘l harakati xavfsizligi xizmati)',
    hotline: '1102',
    portal: 'https://yhxx.uz',
    jurisdiction: 'Yo‘l harakati qoidabuzarliklari, fotoradar jarimalari, haydovchilik guvohnomalari'
  },

  // 6. Sud tizimi
  court_system: {
    civil_court: {
      name: 'Fuqarolik ishlari bo‘yicha tumanlararo (shahar) sudi',
      jurisdiction: 'Mulk, ijara nizolari, qarz undirish, nikoh va oilaviy nizolar, yakka tartibdagi mehnat nizolari'
    },
    administrative_court: {
      name: 'Tumanlararo maʼmuriy sud',
      jurisdiction: 'Davlat organlari va mansabdor shaxslarning noqonuniy qarorlari, harakatlari (harakatsizligi) ustidan shikoyatlar'
    },
    criminal_court: {
      name: 'Jinoyat ishlari bo‘yicha tuman (shahar) sudi',
      jurisdiction: 'Jinoyat ishlari va maʼmuriy huquqbuzarliklar bo‘yicha maʼmuriy jazo qo‘llash'
    }
  },

  // 7. Iste’molchilar huquqlarini himoya qilish
  consumer_protection: {
    id: 'consumer_protection',
    official_name: 'O‘zbekiston Respublikasi Raqobatni rivojlantirish va iste’molchilar huquqlarini himoya qilish qo‘mitasi',
    short_name: 'Iste’molchilar huquqlarini himoya qilish qo‘mitasi',
    hotline: '1159',
    phone: '+998 (71) 207-47-00',
    portal: 'https://consumer.gov.uz',
    jurisdiction: 'Iste’molchilar huquqlari buzilishi, sifatsiz tovar va xizmatlar, ortiqcha to‘lovlar'
  },

  // 8. Yagona interaktiv davlat xizmatlari portali
  my_gov: {
    name: 'Yagona interaktiv davlat xizmatlari portali (YaIDXP)',
    portal: 'https://my.gov.uz',
    hotline: '1242',
    jurisdiction: 'Davlat xizmatlari, onlayn arizalar, maʼlumotnomalar olish'
  }
};

/**
 * Validates whether an official authority is legally permitted to be recommended for a specific legal domain.
 * CRITICAL RULE: A labor authority (e.g. labor_inspectorate / 1176) must NEVER be recommended for a civil/rental dispute.
 */
export function isAuthorityAllowedForDomain(institutionId, domain) {
  if (!institutionId || !domain) return true;
  const d = domain.toLowerCase();

  if (institutionId === 'labor_inspectorate') {
    return d === 'labor';
  }
  if (institutionId === 'consumer_protection') {
    return d === 'consumer' || d === 'civil';
  }
  if (institutionId === 'anti_corruption_agency') {
    return d === 'criminal' || d === 'corruption';
  }
  if (institutionId === 'traffic_safety') {
    return d === 'administrative' || d === 'traffic';
  }

  return true;
}

/**
 * Returns formatted institution contact block for assistant responses.
 */
export function getInstitutionBlock(institutionId) {
  const inst = OFFICIAL_INSTITUTIONS[institutionId];
  if (!inst) return '';
  return `**Vakolatli organ:** ${inst.official_name}\n**Ishonch telefoni (Call-markaz):** ${inst.hotline}${inst.portal ? `\n**Rasmiy veb-sayt:** ${inst.portal}` : ''}`;
}
