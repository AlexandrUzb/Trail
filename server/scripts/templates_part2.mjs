// Part 2: Category 2 - Mehnat hujjatlari (Templates 11-20)

export const templatesPart2 = [];

// 11. Mehnat shartnomasi (Yangi Mehnat kodeksi)
templatesPart2.push({
  id: 11,
  name: "Mehnat shartnomasi",
  icon: "ri-briefcase-line",
  category: "Mehnat hujjatlari",
  desc: "O‘zbekiston Respublikasi yangi Mehnat kodeksi talablariga mos namunaviy yakka tartibdagi mehnat shartnomasi",
  legalBasis: "O‘zbekiston Respublikasi Mehnat kodeksi 72–84-moddalari",
  disclaimer: "Mehnat shartnomasi yagona milliy mehnat tizimida (my.mehnat.uz) ro‘yxatga olinishi qonunan shart.",
  fields: [
    { key: "city", label: "Shahar/Tuman", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "date", label: "Tuzilgan sana", type: "date", required: true },
    { key: "employerName", label: "Ish beruvchi tashkilot nomi", type: "text", placeholder: "«Kelajak Texnologiyalari» MChJ", required: true },
    { key: "directorName", label: "Rahbar F.I.Sh.", type: "text", placeholder: "Berdiyev Shavkat Rustamovich", required: true },
    { key: "employeeName", label: "Xodim F.I.Sh.", type: "text", placeholder: "Ibragimov Jasur Mansurovich", required: true },
    { key: "employeePassport", label: "Xodim pasport/ID ma'lumotlari", type: "text", placeholder: "AB 9876543, IIB tomonidan berilgan", required: true },
    { key: "position", label: "Lavozim yoki kasb nomi", type: "text", placeholder: "Yetakchi dasturchi", required: true },
    { key: "workplace", label: "Ish joyi (bo‘lim / filial)", type: "text", placeholder: "Axborot texnologiyalari departamenti" },
    { key: "salary", label: "Oylik lavozim maoshi (so‘m)", type: "number", placeholder: "8000000", required: true },
    { key: "probation", label: "Dastlabki sinov muddati", type: "text", placeholder: "Sinov muddati belgilanmaydi (yoki 3 oy)" },
    { key: "workHours", label: "Ish vaqti rejimi", type: "text", placeholder: "Haftada 5 kun, 40 soat (09:00 dan 18:00 gacha)" }
  ],
  codeBody: `(d) => ({
      title: "MEHNAT SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan " + cleanField(d.employerName, "Ish beruvchi korxona") + " (keyingi o‘rinlarda «Ish beruvchi»), nomidan " + cleanField(d.directorName, "Rahbar F.I.Sh.") + " ustav asosida harakat qiluvchi, va ikkinchi tomondan fuqaro " + cleanField(d.employeeName, "Xodim F.I.Sh.") + ", pasport/ID: " + cleanField(d.employeePassport, "Pasport ma'lumotlari") + " (keyingi o‘rinlarda «Xodim»), O‘zbekiston Respublikasi Mehnat kodeksining 72-moddasiga asosan mazkur shartnomani quyidagilar haqida tuzdilar:",
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI",
          paragraphs: [
            "1.1. Xodim " + cleanField(d.workplace, "asosiy ish joyi") + "da " + cleanField(d.position, "Lavozim") + " lavozimiga ishga qabul qilinadi.",
            "1.2. Ish boshlanish sanasi: shartnoma imzolangan paytdan boshlanadi.",
            "1.3. Sinov muddati: " + cleanField(d.probation, "Sinov muddati belgilanmaydi.")
          ]
        },
        {
          title: "2. ISH VAQTI VA MEHNATGA HAQ TO‘LASH",
          paragraphs: [
            "2.1. Ish vaqti: " + cleanField(d.workHours, "5 kunlik ish haftasi, haftalik 40 soat.") + ".",
            "2.2. Xodimga har oyda " + formatMoney(d.salary) + " miqdorida lavozim maoshi belgilanadi.",
            "2.3. Ish haqi oyiga kamida ikki marta (avans va oylik hisob-kitob) to‘lanadi."
          ]
        },
        {
          title: "3. TARAFLARNING ASOSIY HUQUQ VA MAJBURIYATLARI",
          paragraphs: [
            "3.1. Xodim o‘z mehnat vazifalarini vijdonan bajarishi, ichki mehnat tartib-qoidalariga va mehnat intizomiga qat'iy rioya qilishi, mehnatni muhofaza qilish talablarini bajarishi shart.",
            "3.2. Ish beruvchi Xodimga xavfsiz mehnat sharoitlarini yaratib berish, zarur texnika bilan ta'minlash va qonunchilikda belgilangan barcha ijtimoiy kafolatlarni taqdim etish majburiyatini oladi."
          ]
        },
        {
          title: "4. MEHNAT TA’TILI VA SHARTNOMANI BEKOR QILISH",
          paragraphs: [
            "4.1. Xodimga har yili kamida 21 kalendar kunidan iborat haq to‘lanadigan yillik asosiy mehnat ta'tili beriladi.",
            "4.2. Shartnoma O‘zbekiston Respublikasi Mehnat kodeksida nazarda tutilgan asoslar va tartibda bekor qilinishi mumkin."
          ]
        }
      ],
      signatures: [
        { role: "ISH BERUVCHI", name: cleanField(d.directorName, "Rahbar F.I.Sh."), details: ["Tashkilot: " + cleanField(d.employerName, "Kompaniya nomi")] },
        { role: "XODIM", name: cleanField(d.employeeName, "Xodim F.I.Sh."), details: ["Pasport/ID: " + cleanField(d.employeePassport, "__________________________")] }
      ],
      disclaimer: "Mehnat shartnomasi qog‘ozda 2 nusxada imzolanishi va Yagona milliy mehnat tizimiga (my.mehnat.uz) kiritilishi shart."
    })`
});

