// Part 3: Templates 21 to 46 (Categories: Umumiy arizalar, Sud hujjatlari, Qarzdorlik va pul)

export const templatesPart3 = [];

// =========================================================================
// CATEGORY 3: UMUMIY ARIZALAR (Templates 21-30)
// =========================================================================

// 21. Umumiy ariza
templatesPart3.push({
  id: 21,
  name: "Umumiy ariza",
  icon: "ri-file-text-line",
  category: "Umumiy arizalar",
  desc: "Davlat va nodavlat tashkilotlariga har qanday qonuniy masala bo‘yicha umumiy murojaat arizasi",
  legalBasis: "O‘zbekiston Respublikasining «Jismoniy va yuridik shaxslarning murojaatlari to‘g‘risida»gi Qonuni",
  disclaimer: "Ariza tashkilotning rasmiy devonxonasiga topshirilishi yoki pochta/elektron hukumat portali orqali yuborilishi mumkin.",
  fields: [
    { key: "recipientOrg", label: "Tashkilot/Idora nomi", type: "text", placeholder: "Toshkent shahar Mirzo Ulug‘bek tumani hokimligiga", required: true },
    { key: "recipientOfficial", label: "Mansabdor shaxs lavozimi va F.I.Sh. (ixtiyoriy)", type: "text", placeholder: "Tuman hokimi B. Rahimovga" },
    { key: "applicantName", label: "Ariza beruvchi F.I.Sh.", type: "text", placeholder: "Karimov Sherzod Alisherovich", required: true },
    { key: "applicantPassport", label: "Pasport/ID ma'lumotlari", type: "text", placeholder: "AA 1234567, 10.04.2021 da berilgan", required: true },
    { key: "applicantAddress", label: "Yashash manzili", type: "text", placeholder: "Toshkent sh., Mirzo Ulug‘bek tumani, Mustaqillik ko‘chasi, 15-uy", required: true },
    { key: "applicantPhone", label: "Telefon raqami", type: "text", placeholder: "+998 90 123 45 67", required: true },
    { key: "subject", label: "Ariza mavzusi/mazmuni", type: "textarea", placeholder: "Turar joy hududidagi obodonlashtirish masalasi bo‘yicha amaliy yordam berishingizni so‘rayman...", required: true },
    { key: "requests", label: "Talab yoki iltimos", type: "textarea", placeholder: "Ko‘rsatilgan masalani qonunda belgilangan muddatda o‘rganib chiqib, tegishli choralar ko‘rishingizni va natijasi haqida yozma xabar berishingizni so‘rayman.", required: true },
    { key: "enclosures", label: "Ilova qilinayotgan hujjatlar (agar bo‘lsa)", type: "textarea", placeholder: "1. Pasport nusxasi.\n2. Fotolavhalar (2 varaq)." },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "ARIZA",
      city: "Murojaat manzili",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.recipientOrg, "Tegishli davlat organi yoki tashkilotiga") + "\\n" + (d.recipientOfficial ? cleanField(d.recipientOfficial, "") + "\\n" : "") + "Murojaatchi: " + cleanField(d.applicantName, "Ariza beruvchi F.I.Sh.") + "\\nPasport/ID: " + cleanField(d.applicantPassport, "Pasport ma'lumotlari") + "\\nManzil: " + cleanField(d.applicantAddress, "Yashash manzili") + "\\nTelefon: " + cleanField(d.applicantPhone, "+998 -- --- -- --"),
      sections: [
        {
          title: "1. MUROJAAT MAZMUNI VA HOLAT",
          paragraphs: [
            cleanField(d.subject, "Murojaatning batafsil holati va tavsifi bayon etiladi."),
            "O‘zbekiston Respublikasining «Jismoniy va yuridik shaxslarning murojaatlari to‘g‘risida»gi Qonuni talablariga muvofiq, har bir fuqaro davlat organlariga, muassasalarga yoki jamoat birlashmalariga ariza, taklif va shikoyat bilan murojaat qilish huquqiga ega."
          ]
        },
        {
          title: "2. ILTIMOS VA TALAB",
          paragraphs: [
            cleanField(d.requests, "Yuqoridagilardan kelib chiqib, mazkur arizamni qonunda belgilangan muddatlarda ko‘rib chiqishingizni hamda natijasi bo‘yicha yozma javob taqdim etishingizni so‘rayman.")
          ]
        },
        {
          title: "3. ILOVALAR",
          paragraphs: [
            cleanField(d.enclosures, "1. Ariza beruvchi shaxsini tasdiqlovchi hujjat nusxasi.")
          ]
        }
      ],
      signatures: [
        { role: "Ariza beruvchi", name: cleanField(d.applicantName, "F.I.Sh.") }
      ]
  })`
});

// 22. Shikoyat arizasi
templatesPart3.push({
  id: 22,
  name: "Shikoyat arizasi",
  icon: "ri-error-warning-line",
  category: "Umumiy arizalar",
  desc: "Mansabdor shaxslarning noqonuniy xatti-harakatlari yoki harakatsizligi ustidan yuqori turuvchi organga shikoyat",
  legalBasis: "«Jismoniy va yuridik shaxslarning murojaatlari to‘g‘risida»gi Qonun 18–25-moddalari",
  disclaimer: "Shikoyat yuborilayotgan idora mansabdor shaxsning bevosita yuqori turuvchi rahbariyatiga yoki nazorat qiluvchi organga qaratilishi lozim.",
  fields: [
    { key: "authorityName", label: "Shikoyat yo‘llanayotgan yuqori idora", type: "text", placeholder: "Toshkent shahar Adliya boshqarmasiga", required: true },
    { key: "applicantName", label: "Shikoyat beruvchi F.I.Sh.", type: "text", placeholder: "Nazarov Elyor Bahromovich", required: true },
    { key: "applicantPassport", label: "Pasport/ID ma'lumotlari", type: "text", placeholder: "AB 5544332", required: true },
    { key: "applicantAddress", label: "Manzili", type: "text", placeholder: "Toshkent sh., Olmazor tumani, 5-mavze, 10-uy", required: true },
    { key: "applicantPhone", label: "Telefoni", type: "text", placeholder: "+998 97 123 45 67", required: true },
    { key: "respondentOfficial", label: "Hatti-harakati shikoyat qilinayotgan shaxs/idora", type: "text", placeholder: "Olmazor tumani gaz ta'minoti bo‘limi mansabdor shaxslari", required: true },
    { key: "violationFacts", label: "Qonunbuzarlik va huquqlarning buzilishi holatlari", type: "textarea", placeholder: "2026-yil 10-yanvar kuni asossiz ravishda xizmat ko‘rsatish to‘xtatildi va murojaatimga muddatida javob berilmadi...", required: true },
    { key: "demands", label: "Talablar", type: "textarea", placeholder: "Mansabdor shaxslarning harakatlarini qonunga xilof deb topish hamda buzilgan huquqlarimni tiklash...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "SHIKOYAT ARIZASI",
      city: "Shikoyat kiritish manzili",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.authorityName, "Yuqori turuvchi nazorat organiga") + "\\nShikoyat qiluvchi: " + cleanField(d.applicantName, "F.I.Sh.") + "\\nPasport/ID: " + cleanField(d.applicantPassport, "Pasport") + "\\nManzil: " + cleanField(d.applicantAddress, "Manzil") + "\\nTelefon: " + cleanField(d.applicantPhone, "Telefon") + "\\nUstidan shikoyat qilinayotgan: " + cleanField(d.respondentOfficial, "Mansabdor shaxs yoki idora"),
      sections: [
        {
          title: "1. ISHNING AMALIY HOLATI VA QONUNBUZARLIK",
          paragraphs: [
            cleanField(d.violationFacts, "Shikoyat qilinayotgan mansabdor shaxsning noqonuniy xatti-harakatlari yoki asossiz harakatsizligi bayon etiladi."),
            "O‘zbekiston Respublikasining «Jismoniy va yuridik shaxslarning murojaatlari to‘g‘risida»gi Qonuniga muvofiq, fuqarolarning murojaatlarini qonunga xilof ravishda ko‘rmasdan qoldirish, asossiz rad etish yoki muddatlarini buzish qonunbuzarlik hisoblanadi."
          ]
        },
        {
          title: "2. TALAB VA ILTIMOSLAR",
          paragraphs: [
            cleanField(d.demands, "1. Mazkur holat yuzasidan xizmat tekshiruvi o‘tkazilishini;\\n2. Mansabdor shaxslarning noqonuniy xatti-harakatlariga chek qo‘yilib, buzilgan qonuniy huquqlarim tiklanishini ta'minlashingizni so‘rayman.")
          ]
        }
      ],
      signatures: [
        { role: "Shikoyat beruvchi", name: cleanField(d.applicantName, "F.I.Sh.") }
      ]
  })`
});

