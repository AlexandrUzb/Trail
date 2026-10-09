import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetPath = path.resolve(__dirname, '../../src/data/legalTemplates.ts');

const header = `import {
  LegalDocumentModel,
  cleanField,
  formatUzbekDate,
  formatMoney,
  renderToPlainText
} from '../utils/documentRenderer';

export interface Field {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  helper?: string;
  options?: string[];
}

export interface LegalTemplate {
  id: number;
  name: string;
  icon: string;
  category: string;
  desc?: string;
  legalBasis?: string;
  disclaimer?: string;
  fields: Field[];
  generateModel: (data: Record<string, string>) => LegalDocumentModel;
  generate: (data: Record<string, string>) => string;
}

export const TEMPLATE_CATEGORIES = [
  'Barchasi',
  'Ijara va ko‘chmas mulk',
  'Mehnat hujjatlari',
  'Umumiy arizalar',
  'Sud hujjatlari',
  'Qarzdorlik va pul',
  'Shartnomalar',
  'Ishonchnoma va vakolat',
  'Avtomobil',
  'Oila va fuqarolik',
  'Tadbirkorlik'
];

export const legalTemplatesDatabase: LegalTemplate[] = [
`;

// We will construct the templates array
const templates = [];

// =========================================================================
// 1. IJARA VA KO‘CHMAS MULK (10 templates)
// =========================================================================