// 12. Ishga qabul qilish to‘g‘risida ariza
templatesPart2.push({
  id: 12,
  name: "Ishga qabul qilish to‘g‘risida ariza",
  icon: "ri-user-add-line",
  category: "Mehnat hujjatlari",
  desc: "Tashkilot rahbariga ma'lum lavozimga ishga kirish to‘g‘risidagi rasmiy ariza",
  legalBasis: "O‘zbekiston Respublikasi Mehnat kodeksi 72, 80-moddalari",
  fields: [
    { key: "companyName", label: "Tashkilot nomi", type: "text", placeholder: "«O‘zbekiston Temir Yo‘llari» AJ", required: true },
    { key: "directorName", label: "Rahbar lavozimi va F.I.Sh.", type: "text", placeholder: "Boshqaruv raisi Xoliqov N.S.ga", required: true },
    { key: "applicantName", label: "Arizachi F.I.Sh.", type: "text", placeholder: "Karimov Sherzod Alisherovichdan", required: true },
    { key: "applicantAddress", label: "Arizachi manzili va telefoni", type: "text", placeholder: "Toshkent sh., Yunusobod t., tel: +998 90 123 45 67" },
    { key: "position", label: "Qaysi lavozimga", type: "text", placeholder: "Moliya bo‘limi bosh mutaxassisi", required: true },
    { key: "startDate", label: "Ishga kirish sanasi", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "ARIZA",
      subtitle: "Ishga qabul qilish to‘g‘risida",
      headerRight: [
        cleanField(d.companyName, "Tashkilot rahbariyatiga"),
        cleanField(d.directorName, "Rahbar F.I.Sh.") + "ga",
        cleanField(d.applicantName, "Arizachi F.I.Sh.") + "dan",
        cleanField(d.applicantAddress, "Manzil va telefon")
      ],
      date: formatUzbekDate(),
      sections: [
        {
          title: "ARIZA MATNI",
          paragraphs: [
            "Sizdan meni " + formatUzbekDate(d.startDate) + " kunidan boshlab korxonangizga " + cleanField(d.position, "belgilangan lavozim") + " lavozimiga asosiy ish joyi sifatida ishga qabul qilishingizni so‘rayman.",
            "Korxonaning ichki mehnat tartibi, mehnat intizomi va mehnatni muhofaza qilish qoidalari bilan tanishdim va ularga qat'iy rioya qilish majburiyatini olaman."
          ]
        },
        {
          title: "ILOVA QILINAYOTGAN HUJJATLAR",
          paragraphs: [
            "1. Pasport (ID-karta) nusxasi.",
            "2. Oliy ma'lumot to‘g‘risidagi diplom nusxasi.",
            "3. Obyektivka (Rezyume)."
          ]
        }
      ],
      signatures: [
        { role: "ARIZA BERUVCHI", name: cleanField(d.applicantName, "Arizachi F.I.Sh.") }
      ],
      disclaimer: "Mehnat kodeksining 80-moddasiga ko‘ra, ish beruvchi qonunda nazarda tutilmagan qo‘shimcha hujjatlarni talab qilishga haqli emas."
    })`
});

// 13. O‘z xohishiga ko‘ra ishdan bo‘shash arizasi (MK 160-modda)
templatesPart2.push({
  id: 13,
  name: "O‘z xohishiga ko‘ra ishdan bo‘shash arizasi",
  icon: "ri-logout-box-line",
  category: "Mehnat hujjatlari",
  desc: "Xodim tashabbusi bilan mehnat shartnomasini bekor qilish to‘g‘risidagi ariza (Yangi MK 160-modda)",
  legalBasis: "O‘zbekiston Respublikasi Mehnat kodeksi 160-moddasi",
  fields: [
    { key: "companyName", label: "Tashkilot nomi", type: "text", required: true },
    { key: "directorName", label: "Rahbar F.I.Sh.", type: "text", required: true },
    { key: "employeeName", label: "Xodim F.I.Sh.", type: "text", required: true },
    { key: "position", label: "Xodim lavozimi", type: "text", required: true },
    { key: "lastDate", label: "Oxirgi ish kuni (sana)", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "ARIZA",
      subtitle: "Xodim tashabbusi bilan mehnat shartnomasini bekor qilish to‘g‘risida",
      headerRight: [
        cleanField(d.companyName, "Tashkilot"),
        cleanField(d.directorName, "Rahbar F.I.Sh.") + "ga",
        cleanField(d.position, "Lavozim") + ": " + cleanField(d.employeeName, "Xodim F.I.Sh.") + "dan"
      ],
      date: formatUzbekDate(),
      sections: [
        {
          title: "ARIZA MAZMUNI",
          paragraphs: [
            "O‘zbekiston Respublikasi Mehnat kodeksining 160-moddasiga binoan, men bilan tuzilgan mehnat shartnomasini o‘z tashabbusim (xohishim)ga ko‘ra " + formatUzbekDate(d.lastDate) + " kunidan boshlab bekor qilishingizni so‘rayman.",
            "Oxirgi ish kunimda qonunchilikda belgilangan tartibda men bilan to‘liq hisob-kitob qilinishini va mehnat daftarchamni topshirishingizni so‘rayman."
          ]
        }
      ],
      signatures: [
        { role: "XODIM", name: cleanField(d.employeeName, "Xodim F.I.Sh.") }
      ],
      disclaimer: "Mehnat kodeksining 160-moddasiga binoan, xodim ish beruvchini 14 kalendar kun oldin yozma ogohlantirishi shart. Tomonlar kelishuviga ko‘ra bu muddat qisqartirilishi mumkin."
    })`
});

