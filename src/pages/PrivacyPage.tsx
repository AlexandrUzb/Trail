import { Link } from 'react-router-dom';

const sections = [
  {
    title: "1. To'planadigan ma'lumotlar",
    content: `Biz quyidagi ma'lumotlarni to'playmiz:

Hisobga olish ma'lumotlari:
• Ism va familiya
• Email manzili
• Telefon raqami (ixtiyoriy)

Foydalanish ma'lumotlari:
• Platformada yuborilgan savollar va so'rovlar
• Yaratilgan hujjatlar
• Qidiruv tarixi
• Kirish vaqti va qurilma ma'lumotlari`,
  },
  {
    title: "2. Ma'lumotlardan foydalanish maqsadlari",
    content: `Sizning ma'lumotlaringiz quyidagi maqsadlarda ishlatiladi:
• Xizmatlarni taqdim etish va takomillashtirish
• AI modelini yaxshilash (anonim shaklda)
• Texnik yordam ko'rsatish
• Xavfsizlikni ta'minlash
• Qonuniy majburiyatlarni bajarish

Biz sizning ma'lumotlaringizni reklama maqsadida uchinchi tomonlarga bermayiz.`,
  },
  {
    title: "3. Ma'lumotlarni saqlash va himoya qilish",
    content: `Barcha ma'lumotlar:
• SSL/TLS shifrlash orqali uzatiladi
• Xavfsiz serverlarda saqlanadi
• Faqat vakolatli xodimlarga ochiq
• Muntazam zaxira nusxalari olinadi

Hisob o'chirilgach, barcha shaxsiy ma'lumotlar 30 kun ichida o'chiriladi.`,
  },
  {
    title: "4. Cookie fayllar",
    content: `Biz cookie fayllaridan quyidagi maqsadlarda foydalanamiz:
• Sessiyani saqlash (zaruriy)
• Afzalliklaringizni eslab qolish
• Foydalanish statistikasi (anonim)

Brauzer sozlamalaringizda cookie fayllarni o'chirishingiz mumkin, lekin bu ba'zi funksiyalarning ishlamasligiga olib kelishi mumkin.`,
  },
  {
    title: '5. Uchinchi tomon xizmatlar',
    content: `Biz quyidagi uchinchi tomon xizmatlardan foydalanamiz:
• OpenAI (AI javoblari uchun)
• Google Fonts (shriftlar uchun)
• Cloudflare (CDN va xavfsizlik)

Ushbu xizmatlar o'zlarining maxfiylik siyosatiga ega.`,
  },
  {
    title: '6. Foydalanuvchi huquqlari',
    content: `Siz quyidagi huquqlarga egasiz:
• Ma'lumotlaringizga kirish va ko'rish
• Noto'g'ri ma'lumotlarni to'g'rilash
• Ma'lumotlaringizni o'chirish ("unutilish huquqi")
• Ma'lumot uzatishga cheklash qo'yish
• Ma'lumotlaringizni eksport qilish

Ushbu huquqlardan foydalanish uchun zokirovzafar881@gmail.com ga murojaat qiling.`,
  },
  {
    title: "7. Bolalarning maxfiyligi",
    content: `AdvokatAI 18 yoshdan kichik shaxslarga mo'ljallanmagan. Biz ataylab 18 yoshdan kichiklar haqida ma'lumot to'plamaymiz. Agar siz ota-ona yoki qo'riqchi bo'lsangiz va farzandingiz bizga ma'lumot taqdim etganini bilsangiz, darhol biz bilan bog'laning.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-teal-50/40">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Huquqiy</span>
          <h1 className="text-5xl font-bold text-gray-900 mt-3 mb-4">Maxfiylik Siyosati</h1>
          <p className="text-gray-500">Oxirgi yangilanish: 1 Yanvar 2025</p>
        </div>
      </section>

      {/* Notice */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-8">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-10 flex gap-4">
            <i className="ri-shield-check-line text-teal-600 text-2xl flex-shrink-0 mt-0.5"></i>
            <div>
              <h3 className="font-bold text-teal-900 mb-1">Maxfiyligingiz bizning ustuvorligimiz</h3>
              <p className="text-teal-800 text-sm leading-relaxed">
                AdvokatAI sizning shaxsiy ma'lumotlaringizni himoya qilishni eng muhim vazifasi deb biladi. Ushbu siyosat biz qanday ma'lumot to'plashimiz va undan qanday foydalanishimizni tushuntiradi.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Aloqa</h3>
            <p className="text-gray-700 text-sm mb-4">
              Maxfiylik siyosatimiz bo‘yicha savollaringiz bo‘lsa, biz bilan bog‘laning:
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <i className="ri-mail-line text-teal-600"></i>
                <a href="mailto:zokirovzafar881@gmail.com" className="text-teal-700 font-medium hover:underline">
                  zokirovzafar881@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <i className="ri-map-pin-line text-teal-600"></i>
                <span>Manzil: Termiz shahridagi Prezident maktabi</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <i className="ri-global-line text-teal-600"></i>
                <span>O‘zbekiston</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              <i className="ri-mail-line mr-2"></i>Biz bilan bog'laning
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