// 23. Davlat organiga murojaat
templatesPart3.push({
  id: 23,
  name: "Davlat organiga murojaat",
  icon: "ri-government-line",
  category: "Umumiy arizalar",
  desc: "Vazirliklar, davlat qo‘mitalari, hokimliklar va idoralarga rasmiy murojaat xati",
  legalBasis: "O‘zbekiston Respublikasi Konstitutsiyasi 40-moddasi, «Murojaatlar to‘g‘risida»gi Qonun",
  disclaimer: "Murojaatda keltirilgan vajlar asoslantirilgan bo‘lishi va aloqa ma'lumotlari aniq ko‘rsatilishi shart.",
  fields: [
    { key: "agencyName", label: "Davlat organi to‘liq nomi", type: "text", placeholder: "O‘zbekiston Respublikasi Iqtisodiyot va moliya vazirligiga", required: true },
    { key: "citizenName", label: "Fuqaro F.I.Sh.", type: "text", placeholder: "Sultonov Alisher Akramovich", required: true },
    { key: "passportData", label: "Pasport/ID seriyasi va raqami", type: "text", placeholder: "AA 7890123", required: true },
    { key: "address", label: "Yashash manzili", type: "text", placeholder: "Samarqand sh., Dahbed ko‘chasi, 24-uy", required: true },
    { key: "phone", label: "Telefon raqami", type: "text", placeholder: "+998 91 234 56 78", required: true },
    { key: "proposalContent", label: "Murojaat / taklif / masala mazmuni", type: "textarea", placeholder: "Tadbirkorlik faoliyatini moliyalashtirishdagi amaldagi tartib bo‘yicha tushuntirish va amaliy ko‘mak berishingizni so‘rayman...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "RASMIY MUROJAATNOMA",
      city: "Davlat organiga murojaat",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.agencyName, "Tegishli davlat organiga") + "\\nMurojaat etuvchi: " + cleanField(d.citizenName, "Fuqaro F.I.Sh.") + "\\nPasport/ID: " + cleanField(d.passportData, "Pasport ma'lumotlari") + "\\nDoimiy manzil: " + cleanField(d.address, "Yashash joyi") + "\\nTelefon: " + cleanField(d.phone, "+998 -- --- -- --"),
      sections: [
        {
          title: "1. MASALANING MOHIYATI VA HUQUQIY ASOSLARI",
          paragraphs: [
            cleanField(d.proposalContent, "Davlat organi e'tiboriga havola etilayotgan masala yuzasidan to‘liq ma'lumotlar."),
            "O‘zbekiston Respublikasi Konstitutsiyasining 40-moddasiga asosan, har kim davlat organlariga, tashkilotlarga va jamoat birlashmalariga murojaat qilish huquqiga ega."
          ]
        },
        {
          title: "2. MUROJAATNING YAKUNIY ILTIMOSI",
          paragraphs: [
            "Yuqorida bayon etilganlarni inobatga olib, murojaatimni har tomonlama ko‘rib chiqishingizni hamda qonunchilikda belgilangan 15 kunlik (qo‘shimcha o‘rganish talab etilsa bir oylik) muddat ichida yozma tushuntirish va javob taqdim etishingizni so‘rayman."
          ]
        }
      ],
      signatures: [
        { role: "Murojaat qiluvchi", name: cleanField(d.citizenName, "F.I.Sh.") }
      ]
  })`
});

// 24. Ma’lumot so‘rash to‘g‘risida ariza
templatesPart3.push({
  id: 24,
  name: "Ma’lumot so‘rash to‘g‘risida ariza",
  icon: "ri-information-line",
  category: "Umumiy arizalar",
  desc: "Davlat idoralari va tashkilotlardan rasmiy axborot yoki ma'lumotnoma talab qilish arizasi",
  legalBasis: "«Axborot erkinligi prinsiplari va kafolatlari to‘g‘risida»gi Qonun",
  disclaimer: "Davlat sirlari va qonun bilan qo‘riqlanadigan maxfiy ma'lumotlar bundan mustasno.",
  fields: [
    { key: "targetOrg", label: "Axborot so‘ralayotgan idora", type: "text", placeholder: "Kadastr agentligi tuman bo‘limiga", required: true },
    { key: "applicant", label: "Murojaatchi F.I.Sh.", type: "text", placeholder: "Rahmonov Dilshod Farhodovich", required: true },
    { key: "address", label: "Manzil va telefon", type: "text", placeholder: "Farg‘ona sh., Al-Farg‘oniy ko‘chasi, 12-uy, tel: +998 90 999 88 77", required: true },
    { key: "requestedInfo", label: "So‘ralayotgan ma'lumot tavsifi", type: "textarea", placeholder: "Farg‘ona shahri, Bog‘iston ko‘chasidagi yer maydoniga oid kadastr hujjatlari mavjudligi to‘g‘risidagi rasmiy ma'lumot...", required: true },
    { key: "purpose", label: "Ma'lumot nima maqsadda zarurligi", type: "text", placeholder: "Meros ishini rasmiylashtirish va notariusga taqdim etish uchun" },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "MA’LUMOT VA AXBOROT TAQDIM ETISH TO‘G‘RISIDA ARIZA",
      city: "Rasmiy so‘rov",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.targetOrg, "Idora nomi") + "ga\\nMurojaatchi: " + cleanField(d.applicant, "F.I.Sh.") + "\\nBog‘lanish ma'lumotlari: " + cleanField(d.address, "Manzil va telefon"),
      sections: [
        {
          title: "1. TALAB QILINAYOTGAN MA’LUMOTLAR TAVSIFI",
          paragraphs: [
            "O‘zbekiston Respublikasining «Axborot erkinligi prinsiplari va kafolatlari to‘g‘risida»gi Qonuniga muvofiq, har bir fuqaro davlat organlari faoliyatiga oid axborotni izlash, olish va undan foydalanish huquqiga ega.",
            "Quyidagi axborotni yozma/elektron tarzda taqdim etishingizni so‘rayman: " + cleanField(d.requestedInfo, "So‘ralayotgan ma'lumot mazmuni."),
            "Axborotdan foydalanish maqsadi: " + cleanField(d.purpose, "Qonuniy huquq va manfaatlarni himoya qilish.")
          ]
        }
      ],
      signatures: [
        { role: "Ariza beruvchi", name: cleanField(d.applicant, "F.I.Sh.") }
      ]
  })`
});

// 25. Hujjat nusxasini berish to‘g‘risida ariza
templatesPart3.push({
  id: 25,
  name: "Hujjat nusxasini berish to‘g‘risida ariza",
  icon: "ri-file-copy-line",
  category: "Umumiy arizalar",
  desc: "Arxiv, korxona yoki davlat organlaridan qaror, buyruq yoki arxiv hujjati nusxasini olish",
  legalBasis: "«Arxiv ishi to‘g‘risida»gi Qonun va O‘zbekiston Respublikasi Hukumat qarorlari",
  disclaimer: "Shaxsiy arxiv hujjatlari faqat fuqaroning o‘ziga yoki ishonchnoma asosida vakiliga beriladi.",
  fields: [
    { key: "archiveOrg", label: "Arxiv yoki muassasa nomi", type: "text", placeholder: "Davlat arxivi tuman filialiga", required: true },
    { key: "applicant", label: "Ariza beruvchi F.I.Sh.", type: "text", placeholder: "Usmonov Komil O‘ktamovich", required: true },
    { key: "passport", label: "Pasport/ID", type: "text", placeholder: "AA 6543210", required: true },
    { key: "phone", label: "Telefon", type: "text", placeholder: "+998 90 777 66 55", required: true },
    { key: "docDetails", label: "Talab qilinayotgan hujjat rekvizitlari", type: "textarea", placeholder: "1998–2005-yillarda «Paxtasanoat» korxonasida ishlagan davrimdagi ish haqi va ish stajim haqidagi ma'lumotnoma hamda buyruqlardan ko‘chirma...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "HUJJAT NUSXASINI (KO‘CHIRMASINI) TAQDIM ETISH TO‘G‘RISIDA ARIZA",
      city: "Arxivga ariza",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.archiveOrg, "Muassasa nomi") + "ga\\nMurojaatchi: " + cleanField(d.applicant, "F.I.Sh.") + "\\nPasport/ID: " + cleanField(d.passport, "Pasport") + "\\nTelefon: " + cleanField(d.phone, "+998 -- --- -- --"),
      sections: [
        {
          title: "1. HUJJAT MAZMUNI VA ARXIV MA’LUMOTLARI",
          paragraphs: [
            "Menga quyidagi hujjatning tasdiqlangan nusxasi (yoki arxiv ma'lumotnomasi) pensiya tayinlash / huquqiy faktlarni tasdiqlash uchun zarur: ",
            cleanField(d.docDetails, "Talab qilinayotgan hujjat nomi, yillari va tashkilot nomi."),
            "O‘zbekiston Respublikasining «Arxiv ishi to‘g‘risida»gi Qonuniga muvofiq, fuqarolarning ijtimoiy-huquqiy xarakterdagi so‘rovlari arxiv muassasalari tomonidan qonunda belgilangan muddatda bajariladi."
          ]
        }
      ],
      signatures: [
        { role: "Ariza beruvchi", name: cleanField(d.applicant, "F.I.Sh.") }
      ]
  })`
});

// 26. Hujjatni tiklash to‘g‘risida ariza
templatesPart3.push({
  id: 26,
  name: "Hujjatni tiklash to‘g‘risida ariza",
  icon: "ri-refresh-line",
  category: "Umumiy arizalar",
  desc: "Yo‘qolgan, shikastlangan yoki yaroqsiz holga kelgan hujjatning dublikatini berish to‘g‘risida",
  legalBasis: "Tegishli davlat xizmatlari ko‘rsatish bo‘yicha ma'muriy reglamentlar",
  disclaimer: "Dublikat berishda qonun hujjatlarida belgilangan davlat boji yoki yig‘im to‘lanishi mumkin.",
  fields: [
    { key: "authority", label: "Tegishli organ nomi", type: "text", placeholder: "Toshkent shahar FHDY bo‘limiga (yoki Davlat xizmatlari markaziga)", required: true },
    { key: "applicant", label: "Fuqaro F.I.Sh.", type: "text", placeholder: "Hamidov Bobur Davronovich", required: true },
    { key: "address", label: "Manzili va telefoni", type: "text", placeholder: "Toshkent sh., Yashnobod tumani, tel: +998 93 111 22 33", required: true },
    { key: "lostDocName", label: "Yo‘qolgan/shikastlangan hujjat nomi", type: "text", placeholder: "Tug‘ilganlik haqida guvohnoma (yoki diplom)", required: true },
    { key: "circumstances", label: "Hujjat yo‘qolishi yoki yaroqsizlanishi sababi", type: "textarea", placeholder: "Ko‘chish jarayonida yo‘qolgan, barcha qidiruvlar natija bermadi...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "HUJJAT DUBLIKATINI BERISH (TIKLASH) TO‘G‘RISIDA ARIZA",
      city: "Tegishli organ",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.authority, "Vakolatli idoraga") + "\\nFuqaro: " + cleanField(d.applicant, "F.I.Sh.") + "\\nManzil va aloqa: " + cleanField(d.address, "Manzil"),
      sections: [
        {
          title: "1. HOLATNING BAYONI",
          paragraphs: [
            "Menga tegishli bo‘lgan " + cleanField(d.lostDocName, "Hujjat nomi") + " yo‘qolganligi sababli undan foydalanish imkoniyati mavjud emas.",
            "Yo‘qolish/shikastlanish holati: " + cleanField(d.circumstances, "Holat tafsilotlari."),
            "Yuqoridagilarni inobatga olib, qonunchilikda belgilangan tartibda ushbu hujjatning dublikatini (takroriy nusxasini) berishingizni so‘rayman."
          ]
        }
      ],
      signatures: [
        { role: "Ariza beruvchi", name: cleanField(d.applicant, "F.I.Sh.") }
      ]
  })`
});