// 14. Tomonlar kelishuviga ko‘ra ishdan bo‘shash arizasi (MK 157-modda)
templatesPart2.push({
  id: 14,
  name: "Tomonlar kelishuviga ko‘ra ishdan bo‘shash arizasi",
  icon: "ri-shake-hands-line",
  category: "Mehnat hujjatlari",
  desc: "Mehnat shartnomasini taraflar kelishuvi asosida istalgan vaqtda bekor qilish",
  legalBasis: "O‘zbekiston Respublikasi Mehnat kodeksi 157-moddasi",
  fields: [
    { key: "companyName", label: "Tashkilot nomi", type: "text", required: true },
    { key: "directorName", label: "Rahbar F.I.Sh.", type: "text", required: true },
    { key: "employeeName", label: "Xodim F.I.Sh.", type: "text", required: true },
    { key: "position", label: "Lavozim", type: "text", required: true },
    { key: "agreedDate", label: "Kelishilgan bo‘shash sanasi", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "ARIZA",
      subtitle: "Mehnat shartnomasini taraflar kelishuviga ko‘ra bekor qilish to‘g‘risida",
      headerRight: [
        cleanField(d.companyName, "Tashkilot"),
        cleanField(d.directorName, "Rahbar F.I.Sh.") + "ga",
        cleanField(d.position, "Lavozim") + ": " + cleanField(d.employeeName, "Xodim F.I.Sh.") + "dan"
      ],
      date: formatUzbekDate(),
      sections: [
        {
          title: "ARIZA MAZMUNI",
          paragraphs: [
            "O‘zbekiston Respublikasi Mehnat kodeksining 157-moddasiga asosan, men bilan tuzilgan mehnat shartnomasini taraflar kelishuviga binoan " + formatUzbekDate(d.agreedDate) + " kunidan bekor qilishingizga rozilik bildiraman.",
            "Ko‘rsatilgan sanada yakuniy ish haqi va foydalanilmagan ta'tillar uchun kompensatsiya to‘lab berilishini so‘rayman."
          ]
        }
      ],
      signatures: [
        { role: "XODIM", name: cleanField(d.employeeName, "F.I.Sh.") }
      ],
      disclaimer: "Taraflar kelishuviga ko‘ra shartnoma 14 kunlik muddatni kutmasdan, istalgan kelishilgan sanada bekor qilinishi mumkin."
    })`
});

// 15. Mehnat shartnomasi muddati tugashi munosabati bilan ariza/bildirishnoma
templatesPart2.push({
  id: 15,
  name: "Mehnat shartnomasi muddati tugashi munosabati bilan ariza",
  icon: "ri-hourglass-2-line",
  category: "Mehnat hujjatlari",
  desc: "Muddatli mehnat shartnomasi muddati yakunlanishi munosabati bilan hisob-kitob qilish",
  legalBasis: "O‘zbekiston Respublikasi Mehnat kodeksi 158-moddasi",
  fields: [
    { key: "companyName", label: "Tashkilot nomi", type: "text", required: true },
    { key: "directorName", label: "Rahbar F.I.Sh.", type: "text", required: true },
    { key: "employeeName", label: "Xodim F.I.Sh.", type: "text", required: true },
    { key: "contractDate", label: "Shartnoma tuzilgan sana", type: "date", required: true },
    { key: "expireDate", label: "Shartnoma muddati tugash sanasi", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "BILDIRISHNOMA (ARIZA)",
      subtitle: "Muddatli mehnat shartnomasi yakunlanishi munosabati bilan",
      headerRight: [
        cleanField(d.companyName, "Tashkilot"),
        cleanField(d.directorName, "Rahbar F.I.Sh.") + "ga",
        cleanField(d.employeeName, "Xodim F.I.Sh.") + "dan"
      ],
      date: formatUzbekDate(),
      sections: [
        {
          title: "BILDIRISHNOMA MAZMUNI",
          paragraphs: [
            "Men bilan " + formatUzbekDate(d.contractDate) + "da tuzilgan muddatli mehnat shartnomasi muddati " + formatUzbekDate(d.expireDate) + " sanasida yakunlanadi.",
            "O‘zbekiston Respublikasi Mehnat kodeksining 158-moddasiga muvofiq, shartnoma muddati tugashi munosabati bilan men bilan to‘liq hisob-kitobni amalga oshirishingizni va tegishli buyruq rasmiylashtirishingizni ma'lum qilaman."
          ]
        }
      ],
      signatures: [
        { role: "XODIM", name: cleanField(d.employeeName, "F.I.Sh.") }
      ],
      disclaimer: "Muddatli mehnat shartnomasi muddati tugagach, agar taraflarning hech biri bekor qilishni talab qilmasa, u noma'lum muddatga uzaytirilgan hisoblanadi."
    })`
});

