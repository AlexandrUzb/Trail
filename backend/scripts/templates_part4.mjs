// Part 4: Templates 47 to 83 (Categories: Shartnomalar, Ishonchnoma, Avtomobil, Oila va fuqarolik, Tadbirkorlik)

export const templatesPart4 = [];

// =========================================================================
// CATEGORY 6: SHARTNOMALAR (Templates 47-55)
// =========================================================================

// 47. Oldi-sotdi shartnomasi
templatesPart4.push({
  id: 47,
  name: "Oldi-sotdi shartnomasi",
  icon: "ri-shopping-bag-3-line",
  category: "Shartnomalar",
  desc: "Fuqarolar yoki yuridik shaxslar o‘rtasida mol-mulk yoki tovar oldi-sotdisi bo‘yicha umumiy shartnoma",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 386–424-moddalari",
  disclaimer: "Ko‘chmas mulk va avtotransport vositalari oldi-sotdisi notarial tasdiqlanishi va davlat ro‘yxatidan o‘tkazilishi shart.",
  fields: [
    { key: "city", label: "Tuzilgan shahar/tuman", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "sellerName", label: "Sotuvchi F.I.Sh. / Nomi", type: "text", placeholder: "Rasulov Jasur Olimovich", required: true },
    { key: "sellerPassport", label: "Sotuvchi pasport/ID yoki rekvizitlari", type: "text", placeholder: "AA 1234567, 10.02.2020 da berilgan", required: true },
    { key: "buyerName", label: "Xaridor F.I.Sh. / Nomi", type: "text", placeholder: "Karimov Sherzod Alisherovich", required: true },
    { key: "buyerPassport", label: "Xaridor pasport/ID yoki rekvizitlari", type: "text", placeholder: "AB 7654321, 15.06.2021 da berilgan", required: true },
    { key: "itemDescription", label: "Oldi-sotdi predmeti (mulk/tovar tavsifi)", type: "textarea", placeholder: "Mebel to‘plami (stol, stullar, shkaf) to‘liq butlangan holda...", required: true },
    { key: "price", label: "Shartnoma bahosi (so‘m)", type: "number", placeholder: "15000000", required: true },
    { key: "paymentTerms", label: "To‘lov sharti", type: "text", placeholder: "Mulk topshirilgunga qadar to‘liq 100% to‘lanadi", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "OLDI-SOTDI SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan " + cleanField(d.sellerName, "Sotuvchi") + " (keyingi o‘rinlarda «Sotuvchi»), va ikkinchi tomondan " + cleanField(d.buyerName, "Xaridor") + " (keyingi o‘rinlarda «Xaridor»), birgalikda «Taraflar» deb yuritilib, O‘zbekiston Respublikasi Fuqarolik kodeksining 386–424-moddalariga muvofiq mazkur shartnomani quyidagilar haqida tuzdilar:",
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI",
          paragraphs: [
            "1.1. Sotuvchi o‘ziga tegishli bo‘lgan quyidagi mulkni Xaridorning mulkiga topshirish, Xaridor esa ushbu mulkni qabul qilish va haqini to‘lash majburiyatini oladi:",
            cleanField(d.itemDescription, "Mulk/tovar tavsifi, rusumi va soni."),
            "1.2. Sotuvchi ushbu mulk uchinchi shaxslarning har qanday huquqlaridan xoli ekanligini kafolatlaydi."
          ]
        },
        {
          title: "2. SHARTNOMA BAHOSI VA HISOB-KITOBLAR",
          paragraphs: [
            "2.1. Mazkur shartnoma bo‘yicha to‘lanadigan umumiy summa: " + formatMoney(d.price) + "ni tashkil etadi.",
            "2.2. To‘lov tartibi: " + cleanField(d.paymentTerms, "To‘lov shartnomani imzolash vaqtida amalga oshiriladi.")
          ]
        },
        {
          title: "3. TARAFLARNING JAVOBGARLIGI",
          paragraphs: [
            "3.1. Majburiyatlar lozim darajada bajarilmagan taqdirda taraflar O‘zbekiston Respublikasi amaldagi qonunchiligiga muvofiq moddiy javobgarlikni o‘z zimmalariga oladilar."
          ]
        }
      ],
      signatures: [
        { role: "Sotuvchi", name: cleanField(d.sellerName, "F.I.Sh.") },
        { role: "Xaridor", name: cleanField(d.buyerName, "F.I.Sh.") }
      ]
  })`
});

// 48. Xizmat ko‘rsatish shartnomasi
templatesPart4.push({
  id: 48,
  name: "Xizmat ko‘rsatish shartnomasi",
  icon: "ri-customer-service-2-line",
  category: "Shartnomalar",
  desc: "Haq evaziga professional, konsalting, maishiy yoki axborot xizmatlari ko‘rsatish shartnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 703–708-moddalari",
  disclaimer: "Bajarilgan xizmatlar yakunida ikki tomonlama topshirish-qabul qilish dalolatnomasi imzolanishi lozim.",
  fields: [
    { key: "city", label: "Shahar/tuman", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "clientName", label: "Buyurtmachi F.I.Sh. / Nomi", type: "text", placeholder: "«Kelajak Invest» MChJ", required: true },
    { key: "providerName", label: "Ijrochi F.I.Sh. / Nomi", type: "text", placeholder: "Xudoyberdiyev Doniyor Rustamovich", required: true },
    { key: "serviceScope", label: "Ko‘rsatiladigan xizmatlar tavsifi", type: "textarea", placeholder: "Buxgalteriya hisobini yuritish va soliq hisobotlarini tayyorlash xizmatlari...", required: true },
    { key: "serviceFee", label: "Xizmat haqi (so‘m)", type: "number", placeholder: "5000000", required: true },
    { key: "deadline", label: "Xizmat ko‘rsatish muddati", type: "text", placeholder: "2026-yil 31-dekabrga qadar" },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "HAQ EVAZIGA XIZMAT KO‘RSATISH SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan " + cleanField(d.clientName, "Buyurtmachi") + " (keyingi o‘rinlarda «Buyurtmachi»), va ikkinchi tomondan " + cleanField(d.providerName, "Ijrochi") + " (keyingi o‘rinlarda «Ijrochi»), O‘zbekiston Respublikasi Fuqarolik kodeksining 703–708-moddalariga muvofiq mazkur shartnomani quyidagilar haqida tuzdilar:",
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI",
          paragraphs: [
            "1.1. Ijrochi Buyurtmachining topshirig‘iga binoan quyidagi xizmatlarni o‘z vaqtida va sifatli ko‘rsatish, Buyurtmachi esa xizmatlar natijasini qabul qilish va haqini to‘lash majburiyatini oladi:",
            cleanField(d.serviceScope, "Xizmatlar hajmi va yo‘nalishi."),
            "1.2. Xizmat ko‘rsatish muddati: " + cleanField(d.deadline, "Kelishilgan muddatda.")
          ]
        },
        {
          title: "2. XIZMAT HAQI VA HISOB-KITOBLAR",
          paragraphs: [
            "2.1. Ko‘rsatilgan xizmatlar uchun umumiy to‘lov " + formatMoney(d.serviceFee) + "ni tashkil etadi.",
            "2.2. To‘lov xizmatlar qabul qilinganligi to‘g‘risidagi dalolatnoma imzolangandan so‘ng 5 bank kuni ichida to‘lanadi."
          ]
        }
      ],
      signatures: [
        { role: "Buyurtmachi", name: cleanField(d.clientName, "F.I.Sh.") },
        { role: "Ijrochi", name: cleanField(d.providerName, "F.I.Sh.") }
      ]
  })`
});

// 49. Ish bajarish/pudrat shartnomasi
templatesPart4.push({
  id: 49,
  name: "Ish bajarish/pudrat shartnomasi",
  icon: "ri-hammer-line",
  category: "Shartnomalar",
  desc: "Muayyan ishni bajarish va uning natijasini Buyurtmachiga topshirish bo‘yicha pudrat shartnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 631–655-moddalari",
  disclaimer: "Pudratchi ishni shaxsan yoki subpudrat asosida bajarish huquqiga ega, agar shartnomada boshqacha ko‘rsatilmagan bo‘lsa.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "customer", label: "Buyurtmachi F.I.Sh. / Nomi", type: "text", placeholder: "«Oltin Voha» MChJ", required: true },
    { key: "contractor", label: "Pudratchi F.I.Sh. / Nomi", type: "text", placeholder: "Umarov Saidolim Rustamovich", required: true },
    { key: "workScope", label: "Bajariladigan ishlar hajmi", type: "textarea", placeholder: "Ofis xonasini ta'mirlash, bo‘yash va elektr montaj ishlari...", required: true },
    { key: "contractPrice", label: "Ish haqi summasi (so‘m)", type: "number", placeholder: "18000000", required: true },
    { key: "completionDate", label: "Ishni yakunlash muddati", type: "date", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "PUDRAT (ISH BAJARISH) SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan " + cleanField(d.customer, "Buyurtmachi") + " va ikkinchi tomondan " + cleanField(d.contractor, "Pudratchi") + " O‘zbekiston Respublikasi Fuqarolik kodeksining 631-moddasiga asosan mazkur shartnomani tuzdilar:",
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI VA ISH MUDDATLARI",
          paragraphs: [
            "1.1. Pudratchi Buyurtmachining topshirig‘i bo‘yicha quyidagi ishlarni bajarish va uning moddiy natijasini Buyurtmachiga topshirish majburiyatini oladi:",
            cleanField(d.workScope, "Ishlar hajmi."),
            "1.2. Ishlar to‘liq yakunlanib topshirilishi lozim bo‘lgan sana: " + formatUzbekDate(d.completionDate) + "."
          ]
        },
        {
          title: "2. ISH BAHOSI VA TO‘LOV TARTIBI",
          paragraphs: [
            "2.1. Ishlarning umumiy qiymati " + formatMoney(d.contractPrice) + "ni tashkil etadi.",
            "2.2. Ishlar sifati FK 640-moddasiga muvofiq shartnoma talablariga to‘liq javob berishi lozim."
          ]
        }
      ],
      signatures: [
        { role: "Buyurtmachi", name: cleanField(d.customer, "F.I.Sh.") },
        { role: "Pudratchi", name: cleanField(d.contractor, "F.I.Sh.") }
      ]
  })`
});

// 50. Bepul foydalanish shartnomasi (Ssuda)
templatesPart4.push({
  id: 50,
  name: "Bepul foydalanish shartnomasi",
  icon: "ri-gift-line",
  category: "Shartnomalar",
  desc: "Mulkni haq to‘lamasdan vaqtincha tekin foydalanishga berish bo‘yicha ssuda shartnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 617–625-moddalari",
  disclaimer: "Foydalanuvchi mulkni ehtiyotkorlik bilan saqlashi va undan belgilangan maqsadda foydalanishi shart.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "lender", label: "Ssuda beruvchi F.I.Sh.", type: "text", placeholder: "Karimov Sherzod Alisherovich", required: true },
    { key: "borrower", label: "Ssuda oluvchi (Foydalanuvchi) F.I.Sh.", type: "text", placeholder: "Usmonov Jamshid Rustamovich", required: true },
    { key: "itemDetails", label: "Foydalanishga berilayotgan mulk tavsifi", type: "textarea", placeholder: "HP rusumli noutbuk, seriya raqami: HP123456...", required: true },
    { key: "term", label: "Foydalanish muddati", type: "text", placeholder: "6 oy muddatga (2026-yil 1-avgustgacha)" },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "MULKDAN TEKIN FOYDALANISH (SSUDA) SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan " + cleanField(d.lender, "Ssuda beruvchi") + " va ikkinchi tomondan " + cleanField(d.borrower, "Foydalanuvchi") + " Fuqarolik kodeksining 617-moddasiga asosan mazkur shartnomani tuzdilar:",
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI",
          paragraphs: [
            "1.1. Ssuda beruvchi quyidagi mol-mulkni Foydalanuvchiga tekinga vaqtincha foydalanish uchun topshirish majburiyatini oladi:",
            cleanField(d.itemDetails, "Mulk tavsifi."),
            "1.2. Foydalanish muddati: " + cleanField(d.term, "Kelishilgan muddat.") + ".",
            "1.3. Foydalanuvchi ushbu mulkni shartnoma muddati tugagach, qabul qilib olgan holatida (tabiiy eskirishni hisobga olgan holda) qaytarish majburiyatini oladi."
          ]
        }
      ],
      signatures: [
        { role: "Ssuda beruvchi", name: cleanField(d.lender, "F.I.Sh.") },
        { role: "Foydalanuvchi", name: cleanField(d.borrower, "F.I.Sh.") }
      ]
  })`
});