// 27. Ruxsat berish to‘g‘risida ariza
templatesPart3.push({
  id: 27,
  name: "Ruxsat berish to‘g‘risida ariza",
  icon: "ri-checkbox-circle-line",
  category: "Umumiy arizalar",
  desc: "Muayyan faoliyat, qurilish yoki maxsus harakatlarni amalga oshirishga ruxsatnoma so‘rash",
  legalBasis: "O‘zbekiston Respublikasining «Litsenziyalash, ruxsat berish va xabardor qilish tartib-taomillari to‘g‘risida»gi Qonuni",
  disclaimer: "Arizaga tegishli normativ talablarda ko‘rsatilgan qo‘shimcha hujjatlar ilova qilinishi shart.",
  fields: [
    { key: "recipient", label: "Ruxsat beruvchi organ", type: "text", placeholder: "Toshkent shahar Qurilish va uy-joy kommunal xo‘jaligi bosh boshqarmasiga", required: true },
    { key: "applicant", label: "Murojaat qiluvchi (fuqaro yoki yuridik shaxs)", type: "text", placeholder: "«Imkon Qurilish» MChJ nomidan direktor A. Jo‘rayev", required: true },
    { key: "address", label: "Manzil va telefon", type: "text", placeholder: "Toshkent sh., Shayxontohur tumani, tel: +998 90 321 00 00", required: true },
    { key: "activityDesc", label: "Ruxsat so‘ralayotgan faoliyat yoki harakat", type: "textarea", placeholder: "Bino fasadini qayta ta'mirlash va rekonstruksiya qilish ishlarini olib borishga ruxsat berishingizni so‘rayman...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "RUXSATNOMA BERISH TO‘G‘RISIDA ARIZA",
      city: "Vakolatli idora",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.recipient, "Vakolatli organga") + "\\nArizachi: " + cleanField(d.applicant, "F.I.Sh. yoki tashkilot") + "\\nBog‘lanish: " + cleanField(d.address, "Manzil"),
      sections: [
        {
          title: "1. MASALA BAYONI VA ASOSLAR",
          paragraphs: [
            "O‘zbekiston Respublikasining «Litsenziyalash, ruxsat berish va xabardor qilish tartib-taomillari to‘g‘risida»gi Qonuni normalariga muvofiq, quyidagi harakat/faoliyatni amalga oshirish uchun qonuniy ruxsatnoma berishingizni so‘rayman:",
            cleanField(d.activityDesc, "Faoliyat tavsifi va ob'ekt manzili."),
            "Tegishli shaharsozlik, sanitariya va yong‘in xavfsizligi qoidalariga to‘liq rioya qilish kafolatlanadi."
          ]
        }
      ],
      signatures: [
        { role: "Ariza beruvchi", name: cleanField(d.applicant, "F.I.Sh.") }
      ]
  })`
});

// 28. Ro‘yxatdan o‘tkazish to‘g‘risida ariza
templatesPart3.push({
  id: 28,
  name: "Ro‘yxatdan o‘tkazish to‘g‘risida ariza",
  icon: "ri-archive-line",
  category: "Umumiy arizalar",
  desc: "Mulk, faoliyat turi yoki ob'ektni davlat ro‘yxatidan o‘tkazish arizasi",
  legalBasis: "Davlat ro‘yxatidan o‘tkazish to‘g‘risidagi amaldagi ma'muriy tartib-taomillar",
  disclaimer: "Hujjat loyihasi tegishli vakolatli idoraga qonunda ko‘zda tutilgan tasdiqlovchi hujjatlar bilan birga taqdim etiladi.",
  fields: [
    { key: "registryOrg", label: "Ro‘yxatdan o‘tkazuvchi idora", type: "text", placeholder: "Davlat xizmatlari markaziga", required: true },
    { key: "applicant", label: "Murojaat qiluvchi shaxs", type: "text", placeholder: "Normatov Rustam Shokirovich", required: true },
    { key: "itemToRegister", label: "Ro‘yxatga olinishi lozim bo‘lgan mulk/ob'ekt", type: "textarea", placeholder: "Yakka tartibdagi tadbirkorlik faoliyati (yoki ko‘chmas mulk ob'ekti)", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "DAVLAT RO‘YXATIDAN O‘TKAZISH TO‘G‘RISIDA ARIZA",
      city: "Ro‘yxatga olish idorasi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.registryOrg, "Davlat ro‘yxatidan o‘tkazuvchi organga") + "\\nArizachi: " + cleanField(d.applicant, "Murojaat qiluvchi"),
      sections: [
        {
          title: "1. RO‘YXATGA OLISH MAQSADI",
          paragraphs: [
            "O‘zbekiston Respublikasi qonunchiligida belgilangan tartibda quyidagi ob'ekt/faoliyatni davlat ro‘yxatidan o‘tkazishingizni hamda tegishli guvohnoma (reyestrdan ko‘chirma) berishingizni so‘rayman: ",
            cleanField(d.itemToRegister, "Ro‘yxatga olinadigan ob'ekt ma'lumotlari.")
          ]
        }
      ],
      signatures: [
        { role: "Ariza beruvchi", name: cleanField(d.applicant, "F.I.Sh.") }
      ]
  })`
});

// 29. Davlat xizmatidan foydalanish bo‘yicha ariza
templatesPart3.push({
  id: 29,
  name: "Davlat xizmatidan foydalanish bo‘yicha ariza",
  icon: "ri-customer-service-line",
  category: "Umumiy arizalar",
  desc: "Davlat xizmatlari markazi yoki Yagona interaktiv davlat xizmatlari portali (my.gov.uz) orqali ariza",
  legalBasis: "O‘zbekiston Respublikasi Vazirlar Mahkamasining davlat xizmatlari ko‘rsatish reglamentlari",
  disclaimer: "Elektron ariza my.gov.uz yoki Davlat xizmatlari markaziga shaxsan topshiriladi.",
  fields: [
    { key: "serviceName", label: "Davlat xizmati nomi", type: "text", placeholder: "Farzandni maktabgacha ta'lim tashkilotiga navbatga qo‘yish", required: true },
    { key: "applicantName", label: "Ariza beruvchi F.I.Sh.", type: "text", placeholder: "Xolmatova Nilufar Olimovna", required: true },
    { key: "details", label: "Xizmat uchun zarur ma'lumotlar", type: "textarea", placeholder: "Farzandim Xolmatov Amir Temur o‘g‘li (2022-yilda tug‘ilgan) uchun 45-sonli MTTga yo‘llanma berishingizni so‘rayman...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "DAVLAT XIZMATI KO‘RSATISH TO‘G‘RISIDA ARIZA",
      city: "Davlat xizmatlari markaziga",
      date: formatUzbekDate(d.date),
      preamble: "Davlat xizmatlari markaziga (yoki Yagona portal orqali)\\nArizachi: " + cleanField(d.applicantName, "F.I.Sh."),
      sections: [
        {
          title: "1. XIZMAT TURI VA TALAB",
          paragraphs: [
            "Davlat xizmati nomi: " + cleanField(d.serviceName, "Davlat xizmati"),
            cleanField(d.details, "Xizmatdan foydalanish uchun zarur holatlar va asoslar."),
            "Davlat xizmatlari ko‘rsatish bo‘yicha ma'muriy reglamentga muvofiq, ushbu xizmatni ko‘rsatishingizni so‘rayman."
          ]
        }
      ],
      signatures: [
        { role: "Ariza beruvchi", name: cleanField(d.applicantName, "F.I.Sh.") }
      ]
  })`
});

// 30. Tushuntirish xati
templatesPart3.push({
  id: 30,
  name: "Tushuntirish xati",
  icon: "ri-chat-check-line",
  category: "Umumiy arizalar",
  desc: "Ish beruvchiga, o‘quv muassasasiga yoki davlat organiga yuzaga kelgan holat bo‘yicha rasmiy tushuntirish",
  legalBasis: "O‘zbekiston Respublikasi Mehnat kodeksi 313-moddasi",
  disclaimer: "Intizomiy chora qo‘llashdan oldin xodimdan tushuntirish xati talab qilinishi qonuniy majburiyatdir.",
  fields: [
    { key: "recipient", label: "Kimning nomiga (Rahbar lavozimi va tashkilot)", type: "text", placeholder: "«O‘zbekiston Temir Yo‘llari» AJ boshqaruv raisiga", required: true },
    { key: "author", label: "Tushuntirish beruvchi xodim F.I.Sh. va lavozimi", type: "text", placeholder: "Muhandis Qodirov Akmal Vohidovich", required: true },
    { key: "incidentDate", label: "Hodisa sodir bo‘lgan sana/vaqt", type: "text", placeholder: "2026-yil 12-fevral soat 09:30 da" },
    { key: "reason", label: "Holatning batafsil sababi va dalillar", type: "textarea", placeholder: "Kutilmaganda jamoat transportida yuzaga kelgan texnik nosozlik sababli ishga 30 daqiqa kechikib keldim. Buni tasdiqlovchi ma'lumot ilova qilinadi...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "TUSHUNTIRISH XATI",
      city: "Tashkilot bo‘yicha",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.recipient, "Rahbar lavozimi va tashkilot") + "ga\\nXodim: " + cleanField(d.author, "Xodim F.I.Sh. va lavozimi"),
      sections: [
        {
          title: "1. SODIR BO‘LGAN VOQEA VA SABABLAR",
          paragraphs: [
            (d.incidentDate ? "Holat vaqti: " + cleanField(d.incidentDate, "") + ".\\n" : "") + cleanField(d.reason, "Holat va sabablar batafsil yoritiladi."),
            "Ushbu holat uzrli sabablarga ko‘ra yuzaga kelgan bo‘lib, kelgusida mehnat intizomi va ichki tartib-qoidalariga qat'iy amal qilishimni ma'lum qilaman."
          ]
        }
      ],
      signatures: [
        { role: "Xodim", name: cleanField(d.author, "F.I.Sh.") }
      ]
  })`
});


// =========================================================================
// CATEGORY 4: SUD HUJJATLARI (Templates 31-40)
// =========================================================================

