// Part 1: Templates 1 to 46 (Categories 1 to 5)

export const templatesPart1 = [];

// =========================================================================
// CATEGORY 1: IJARA VA KO‘CHMAS MULK (Templates 1-10)
// =========================================================================

// 1. Uy-joy ijara shartnomasi (Detailed prompt example)
templatesPart1.push({
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
    { key: "landlordPassport", label: "Ijaraga beruvchi pasport/ID", type: "text", placeholder: "AB 1234567, 15.02.2021 da berilgan", required: true },
    { key: "landlordPhone", label: "Ijaraga beruvchi telefoni", type: "text", placeholder: "+998 90 123 45 67" },
    { key: "landlordAddress", label: "Ijaraga beruvchi doimiy manzili", type: "text", placeholder: "Toshkent sh., Chilonzor tumani...", required: true },
    { key: "tenantName", label: "Ijarachi F.I.Sh.", type: "text", placeholder: "Karimov Javohir Zafarovich", required: true },
    { key: "tenantPassport", label: "Ijarachi pasport/ID", type: "text", placeholder: "AA 7654321, 10.05.2022 da berilgan", required: true },
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
  codeBody: `(d) => ({
      title: "UY-JOY IJARA SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan, " + cleanField(d.landlordName, "Ijaraga beruvchi F.I.Sh.") + ", pasport/ID: " + cleanField(d.landlordPassport, "Pasport ma'lumotlari") + ", yashash manzili: " + cleanField(d.landlordAddress, "Manzil") + ", keyingi o‘rinlarda «Ijaraga beruvchi» deb yuritiladi, ikkinchi tomondan " + cleanField(d.tenantName, "Ijarachi F.I.Sh.") + ", pasport/ID: " + cleanField(d.tenantPassport, "Pasport ma'lumotlari") + ", yashash manzili: " + cleanField(d.tenantAddress, "Manzil") + ", keyingi o‘rinlarda «Ijarachi» deb yuritiladi, birgalikda «Taraflar» deb yuritilib, O‘zbekiston Respublikasi Fuqarolik kodeksining 600–615-moddalariga asosan ushbu shartnomani quyidagilar haqida tuzdilar:",
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI",
          paragraphs: [
            "1.1. Ijaraga beruvchi o‘ziga tegishli bo‘lgan " + cleanField(d.propertyAddress, "Uy-joyning to‘liq manzili") + " manzilidagi turar joyni Ijarachiga vaqtincha foydalanish va yashash uchun ijaraga beradi.",
            "1.2. Uy-joyning tavsifi va holati: " + cleanField(d.propertyDetails, "Uy-joy yashash uchun yaroqli texnik va sanitariya holatida topshiriladi."),
            "1.3. Uy-joydan foydalanish maqsadi: faqat fuqarolarning doimiy yoki vaqtincha yashashi uchun mo‘ljallangan. Undan boshqa maqsadlarda (ishlab chiqarish, omborxona, ofis va h.k.) foydalanish taqiqlanadi."
          ]
        },
        {
          title: "2. IJARA HAQI VA TO‘LOV TARTIBI",
          paragraphs: [
            "2.1. Mazkur shartnoma bo‘yicha oylik ijara haqi " + formatMoney(d.rentAmount) + " etib belgilanadi.",
            "2.2. Ijara to‘lovi " + cleanField(d.paymentDay, "har oyning 5-sanasiga qadar") + " naqd pul yoki bank kartasi orqali to‘liq hajmda to‘lanadi.",
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
            "4.1. Ushbu shartnoma " + cleanField(d.periodMonths, "12") + " oy muddatga tuziladi.",
            "4.2. Shartnomaning boshlanish sanasi: " + formatUzbekDate(d.startDate) + ".",
            "4.3. Shartnomaning tugash sanasi: " + formatUzbekDate(d.endDate) + "."
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
            "Pasport/ID: " + cleanField(d.landlordPassport, "__________________________"),
            "Telefon: " + cleanField(d.landlordPhone, "__________________________"),
            "Manzil: " + cleanField(d.landlordAddress, "__________________________")
          ]
        },
        {
          role: "IJARACHI",
          name: cleanField(d.tenantName, "Karimov Javohir Zafarovich"),
          details: [
            "Pasport/ID: " + cleanField(d.tenantPassport, "__________________________"),
            "Telefon: " + cleanField(d.tenantPhone, "__________________________"),
            "Manzil: " + cleanField(d.tenantAddress, "__________________________")
          ]
        }
      ],
      disclaimer: "Ushbu hujjat namunaviy loyiha sifatida tayyorlandi. Uni topshirishdan oldin tegishli tashkilot talablari va hujjatning holatingizga mosligini tekshiring. Ko‘chmas mulk ijara shartnomasi soliq organlarida (ijara.soliq.uz) ro‘yxatga olinishi qonuniy majburiydir."
    })`
});