// 51. Qarzdorlikni qaytarish kelishuvi
templatesPart4.push({
  id: 51,
  name: "Qarzdorlikni qaytarish kelishuvi",
  icon: "ri-hand-heart-line",
  category: "Shartnomalar",
  desc: "Mavjud qarzni to‘lash shartlari, muddatlari va jadvalini o‘zaro kelishib olish bitimi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 382, 735-moddalari",
  disclaimer: "Kelishuv shartlari buzilgan taqdirda kreditor darhol sudga murojaat qilish huquqiga ega.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "creditor", label: "Kreditor F.I.Sh. / Nomi", type: "text", placeholder: "Boboyev Alisher Rustamovich", required: true },
    { key: "debtor", label: "Qarzdor F.I.Sh. / Nomi", type: "text", placeholder: "Sodiqov Dilmurod Ikromovich", required: true },
    { key: "amount", label: "Mavjud qarz summasi (so‘m)", type: "number", placeholder: "25000000", required: true },
    { key: "schedule", label: "To‘lash tartibi va bosqichlari", type: "textarea", placeholder: "Har oyning 10-sanasiga qadar 5 000 000 so‘mdan 5 oy davomida to‘lanadi...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "QARZDORLIKNI SO‘NDIRISH TO‘G‘RISIDA O‘ZARO KELISHUV",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan " + cleanField(d.creditor, "Kreditor") + " va ikkinchi tomondan " + cleanField(d.debtor, "Qarzdor") + " o‘zaro muzokaralar natijasida quyidagilar haqida kelishuvga erishdilar:",
      sections: [
        {
          title: "1. KELISHUV MAZMUNI",
          paragraphs: [
            "1.1. Qarzdor Kreditor oldida " + formatMoney(d.amount) + " miqdorida qarz majburiyati borligini tasdiqlaydi.",
            "1.2. Qarzdorlikni qoplash quyidagi grafik asosida amalga oshiriladi:",
            cleanField(d.schedule, "To‘lov jadvali."),
            "1.3. Taraflar ushbu grafik asosida to‘lovlar amalga oshirilgan taqdirda bir-birlariga nisbatan jarima va penyalar qo‘llamaslikka kelishdilar."
          ]
        }
      ],
      signatures: [
        { role: "Kreditor", name: cleanField(d.creditor, "F.I.Sh.") },
        { role: "Qarzdor", name: cleanField(d.debtor, "F.I.Sh.") }
      ]
  })`
});

// 52. Hamkorlik shartnomasi
templatesPart4.push({
  id: 52,
  name: "Hamkorlik shartnomasi",
  icon: "ri-shake-hands-line",
  category: "Shartnomalar",
  desc: "Yuridik yoki jismoniy shaxslar o‘rtasida birgalikdagi faoliyat va strategik sheriklik shartnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 962–979-moddalari (Oddiy shirkat)",
  disclaimer: "Birgalikdagi faoliyat natijasida olingan daromad va foyda shartnomada belgilangan ulushlarga muvofiq taqsimlanadi.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "party1", label: "1-taraf F.I.Sh. / Nomi", type: "text", placeholder: "«Innovatsiya Guruhi» MChJ", required: true },
    { key: "party2", label: "2-taraf F.I.Sh. / Nomi", type: "text", placeholder: "«Ziyo IT Markazi» NNT", required: true },
    { key: "goal", label: "Hamkorlik maqsadi", type: "textarea", placeholder: "Yoshlar uchun IT ta'lim dasturlarini birgalikda ishlab chiqish va joriy etish...", required: true },
    { key: "obligations1", label: "1-taraf majburiyatlari", type: "textarea", placeholder: "Dasturiy platforma va o‘quv xonalarini taqdim etish...", required: true },
    { key: "obligations2", label: "2-taraf majburiyatlari", type: "textarea", placeholder: "O‘qituvchilar tarkibini shakllantirish va metodikani yuritish...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "STRATEGIK HAMKORLIK SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan " + cleanField(d.party1, "1-taraf") + " va ikkinchi tomondan " + cleanField(d.party2, "2-taraf") + " Fuqarolik kodeksining umumiy normalariga asosan quyidagilar haqida shartnoma tuzdilar:",
      sections: [
        {
          title: "1. HAMKORLIKNING MAQSADI VA YO‘NALISHLARI",
          paragraphs: [
            "1.1. Mazkur shartnoma doirasida taraflar o‘zaro hamkorlikda quyidagi maqsadlarga erishishni rejalashtiradilar:",
            cleanField(d.goal, "Hamkorlik maqsadi.")
          ]
        },
        {
          title: "2. TARAFLARNING MAJBURIYATLARI",
          paragraphs: [
            "2.1. 1-taraf quyidagi majburiyatlarni oladi: " + cleanField(d.obligations1, "1-taraf majburiyatlari"),
            "2.2. 2-taraf quyidagi majburiyatlarni oladi: " + cleanField(d.obligations2, "2-taraf majburiyatlari")
          ]
        }
      ],
      signatures: [
        { role: "1-taraf vakili", name: cleanField(d.party1, "Mas'ul") },
        { role: "2-taraf vakili", name: cleanField(d.party2, "Mas'ul") }
      ]
  })`
});

// 53. Maxfiylik to‘g‘risidagi kelishuv (NDA)
templatesPart4.push({
  id: 53,
  name: "Maxfiylik to‘g‘risidagi kelishuv",
  icon: "ri-lock-line",
  category: "Shartnomalar",
  desc: "Tijorat sirlari va maxfiy ma'lumotlarni oshkor qilmaslik bo‘yicha ikki tomonlama bitim (NDA)",
  legalBasis: "O‘zbekiston Respublikasining «Tijorat siri to‘g‘risida»gi Qonuni",
  disclaimer: "Maxfiy ma'lumot noqonuniy oshkor qilinganda yetkazilgan to‘liq zarar qoplanishi shart.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "disclosingParty", label: "Ma'lumot beruvchi taraf", type: "text", placeholder: "«Fintech Systems» MChJ", required: true },
    { key: "receivingParty", label: "Ma'lumotni qabul qiluvchi taraf", type: "text", placeholder: "Mutaxassis Rahimov Shavkat Akromovich", required: true },
    { key: "confidentialScope", label: "Maxfiy ma'lumot doirasi", type: "textarea", placeholder: "Dasturiy ta'minot kodlari, mijozlar bazasi, moliyaviy hisobotlar va biznes rejalar...", required: true },
    { key: "penaltyAmount", label: "Oshkor qilganlik uchun jarima miqdori (so‘m)", type: "number", placeholder: "50000000" },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "TIJORAT SIRI VA MAXFIY MA’LUMOTLARNI OSHKOR QILMASLIK TO‘G‘RISIDA KELISHUV (NDA)",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan " + cleanField(d.disclosingParty, "Oshkor etuvchi taraf") + " va ikkinchi tomondan " + cleanField(d.receivingParty, "Qabul qiluvchi taraf") + " «Tijorat siri to‘g‘risida»gi Qonunga binoan mazkur kelishuvni tuzdilar:",
      sections: [
        {
          title: "1. MAXFIY MA’LUMOT TUSHUNCHASI",
          paragraphs: [
            "1.1. Ushbu kelishuv maqsadlarida quyidagi ma'lumotlar maxfiy tijorat siri deb tan olinadi: " + cleanField(d.confidentialScope, "Maxfiy ma'lumotlar ro‘yxati."),
            "1.2. Qabul qiluvchi taraf mazkur ma'lumotlarni uchinchi shaxslarga bermaslik va faqat kelishilgan maqsadlarda foydalanish majburiyatini oladi."
          ]
        },
        {
          title: "2. JAVOBGARLIK",
          paragraphs: [
            "2.1. Maxfiylik talablari buzilgan taqdirda, aybdor taraf yetkazilgan zararni to‘liq qoplaydi " + (d.penaltyAmount ? "va " + formatMoney(d.penaltyAmount) + " miqdorida jarima to‘laydi." : ".")
          ]
        }
      ],
      signatures: [
        { role: "Oshkor etuvchi taraf", name: cleanField(d.disclosingParty, "Vakil") },
        { role: "Qabul qiluvchi taraf", name: cleanField(d.receivingParty, "Vakil") }
      ]
  })`
});

// 54. Shartnomani bekor qilish to‘g‘risidagi kelishuv
templatesPart4.push({
  id: 54,
  name: "Shartnomani bekor qilish to‘g‘risidagi kelishuv",
  icon: "ri-close-circle-line",
  category: "Shartnomalar",
  desc: "Mavjud shartnomani ikki tarafning o‘zaro roziligi bilan bekor qilish to‘g‘risida rasmiy kelishuv",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 382-moddasi 1-qismi",
  disclaimer: "Shartnoma qanday shaklda tuzilgan bo‘lsa, uni bekor qilish kelishuvi ham xuddi shunday shaklda tuziladi.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "party1", label: "1-taraf nomi / F.I.Sh.", type: "text", placeholder: "«Universal Savdo» MChJ", required: true },
    { key: "party2", label: "2-taraf nomi / F.I.Sh.", type: "text", placeholder: "«Mega Qurilish» MChJ", required: true },
    { key: "originalContract", label: "Bekor qilinayotgan shartnoma sanasi va raqami", type: "text", placeholder: "2025-yil 10-yanvardagi 12-sonli ijara shartnomasi", required: true },
    { key: "settlementDetails", label: "O‘zaro hisob-kitoblar holati", type: "textarea", placeholder: "Ushbu kelishuv imzolangan vaqtda taraflar o‘rtasida moliyaviy va moddiy da'volar mavjud emas...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "SHARTNOMANI BEKOR QILISH TO‘G‘RISIDA KELISHUV",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan " + cleanField(d.party1, "1-taraf") + " va ikkinchi tomondan " + cleanField(d.party2, "2-taraf") + " Fuqarolik kodeksining 382-moddasiga asosan quyidagilar haqida kelishuv tuzdilar:",
      sections: [
        {
          title: "1. SHARTNOMANI BEKOR QILISH",
          paragraphs: [
            "1.1. Taraflar o‘zaro kelishuvga muvofiq " + cleanField(d.originalContract, "Asosiy shartnoma") + "ni mazkur kelishuv imzolangan sanadan boshlab bekor qiladilar.",
            "1.2. Asosiy shartnoma bo‘yicha taraflarning barcha o‘zaro majburiyatlari bekor qilingan deb hisoblanadi."
          ]
        },
        {
          title: "2. HISOB-KITOBLAR VA DA’VOLAR",
          paragraphs: [
            cleanField(d.settlementDetails, "Taraflar o‘rtasida o‘zaro moliyaviy va mulkiy da'volar yo‘q.")
          ]
        }
      ],
      signatures: [
        { role: "1-taraf", name: cleanField(d.party1, "Vakil") },
        { role: "2-taraf", name: cleanField(d.party2, "Vakil") }
      ]
  })`
});