// 31. Da’vo arizasi (Umumiy Fuqarolik ishlari bo‘yicha)
templatesPart3.push({
  id: 31,
  name: "Da’vo arizasi",
  icon: "ri-scales-3-line",
  category: "Sud hujjatlari",
  desc: "O‘zbekiston Respublikasi Fuqarolik protsessual kodeksining 189–191-moddalari talablariga mos umumiy da’vo arizasi",
  legalBasis: "O‘zbekiston Respublikasi FPK 189–191-moddalari",
  disclaimer: "Da'vo arizasiga davlat boji to‘langanligi to‘g‘risidagi kvitansiya va ish holatlarini tasdiqlovchi barcha dalillar ilova qilinishi shart.",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha Shayxontohur tumanlararo sudiga", required: true },
    { key: "claimantName", label: "Da'vogar F.I.Sh.", type: "text", placeholder: "Valiyev Jamshid Anvarovich", required: true },
    { key: "claimantAddress", label: "Da'vogar manzili va telefoni", type: "text", placeholder: "Toshkent sh., Shayxontohur tumani, 1-mavze, 5-uy, tel: +998 90 111 22 33", required: true },
    { key: "defendantName", label: "Javobgar F.I.Sh. yoki tashkilot", type: "text", placeholder: "Qosimov Bobur Murodovich", required: true },
    { key: "defendantAddress", label: "Javobgar manzili va telefoni", type: "text", placeholder: "Toshkent sh., Yunusobod tumani, 12-uy, tel: +998 93 444 55 66", required: true },
    { key: "claimPrice", label: "Da'vo bahosi (so‘m, agar baholanadigan bo‘lsa)", type: "number", placeholder: "15000000" },
    { key: "facts", label: "Da'voning asoslari va faktik holatlar", type: "textarea", placeholder: "Javobgar bilan o‘rtamizda kelishuv bo‘lgan, biroq u o‘z majburiyatlarini qasddan bajarmasdan kelmoqda...", required: true },
    { key: "legalArticles", label: "Huquqiy asoslar (moddalar)", type: "text", placeholder: "O‘zbekiston Respublikasi FK 236, 333-moddalari, FPK 189-moddasi" },
    { key: "pleadings", label: "Suddan so‘ralayotgan talablar", type: "textarea", placeholder: "1. Javobgardan da'vogar foydasiga 15 000 000 so‘m undirilsin.\n2. To‘langan davlat boji javobgar zimmasiga yuklatilsin.", required: true },
    { key: "enclosures", label: "Ilova qilinayotgan hujjatlar ro‘yxati", type: "textarea", placeholder: "1. Da'vo arizasi nusxasi (javobgar uchun).\n2. Davlat boji to‘langani haqida kvitansiya.\n3. Shartnoma va yozishmalar nusxasi.", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "DA’VO ARIZASI",
      city: "Fuqarolik sudi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Fuqarolik ishlari bo‘yicha sudiga") + "\\n" +
        "Da'vogar: " + cleanField(d.claimantName, "Da'vogar F.I.Sh.") + "\\n" +
        "Yashash manzili va aloqa: " + cleanField(d.claimantAddress, "Manzil va telefon") + "\\n" +
        "Javobgar: " + cleanField(d.defendantName, "Javobgar F.I.Sh. / Tashkilot") + "\\n" +
        "Manzili: " + cleanField(d.defendantAddress, "Javobgar manzili") + "\\n" +
        (d.claimPrice ? "Da'vo bahosi: " + formatMoney(d.claimPrice) + "\\n" : ""),
      sections: [
        {
          title: "1. NIZONING KELIB CHIQISHI VA ISHNING HOLATLARI",
          paragraphs: [
            cleanField(d.facts, "Da'vogarning huquqlari buzilishiga oid holatlar, sanalar va dalillar to‘liq bayon etiladi."),
            "O‘zbekiston Respublikasi Fuqarolik kodeksining 236-moddasiga binoan, majburiyatlar shartnoma shartlariga va qonunchilik talablariga muvofiq lozim darajada bajarilishi lozim."
          ]
        },
        {
          title: "2. HUQUQIY ASOSLAR",
          paragraphs: [
            cleanField(d.legalArticles, "O‘zbekiston Respublikasi Fuqarolik kodeksi va FPK 189–191-moddalari talablari asosida ushbu da'vo kiritilmoqda.")
          ]
        },
        {
          title: "3. DA’VO TALABI",
          paragraphs: [
            "Yuqoridagilarga asosan hamda O‘zbekiston Respublikasi Fuqarolik protsessual kodeksining 189, 190, 191-moddalariga tayangan holda, SUDDAN SO‘RAYMAN:",
            cleanField(d.pleadings, "Sud qarori bilan hal qilinishi lozim bo‘lgan aniq talablar.")
          ]
        },
        {
          title: "4. ILOVA QILINAYOTGAN HUJJATLAR",
          paragraphs: [
            cleanField(d.enclosures, "1. Da'vo arizasi nusxasi.\\n2. Davlat boji to‘langanligi haqida kvitansiya.\\n3. Da'voni tasdiqlovchi dalillar to‘plami.")
          ]
        }
      ],
      signatures: [
        { role: "Da'vogar", name: cleanField(d.claimantName, "F.I.Sh.") }
      ]
  })`
});

// 32. Qarzdorlikni undirish to‘g‘risida da’vo arizasi
templatesPart3.push({
  id: 32,
  name: "Qarzdorlikni undirish to‘g‘risida da’vo arizasi",
  icon: "ri-money-dollar-circle-line",
  category: "Sud hujjatlari",
  desc: "Qarz shartnomasi yoki tilxat bo‘yicha qaytarilmagan pul mablag‘larini sud orqali majburiy undirish da’vosi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 732–739-moddalari, FPK 189-moddasi",
  disclaimer: "Qarz tilxati asil nusxasi sud majlisida ko‘rib chiqish uchun taqdim etilishi lozim.",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha Mirzo Ulug‘bek tumanlararo sudiga", required: true },
    { key: "lenderName", label: "Qarz beruvchi (Da'vogar) F.I.Sh.", type: "text", placeholder: "Samadov Jamshid Yoqubovich", required: true },
    { key: "lenderAddress", label: "Da'vogar manzili va tel.", type: "text", placeholder: "Toshkent sh., Mirzo Ulug‘bek tumani, tel: +998 90 222 33 44", required: true },
    { key: "borrowerName", label: "Qarz oluvchi (Javobgar) F.I.Sh.", type: "text", placeholder: "Toirov Rustam Karimovich", required: true },
    { key: "borrowerAddress", label: "Javobgar manzili va tel.", type: "text", placeholder: "Toshkent sh., Chilonzor tumani, tel: +998 94 555 66 77", required: true },
    { key: "loanAmount", label: "Qarz summasi (so‘m)", type: "number", placeholder: "25000000", required: true },
    { key: "loanDate", label: "Qarz berilgan sana", type: "date", required: true },
    { key: "returnDeadline", label: "Qarz qaytarilishi kerak bo‘lgan sana", type: "date", required: true },
    { key: "hasReceipt", label: "Tilxat mavjudligi", type: "text", placeholder: "Javobgar tomonidan 2025-yil 1-mayda o‘z qo‘li bilan yozib berilgan tilxat mavjud" },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "QARZ MABLAG‘LARINI UNDIRISH TO‘G‘RISIDA DA’VO ARIZASI",
      city: "Fuqarolik ishlari bo‘yicha sud",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Fuqarolik ishlari bo‘yicha sudiga") + "\\n" +
        "Da'vogar: " + cleanField(d.lenderName, "Da'vogar F.I.Sh.") + "\\nManzil va aloqa: " + cleanField(d.lenderAddress, "Manzil") + "\\n" +
        "Javobgar: " + cleanField(d.borrowerName, "Javobgar F.I.Sh.") + "\\nManzil va aloqa: " + cleanField(d.borrowerAddress, "Manzil") + "\\n" +
        "Da'vo bahosi: " + formatMoney(d.loanAmount),
      sections: [
        {
          title: "1. QARZ MUNOSABATLARI VA QARZDORLIK KELIB CHIQISHI",
          paragraphs: [
            formatUzbekDate(d.loanDate) + " kuni Da'vogar tomonidan Javobgar " + cleanField(d.borrowerName, "Javobgar") + "ga " + formatMoney(d.loanAmount) + " miqdorida qarz berilgan.",
            "Qarzni qaytarish muddati: " + formatUzbekDate(d.returnDeadline) + " etib belgilangan edi. " + cleanField(d.hasReceipt, "Ushbu holat bo‘yicha yozma tilxat mavjud."),
            "Biroq, qarzni qaytarish muddati o‘tib ketgan bo‘lsa-da, Javobgar qarzni ixtiyoriy ravishda qaytarmasdan, majburiyatlarini buzib kelmoqda. Da'vogarning og‘zaki va yozma talablari natijasiz qoldi."
          ]
        },
        {
          title: "2. HUQUQIY ASOSLAR",
          paragraphs: [
            "O‘zbekiston Respublikasi Fuqarolik kodeksining 732-moddasiga muvofiq, qarz shartnomasi bo‘yicha bir taraf (qarz beruvchi) ikkinchi tarafga (qarz oluvchiga) pul yoki boshqa ashyolarni mulk qilib beradi, qarz oluvchi esa qarz beruvchiga bir yo‘la yoki bo‘lib-bo‘lib, o‘shancha summadagi pulni yoki qarzga olingan ashyolarning xuddi o‘zicha miqdordagi va turdagi ashyolarni qaytarib berish majburiyatini oladi.",
            "Shuningdek, FK 735-moddasiga ko‘ra, qarz oluvchi olingan qarz summasini qarz shartnomasida nazarda tutilgan muddatda va tartibda qaytarishi shart."
          ]
        },
        {
          title: "3. DA’VO TALABI",
          paragraphs: [
            "Yuqoridagilardan kelib chiqib, O‘zbekiston Respublikasi Fuqarolik protsessual kodeksining 189–191-moddalariga asosan SUDDAN SO‘RAYMAN:",
            "1. Javobgar " + cleanField(d.borrowerName, "Javobgar F.I.Sh.") + "dan Da'vogar " + cleanField(d.lenderName, "Da'vogar F.I.Sh.") + " foydasiga " + formatMoney(d.loanAmount) + " asosiy qarz summasi undirilsin.",
            "2. Da'vogar tomonidan to‘langan davlat boji va pochta xarajatlari javobgar hisobidan qoplansin."
          ]
        },
        {
          title: "4. ILOVALAR",
          paragraphs: [
            "1. Da'vo arizasi nusxasi (javobgar uchun).\\n2. Davlat boji to‘langanligi to‘g‘risida to‘lov hujjati.\\n3. Qarz tilxati (yoki qarz shartnomasi) nusxasi.\\n4. Talabnoma va pochta kvitansiyasi nusxasi."
          ]
        }
      ],
      signatures: [
        { role: "Da'vogar", name: cleanField(d.lenderName, "F.I.Sh.") }
      ]
  })`
});

