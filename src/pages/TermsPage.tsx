import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. Umumiy qoidalar',
    content: `AdvokatAI platformasidan foydalanish ushbu Foydalanish shartlarini qabul qilishni anglatadi. Agar siz ushbu shartlarga rozi bo'lmasangiz, platformadan foydalanmang.

Platforma O'zbekiston Respublikasi qonunchiligiga muvofiq ishlaydi va faqat ma'lumot berish maqsadida mo'ljallangan.`,
  },
  {
    title: '2. Xizmatlar tavsifi',
    content: `AdvokatAI quyidagi xizmatlarni taqdim etadi:
• AI asosidagi huquqiy maslahat va savollariga javoblar
• Huquqiy hujjat shablonlari va generatsiyasi
• O'zbekiston qonunlari bo'yicha qidiruv tizimi
• Huquqiy ma'lumotlar bazasiga kirish

Barcha javoblar faqat ma'lumot maqsadida bo'lib, professional yurist maslahati o'rnini bosmaydi.`,
  },
  {
    title: '3. Foydalanuvchi majburiyatlari',
    content: `Foydalanuvchi quyidagilarga majbur:
• To'g'ri va to'liq ma'lumot taqdim etish
• Platformadan qonuniy maqsadlarda foydalanish
• Boshqa foydalanuvchilarga zarar etkazmaslik
• Intellektual mulk huquqlarini hurmat qilish
• Hisobingiz xavfsizligini ta'minlash`,
  },
  {
    title: '4. Javobgarlik chegaralari',
    content: `AdvokatAI:
• Bergan ma'lumotlarning to'liqligi va aniqligi uchun kafolat bermaydi
• Huquqiy maslahat olish natijasida yuzaga kelgan zararlar uchun javobgar emas
• Uchinchi tomon saytlari va xizmatlari uchun javobgar emas
• Xizmatlarning uzluksiz ishlashini kafolatlamaydi

Platforma AI texnologiyasiga asoslangan bo'lib, barcha muhim huquqiy masalalar uchun rasmiy yuristga murojaat qilish tavsiya etiladi.`,
  },
  {
    title: "5. Ma'lumotlardan foydalanish",
    content: `Siz platformaga kiritgan ma'lumotlar:
• Xizmatni takomillashtirish uchun ishlatilishi mumkin
• Uchinchi shaxslarga sotilmaydi
• Maxfiylik siyosatimizga muvofiq himoyalanadi
• Talab bo'yicha o'chirilishi mumkin`,
  },
  {
    title: '6. Intellektual mulk',
    content: `Platformadagi barcha kontent, dizayn, algoritmlar va ma'lumotlar bazasi AdvokatAI ga tegishli bo'lib, mualliflik huquqi bilan himoyalangan. Foydalanuvchilar ushbu materiallarni tijorat maqsadlarda nusxalashi, tarqatishi yoki ishlatishi taqiqlanadi.`,
  },
  {
    title: '7. Shartlarni o\'zgartirish',
    content: `AdvokatAI ushbu shartlarni istalgan vaqtda o'zgartirish huquqini o'zida saqlab qoladi. O'zgartirishlar platforma orqali e'lon qilinadi va kuchga kirgan kundan boshlab amal qiladi.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-teal-50/40">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Huquqiy</span>
          <h1 className="text-5xl font-bold text-gray-900 mt-3 mb-4">Foydalanish Shartlari</h1>
          <p className="text-gray-500">Oxirgi yangilanish: 1 Yanvar 2025</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-8">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10 flex gap-4">
            <i className="ri-information-line text-amber-500 text-2xl flex-shrink-0 mt-0.5"></i>
            <div>
              <h3 className="font-bold text-amber-900 mb-1">Muhim eslatma</h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                AdvokatAI faqat ma'lumot berish maqsadida ishlaydi va professional huquqiy maslahat o'rnini bosa olmaydi. Muhim huquqiy masalalar uchun malakali yuristga murojaat qiling.
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

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm mb-4">Savollaringiz bormi?</p>
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