// 55. Shartnomaga qo‘shimcha kelishuv
templatesPart4.push({
  id: 55,
  name: "Shartnomaga qo‘shimcha kelishuv",
  icon: "ri-attachment-line",
  category: "Shartnomalar",
  desc: "Amaldagi shartnoma bandlariga o‘zgartirish yoki qo‘shimchalar kiritish bo‘yicha kelishuv",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 382, 384-moddalari",
  disclaimer: "Qo‘shimcha kelishuv asosiy shartnomaning ajralmas qismi hisoblanadi.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "party1", label: "1-taraf nomi / F.I.Sh.", type: "text", placeholder: "«Taraqqiyot» MChJ", required: true },
    { key: "party2", label: "2-taraf nomi / F.I.Sh.", type: "text", placeholder: "«Yuksalish» MChJ", required: true },
    { key: "baseContract", label: "Asosiy shartnoma sanasi va raqami", type: "text", placeholder: "2025-yil 1-fevraldagi 05-sonli yetkazib berish shartnomasi", required: true },
    { key: "amendments", label: "Kiritilayotgan o‘zgartirishlar", type: "textarea", placeholder: "Shartnomaning 2.1-bandi quyidagi tahrirda bayon etilsin: «Xizmat haqi oylik 10 000 000 so‘mni tashkil etadi»...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "SHARTNOMAGA QO‘SHIMCHA KELISHUV",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan " + cleanField(d.party1, "1-taraf") + " va ikkinchi tomondan " + cleanField(d.party2, "2-taraf") + " " + cleanField(d.baseContract, "Asosiy shartnoma") + "ga quyidagi o‘zgartirish va qo‘shimchalarni kiritishga kelishdilar:",
      sections: [
        {
          title: "1. O‘ZGARTIRISHLAR MAZMUNI",
          paragraphs: [
            cleanField(d.amendments, "Kiritilayotgan o‘zgartirishlar to‘liq matni."),
            "Asosiy shartnomaning ushbu kelishuvda nazarda tutilmagan qolgan barcha shartlari o‘z kuchida qoladi."
          ]
        }
      ],
      signatures: [
        { role: "1-taraf", name: cleanField(d.party1, "Vakil") },
        { role: "2-taraf", name: cleanField(d.party2, "Vakil") }
      ]
  })`
});


// =========================================================================
// CATEGORY 7: ISHONCHNOMA VA VAKOLAT (Templates 56-61)
// =========================================================================

// 56. Umumiy ishonchnoma
templatesPart4.push({
  id: 56,
  name: "Umumiy ishonchnoma",
  icon: "ri-shield-user-line",
  category: "Ishonchnoma va vakolat",
  desc: "Vakilga shaxs nomidan barcha tashkilotlar va idoralarda ishlarni yuritish vakolatini beruvchi ishonchnoma",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 134–144-moddalari",
  disclaimer: "Ko‘chmas mulkni tasarruf etish va moddiy bitimlar uchun beriladigan ishonchnomalar notarial tasdiqlanishi shart.",
  fields: [
    { key: "city", label: "Berilgan shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "principalName", label: "Ishonch bildiruvchi F.I.Sh.", type: "text", placeholder: "Aliyev Rustam Akromovich", required: true },
    { key: "principalPassport", label: "Ishonch bildiruvchi pasport/ID", type: "text", placeholder: "AA 1234567", required: true },
    { key: "principalAddress", label: "Doimiy manzili", type: "text", placeholder: "Toshkent sh., Chilonzor tumani, 10-uy", required: true },
    { key: "agentName", label: "Ishonchli vakil F.I.Sh.", type: "text", placeholder: "Valiyev Anvar Karimovich", required: true },
    { key: "agentPassport", label: "Ishonchli vakil pasport/ID", type: "text", placeholder: "AB 9876543", required: true },
    { key: "powers", label: "Berilayotgan vakolatlar doirasi", type: "textarea", placeholder: "Mening nomimdan barcha davlat va nodavlat idoralarida arizalar yozish, ma'lumotlar so‘rash, shartnomalar imzolash...", required: true },
    { key: "validityPeriod", label: "Amal qilish muddati", type: "text", placeholder: "3 (uch) yil muddatga", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "ISHONCHNOMA",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Men — " + cleanField(d.principalName, "Ishonch bildiruvchi F.I.Sh.") + " (pasport/ID: " + cleanField(d.principalPassport, "Pasport") + ", yashash manzili: " + cleanField(d.principalAddress, "Manzil") + "), ushbu ishonchnoma orqali fuqaro " + cleanField(d.agentName, "Vakil F.I.Sh.") + " (pasport/ID: " + cleanField(d.agentPassport, "Pasport") + ")ga quyidagi vakolatlarni beraman:",
      sections: [
        {
          title: "1. VAKOLATLAR DOIRASI",
          paragraphs: [
            cleanField(d.powers, "Vakolatlar tavsifi."),
            "Ushbu harakatlarni bajarish uchun mening nomimdan arizalar, talabnomalar berish, hujjatlarga imzo chekish va qonuniy huquqlarimni himoya qilish huquqi beriladi."
          ]
        },
        {
          title: "2. MUDDATI",
          paragraphs: [
            "Ishonchnoma " + cleanField(d.validityPeriod, "3 yil muddatga") + " berildi (FK 139-moddasi). Boshqa shaxsga o‘tkazish (sub-delegatsiya) huquqisiz."
          ]
        }
      ],
      signatures: [
        { role: "Ishonch bildiruvchi", name: cleanField(d.principalName, "F.I.Sh.") }
      ]
  })`
});

// 57. Avtomobilni boshqarish bo‘yicha ishonchnoma
templatesPart4.push({
  id: 57,
  name: "Avtomobilni boshqarish bo‘yicha ishonchnoma",
  icon: "ri-car-line",
  category: "Ishonchnoma va vakolat",
  desc: "Avtotransport vositasini boshqarish va texnik ko‘rikdan o‘tkazish vakolatini berish hujjati",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 134-moddasi, Yo‘l harakati qoidalari",
  disclaimer: "Avtomobilni boshqarish ishonchnomasi notarial idorada rasmiylashtirilishi shart (agar sug‘urta polisasida haydovchi kiritilmagan bo‘lsa).",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "owner", label: "Avtomobil egasi F.I.Sh.", type: "text", placeholder: "Qodirov Baxtiyor Alisherovich", required: true },
    { key: "ownerPassport", label: "Egasi pasport/ID", type: "text", placeholder: "AA 3322110", required: true },
    { key: "driver", label: "Haydovchi (Vakil) F.I.Sh.", type: "text", placeholder: "Qodirov Sardor Baxtiyor o‘g‘li", required: true },
    { key: "driverPassport", label: "Haydovchi pasport/ID", type: "text", placeholder: "AB 5566778", required: true },
    { key: "carModel", label: "Avtomobil rusumi va davlat raqami", type: "text", placeholder: "Chevrolet Cobalt, davlat raqami 01 A 777 BA", required: true },
    { key: "carTechPass", label: "Texnik pasport seriyasi va raqami", type: "text", placeholder: "AAF 1234567, IIV tomonidan berilgan", required: true },
    { key: "term", label: "Amal qilish muddati", type: "text", placeholder: "1 (bir) yil muddatga", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "AVTOTRANSPORT VOSITASINI BOSHQARISH UCHUN ISHONCHNOMA",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Men — " + cleanField(d.owner, "Avtomobil egasi") + " (pasport/ID: " + cleanField(d.ownerPassport, "Pasport") + "), menga tegishli bo‘lgan " + cleanField(d.carModel, "Avtomobil rusumi va raqami") + " (texnik pasport: " + cleanField(d.carTechPass, "Texnik pasport") + ") avtomashinasini fuqaro " + cleanField(d.driver, "Haydovchi") + " (pasport/ID: " + cleanField(d.driverPassport, "Pasport") + ")ga boshqarish uchun ishonib topshiraman:",
      sections: [
        {
          title: "1. BERILADIGAN VAKOLATLAR",
          paragraphs: [
            "Ushbu ishonchnoma bilan vakilga avtomashinani O‘zbekiston Respublikasi hududida boshqarish, texnik ko‘rikdan o‘tkazish, jarimalar va to‘lovlarni amalga oshirish vakolati beriladi.",
            "Avtomobilni sotish yoki boshqa shaxsga ijaraga berish huquqi berilmaydi."
          ]
        },
        {
          title: "2. MUDDAT",
          paragraphs: [
            "Ishonchnoma " + cleanField(d.term, "1 yil muddatga") + " berildi."
          ]
        }
      ],
      signatures: [
        { role: "Avtomobil egasi", name: cleanField(d.owner, "F.I.Sh.") }
      ]
  })`
});

// 58. Hujjatlarni olish uchun ishonchnoma
templatesPart4.push({
  id: 58,
  name: "Hujjatlarni olish uchun ishonchnoma",
  icon: "ri-folder-shared-line",
  category: "Ishonchnoma va vakolat",
  desc: "Davlat tashkilotlari, arxivlar yoki korxonalardan hujjatlarni topshirish va qabul qilib olish ishonchnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 134, 138-moddalari",
  disclaimer: "Aksariyat rasmiy guvohnomalarni olish uchun oddiy yozma yoki tashkilot muhri bilan tasdiqlangan ishonchnoma yetarli.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "principal", label: "Ishonch bildiruvchi", type: "text", placeholder: "Hasanov Botir Shokirovich", required: true },
    { key: "agent", label: "Ishonchli vakil", type: "text", placeholder: "Karimov Sherzod Alisherovich", required: true },
    { key: "institutions", label: "Qaysi idoralardan hujjat olinishi", type: "text", placeholder: "Toshkent shahar Davlat soliq boshqarmasi va Davlat xizmatlari markazidan", required: true },
    { key: "documentsList", label: "Qabul qilib olinadigan hujjatlar", type: "textarea", placeholder: "Soliq to‘lovchining hisobga qo‘yilganligi haqida guvohnoma va ma'lumotnomalar...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "HUJJATLARNI TOPSHIRISH VA QABUL QILIB OLISH ISHONCHNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.principal, "Ishonch bildiruvchi") + " nomidan fuqaro " + cleanField(d.agent, "Vakil") + "ga berildi quyidagilar haqida:",
      sections: [
        {
          title: "1. VAKOLAT",
          paragraphs: [
            cleanField(d.institutions, "Muassasa") + "ga ariza bilan murojaat qilish hamda " + cleanField(d.documentsList, "Hujjatlar") + "ni qabul qilib olish va buning uchun zarur jurnallarga imzo chekish vakolati beriladi."
          ]
        }
      ],
      signatures: [
        { role: "Ishonch bildiruvchi", name: cleanField(d.principal, "F.I.Sh.") }
      ]
  })`
});