// Template 1: Uy-joy ijara shartnomasi (Exact prompt example structure)
templates.push(`  {
    id: 1,
    name: "Uy-joy ijara shartnomasi",
    icon: "ri-home-4-line",
    category: "Ijara va ko‘chmas mulk",
    desc: "Fuqarolik kodeksining 600–615-moddalari asosida turar joyni ijaraga berish namunaviy shartnomasi",
    legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 600–615-moddalari",
    disclaimer: "Ushbu shartnoma namunaviy loyiha hisoblanadi. O‘zbekiston Respublikasi Soliq kodeksiga binoan, turar joy ijara shartnomasi soliq organlarida (ijara.soliq.uz) hisobga qo‘yilishi shart.",
    fields: [
      { key: "city", label: "Tuzilgan shahar/tuman", type: "text", placeholder: "Toshkent shahri", required: true },
      { key: "date", label: "Shartnoma sanasi", type: "date", required: true },
      { key: "landlordName", label: "Ijaraga beruvchi F.I.Sh.", type: "text", placeholder: "Aliyev Anvar Akmalovich", required: true },
      { key: "landlordPassport", label: "Ijaraga beruvchi pasport/ID", type: "text", placeholder: "AB 1234567, berilgan sana...", required: true },
      { key: "landlordPhone", label: "Ijaraga beruvchi telefoni", type: "text", placeholder: "+998 90 123 45 67" },
      { key: "landlordAddress", label: "Ijaraga beruvchi doimiy manzili", type: "text", placeholder: "Toshkent sh., Chilonzor tumani...", required: true },
      { key: "tenantName", label: "Ijarachi F.I.Sh.", type: "text", placeholder: "Karimov Javohir Zafarovich", required: true },
      { key: "tenantPassport", label: "Ijarachi pasport/ID", type: "text", placeholder: "AA 7654321, berilgan sana...", required: true },
      { key: "tenantPhone", label: "Ijarachi telefoni", type: "text", placeholder: "+998 93 987 65 43" },
      { key: "tenantAddress", label: "Ijarachi doimiy manzili", type: "text", placeholder: "Samarqand sh., Registon ko'chasi..." },
      { key: "propertyAddress", label: "Ijaraga berilayotgan uy-joy manzili", type: "text", placeholder: "Toshkent sh., Yunusobod tumani, 4-mavze, 12-uy, 45-xonadon", required: true },
      { key: "propertyDetails", label: "Uy-joy tavsifi (xonalar soni, jihozlar)", type: "textarea", placeholder: "3 xonali xonadon, mebellar, muzlatgich, kir yuvish mashinasi bilan..." },
      { key: "rentAmount", label: "Oylik ijara haqi (so‘m)", type: "number", placeholder: "3000000", required: true },
      { key: "paymentDay", label: "Har oylik to‘lov sanasi", type: "text", placeholder: "Har oyning 5-sanasiga qadar" },
      { key: "periodMonths", label: "Ijara muddati (oy)", type: "number", placeholder: "12", required: true },
      { key: "startDate", label: "Boshlanish sanasi", type: "date", required: true },
      { key: "endDate", label: "Tugash sanasi", type: "date", required: true }
    ],
    generateModel: (d) => ({
      title: "UY-JOY IJARA SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: \`Bir tomondan, \${cleanField(d.landlordName, "Ijaraga beruvchi F.I.Sh.")}, pasport/ID: \${cleanField(d.landlordPassport, "Pasport ma'lumotlari")}, yashash manzili: \${cleanField(d.landlordAddress, "Manzil")}, keyingi o‘rinlarda "Ijaraga beruvchi" deb yuritiladi, ikkinchi tomondan \${cleanField(d.tenantName, "Ijarachi F.I.Sh.")}, pasport/ID: \${cleanField(d.tenantPassport, "Pasport ma'lumotlari")}, yashash manzili: \${cleanField(d.tenantAddress, "Manzil")}, keyingi o‘rinlarda "Ijarachi" deb yuritiladi, birgalikda "Taraflar" deb yuritilib, O‘zbekiston Respublikasi Fuqarolik kodeksining 600–615-moddalariga asosan ushbu shartnomani quyidagilar haqida tuzdilar:\`,
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI",
          paragraphs: [
            \`1.1. Ijaraga beruvchi o‘ziga tegishli bo‘lgan \${cleanField(d.propertyAddress, "Uy-joyning to‘liq manzili")} manzilidagi turar joyni Ijarachiga vaqtincha foydalanish va yashash uchun ijaraga beradi.\`,
            \`1.2. Uy-joyning tavsifi va holati: \${cleanField(d.propertyDetails, "Uy-joy yashash uchun yaroqli texnik va sanitariya holatida topshiriladi.")}\`,
            "1.3. Uy-joydan foydalanish maqsadi: faqat fuqarolarning doimiy yoki vaqtincha yashashi uchun mo‘ljallangan. Undan boshqa maqsadlarda (ishlab chiqarish, omborxona, ofis va h.k.) foydalanish taqiqlanadi."
          ]
        },
        {
          title: "2. IJARA HAQI VA TO‘LOV TARTIBI",
          paragraphs: [
            \`2.1. Mazkur shartnoma bo‘yicha oylik ijara haqi \${formatMoney(d.rentAmount)} etib belgilanadi.\`,
            \`2.2. Ijara to‘lovi \${cleanField(d.paymentDay, "har oyning 5-sanasiga qadar")} naqd pul yoki bank kartasi orqali to‘liq hajmda to‘lanadi.\`,
            "2.3. Kommunal to‘lovlar (elektr energiyasi, gaz, sovuq va issiq suv, chiqindi, isitish tizimi) haqiqiy hisoblagich ko‘rsatkichlari asosida Ijarachi tomonidan o‘z vaqtida to‘lanadi, agar taraflar yozma ravishda boshqacha tartib belgilamagan bo‘lsa."
          ]
        },
        {
          title: "3. TARAFLARNING HUQUQ VA MAJBURIYATLARI",
          paragraphs: [
            "3.1. Ijaraga beruvchining majburiyatlari: uy-joyni shartnomada belgilangan muddatda va foydalanishga yaroqli holatda topshirish; kommunal tizimlarning soz ishlashini ta'minlash; shartnoma shartlariga qat'iy rioya qilish.",
            "3.2. Ijarachining majburiyatlari: uy-joydan faqat yashash maqsadida foydalanish; ijara haqini va kommunal to‘lovlarni belgilangan muddatda to‘lash; uy-joy va undagi mol-mulkni asrab-avaylash, yong‘in va sanitariya xavfsizligi qoidalariga rioya qilish; uy-joyni uchinchi shaxslarga ijaraga (subijaraga) bermaslik.",
            "3.3. Ijaraga beruvchi uy-joyning holatini tekshirish uchun oldindan ogohlantirgan holda oyiga ko‘pi bilan 1 marta kelib ko‘rish huquqiga ega."
          ]
        },
        {
          title: "4. SHARTNOMA MUDDATI",
          paragraphs: [
            \`4.1. Ushbu shartnoma \${cleanField(d.periodMonths, "12")} oy muddatga tuziladi.\`,
            \`4.2. Shartnomaning boshlanish sanasi: \${formatUzbekDate(d.startDate)}.\`,
            \`4.3. Shartnomaning tugash sanasi: \${formatUzbekDate(d.endDate)}.\`
          ]
        },
        {
          title: "5. TARAFLARNING JAVOBGARLIGI",
          paragraphs: [
            "5.1. Taraflar ushbu shartnoma bo‘yicha o‘z majburiyatlarini bajarmagan yoki lozim darajada bajarmagan taqdirda, O‘zbekiston Respublikasining amaldagi qonunchiligi va ushbu shartnomaga muvofiq javobgar bo‘ladilar.",
            "5.2. Ijarachi tomonidan ijara to‘lovi kechiktirilgan taqdirda, kechiktirilgan har bir kun uchun to‘lanmagan summaning 0.1 foizi miqdorida penya hisoblanishi mumkin, ammo bu umumiy qarzning 10 foizidan oshmasligi lozim.",
            "5.3. Ijarachi uy-joyga yoki undagi jihozlarga yetkazilgan moddiy zararni to‘liq qoplashga majburdir."
          ]
        },
        {
          title: "6. SHARTNOMANI BEKOR QILISH TARTIBI",
          paragraphs: [
            "6.1. Shartnoma taraflarning o‘zaro yozma kelishuviga asosan istalgan vaqtda bekor qilinishi mumkin.",
            "6.2. Ijarachi shartnomani muddatidan oldin bekor qilmoqchi bo‘lsa, Ijaraga beruvchini kamida 1 oy (30 kun) oldin yozma ravishda ogohlantirishi shart.",
            "6.3. Ijarachi to‘lovni ketma-ket 2 marotabadan ortiq kechiktirsa yoki uy-joyga jiddiy zarar yetkazsa, Ijaraga beruvchi shartnomani bir tomonlama bekor qilishni talab qilishga haqlidir."
          ]
        },
        {
          title: "7. YAKUNIY QOIDALAR",
          paragraphs: [
            "7.1. Ushbu shartnomada nazarda tutilmagan barcha nizoli masalalar O‘zbekiston Respublikasining amaldagi Fuqarolik kodeksi va tegishli qonun hujjatlariga muvofiq hal etiladi.",
            "7.2. Shartnoma yuzasidan kelib chiqqan nizolar dastlab muzokaralar yo‘li bilan, kelishuvga erishilmagan taqdirda esa uy-joy joylashgan hududdagi Fuqarolik ishlari bo‘yicha tumanlararo sudida ko‘rib chiqiladi.",
            "7.3. Mazkur shartnoma bir xil yuridik kuchga ega bo‘lgan 2 (ikki) nusxada tuzildi va har bir tarafga bir nusxadan taqdim etildi."
          ]
        }
      ],
      signatures: [
        {
          role: "IJARAGA BERUVCHI",
          name: cleanField(d.landlordName, "Aliyev Anvar Akmalovich"),
          details: [
            \`Pasport/ID: \${cleanField(d.landlordPassport, "__________________________")}\`,
            \`Telefon: \${cleanField(d.landlordPhone, "__________________________")}\`,
            \`Manzil: \${cleanField(d.landlordAddress, "__________________________")}\`
          ]
        },
        {
          role: "IJARACHI",
          name: cleanField(d.tenantName, "Karimov Javohir Zafarovich"),
          details: [
            \`Pasport/ID: \${cleanField(d.tenantPassport, "__________________________")}\`,
            \`Telefon: \${cleanField(d.tenantPhone, "__________________________")}\`,
            \`Manzil: \${cleanField(d.tenantAddress, "__________________________")}\`
          ]
        }
      ],
      disclaimer: "Ushbu hujjat namunaviy loyiha sifatida tayyorlandi. Uni topshirishdan oldin tegishli tashkilot talablari va hujjatning holatingizga mosligini tekshiring. Ko‘chmas mulk ijara shartnomasi soliq organlarida (ijara.soliq.uz) ro‘yxatga olinishi qonuniy majburiydir."
    }),
    generate: (d) => renderToPlainText(legalTemplatesDatabase[0].generateModel(d))
  }`);