// 33. Ish haqi undirish to‘g‘risida da’vo arizasi
templatesPart3.push({
  id: 33,
  name: "Ish haqi undirish to‘g‘risida da’vo arizasi",
  icon: "ri-wallet-3-line",
  category: "Sud hujjatlari",
  desc: "Ish beruvchi tomonidan to‘lanmagan oylik maosh va kompensatsiyalarni sud orqali undirish",
  legalBasis: "O‘zbekiston Respublikasi Mehnat kodeksi 253, 333, 560-moddalari",
  disclaimer: "Xodimlar mehnat nizolari bo‘yicha sudga murojaat qilganda davlat bojidan ozod qilinadilar (Soliq kodeksi 329-moddasi).",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha Yakkasaroy tumanlararo sudiga", required: true },
    { key: "employeeName", label: "Da'vogar (Xodim) F.I.Sh.", type: "text", placeholder: "Mansurov Odil G‘ofurovich", required: true },
    { key: "employeeAddress", label: "Xodim manzili va telefoni", type: "text", placeholder: "Toshkent sh., Yakkasaroy tumani, tel: +998 90 777 11 22", required: true },
    { key: "employerName", label: "Javobgar (Ish beruvchi tashkilot)", type: "text", placeholder: "«Qurilish Dizayn Servis» MChJ", required: true },
    { key: "employerAddress", label: "Ish beruvchi yuridik manzili", type: "text", placeholder: "Toshkent sh., Yakkasaroy tumani, Bobur ko‘chasi, 40-uy", required: true },
    { key: "unpaidSalary", label: "To‘lanmagan ish haqi miqdori (so‘m)", type: "number", placeholder: "14500000", required: true },
    { key: "unpaidPeriod", label: "Qaysi oylar uchun to‘lanmagan", type: "text", placeholder: "2025-yil noyabr, dekabr va 2026-yil yanvar oylari uchun", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "ISH HAQI QARZDORLIGINI UNDIRISH TO‘G‘RISIDA DA’VO ARIZASI",
      city: "Fuqarolik sudi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Fuqarolik ishlari bo‘yicha sudiga") + "\\n" +
        "Da'vogar: " + cleanField(d.employeeName, "Xodim F.I.Sh.") + "\\nManzil va tel: " + cleanField(d.employeeAddress, "Manzil") + "\\n" +
        "Javobgar: " + cleanField(d.employerName, "Ish beruvchi tashkilot") + "\\nManzili: " + cleanField(d.employerAddress, "Manzil") + "\\n" +
        "Da'vo bahosi: " + formatMoney(d.unpaidSalary),
      sections: [
        {
          title: "1. MEHNAT MUNOSABATLARI VA QARZDORLIK HOLATI",
          paragraphs: [
            "Men javobgar tashkilotda mehnat shartnomasi asosida mehnat faoliyatini yuritib keldim.",
            "Biroq, ish beruvchi tomonidan " + cleanField(d.unpaidPeriod, "ko‘rsatilgan davr") + " uchun hisoblangan oylik maoshim to‘lanmasdan kelmoqda. Natijada jami " + formatMoney(d.unpaidSalary) + " miqdorida ish haqi qarzdorligi yuzaga keldi.",
            "Mehnat kodeksining 253-moddasiga ko‘ra, ish beruvchi xodimga tegishli bo‘lgan ish haqini belgilangan muddatlarda to‘lashi shart."
          ]
        },
        {
          title: "2. HUQUQIY ASOS VA DAVLAT BOJIDAN OZODLIK",
          paragraphs: [
            "O‘zbekiston Respublikasi Soliq kodeksining 329-moddasi 1-bandiga binoan, xodimlar mehnat munosabatlaridan kelib chiqadigan da'volar bo‘yicha fuqarolik sudlarida davlat bojini to‘lashdan ozod etilgan."
          ]
        },
        {
          title: "3. DA’VO TALABI",
          paragraphs: [
            "SUDDAN SO‘RAYMAN:",
            "1. Javobgar " + cleanField(d.employerName, "Ish beruvchi") + " hisobidan Da'vogar " + cleanField(d.employeeName, "Xodim") + " foydasiga " + formatMoney(d.unpaidSalary) + " miqdoridagi ish haqi qarzdorligi undirilsin.",
            "2. Ish haqini to‘lash kechiktirilganligi uchun qonuniy kompensatsiya hisoblanib undirilsin."
          ]
        },
        {
          title: "4. ILOVALAR",
          paragraphs: [
            "1. Mehnat shartnomasi nusxasi.\\n2. Ishga qabul qilish to‘g‘risidagi buyruq nusxasi.\\n3. Ish haqi hisoblanganligi haqida ma'lumotnoma (yoki bank kartasi ko‘chirmasi)."
          ]
        }
      ],
      signatures: [
        { role: "Da'vogar (xodim)", name: cleanField(d.employeeName, "F.I.Sh.") }
      ]
  })`
});

// 34. Zararni undirish to‘g‘risida da’vo arizasi
templatesPart3.push({
  id: 34,
  name: "Zararni undirish to‘g‘risida da’vo arizasi",
  icon: "ri-hand-coin-line",
  category: "Sud hujjatlari",
  desc: "Yetkazilgan moddiy yoki ma'naviy zararni qoplash bo‘yicha sudga kiritiladigan da’vo",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 14, 985, 1021-moddalari",
  disclaimer: "Zarar yetkazilganligini tasdiqlovchi dalolatnoma, ekspertiza xulosasi yoki hisob-kitoblar ilova qilinishi kerak.",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha Uchtepa tumanlararo sudiga", required: true },
    { key: "claimantName", label: "Da'vogar F.I.Sh.", type: "text", placeholder: "Shodiyev Sanjar Akromovich", required: true },
    { key: "claimantAddress", label: "Da'vogar manzili", type: "text", placeholder: "Toshkent sh., Uchtepa tumani, tel: +998 90 333 44 55", required: true },
    { key: "defendantName", label: "Javobgar F.I.Sh.", type: "text", placeholder: "Qurbonov Dilmurod Erkinovich", required: true },
    { key: "defendantAddress", label: "Javobgar manzili", type: "text", placeholder: "Toshkent sh., Uchtepa tumani, tel: +998 91 666 77 88", required: true },
    { key: "damageAmount", label: "Moddiy zarar summasi (so‘m)", type: "number", placeholder: "8500000", required: true },
    { key: "incidentFacts", label: "Zarar yetkazilish holati", type: "textarea", placeholder: "Javobgar xonadonidan suv toshishi natijasida pastki qavatda joylashgan da'vogarning xonadoniga jiddiy moddiy zarar yetkazildi...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "YETKAZILGAN ZARARNI UNDIRISH TO‘G‘RISIDA DA’VO ARIZASI",
      city: "Fuqarolik sudi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Sud nomi") + "\\n" +
        "Da'vogar: " + cleanField(d.claimantName, "Da'vogar F.I.Sh.") + "\\nManzili: " + cleanField(d.claimantAddress, "Manzil") + "\\n" +
        "Javobgar: " + cleanField(d.defendantName, "Javobgar F.I.Sh.") + "\\nManzili: " + cleanField(d.defendantAddress, "Manzil") + "\\n" +
        "Da'vo bahosi: " + formatMoney(d.damageAmount),
      sections: [
        {
          title: "1. ZARAR YETKAZILISH HOLATI VA FAKTLAR",
          paragraphs: [
            cleanField(d.incidentFacts, "Zarar yetkazilgan holat, vaqt va yetkazilgan talofatlar bayoni."),
            "O‘zbekiston Respublikasi Fuqarolik kodeksining 985-moddasiga asosan, g‘ayriqonuniy harakat (harakatsizlik) tufayli fuqaroning shaxsiga yoki mol-mulkiga yetkazilgan zarar, shuningdek yuridik shaxsga yetkazilgan zarar uni yetkazgan shaxs tomonidan to‘liq hajmda qoplanishi lozim."
          ]
        },
        {
          title: "2. SUDDAN SO‘RALADIGAN TALAB",
          paragraphs: [
            "SUDDAN SO‘RAYMAN:",
            "1. Javobgar " + cleanField(d.defendantName, "Javobgar") + "dan Da'vogar foydasiga " + formatMoney(d.damageAmount) + " miqdorida yetkazilgan moddiy zarar undirilsin.",
            "2. Sud xarajatlari javobgardan undirilsin."
          ]
        },
        {
          title: "3. ILOVALAR",
          paragraphs: [
            "1. Da'vo arizasi nusxasi.\\n2. Davlat boji to‘langanligi hujjati.\\n3. Zarar yetkazilgani to‘g‘risidagi dalolatnoma.\\n4. Zarar baholash ekspertizasi xulosasi."
          ]
        }
      ],
      signatures: [
        { role: "Da'vogar", name: cleanField(d.claimantName, "F.I.Sh.") }
      ]
  })`
});

// 35. Shartnomani bekor qilish to‘g‘risida da’vo arizasi
templatesPart3.push({
  id: 35,
  name: "Shartnomani bekor qilish to‘g‘risida da’vo arizasi",
  icon: "ri-file-damage-line",
  category: "Sud hujjatlari",
  desc: "Ikkinchi taraf shartnoma shartlarini jiddiy buzgan taqdirda shartnomani sud orqali bekor qilish",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 382–385-moddalari",
  disclaimer: "Sudga murojaat qilishdan oldin ikkinchi tarafga shartnomani bekor qilish haqida rasmiy taklif yuborilgan bo‘lishi shart (FK 384-modda).",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Toshkent tumanlararo iqtisodiy sudiga (yoki Fuqarolik sudiga)", required: true },
    { key: "claimant", label: "Da'vogar nomi / F.I.Sh.", type: "text", placeholder: "«Smart Trade» MChJ", required: true },
    { key: "defendant", label: "Javobgar nomi / F.I.Sh.", type: "text", placeholder: "«Mega Logistika» MChJ", required: true },
    { key: "contractNumberDate", label: "Shartnoma raqami va sanasi", type: "text", placeholder: "2025-yil 15-martdagi 45-sonli yetkazib berish shartnomasi", required: true },
    { key: "breachDetails", label: "Majburiyatlarning qanday buzilganligi", type: "textarea", placeholder: "Javobgar tovarlarni 3 oydan buyon yetkazib bermadi va talabnomalarga javob bermadi...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "SHARTNOMANI BEKOR QILISH TO‘G‘RISIDA DA’VO ARIZASI",
      city: "Iqtisodiy / Fuqarolik sudi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Sud nomi") + "\\n" +
        "Da'vogar: " + cleanField(d.claimant, "Da'vogar") + "\\n" +
        "Javobgar: " + cleanField(d.defendant, "Javobgar"),
      sections: [
        {
          title: "1. SHARTNOMA MAJBURIYATLARI VA ULARNING BUZILISHI",
          paragraphs: [
            "Taraflar o‘rtasida " + cleanField(d.contractNumberDate, "Shartnoma") + " tuzilgan edi.",
            "Javobgar shartnoma shartlarini jiddiy ravishda buzdi: " + cleanField(d.breachDetails, "Buzilgan holatlar bayoni."),
            "O‘zbekiston Respublikasi Fuqarolik kodeksining 382-moddasiga ko‘ra, ikkinchi taraf shartnomani jiddiy ravishda buzgan taqdirda, shartnoma sud qarori bilan bekor qilinishi mumkin."
          ]
        },
        {
          title: "2. SUDDAN SO‘RALADIGAN TALAB",
          paragraphs: [
            "SUDDAN SO‘RAYMAN:",
            "1. Taraflar o‘rtasida tuzilgan " + cleanField(d.contractNumberDate, "shartnoma") + " muddatidan oldin bekor qilinsin.",
            "2. Sud xarajatlari javobgar zimmasiga yuklatilsin."
          ]
        }
      ],
      signatures: [
        { role: "Da'vogar", name: cleanField(d.claimant, "F.I.Sh. / Rahbar") }
      ]
  })`
});

// 36. Ijara shartnomasini bekor qilish va qarzdorlikni undirish da’vosi
templatesPart3.push({
  id: 36,
  name: "Ijara shartnomasini bekor qilish va qarzdorlikni undirish da’vosi",
  icon: "ri-home-cross-line",
  category: "Sud hujjatlari",
  desc: "Ijarachini uydan/ob'ektdan chiqarish, shartnomani bekor qilish va ijara qarzini undirish",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 553, 615-moddalari",
  disclaimer: "Turar joydan chiqarish faqat sudning qonuniy kuchga kirgan hal qiluv qarori asosida MIB orqali amalga oshiriladi.",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha Yunusobod tumanlararo sudiga", required: true },
    { key: "landlord", label: "Ijaraga beruvchi (Da'vogar)", type: "text", placeholder: "Bekmurodov Ilhom Rustamovich", required: true },
    { key: "tenant", label: "Ijarachi (Javobgar)", type: "text", placeholder: "Jo‘rayev Farrux Bahodirovich", required: true },
    { key: "propertyAddress", label: "Uy-joy manzili", type: "text", placeholder: "Toshkent sh., Yunusobod tumani, 19-mavze, 2-uy, 14-xonadon", required: true },
    { key: "debtAmount", label: "To‘lanmagan ijara qarzi (so‘m)", type: "number", placeholder: "9000000", required: true },
    { key: "monthsUnpaid", label: "Qancha vaqtdan buyon to‘lanmayotgani", type: "text", placeholder: "Ketma-ket 3 oydan ortiq vaqt davomida", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "IJARA SHARTNOMASINI BEKOR QILISH, IJARA QARZINI UNDIRISH VA MAJBURIY CHIQARISH HAQIDA DA’VO ARIZASI",
      city: "Fuqarolik sudi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Sud nomi") + "\\n" +
        "Da'vogar: " + cleanField(d.landlord, "Da'vogar") + "\\n" +
        "Javobgar: " + cleanField(d.tenant, "Javobgar") + "\\n" +
        "Da'vo bahosi: " + formatMoney(d.debtAmount),
      sections: [
        {
          title: "1. ISHNING AMALIY HOLATLARI",
          paragraphs: [
            "Da'vogarga tegishli bo‘lgan " + cleanField(d.propertyAddress, "Manzil") + " manzilidagi uy-joy Javobgarga ijaraga berilgan edi.",
            "Biroq, Javobgar " + cleanField(d.monthsUnpaid, "bir necha oy") + " davomida ijara haqini to‘lamasdan kelmoqda va jami " + formatMoney(d.debtAmount) + " miqdorida qarzdorlik hosil bo‘ldi.",
            "FK 615-moddasiga ko‘ra, ijarachi turar joy haqini olti oydan ko‘proq, qisqa muddatli ijarada esa shartnomada belgilangan to‘lov muddatini ketma-ket ikki martadan ortiq buzsa, shartnoma sud orqali bekor qilinishi mumkin."
          ]
        },
        {
          title: "2. SUDDAN SO‘RALADIGAN TALAB",
          paragraphs: [
            "SUDDAN SO‘RAYMAN:",
            "1. Taraflar o‘rtasidagi ijara shartnomasi muddatidan oldin bekor qilinsin.",
            "2. Javobgar ko‘rsatilgan uy-joydan majburiy tartibda chiqarilsin.",
            "3. Javobgardan Da'vogar foydasiga " + formatMoney(d.debtAmount) + " ijara qarzi undirilsin."
          ]
        }
      ],
      signatures: [
        { role: "Da'vogar", name: cleanField(d.landlord, "F.I.Sh.") }
      ]
  })`
});