// 59. Davlat organida vakillik qilish uchun ishonchnoma
templatesPart4.push({
  id: 59,
  name: "Davlat organida vakillik qilish uchun ishonchnoma",
  icon: "ri-government-line",
  category: "Ishonchnoma va vakolat",
  desc: "Davlat xizmatlari, vazirliklar, kadastr va soliq idoralarida manfaatlar vakilligi",
  legalBasis: "O‘zbekiston Respublikasi FK 134-moddasi",
  disclaimer: "Yuridik shaxslar nomidan rahbar imzosi va muhr bilan berilishi mumkin.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "orgOrPerson", label: "Ishonch bildiruvchi (Kompaniya yoki shaxs)", type: "text", placeholder: "«Global Invest» MChJ nomidan direktor A. Jo‘rayev", required: true },
    { key: "representative", label: "Vakil F.I.Sh.", type: "text", placeholder: "Yunusov Farrux Bobirovich", required: true },
    { key: "governmentAgencies", label: "Davlat organlari ro‘yxati", type: "text", placeholder: "Barcha tuman va shahar soliq, bojxona, kadastr idoralari", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "DAVLAT ORGANLARIDA VAKILLIK QILISH UCHUN ISHONCHNOMA",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.orgOrPerson, "Ishonch bildiruvchi") + " nomidan fuqaro " + cleanField(d.representative, "Vakil") + "ga berildi quyidagilar haqida:",
      sections: [
        {
          title: "1. VAKILLIK HUQUQI",
          paragraphs: [
            cleanField(d.governmentAgencies, "Davlat organlari") + "da tashkilot (fuqaro) manfaatlarini ifodalash, hujjatlarni topshirish, taqdimnomalarga javob berish va qonuniy harakatlarni amalga oshirish vakolati yuklatiladi."
          ]
        }
      ],
      signatures: [
        { role: "Ishonch bildiruvchi", name: cleanField(d.orgOrPerson, "F.I.Sh.") }
      ]
  })`
});

// 60. Sudda vakillik qilish uchun ishonchnoma
templatesPart4.push({
  id: 60,
  name: "Sudda vakillik qilish uchun ishonchnoma",
  icon: "ri-scales-line",
  category: "Ishonchnoma va vakolat",
  desc: "Fuqarolik, iqtisodiy yoki ma'muriy sudlarda ishlarni yuritish uchun protsessual vakolatnoma",
  legalBasis: "O‘zbekiston Respublikasi FPK 66, 67-moddalari, IPK 61, 62-moddalari",
  disclaimer: "Da'vodan voz kechish, kelishuv bitimi imzolash yoki pul undirish kabi maxsus vakolatlar matnda aniq ko‘rsatilishi shart.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "principal", label: "Ishonch bildiruvchi F.I.Sh. / Tashkilot", type: "text", placeholder: "«Delta Trade» MChJ (yoki fuqaro B. Qosimov)", required: true },
    { key: "lawyer", label: "Vakil (Advokat/Xodim) F.I.Sh.", type: "text", placeholder: "Sharipov Anvar Karimovich", required: true },
    { key: "courtScope", label: "Sud instansiyalari", type: "text", placeholder: "O‘zbekiston Respublikasining barcha fuqarolik, iqtisodiy va ma'muriy sudlarida", required: true },
    { key: "specialPowers", label: "Maxsus vakolatlar", type: "textarea", placeholder: "Da'vo arizasini imzolash, da'vo talablarini o‘zgartirish, kelishuv bitimi tuzish, sud qarori ustidan shikoyat berish...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "SUDDA ISHLARNI YURITISH UCHUN ISHONCHNOMA",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.principal, "Ishonch bildiruvchi") + " nomidan fuqaro (vakil) " + cleanField(d.lawyer, "Vakil") + "ga quyidagi protsessual vakolatlar berildi:",
      sections: [
        {
          title: "1. SUD JARAYONIDAGI VAKOLATLAR",
          paragraphs: [
            "Vakil " + cleanField(d.courtScope, "Sudlar") + "da ishonch bildiruvchining qonuniy huquq va manfaatlarini to‘liq himoya qiladi.",
            "Shuningdek, FPK 67-moddasiga muvofiq quyidagi maxsus vakolatlar beriladi: " + cleanField(d.specialPowers, "Maxsus vakolatlar."),
            "Vakil sud jarayonida qonunda belgilangan barcha protsessual huquqlardan to‘liq foydalanishga haqli."
          ]
        }
      ],
      signatures: [
        { role: "Ishonch bildiruvchi", name: cleanField(d.principal, "F.I.Sh.") }
      ]
  })`
});

// 61. Mulk bilan bog‘liq vakolat uchun ishonchnoma
templatesPart4.push({
  id: 61,
  name: "Mulk bilan bog‘liq vakolat uchun ishonchnoma",
  icon: "ri-home-gear-line",
  category: "Ishonchnoma va vakolat",
  desc: "Ko‘chmas mulk yoki boshqa mulkni boshqarish, ta'mirlash, ijara shartnomalari tuzish ishonchnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 134-moddasi",
  disclaimer: "Mulkni sotish yoki hadya qilish vakolati ushbu shablonda berilmaydi, faqat boshqaruv vakolati ko‘zda tutilgan.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "owner", label: "Mulk egasi F.I.Sh.", type: "text", placeholder: "G‘ulomov Rustam Tohirovich", required: true },
    { key: "agent", label: "Vakil F.I.Sh.", type: "text", placeholder: "G‘ulomov Elyor Rustamovich", required: true },
    { key: "propertyAddress", label: "Boshqariladigan mulk manzili", type: "text", placeholder: "Toshkent sh., Mirobod tumani, Nukus ko‘chasi, 8-uy, 15-xonadon", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "MOL-MULKNI BOSHQARISH UCHUN ISHONCHNOMA",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.owner, "Mulk egasi") + " nomidan fuqaro " + cleanField(d.agent, "Vakil") + "ga berildi quyidagilar haqida:",
      sections: [
        {
          title: "1. VAKOLAT MAZMUNI",
          paragraphs: [
            "Menga tegishli bo‘lgan " + cleanField(d.propertyAddress, "Mulk manzili") + " manzilidagi mol-mulkni boshqarish, kommunal tashkilotlar bilan shartnomalar tuzish, to‘lovlarni to‘lash va mulkdan xavfsiz foydalanishni ta'minlash vakolati beriladi.",
            "Ushbu ishonchnoma mulkni sotish, garovga qo‘yish yoki boshqa shaklda begonalashtirish huquqini bermaydi."
          ]
        }
      ],
      signatures: [
        { role: "Mulk egasi", name: cleanField(d.owner, "F.I.Sh.") }
      ]
  })`
});


// =========================================================================
// CATEGORY 8: AVTOMOBIL (Templates 62-67)
// =========================================================================

// 62. Avtomobil oldi-sotdi shartnomasi
templatesPart4.push({
  id: 62,
  name: "Avtomobil oldi-sotdi shartnomasi",
  icon: "ri-car-fill",
  category: "Avtomobil",
  desc: "Avtotransport vositasini oldi-sotdi qilish namunaviy shartnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 386–424-moddalari",
  disclaimer: "Avtomobil oldi-sotdi shartnomasi notarial tasdiqlanishi va YHXX (GAI) organlarida davlat ro‘yxatidan o‘tkazilishi qonunan shart.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "seller", label: "Sotuvchi F.I.Sh.", type: "text", placeholder: "Aliyev Sherzod Karimovich", required: true },
    { key: "sellerPassport", label: "Sotuvchi pasport/ID", type: "text", placeholder: "AA 1234567", required: true },
    { key: "buyer", label: "Xaridor F.I.Sh.", type: "text", placeholder: "Valiyev Jamshid Rustamovich", required: true },
    { key: "buyerPassport", label: "Xaridor pasport/ID", type: "text", placeholder: "AB 7654321", required: true },
    { key: "carModel", label: "Avtomobil rusumi, yili va davlat raqami", type: "text", placeholder: "Chevrolet Tracker, 2023-yil, davlat raqami 01 777 AAA", required: true },
    { key: "carVin", label: "Kuzov (VIN) va dvigatel raqami", type: "text", placeholder: "VIN: XWB1234567890, Dvigatel: B15D2-98765", required: true },
    { key: "price", label: "Avtomobil bahosi (so‘m)", type: "number", placeholder: "220000000", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "AVTOTRANSPORT VOSITASI OLDI-SOTDI SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan " + cleanField(d.seller, "Sotuvchi") + " (pasport/ID: " + cleanField(d.sellerPassport, "Pasport") + "), va ikkinchi tomondan " + cleanField(d.buyer, "Xaridor") + " (pasport/ID: " + cleanField(d.buyerPassport, "Pasport") + "), mazkur shartnomani quyidagilar haqida tuzdilar:",
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI",
          paragraphs: [
            "1.1. Sotuvchi o‘ziga tegishli bo‘lgan " + cleanField(d.carModel, "Avtomashina tavsifi") + " (rekvizitlari: " + cleanField(d.carVin, "VIN va dvigatel") + ") avtotransport vositasini Xaridorga sotadi, Xaridor esa qabul qilib oladi.",
            "1.2. Avtotransport vositasining sotuv bahosi: " + formatMoney(d.price) + " etib belgilanadi."
          ]
        },
        {
          title: "2. NOTARIAL TASDIQ VA RO‘YXATDAN O‘TKAZISH",
          paragraphs: [
            "2.1. Mazkur shartnoma notarial tartibda tasdiqlangandan so‘ng qonuniy kuchga kiradi va 10 kun ichida YHXX organlarida Xaridor nomiga ro‘yxatdan o‘tkazilishi shart."
          ]
        }
      ],
      signatures: [
        { role: "Sotuvchi", name: cleanField(d.seller, "F.I.Sh.") },
        { role: "Xaridor", name: cleanField(d.buyer, "F.I.Sh.") }
      ]
  })`
});

// 63. Avtomobil ijara shartnomasi
templatesPart4.push({
  id: 63,
  name: "Avtomobil ijara shartnomasi",
  icon: "ri-car-washing-line",
  category: "Avtomobil",
  desc: "Avtotransport vositasini ekipajsiz ijaraga berish (prokat) shartnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 564–572-moddalari",
  disclaimer: "Yengil avtomobillarni ijaraga berish faoliyati bo‘yicha shartnoma qonunchilik talablariga mos tuzilishi lozim.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "landlord", label: "Ijaraga beruvchi", type: "text", placeholder: "«Avto Prokat» MChJ", required: true },
    { key: "tenant", label: "Ijarachi F.I.Sh.", type: "text", placeholder: "Xolmatov Sanjar Boburovich", required: true },
    { key: "carDetails", label: "Avtomashina rusumi va davlat raqami", type: "text", placeholder: "Chevrolet Onix, davlat raqami 01 B 123 CD", required: true },
    { key: "monthlyFee", label: "Kunlik/Oylik ijara haqi (so‘m)", type: "number", placeholder: "6000000", required: true },
    { key: "period", label: "Ijara muddati", type: "text", placeholder: "3 oy muddatga", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "AVTOTRANSPORT VOSITASINI IJARAGA BERISH SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.landlord, "Ijaraga beruvchi") + " va fuqaro " + cleanField(d.tenant, "Ijarachi") + " Fuqarolik kodeksining 564-moddasiga asosan quyidagi shartnomani tuzdilar:",
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI",
          paragraphs: [
            "1.1. Ijaraga beruvchi " + cleanField(d.carDetails, "Avtomobil") + "ni vaqtincha foydalanish uchun Ijarachiga topshiradi.",
            "1.2. Ijara to‘lovi miqdori: " + formatMoney(d.monthlyFee) + ".",
            "1.3. Ijara muddati: " + cleanField(d.period, "Ijara muddati.") + "."
          ]
        },
        {
          title: "2. FOYDALANISH QOIDALARI",
          paragraphs: [
            "2.1. Ijarachi yo‘l harakati qoidalariga rioya qilishi, yoqilg‘i va joriy yuvish xarajatlarini o‘z hisobidan qoplashi shart."
          ]
        }
      ],
      signatures: [
        { role: "Ijaraga beruvchi", name: cleanField(d.landlord, "Mas'ul") },
        { role: "Ijarachi", name: cleanField(d.tenant, "F.I.Sh.") }
      ]
  })`
});

// 64. Avtomobilni qabul qilish-topshirish dalolatnomasi
templatesPart4.push({
  id: 64,
  name: "Avtomobilni qabul qilish-topshirish dalolatnomasi",
  icon: "ri-file-list-3-line",
  category: "Avtomobil",
  desc: "Avtotransport vositasini oldi-sotdi yoki ijara vaqtida texnik holati va komplektatsiyasini qayd etish dalolatnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 406, 540-moddalari",
  disclaimer: "Avtomobilning ko‘zga tashlanadigan barcha tirnalgan, shikastlangan joylari dalolatnomada yozilishi shart.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "transferor", label: "Topshiruvchi shaxs", type: "text", placeholder: "Aliyev Anvar Akromovich", required: true },
    { key: "receiver", label: "Qabul qiluvchi shaxs", type: "text", placeholder: "Karimov Sherzod Alisherovich", required: true },
    { key: "carData", label: "Avtomashina rusumi, raqami va bosib o‘tgan masofasi", type: "text", placeholder: "Chevrolet Lacetti, davlat raqami 01 X 456 YY, probeg: 85 000 km", required: true },
    { key: "conditionNotes", label: "Texnik holati va kamchiliklari", type: "textarea", placeholder: "Yurish qismi soz holatda, orqa o‘ng eshigida yengil tirnalish mavjud, zaxira g‘ildirak va domkrat joyida...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "AVTOTRANSPORT VOSITASINI QABUL QILISH-TOPSHIRISH DALOLATNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.transferor, "Topshiruvchi") + " va " + cleanField(d.receiver, "Qabul qiluvchi") + " o‘rtasida quyidagilar haqida dalolatnoma tuzildi:",
      sections: [
        {
          title: "1. AVTOMASHINANI TOPSHIRISH HOLATI",
          paragraphs: [
            "Topshirildi: " + cleanField(d.carData, "Avtomobil ma'lumotlari") + ".",
            "Texnik holati tavsifi: " + cleanField(d.conditionNotes, "Holat va kamchiliklar."),
            "Qabul qiluvchi avtomobilning texnik va tashqi holatini to‘liq ko‘zdan kechirdi va qabul qilib oldi."
          ]
        }
      ],
      signatures: [
        { role: "Topshirdi", name: cleanField(d.transferor, "F.I.Sh.") },
        { role: "Qabul qildi", name: cleanField(d.receiver, "F.I.Sh.") }
      ]
  })`
});