// 16. Mehnat ta’tiliga chiqish arizasi (MK 216-modda)
templatesPart2.push({
  id: 16,
  name: "Mehnat ta’tiliga chiqish arizasi",
  icon: "ri-sun-line",
  category: "Mehnat hujjatlari",
  desc: "Yillik haq to‘lanadigan asosiy va qo‘shimcha mehnat ta'tili olish arizasi",
  legalBasis: "O‘zbekiston Respublikasi Mehnat kodeksi 216–221-moddalari",
  fields: [
    { key: "directorName", label: "Rahbar lavozimi va F.I.Sh.", type: "text", required: true },
    { key: "employeeName", label: "Xodim F.I.Sh.", type: "text", required: true },
    { key: "position", label: "Lavozimi", type: "text", required: true },
    { key: "days", label: "Ta'til kunlari soni", type: "number", placeholder: "21", required: true },
    { key: "startDate", label: "Ta'til boshlanish sanasi", type: "date", required: true },
    { key: "workPeriod", label: "Qaysi ish yili uchun", type: "text", placeholder: "2025–2026 ish yili uchun" }
  ],
  codeBody: `(d) => ({
      title: "ARIZA",
      subtitle: "Yillik asosiy mehnat ta'tili berish to‘g‘risida",
      headerRight: [
        cleanField(d.directorName, "Rahbar F.I.Sh.") + "ga",
        cleanField(d.position, "Lavozim") + ": " + cleanField(d.employeeName, "Xodim F.I.Sh.") + "dan"
      ],
      date: formatUzbekDate(),
      sections: [
        {
          title: "ARIZA MAZMUNI",
          paragraphs: [
            "O‘zbekiston Respublikasi Mehnat kodeksining 216 va 217-moddalariga muvofiq, menga " + cleanField(d.workPeriod, "joriy ish yili") + " uchun " + formatUzbekDate(d.startDate) + " kunidan boshlab " + cleanField(d.days, "21") + " kalendar kunga haq to‘lanadigan yillik mehnat ta'tili berishingizni so‘rayman.",
            "Ta'til pullari qonunchilikda belgilangan muddatda (ta'til boshlanishidan kamida 3 kun oldin) to‘lab berilishini iltimos qilaman."
          ]
        }
      ],
      signatures: [
        { role: "XODIM", name: cleanField(d.employeeName, "F.I.Sh.") }
      ],
      disclaimer: "Mehnat kodeksining 217-moddasiga ko‘ra, yillik asosiy mehnat ta'tilining eng kam davomiyligi 21 kalendar kunidan kam bo‘lishi mumkin emas."
    })`
});