// 2. Noturar joy ijara shartnomasi
templatesPart1.push({
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
  codeBody: `(d) => ({
      title: "NOTURAR JOY IJARA SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan, " + cleanField(d.landlord, "Ijaraga beruvchi") + ", nomidan " + cleanField(d.landlordRep, "vakil") + " asosida harakat qiluvchi, keyingi o‘rinlarda «Ijaraga beruvchi», ikkinchi tomondan " + cleanField(d.tenant, "Ijarachi") + ", nomidan " + cleanField(d.tenantRep, "vakil") + " asosida harakat qiluvchi, keyingi o‘rinlarda «Ijarachi», O‘zbekiston Respublikasi Fuqarolik kodeksiga asosan mazkur shartnomani quyidagilar haqida tuzdilar:",
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI",
          paragraphs: [
            "1.1. Ijaraga beruvchi " + cleanField(d.address, "Noturar joy manzili") + " manzilida joylashgan, umumiy maydoni " + cleanField(d.area, "____") + " kv.metr bo‘lgan noturar bino/xonadonni Ijarachiga vaqtincha haq evaziga egalik qilish va foydalanish uchun topshiradi.",
            "1.2. Binodan foydalanish maqsadi: " + cleanField(d.purpose, "Ofis va tijorat maqsadlarida foydalanish") + ".",
            "1.3. Bino barcha muhandislik tarmoqlari soz holatda, topshirish-qabul qilish dalolatnomasi asosida topshiriladi."
          ]
        },
        {
          title: "2. TO‘LOV TARTIBI VA HISOB-KITOBLAR",
          paragraphs: [
            "2.1. Noturar joyning oylik ijara haqi " + formatMoney(d.rentAmount) + " etib belgilanadi.",
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
            "4.1. Shartnoma " + cleanField(d.months, "11") + " oy muddatga tuzildi va imzolangan kundan boshlab kuchga kiradi.",
            "4.2. Barcha nizolar taraflarning o‘zaro muzokaralari orqali, hal etilmagan taqdirda tumanlararo iqtisodiy sudida ko‘rib chiqiladi.",
            "4.3. Mazkur shartnoma bir xil yuridik kuchga ega bo‘lgan 2 nusxada tuzildi."
          ]
        }
      ],
      signatures: [
        {
          role: "IJARAGA BERUVCHI",
          name: cleanField(d.landlord, "Kompaniya nomi / F.I.Sh."),
          details: [
            "Vakil: " + cleanField(d.landlordRep, "Rahbar F.I.Sh."),
            "STIR: " + cleanField(d.landlordInn, "STIR: ________")
          ]
        },
        {
          role: "IJARACHI",
          name: cleanField(d.tenant, "Kompaniya nomi / F.I.Sh."),
          details: [
            "Vakil: " + cleanField(d.tenantRep, "Rahbar F.I.Sh."),
            "STIR: " + cleanField(d.tenantInn, "STIR: ________")
          ]
        }
      ],
      disclaimer: "Ushbu shartnoma namunaviy loyiha hisoblanadi. Tijorat faoliyatida soliq hisobotlari (E-ijara tizimi) talablariga rioya qilinishi lozim."
    })`
});