// 65. Avtomobil bo‘yicha ishonchnoma (Umumiy avto ishonchnoma)
templatesPart4.push({
  id: 65,
  name: "Avtomobil bo‘yicha ishonchnoma",
  icon: "ri-steering-2-line",
  category: "Avtomobil",
  desc: "Avtomobilni tasarruf etish, sotish yoki qayta ro‘yxatdan o‘tkazish vakolatini beruvchi bosh ishonchnoma",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 134-moddasi",
  disclaimer: "Notarial tartibda rasmiylashtirilishi talab etiladi.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "owner", label: "Mulkdor F.I.Sh.", type: "text", placeholder: "Sharipov Botir Aliyevich", required: true },
    { key: "agent", label: "Ishonchli vakil F.I.Sh.", type: "text", placeholder: "Mirzayev Farhod Shokirovich", required: true },
    { key: "car", label: "Avtomobil rusumi va raqami", type: "text", placeholder: "Kia K5, davlat raqami 01 M 001 AA", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "AVTOMOBILNI TASARRUF ETISH UCHUN ISHONCHNOMA",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.owner, "Avtomashina egasi") + " nomidan fuqaro " + cleanField(d.agent, "Vakil") + "ga berildi quyidagilar haqida:",
      sections: [
        {
          title: "1. VAKOLAT DOIRASI",
          paragraphs: [
            "Menga tegishli " + cleanField(d.car, "Avtomobil") + " avtomashinasini sotish, almashtirish, ijaraga berish, sug‘urtalash va davlat ro‘yxatidan o‘tkazish vakolatini beraman."
          ]
        }
      ],
      signatures: [
        { role: "Mulkdor", name: cleanField(d.owner, "F.I.Sh.") }
      ]
  })`
});

// 66. Yo‘l-transport hodisasi bo‘yicha zarar talabnomasi
templatesPart4.push({
  id: 66,
  name: "Yo‘l-transport hodisasi bo‘yicha zarar talabnomasi",
  icon: "ri-car-crash-line",
  category: "Avtomobil",
  desc: "YTH natijasida avtomashinaga yetkazilgan moddiy zararni aybdordan ixtiyoriy undirish talabnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 985, 999-moddalari",
  disclaimer: "YTH bayonnomasi (Yo‘l harakati xavfsizligi ma'lumotnomasi) va baholash dalolatnomasi ilova qilinishi lozim.",
  fields: [
    { key: "culpritName", label: "Aybdor haydovchi F.I.Sh.", type: "text", placeholder: "Sultonov Dilshod Farhodovich", required: true },
    { key: "culpritAddress", label: "Aybdor manzili", type: "text", placeholder: "Toshkent sh., Yunusobod tumani", required: true },
    { key: "victimName", label: "Jabrlanuvchi F.I.Sh.", type: "text", placeholder: "Karimov Sherzod Alisherovich", required: true },
    { key: "accidentDetails", label: "YTH sodir bo‘lgan sana, joy va holat", type: "textarea", placeholder: "2026-yil 15-fevral kuni Amir Temur ko‘chasida sodir bo‘lgan YTHda Sizning boshqaruvingizdagi avtomobil...", required: true },
    { key: "damageAmount", label: "Talab qilinayotgan zarar summasi (so‘m)", type: "number", placeholder: "8700000", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "YTH NATIJASIDA YETKAZILGAN ZARARNI QOPLASH TO‘G‘RISIDA TALABNOMA",
      city: "Sudgacha talab",
      date: formatUzbekDate(d.date),
      preamble: "Kimga: " + cleanField(d.culpritName, "Aybdor") + "\\nManzil: " + cleanField(d.culpritAddress, "Manzil") + "\\nKimdan: " + cleanField(d.victimName, "Jabrlanuvchi"),
      sections: [
        {
          title: "1. YTH TAFSILOTLARI VA YETKAZILGAN ZARAR",
          paragraphs: [
            cleanField(d.accidentDetails, "YTH holati bayon etiladi."),
            "Mustaqil baholash xulosasiga ko‘ra avtomashinamga yetkazilgan zarar miqdori (sug‘urta to‘lovidan ortiqcha qismi) " + formatMoney(d.damageAmount) + "ni tashkil etadi.",
            "O‘zbekiston Respublikasi Fuqarolik kodeksining 985 va 999-moddalariga muvofiq, yuqori xavf manbai bilan yetkazilgan zarar aybdor shaxs tomonidan qoplanishi shart."
          ]
        },
        {
          title: "2. TALAB",
          paragraphs: [
            "Mazkur talabnomani olgan kundan boshlab 10 kun muddatda " + formatMoney(d.damageAmount) + " zararni ixtiyoriy qoplashingizni talab qilaman, aks holda sudga da'vo arizasi kiritiladi."
          ]
        }
      ],
      signatures: [
        { role: "Jabrlanuvchi", name: cleanField(d.victimName, "F.I.Sh.") }
      ]
  })`
});

// 67. Avtomobilga yetkazilgan zararni undirish bo‘yicha da’vo
templatesPart4.push({
  id: 67,
  name: "Avtomobilga yetkazilgan zararni undirish bo‘yicha da’vo",
  icon: "ri-scales-3-line",
  category: "Avtomobil",
  desc: "YTH oqibatida yetkazilgan zararni sud orqali undirish to‘g‘risidagi da’vo arizasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 985, 999-moddalari, FPK 189-moddasi",
  disclaimer: "YTH bo‘yicha ma'muriy sud qarori yoki YHXB ma'lumotnomasi nusxasi taqdim etilishi lozim.",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha Mirobod tumanlararo sudiga", required: true },
    { key: "plaintiff", label: "Da'vogar F.I.Sh.", type: "text", placeholder: "Karimov Sherzod Alisherovich", required: true },
    { key: "defendant", label: "Javobgar (YTH aybdori)", type: "text", placeholder: "Saidov Bobur Shokirovich", required: true },
    { key: "claimAmount", label: "Zarar summasi (so‘m)", type: "number", placeholder: "11500000", required: true },
    { key: "facts", label: "YTH va zarar yetkazilish holatlari", type: "textarea", placeholder: "Javobgar svetoforning qizil chirog‘ida harakatlanib, da'vogarning Cobalt rusumli avtomashinasiga shikast yetkazgan...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "YTH NATIJASIDA AVTOMOBILGA YETKAZILGAN ZARARNI UNDIRISH TO‘G‘RISIDA DA’VO ARIZASI",
      city: "Fuqarolik sudi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Sud nomi") + "\\nDa'vogar: " + cleanField(d.plaintiff, "Da'vogar") + "\\nJavobgar: " + cleanField(d.defendant, "Javobgar") + "\\nDa'vo bahosi: " + formatMoney(d.claimAmount),
      sections: [
        {
          title: "1. ISH HOLATLARI",
          paragraphs: [
            cleanField(d.facts, "YTH holatlari."),
            "Baholovchi tashkilot xulosasiga binoan moddiy zarar " + formatMoney(d.claimAmount) + "ni tashkil etgan. Javobgar zararni ixtiyoriy to‘lashdan bosh tortmoqda."
          ]
        },
        {
          title: "2. SUDDAN SO‘RALADIGAN TALAB",
          paragraphs: [
            "SUDDAN SO‘RAYMAN:",
            "Javobgardan Da'vogar foydasiga " + formatMoney(d.claimAmount) + " moddiy zarar hamda davlat boji xarajatlari undirilsin."
          ]
        }
      ],
      signatures: [
        { role: "Da'vogar", name: cleanField(d.plaintiff, "F.I.Sh.") }
      ]
  })`
});


// =========================================================================
// CATEGORY 9: OILA VA FUQAROLIK (Templates 68-73)
// =========================================================================

// 68. Nikohdan ajratish bo‘yicha ariza/da’vo namunasi
templatesPart4.push({
  id: 68,
  name: "Nikohdan ajratish bo‘yicha ariza/da’vo namunasi",
  icon: "ri-user-unfollow-line",
  category: "Oila va fuqarolik",
  desc: "Sud tartibida nikohdan ajratish to‘g‘risida da’vo arizasi",
  legalBasis: "O‘zbekiston Respublikasi Oila kodeksi 37–43-moddalari",
  disclaimer: "Sud oilani saqlab qolish uchun taraflarga olti oygacha yarashish muhlatini belgilashga haqlidir.",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha Mirzo Ulug‘bek tumanlararo sudiga", required: true },
    { key: "plaintiff", label: "Da'vogar (Er/Xotin) F.I.Sh.", type: "text", placeholder: "Rahimova Nozima Alisherovna", required: true },
    { key: "defendant", label: "Javobgar (Er/Xotin) F.I.Sh.", type: "text", placeholder: "Rahimov Sardor Ilhomovich", required: true },
    { key: "marriageDate", label: "Nikoh qayd etilgan sana va FHDY bo‘limi", type: "text", placeholder: "2020-yil 15-sentabrda Mirzo Ulug‘bek tumani FHDY bo‘limida", required: true },
    { key: "children", label: "Voyaga yetmagan farzandlar (F.I.Sh. va tug‘ilgan yili)", type: "textarea", placeholder: "Bir nafar farzandimiz bor: Rahimov Temur Sardor o‘g‘li, 2022-yilda tug‘ilgan", required: true },
    { key: "breakupReason", label: "Ajralish sabablari va birga yashamaslik muddati", type: "textarea", placeholder: "Xarakterlarimiz to‘g‘ri kelmaganligi sababli oilaviy kelishmovchiliklar yuzaga keldi. 2025-yil mart oyidan buyon birga yashamaymiz...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "NIKOHDAN AJRATISH TO‘G‘RISIDA DA’VO ARIZASI",
      city: "Fuqarolik sudi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Sud nomi") + "\\nDa'vogar: " + cleanField(d.plaintiff, "Da'vogar") + "\\nJavobgar: " + cleanField(d.defendant, "Javobgar"),
      sections: [
        {
          title: "1. NIKOH MUNOSABATLARI VA AJRALISH SABABLARI",
          paragraphs: [
            "Biz " + cleanField(d.marriageDate, "Nikoh sanasi") + "da qonuniy nikohdan o‘tganmiz.",
            "O‘rtamizdagi farzandlar: " + cleanField(d.children, "Farzandlar haqida ma'lumot."),
            "Oila buzilishi sabablari: " + cleanField(d.breakupReason, "Ajralish sabablari."),
            "Oila kodeksining 41-moddasiga ko‘ra, agar sud er va xotinning bundan buyon birgalikda yashashiga va oilani saqlab qolishga imkoniyat yo‘q deb topsa, nikohdan ajratadi."
          ]
        },
        {
          title: "2. SUDDAN SO‘RALADIGAN TALAB",
          paragraphs: [
            "SUDDAN SO‘RAYMAN:",
            "Taraflar o‘rtasidagi qonuniy nikohni bekor qilishingizni so‘rayman."
          ]
        }
      ],
      signatures: [
        { role: "Da'vogar", name: cleanField(d.plaintiff, "F.I.Sh.") }
      ]
  })`
});