// 37. Sudga iltimosnoma
templatesPart3.push({
  id: 37,
  name: "Sudga iltimosnoma",
  icon: "ri-hand-heart-line",
  category: "Sud hujjatlari",
  desc: "Sud jarayonida dalillarni talab qilib olish, ekspertiza tayinlash yoki majlisni qoldirish haqida iltimosnoma",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik protsessual kodeksi 40, 198-moddalari",
  disclaimer: "Iltimosnoma sud majlisi boshlanishida yoki tegishli harakat yuzaga kelgan paytda yozma topshiriladi.",
  fields: [
    { key: "courtName", label: "Sud nomi va ish raqami", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha Mirabad tumanlararo sudiga (Ish № 2-1234/2026)", required: true },
    { key: "applicant", label: "Iltimosnoma kirituvchi (Da'vogar/Javobgar/Vakil)", type: "text", placeholder: "Da'vogar vakili advokat X. Alimov", required: true },
    { key: "requestTopic", label: "Iltimosnoma mavzusi", type: "text", placeholder: "Dalillarni talab qilib olish to‘g‘risida", required: true },
    { key: "grounds", label: "Iltimosnomaning asoslari va mazmuni", type: "textarea", placeholder: "Nizoli holatni to‘g‘ri hal qilish uchun Davlat kadastrlari palatasidan yer uchastkasi hujjatlarini sud orqali so‘rab olish zarur, chunki fuqaroning o‘ziga ushbu ma'lumot berilmadi...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "ILTIMOSNOMA",
      city: "Sud jarayoni",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Sud nomi va ish raqami") + "\\nIltimosnoma beruvchi: " + cleanField(d.applicant, "F.I.Sh. va protsessual maqomi"),
      sections: [
        {
          title: "1. ILTIMOSNOMA ASOSLARI",
          paragraphs: [
            "Mavzu: " + cleanField(d.requestTopic, "Iltimosnoma predmeti") + ".",
            cleanField(d.grounds, "Iltimosnomaning faktik va huquqiy asoslari."),
            "O‘zbekiston Respublikasi Fuqarolik protsessual kodeksining 40 va 198-moddalariga muvofiq, ishda ishtirok etuvchi shaxslar dalillarni taqdim etish va ularni talab qilib olish to‘g‘risida iltimosnomalar berish huquqiga ega."
          ]
        },
        {
          title: "2. ILTIMOS VA TALAB",
          paragraphs: [
            "Yuqoridagilarga asosan, suddan mazkur iltimosnomani qanoatlantirishni so‘rayman."
          ]
        }
      ],
      signatures: [
        { role: "Iltimosnoma beruvchi", name: cleanField(d.applicant, "F.I.Sh.") }
      ]
  })`
});

// 38. Sudga tushuntirish xati
templatesPart3.push({
  id: 38,
  name: "Sudga tushuntirish xati",
  icon: "ri-draft-line",
  category: "Sud hujjatlari",
  desc: "Sudya yoki sud majlisiga ish holatlari bo‘yicha yozma tushuntirish berish hujjati",
  legalBasis: "O‘zbekiston Respublikasi FPK 40, 203-moddalari",
  disclaimer: "Tushuntirish yozma ravishda taqdim etilib, ish materiallariga qo‘shib qo‘yiladi.",
  fields: [
    { key: "courtName", label: "Sud nomi va sudya F.I.Sh.", type: "text", placeholder: "Chilonzor tumanlararo sudiga (Sudya A. Ergashev ish yurituvida)", required: true },
    { key: "caseDetails", label: "Ish raqami va taraflar", type: "text", placeholder: "2-456/2026 sonli fuqarolik ishi bo‘yicha", required: true },
    { key: "personName", label: "Tushuntirish beruvchi F.I.Sh.", type: "text", placeholder: "G‘aniyev Rustam Akramovich", required: true },
    { key: "explanation", label: "Tushuntirish mazmuni", type: "textarea", placeholder: "Da'vogarning da'vo talabida ko‘rsatilgan vajlar haqiqatga to‘g‘ri kelmaydi, chunki to‘lovlar to‘liq amalga oshirilgan bo‘lib, ilova qilingan bank kvitansiyalari buni tasdiqlaydi...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "YOZMA TUSHUNTIRISH",
      city: "Sud ishi bo‘yicha",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Sud nomi") + "\\n" + cleanField(d.caseDetails, "Ish rekvizitlari") + "\\nTushuntirish beruvchi: " + cleanField(d.personName, "F.I.Sh."),
      sections: [
        {
          title: "1. VAZIYAT YUZASIDAN TUSHUNTIRISHLAR",
          paragraphs: [
            cleanField(d.explanation, "Ish holatlari bo‘yicha batafsil yozma pozitsiya va dalillar bayon etiladi."),
            "Mazkur tushuntirishlarni ish hujjatlariga qo‘shib qo‘yishingizni va qaror qabul qilishda inobatga olishingizni so‘rayman."
          ]
        }
      ],
      signatures: [
        { role: "Tushuntirish beruvchi", name: cleanField(d.personName, "F.I.Sh.") }
      ]
  })`
});

// 39. Da’voga e’tiroz
templatesPart3.push({
  id: 39,
  name: "Da’voga e’tiroz",
  icon: "ri-shield-cross-line",
  category: "Sud hujjatlari",
  desc: "Javobgarning da’vo arizasiga nisbatan rasmiy yozma e’tiroznoma (otzyv) namunasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik protsessual kodeksi 201-moddasi",
  disclaimer: "E'tirozda da'vo talablarining qaysi qismi tan olinmasligi va nima sababdan asossiz ekanligi asoslanadi.",
  fields: [
    { key: "courtName", label: "Sud nomi va ish raqami", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha sudiga (Ish № 2-789/2026)", required: true },
    { key: "defendantName", label: "Javobgar (E'tiroz beruvchi)", type: "text", placeholder: "Sharipov Botir Karimovich", required: true },
    { key: "claimantName", label: "Da'vogar F.I.Sh.", type: "text", placeholder: "Azimov Sardor Shavkatovich", required: true },
    { key: "objectionGrounds", label: "Da'voga e'tiroz asoslari", type: "textarea", placeholder: "Da'vogarning talablari butunlay asossiz, chunki shartnoma muddati o‘tgan va da'vo muddati (3 yil) o‘tkazib yuborilgan...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "DA’VO ARIZASI YUZASIDAN YOZMA E’TIROZNOMA",
      city: "Fuqarolik sudi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Sud nomi") + "\\n" +
        "Javobgar: " + cleanField(d.defendantName, "Javobgar") + "\\n" +
        "Da'vogar: " + cleanField(d.claimantName, "Da'vogar") + "ning da'vo arizasi yuzasidan",
      sections: [
        {
          title: "1. DA’VOGA NISBATAN JAVOBGARNING MUNOSABATI VA DALILLAR",
          paragraphs: [
            "Da'vogar tomonidan sudga kiritilgan da'vo arizasini to‘liq asossiz deb hisoblayman va uni tan olmayman.",
            cleanField(d.objectionGrounds, "Da'voga e'tiroz bildirish sabablari, qonun normalari va moddiy dalillar."),
            "O‘zbekiston Respublikasi Fuqarolik protsessual kodeksining 201-moddasiga asosan javobgar da'vo yuzasidan o‘z e'tirozlarini taqdim etishga haqli."
          ]
        },
        {
          title: "2. YAKUNIY ILTIMOS",
          paragraphs: [
            "Yuqoridagilarga asosan SUDDAN SO‘RAYMAN:",
            "Da'vogar " + cleanField(d.claimantName, "Da'vogar") + "ning da'vo talablarini qanoatlantirishni butunlay rad etishingizni so‘rayman."
          ]
        }
      ],
      signatures: [
        { role: "Javobgar", name: cleanField(d.defendantName, "F.I.Sh.") }
      ]
  })`
});

// 40. Sud qarori ustidan shikoyat namunasi (Apellyatsiya shikoyati)
templatesPart3.push({
  id: 40,
  name: "Sud qarori ustidan shikoyat namunasi",
  icon: "ri-auction-line",
  category: "Sud hujjatlari",
  desc: "Birinchi instansiya sudining hal qiluv qarori ustidan yuqori instansiyaga apellyatsiya shikoyati",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik protsessual kodeksi 383–388-moddalari",
  disclaimer: "Apellyatsiya shikoyati hal qiluv qarori qabul qilingan kundan e'tiboran 1 oy muddatda birinchi instansiya sudi orqali beriladi.",
  fields: [
    { key: "appealsCourt", label: "Apellyatsiya sudi nomi", type: "text", placeholder: "Toshkent shahar sudi fuqarolik ishlari bo‘yicha sudlov hay'atiga", required: true },
    { key: "firstCourt", label: "Qaror chiqargan birinchi instansiya sudi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha Shayxontohur tumanlararo sudi orqali", required: true },
    { key: "appellant", label: "Shikoyat beruvchi F.I.Sh.", type: "text", placeholder: "Hoshimov Farhod Aliyevich", required: true },
    { key: "rulingDetails", label: "Qaror sanasi va ish raqami", type: "text", placeholder: "2026-yil 15-yanvardagi 2-3344/2026-sonli hal qiluv qarori", required: true },
    { key: "appealReasons", label: "Sud qarorining qaysi jihatlari noqonuniy deb hisoblanishi", type: "textarea", placeholder: "Sud ish holatlarini to‘liq o‘rganmagan, moddiy huquq normalari noto‘g‘ri qo‘llanilgan...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "APELLYATSIYA SHIKOYATI",
      city: "Yuqori instansiya sudi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.appealsCourt, "Viloyat/Shahar sudi hay'atiga") + "\\n" +
        cleanField(d.firstCourt, "Birinchi instansiya sudi") + " orqali\\n" +
        "Shikoyat beruvchi: " + cleanField(d.appellant, "F.I.Sh."),
      sections: [
        {
          title: "1. SUD QARORI VA SHIKOYAT ASOSLARI",
          paragraphs: [
            cleanField(d.firstCourt, "Birinchi instansiya sudi") + " tomonidan " + cleanField(d.rulingDetails, "Hal qiluv qarori") + " qabul qilingan.",
            "Ushbu hal qiluv qarorini quyidagi sabablarga ko‘ra qonunga xilof va asossiz deb hisoblayman: " + cleanField(d.appealReasons, "Qonunbuzarliklar va sud xatolari."),
            "FPK 399-moddasiga ko‘ra, ish uchun ahamiyatga ega bo‘lgan holatlarning to‘liq aniqlanmaganligi yoki moddiy/protsessual huquq normalarining buzilishi qarorni bekor qilishga asos bo‘ladi."
          ]
        },
        {
          title: "2. SUDDAN SO‘RALADIGAN TALAB",
          paragraphs: [
            "SUDDAN SO‘RAYMAN:",
            "Birinchi instansiya sudining " + cleanField(d.rulingDetails, "hal qiluv qarori") + " bekor qilinsin va ish bo‘yicha yangi hal qiluv qarori qabul qilinsin."
          ]
        }
      ],
      signatures: [
        { role: "Shikoyat beruvchi", name: cleanField(d.appellant, "F.I.Sh.") }
      ]
  })`
});


// =========================================================================
// CATEGORY 5: QARZDORLIK VA PUL (Templates 41-46)
// =========================================================================

// 41. Tilxat — pul qarzi
templatesPart3.push({
  id: 41,
  name: "Tilxat — pul qarzi",
  icon: "ri-hand-coin-line",
  category: "Qarzdorlik va pul",
  desc: "Fuqarolar o‘rtasida qarz puli olinganligini va qaytarish muddatini tasdiqlovchi rasmiy tilxat (hujjat)",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 733-moddasi 2-qismi",
  disclaimer: "Qarz tilxati sudlarda qarz shartnomasi tuzilganligini tasdiqlovchi to‘laqonli yozma dalil hisoblanadi. O‘z qo‘li bilan imzolanishi shart.",
  fields: [
    { key: "city", label: "Tuzilgan shahar/tuman", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "borrowerName", label: "Qarz oluvchi F.I.Sh.", type: "text", placeholder: "Karimov Sherzod Alisherovich", required: true },
    { key: "borrowerPassport", label: "Qarz oluvchi pasport/ID ma'lumotlari", type: "text", placeholder: "AA 1234567, IIB tomonidan berilgan", required: true },
    { key: "borrowerAddress", label: "Qarz oluvchi doimiy yashash manzili", type: "text", placeholder: "Toshkent sh., Chilonzor tumani, 5-mavze, 20-uy", required: true },
    { key: "lenderName", label: "Qarz beruvchi F.I.Sh.", type: "text", placeholder: "Aliyev Anvar Akromovich", required: true },
    { key: "lenderPassport", label: "Qarz beruvchi pasport/ID ma'lumotlari", type: "text", placeholder: "AB 7654321, IIB tomonidan berilgan", required: true },
    { key: "loanAmount", label: "Qarz summasi (so‘m)", type: "number", placeholder: "10000000", required: true },
    { key: "loanAmountWords", label: "Qarz summasi so‘z bilan", type: "text", placeholder: "O‘n million so‘m", required: true },
    { key: "returnDate", label: "Qaytarishning aniq sanasi", type: "date", required: true },
    { key: "date", label: "Tilxat tuzilgan sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "TILXAT (QARZ OLGANLIK HAQIDA)",
      city: cleanField(d.city, "Shahar"),
      date: formatUzbekDate(d.date),
      preamble: "Men — fuqaro " + cleanField(d.borrowerName, "Qarz oluvchi F.I.Sh.") + ", pasport/ID: " + cleanField(d.borrowerPassport, "Pasport ma'lumotlari") + ", doimiy yashash manzilim: " + cleanField(d.borrowerAddress, "Yashash manzili") + ", ushbu tilxatni fuqaro " + cleanField(d.lenderName, "Qarz beruvchi F.I.Sh.") + " (pasport/ID: " + cleanField(d.lenderPassport, "Pasport ma'lumotlari") + ")ga berdim quyidagilar to‘g‘risida:",
      sections: [
        {
          title: "1. QARZ SHARTLARI VA MAJBURIYAT",
          paragraphs: [
            "1.1. Men bugun fuqaro " + cleanField(d.lenderName, "Qarz beruvchi") + "dan naqd pul shaklida " + formatMoney(d.loanAmount) + " (" + cleanField(d.loanAmountWords, "summa so‘z bilan") + ") miqdorida qarz oldim.",
            "1.2. Mazkur qarz summasini " + formatUzbekDate(d.returnDate) + " sanasiga qadar to‘liq va so‘zsiz qaytarish majburiyatini o‘z zimmamga olaman.",
            "1.3. O‘zbekiston Respublikasi Fuqarolik kodeksining 733-moddasiga ko‘ra, qarz oluvchining tilxati yoki qarz beruvchiga ma'lum miqdordagi pulni topshirganligini tasdiqlaydigan boshqa hujjat taqdim etilgan taqdirda qarz shartnomasining yozma shakliga rioya qilingan hisoblanadi."
          ]
        },
        {
          title: "2. JAVOBGARLIK",
          paragraphs: [
            "2.1. Belgilangan muddatda qarz summasi qaytarilmagan taqdirda, O‘zbekiston Respublikasi Fuqarolik kodeksining 327, 735-moddalariga muvofiq javobgarlik kelib chiqishini va sud orqali majburiy tartibda undirilishini to‘liq tushunaman va tan olaman."
          ]
        }
      ],
      signatures: [
        { role: "Qarz oluvchi (shaxsan o‘z qo‘li bilan)", name: cleanField(d.borrowerName, "F.I.Sh.") }
      ]
  })`
});

// 42. Qarzni qaytarish to‘g‘risida talabnoma
templatesPart3.push({
  id: 42,
  name: "Qarzni qaytarish to‘g‘risida talabnoma",
  icon: "ri-alarm-warning-line",
  category: "Qarzdorlik va pul",
  desc: "Muddati o‘tgan qarzni ixtiyoriy qaytarishni so‘rab qarz oluvchiga sudgacha yuboriladigan rasmiy ogohlantirish xati",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 236, 735-moddalari",
  disclaimer: "Talabnoma qarz oluvchiga buyurtma xat (pochta) orqali yoki tilxat asosida shaxsan topshirilishi maqsadga muvofiqdir.",
  fields: [
    { key: "borrowerName", label: "Qarzdor F.I.Sh.", type: "text", placeholder: "Saidov Dilshod Farhodovich", required: true },
    { key: "borrowerAddress", label: "Qarzdor manzili", type: "text", placeholder: "Toshkent sh., Yunusobod tumani, 7-mavze, 14-uy", required: true },
    { key: "lenderName", label: "Kreditor (Qarz beruvchi) F.I.Sh.", type: "text", placeholder: "Aliyev Anvar Akromovich", required: true },
    { key: "lenderPhone", label: "Kreditor telefoni", type: "text", placeholder: "+998 90 123 45 67", required: true },
    { key: "debtAmount", label: "Qarz summasi (so‘m)", type: "number", placeholder: "12000000", required: true },
    { key: "receiptDate", label: "Qarz olingan sana va hujjat", type: "text", placeholder: "2025-yil 1-avgustdagi tilxat asosida", required: true },
    { key: "deadlineDays", label: "To‘lash uchun berilayotgan muddat (kun)", type: "number", placeholder: "7", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "QARZNI QAYTARISH TO‘G‘RISIDA TALABNOMA (PRETENZIYA)",
      city: "Sudgacha ogohlantirish",
      date: formatUzbekDate(d.date),
      preamble: "Kimga: " + cleanField(d.borrowerName, "Qarzdor F.I.Sh.") + "\\nManzil: " + cleanField(d.borrowerAddress, "Manzili") + "\\nKimdan: " + cleanField(d.lenderName, "Kreditor F.I.Sh.") + "\\nTelefon: " + cleanField(d.lenderPhone, "+998 -- --- -- --"),
      sections: [
        {
          title: "1. TALABNING HUQUQIY VA FAKTIK ASOSLARI",
          paragraphs: [
            "Siz " + cleanField(d.receiptDate, "qarz kelishuvi") + "ga muvofiq, " + formatMoney(d.debtAmount) + " miqdorida qarz olgan edingiz.",
            "Biroq bugungi kunga qadar ushbu qarz summasi qaytarilmasdan, majburiyat qo‘pol ravishda buzib kelinmoqda.",
            "O‘zbekiston Respublikasi Fuqarolik kodeksining 236-moddasiga muvofiq majburiyatlar lozim darajada bajarilishi shart."
          ]
        },
        {
          title: "2. QAT'IY TALAB VA SUD OGOHLANTIRISHI",
          paragraphs: [
            "Ushbu talabnomani olgan kundan boshlab " + cleanField(d.deadlineDays, "7") + " kun muddat ichida " + formatMoney(d.debtAmount) + " qarzdorlikni to‘liq qoplashingizni talab qilaman.",
            "Aks holda, ko‘rsatilgan muddat o‘tgach, ish fuqarolik sudiga da'vo arizasi bilan oshiriladi. Bu holda davlat boji, advokat xizmati, pochta xarajatlari va qarzdan foydalanganlik uchun foizlar (FK 327-moddasi) ham Sizning hisobingizdan undiriladi."
          ]
        }
      ],
      signatures: [
        { role: "Kreditor (Qarz beruvchi)", name: cleanField(d.lenderName, "F.I.Sh.") }
      ]
  })`
});

// 43. Qarzdorlikni tan olish to‘g‘risidagi hujjat
templatesPart3.push({
  id: 43,
  name: "Qarzdorlikni tan olish to‘g‘risidagi hujjat",
  icon: "ri-file-shield-line",
  category: "Qarzdorlik va pul",
  desc: "Qarzdor tomonidan mavjud qarz miqdorini rasman tasdiqlash va uni to‘lash grafigi to‘g‘risidagi ikki tomonlama dalolatnoma",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 157-moddasi (Da'vo muddatining uzilishi)",
  disclaimer: "Qarzni tan olish to‘g‘risidagi yozma hujjat da'vo muddatini yangidan boshlanishiga asos bo‘ladi.",
  fields: [
    { key: "city", label: "Tuzilgan shahar", type: "text", placeholder: "Toshkent shahri", required: true },
    { key: "creditor", label: "Kreditor nomi / F.I.Sh.", type: "text", placeholder: "Toshmatov Otabek Erkinovich", required: true },
    { key: "debtor", label: "Qarzdor nomi / F.I.Sh.", type: "text", placeholder: "G‘aniyev Rustam Akramovich", required: true },
    { key: "totalDebt", label: "Tan olinayotgan qarz summasi (so‘m)", type: "number", placeholder: "18000000", required: true },
    { key: "paymentSchedule", label: "Qaytarish grafigi / tartibi", type: "textarea", placeholder: "2026-yil 1-martgacha 6 000 000 so‘m;\n2026-yil 1-aprelgacha 6 000 000 so‘m;\n2026-yil 1-maygacha 6 000 000 so‘m to‘lanadi.", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "QARZDORLIKNI TAN OLISH VA TO‘LASH TARTIBI TO‘G‘RISIDA DALOLATNOMA",
      city: cleanField(d.city, "Toshkent shahri"),
      date: formatUzbekDate(d.date),
      preamble: "Bir tomondan " + cleanField(d.creditor, "Kreditor") + " va ikkinchi tomondan " + cleanField(d.debtor, "Qarzdor") + " o‘rtasidagi hisob-kitoblar natijasida mazkur dalolatnoma quyidagilar haqida tuzildi:",
      sections: [
        {
          title: "1. QARZDORLIKNI TAN OLISH",
          paragraphs: [
            "1.1. Qarzdor " + cleanField(d.debtor, "Qarzdor") + " Kreditor oldida jami " + formatMoney(d.totalDebt) + " miqdorida qarzdorligi mavjudligini to‘liq va so‘zsiz tan oladi.",
            "1.2. O‘zbekiston Respublikasi Fuqarolik kodeksining 157-moddasiga asosan, majburiyatli shaxs tomonidan qarzni tan olishni ko‘rsatuvchi harakatlar amalga oshirilishi bilan da'vo muddatining o‘tishi uziladi."
          ]
        },
        {
          title: "2. QARZNI SO‘NDIRISH GRAFIGI",
          paragraphs: [
            cleanField(d.paymentSchedule, "Qarzdorlikni bosqichma-bosqich so‘ndirish jadvali."),
            "Grafigi buzilgan taqdirda Kreditor qoldiq qarzni sud orqali darhol undirib olish huquqiga ega bo‘ladi."
          ]
        }
      ],
      signatures: [
        { role: "Kreditor", name: cleanField(d.creditor, "F.I.Sh.") },
        { role: "Qarzdor", name: cleanField(d.debtor, "F.I.Sh.") }
      ]
  })`
});

// 44. Qarzdorlikni undirish bo‘yicha da’vo arizasi (Qarzdorlik bo‘limi uchun ixtisoslashgan)
templatesPart3.push({
  id: 44,
  name: "Qarzdorlikni undirish bo‘yicha da’vo arizasi",
  icon: "ri-coins-line",
  category: "Qarzdorlik va pul",
  desc: "Fuqarolar va yuridik shaxslar o‘rtasidagi qarzdorlikni sud orqali undirish bo‘yicha ariza",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 236, 735-moddalari",
  disclaimer: "Qarzdorlik summasiga nisbatan davlat boji to‘lanishi kerak.",
  fields: [
    { key: "courtName", label: "Sud nomi", type: "text", placeholder: "Fuqarolik ishlari bo‘yicha tumanlararo sudiga", required: true },
    { key: "plaintiff", label: "Da'vogar F.I.Sh. / nomi", type: "text", placeholder: "Rahimov Baxtiyor Komilovich", required: true },
    { key: "defendant", label: "Javobgar F.I.Sh. / nomi", type: "text", placeholder: "Ismoilov Jasur Ma'rufxonovich", required: true },
    { key: "debtSum", label: "Qarz summasi (so‘m)", type: "number", placeholder: "20000000", required: true },
    { key: "contractOrNote", label: "Qarz hujjati (shartnoma yoki tilxat sanasi)", type: "text", placeholder: "2025-yil 10-apreldagi qarz tilxati", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "QARZNI SUD ORQALI UNDIRISH HAQIDA DA’VO ARIZASI",
      city: "Fuqarolik sudi",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.courtName, "Sud nomi") + "\\nDa'vogar: " + cleanField(d.plaintiff, "Da'vogar") + "\\nJavobgar: " + cleanField(d.defendant, "Javobgar") + "\\nDa'vo bahosi: " + formatMoney(d.debtSum),
      sections: [
        {
          title: "1. DA’VO BAYONI",
          paragraphs: [
            cleanField(d.contractOrNote, "Qarz hujjati") + "ga muvofiq Javobgar " + formatMoney(d.debtSum) + " miqdorida qarz olgan va uni qaytarish majburiyatini buzgan.",
            "O‘zbekiston Respublikasi Fuqarolik kodeksining 735-moddasiga ko‘ra qarz summasi belgilangan muddatda to‘liq qaytarilishi shart."
          ]
        },
        {
          title: "2. TALAB",
          paragraphs: [
            "Javobgar " + cleanField(d.defendant, "Javobgar") + "dan Da'vogar foydasiga " + formatMoney(d.debtSum) + " miqdorida qarz summasi va davlat boji xarajatlari undirilsin."
          ]
        }
      ],
      signatures: [
        { role: "Da'vogar", name: cleanField(d.plaintiff, "F.I.Sh.") }
      ]
  })`
});

// 45. Zararni qoplash to‘g‘risida talabnoma
templatesPart3.push({
  id: 45,
  name: "Zararni qoplash to‘g‘risida talabnoma",
  icon: "ri-alert-line",
  category: "Qarzdorlik va pul",
  desc: "Mol-mulkka yetkazilgan talofat yoki moddiy zararni sudgacha ixtiyoriy qoplash talabnomasi",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 14, 985-moddalari",
  disclaimer: "Talabnomaga zarar miqdorini tasdiqlovchi dalolatnoma nusxasi qo‘shib yuboriladi.",
  fields: [
    { key: "recipient", label: "Zarar yetkazuvchi F.I.Sh.", type: "text", placeholder: "Yusupov Akmal Shavkatovich", required: true },
    { key: "recipientAddress", label: "Manzili", type: "text", placeholder: "Toshkent sh., Yunusobod tumani", required: true },
    { key: "sender", label: "Jabrlanuvchi (Talab qiluvchi) F.I.Sh.", type: "text", placeholder: "Karimov Sherzod Alisherovich", required: true },
    { key: "damageAmount", label: "Zarar summasi (so‘m)", type: "number", placeholder: "5000000", required: true },
    { key: "incidentDetails", label: "Zarar yetkazilishi tafsilotlari", type: "textarea", placeholder: "Sizning xonadoningizdan oqqan suv natijasida xonadonimga jiddiy zarar yetkazilgan...", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "YETKAZILGAN MODDIY ZARARNI QOPLASH HAQIDA TALABNOMA",
      city: "Sudgacha da'vo",
      date: formatUzbekDate(d.date),
      preamble: "Kimga: " + cleanField(d.recipient, "Zarar yetkazuvchi") + "\\nManzil: " + cleanField(d.recipientAddress, "Manzil") + "\\nKimdan: " + cleanField(d.sender, "Jabrlanuvchi"),
      sections: [
        {
          title: "1. HOLAT VA TALAFOT MIQDORI",
          paragraphs: [
            cleanField(d.incidentDetails, "Zarar holatlari."),
            "Mutaxassislar tomonidan tuzilgan dalolatnomaga ko‘ra, yetkazilgan moddiy zarar miqdori " + formatMoney(d.damageAmount) + "ni tashkil etadi.",
            "O‘zbekiston Respublikasi Fuqarolik kodeksining 985-moddasiga asosan zarar uni yetkazgan shaxs tomonidan to‘liq qoplanishi shart."
          ]
        },
        {
          title: "2. TALAB",
          paragraphs: [
            "Mazkur talabnomani olganingizdan so‘ng 10 kun ichida " + formatMoney(d.damageAmount) + " zararni ixtiyoriy qoplashingizni so‘rayman, aks holda sudga murojaat qilinadi."
          ]
        }
      ],
      signatures: [
        { role: "Talab qiluvchi", name: cleanField(d.sender, "F.I.Sh.") }
      ]
  })`
});

// 46. To‘lovni talab qilish xati
templatesPart3.push({
  id: 46,
  name: "To‘lovni talab qilish xati",
  icon: "ri-mail-send-line",
  category: "Qarzdorlik va pul",
  desc: "Ko‘rsatilgan xizmatlar yoki yetkazib berilgan tovarlar uchun muddati o‘tgan to‘lovni talab qilish rasmiy xati",
  legalBasis: "O‘zbekiston Respublikasi Fuqarolik kodeksi 236, 631-moddalari",
  disclaimer: "Korxonalar o‘rtasidagi shartnomaviy hisob-kitoblarda sudgacha tartibga solish bosqichi hisoblanadi.",
  fields: [
    { key: "debtorOrg", label: "Qarzdor tashkilot/shaxs", type: "text", placeholder: "«Vatan Qurilish» MChJ rahbariyatiga", required: true },
    { key: "creditorOrg", label: "Talab qiluvchi tashkilot/shaxs", type: "text", placeholder: "«Texno Ta'minot» MChJ", required: true },
    { key: "invoiceDetails", label: "Hisob-faktura yoki shartnoma raqami", type: "text", placeholder: "2025-yil 1-dekabrdagi 102-sonli hisob-faktura", required: true },
    { key: "debtSum", label: "To‘lanmagan summa (so‘m)", type: "number", placeholder: "32000000", required: true },
    { key: "date", label: "Sana", type: "date", required: true }
  ],
  codeBody: `(d) => ({
      title: "TO‘LOV QARZDORLIGINI QOPLASH TO‘G‘RISIDA TALABNOMA XATI",
      city: "Tashkilotlararo murojaat",
      date: formatUzbekDate(d.date),
      preamble: cleanField(d.debtorOrg, "Qarzdor tashkilot") + "\\nKimdan: " + cleanField(d.creditorOrg, "Kreditor"),
      sections: [
        {
          title: "1. SHARTNOMAVIY QARZDORLIK HOLATI",
          paragraphs: [
            cleanField(d.invoiceDetails, "Hisob-faktura") + " asosida xizmatlar (tovarlar) qabul qilingan bo‘lsa-da, to‘lov o‘z vaqtida amalga oshirilmagan.",
            "Bugungi kunda to‘lanmagan qarzdorlik miqdori " + formatMoney(d.debtSum) + "ni tashkil etadi."
          ]
        },
        {
          title: "2. TO‘LOVNI AMALGA OSHIRISH TALABI",
          paragraphs: [
            "Mazkur xat olingan kundan e'tiboran 5 bank kuni ichida ko‘rsatilgan " + formatMoney(d.debtSum) + " summani hisob-raqamimizga o‘tkazib berishingizni talab qilamiz."
          ]
        }
      ],
      signatures: [
        { role: "Rahbar", name: cleanField(d.creditorOrg, "Mas'ul shaxs") }
      ]
  })`
});