// 17. Ish haqi bo‘yicha ma’lumotnoma
templatesPart2.push({
  id: 17,
  name: "Ish haqi bo‘yicha ma’lumotnoma",
  icon: "ri-money-dollar-circle-line",
  category: "Mehnat hujjatlari",
  desc: "Bank krediti, viza yoki ijtimoiy to‘lovlar uchun oylik daromad to‘g‘risida rasmiy ma'lumotnoma",
  legalBasis: "O‘zbekiston Respublikasi Mehnat kodeksi 170-moddasi",
  fields: [
    { key: "companyName", label: "Tashkilot nomi", type: "text", required: true },
    { key: "employeeName", label: "Xodim F.I.Sh.", type: "text", required: true },
    { key: "position", label: "Lavozimi", type: "text", required: true },
    { key: "averageSalary", label: "O‘rtacha oylik ish haqi (so‘m)", type: "number", required: true },
    { key: "periodMonths", label: "Qaysi davr uchun (oylar)", type: "text", placeholder: "Oxirgi 6 oy (2025-yil sentyabr - 2026-yil fevral)" },
    { key: "purpose", label: "Taqdim etiladigan joy", type: "text", placeholder: "Bankka taqdim etish uchun" }
  ],
  codeBody: `(d) => ({
      title: "MA’LUMOTNOMA",
      subtitle: "Xodimning egallab turgan lavozimi va ish haqi to‘g‘risida",
      headerRight: [
        "Chiqish №: ________",
        "Sana: " + formatUzbekDate()
      ],
      sections: [
        {
          title: "MA’LUMOTNOMA MAZMUNI",
          paragraphs: [
            "Ushbu ma'lumotnoma haqiqatan ham " + cleanField(d.employeeName, "Xodim F.I.Sh.") + "ga berildiki, u haqiqatan ham " + cleanField(d.companyName, "Korxona nomi") + "da " + cleanField(d.position, "Lavozim") + " lavozimida ishlab kelmoqda.",
            "Xodimning " + cleanField(d.periodMonths, "oxirgi 6 oylik") + " davrdagi o‘rtacha oylik daromadi " + formatMoney(d.averageSalary) + "ni tashkil qiladi.",
            "Ma'lumotnoma " + cleanField(d.purpose, "talab qilingan joyga taqdim etish") + " uchun berildi."
          ]
        }
      ],
      signatures: [
        { role: "KORXONA RAHBARI", name: "__________________________ (Imzo, M.O‘.)" },
        { role: "BOSH BUXGALTER", name: "__________________________ (Imzo)" }
      ],
      disclaimer: "Mehnat kodeksining 170-moddasiga ko‘ra, ish beruvchi xodimning talabiga binoan ish haqi to‘g‘risidagi ma'lumotnomani 3 kun muddatda bepul berishi shart."
    })`
});