// 69. Aliment undirish bo‘yicha ariza/da’vo
templatesPart4.push({
  id: 69,
  name: "Aliment undirish bo‘yicha ariza/da’vo",
  icon: "ri-parent-line",
  category: "Oila va fuqarolik",
  desc: "Voyaga yetmagan bola(lar) ta'minoti uchun aliment undirish haqida sud buyrug‘i berish to‘g‘risida ariza",
  legalBasis: "O‘zbekiston Respublikasi Oila kodeksi 96–104-moddalari, FPK 171-moddasi",
  disclaimer: "Otalikni aniqlash talabi bo‘lmaganda sud buyrug‘i soddalashtirilgan tartibda 3 kun ichida chiqariladi.",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha Shayxontohur tumanlararo sudiga", required: true },
    { key: "applicant", label: "Ariza beruvchi (Ona/Ota) F.I.Sh.", type: "text", placeholder: "Nazarova Madina Alisherovna", required: true },
    { key: "debtor", label: "Qarzdor (Ota/Ona) F.I.Sh.", type: "text", placeholder: "Nazarov Bobur Akromovich", required: true },
    { key: "childrenInfo", label: "Farzandlar soni, F.I.Sh. va tug‘ilgan sanasi", type: "textarea", placeholder: "Farzandimiz: Nazarov Asadbek Bobur o‘g‘li, 2021-yil 12-mayda tug‘ilgan", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "ALIMENT UNDIRISH TO‘G‘RISIDA SUD BUYRUG‘I BERISH HAQIDA ARIZA",
      city: "Fuqarolik sudi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Sud nomi") + "\\nUndiruvchi: " + cleanField(d.applicant, "Ariza beruvchi") + "\\nQarzdor: " + cleanField(d.debtor, "Qarzdor"),
      sections: [
        {
          title: "1. VOYAGA YETMAGAN FARZAND TA’MINOTI VA QONUN TALABI",
          paragraphs: [
            "Qarzdor bilan birgalikdagi nikohimizdan voyaga yetmagan farzandimiz bor: " + cleanField(d.childrenInfo, "Farzand ma'lumotlari") + ".",
            "Hozirda bola to‘liq mening qaramog‘imda yashab kelmoqda, biroq qarzdor bolaning moddiy ta'minotida qatnashmayapti.",
            "Oila kodeksining 96-moddasiga ko‘ra ota-ona voyaga yetmagan bolalariga ta'minot berishi shart. 99-moddaga asosan aliment oylik ish haqining bir bola uchun 1/4 qismi, ikki bola uchun 1/3 qismi miqdorida undiriladi."
          ]
        },
        {
          title: "2. SUDDAN TALAB",
          paragraphs: [
            "SUDDAN SO‘RAYMAN:",
            "Qarzdor " + cleanField(d.debtor, "Qarzdor") + "dan voyaga yetmagan bola(lar) ta'minoti uchun har oyda daromadining qonunda belgilangan qismida aliment undirish to‘g‘risida sud buyrug‘i chiqarishingizni so‘rayman."
          ]
        }
      ],
      signatures: [
        { role: "Ariza beruvchi", name: cleanField(d.applicant, "F.I.Sh.") }
      ]
  })`
});

// 70. Aliment miqdorini o‘zgartirish bo‘yicha ariza
templatesPart4.push({
  id: 70,
  name: "Aliment miqdorini o‘zgartirish bo‘yicha ariza",
  icon: "ri-exchange-line",
  category: "Oila va fuqarolik",
  desc: "Moddiy yoki oilaviy ahvol o‘zgarganligi munosabati bilan aliment miqdorini kamaytirish yoki oshirish bo‘yicha da’vo",
  legalBasis: "O‘zbekiston Respublikasi Oila kodeksi 105-moddasi",
  disclaimer: "Moddiy ahvolning yomonlashgani (yoki yaxshilangani) hujjatlar bilan isbotlanishi lozim.",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha tumanlararo sudiga", required: true },
    { key: "plaintiff", label: "Da'vogar F.I.Sh.", type: "text", placeholder: "Qodirov Alisher Rustamovich", required: true },
    { key: "defendant", label: "Javobgar F.I.Sh.", type: "text", placeholder: "Qodirova Shahlo Olimovna", required: true },
    { key: "changeReason", label: "Aliment miqdorini o‘zgartirish sabablari", type: "textarea", placeholder: "Da'vogarning ikkinchi oilasida yana ikki nafar bola tug‘ilganligi va salomatligi yomonlashganligi sababli...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "ALIMENT MIQDORINI O‘ZGARTIRISH (KAMAYTIRISH/OSHIRISH) HAQIDA DA’VO ARIZASI",
      city: "Fuqarolik sudi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Sud nomi") + "\\nDa'vogar: " + cleanField(d.plaintiff, "Da'vogar") + "\\nJavobgar: " + cleanField(d.defendant, "Javobgar"),
      sections: [
        {
          title: "1. ASOSLAR VA HOLAT",
          paragraphs: [
            cleanField(d.changeReason, "Moddiy va oilaviy ahvol o‘zgarishi sabablari."),
            "O‘zbekiston Respublikasi Oila kodeksining 105-moddasiga ko‘ra, agar ota-onaning moddiy yoki oilaviy ahvoli o‘zgargan bo‘lsa, sud aliment miqdorini kamaytirishga yoki oshirishga haqlidir."
          ]
        },
        {
          title: "2. DA’VO TALABI",
          paragraphs: [
            "SUDDAN SO‘RAYMAN:",
            "Javobgar foydasiga undirilayotgan aliment miqdori belgilangan tartibda o‘zgartirilsin."
          ]
        }
      ],
      signatures: [
        { role: "Da'vogar", name: cleanField(d.plaintiff, "F.I.Sh.") }
      ]
  })`
});

// 71. Bola bilan bog‘liq huquqlar bo‘yicha ariza
templatesPart4.push({
  id: 71,
  name: "Bola bilan bog‘liq huquqlar bo‘yicha ariza",
  icon: "ri-heart-line",
  category: "Oila va fuqarolik",
  desc: "Alohida yashayotgan ota (ona)ning bola bilan ko‘rishish va tarbiyalash tartibini belgilash haqida da’vo",
  legalBasis: "O‘zbekiston Respublikasi Oila kodeksi 76-moddasi",
  disclaimer: "Ish vasiylik va homiylik organining majburiy ishtirokida ko‘rib chiqiladi.",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha Chilonzor tumanlararo sudiga", required: true },
    { key: "plaintiff", label: "Da'vogar (Ota/Ona) F.I.Sh.", type: "text", placeholder: "Saidov Anvar Shokirovich", required: true },
    { key: "defendant", label: "Javobgar (Ona/Ota) F.I.Sh.", type: "text", placeholder: "Saidova Zarina Erkinovna", required: true },
    { key: "childName", label: "Bola(lar)ning F.I.Sh. va yoshi", type: "text", placeholder: "Saidov Kamron Anvar o‘g‘li, 2020-yilda tug‘ilgan", required: true },
    { key: "proposedSchedule", label: "Ko‘rishish uchun taklif etilayotgan jadval", type: "textarea", placeholder: "Har haftaning shanba kuni soat 10:00 dan yakshanba kuni soat 18:00 gacha yashash joyimda birga bo‘lish...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "BOLA BILAN KO‘RISHISH VA TARBIYALASH TARTIBINI BELGILASH HAQIDA DA’VO ARIZASI",
      city: "Fuqarolik sudi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Sud nomi") + "\\nDa'vogar: " + cleanField(d.plaintiff, "Da'vogar") + "\\nJavobgar: " + cleanField(d.defendant, "Javobgar"),
      sections: [
        {
          title: "1. NIZONING KELIB CHIQISHI",
          paragraphs: [
            "Farzandimiz: " + cleanField(d.childName, "Bola ma'lumotlari") + ".",
            "Javobgar men bilan bolaning ko‘rishishiga asossiz to‘sqinlik qilib kelmoqda.",
            "Oila kodeksining 76-moddasiga asosan boladan alohida yashayotgan ota (ona) bola bilan muloqotda bo‘lish, uning tarbiyasida ishtirok etish huquqiga ega."
          ]
        },
        {
          title: "2. TAKLIF ETILAYOTGAN JADVAL VA TALAB",
          paragraphs: [
            cleanField(d.proposedSchedule, "Ko‘rishish tartibi jadvali."),
            "Suddan ko‘rsatilgan tartibda bola bilan ko‘rishish tartibini belgilashni so‘rayman."
          ]
        }
      ],
      signatures: [
        { role: "Da'vogar", name: cleanField(d.plaintiff, "F.I.Sh.") }
      ]
  })`
});

// 72. Nikoh shartnomasi namunasi
templatesPart4.push({
  id: 72,
  name: "Nikoh shartnomasi namunasi",
  icon: "ri-contacts-book-2-line",
  category: "Oila va fuqarolik",
  desc: "Er va xotinning nikoh davomida va nikohdan ajralgandagi mulkiy huquq hamda majburiyatlarini belgilovchi bitim",
  legalBasis: "O‘zbekiston Respublikasi Oila kodeksi 29–36-moddalari",
  disclaimer: "Nikoh shartnomasi notarial tasdiqlanishi shart.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "spouse1", label: "Bo‘lg‘usi er (er) F.I.Sh.", type: "text", placeholder: "Karimov Sherzod Alisherovich", required: true },
    { key: "spouse2", label: "Bo‘lg‘usi xotin (xotin) F.I.Sh.", type: "text", placeholder: "Aliyeva Shahnoza Farhodovna", required: true },
    { key: "propertyRegime", label: "Mulk tartibi (alohida yoki birgalikdagi)", type: "textarea", placeholder: "Nikoh davomida har bir taraf o‘z nomiga sotib olgan ko‘chmas va ko‘char mulklar ushbu tarafning yakka mulki hisoblanadi...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "NIKOH SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.spouse1, "Er") + " va " + cleanField(d.spouse2, "Xotin") + " O‘zbekiston Respublikasi Oila kodeksining 29–36-moddalariga muvofiq mazkur shartnomani tuzdilar:",
      sections: [
        {
          title: "1. MULKNING HUQUQIY REJIMI",
          paragraphs: [
            cleanField(d.propertyRegime, "Mulkka egalik qilish tartibi."),
            "Er-xotindan birining nomiga olingan kreditlar va qarzlar bo‘yicha faqat o‘sha taraf javobgar bo‘ladi."
          ]
        },
        {
          title: "2. NOTARIAL TASDIQ",
          paragraphs: [
            "Mazkur shartnoma notarial tasdiqlangan paytdan e'tiboran yuridik kuchga ega bo‘ladi."
          ]
        }
      ],
      signatures: [
        { role: "Er", name: cleanField(d.spouse1, "F.I.Sh.") },
        { role: "Xotin", name: cleanField(d.spouse2, "F.I.Sh.") }
      ]
  })`
});