// 3. Avtomobil ijara shartnomasi
templatesPart1.push({
  id: 3,
  name: "Avtomobil ijara shartnomasi",
  icon: "ri-car-line",
  category: "Ijara va ko‘chmas mulk",
  desc: "Avtotransport vositasini haydovchisiz vaqtincha ijaraga berish shartnomasi (Fuqarolik kodeksi 564–572)",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 564–572-moddalari",
  disclaimer: "Jismoniy shaxslar o‘rtasidagi avtotransport ijarasi notarial tartibda tasdiqlanishi yoki elektron sug‘urta polislari tizimida qayd etilishi talab qilinadi.",
  fields: [
    { key: "city", label: "Shahar/Tuman", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "date", label: "Sana", type: "date", required: true },
    { key: "owner", label: "Mulkdor F.I.Sh.", type: "text", placeholder: "Zokirov Akmal Tohirovich", required: true },
    { key: "renter", label: "Ijarachi F.I.Sh.", type: "text", placeholder: "Rustamov Jamshid Davronovich", required: true },
    { key: "carModel", label: "Avtomobil rusumi va modeli", type: "text", placeholder: "Chevrolet Gentra", required: true },
    { key: "carPlate", label: "Davlat raqam belgisi", type: "text", placeholder: "01 A 777 AA", required: true },
    { key: "carVin", label: "Kuzov (VIN) raqami", type: "text", placeholder: "KL1TF69Y..." },
    { key: "rentAmount", label: "Ijara summasi (oylik/kunlik so‘mda)", type: "number", placeholder: "4500000", required: true },
    { key: "period", label: "Ijara muddati", type: "text", placeholder: "6 oyga" }
  ],
  codeBody: `(d) => ({
      title: "AVTOMOBIL IJARA SHARTNOMASI",
      subtitle: "(Haydovchisiz transport vositasi ijarasi)",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan, " + cleanField(d.owner, "Mulkdor F.I.Sh.") + ", keyingi o‘rinlarda «Ijaraga beruvchi», ikkinchi tomondan " + cleanField(d.renter, "Ijarachi F.I.Sh.") + ", keyingi o‘rinlarda «Ijarachi», Fuqarolik kodeksining 564-moddasiga asosan quyidagilar haqida ushbu shartnomani tuzdilar:",
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI",
          paragraphs: [
            "1.1. Ijaraga beruvchi o‘ziga tegishli bo‘lgan " + cleanField(d.carModel, "Avtomobil rusumi") + ", davlat raqami: " + cleanField(d.carPlate, "01 A 000 AA") + ", VIN/kuzov raqami: " + cleanField(d.carVin, "________") + " transport vositasini Ijarachiga vaqtincha foydalanish uchun topshiradi.",
            "1.2. Avtotransport vositasi Ijarachiga texnik soz holatda, topshirish-qabul qilish dalolatnomasi asosida topshiriladi."
          ]
        },
        {
          title: "2. TO‘LOV TARTIBI VA MUDDATI",
          paragraphs: [
            "2.1. Avtomobil uchun ijara to‘lovi " + formatMoney(d.rentAmount) + " etib belgilanadi.",
            "2.2. Shartnoma " + cleanField(d.period, "12 oy muddat") + "ga tuzildi va tomonlar imzolagan paytdan boshlab kuchga kiradi."
          ]
        },
        {
          title: "3. TARAFLARNING MAJBURIYATLARI",
          paragraphs: [
            "3.1. Ijarachi transport vositasini ehtiyotkorlik bilan boshqarishi, yo‘l harakati qoidalariga rioya qilishi va yuzaga kelgan ma'muriy jarimalarni o‘z hisobidan to‘lashi shart.",
            "3.2. Yoqilg‘i-moylash mahsulotlari va joriy ta'mirlash xarajatlari Ijarachi hisobidan qoplanadi.",
            "3.3. Ijarachi transport vositasini uchinchi shaxslarga boshqarish uchun topshirishga yoki subijaraga berishga haqli emas."
          ]
        }
      ],
      signatures: [
        { role: "IJARAGA BERUVCHI (MULKDOR)", name: cleanField(d.owner, "Mulkdor F.I.Sh.") },
        { role: "IJARACHI", name: cleanField(d.renter, "Ijarachi F.I.Sh.") }
      ],
      disclaimer: "O‘zbekiston Respublikasi qonunchiligiga binoan, avtotransport ijarasi notarial tasdiqlanishi yoki YHXDX bazasiga elektron tarzda kiritilishi talab etiladi."
    })`
});