// 18. Mehnat ta’tilini ko‘chirish to‘g‘risida ariza
templatesPart2.push({
  id: 18,
  name: "Mehnat ta’tilini ko‘chirish to‘g‘risida ariza",
  icon: "ri-calendar-event-line",
  category: "Mehnat hujjatlari",
  desc: "Ta'til jadvalidagi sanani boshqa muddatga ko‘chirish to‘g‘risida xodim arizasi",
  legalBasis: "O‘zbekiston Respublikasi Mehnat kodeksi 229, 230-moddalari",
  fields: [
    { key: "directorName", label: "Rahbar F.I.Sh.", type: "text", required: true },
    { key: "employeeName", label: "Xodim F.I.Sh.", type: "text", required: true },
    { key: "scheduledDate", label: "Jadval bo‘yicha rejalashtirilgan sana", type: "date", required: true },
    { key: "newDate", label: "Ko‘chiriladigan yangi sana", type: "date", required: true },
    { key: "reason", label: "Ko‘chirish sababi", type: "textarea", placeholder: "Oilaviy sharoit munosabati bilan...", required: true }
  ],
  codeBody: `(d) => ({
      title: "ARIZA",
      subtitle: "Mehnat ta'tilini boshqa muddatga ko‘chirish to‘g‘risida",
      headerRight: [
        cleanField(d.directorName, "Rahbar F.I.Sh.") + "ga",
        cleanField(d.employeeName, "Xodim F.I.Sh.") + "dan"
      ],
      date: formatUzbekDate(),
      sections: [
        {
          title: "ARIZA MAZMUNI",
          paragraphs: [
            "Korxona mehnat ta'tillari jadvaliga ko‘ra, mening navbatdagi ta'tilim " + formatUzbekDate(d.scheduledDate) + " sanasiga rejalashtirilgan edi.",
            "Quyidagi sababga ko‘ra ta'tilimni " + formatUzbekDate(d.newDate) + " sanasiga ko‘chirishingizni so‘rayman:",
            "Sabab: " + cleanField(d.reason, "Hurmatli sabablar munosabati bilan.")
          ]
        }
      ],
      signatures: [
        { role: "XODIM", name: cleanField(d.employeeName, "F.I.Sh.") }
      ],
      disclaimer: "Mehnat kodeksining 229-moddasiga ko‘ra, ta'tilni ko‘chirish xodim va ish beruvchining o‘zaro kelishuviga asosan rasmiylashtiriladi."
    })`
});