// 73. Mulkni bo‘lish bo‘yicha da’vo arizasi
templatesPart4.push({
  id: 73,
  name: "Mulkni bo‘lish bo‘yicha da’vo arizasi",
  icon: "ri-pie-chart-line",
  category: "Oila va fuqarolik",
  desc: "Nikoh davomida orttirilgan umumiy birgalikdagi mol-mulkni sud orqali teng bo‘lish da’vosi",
  legalBasis: "O‘zbekiston Respublikasi Oila kodeksi 23, 27, 28-moddalari",
  disclaimer: "Nikoh davomida orttirilgan mulklar, agar shartnomada boshqacha ko‘rsatilmagan bo‘lsa, er-xotinning teng ulushdagi umumiy mulki hisoblanadi.",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha Yunusobod tumanlararo sudiga", required: true },
    { key: "plaintiff", label: "Da'vogar F.I.Sh.", type: "text", placeholder: "Rahimova Shahlo Anvarovna", required: true },
    { key: "defendant", label: "Javobgar F.I.Sh.", type: "text", placeholder: "Rahimov Sardor Alisherovich", required: true },
    { key: "propertyToDivide", label: "Bo‘linishi lozim bo‘lgan mol-mulklar ro‘yxati va qiymati", type: "textarea", placeholder: "1. Toshkent shahridagi 3 xonali xonadon (bahosi: 600 mln so‘m);\n2. Chevrolet Tracker avtomobili (bahosi: 220 mln so‘m)...", required: true },
    { key: "totalValue", label: "Mulkning umumiy bahosi (so‘m)", type: "number", placeholder: "820000000", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "ER-XOTINNING UMUMIY BIRGALIKDAGI MOL-MULKINI BO‘LISH TO‘G‘RISIDA DA’VO ARIZASI",
      city: "Fuqarolik sudi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Sud nomi") + "\\nDa'vogar: " + cleanField(d.plaintiff, "Da'vogar") + "\\nJavobgar: " + cleanField(d.defendant, "Javobgar") + "\\nDa'vo bahosi: " + formatMoney(d.totalValue),
      sections: [
        {
          title: "1. UMUMIY MULKNING VAZIYATI VA HUQUQIY ASOSLAR",
          paragraphs: [
            "Nikohimiz davomida quyidagi mol-mulklar umumiy daromadlarimiz hisobiga sotib olingan:",
            cleanField(d.propertyToDivide, "Mulklar ro‘yxati."),
            "Oila kodeksining 23 va 28-moddalariga muvofiq, er va xotinning nikoh davomida orttirgan mol-mulklari ularning birgalikdagi umumiy mulki hisoblanadi va ularning ulushlari teng deb hisoblanadi."
          ]
        },
        {
          title: "2. SUDDAN TALAB",
          paragraphs: [
            "SUDDAN SO‘RAYMAN:",
            "Ko‘rsatilgan mol-mulk qonuniy tartibda taraflar o‘rtasida teng ulushlarda bo‘linsin."
          ]
        }
      ],
      signatures: [
        { role: "Da'vogar", name: cleanField(d.plaintiff, "F.I.Sh.") }
      ]
  })`
});


// =========================================================================
// CATEGORY 10: TADBIRKORLIK (Templates 74-83)
// =========================================================================

// 74. Xizmat ko‘rsatish shartnomasi (B2B)
templatesPart4.push({
  id: 74,
  name: "Xizmat ko‘rsatish shartnomasi",
  icon: "ri-briefcase-4-line",
  category: "Tadbirkorlik",
  desc: "Yuridik shaxslar va YaTTlar o‘rtasida biznes xizmatlari ko‘rsatish shartnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 703–708-moddalari",
  disclaimer: "Elektron hisobvaraq-faktura (didox.uz va h.k.) orqali rasmiylashtirilishi lozim.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "clientOrg", label: "Buyurtmachi korxona", type: "text", placeholder: "«Apex Trade» MChJ", required: true },
    { key: "providerOrg", label: "Ijrochi korxona", type: "text", placeholder: "«Soft Solutions» MChJ", required: true },
    { key: "serviceScope", label: "Biznes xizmatlar tavsifi", type: "textarea", placeholder: "ERP tizimini joriy qilish va texnik qo‘llab-quvvatlash...", required: true },
    { key: "amount", label: "Shartnoma qiymati (so‘m)", type: "number", placeholder: "30000000", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "B2B XIZMAT KO‘RSATISH SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.clientOrg, "Buyurtmachi") + " va " + cleanField(d.providerOrg, "Ijrochi") + " Fuqarolik kodeksining 703-moddasiga asosan mazkur shartnomani tuzdilar:",
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI",
          paragraphs: [
            "Ijrochi Buyurtmachi uchun quyidagi xizmatlarni bajaradi: " + cleanField(d.serviceScope, "Xizmatlar tavsifi."),
            "Xizmatlar qiymati: " + formatMoney(d.amount) + "ni tashkil etadi."
          ]
        }
      ],
      signatures: [
        { role: "Buyurtmachi", name: cleanField(d.clientOrg, "Rahbar") },
        { role: "Ijrochi", name: cleanField(d.providerOrg, "Rahbar") }
      ]
  })`
});

// 75. Hamkorlik shartnomasi (Biznes)
templatesPart4.push({
  id: 75,
  name: "Hamkorlik shartnomasi",
  icon: "ri-team-line",
  category: "Tadbirkorlik",
  desc: "Tadbirkorlik subyektlari o‘rtasida qo‘shma loyihalarni amalga oshirish shartnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 962-moddasi",
  disclaimer: "Sheriklik faoliyatida olingan daromadlar kelishilgan nisbatda taqsimlanadi.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "partner1", label: "1-sherik nomi", type: "text", placeholder: "«Vostok Logistika» MChJ", required: true },
    { key: "partner2", label: "2-sherik nomi", type: "text", placeholder: "«Zapad Terminal» MChJ", required: true },
    { key: "purpose", label: "Hamkorlik yo‘nalishi", type: "textarea", placeholder: "O‘zbekiston va Yevropa o‘rtasida multimodal yuk tashuvlarini birgalikda tashkil etish...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "TIJORAT HAMKORLIGI SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.partner1, "1-sherik") + " va " + cleanField(d.partner2, "2-sherik") + " o‘zaro manfaatli tijorat hamkorligi to‘g‘risida quyidagilarni kelishdilar:",
      sections: [
        {
          title: "1. HAMKORLIK PREDMETI",
          paragraphs: [
            cleanField(d.purpose, "Hamkorlik maqsadi va vazifalari.")
          ]
        }
      ],
      signatures: [
        { role: "1-sherik", name: cleanField(d.partner1, "Vakil") },
        { role: "2-sherik", name: cleanField(d.partner2, "Vakil") }
      ]
  })`
});

// 76. Yetkazib berish shartnomasi
templatesPart4.push({
  id: 76,
  name: "Yetkazib berish shartnomasi",
  icon: "ri-truck-line",
  category: "Tadbirkorlik",
  desc: "Tadbirkorlik maqsadlarida tovar va mahsulotlarni yetkazib berish bo‘yicha B2B shartnoma",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 437–456-moddalari",
  disclaimer: "Tovarlarning sifati standartlar va texnik shartlarga javob berishi shart.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "supplier", label: "Yetkazib beruvchi korxona", type: "text", placeholder: "«Agro Prom» MChJ", required: true },
    { key: "buyer", label: "Xaridor (Buyurtmachi)", type: "text", placeholder: "«Mega Market» MChJ", required: true },
    { key: "goods", label: "Yetkazib beriladigan tovarlar tavsifi va miqdori", type: "textarea", placeholder: "Oziq-ovqat mahsulotlari (shakar, un, yog‘) ilova qilingan spetsifikatsiyaga muvofiq...", required: true },
    { key: "totalPrice", label: "Umumiy shartnoma summasi (so‘m)", type: "number", placeholder: "150000000", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "MAHSULOTLARNI YETKAZIB BERISH SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.supplier, "Yetkazib beruvchi") + " va " + cleanField(d.buyer, "Xaridor") + " Fuqarolik kodeksining 437-moddasiga asosan mazkur shartnomani tuzdilar:",
      sections: [
        {
          title: "1. SHARTNOMA PREDMETI",
          paragraphs: [
            "Yetkazib beruvchi quyidagi tovarlarni Xaridorga yetkazib berish majburiyatini oladi:",
            cleanField(d.goods, "Tovarlar ro‘yxati."),
            "Umumiy shartnoma qiymati: " + formatMoney(d.totalPrice) + "."
          ]
        }
      ],
      signatures: [
        { role: "Yetkazib beruvchi", name: cleanField(d.supplier, "Rahbar") },
        { role: "Xaridor", name: cleanField(d.buyer, "Rahbar") }
      ]
  })`
});

// 77. Mahsulot oldi-sotdi shartnomasi
templatesPart4.push({
  id: 77,
  name: "Mahsulot oldi-sotdi shartnomasi",
  icon: "ri-store-2-line",
  category: "Tadbirkorlik",
  desc: "Korxonalar o‘rtasida tovar va tayyor mahsulot oldi-sotdisi shartnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 386-moddasi",
  disclaimer: "Qonuniy hisobvaraq-faktura rasmiylashtirilishi shart.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "seller", label: "Sotuvchi korxona", type: "text", placeholder: "«Texno Savdo» MChJ", required: true },
    { key: "buyer", label: "Xaridor korxona", type: "text", placeholder: "«Stroy Kompleks» MChJ", required: true },
    { key: "products", label: "Mahsulotlar nomi va tavsifi", type: "textarea", placeholder: "Elektr kabellari va transformatorlar...", required: true },
    { key: "amount", label: "Jami to‘lov summasi (so‘m)", type: "number", placeholder: "45000000", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "MAHSULOT OLDI-SOTDI SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.seller, "Sotuvchi") + " va " + cleanField(d.buyer, "Xaridor") + " o‘rtasida tuzildi:",
      sections: [
        {
          title: "1. SHARTNOMA SHARTLARI",
          paragraphs: [
            "Sotuvchi quyidagi mahsulotlarni sotadi: " + cleanField(d.products, "Mahsulotlar."),
            "Qiymati: " + formatMoney(d.amount) + "."
          ]
        }
      ],
      signatures: [
        { role: "Sotuvchi", name: cleanField(d.seller, "Rahbar") },
        { role: "Xaridor", name: cleanField(d.buyer, "Rahbar") }
      ]
  })`
});

// 78. Pudrat shartnomasi (B2B)
templatesPart4.push({
  id: 78,
  name: "Pudrat shartnomasi",
  icon: "ri-tools-line",
  category: "Tadbirkorlik",
  desc: "Qurilish, montaj, ta'mirlash yoki ishlab chiqarish pudrat shartnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 631–685-moddalari",
  disclaimer: "Qurilish obyektlarida litsenziyaga ega pudratchi talab qilinishi mumkin.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "client", label: "Buyurtmachi korxona", type: "text", placeholder: "«Sanoat Loyiha» MChJ", required: true },
    { key: "contractor", label: "Bosh pudratchi korxona", type: "text", placeholder: "«Bino Qurilish Servis» MChJ", required: true },
    { key: "scope", label: "Bajariladigan qurilish-montaj ishlari", type: "textarea", placeholder: "Omborxona binosining metall konstruksiyalarini montaj qilish...", required: true },
    { key: "cost", label: "Ishlar qiymati (so‘m)", type: "number", placeholder: "80000000", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "TIJORAT PUDRAT SHARTNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.client, "Buyurtmachi") + " va " + cleanField(d.contractor, "Pudratchi") + " Fuqarolik kodeksining 631-moddasiga binoan quyidagi shartnomani tuzdilar:",
      sections: [
        {
          title: "1. ISHLAR TAVSIFI VA MUDDATI",
          paragraphs: [
            "Pudratchi quyidagi ishlarni sifatli bajarish majburiyatini oladi: " + cleanField(d.scope, "Ishlar hajmi."),
            "Qiymati: " + formatMoney(d.cost) + "."
          ]
        }
      ],
      signatures: [
        { role: "Buyurtmachi", name: cleanField(d.client, "Rahbar") },
        { role: "Pudratchi", name: cleanField(d.contractor, "Rahbar") }
      ]
  })`
});