// Template 2: Noturar joy ijara shartnomasi
templates.push(`  {
    id: 2,
    name: "Noturar joy ijara shartnomasi",
    icon: "ri-building-line",
    category: "Ijara va ko‘chmas mulk",
    desc: "Ofis, do‘kon, ishlab chiqarish yoki omborxona binolarini tijorat ijarasiga berish shartnomasi",
    legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 535–557-moddalari",
    disclaimer: "Ushbu shartnoma loyiha hisoblanadi. 1 yildan ortiq muddatga tuzilgan noturar joy ijara shartnomalari davlat ro‘yxatidan o‘tkazilishi shart.",
    fields: [
      { key: "city", label: "Shahar/Tuman", type: "text", placeholder: "Toshkent shahri", required: true },
      { key: "date", label: "Shartnoma sanasi", type: "date", required: true },
      { key: "landlord", label: "Ijaraga beruvchi (F.I.Sh. yoki MChJ)", type: "text", placeholder: "«Universal Savdo» MChJ", required: true },
      { key: "landlordRep", label: "Ijaraga beruvchi vakili / rahbari", type: "text", placeholder: "Direktor Qodirov B.B." },
      { key: "landlordInn", label: "Ijaraga beruvchi STIR / Pasport", type: "text", placeholder: "STIR: 301234567" },
      { key: "tenant", label: "Ijarachi (F.I.Sh. yoki Kompaniya)", type: "text", placeholder: "«Biznes Rivoj» MChJ", required: true },
      { key: "tenantRep", label: "Ijarachi vakili / rahbari", type: "text", placeholder: "Direktor Karimov S.A." },
      { key: "tenantInn", label: "Ijarachi STIR / Pasport", type: "text", placeholder: "STIR: 309876543" },
      { key: "address", label: "Bino joylashgan manzil", type: "text", placeholder: "Toshkent sh., Mirobod tumani, Amir Temur ko'chasi, 25-bino", required: true },
      { key: "area", label: "Maydoni (kv.m)", type: "number", placeholder: "120", required: true },
      { key: "purpose", label: "Foydalanish maqsadi", type: "text", placeholder: "Ofis va savdo faoliyati uchun" },
      { key: "rentAmount", label: "Oylik ijara to‘lovi (so‘m)", type: "number", placeholder: "12000000", required: true },
      { key: "months", label: "Ijara muddati (oy)", type: "number", placeholder: "11", required: true }
    ],
    generateModel: (d) => ({
      title: "NOTURAR JOY IJARA SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: \`Bir tomondan, \${cleanField(d.landlord, "Ijaraga beruvchi")}, nomidan \${cleanField(d.landlordRep, "uquqli vakil")} asosida harakat qiluvchi, keyingi o‘rinlarda "Ijaraga beruvchi", ikkinchi tomondan \${cleanField(d.tenant, "Ijarachi")}, nomidan \${cleanField(d.tenantRep, "huquqli vakil")} asosida harakat qiluvchi, keyingi o‘rinlarda "Ijarachi", O‘zbekiston Respublikasi Fuqarolik kodeksiga asosan mazkur shartnomani quyidagilar haqida tuzdilar:\`,
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI",
          paragraphs: [
            \`1.1. Ijaraga beruvchi \${cleanField(d.address, "Noturar joy manzili")} manzilida joylashgan, umumiy maydoni \${cleanField(d.area, "____")} kv.metr bo‘lgan noturar bino/xonadonni Ijarachiga vaqtincha haq evaziga egalik qilish va foydalanish uchun topshiradi.\`,
            \`1.2. Binodan foydalanish maqsadi: \${cleanField(d.purpose, "Ofis va tijorat maqsadlarida foydalanish")}.\`,
            "1.3. Bino barcha muhandislik tarmoqlari soz holatda, topshirish-qabul qilish dalolatnomasi asosida topshiriladi."
          ]
        },
        {
          title: "2. TO‘LOV TARTIBI VA HISOB-KITOBLAR",
          paragraphs: [
            \`2.1. Noturar joyning oylik ijara haqi \${formatMoney(d.rentAmount)} etib belgilanadi.\`,
            "2.2. Ijara to‘lovi har oyning 10-sanasiga qadar Ijaraga beruvchining hisob-kitob varag‘iga to‘lov topshirig‘i orqali o‘tkaziladi.",
            "2.3. Kommunal xizmatlar (elektr, suv, isitish, xavfsizlik) haqiqiy iste'mol ko‘rsatkichlari bo‘yicha taqdim etilgan hisob-fakturalarga muvofiq Ijarachi tomonidan to‘lanadi."
          ]
        },
        {
          title: "3. TARAFLARNING MAJBURIYATLARI",
          paragraphs: [
            "3.1. Ijaraga beruvchi binoni shartnoma imzolangandan so‘ng 3 ish kuni ichida dalolatnoma bilan topshirishi shart.",
            "3.2. Ijarachi yong‘in xavfsizligi, sanitariya normalari va sanitariya-epidemiologiya qoidalariga qat'iy rioya qilishi, binoning asosiy konstruksiyalarini Ijaraga beruvchining ruxsatisiz o‘zgartirmasligi shart.",
            "3.3. Binoni joriy ta'mirlash Ijarachi hisobidan, kapital ta'mirlash esa Ijaraga beruvchi hisobidan amalga oshiriladi."
          ]
        },
        {
          title: "4. MUDDAT VA YAKUNIY QOIDALAR",
          paragraphs: [
            \`4.1. Shartnoma \${cleanField(d.months, "11")} oy muddatga tuzildi va imzolangan kundan boshlab kuchga kiradi.\`,
            "4.2. Barcha nizolar taraflarning o‘zaro muzokaralari orqali, hal etilmagan taqdirda Toshkent tumanlararo iqtisodiy sudida ko‘rib chiqiladi.",
            "4.3. Mazkur shartnoma bir xil yuridik kuchga ega bo‘lgan 2 nusxada tuzildi."
          ]
        }
      ],
      signatures: [
        {
          role: "IJARAGA BERUVCHI",
          name: cleanField(d.landlord, "Kompaniya nomi / F.I.Sh."),
          details: [
            \`Vakil: \${cleanField(d.landlordRep, "Rahbar F.I.Sh.")}\`,
            \`STIR / Rekvizitlar: \${cleanField(d.landlordInn, "STIR: ________")}\`
          ]
        },
        {
          role: "IJARACHI",
          name: cleanField(d.tenant, "Kompaniya nomi / F.I.Sh."),
          details: [
            \`Vakil: \${cleanField(d.tenantRep, "Rahbar F.I.Sh.")}\`,
            \`STIR / Rekvizitlar: \${cleanField(d.tenantInn, "STIR: ________")}\`
          ]
        }
      ],
      disclaimer: "Ushbu shartnoma namunaviy loyiha hisoblanadi. Tijorat faoliyatida soliq hisobotlari (E-ijara tizimi) talablariga rioya qilinishi lozim."
    }),
    generate: (d) => renderToPlainText(legalTemplatesDatabase[1].generateModel(d))
  }`);

console.log('Done with initial block. Appending remaining modules...');