// 4. Uskuna/mulk ijara shartnomasi
templatesPart1.push({
  id: 4,
  name: "Uskuna/mulk ijara shartnomasi",
  icon: "ri-tools-line",
  category: "Ijara va ko‘chmas mulk",
  desc: "Ishlab chiqarish asbob-uskunalari, texnika yoki boshqa ko‘char mulkni ijaraga berish shartnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 535–557-moddalari",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Samarqand shahri", required: true },
    { key: "date", label: "Sana", type: "date", required: true },
    { key: "landlord", label: "Ijaraga beruvchi", type: "text", placeholder: "Qosimov Otabek Shokirovich", required: true },
    { key: "tenant", label: "Ijarachi", type: "text", placeholder: "«Innovatsiya Qurilish» MChJ", required: true },
    { key: "equipment", label: "Uskuna nomi, modeli va seriya raqami", type: "text", placeholder: "Beton qorgich (Beton mixers) JS-500, №12345", required: true },
    { key: "rentPrice", label: "Oylik ijara narxi (so‘m)", type: "number", placeholder: "5000000", required: true },
    { key: "period", label: "Muddati", type: "text", placeholder: "6 oy" }
  ],
  codeBody: `(d) => ({
      title: "ASBOB-USKUNA VA ASOSIY VOSITALAR IJARA SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan " + cleanField(d.landlord, "Ijaraga beruvchi") + " va ikkinchi tomondan " + cleanField(d.tenant, "Ijarachi") + ", quyidagilar to‘g‘risida mazkur shartnomani tuzdilar:",
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI",
          paragraphs: [
            "1.1. Ijaraga beruvchi o‘ziga mulk huquqi bilan tegishli bo‘lgan " + cleanField(d.equipment, "Uskuna nomi va texnik parametrlari") + " uskunasini Ijarachiga vaqtincha ishlab chiqarish va texnik maqsadlarda foydalanish uchun topshiradi.",
            "1.2. Uskunaning texnik holati va unumdorligi topshirish dalolatnomasida qayd etiladi."
          ]
        },
        {
          title: "2. TO‘LOV SHARTLARI",
          paragraphs: [
            "2.1. Uskunaning oylik ijara haqi " + formatMoney(d.rentPrice) + " miqdorida belgilanadi.",
            "2.2. To‘lov har oyning 5-kuniga qadar amalga oshiriladi."
          ]
        },
        {
          title: "3. TARAFLARNING MAJBURIYATLARI",
          paragraphs: [
            "3.1. Ijarachi uskunadan texnik yo‘riqnomaga muvofiq professional foydalanishi va uning butligini ta'minlashi shart.",
            "3.2. Ijarachi uskunani muddat tugashi bilan soz holatda Ijaraga beruvchiga qaytaradi."
          ]
        }
      ],
      signatures: [
        { role: "IJARAGA BERUVCHI", name: cleanField(d.landlord, "F.I.Sh.") },
        { role: "IJARACHI", name: cleanField(d.tenant, "F.I.Sh.") }
      ],
      disclaimer: "Ushbu hujjat namunaviy loyiha hisoblanadi. Uskunani topshirish paytida qabul qilish-topshirish dalolatnomasi tuzilishi shart."
    })`
});