// 79. Talabnoma (pretenziya)
templatesPart4.push({
  id: 79,
  name: "Talabnoma (pretenziya)",
  icon: "ri-feedback-line",
  category: "Tadbirkorlik",
  desc: "Shartnoma shartlarini buzgan kontragentga sudgacha yuboriladigan rasmiy pretenziya",
  legalBasis: "O‘zbekiston Respublikasi Iqtisodiy protsessual kodeksi 148-moddasi",
  disclaimer: "Iqtisodiy sudga da'vo kiritishdan oldin pretenziya yuborish majburiydir (agar shartnomada yoki qonunda belgilangan bo‘lsa).",
  fields: [
    { key: "debtorOrg", label: "Qarzdor/Buzuvchi korxona nomi", type: "text", placeholder: "«Vostok Trans» MChJ rahbariyatiga", required: true },
    { key: "claimantOrg", label: "Talabnoma yuboruvchi korxona", type: "text", placeholder: "«Premium Import» MChJ", required: true },
    { key: "violationDetails", label: "Shartnoma shartlarining buzilishi holati", type: "textarea", placeholder: "2025-yil 12-noyabrdagi 34-sonli shartnoma bo‘yicha tovarlar o‘z vaqtida yetkazib berilmadi...", required: true },
    { key: "claimAmount", label: "Undirilishi talab etilayotgan summa (so‘m)", type: "number", placeholder: "24000000", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "RASMIY TALABNOMA (PRETENZIYA)",
      city: "Sudgacha tartibga solish",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.debtorOrg, "Qarzdor korxona") + "\\nKimdan: " + cleanField(d.claimantOrg, "Talab qiluvchi"),
      sections: [
        {
          title: "1. BUZILGAN MAJBURIYATLAR VA ZARARLAR",
          paragraphs: [
            cleanField(d.violationDetails, "Buzilish tafsilotlari."),
            "Sizning tashkilotingiz tomonidan yetkazilgan zarar (qarzdorlik) " + formatMoney(d.claimAmount) + "ni tashkil etadi."
          ]
        },
        {
          title: "2. QAT'IY TALAB",
          paragraphs: [
            "Mazkur talabnoma olingan kundan boshlab 15 kun ichida ko‘rsatilgan summani qoplashingizni talab qilamiz, aks holda iqtisodiy sudga da'vo arizasi kiritiladi."
          ]
        }
      ],
      signatures: [
        { role: "Bosh direktor", name: cleanField(d.claimantOrg, "Rahbar") }
      ]
  })`
});

// 80. Shartnomani bekor qilish to‘g‘risida xat
templatesPart4.push({
  id: 80,
  name: "Shartnomani bekor qilish to‘g‘risida xat",
  icon: "ri-mail-close-line",
  category: "Tadbirkorlik",
  desc: "Sherik yoki mijozga shartnomani bekor qilish to‘g‘risida rasmiy bildirishnoma xati",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 382, 384-moddalari",
  disclaimer: "Xat buyurtma pochta orqali yoki elektron hujjat aylanish tizimi orqali yuborilishi kerak.",
  fields: [
    { key: "recipient", label: "Qabul qiluvchi korxona", type: "text", placeholder: "«Almashuv Savdo» MChJ rahbariyatiga", required: true },
    { key: "sender", label: "Yuboruvchi korxona", type: "text", placeholder: "«Modern Logistics» MChJ", required: true },
    { key: "contractNumberDate", label: "Shartnoma sanasi va raqami", type: "text", placeholder: "2025-yil 1-martdagi 15-sonli shartnoma", required: true },
    { key: "reason", label: "Bekor qilish sababi", type: "textarea", placeholder: "Shartnoma muddatining tugashi va xizmatlarga ehtiyoj qolmaganligi munosabati bilan...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "SHARTNOMANI BEKOR QILISH TO‘G‘RISIDA BILDIRISHNOMA",
      city: "Rasmiy xat",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.recipient, "Qabul qiluvchi") + "\\nKimdan: " + cleanField(d.sender, "Yuboruvchi"),
      sections: [
        {
          title: "1. SHARTNOMANI BEKOR QILISH BILDIRISHNOMASI",
          paragraphs: [
            "Taraflar o‘rtasida tuzilgan " + cleanField(d.contractNumberDate, "Shartnoma") + "ni quyidagi sabablarga ko‘ra bekor qilishimizni ma'lum qilamiz:",
            cleanField(d.reason, "Bekor qilish sabablari."),
            "O‘zaro yakuniy hisob-kitoblarni amalga oshirish uchun solishtirma dalolatnoma tuzishni taklif etamiz."
          ]
        }
      ],
      signatures: [
        { role: "Direktor", name: cleanField(d.sender, "Rahbar") }
      ]
  })`
});

// 81. Qarzdorlikni undirish to‘g‘risida talabnoma
templatesPart4.push({
  id: 81,
  name: "Qarzdorlikni undirish to‘g‘risida talabnoma",
  icon: "ri-coins-fill",
  category: "Tadbirkorlik",
  desc: "B2B shartnomalari bo‘yicha to‘lanmagan asosiy qarz va penyalarni undirish talabnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 236, 327-moddalari",
  disclaimer: "Qarzdorlik muddati 3 yildan (umumiy da'vo muddati) oshmasligi lozim.",
  fields: [
    { key: "debtor", label: "Qarzdor tashkilot", type: "text", placeholder: "«Qurilish Invest» MChJ", required: true },
    { key: "creditor", label: "Kreditor tashkilot", type: "text", placeholder: "«Metall Prokat» MChJ", required: true },
    { key: "sum", label: "Qarz summasi (so‘m)", type: "number", placeholder: "56000000", required: true },
    { key: "invoiceInfo", label: "Qarzdorlikni tasdiqlovchi hujjatlar", type: "text", placeholder: "2025-yil oktyabr oyidagi hisobvaraq-fakturalar", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "SHARTNOMAVIY QARZDORLIKNI TO‘LASH TALABNOMASI",
      city: "Tijorat talabnomasi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.debtor, "Qarzdor") + "ga\\nKimdan: " + cleanField(d.creditor, "Kreditor"),
      sections: [
        {
          title: "1. QARZDORLIK ASOSI VA SUMMASI",
          paragraphs: [
            cleanField(d.invoiceInfo, "Hujjatlar") + " asosida tashkilotingizning qarzdorligi " + formatMoney(d.sum) + "ni tashkil etmoqda.",
            "FK 236-moddasiga ko‘ra majburiyatlar shartnomada belgilangan muddatda to‘liq bajarilishi shart."
          ]
        },
        {
          title: "2. TALAB",
          paragraphs: [
            "Ushbu xat tushgan kundan e'tiboran 7 bank kuni ichida qarzdorlikni to‘liq qoplashingizni talab qilamiz."
          ]
        }
      ],
      signatures: [
        { role: "Bosh direktor", name: cleanField(d.creditor, "Rahbar") }
      ]
  })`
});

// 82. Tadbirkorlik subyekti nomidan ariza
templatesPart4.push({
  id: 82,
  name: "Tadbirkorlik subyekti nomidan ariza",
  icon: "ri-building-line",
  category: "Tadbirkorlik",
  desc: "Yuridik shaxs yoki YaTT nomidan davlat idoralariga imtiyoz, litsenziya yoki amaliy yordam so‘rab yo‘llangan rasmiy ariza",
  legalBasis: "«Tadbirkorlik faoliyati erkinligining kafolatlari to‘g‘risida»gi Qonun",
  disclaimer: "Tashkilotning rasmiy blankasida chiqarilishi va ijrochi telefoni ko‘rsatilishi tavsiya etiladi.",
  fields: [
    { key: "agency", label: "Davlat idorasi nomi", type: "text", placeholder: "Toshkent shahar Bojxona boshqarmasiga", required: true },
    { key: "company", label: "Tadbirkorlik subyekti nomi va STIR", type: "text", placeholder: "«Innovatsion Ishlab Chiqarish» MChJ, STIR: 301234567", required: true },
    { key: "requestText", label: "Ariza/Talab mazmuni", type: "textarea", placeholder: "O‘zbekiston Respublikasi Prezidentining qaroriga asosan bojxona imtiyozlarini qo‘llash masalasida ko‘rib chiqishingizni so‘raymiz...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "TADBIRKORLIK SUBYEKTI ARIZASI",
      city: "Rasmiy blankada",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.agency, "Davlat organi") + "\\nArizachi: " + cleanField(d.company, "Tadbirkorlik subyekti"),
      sections: [
        {
          title: "1. MUROJAATNING MAZMUNI VA HUQUQIY ASOSLARI",
          paragraphs: [
            cleanField(d.requestText, "Murojaat mazmuni."),
            "«Tadbirkorlik faoliyati erkinligining kafolatlari to‘g‘risida»gi Qonunga asosan tadbirkorlik subyektlarining qonuniy manfaatlarini qo‘llab-quvvatlash davlat organlarining asosiy vazifalaridan biridir."
          ]
        }
      ],
      signatures: [
        { role: "Bosh direktor", name: cleanField(d.company, "Rahbar") }
      ]
  })`
});

// 83. Tadbirkorlik subyekti nomidan ishonchnoma
templatesPart4.push({
  id: 83,
  name: "Tadbirkorlik subyekti nomidan ishonchnoma",
  icon: "ri-article-line",
  category: "Tadbirkorlik",
  desc: "Yuridik shaxs xodimiga tovar-moddiy boyliklarni olish yoki bitimlar tuzish uchun korxona ishonchnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 134, 138-moddalari",
  disclaimer: "Korxona rahbari va bosh buxgalteri imzosi hamda muhr (agar mavjud bo‘lsa) bilan tasdiqlanadi.",
  fields: [
    { key: "city", label: "Shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "company", label: "Korxona to‘liq nomi va STIR", type: "text", placeholder: "«Universal Logistika» MChJ, STIR: 308765432", required: true },
    { key: "employee", label: "Xodim (Vakil) F.I.Sh. va lavozimi", type: "text", placeholder: "Ta'minot bo‘limi mudiri Xakimov Sardor Erkinovich", required: true },
    { key: "employeePassport", label: "Xodim pasport/ID ma'lumotlari", type: "text", placeholder: "AA 9988776, 12.03.2021 da berilgan", required: true },
    { key: "powers", label: "Berilayotgan vakolatlar doirasi", type: "textarea", placeholder: "«O‘zbekiston Temir Yo‘llari» AJdan korxonamiz nomiga kelgan yuklarni qabul qilib olish va yuk xatlariga imzo chekish...", required: true },
    { key: "term", label: "Amal qilish muddati", type: "text", placeholder: "1 (bir) oy muddatga", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "KORXONA ISHONCHNOMASI",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.company, "Korxona nomi") + " nomidan xodim " + cleanField(d.employee, "Xodim F.I.Sh.") + " (pasport/ID: " + cleanField(d.employeePassport, "Pasport") + ")ga quyidagi vakolatlar berildi:",
      sections: [
        {
          title: "1. VAKOLATNING TAVSIFI",
          paragraphs: [
            cleanField(d.powers, "Vakolatlar."),
            "Ishonchnoma " + cleanField(d.term, "Belgilangan muddat") + " davomida amal qiladi. Boshqa shaxsga o‘tkazish huquqisiz."
          ]
        }
      ],
      signatures: [
        { role: "Bosh direktor", name: cleanField(d.company, "Rahbar F.I.Sh.") },
        { role: "Ishonchnoma olgan xodim", name: cleanField(d.employee, "F.I.Sh.") }
      ]
  })`
});