// 19. Ishga tiklash bo‘yicha da’vo arizasi
templatesPart2.push({
  id: 19,
  name: "Ishga tiklash bo‘yicha da’vo arizasi",
  icon: "ri-scales-3-line",
  category: "Mehnat hujjatlari",
  desc: "Noqonuniy bo‘shatilgan xodimni avvalgi ishiga tiklash va majburiy progul uchun haq undirish da'vosi",
  legalBasis: "O‘zbekiston Respublikasi Mehnat kodeksi 541–544-moddalari",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha Shayxontohur tumanlararo sudiga", required: true },
    { key: "plaintiff", label: "Da'vogar (Xodim) F.I.Sh., manzili, tel", type: "text", required: true },
    { key: "defendant", label: "Javobgar (Korxona) nomi, manzili, STIR", type: "text", required: true },
    { key: "orderNumber", label: "Bo‘shatish buyrug‘i raqami va sanasi", type: "text", placeholder: "2026-yil 10-yanvardagi 15-k sonli buyruq", required: true },
    { key: "salaryAmount", label: "Oylik o‘rtacha ish haqi (so‘m)", type: "number", required: true }
  ],
  codeBody: `(d) => ({
      title: "DA’VO ARIZASI",
      subtitle: "Ishga tiklash, majburiy progul va ma'naviy zararni undirish to‘g‘risida",
      headerRight: [
        cleanField(d.courtName, "Fuqarolik ishlari bo‘yicha sudga"),
        "Da’vogar: " + cleanField(d.plaintiff, "Xodim F.I.Sh., manzili"),
        "Javobgar: " + cleanField(d.defendant, "Ish beruvchi korxona")
      ],
      date: formatUzbekDate(),
      sections: [
        {
          title: "1. DA’VO ASOSLARI",
          paragraphs: [
            "Men javobgar korxonada qonuniy mehnat shartnomasi asosida ishlab kelayotgan edim. Biroq javobgarning " + cleanField(d.orderNumber, "buyrug‘i") + " bilan men bilan tuzilgan mehnat shartnomasi noqonuniy ravishda bekor qilindi.",
            "Mehnat kodeksining talablari buzilgan, bo‘shatish uchun qonuniy asoslar mavjud emas va tegishli tartibga rioya qilinmagan."
          ]
        },
        {
          title: "2. QONUNIY ASOS VA TALABLAR",
          paragraphs: [
            "O‘zbekiston Respublikasi Mehnat kodeksining 541, 542 va 543-moddalariga asosan,",
            "SUDDAN SO‘RAYMAN:",
            "1. Javobgarning men bilan mehnat shartnomasini bekor qilish haqidagi buyrug‘ini g‘ayriqonuniy deb topib, bekor qilishingizni;",
            "2. Meni avvalgi lavozimimga ishga tiklashingizni;",
            "3. Majburiy progul qilingan barcha kunlar uchun o‘rtacha oylik ish haqim hisobidan haq undirib berishingizni;",
            "4. Qonunchilikka binoan da'vogarni davlat boji to‘lashdan ozod etishingizni."
          ]
        },
        {
          title: "ILOVALAR",
          paragraphs: [
            "1. Ishga qabul qilish va bo‘shatish haqidagi buyruqlar nusxasi.",
            "2. Mehnat daftarchasidan ko‘chirma.",
            "3. Oylik maosh ma'lumotnomasi.",
            "4. Pasport nusxasi."
          ]
        }
      ],
      signatures: [
        { role: "DA’VOGAR", name: cleanField(d.plaintiff, "F.I.Sh.") }
      ],
      disclaimer: "Mehnat nizolari bo‘yicha xodimlar sudga murojaat qilishda davlat boji to‘lashdan qonun bilan ozod qilingan (Soliq kodeksi 263-modda)."
    })`
});