// 5. Ijara shartnomasini bekor qilish to‘g‘risida ariza/bildirishnoma
templatesPart1.push({
  id: 5,
  name: "Ijara shartnomasini bekor qilish to‘g‘risida ariza",
  icon: "ri-close-circle-line",
  category: "Ijara va ko‘chmas mulk",
  desc: "Shartnomani muddatidan oldin bekor qilish to‘g‘risida ikkinchi tarafga rasmiy ogohlantirish xati",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 551-moddasi",
  fields: [
    { key: "recipientName", label: "Kimga (Ikkinchi taraf F.I.Sh.)", type: "text", placeholder: "Aliyev Vali G'aniyevichga", required: true },
    { key: "senderName", label: "Kimdan (Ariza beruvchi F.I.Sh.)", type: "text", placeholder: "Karimov Sherzod Alisherovichdan", required: true },
    { key: "contractNumber", label: "Shartnoma raqami va sanasi", type: "text", placeholder: "2025-yil 15-fevraldagi 12-sonli shartnoma", required: true },
    { key: "propertyAddress", label: "Ijara obyekti manzili", type: "text", placeholder: "Toshkent sh., Chilonzor tumani, 5-mavze, 10-uy", required: true },
    { key: "reason", label: "Bekor qilish asosi va sababi", type: "textarea", placeholder: "Boshqa hududga ko‘chib ketish munosabati bilan...", required: true },
    { key: "terminationDate", label: "Bekor qilinadigan sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "BILDIRISHNOMA (ARIZA)",
      subtitle: "Ijara shartnomasini muddatidan oldin bekor qilish to‘g‘risida",
      headerRight: [
        cleanField(d.recipientName, "Ijaraga beruvchi F.I.Sh.") + "ga",
        cleanField(d.senderName, "Ijarachi F.I.Sh.") + "dan"
      ],
      date: formatUzbekDate(),
      sections: [
        {
          title: "BILDIRISHNOMA MATNI",
          paragraphs: [
            "Siz bilan men o‘rtamizda " + cleanField(d.contractNumber, "tegishli sana va raqamdagi") + " bo‘yicha " + cleanField(d.propertyAddress, "Ko‘chmas mulk manzili") + " manzilida joylashgan obyekt yuzasidan ijara shartnomasi tuzilgan edi.",
            "O‘zbekiston Respublikasi Fuqarolik kodeksining 551-moddasi va shartnoma shartlariga muvofiq, quyidagi sabablarga ko‘ra mazkur ijara shartnomasini " + formatUzbekDate(d.terminationDate) + " kunidan boshlab bekor qilishimni ma'lum qilaman:",
            "Sabab: " + cleanField(d.reason, "Shartnomada belgilangan muddatdan oldin bekor qilish zarurati tug‘ilganligi munosabati bilan."),
            "Shu munosabat bilan, ko‘rsatilgan sanada ijara obyektini topshirish-qabul qilish dalolatnomasi asosida qabul qilib olishingizni va o‘zaro yakuniy moliyaviy hisob-kitobni amalga oshirishingizni so‘rayman."
          ]
        }
      ],
      signatures: [
        { role: "ARIZA BERUVCHI", name: cleanField(d.senderName, "F.I.Sh.") }
      ],
      disclaimer: "Fuqarolik kodeksiga ko‘ra, ijara shartnomasini bekor qilishda ikkinchi tarafni oldindan (odatda 1 oy oldin) yozma ravishda ogohlantirish majburiydir."
    })`
});

// 6. Ijara shartnomasini uzaytirish to‘g‘risida ariza
templatesPart1.push({
  id: 6,
  name: "Ijara shartnomasini uzaytirish to‘g‘risida ariza",
  icon: "ri-time-line",
  category: "Ijara va ko‘chmas mulk",
  desc: "Muddati tugayotgan ijara shartnomasini yangi muddatga uzaytirish bo‘yicha imtiyozli talab arizasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 553-moddasi",
  fields: [
    { key: "landlord", label: "Ijaraga beruvchi F.I.Sh.", type: "text", required: true },
    { key: "tenant", label: "Ijarachi F.I.Sh.", type: "text", required: true },
    { key: "contractInfo", label: "Amaldagi shartnoma sanasi va raqami", type: "text", required: true },
    { key: "newPeriod", label: "Uzaytiriladigan yangi muddat", type: "text", placeholder: "Yana 12 oyga (1 yil)", required: true }
  ],
  codeBody: `(d) => ({
      title: "ARIZA",
      subtitle: "Ijara shartnomasini yangi muddatga uzaytirish to‘g‘risida",
      headerRight: [
        cleanField(d.landlord, "Ijaraga beruvchi F.I.Sh.") + "ga",
        cleanField(d.tenant, "Ijarachi F.I.Sh.") + "dan"
      ],
      date: formatUzbekDate(),
      sections: [
        {
          title: "ARIZA MAZMUNI",
          paragraphs: [
            "Men bilan Sizning o‘rtangizda " + cleanField(d.contractInfo, "amaldagi shartnoma") + " asosida tuzilgan ijara shartnomasi muddati yaqin kunlarda tugamoqda.",
            "O‘zbekiston Respublikasi Fuqarolik kodeksining 553-moddasiga ko‘ra, o‘z majburiyatlarini lozim darajada bajargan ijarachi boshqa teng sharoitlarda yangi muddatga shartnoma tuzishda uchinchi shaxslarga nisbatan imtiyozli huquqqa ega.",
            "Yuqoridagilardan kelib chiqib, shartnomani " + cleanField(d.newPeriod, "12 oy") + " muddatga uzaytirishingizni va tegishli qo‘shimcha kelishuv imzolashingizni so‘rayman."
          ]
        }
      ],
      signatures: [
        { role: "IJARACHI", name: cleanField(d.tenant, "F.I.Sh.") }
      ],
      disclaimer: "Ushbu ariza shartnoma muddati tugashidan kamida 1 oy oldin ijaraga beruvchiga yuborilishi tavsiya etiladi."
    })`
});

// 7. Ijara to‘lovi bo‘yicha talabnoma
templatesPart1.push({
  id: 7,
  name: "Ijara to‘lovi bo‘yicha talabnoma",
  icon: "ri-error-warning-line",
  category: "Ijara va ko‘chmas mulk",
  desc: "Ijara haqi va kommunal to‘lovlar qarzdorligini ixtiyoriy to‘lash to‘g‘risida rasmiy pretenziya",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 236, 544-moddalari",
  fields: [
    { key: "debtorName", label: "Qarzdor ijarachi F.I.Sh.", type: "text", required: true },
    { key: "ownerName", label: "Mulkdor F.I.Sh.", type: "text", required: true },
    { key: "debtAmount", label: "Qarzdorlik summasi (so‘m)", type: "number", placeholder: "4500000", required: true },
    { key: "period", label: "Qaysi oylar uchun qarzdorlik", type: "text", placeholder: "2026-yil yanvar va fevral oylari uchun", required: true },
    { key: "deadlineDays", label: "To‘lash uchun berilgan muddat (kun)", type: "number", placeholder: "7", required: true }
  ],
  codeBody: `(d) => ({
      title: "TALABNOMA (PRETENZIYA)",
      subtitle: "Ijara to‘lovi bo‘yicha qarzdorlikni bartaraf etish to‘g‘risida",
      headerRight: [
        cleanField(d.debtorName, "Qarzdor Ijarachi F.I.Sh.") + "ga",
        cleanField(d.ownerName, "Ijaraga beruvchi F.I.Sh.") + "dan"
      ],
      date: formatUzbekDate(),
      sections: [
        {
          title: "TALABNOMA ASOSI VA TALABLAR",
          paragraphs: [
            "O‘rtamizda tuzilgan ijara shartnomasi shartlariga ko‘ra, Siz har oyda ijara to‘lovlarini o‘z vaqtida amalga oshirish majburiyatini olgan edingiz.",
            "Biroq Siz shartnoma majburiyatlarini buzib, " + cleanField(d.period, "o‘tgan davr") + " uchun jami " + formatMoney(d.debtAmount) + " miqdorida ijara to‘lovi qarzdorligiga yo‘l qo‘ygansiz.",
            "O‘zbekiston Respublikasi Fuqarolik kodeksining 236-moddasiga binoan, majburiyatlar shartnoma shartlariga va qonun talablariga muvofiq lozim darajada bajarilishi shart.",
            "Ushbu talabnoma qo‘lingizga tekkan kundan boshlab " + cleanField(d.deadlineDays, "7") + " kalendar kuni ichida mavjud " + formatMoney(d.debtAmount) + " miqdoridagi qarzdorlikni to‘liq bartaraf etishingizni talab qilaman.",
            "Aks holda, Fuqarolik kodeksining 551-moddasiga muvofiq ijara shartnomasi bekor qilinib, qarz summasi, penya va sud xarajatlarini undirish yuzasidan sud organlariga da'vo arizasi bilan murojaat qilinadi."
          ]
        }
      ],
      signatures: [
        { role: "TALAB QILUVCHI (MULKDOR)", name: cleanField(d.ownerName, "F.I.Sh.") }
      ],
      disclaimer: "Sudgacha talabnoma yuborish nizoni tinch yo‘l bilan hal etish hamda keyinchalik sud xarajatlarini undirishda muhim dalil hisoblanadi."
    })`
});

// 8. Ijara qarzdorligini undirish bo‘yicha da’vo arizasi
templatesPart1.push({
  id: 8,
  name: "Ijara qarzdorligini undirish bo‘yicha da’vo arizasi",
  icon: "ri-scales-line",
  category: "Ijara va ko‘chmas mulk",
  desc: "Sud tartibida ijara haqini, penya va davlat boji xarajatlarini undirish to‘g‘risida da’vo",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 236, 327, 544-moddalari va FPK 188–191-moddalari",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha Mirzo Ulug‘bek tumanlararo sudiga", required: true },
    { key: "plaintiff", label: "Da'vogar (Mulkdor) F.I.Sh., manzili, tel", type: "text", required: true },
    { key: "defendant", label: "Javobgar (Ijarachi) F.I.Sh., manzili, tel", type: "text", required: true },
    { key: "claimPrice", label: "Da'vo bahosi (so‘m)", type: "number", placeholder: "8500000", required: true },
    { key: "penalty", label: "Penya summasi (so‘m)", type: "number", placeholder: "850000" }
  ],
  codeBody: `(d) => ({
      title: "DA’VO ARIZASI",
      subtitle: "Ijara to‘lovi qarzdorligini va penyani undirish to‘g‘risida",
      headerRight: [
        cleanField(d.courtName, "Fuqarolik ishlari bo‘yicha tumanlararo sudiga"),
        "Da’vogar: " + cleanField(d.plaintiff, "F.I.Sh., yashash manzili va telefoni"),
        "Javobgar: " + cleanField(d.defendant, "F.I.Sh., yashash manzili va telefoni"),
        "Da’vo bahosi: " + formatMoney(d.claimPrice)
      ],
      date: formatUzbekDate(),
      sections: [
        {
          title: "1. ISHNING HOLATLARI",
          paragraphs: [
            "Men bilan javobgar o‘rtasida tuzilgan ijara shartnomasiga binoan, javobgar men tasarrufidagi turar joydan foydalanib kelgan.",
            "Biroq javobgar shartnomada belgilangan majburiyatlarini qasddan buzib, ijara to‘lovlarini to‘lamasdan kelmoqda. Da'vogar tomonidan yuborilgan sudgacha talabnomaga javobgar tomonidan e'tiborsiz qoldirildi."
          ]
        },
        {
          title: "2. HUQUQIY ASOS VA TALABLAR",
          paragraphs: [
            "O‘zbekiston Respublikasi Fuqarolik kodeksining 236, 324, 327 va 544-moddalariga hamda Fuqarolik protsessual kodeksining 188–191-moddalariga asosan,",
            "SUDDAN SO‘RAYMAN:",
            "1. Javobgardan mening foydamga " + formatMoney(d.claimPrice) + " miqdoridagi asosiy ijara qarzdorligini undirib berishingizni;",
            "2. Shartnomaga muvofiq " + formatMoney(d.penalty) + " miqdoridagi penyani undirib berishingizni;",
            "3. Ushbu ish bo‘yicha to‘langan davlat boji va pochta xarajatlarini javobgar zimmasiga yuklashingizni."
          ]
        },
        {
          title: "ILOVALAR RO‘YXATI",
          paragraphs: [
            "1. Ijara shartnomasi nusxasi.",
            "2. To‘lov talabnomasi va uni topshirilganligini tasdiqlovchi pochta kvitansiyasi.",
            "3. Davlat boji to‘langanligi to‘g‘risida kvitansiya.",
            "4. Da’vogar pasporti nusxasi."
          ]
        }
      ],
      signatures: [
        { role: "DA’VOGAR", name: cleanField(d.plaintiff, "F.I.Sh.") }
      ],
      disclaimer: "Da'vo arizasi topshirilishidan oldin 'Davlat boji to‘g‘risida'gi qonunga muvofiq da'vo bahosining 4 foizi miqdorida davlat boji to‘lanishi shart."
    })`
});

// 9. Uy-joyni qabul qilish-topshirish dalolatnomasi
templatesPart1.push({
  id: 9,
  name: "Uy-joyni qabul qilish-topshirish dalolatnomasi",
  icon: "ri-checkbox-circle-line",
  category: "Ijara va ko‘chmas mulk",
  desc: "Uy-joyni topshirish, hisoblagich ko‘rsatkichlari va jihozlar butligini qayd qilish dalolatnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 540, 608-moddalari",
  fields: [
    { key: "city", label: "Shahar/Tuman", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "date", label: "Sana", type: "date", required: true },
    { key: "landlord", label: "Topshiruvchi (Ijaraga beruvchi) F.I.Sh.", type: "text", required: true },
    { key: "tenant", label: "Qabul qiluvchi (Ijarachi) F.I.Sh.", type: "text", required: true },
    { key: "address", label: "Uy manzili", type: "text", required: true },
    { key: "meters", label: "Hisoblagich ko‘rsatkichlari (gaz, elektr, suv)", type: "textarea", placeholder: "Elektr: 12450 kVt, Gaz: 04520 m3, Suv: 00124 m3", required: true },
    { key: "keys", label: "Kalitlar soni", type: "text", placeholder: "2 komplekt eshik kalitlari" }
  ],
  codeBody: `(d) => ({
      title: "QABUL QILISH-TOPSHIRISH DALOLATNOMASI",
      subtitle: "Turar joyni ijaraga berish/qaytarish munosabati bilan",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Biz, quyida imzo chekuvchilar: Ijaraga beruvchi " + cleanField(d.landlord, "F.I.Sh.") + " bir tomondan, va Ijarachi " + cleanField(d.tenant, "F.I.Sh.") + " ikkinchi tomondan, ushbu dalolatnomani quyidagilar haqida tuzdik:",
      sections: [
        {
          title: "1. DALOLATNOMA MAZMUNI",
          paragraphs: [
            "1.1. Ijaraga beruvchi " + cleanField(d.address, "Uy manzili") + " manzilida joylashgan uy-joyni va undagi jihozlarni Ijarachiga foydalanish uchun topshirdi, Ijarachi esa qabul qilib oldi.",
            "1.2. Topshirish paytidagi hisoblagich ko‘rsatkichlari: " + cleanField(d.meters, "Hisoblagichlar tekshirildi va qayd etildi."),
            "1.3. Topshirilgan kalitlar: " + cleanField(d.keys, "Eshik va darvoza kalitlari to‘liq topshirildi."),
            "1.4. Taraflarda uy-joyning sifati, texnik holati va mavjud jihozlar butligi yuzasidan o‘zaro e'tirozlar mavjud emas."
          ]
        }
      ],
      signatures: [
        { role: "TOPSHIRDI (IJARAGA BERUVCHI)", name: cleanField(d.landlord, "F.I.Sh.") },
        { role: "QABUL QILDI (IJARACHI)", name: cleanField(d.tenant, "F.I.Sh.") }
      ],
      disclaimer: "Ushbu dalolatnoma ijara shartnomasining ajralmas qismi hisoblanadi va taraflarning imzosi bilan tasdiqlanadi."
    })`
});

// 10. Mol-mulkni qabul qilish-topshirish dalolatnomasi
templatesPart1.push({
  id: 10,
  name: "Mol-mulkni qabul qilish-topshirish dalolatnomasi",
  icon: "ri-file-list-3-line",
  category: "Ijara va ko‘chmas mulk",
  desc: "Ijaraga yoki saqlashga berilayotgan mebellar, uskunalar va mulklar inventar ro‘yxati",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 540-moddasi",
  fields: [
    { key: "city", label: "Shahar", type: "text", required: true },
    { key: "date", label: "Sana", type: "date", required: true },
    { key: "giver", label: "Topshiruvchi shaxs F.I.Sh.", type: "text", required: true },
    { key: "receiver", label: "Qabul qiluvchi shaxs F.I.Sh.", type: "text", required: true },
    { key: "itemsList", label: "Mulklar ro‘yxati, holati va qiymati", type: "textarea", placeholder: "1. Televizor Samsung 55' - 1 dona (yangi)\\n2. Divan - 1 dona\\n3. Muzlatgich Artel - 1 dona", required: true }
  ],
  codeBody: `(d) => ({
      title: "MOL-MULKNI QABUL QILISH-TOPSHIRISH DALOLATNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Topshiruvchi " + cleanField(d.giver, "Topshiruvchi F.I.Sh.") + " va Qabul qiluvchi " + cleanField(d.receiver, "Qabul qiluvchi F.I.Sh.") + " quyidagi mol-mulklarni topshirish va qabul qilish yuzasidan mazkur dalolatnomani tuzdilar:",
      sections: [
        {
          title: "1. TOPSHIRILGAN MOL-MULKLAR RO‘YXATI",
          paragraphs: [
            cleanField(d.itemsList, "Topshirilgan jihozlar va moddiy boyliklar to‘liq ro‘yxat asosida ko‘zdan kechirildi."),
            "Barcha buyumlar soz, foydalanishga yaroqli holatda ekanligi va hech qanday shikastlanish belgilari yo‘qligi tasdiqlanadi."
          ]
        }
      ],
      signatures: [
        { role: "TOPSHIRUVCHI", name: cleanField(d.giver, "F.I.Sh.") },
        { role: "QABUL QILUVCHI", name: cleanField(d.receiver, "F.I.Sh.") }
      ],
      disclaimer: "Ushbu hujjat shartnoma majburiyatlarini tasdiqlash uchun xizmat qiladi."
    })`
});

console.log('Templates Part 1 ready.');
