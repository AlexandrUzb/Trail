import fs from 'fs';

// Helper for date string
const dateFuncStr = `const today = () => new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });`;

// Categories definitions and their documents
const categoriesData = [
  {
    category: "Ijara va ko‘chmas mulk",
    icon: "ri-home-4-line",
    docs: [
      {
        id: "ijara_1",
        name: "Uy-joy ijara shartnomasi",
        desc: "Turar joyni ijaraga berish bo'yicha namunaviy shartnoma",
        fields: [
          { key: "landlordName", label: "Ijaraga beruvchi F.I.Sh.", type: "text", placeholder: "Aliyev Vali G'aniyevich", required: true },
          { key: "tenantName", label: "Ijarachi F.I.Sh.", type: "text", placeholder: "Karimov Sherzod Alisherovich", required: true },
          { key: "address", label: "Uy-joy manzili", type: "text", placeholder: "Toshkent sh., Yunusobod tumani, 4-mavze, 12-uy, 45-xonadon", required: true },
          { key: "rentAmount", label: "Oylik ijara narxi (so'm)", type: "number", placeholder: "3500000", required: true },
          { key: "periodMonths", label: "Ijara muddati (oy)", type: "number", placeholder: "12", required: true }
        ],
        body: (d) => `UY-JOY IJARA SHARTNOMASI\\n\\nSana: \${today()}\\nJoy: \${d.address || '[Shahar/Manzil]'}\\n\\n1. SHARTNOMA TARAFLARI\\nBir tomondan \${d.landlordName || '[Ijaraga beruvchi F.I.Sh.]'} (keyingi o'rinlarda «Ijaraga beruvchi»)\\nva ikkinchi tomondan \${d.tenantName || '[Ijarachi F.I.Sh.]'} (keyingi o'rinlarda «Ijarachi»)\\nquyidagilar to'g'risida mazkur shartnomani tuzdilar:\\n\\n2. SHARTNOMA PREDMETI\\n2.1. Ijaraga beruvchi o'ziga mulk huquqi asosida tegishli bo'lgan \${d.address || '[Uy-joy manzili]'} manzilida joylashgan turar joyni Ijarachiga vaqtincha yashash uchun haq evaziga ijaraga beradi.\\n\\n3. IJARA HAQI VA TO'LOV TARTIBI\\n3.1. Oylik ijara to'lovi \${d.rentAmount ? Number(d.rentAmount).toLocaleString('uz-UZ') : '[Summa]'} so'mni tashkil etadi.\\n3.2. To'lov har oyning 5-sanasigacha to'lanadi.\\n\\n4. SHARTNOMA MUDDATI\\n4.1. Mazkur shartnoma \${d.periodMonths || '12'} oy muddatga tuzildi.\\n\\n5. TARAFLARNING MAJBURIYATLARI\\n5.1. Ijarachi uy-joydan maqsadli foydalanishi, kommunal xizmatlarni o'z vaqtida to'lashi va mol-mulkni asrashi shart.\\n\\nTARAFLARNING IMZOLARI:\\nIjaraga beruvchi: ________________ (\${d.landlordName || ''})\\nIjarachi: ________________ (\${d.tenantName || ''})`
      },
      {
        id: "ijara_2",
        name: "Noturar joy ijara shartnomasi",
        desc: "Ofis, do'kon yoki omborxona uchun ijara shartnomasi",
        fields: [
          { key: "landlordName", label: "Ijaraga beruvchi (F.I.Sh. yoki Kompaniya)", type: "text", required: true },
          { key: "tenantName", label: "Ijarachi (F.I.Sh. yoki MChJ)", type: "text", required: true },
          { key: "address", label: "Noturar joy manzili", type: "text", required: true },
          { key: "area", label: "Maydoni (kv.m)", type: "number", placeholder: "80" },
          { key: "rentAmount", label: "Oylik ijara haqi (so'm)", type: "number", required: true }
        ],
        body: (d) => `NOTURAR JOY IJARA SHARTNOMASI\\n\\nSana: \${today()}\\n\\nTARAFLAR:\\nIjaraga beruvchi: \${d.landlordName || '[Ijaraga beruvchi]'}\\nIjarachi: \${d.tenantName || '[Ijarachi]'}\\n\\n1. SHARTNOMA PREDMETI\\nIjaraga beruvchi \${d.address || '[Noturar joy manzili]'} manzilida joylashgan, umumiy maydoni \${d.area || '[...]'} kv.m bo'lgan noturar binoni Ijarachiga tijorat/xizmat faoliyati uchun foydalanishga beradi.\\n\\n2. IJARA HAQI\\nOylik to'lov: \${d.rentAmount ? Number(d.rentAmount).toLocaleString('uz-UZ') : '[Summa]'} so'm.\\n\\n3. JAVOBGARLIK\\nO'zbekiston Respublikasi Fuqarolik kodeksi talablariga muvofiq tartibga solinadi.\\n\\nIMZOLAR:\\nIjaraga beruvchi: _________________\\nIjarachi: _________________`
      },
      {
        id: "ijara_3",
        name: "Avtomobil ijara shartnomasi",
        desc: "Transport vositasini haydovchisiz ijaraga berish",
        fields: [
          { key: "landlordName", label: "Mulkdor F.I.Sh.", type: "text", required: true },
          { key: "tenantName", label: "Ijarachi F.I.Sh.", type: "text", required: true },
          { key: "carModel", label: "Avtomobil rusumi va davlat raqami", type: "text", placeholder: "Chevrolet Cobalt, 01 A 777 AA", required: true },
          { key: "dailyRent", label: "Kunlik/Oylik to'lov (so'm)", type: "text", required: true }
        ],
        body: (d) => `AVTOMOBIL IJARA SHARTNOMASI\\n\\nSana: \${today()}\\n\\nMulkdor: \${d.landlordName || '[F.I.Sh.]'}\\nIjarachi: \${d.tenantName || '[F.I.Sh.]'}\\n\\n1. Mulkdor o'ziga tegishli bo'lgan \${d.carModel || '[Avtomobil rusumi va raqami]'} avtomashinasini Ijarachiga vaqtincha foydalanish uchun ijaraga beradi.\\n2. Ijara haqi: \${d.dailyRent || '[Summa]'}.\\n3. Ijarachi yo'l harakati qoidalariga qat'iy rioya qilishi va texnik soz holatda saqlashi shart.\\n\\nImzolar:\\nIjaraga beruvchi: _________________\\nIjarachi: _________________`
      },
      {
        id: "ijara_4",
        name: "Uskuna/mulk ijara shartnomasi",
        desc: "Ishlab chiqarish uskunasi yoki boshqa mulk ijarasi",
        fields: [
          { key: "landlordName", label: "Ijaraga beruvchi", type: "text", required: true },
          { key: "tenantName", label: "Ijarachi", type: "text", required: true },
          { key: "equipmentName", label: "Uskuna/mulk nomi va modeli", type: "text", required: true },
          { key: "rentPrice", label: "Ijara narxi (so'm)", type: "number", required: true }
        ],
        body: (d) => `USKUNA VA ASBOB-USKUNALAR IJARA SHARTNOMASI\\n\\nSana: \${today()}\\n\\nIjaraga beruvchi \${d.landlordName || '[F.I.Sh.]'} ushbu shartnoma bo'yicha \${d.equipmentName || '[Uskuna nomi]'} uskunasini Ijarachi \${d.tenantName || '[F.I.Sh.]'}ga vaqtincha haq evaziga ijaraga beradi.\\nIjara haqi: \${d.rentPrice ? Number(d.rentPrice).toLocaleString('uz-UZ') : '[Summa]'} so'm.\\n\\nImzolar:\\nIjaraga beruvchi: ______________\\nIjarachi: ______________`
      },
      {
        id: "ijara_5",
        name: "Ijara shartnomasini bekor qilish to‘g‘risida ariza",
        desc: "Shartnomani muddatidan oldin bekor qilish to'g'risida bildirishnoma",
        fields: [
          { key: "recipientName", label: "Ikkinchi taraf F.I.Sh.", type: "text", required: true },
          { key: "senderName", label: "Ariza beruvchi F.I.Sh.", type: "text", required: true },
          { key: "contractDate", label: "Shartnoma sanasi va raqami", type: "text", required: true },
          { key: "reason", label: "Bekor qilish sababi", type: "textarea", required: true }
        ],
        body: (d) => `BILDIRISHNOMA (ARIZA)\\nIjara shartnomasini bekor qilish to'g'risida\\n\\nKimga: \${d.recipientName || '[Taraf F.I.Sh.]'}\\nKimdan: \${d.senderName || '[Ariza beruvchi F.I.Sh.]'}\\n\\nSiz bilan \${d.contractDate || '[Shartnoma sanasi va raqami]'}da tuzilgan ijara shartnomasini quyidagi sababga ko'ra:\\n\${d.reason || '[Bekor qilish sababi]'}\\n\\nO'zbekiston Respublikasi Fuqarolik kodeksining 551-moddasiga muvofiq muddatidan oldin bekor qilishimni ma'lum qilaman.\\n\\nSana: \${today()}\\nImzo: _________________ (\${d.senderName || ''})`
      },
      {
        id: "ijara_6",
        name: "Ijara shartnomasini uzaytirish to‘g‘risida ariza",
        desc: "Amaldagi ijara muddatini uzaytirish iltimosnomasi",
        fields: [
          { key: "landlordName", label: "Ijaraga beruvchi F.I.Sh.", type: "text", required: true },
          { key: "tenantName", label: "Ijarachi F.I.Sh.", type: "text", required: true },
          { key: "months", label: "Qancha muddatga uzaytirish (oy)", type: "number", required: true }
        ],
        body: (d) => `ARIZA\\nIjara shartnomasini uzaytirish to'g'risida\\n\\n\${d.landlordName || '[Ijaraga beruvchi]'}ga\\n\${d.tenantName || '[Ijarachi]'}dan\\n\\nMen bilan tuzilgan ijara shartnomasi muddati tugayotganligi munosabati bilan, O'zbekiston Respublikasi Fuqarolik kodeksining 553-moddasi (ijarachining shartnomani yangilashga bo'lgan imtiyozli huquqi)ga binoan shartnomani yana \${d.months || '12'} oy muddatga uzaytirishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "ijara_7",
        name: "Ijara to‘lovi bo‘yicha talabnoma",
        desc: "Muddati o'tgan ijara haqini to'lash to'g'risida rasmiy talabnoma (pretenziya)",
        fields: [
          { key: "tenantName", label: "Qarzdor ijarachi F.I.Sh.", type: "text", required: true },
          { key: "landlordName", label: "Mulkdor F.I.Sh.", type: "text", required: true },
          { key: "debtAmount", label: "Qarzdorlik summasi (so'm)", type: "number", required: true },
          { key: "deadlineDays", label: "To'lash uchun berilgan muddat (kun)", type: "number", placeholder: "7" }
        ],
        body: (d) => `TALABNOMA (PRETENZIYA)\\nIjara to'lovi qarzdorligini bartaraf etish to'g'risida\\n\\nKimga: \${d.tenantName || '[Ijarachi F.I.Sh.]'}\\nKimdan: \${d.landlordName || '[Mulkdor F.I.Sh.]'}\\n\\nSiz amaldagi ijara shartnomasi bo'yicha o'z majburiyatlaringizni buzib, jami \${d.debtAmount ? Number(d.debtAmount).toLocaleString('uz-UZ') : '[Summa]'} so'm miqdorida ijara qarzdorligiga yo'l qo'ygansiz.\\nUshbu talabnoma olingan kundan boshlab \${d.deadlineDays || '7'} kun ichida qarzdorlikni to'liq so'ndirishingizni talab qilaman. Aks holda shartnoma bekor qilinib, sudga da'vo arizasi kiritiladi.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "ijara_8",
        name: "Ijara qarzdorligini undirish bo‘yicha da’vo arizasi",
        desc: "Sud orqali to'lanmagan ijara pullari va penya undirish da'vosi",
        fields: [
          { key: "courtName", label: "Sud nomi (Fuqarolik ishlari bo'yicha)", type: "text", required: true },
          { key: "plaintiff", label: "Da'vogar (Mulkdor) F.I.Sh.", type: "text", required: true },
          { key: "defendant", label: "Javobgar (Ijarachi) F.I.Sh.", type: "text", required: true },
          { key: "debtAmount", label: "Undiriladigan summa (so'm)", type: "number", required: true }
        ],
        body: (d) => `FUQAROLIK ISHLARI BO'YICHA \${d.courtName ? d.courtName.toUpperCase() : '[SUD NOMI]'}GA\\n\\nDa'vogar: \${d.plaintiff || '[Da\\'vogar F.I.Sh.]'}\\nJavobgar: \${d.defendant || '[Javobgar F.I.Sh.]'}\\n\\nDA'VO ARIZASI\\nIjara to'lovi qarzdorligini undirish to'g'risida\\n\\nDa'vo bahosi: \${d.debtAmount ? Number(d.debtAmount).toLocaleString('uz-UZ') : '[Summa]'} so'm\\n\\nO'zbekiston Respublikasi Fuqarolik kodeksining 236, 324 va 544-moddalariga asosan, javobgardan \${d.debtAmount ? Number(d.debtAmount).toLocaleString('uz-UZ') : '[Summa]'} so'm ijara qarzdorligi hamda davlat boji xarajatlarini undirib berishingizni so'rayman.\\n\\nIlovalar: Shartnoma nusxasi, to'lov talabnomasi, davlat boji kvitansiyasi.\\n\\nSana: \${today()}\\nDa'vogar: _________________ (\${d.plaintiff || ''})`
      },
      {
        id: "ijara_9",
        name: "Uy-joyni qabul qilish-topshirish dalolatnomasi",
        desc: "Uy kalitlari va jihozlarining holatini qayd etish dalolatnomasi",
        fields: [
          { key: "landlordName", label: "Ijaraga beruvchi F.I.Sh.", type: "text", required: true },
          { key: "tenantName", label: "Ijarachi F.I.Sh.", type: "text", required: true },
          { key: "condition", label: "Uy holati va jihozlar ro'yxati", type: "textarea", required: true }
        ],
        body: (d) => `UY-JOYNI QABUL QILISH-TOPSHIRISH DALOLATNOMASI\\n\\nSana: \${today()}\\n\\nIjaraga beruvchi \${d.landlordName || '[F.I.Sh.]'} uy-joyni topshirdi, Ijarachi \${d.tenantName || '[F.I.Sh.]'} qabul qilib oldi.\\n\\nUyning texnik holati va mavjud jihozlar:\\n\${d.condition || '[Jihozlar va holat tavsifi]'}\\n\\nTaraflarda bir-biriga e'tirozlar mavjud emas.\\n\\nTopshirdi: _________________\\nQabul qildi: _________________`
      },
      {
        id: "ijara_10",
        name: "Mol-mulkni qabul qilish-topshirish dalolatnomasi",
        desc: "Ijaraga berilayotgan yoki qaytarilayotgan mulklar inventari",
        fields: [
          { key: "partyA", label: "Topshiruvchi taraf", type: "text", required: true },
          { key: "partyB", label: "Qabul qiluvchi taraf", type: "text", required: true },
          { key: "items", label: "Mulklar ro'yxati va qiymati", type: "textarea", required: true }
        ],
        body: (d) => `MOL-MULKNI QABUL QILISH-TOPSHIRISH DALOLATNOMASI\\n\\nSana: \${today()}\\n\\nTopshiruvchi: \${d.partyA || '[F.I.Sh.]'}\\nQabul qiluvchi: \${d.partyB || '[F.I.Sh.]'}\\n\\nUshbu dalolatnoma orqali quyidagi mol-mulklar topshirildi va qabul qilindi:\\n\${d.items || '[Mulklar ro\\'yxati]'}\\n\\nTopshiruvchi: _________________\\nQabul qiluvchi: _________________`
      }
    ]
  },
  {
    category: "Mehnat hujjatlari",
    icon: "ri-briefcase-line",
    docs: [
      {
        id: "mehnat_doc_1",
        name: "Mehnat shartnomasi",
        desc: "Yangi xodimni rasmiy ishga qabul qilish mehnat shartnomasi",
        fields: [
          { key: "companyName", label: "Ish beruvchi tashkilot nomi", type: "text", required: true },
          { key: "employeeName", label: "Xodim F.I.Sh.", type: "text", required: true },
          { key: "position", label: "Lavozimi", type: "text", required: true },
          { key: "salary", label: "Oylik maoshi (so'm)", type: "number", required: true }
        ],
        body: (d) => `MEHNAT SHARTNOMASI\\n\\nSana: \${today()}\\nIsh beruvchi: \${d.companyName || '[Tashkilot]'}\\nXodim: \${d.employeeName || '[Xodim F.I.Sh.]'}\\n\\n1. Xodim \${d.position || '[Lavozim]'} lavozimiga ishga qabul qilinadi.\\n2. Oylik ish haqi: \${d.salary ? Number(d.salary).toLocaleString('uz-UZ') : '[Summa]'} so'm.\\n3. Mazkur shartnoma O'zbekiston Respublikasi yangi tahrirdagi Mehnat kodeksiga to'la muvofiq tuzildi.\\n\\nRahbar: _________________\\nXodim: _________________`
      },
      {
        id: "mehnat_doc_2",
        name: "Ishga qabul qilish to‘g‘risida ariza",
        desc: "Ishga kirish arizasi",
        fields: [
          { key: "companyName", label: "Korxona rahbari nomi", type: "text", required: true },
          { key: "applicantName", label: "Arizachi F.I.Sh.", type: "text", required: true },
          { key: "position", label: "Lavozim", type: "text", required: true }
        ],
        body: (d) => `ARIZA\\nIshga qabul qilish to'g'risida\\n\\n\${d.companyName || '[Rahbar F.I.Sh.]'}ga\\n\${d.applicantName || '[Arizachi F.I.Sh.]'}dan\\n\\nSizdan meni \${d.position || '[Lavozim]'} lavozimiga ishga qabul qilishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "mehnat_doc_3",
        name: "O‘z xohishiga ko‘ra ishdan bo‘shash arizasi",
        desc: "Xodim tashabbusi bilan mehnat shartnomasini bekor qilish (MK 99-modda)",
        fields: [
          { key: "directorName", label: "Rahbar F.I.Sh.", type: "text", required: true },
          { key: "employeeName", label: "Xodim F.I.Sh.", type: "text", required: true },
          { key: "date", label: "Bo'shash sanasi", type: "date", required: true }
        ],
        body: (d) => `ARIZA\\nO'z xohishiga ko'ra mehnat shartnomasini bekor qilish to'g'risida\\n\\n\${d.directorName || '[Rahbar F.I.Sh.]'}ga\\n\${d.employeeName || '[Xodim F.I.Sh.]'}dan\\n\\nO'zbekiston Respublikasi Mehnat kodeksining 99-moddasiga asosan, men bilan tuzilgan mehnat shartnomasini o'z xohishimga ko'ra \${d.date ? new Date(d.date).toLocaleDateString('uz-UZ') : '[Sana]'}dan bekor qilishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "mehnat_doc_4",
        name: "Tomonlar kelishuviga ko‘ra ishdan bo‘shash arizasi",
        desc: "Taraflar kelishuvi asosida shartnomani tugatish",
        fields: [
          { key: "directorName", label: "Rahbar F.I.Sh.", type: "text", required: true },
          { key: "employeeName", label: "Xodim F.I.Sh.", type: "text", required: true }
        ],
        body: (d) => `ARIZA\\nTomonlar kelishuviga ko'ra mehnat shartnomasini bekor qilish to'g'risida\\n\\n\${d.directorName || '[Rahbar]'}ga\\n\${d.employeeName || '[Xodim]'}dan\\n\\nMehnat kodeksining 97-moddasi 1-bandiga muvofiq, men bilan tuzilgan mehnat shartnomasini taraflar kelishuvi asosida bekor qilishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "mehnat_doc_5",
        name: "Mehnat shartnomasi muddati tugashi munosabati bilan ariza",
        desc: "Muddatli shartnomaning muddati yakunlanishi haqida ariza/bildirishnoma",
        fields: [
          { key: "directorName", label: "Rahbar", type: "text", required: true },
          { key: "employeeName", label: "Xodim", type: "text", required: true },
          { key: "endDate", label: "Shartnoma tugash sanasi", type: "date", required: true }
        ],
        body: (d) => `BILDIRISHNOMA (ARIZA)\\nMehnat shartnomasi muddati tugashi munosabati bilan\\n\\n\${d.directorName || '[Rahbar]'}ga\\n\${d.employeeName || '[Xodim]'}dan\\n\\nMen bilan tuzilgan muddatli mehnat shartnomasi \${d.endDate ? new Date(d.endDate).toLocaleDateString('uz-UZ') : '[Sana]'} kuni tugashini inobatga olib, Mehnat kodeksiga asosan tegishli hisob-kitob qilish va mehnat daftarchasini topshirishni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "mehnat_doc_6",
        name: "Mehnat ta’tiliga chiqish arizasi",
        desc: "Yillik asosiy mehnat ta'tili olish arizasi",
        fields: [
          { key: "directorName", label: "Rahbar", type: "text", required: true },
          { key: "employeeName", label: "Xodim", type: "text", required: true },
          { key: "startDate", label: "Ta'til boshlanish sanasi", type: "date", required: true },
          { key: "days", label: "Ta'til kunlari soni", type: "number", placeholder: "21", required: true }
        ],
        body: (d) => `ARIZA\\nMehnat ta'tili berish to'g'risida\\n\\n\${d.directorName || '[Rahbar]'}ga\\n\${d.employeeName || '[Xodim]'}dan\\n\\nSizdan menga \${d.startDate ? new Date(d.startDate).toLocaleDateString('uz-UZ') : '[Sana]'}dan boshlab \${d.days || '21'} kalendar kuni miqdorida navbatdagi mehnat ta'tili ajratishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "mehnat_doc_7",
        name: "Ish haqi bo‘yicha ma’lumotnoma",
        desc: "Ish joyidan daromad va oylik ish haqi to'g'risida ma'lumotnoma talab qilish arizasi",
        fields: [
          { key: "companyName", label: "Tashkilot nomi", type: "text", required: true },
          { key: "employeeName", label: "Xodim F.I.Sh.", type: "text", required: true },
          { key: "months", label: "Qaysi davr uchun (oylar)", type: "text", placeholder: "Oxirgi 6 oy" }
        ],
        body: (d) => `ARIZA\\nIsh haqi to'g'risida ma'lumotnoma berish haqida\\n\\n\${d.companyName || '[Tashkilot]'} rahbariyatiga\\n\${d.employeeName || '[Xodim]'}dan\\n\\nO'zbekiston Respublikasi Mehnat kodeksining talablariga ko'ra, menga bank/tashkilotga taqdim etish uchun \${d.months || 'oxirgi 12 oy'}lik ish haqi to'g'risidagi ma'lumotnomani taqdim etishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "mehnat_doc_8",
        name: "Mehnat ta’tilini ko‘chirish to‘g‘risida ariza",
        desc: "Xodimning ta'til muddatini boshqa vaqtga ko'chirish arizasi",
        fields: [
          { key: "directorName", label: "Rahbar", type: "text", required: true },
          { key: "employeeName", label: "Xodim", type: "text", required: true },
          { key: "newDate", label: "Ko'chiriladigan yangi sana", type: "date", required: true },
          { key: "reason", label: "Sabab", type: "textarea", required: true }
        ],
        body: (d) => `ARIZA\\nMehnat ta'tilini ko'chirish to'g'risida\\n\\n\${d.directorName || '[Rahbar]'}ga\\n\${d.employeeName || '[Xodim]'}dan\\n\\nQuyidagi sababga ko'ra:\\n\${d.reason || '[Sabab]'}\\n\\nRejadagi mehnat ta'tilimni \${d.newDate ? new Date(d.newDate).toLocaleDateString('uz-UZ') : '[Yangi sana]'}ga ko'chirishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "mehnat_doc_9",
        name: "Ishga tiklash bo‘yicha da’vo arizasi",
        desc: "Noqonuniy bo'shatilgan xodimni ishga tiklash va majburiy progul haqini undirish",
        fields: [
          { key: "courtName", label: "Fuqarolik sudi", type: "text", required: true },
          { key: "plaintiff", label: "Da'vogar (Xodim)", type: "text", required: true },
          { key: "defendant", label: "Javobgar (Korxona)", type: "text", required: true }
        ],
        body: (d) => `FUQAROLIK ISHLARI BO'YICHA \${d.courtName ? d.courtName.toUpperCase() : '[SUD]'}\\n\\nDa'vogar: \${d.plaintiff || '[Xodim]'}\\nJavobgar: \${d.defendant || '[Ish beruvchi]'}\\n\\nDA'VO ARIZASI\\nIshga tiklash va majburiy progul uchun haq undirish to'g'risida\\n\\nMehnat kodeksining 212 va 560-moddalariga asosan, ish beruvchining noqonuniy buyrug'ini bekor qilib, meni avvalgi lavozimimga ishga tiklashingizni hamda majburiy progul kunlari uchun o'rtacha ish haqini undirib berishingizni so'rayman.\\n\\nSana: \${today()}\\nDa'vogar: _________________`
      },
      {
        id: "mehnat_doc_10",
        name: "Ish haqi qarzdorligini undirish bo‘yicha da’vo arizasi",
        desc: "To'lanmagan oylik ish haqini sud orqali majburiy undirish",
        fields: [
          { key: "courtName", label: "Sud nomi", type: "text", required: true },
          { key: "plaintiff", label: "Xodim F.I.Sh.", type: "text", required: true },
          { key: "defendant", label: "Ish beruvchi korxona", type: "text", required: true },
          { key: "salaryDebt", label: "Oylik qarzdorlik summasi (so'm)", type: "number", required: true }
        ],
        body: (d) => `FUQAROLIK ISHLARI BO'YICHA \${d.courtName ? d.courtName.toUpperCase() : '[SUD]'}\\n\\nDa'vogar: \${d.plaintiff || '[Xodim]'}\\nJavobgar: \${d.defendant || '[Korxona]'}\\n\\nDA'VO ARIZASI\\nIsh haqi qarzdorligini undirish to'g'risida\\n\\nJavobgar korxona tomonidan to'lanmagan \${d.salaryDebt ? Number(d.salaryDebt).toLocaleString('uz-UZ') : '[Summa]'} so'm ish haqi qarzdorligini O'zbekiston Respublikasi Mehnat kodeksining 253 va 333-moddalariga muvofiq kompensatsiyasi bilan birga undirib berishingizni so'rayman.\\n\\nSana: \${today()}\\nDa'vogar: _________________`
      }
    ]
  },
  {
    category: "Umumiy arizalar",
    icon: "ri-file-text-line",
    docs: [
      {
        id: "umumiy_1",
        name: "Umumiy ariza",
        desc: "Istalgan davlat organi yoki tashkilotga umumiy shakldagi ariza",
        fields: [
          { key: "recipient", label: "Tashkilot / Rahbar nomi", type: "text", required: true },
          { key: "sender", label: "Ariza beruvchi F.I.Sh.", type: "text", required: true },
          { key: "content", label: "Murojaat mazmuni", type: "textarea", required: true }
        ],
        body: (d) => `ARIZA\\n\\n\${d.recipient || '[Tashkilot/Rahbar]'}\\n\${d.sender || '[Ariza beruvchi]'}\\n\\n\${d.content || '[Murojaat mazmuni]'}\\n\\nO'zbekiston Respublikasining «Jismoniy va yuridik shaxslarning murojaatlari to'g'risida»gi Qonuniga muvofiq ko'rib chiqishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "umumiy_2",
        name: "Shikoyat arizasi",
        desc: "Mansabdor shaxs harakati yoki qarori ustidan rasmiy shikoyat",
        fields: [
          { key: "authority", label: "Yuqori turuvchi organ", type: "text", required: true },
          { key: "sender", label: "Shikoyatchi F.I.Sh.", type: "text", required: true },
          { key: "complaintDetails", label: "Qonunbuzarlik tafsilotlari", type: "textarea", required: true }
        ],
        body: (d) => `SHIKOYAT ARIZASI\\n\\n\${d.authority || '[Yuqori organ]'}\\n\${d.sender || '[Shikoyatchi]'}\\n\\nMen quyidagi noqonuniy harakatlar bo'yicha shikoyat bildiraman:\\n\${d.complaintDetails || '[Qonunbuzarlik tafsilotlari]'}\\n\\nUshbu holatni tekshirib, qonuniy chora ko'rishingizni va natijasi haqida yozma xabar berishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "umumiy_3",
        name: "Davlat organiga murojaat",
        desc: "Hokimlik, vazirlik yoki idoraga rasmiy xat/murojaat",
        fields: [
          { key: "ministryName", label: "Davlat organi nomi", type: "text", required: true },
          { key: "citizenName", label: "Fuqaro F.I.Sh.", type: "text", required: true },
          { key: "issue", label: "Masala mazmuni", type: "textarea", required: true }
        ],
        body: (d) => `RASMIY MUROJAAT\\n\\n\${d.ministryName || '[Davlat organi]'}\\nFuqaro: \${d.citizenName || '[F.I.Sh.]'}\\n\\n\${d.issue || '[Masala mazmuni]'}\\n\\nQonunda belgilangan 15 kunlik muddatda javob berishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "umumiy_4",
        name: "Ma’lumot so‘rash to‘g‘risida ariza",
        desc: "Davlat organi yoki arxivdan rasmiy ma'lumotnoma so'rash",
        fields: [
          { key: "orgName", label: "Organ nomi", type: "text", required: true },
          { key: "applicant", label: "Arizachi", type: "text", required: true },
          { key: "infoNeeded", label: "So'ralayotgan ma'lumot", type: "textarea", required: true }
        ],
        body: (d) => `ARIZA\\nAxborot va ma'lumot olish to'g'risida\\n\\n\${d.orgName || '[Organ nomi]'}\\n\${d.applicant || '[Arizachi]'}\\n\\n«Axborot erkinligi prinsiplari va kafolatlari to'g'risida»gi Qonunga binoan quyidagi ma'lumotni taqdim etishingizni so'rayman:\\n\${d.infoNeeded || '[Ma\\'lumot turi]'}\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "umumiy_5",
        name: "Hujjat nusxasini berish to‘g‘risida ariza",
        desc: "Arxiv yoki idoradan qaror/hujjat nusxasini olish arizasi",
        fields: [
          { key: "orgName", label: "Idora nomi", type: "text", required: true },
          { key: "applicant", label: "Arizachi", type: "text", required: true },
          { key: "docName", label: "So'ralayotgan hujjat nomi va sanasi", type: "text", required: true }
        ],
        body: (d) => `ARIZA\\nHujjat nusxasini (dublikatini) berish haqida\\n\\n\${d.orgName || '[Idora]'}\\n\${d.applicant || '[Arizachi]'}\\n\\nSizning idorangizda saqlanayotgan \${d.docName || '[Hujjat nomi va sanasi]'} nusxasini menga berishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "umumiy_6",
        name: "Hujjatni tiklash to‘g‘risida ariza",
        desc: "Yo'qolgan yoki yaroqsiz holga kelgan hujjatni qayta tiklash arizasi",
        fields: [
          { key: "orgName", label: "Tegishli organ", type: "text", required: true },
          { key: "applicant", label: "Fuqaro", type: "text", required: true },
          { key: "lostDoc", label: "Yo'qolgan hujjat turi", type: "text", required: true }
        ],
        body: (d) => `ARIZA\\nYo'qolgan hujjatni qayta tiklash to'g'risida\\n\\n\${d.orgName || '[Organ]'}\\n\${d.applicant || '[Fuqaro]'}\\n\\nMenga tegishli bo'lgan \${d.lostDoc || '[Hujjat turi]'} yo'qolganligi sababli, uning o'rniga yangi hujjat rasmiylashtirib berishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "umumiy_7",
        name: "Ruxsat berish to‘g‘risida ariza",
        desc: "Muayyan faoliyat, qayta rejalashtirish yoki ruxsatnoma olish arizasi",
        fields: [
          { key: "orgName", label: "Vakolatli organ", type: "text", required: true },
          { key: "applicant", label: "Murojaatchi", type: "text", required: true },
          { key: "permissionType", label: "Ruxsatnoma so'ralayotgan ish turi", type: "text", required: true }
        ],
        body: (d) => `ARIZA\\nRuxsatnoma berish to'g'risida\\n\\n\${d.orgName || '[Organ]'}\\n\${d.applicant || '[Murojaatchi]'}\\n\\nSizdan \${d.permissionType || '[Ish turi]'} bo'yicha qonuniy ruxsatnoma ajratishingizni so'rayman. Barcha zarur hujjatlar ilova qilinadi.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "umumiy_8",
        name: "Ro‘yxatdan o‘tkazish to‘g‘risida ariza",
        desc: "Mulk, huquq yoki yashash joyi bo'yicha ro'yxatga olish arizasi",
        fields: [
          { key: "orgName", label: "Ro'yxatdan o'tkazuvchi organ", type: "text", required: true },
          { key: "applicant", label: "Arizachi", type: "text", required: true },
          { key: "subject", label: "Ro'yxatga olinayotgan obyekt", type: "text", required: true }
        ],
        body: (d) => `ARIZA\\nDavlat ro'yxatidan o'tkazish to'g'risida\\n\\n\${d.orgName || '[Organ]'}\\n\${d.applicant || '[Arizachi]'}\\n\\nUshbu arizam orqali \${d.subject || '[Obyekt/Huquq]'}ni davlat reyestrida ro'yxatdan o'tkazishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "umumiy_9",
        name: "Davlat xizmatidan foydalanish bo‘yicha ariza",
        desc: "Yagona portal (my.gov.uz) yoki DXM orqali xizmat olish arizasi",
        fields: [
          { key: "serviceCenter", label: "Davlat xizmatlari markazi nomi", type: "text", required: true },
          { key: "applicant", label: "Arizachi", type: "text", required: true },
          { key: "serviceName", label: "Xizmat nomi", type: "text", required: true }
        ],
        body: (d) => `ARIZA\\nDavlat xizmati ko'rsatish haqida\\n\\n\${d.serviceCenter || '[Davlat xizmatlari markazi]'}\\n\${d.applicant || '[Arizachi]'}\\n\\nMenga «\${d.serviceName || '[Xizmat nomi]'}» davlat xizmatini ko'rsatishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "umumiy_10",
        name: "Tushuntirish xati",
        desc: "Ish yoki o'qish joyiga rasmiy tushuntirish xati",
        fields: [
          { key: "recipient", label: "Rahbar F.I.Sh.", type: "text", required: true },
          { key: "sender", label: "Xodim/talaba F.I.Sh.", type: "text", required: true },
          { key: "explanation", label: "Holat yuzasidan tushuntirish", type: "textarea", required: true }
        ],
        body: (d) => `TUSHUNTIRISH XATI\\n\\nKimga: \${d.recipient || '[Rahbar]'}\\nKimdan: \${d.sender || '[F.I.Sh.]'}\\n\\nMen quyidagi holat yuzasidan tushuntirish beraman:\\n\${d.explanation || '[Tushuntirish mazmuni]'}\\n\\nSana: \${today()}\\nImzo: _________________`
      }
    ]
  },
  {
    category: "Sud hujjatlari",
    icon: "ri-scales-3-line",
    docs: [
      {
        id: "sud_1",
        name: "Da’vo arizasi",
        desc: "Fuqarolik sudiga umumiy tartibdagi da'vo arizasi",
        fields: [
          { key: "court", label: "Sud nomi", type: "text", required: true },
          { key: "plaintiff", label: "Da'vogar", type: "text", required: true },
          { key: "defendant", label: "Javobgar", type: "text", required: true },
          { key: "demands", label: "Da'vo talablari", type: "textarea", required: true }
        ],
        body: (d) => `FUQAROLIK ISHLARI BO'YICHA \${d.court ? d.court.toUpperCase() : '[SUD]'}\\n\\nDa'vogar: \${d.plaintiff || '[Da\\'vogar]'}\\nJavobgar: \${d.defendant || '[Javobgar]'}\\n\\nDA'VO ARIZASI\\n\\nO'zbekiston Respublikasi Fuqarolik protsessual kodeksining 189-191-moddalariga asosan:\\n\${d.demands || '[Da\\'vo talablari]'}\\n\\nIlovalar: Davlat boji kvitansiyasi, da'voni tasdiqlovchi dalillar.\\n\\nSana: \${today()}\\nDa'vogar: _________________`
      },
      {
        id: "sud_2",
        name: "Qarzdorlikni undirish to‘g‘risida da’vo arizasi",
        desc: "Fuqarolar yoki tashkilotlar o'rtasidagi qarzni sud orqali undirish",
        fields: [
          { key: "court", label: "Sud nomi", type: "text", required: true },
          { key: "plaintiff", label: "Da'vogar", type: "text", required: true },
          { key: "defendant", label: "Javobgar (Qarzdor)", type: "text", required: true },
          { key: "amount", label: "Qarz summasi (so'm)", type: "number", required: true }
        ],
        body: (d) => `FUQAROLIK ISHLARI BO'YICHA \${d.court ? d.court.toUpperCase() : '[SUD]'}\\n\\nDa'vogar: \${d.plaintiff || '[Da\\'vogar]'}\\nJavobgar: \${d.defendant || '[Qarzdor]'}\\n\\nDA'VO ARIZASI\\nQarz summasini undirish to'g'risida\\n\\nDa'vo bahosi: \${d.amount ? Number(d.amount).toLocaleString('uz-UZ') : '[Summa]'} so'm\\n\\nO'zbekiston Respublikasi Fuqarolik kodeksining 732-736-moddalariga asosan javobgardan \${d.amount ? Number(d.amount).toLocaleString('uz-UZ') : '[Summa]'} so'm asosiy qarz va to'langan davlat bojini undirib berishingizni so'rayman.\\n\\nSana: \${today()}\\nDa'vogar: _________________`
      },
      {
        id: "sud_3",
        name: "Ish haqi undirish to‘g‘risida da’vo arizasi",
        desc: "Ish beruvchidan kechiktirilgan ish haqini sud orqali undirish",
        fields: [
          { key: "court", label: "Sud nomi", type: "text", required: true },
          { key: "plaintiff", label: "Xodim", type: "text", required: true },
          { key: "defendant", label: "Ish beruvchi", type: "text", required: true },
          { key: "salaryDebt", label: "Qarzdorlik miqdori", type: "number", required: true }
        ],
        body: (d) => `FUQAROLIK ISHLARI BO'YICHA \${d.court ? d.court.toUpperCase() : '[SUD]'}\\n\\nDa'vogar: \${d.plaintiff || '[Xodim]'}\\nJavobgar: \${d.defendant || '[Ish beruvchi]'}\\n\\nDA'VO ARIZASI\\nTo'lanmagan oylik ish haqini undirish to'g'risida\\n\\nMehnat kodeksining 253, 333-moddalariga ko'ra korxonadan \${d.salaryDebt ? Number(d.salaryDebt).toLocaleString('uz-UZ') : '[Summa]'} so'm miqdoridagi ish haqini undirishingizni so'rayman.\\n\\nSana: \${today()}\\nDa'vogar: _________________`
      },
      {
        id: "sud_4",
        name: "Zararni undirish to‘g‘risida da’vo arizasi",
        desc: "Yetkazilgan moddiy va ma'naviy zararni qoplash da'vosi",
        fields: [
          { key: "court", label: "Sud", type: "text", required: true },
          { key: "plaintiff", label: "Jabrlanuvchi (Da'vogar)", type: "text", required: true },
          { key: "defendant", label: "Zarar yetkazuvchi", type: "text", required: true },
          { key: "damageSum", label: "Zarar summasi (so'm)", type: "number", required: true }
        ],
        body: (d) => `FUQAROLIK ISHLARI BO'YICHA \${d.court ? d.court.toUpperCase() : '[SUD]'}\\n\\nDA'VO ARIZASI\\nYetkazilgan zararni qoplash to'g'risida\\n\\nO'zbekiston Respublikasi Fuqarolik kodeksining 985, 1021-moddalariga muvofiq, javobgardan mening foydamga \${d.damageSum ? Number(d.damageSum).toLocaleString('uz-UZ') : '[Summa]'} so'm moddiy zarar undirib berishingizni so'rayman.\\n\\nSana: \${today()}\\nDa'vogar: _________________`
      },
      {
        id: "sud_5",
        name: "Shartnomani bekor qilish to‘g‘risida da’vo arizasi",
        desc: "Majburiyatlar bajarilmaganligi sababli sud orqali shartnomani bekor qilish",
        fields: [
          { key: "court", label: "Sud", type: "text", required: true },
          { key: "plaintiff", label: "Da'vogar", type: "text", required: true },
          { key: "defendant", label: "Javobgar", type: "text", required: true },
          { key: "contractInfo", label: "Shartnoma rekvizitlari", type: "text", required: true }
        ],
        body: (d) => `DA'VO ARIZASI\\nShartnomani bekor qilish haqida\\n\\nFuqarolik kodeksining 382, 383-moddalariga muvofiq, javobgar tomonidan shartnoma shartlari jiddiy buzilganligi sababli \${d.contractInfo || '[Shartnoma]'}ni bekor qilishingizni so'rayman.\\n\\nSana: \${today()}\\nDa'vogar: _________________`
      },
      {
        id: "sud_6",
        name: "Ijara shartnomasini bekor qilish va qarzdorlikni undirish da’vosi",
        desc: "Ijarachini ko'chirish va qarzlarni undirish",
        fields: [
          { key: "court", label: "Sud", type: "text", required: true },
          { key: "landlord", label: "Mulkdor (Da'vogar)", type: "text", required: true },
          { key: "tenant", label: "Ijarachi (Javobgar)", type: "text", required: true },
          { key: "amount", label: "Qarzdorlik summasi", type: "number", required: true }
        ],
        body: (d) => `DA'VO ARIZASI\\nIjara shartnomasini bekor qilish, majburiy ko'chirish va qarzdorlikni undirish haqida\\n\\nFuqarolik kodeksining 551, 615-moddalariga asosan, javobgarni uydan majburiy tartibda ko'chirish va \${d.amount ? Number(d.amount).toLocaleString('uz-UZ') : '[Summa]'} so'm ijara qarzdorligini undirishingizni so'rayman.\\n\\nSana: \${today()}\\nDa'vogar: _________________`
      },
      {
        id: "sud_7",
        name: "Sudga iltimosnoma",
        desc: "Dalillarni talab qilib olish, ekspertiza tayinlash yoki sud majlisini qoldirish iltimosnomasi",
        fields: [
          { key: "court", label: "Sud nomi", type: "text", required: true },
          { key: "caseNumber", label: "Ish raqami", type: "text", required: true },
          { key: "petitioner", label: "Iltimosnoma kirituvchi", type: "text", required: true },
          { key: "requestText", label: "Iltimosnoma mazmuni", type: "textarea", required: true }
        ],
        body: (d) => `\${d.court ? d.court.toUpperCase() : '[SUD]'}GA\\nIsh № \${d.caseNumber || '[Ish raqami]'}\\n\\nILTIMOSNOMA\\n\\nO'zbekiston Respublikasi FPKning 40, 43-moddalariga muvofiq, quyidagilarni iltimos qilaman:\\n\${d.requestText || '[Iltimosnoma talabi]'}\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "sud_8",
        name: "Sudga tushuntirish xati",
        desc: "Da'vo yoki ish holati yuzasidan sudga yozma tushuntirish",
        fields: [
          { key: "court", label: "Sud nomi", type: "text", required: true },
          { key: "caseNumber", label: "Ish raqami", type: "text", required: true },
          { key: "partyName", label: "Tushuntirish beruvchi taraf", type: "text", required: true },
          { key: "explanation", label: "Yozma tushuntirish matni", type: "textarea", required: true }
        ],
        body: (d) => `\${d.court ? d.court.toUpperCase() : '[SUD]'}GA\\nIsh № \${d.caseNumber || '[Ish raqami]'}\\n\\nYOZMA TUSHUNTIRISH\\n\\n\${d.partyName || '[F.I.Sh.]'}dan\\n\\nMazkur ish yuzasidan quyidagi holatlarni ma'lum qilaman:\\n\${d.explanation || '[Tushuntirish matni]'}\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "sud_9",
        name: "Da’voga e’tiroz",
        desc: "Javobgarning da'vo talablarini rad etuvchi rasmiy e'tiroznoma",
        fields: [
          { key: "court", label: "Sud nomi", type: "text", required: true },
          { key: "defendant", label: "Javobgar", type: "text", required: true },
          { key: "objectionReasons", label: "Da'voga qarshi asoslar", type: "textarea", required: true }
        ],
        body: (d) => `DA'VOGA NISBATAN E'TIROZNOMA\\n\\n\${d.court ? d.court.toUpperCase() : '[SUD]'}\\nJavobgar: \${d.defendant || '[Javobgar]'}\\n\\nDa'vogar da'vosini quyidagi sabablarga ko'ra to'liq asossiz deb hisoblayman:\\n\${d.objectionReasons || '[Asoslar]'}\\n\\nFPKning 202-moddasiga asosan da'voni qanoatlantirishni rad etishingizni so'rayman.\\n\\nSana: \${today()}\\nJavobgar: _________________`
      },
      {
        id: "sud_10",
        name: "Sud qarori ustidan shikoyat namunasi",
        desc: "Birinchi instansiya sudi hal qiluv qarori ustidan apellyatsiya shikoyati",
        fields: [
          { key: "court", label: "Apellyatsiya sudi nomi", type: "text", required: true },
          { key: "firstInstanceCourt", label: "Qaror chiqargan tuman sudi", type: "text", required: true },
          { key: "appellant", label: "Shikoyatchi F.I.Sh.", type: "text", required: true },
          { key: "reasons", label: "Qarorning noqonuniy deb hisoblangan bandlari", type: "textarea", required: true }
        ],
        body: (d) => `APELLYATSIYA SHIKOYATI\\n\\n\${d.court ? d.court.toUpperCase() : '[APELLYATSIYA SUDI]'}\\nShikoyat beruvchi: \${d.appellant || '[F.I.Sh.]'}\\n\\n\${d.firstInstanceCourt || '[Tuman sudi]'}ning hal qiluv qarorini quyidagi asoslarga ko'ra noqonuniy deb hisoblayman:\\n\${d.reasons || '[Asoslar]'}\\n\\nFPKning 383, 399-moddalariga muvofiq, sud qarorini bekor qilib, yangi qaror qabul qilishingizni so'rayman.\\n\\nSana: \${today()}\\nImzo: _________________`
      }
    ]
  },
  {
    category: "Qarzdorlik va pul",
    icon: "ri-money-dollar-circle-line",
    docs: [
      {
        id: "qarz_1",
        name: "Tilxat — pul qarzi",
        desc: "Qarz olinganligi to'g'risida yozma tilxat",
        fields: [
          { key: "debtorName", label: "Qarz oluvchi F.I.Sh.", type: "text", required: true },
          { key: "debtorPassport", label: "Qarz oluvchi pasporti", type: "text", required: true },
          { key: "lenderName", label: "Qarz beruvchi F.I.Sh.", type: "text", required: true },
          { key: "amount", label: "Qarz summasi (so'm)", type: "number", required: true },
          { key: "returnDate", label: "Qaytarish muddati", type: "date", required: true }
        ],
        body: (d) => `TILXAT (QARZ TILXATI)\\n\\nMen, \${d.debtorName || '[Qarz oluvchi]'} (pasport: \${d.debtorPassport || '[Pasport]'}), ushbu tilxat orqali fuqaro \${d.lenderName || '[Qarz beruvchi]'}dan \${d.amount ? Number(d.amount).toLocaleString('uz-UZ') : '[Summa]'} so'm miqdorida qarz oldim.\\nUshbu qarz summasini \${d.returnDate ? new Date(d.returnDate).toLocaleDateString('uz-UZ') : '[Sana]'} kuniga qadar to'liq qaytarish majburiyatini olaman.\\n\\nTilxat o'z qo'lim bilan, ixtiyoriy ravishda yozildi.\\nSana: \${today()}\\nImzo: _________________ (\${d.debtorName || ''})`
      },
      {
        id: "qarz_2",
        name: "Qarzni qaytarish to‘g‘risida talabnoma",
        desc: "Muddati kelgan qarzni to'lash haqida yozma talab",
        fields: [
          { key: "lender", label: "Kreditor (Qarz beruvchi)", type: "text", required: true },
          { key: "debtor", label: "Qarzdor", type: "text", required: true },
          { key: "amount", label: "Qarz miqdori", type: "number", required: true }
        ],
        body: (d) => `TALABNOMA\\nQarzni qaytarish haqida\\n\\nKimga: \${d.debtor || '[Qarzdor]'}\\nKimdan: \${d.lender || '[Kreditor]'}\\n\\nSiz \${d.amount ? Number(d.amount).toLocaleString('uz-UZ') : '[Summa]'} so'm qarzni o'z vaqtida qaytarmadingiz. O'zbekiston Respublikasi Fuqarolik kodeksining 735-moddasiga asosan ushbu xat olingan kundan 10 kun ichida qarzni so'ndirishingizni talab qilaman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "qarz_3",
        name: "Qarzdorlikni tan olish to‘g‘risidagi hujjat",
        desc: "Qarzdor tomonidan mavjud qarzni tasdiqlash dalolatnomasi",
        fields: [
          { key: "debtor", label: "Qarzdor F.I.Sh.", type: "text", required: true },
          { key: "creditor", label: "Kreditor F.I.Sh.", type: "text", required: true },
          { key: "amount", label: "Tan olingan qarz summasi", type: "number", required: true }
        ],
        body: (d) => `QARZDORLIKNI TAN OLISH TO'G'RISIDA DALOLATNOMA\\n\\nMen, \${d.debtor || '[Qarzdor]'}, fuqaro/tashkilot \${d.creditor || '[Kreditor]'} oldida jami \${d.amount ? Number(d.amount).toLocaleString('uz-UZ') : '[Summa]'} so'm miqdorida qarzim borligini to'liq tan olaman va uni to'lashga majburiyat olaman.\\n\\nSana: \${today()}\\nQarzdor: _________________`
      },
      {
        id: "qarz_4",
        name: "Qarzdorlikni undirish bo‘yicha da’vo arizasi",
        desc: "Tilxat yoki shartnoma bo'yicha pulni sud orqali undirish",
        fields: [
          { key: "court", label: "Sud", type: "text", required: true },
          { key: "plaintiff", label: "Da'vogar", type: "text", required: true },
          { key: "defendant", label: "Javobgar", type: "text", required: true },
          { key: "amount", label: "Qarz summasi", type: "number", required: true }
        ],
        body: (d) => `DA'VO ARIZASI\\nQarzdorlikni undirish haqida\\n\\nFuqarolik kodeksining 732-moddasiga asosan, javobgardan \${d.amount ? Number(d.amount).toLocaleString('uz-UZ') : '[Summa]'} so'm qarzni undirib berishingizni so'rayman.\\n\\nSana: \${today()}\\nDa'vogar: _________________`
      },
      {
        id: "qarz_5",
        name: "Zararni qoplash to‘g‘risida talabnoma",
        desc: "Shartnoma buzilishi natijasida yetkazilgan zararni to'lash pretenziyasi",
        fields: [
          { key: "fromParty", label: "Zarar ko'rgan taraf", type: "text", required: true },
          { key: "toParty", label: "Aybdor taraf", type: "text", required: true },
          { key: "lossAmount", label: "Zarar miqdori (so'm)", type: "number", required: true }
        ],
        body: (d) => `TALABNOMA\\nZararni ixtiyoriy qoplash to'g'risida\\n\\nSizning noqonuniy yoki loqayd harakatingiz oqibatida menga \${d.lossAmount ? Number(d.lossAmount).toLocaleString('uz-UZ') : '[Summa]'} so'm moddiy zarar yetkazildi. Ushbu zararni 10 kun ichida qoplashingizni talab qilaman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "qarz_6",
        name: "To‘lovni talab qilish xati",
        desc: "Yetkazib berilgan tovar yoki xizmat uchun to'lovni talab qiluvchi rasmiy xat",
        fields: [
          { key: "supplier", label: "Yetkazib beruvchi", type: "text", required: true },
          { key: "buyer", label: "Buyurtmachi/Xaridor", type: "text", required: true },
          { key: "unpaidSum", label: "To'lanmagan summa", type: "number", required: true }
        ],
        body: (d) => `TO'LOVNI TALAB QILISH XATI\\n\\nKimga: \${d.buyer || '[Xaridor]'}\\nKimdan: \${d.supplier || '[Yetkazib beruvchi]'}\\n\\nHisobvaraq-fakturaga asosan yetkazib berilgan xizmatlar/mahsulotlar uchun to'lanmagan \${d.unpaidSum ? Number(d.unpaidSum).toLocaleString('uz-UZ') : '[Summa]'} so'mni 3 bank kuni ichida hisobraqamimizga o'tkazishingizni so'raymiz.\\n\\nSana: \${today()}\\nRahbar: _________________`
      }
    ]
  },
  {
    category: "Shartnomalar",
    icon: "ri-file-shield-2-line",
    docs: [
      {
        id: "shartnoma_1",
        name: "Oldi-sotdi shartnomasi",
        desc: "Tovar yoki buyum oldi-sotdisi bo'yicha namunaviy shartnoma",
        fields: [
          { key: "seller", label: "Sotuvchi", type: "text", required: true },
          { key: "buyer", label: "Xaridor", type: "text", required: true },
          { key: "item", label: "Oldi-sotdi predmeti", type: "text", required: true },
          { key: "price", label: "Narxi (so'm)", type: "number", required: true }
        ],
        body: (d) => `OLDI-SOTDI SHARTNOMASI\\n\\nSotuvchi: \${d.seller || '[Sotuvchi]'}\\nXaridor: \${d.buyer || '[Xaridor]'}\\n\\n1. Sotuvchi \${d.item || '[Mulk/Tovar]'}ni Xaridorga topshiradi, Xaridor esa uni qabul qilib, \${d.price ? Number(d.price).toLocaleString('uz-UZ') : '[Narx]'} so'm to'laydi.\\n2. Fuqarolik kodeksining 386-424-moddalari tatbiq etiladi.\\n\\nSotuvchi: _________________\\nXaridor: _________________`
      },
      {
        id: "shartnoma_2",
        name: "Xizmat ko‘rsatish shartnomasi",
        desc: "Haq evaziga xizmatlar ko'rsatish shartnomasi",
        fields: [
          { key: "contractor", label: "Ijrochi", type: "text", required: true },
          { key: "customer", label: "Buyurtmachi", type: "text", required: true },
          { key: "service", label: "Xizmat turi", type: "text", required: true },
          { key: "price", label: "Xizmat haqi", type: "number", required: true }
        ],
        body: (d) => `HAQ EVAZIGA XIZMAT KO'RSATISH SHARTNOMASI\\n\\nIjrochi: \${d.contractor || '[Ijrochi]'}\\nBuyurtmachi: \${d.customer || '[Buyurtmachi]'}\\n\\n1. Ijrochi \${d.service || '[Xizmat turi]'} xizmatini ko'rsatish, Buyurtmachi esa unga \${d.price ? Number(d.price).toLocaleString('uz-UZ') : '[Summa]'} so'm haq to'lash majburiyatini oladi.\\n2. Fuqarolik kodeksining 703-moddasiga asosan tartibga solinadi.\\n\\nIjrochi: ______________\\nBuyurtmachi: ______________`
      },
      {
        id: "shartnoma_3",
        name: "Ish bajarish/pudrat shartnomasi",
        desc: "Qurilish, ta'mirlash yoki mahsulot yasash pudrat shartnomasi",
        fields: [
          { key: "contractor", label: "Pudratchi", type: "text", required: true },
          { key: "client", label: "Buyurtmachi", type: "text", required: true },
          { key: "work", label: "Bajariladigan ish mazmuni", type: "text", required: true },
          { key: "cost", label: "Ish bahosi", type: "number", required: true }
        ],
        body: (d) => `PUDRAT SHARTNOMASI\\n\\nPudratchi: \${d.contractor || '[Pudratchi]'}\\nBuyurtmachi: \${d.client || '[Buyurtmachi]'}\\n\\nPudratchi \${d.work || '[Ish mazmuni]'} ishlarini o'z kuchi bilan bajaradi, Buyurtmachi esa ishni qabul qilib \${d.cost ? Number(d.cost).toLocaleString('uz-UZ') : '[Baho]'} so'm to'laydi.\\nFuqarolik kodeksining 631-655-moddalari amal qiladi.\\n\\nPudratchi: ______________\\nBuyurtmachi: ______________`
      },
      {
        id: "shartnoma_4",
        name: "Bepul foydalanish shartnomasi",
        desc: "Mulkdan tekin foydalanish (ssuda) shartnomasi",
        fields: [
          { key: "lender", label: "Ssuda beruvchi", type: "text", required: true },
          { key: "borrower", label: "Ssuda oluvchi", type: "text", required: true },
          { key: "property", label: "Mulk nomi", type: "text", required: true }
        ],
        body: (d) => `BEPUL FOYDALANISH (SSUDA) SHARTNOMASI\\n\\nSsuda beruvchi: \${d.lender || '[Taraf]'}\\nSsuda oluvchi: \${d.borrower || '[Taraf]'}\\n\\nSsuda beruvchi o'z mulki bo'lgan \${d.property || '[Mulk]'}ni Ssuda oluvchiga bepul vaqtinchalik foydalanish uchun topshiradi (FK 617-modda).\\n\\nTopshirdi: ______________\\nQabul qildi: ______________`
      },
      {
        id: "shartnoma_5",
        name: "Qarzdorlikni qaytarish kelishuvi",
        desc: "Qarzni bo'lib-bo'lib to'lash va muddatlarini belgilash kelishuvi",
        fields: [
          { key: "partyA", label: "Kreditor", type: "text", required: true },
          { key: "partyB", label: "Qarzdor", type: "text", required: true },
          { key: "schedule", label: "To'lov jadvali va summasi", type: "textarea", required: true }
        ],
        body: (d) => `QARZNI TO'LASH GRAFIGI KELISHUVI\\n\\nKreditor: \${d.partyA || '[Kreditor]'}\\nQarzdor: \${d.partyB || '[Qarzdor]'}\\n\\nTaraflar mavjud qarzni quyidagi tartibda to'lashga kelishdilar:\\n\${d.schedule || '[Jadval]'}\\n\\nKreditor: ______________\\nQarzdor: ______________`
      },
      {
        id: "shartnoma_6",
        name: "Hamkorlik shartnomasi",
        desc: "Birgalikdagi faoliyat va hamkorlik memorandumi",
        fields: [
          { key: "sideA", label: "1-Hamkor", type: "text", required: true },
          { key: "sideB", label: "2-Hamkor", type: "text", required: true },
          { key: "goal", label: "Hamkorlik maqsadi", type: "text", required: true }
        ],
        body: (d) => `HAMKORLIK SHARTNOMASI\\n\\n1-Taraf: \${d.sideA || '[Hamkor 1]'}\\n2-Taraf: \${d.sideB || '[Hamkor 2]'}\\n\\nTaraflar \${d.goal || '[Hamkorlik maqsadi]'} yo'nalishida o'zaro manfaatli asosda birgalikda faoliyat olib borishga kelishdilar.\\n\\n1-Taraf: ______________\\n2-Taraf: ______________`
      },
      {
        id: "shartnoma_7",
        name: "Maxfiylik to‘g‘risidagi kelishuv",
        desc: "Tijorat siri va konfidensial ma'lumotlarni oshkor qilmaslik (NDA)",
        fields: [
          { key: "discloser", label: "Ma'lumot beruvchi taraf", type: "text", required: true },
          { key: "recipient", label: "Ma'lumot oluvchi taraf", type: "text", required: true },
          { key: "penalty", label: "Oshkor qilganlik uchun jarima (so'm)", type: "number", required: true }
        ],
        body: (d) => `MAXFIYLIK TO'G'RISIDA KELISHUV (NDA)\\n\\nMa'lumot beruvchi: \${d.discloser || '[Taraf]'}\\nMa'lumot oluvchi: \${d.recipient || '[Taraf]'}\\n\\nMa'lumot oluvchi taqdim etilgan tijorat sirlarini uchinchi shaxslarga oshkor qilmaslik majburiyatini oladi. Ushbu majburiyat buzilgan taqdirda \${d.penalty ? Number(d.penalty).toLocaleString('uz-UZ') : '[Summa]'} so'm miqdorida jarima to'laydi.\\n\\nImzolar:\\n1-Taraf: ______________\\n2-Taraf: ______________`
      },
      {
        id: "shartnoma_8",
        name: "Shartnomani bekor qilish to‘g‘risidagi kelishuv",
        desc: "Taraflarning o'zaro roziligi bilan shartnomani tugatish kelishuvi",
        fields: [
          { key: "sideA", label: "1-Taraf", type: "text", required: true },
          { key: "sideB", label: "2-Taraf", type: "text", required: true },
          { key: "contractDetails", label: "Bekor qilinayotgan shartnoma raqami va sanasi", type: "text", required: true }
        ],
        body: (d) => `SHARTNOMANI BEKOR QILISH KELISHUVI\\n\\nTaraflar o'rtasida tuzilgan \${d.contractDetails || '[Shartnoma]'} ushbu kelishuv imzolangan kundan e'tiboran bekor qilingan deb hisoblanadi. Taraflarning bir-biriga moliyaviy e'tirozlari qolmadi.\\n\\n1-Taraf: ______________\\n2-Taraf: ______________`
      },
      {
        id: "shartnoma_9",
        name: "Shartnomaga qo‘shimcha kelishuv",
        desc: "Amaldagi shartnoma bandlariga o'zgartirish va qo'shimchalar kiritish",
        fields: [
          { key: "sideA", label: "1-Taraf", type: "text", required: true },
          { key: "sideB", label: "2-Taraf", type: "text", required: true },
          { key: "changes", label: "Kiritilayotgan o'zgartirishlar", type: "textarea", required: true }
        ],
        body: (d) => `SHARTNOMAGA QO'SHIMCHA KELISHUV\\n\\nTaraflar o'zaro kelishgan holda shartnomaga quyidagi o'zgartirishlarni kiritadilar:\\n\${d.changes || '[O\\'zgartirishlar]'}\\n\\nBoshqa bandlar o'zgarishsiz qoladi.\\n\\n1-Taraf: ______________\\n2-Taraf: ______________`
      }
    ]
  },
  {
    category: "Ishonchnoma va vakolat",
    icon: "ri-user-shared-line",
    docs: [
      {
        id: "ishonchnoma_1",
        name: "Umumiy ishonchnoma",
        desc: "Fuqaro nomidan harakat qilish uchun umumiy ishonchnoma (notarial tasdiqlash talab etilishi mumkin)",
        fields: [
          { key: "principal", label: "Ishonch bildiruvchi F.I.Sh.", type: "text", required: true },
          { key: "agent", label: "Vakil F.I.Sh.", type: "text", required: true },
          { key: "powers", label: "Berilayotgan vakolatlar ro'yxati", type: "textarea", required: true }
        ],
        body: (d) => `ISHONCHNOMA\\n\\nMen, \${d.principal || '[Ishonch bildiruvchi]'}, ushbu ishonchnoma orqali fuqaro \${d.agent || '[Vakil]'}ga quyidagi harakatlarni amalga oshirish vakolatini beraman:\\n\${d.powers || '[Vakolatlar]'}\\n\\nEslatma: Qonunchilikka binoan ko'chmas mulk va notarial bitimlar uchun notarius tasdiqlashi shart.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "ishonchnoma_2",
        name: "Avtomobilni boshqarish bo‘yicha ishonchnoma",
        desc: "Avtotransport vositasini boshqarish huquqi (e-notarius orqali rasmiylashtiriladi)",
        fields: [
          { key: "owner", label: "Mulkdor F.I.Sh.", type: "text", required: true },
          { key: "driver", label: "Haydovchi F.I.Sh.", type: "text", required: true },
          { key: "carDetails", label: "Avtomashina rusumi va davlat raqami", type: "text", required: true }
        ],
        body: (d) => `AVTOMOBIL BOSHQARISH UCHUN ISHONCHNOMA SHABLONI\\n\\nMulkdor: \${d.owner || '[Mulkdor]'}\\nIshonch bildirilgan shaxs: \${d.driver || '[Haydovchi]'}\\nAvtomobil: \${d.carDetails || '[Avtomobil]'}\\n\\nUshbu shaxsga transport vositasini boshqarish vakolati beriladi.\\nDiqqat: O'zbekiston qonunchiligiga ko'ra avtomobil ishonchnomalari notarial tasdiqlanishi yoki elektron sug'urta politsiyasiga kiritilishi shart.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "ishonchnoma_3",
        name: "Hujjatlarni olish uchun ishonchnoma",
        desc: "Pochta, arxiv yoki idoradan hujjatlarni qabul qilish ishonchnomasi",
        fields: [
          { key: "principal", label: "Ishonch bildiruvchi", type: "text", required: true },
          { key: "agent", label: "Vakil", type: "text", required: true },
          { key: "org", label: "Qaysi idoradan olinishi", type: "text", required: true }
        ],
        body: (d) => `ISHONCHNOMA\\nHujjatlarni qabul qilib olish uchun\\n\\n\${d.principal || '[Asosiy shaxs]'} fuqaro \${d.agent || '[Vakil]'}ga \${d.org || '[Idora]'}dan barcha tegishli hujjatlarni qabul qilish, imzo qo'yish vakolatini beradi.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "ishonchnoma_4",
        name: "Davlat organida vakillik qilish uchun ishonchnoma",
        desc: "Davlat idoralarida manfaatlarini himoya qilish ishonchnomasi",
        fields: [
          { key: "principal", label: "Fuqaro/Korxona", type: "text", required: true },
          { key: "agent", label: "Vakil", type: "text", required: true },
          { key: "orgName", label: "Davlat organi", type: "text", required: true }
        ],
        body: (d) => `ISHONCHNOMA\\n\\n\${d.principal || '[Asosiy shaxs]'} fuqaro \${d.agent || '[Vakil]'}ga \${d.orgName || '[Davlat organi]'}da o'z nomidan ariza topshirish va manfaatlarini himoya qilish vakolatini beradi.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "ishonchnoma_5",
        name: "Sudda vakillik qilish uchun ishonchnoma",
        desc: "Sud majlislarida qatnashish va da'vogar/javobgar nomidan ish yuritish",
        fields: [
          { key: "principal", label: "Ishonch bildiruvchi", type: "text", required: true },
          { key: "agent", label: "Sud vakili F.I.Sh.", type: "text", required: true },
          { key: "courtName", label: "Sud nomi", type: "text", required: true }
        ],
        body: (d) => `SUDDA VAKILLIK QILISH UCHUN ISHONCHNOMA\\n\\n\${d.principal || '[Asosiy shaxs]'} fuqaro \${d.agent || '[Sud vakili]'}ga \${d.courtName || '[Sud]'}da ko'rilayotgan fuqarolik/iqtisodiy ish bo'yicha barcha protsessual huquqlardan foydalanish vakolatini topshiradi (FPK 67-moddasi).\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "ishonchnoma_6",
        name: "Mulk bilan bog‘liq vakolat uchun ishonchnoma",
        desc: "Mulkni boshqarish va ta'mirlash bo'yicha vakolatnoma",
        fields: [
          { key: "owner", label: "Mulkdor", type: "text", required: true },
          { key: "agent", label: "Ishonchli shaxs", type: "text", required: true },
          { key: "propertyAddress", label: "Mulk manzili", type: "text", required: true }
        ],
        body: (d) => `MOL-MULKNI BOSHQARISH UCHUN ISHONCHNOMA\\n\\n\${d.owner || '[Mulkdor]'} fuqaro \${d.agent || '[Vakil]'}ga \${d.propertyAddress || '[Manzil]'} manzilida joylashgan mulkdan foydalanish, kommunal xizmatlar bilan shartnoma tuzish va saqlash vakolatini beradi.\\n\\nSana: \${today()}\\nImzo: _________________`
      }
    ]
  },
  {
    category: "Avtomobil",
    icon: "ri-car-line",
    docs: [
      {
        id: "avto_1",
        name: "Avtomobil oldi-sotdi shartnomasi",
        desc: "Avtotransport vositasini sotish shartnomasi (notarial tasdiqlash uchun shablon)",
        fields: [
          { key: "seller", label: "Sotuvchi F.I.Sh.", type: "text", required: true },
          { key: "buyer", label: "Xaridor F.I.Sh.", type: "text", required: true },
          { key: "carInfo", label: "Avtomashina rusumi, yili va davlat raqami", type: "text", required: true },
          { key: "price", label: "Sotuv bahosi (so'm)", type: "number", required: true }
        ],
        body: (d) => `AVTOMOBIL OLDI-SOTDI SHARTNOMASI\\n\\nSotuvchi: \${d.seller || '[Sotuvchi]'}\\nXaridor: \${d.buyer || '[Xaridor]'}\\n\\nSotuvchi o'ziga tegishli \${d.carInfo || '[Avtomobil ma\\'lumotlari]'} avtomashinasini Xaridorga sotadi, Xaridor esa \${d.price ? Number(d.price).toLocaleString('uz-UZ') : '[Narx]'} so'm to'lab qabul qiladi.\\nDiqqat: O'zbekiston qonunlariga muvofiq transport vositalari oldi-sotdi shartnomasi notarius tomonidan tasdiqlanishi shart.\\n\\nSotuvchi: ______________\\nXaridor: ______________`
      },
      {
        id: "avto_2",
        name: "Avtomobil ijara shartnomasi",
        desc: "Avtomashinani vaqtincha ijaraga berish shartnomasi",
        fields: [
          { key: "landlord", label: "Ijaraga beruvchi", type: "text", required: true },
          { key: "tenant", label: "Ijarachi", type: "text", required: true },
          { key: "car", label: "Avtomobil rusumi va raqami", type: "text", required: true },
          { key: "rent", label: "Ijara to'lovi (so'm)", type: "number", required: true }
        ],
        body: (d) => `AVTOTRANSPORT IJARA SHARTNOMASI\\n\\nIjaraga beruvchi: \${d.landlord || '[Ijaraga beruvchi]'}\\nIjarachi: \${d.tenant || '[Ijarachi]'}\\n\\n\${d.car || '[Avtomobil]'} avtomashinasi oylik \${d.rent ? Number(d.rent).toLocaleString('uz-UZ') : '[Summa]'} so'm evaziga ijaraga berildi.\\n\\nImzolar:\\nIjaraga beruvchi: ______________\\nIjarachi: ______________`
      },
      {
        id: "avto_3",
        name: "Avtomobilni qabul qilish-topshirish dalolatnomasi",
        desc: "Avtomobilning bosib o'tgan masofasi, holati va yoqilg'i darajasini qayd qilish",
        fields: [
          { key: "giver", label: "Topshiruvchi", type: "text", required: true },
          { key: "receiver", label: "Qabul qiluvchi", type: "text", required: true },
          { key: "mileage", label: "Probegi (km)", type: "number", required: true },
          { key: "defects", label: "Mavjud nuqsonlar yoki holati", type: "textarea", required: true }
        ],
        body: (d) => `AVTOMOBILNI QABUL QILISH-TOPSHIRISH DALOLATNOMASI\\n\\nTopshiruvchi: \${d.giver || '[F.I.Sh.]'}\\nQabul qiluvchi: \${d.receiver || '[F.I.Sh.]'}\\n\\nAvtomobil probegi: \${d.mileage || '[...]'} km.\\nHolati va nuqsonlar: \${d.defects || '[Holat tavsifi]'}.\\n\\nTopshirdi: ______________\\nQabul qildi: ______________`
      },
      {
        id: "avto_4",
        name: "Avtomobil bo‘yicha ishonchnoma",
        desc: "Avtomobil tasarruf qilish yoki boshqarish uchun ishonchnoma shabloni",
        fields: [
          { key: "owner", label: "Mulkdor", type: "text", required: true },
          { key: "agent", label: "Ishonchli shaxs", type: "text", required: true },
          { key: "car", label: "Avtomobil davlat raqami", type: "text", required: true }
        ],
        body: (d) => `AVTOMOBIL UCHUN ISHONCHNOMA\\n\\nMulkdor: \${d.owner || '[Mulkdor]'}\\nVakil: \${d.agent || '[Vakil]'}\\nAvtomobil: \${d.car || '[Raqam]'}\\n\\nVakilga avtomobilni texnik ko'rikdan o'tkazish, sug'urta qilish va boshqarish huquqi beriladi.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "avto_5",
        name: "Yo‘l-transport hodisasi bo‘yicha zarar talabnomasi",
        desc: "YTH aybdoriga yoki sug'urta kompaniyasiga zararni qoplash talabnomasi",
        fields: [
          { key: "victim", label: "Jabrlanuvchi F.I.Sh.", type: "text", required: true },
          { key: "culprit", label: "Aybdor / Sug'urta kompaniyasi", type: "text", required: true },
          { key: "damageAmount", label: "Zarar miqdori (so'm)", type: "number", required: true }
        ],
        body: (d) => `TALABNOMA\\nYTH natijasida yetkazilgan zararni qoplash haqida\\n\\nKimga: \${d.culprit || '[Aybdor/Sug\\'urta]'}\\nKimdan: \${d.victim || '[Jabrlanuvchi]'}\\n\\nYuz bergan YTH yuzasidan tuzilgan YPX bayonnomasiga ko'ra yetkazilgan \${d.damageAmount ? Number(d.damageAmount).toLocaleString('uz-UZ') : '[Summa]'} so'm moddiy zararni to'lab berishingizni talab qilaman.\\n\\nSana: \${today()}\\nImzo: _________________`
      },
      {
        id: "avto_6",
        name: "Avtomobilga yetkazilgan zararni undirish bo‘yicha da’vo",
        desc: "YTHda shikastlangan avtomobil ta'mir pulini sud orqali undirish da'vosi",
        fields: [
          { key: "court", label: "Sud nomi", type: "text", required: true },
          { key: "plaintiff", label: "Da'vogar", type: "text", required: true },
          { key: "defendant", label: "Javobgar", type: "text", required: true },
          { key: "damage", label: "Zarar summasi", type: "number", required: true }
        ],
        body: (d) => `FUQAROLIK ISHLARI BO'YICHA SUDGA\\n\\nDA'VO ARIZASI\\nAvtotransportga yetkazilgan zararni undirish to'g'risida\\n\\nFuqarolik kodeksining 985, 999-moddalariga asosan, javobgardan avtomobilga yetkazilgan \${d.damage ? Number(d.damage).toLocaleString('uz-UZ') : '[Summa]'} so'm zararni undirib berishingizni so'rayman.\\n\\nSana: \${today()}\\nDa'vogar: _________________`
      }
    ]
  },
  {
    category: "Oila va fuqarolik",
    icon: "ri-parent-line",
    docs: [
      {
        id: "oila_doc_1",
        name: "Nikohdan ajratish bo‘yicha ariza/da’vo namunasi",
        desc: "Fuqarolik sudiga nikohni bekor qilish to'g'risida da'vo arizasi",
        fields: [
          { key: "court", label: "Fuqarolik sudi nomi", type: "text", required: true },
          { key: "plaintiff", label: "Da'vogar F.I.Sh.", type: "text", required: true },
          { key: "defendant", label: "Javobgar F.I.Sh.", type: "text", required: true },
          { key: "children", label: "Voyaga yetmagan bolalar haqida ma'lumot", type: "text", required: true }
        ],
        body: (d) => `FUQAROLIK ISHLARI BO'YICHA \${d.court ? d.court.toUpperCase() : '[SUD]'}\\n\\nDa'vogar: \${d.plaintiff || '[Da\\'vogar]'}\\nJavobgar: \${d.defendant || '[Javobgar]'}\\n\\nDA'VO ARIZASI\\nNikohdan ajratish to'g'risida\\n\\nOila kodeksining 40-42-moddalariga muvofiq, birga yashash imkoni qolmaganligi sababli javobgar bilan o'rtamizdagi qonuniy nikohni bekor qilishingizni so'rayman.\\nBolalar: \${d.children || '[Bolalar]'}\\n\\nSana: \${today()}\\nDa'vogar: _________________`
      },
      {
        id: "oila_doc_2",
        name: "Aliment undirish bo‘yicha ariza/da’vo",
        desc: "Voyaga yetmagan bolalarning ta'minoti uchun aliment undirish to'g'risida sud buyrug'i arizasi",
        fields: [
          { key: "court", label: "Sud nomi", type: "text", required: true },
          { key: "plaintiff", label: "Arizachi (Ona/Ota)", type: "text", required: true },
          { key: "defendant", label: "Qarzdor ota/ona", type: "text", required: true },
          { key: "childrenCount", label: "Bolalar soni", type: "number", required: true }
        ],
        body: (d) => `FUQAROLIK ISHLARI BO'YICHA \${d.court ? d.court.toUpperCase() : '[SUD]'}\\n\\nARIZA\\nAliment undirish to'g'risida sud buyrug'i berish haqida\\n\\nOila kodeksining 96, 99-moddalariga asosan, javobgardan \${d.childrenCount || '1'} nafar voyaga yetmagan farzandimiz ta'minoti uchun har oylik daromadining qonunda belgilangan ulushida aliment undirish to'g'risida sud buyrug'i chiqarishingizni so'rayman.\\n\\nSana: \${today()}\\nArizachi: _________________`
      },
      {
        id: "oila_doc_3",
        name: "Aliment miqdorini o‘zgartirish bo‘yicha ariza",
        desc: "Moddiy yoki oilaviy ahvol o'zgarganligi munosabati bilan alimentni kamaytirish yoki oshirish",
        fields: [
          { key: "court", label: "Sud nomi", type: "text", required: true },
          { key: "applicant", label: "Da'vogar", type: "text", required: true },
          { key: "defendant", label: "Javobgar", type: "text", required: true },
          { key: "reasons", label: "Miqdorni o'zgartirish sabablari", type: "textarea", required: true }
        ],
        body: (d) => `DA'VO ARIZASI\\nAliment miqdorini o'zgartirish to'g'risida\\n\\nOila kodeksining 105-moddasiga asosan quyidagi sabablar tufayli:\\n\${d.reasons || '[Sabablar]'}\\nAliment miqdorini qayta ko'rib chiqishingizni so'rayman.\\n\\nSana: \${today()}\\nDa'vogar: _________________`
      },
      {
        id: "oila_doc_4",
        name: "Bola bilan bog‘liq huquqlar bo‘yicha ariza",
        desc: "Alohida yashayotgan ota/onaning bola bilan ko'rishish tartibini belgilash",
        fields: [
          { key: "court", label: "Sud", type: "text", required: true },
          { key: "parent", label: "Murojaat qiluvchi ota/ona", type: "text", required: true },
          { key: "otherParent", label: "Ikkinchi ota/ona", type: "text", required: true }
        ],
        body: (d) => `DA'VO ARIZASI\\nBola bilan ko'rishish va tarbiyalash tartibini belgilash haqida\\n\\nOila kodeksining 76-moddasiga binoan, farzandim bilan ko'rishish va muloqot qilish grafigini sud tartibida belgilab berishingizni so'rayman.\\n\\nSana: \${today()}\\nDa'vogar: _________________`
      },
      {
        id: "oila_doc_5",
        name: "Nikoh shartnomasi namunasi",
        desc: "Bo'lg'usi yoki amaldagi er-xotin o'rtasidagi mol-mulk huquqlarini tartibga soluvchi shartnoma",
        fields: [
          { key: "husband", label: "Er F.I.Sh.", type: "text", required: true },
          { key: "wife", label: "Xotin F.I.Sh.", type: "text", required: true },
          { key: "propertyRules", label: "Mulk bo'yicha maxsus kelishuvlar", type: "textarea", required: true }
        ],
        body: (d) => `NIKOH SHARTNOMASI NAMUNASI\\n\\nEr: \${d.husband || '[Er]'}\\nXotin: \${d.wife || '[Xotin]'}\\n\\nO'zbekiston Respublikasi Oila kodeksining 29-36-moddalariga muvofiq, taraflar nikoh davomida va undan keyin mol-mulk rejimini quyidagicha belgilaydilar:\\n\${d.propertyRules || '[Kelishuv bandlari]'}\\n\\nEslatma: Nikoh shartnomasi qonun bo'yicha notarial tartibda tasdiqlanishi shart.\\n\\nEr: ______________\\nXotin: ______________`
      },
      {
        id: "oila_doc_6",
        name: "Mulkni bo‘lish bo‘yicha da’vo arizasi",
        desc: "Nikoh bekor qilinganda er-xotinning umumiy mol-mulkini teng bo'lish da'vosi",
        fields: [
          { key: "court", label: "Sud", type: "text", required: true },
          { key: "plaintiff", label: "Da'vogar", type: "text", required: true },
          { key: "defendant", label: "Javobgar", type: "text", required: true },
          { key: "properties", label: "Bo'linadigan umumiy mol-mulklar ro'yxati", type: "textarea", required: true }
        ],
        body: (d) => `DA'VO ARIZASI\\nEr-xotinning umumiy mol-mulkini bo'lish to'g'risida\\n\\nOila kodeksining 23, 27, 28-moddalariga binoan birgalikdagi nikoh davrida orttirilgan quyidagi mol-mulklarni teng ulushlarda bo'lib berishingizni so'rayman:\\n\${d.properties || '[Mulklar]'}\\n\\nSana: \${today()}\\nDa'vogar: _________________`
      }
    ]
  },
  {
    category: "Tadbirkorlik",
    icon: "ri-building-4-line",
    docs: [
      {
        id: "biznes_doc_1",
        name: "Xizmat ko‘rsatish shartnomasi",
        desc: "Tadbirkorlik subyektlari o'rtasida professional xizmatlar shartnomasi",
        fields: [
          { key: "executor", label: "Ijrochi (MChJ/YaTT)", type: "text", required: true },
          { key: "client", label: "Buyurtmachi (Kompaniya)", type: "text", required: true },
          { key: "serviceScope", label: "Xizmatlar tavsifi", type: "text", required: true },
          { key: "fee", label: "Shartnoma summasi", type: "number", required: true }
        ],
        body: (d) => `XIZMAT KO'RSATISH SHARTNOMASI (B2B)\\n\\nIjrochi: \${d.executor || '[Ijrochi]'}\\nBuyurtmachi: \${d.client || '[Buyurtmachi]'}\\n\\nIjrochi \${d.serviceScope || '[Xizmat]'} bo'yicha sifatli xizmat ko'rsatish, Buyurtmachi esa \${d.fee ? Number(d.fee).toLocaleString('uz-UZ') : '[Summa]'} so'm miqdorida haq to'lash majburiyatini oladi.\\n\\nIjrochi: ______________\\nBuyurtmachi: ______________`
      },
      {
        id: "biznes_doc_2",
        name: "Hamkorlik shartnomasi",
        desc: "Biznes subyektlari o'rtasida qo'shma hamkorlik shartnomasi",
        fields: [
          { key: "party1", label: "1-Tadbirkorlik subyekti", type: "text", required: true },
          { key: "party2", label: "2-Tadbirkorlik subyekti", type: "text", required: true },
          { key: "purpose", label: "Hamkorlik maqsadi", type: "text", required: true }
        ],
        body: (d) => `BIZNES HAMKORLIK SHARTNOMASI\\n\\n1-Taraf: \${d.party1 || '[Kompaniya 1]'}\\n2-Taraf: \${d.party2 || '[Kompaniya 2]'}\\n\\nTaraflar \${d.purpose || '[Maqsad]'} loyihasini amalga oshirishda hamkorlik qiladilar.\\n\\nImzolar:\\n1-Taraf: ______________\\n2-Taraf: ______________`
      },
      {
        id: "biznes_doc_3",
        name: "Yetkazib berish shartnomasi",
        desc: "Ulgurji mahsulot va xomashyo yetkazib berish (postavka) shartnomasi",
        fields: [
          { key: "supplier", label: "Yetkazib beruvchi MChJ", type: "text", required: true },
          { key: "buyer", label: "Xaridor MChJ", type: "text", required: true },
          { key: "goods", label: "Mahsulotlar ro'yxati", type: "text", required: true },
          { key: "totalPrice", label: "Umumiy yetkazib berish summasi", type: "number", required: true }
        ],
        body: (d) => `YETKAZIB BERISH (POSTAVKA) SHARTNOMASI\\n\\nYetkazib beruvchi: \${d.supplier || '[Yetkazib beruvchi]'}\\nXaridor: \${d.buyer || '[Xaridor]'}\\n\\nYetkazib beruvchi shartnomada ko'rsatilgan \${d.goods || '[Mahsulot]'} tovarlarini shartnoma muddatida yetkazib beradi, Xaridor esa \${d.totalPrice ? Number(d.totalPrice).toLocaleString('uz-UZ') : '[Summa]'} so'm to'laydi (FK 437-modda).\\n\\nYetkazib beruvchi: ______________\\nXaridor: ______________`
      },
      {
        id: "biznes_doc_4",
        name: "Mahsulot oldi-sotdi shartnomasi",
        desc: "Kompaniyalar o'rtasida tovar oldi-sotdisi",
        fields: [
          { key: "seller", label: "Sotuvchi", type: "text", required: true },
          { key: "buyer", label: "Xaridor", type: "text", required: true },
          { key: "product", label: "Mahsulot", type: "text", required: true },
          { key: "amount", label: "Summa", type: "number", required: true }
        ],
        body: (d) => `MAHSULOT OLDI-SOTDI SHARTNOMASI\\n\\nSotuvchi: \${d.seller || '[Sotuvchi]'}\\nXaridor: \${d.buyer || '[Xaridor]'}\\n\\nMahsulot: \${d.product || '[Mahsulot]'}\\nJami summa: \${d.amount ? Number(d.amount).toLocaleString('uz-UZ') : '[Summa]'} so'm.\\n\\nSotuvchi: ______________\\nXaridor: ______________`
      },
      {
        id: "biznes_doc_5",
        name: "Pudrat shartnomasi",
        desc: "Tadbirkorlikda ishlab chiqarish yoki montaj pudrat shartnomasi",
        fields: [
          { key: "contractor", label: "Pudratchi korxona", type: "text", required: true },
          { key: "customer", label: "Buyurtmachi korxona", type: "text", required: true },
          { key: "scope", label: "Ish hajmi va loyiha", type: "text", required: true }
        ],
        body: (d) => `XO'JALIK PUDRAT SHARTNOMASI\\n\\nPudratchi: \${d.contractor || '[Pudratchi]'}\\nBuyurtmachi: \${d.customer || '[Buyurtmachi]'}\\n\\nPudratchi \${d.scope || '[Ish mazmuni]'} ishlarini o'z vaqtida va sifatli bajaradi.\\n\\nPudratchi: ______________\\nBuyurtmachi: ______________`
      },
      {
        id: "biznes_doc_6",
        name: "Talabnoma (pretenziya)",
        desc: "Hamkorga shartnoma majburiyatlarini buzganlik bo'yicha talabnoma",
        fields: [
          { key: "fromCompany", label: "Pretenziya yuboruvchi tashkilot", type: "text", required: true },
          { key: "toCompany", label: "Qarzdor korxona", type: "text", required: true },
          { key: "claimAmount", label: "Talab qilinayotgan summa", type: "number", required: true }
        ],
        body: (d) => `TALABNOMA (PRETENZIYA)\\n\\nKimga: \${d.toCompany || '[Kompaniya]'}\\nKimdan: \${d.fromCompany || '[Kompaniya]'}\\n\\nSiz amaldagi xo'jalik shartnomasi bo'yicha \${d.claimAmount ? Number(d.claimAmount).toLocaleString('uz-UZ') : '[Summa]'} so'm to'lovni kechiktirgansiz. Ushbu qarzdorlikni 10 kun ichida bartaraf etishingizni so'raymiz.\\n\\nDirektor: ______________`
      },
      {
        id: "biznes_doc_7",
        name: "Shartnomani bekor qilish to‘g‘risida xat",
        desc: "Hamkor korxonaga shartnomani bir tomonlama bekor qilish haqida rasmiy xat",
        fields: [
          { key: "sender", label: "Xat yuboruvchi tashkilot", type: "text", required: true },
          { key: "recipient", label: "Qabul qiluvchi tashkilot", type: "text", required: true },
          { key: "contractNumber", label: "Shartnoma raqami va sanasi", type: "text", required: true }
        ],
        body: (d) => `RASMIY XAT\\nShartnomani bekor qilish to'g'risida\\n\\nSiz bilan tuzilgan \${d.contractNumber || '[Shartnoma]'} shartnomaning 8-bandi va Fuqarolik kodeksiga asosan bekor qilinishini ma'lum qilamiz.\\n\\nRahbar: ______________`
      },
      {
        id: "biznes_doc_8",
        name: "Qarzdorlikni undirish to‘g‘risida talabnoma",
        desc: "Kontragentdan debitorlik qarzini talab qilish",
        fields: [
          { key: "creditor", label: "Kreditor korxona", type: "text", required: true },
          { key: "debtor", label: "Qarzdor korxona", type: "text", required: true },
          { key: "debt", label: "Qarz summasi", type: "number", required: true }
        ],
        body: (d) => `TALABNOMA\\nDebitorlik qarzini qoplash to'g'risida\\n\\n\${d.creditor || '[Kreditor]'} oldidagi \${d.debt ? Number(d.debt).toLocaleString('uz-UZ') : '[Summa]'} so'm qarzni zudlik bilan to'lashingizni talab qilamiz.\\n\\nDirektor: ______________`
      },
      {
        id: "biznes_doc_9",
        name: "Tadbirkorlik subyekti nomidan ariza",
        desc: "MChJ yoki YaTT nomidan davlat organlariga rasmiy xat-ariza",
        fields: [
          { key: "company", label: "Kompaniya nomi va STIR", type: "text", required: true },
          { key: "govAgency", label: "Davlat organi nomi", type: "text", required: true },
          { key: "subject", label: "Ariza mazmuni", type: "textarea", required: true }
        ],
        body: (d) => `ARIZA\\n\\n\${d.govAgency || '[Davlat organi]'}\\n\${d.company || '[Kompaniya nomi va STIR]'}\\n\\n\${d.subject || '[Ariza mazmuni]'}\\n\\nBosh direktor: _________________`
      },
      {
        id: "biznes_doc_10",
        name: "Tadbirkorlik subyekti nomidan ishonchnoma",
        desc: "Kompaniya xodimiga bank, bojxona yoki sudda ish yuritish uchun beriladigan ishonchnoma",
        fields: [
          { key: "company", label: "Kompaniya nomi va rekvizitlari", type: "text", required: true },
          { key: "employee", label: "Xodim F.I.Sh. va lavozimi", type: "text", required: true },
          { key: "powers", label: "Vakolatlar", type: "textarea", required: true }
        ],
        body: (d) => `KORPORATIV ISHONCHNOMA\\n\\n\${d.company || '[Kompaniya]'} o'z xodimi \${d.employee || '[Xodim]'}ga quyidagi vakolatlarni beradi:\\n\${d.powers || '[Vakolatlar]'}\\n\\nBosh direktor: _________________ (M.O'.)`
      }
    ]
  }
];