// 20. Ish haqi qarzdorligini undirish bo‘yicha da’vo arizasi
templatesPart2.push({
  id: 20,
  name: "Ish haqi qarzdorligini undirish bo‘yicha da’vo arizasi",
  icon: "ri-hand-coin-line",
  category: "Mehnat hujjatlari",
  desc: "Ish beruvchidan o‘z vaqtida to‘lanmagan ish haqini sud orqali undirish",
  legalBasis: "O‘zbekiston Respublikasi Mehnat kodeksi 253, 333, 543-moddalari",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", required: true },
    { key: "employee", label: "Xodim F.I.Sh., manzili, tel", type: "text", required: true },
    { key: "employer", label: "Korxona nomi, rahbari, manzili", type: "text", required: true },
    { key: "salaryDebt", label: "Ish haqi qarzdorligi summasi (so‘m)", type: "number", required: true },
    { key: "monthsCount", label: "Necha oylik qarzdorlik", type: "text", placeholder: "3 oylik (noyabr, dekabr, yanvar)" }
  ],
  codeBody: `(d) => ({
      title: "DA’VO ARIZASI",
      subtitle: "To‘lanmagan ish haqi va unga hisoblangan kompensatsiyani undirish to‘g‘risida",
      headerRight: [
        cleanField(d.courtName, "Fuqarolik ishlari bo‘yicha sudga"),
        "Da’vogar: " + cleanField(d.employee, "Xodim F.I.Sh."),
        "Javobgar: " + cleanField(d.employer, "Tashkilot"),
        "Da’vo bahosi: " + formatMoney(d.salaryDebt)
      ],
      date: formatUzbekDate(),
      sections: [
        {
          title: "1. ISH HOLATLARI",
          paragraphs: [
            "Men javobgar tashkilotda ishlab kelayotgan bo‘lsam-da, ish beruvchi tomonidan " + cleanField(d.monthsCount, "o‘tgan oylar") + " davomida oylik ish haqim to‘lanmasdan kelinmoqda. Jami qarzdorlik " + formatMoney(d.salaryDebt) + "ni tashkil etadi.",
            "Mehnat kodeksining 253-moddasiga ko‘ra, ish haqi to‘lash muddatlari qat'iy belgilanishi va buzilmasligi shart."
          ]
        },
        {
          title: "2. TALABLAR",
          paragraphs: [
            "Mehnat kodeksining 253 va 333-moddalariga asosan, javobgardan mening foydamga " + formatMoney(d.salaryDebt) + " miqdoridagi ish haqi qarzdorligini va to‘lov kechiktirilgan har bir kun uchun pul kompensatsiyasini undirib berishingizni so‘rayman."
          ]
        }
      ],
      signatures: [
        { role: "DA’VOGAR", name: cleanField(d.employee, "F.I.Sh.") }
      ],
      disclaimer: "Mehnat munosabatlaridan kelib chiqadigan da'volar bo‘yicha fuqarolar sudga murojaat qilganda davlat bojidan ozod etiladi."
    })`
});

console.log('Templates Part 2 ready.');