// Flatten all templates with numerical IDs
let idCounter = 1;
const allTemplates = [];

for (const group of categoriesData) {
  for (const doc of group.docs) {
    allTemplates.push({
      id: idCounter++,
      name: doc.name,
      icon: group.icon,
      category: group.category,
      desc: doc.desc,
      fields: doc.fields,
      bodyCode: doc.body.toString()
    });
  }
}

console.log(`Generated ${allTemplates.length} total document templates across ${categoriesData.length} categories.`);

// Build TypeScript source file for src/data/legalTemplates.ts
let tsSource = `export interface Field {
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
  fields: Field[];
  generate: (data: Record<string, string>) => string;
}

const today = () => new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });

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

for (const t of allTemplates) {
  tsSource += `  {
    id: ${t.id},
    name: ${JSON.stringify(t.name)},
    icon: ${JSON.stringify(t.icon)},
    category: ${JSON.stringify(t.category)},
    desc: ${JSON.stringify(t.desc)},
    fields: ${JSON.stringify(t.fields, null, 6)},
    generate: ${t.bodyCode}
  },
`;
}

tsSource += `];
`;

fs.writeFileSync('src/data/legalTemplates.ts', tsSource, 'utf-8');
console.log('Successfully wrote src/data/legalTemplates.ts!');
