import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const sectionsUz = [
  {
    title: '1. Umumiy qoidalar',
    content: `AIAdvokat platformasidan foydalanish ushbu Foydalanish shartlarini qabul qilishni anglatadi. Agar siz ushbu shartlarga rozi bo'lmasangiz, platformadan foydalanmang.

Platforma O'zbekiston Respublikasi qonunchiligiga muvofiq ishlaydi va faqat ma'lumot berish maqsadida mo'ljallangan.`,
  },
  {
    title: '2. Xizmatlar tavsifi',
    content: `AIAdvokat quyidagi xizmatlarni taqdim etadi:
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
    content: `AIAdvokat:
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
    content: `Platformadagi barcha kontent, dizayn, algoritmlar va ma'lumotlar bazasi AIAdvokat ga tegishli bo'lib, mualliflik huquqi bilan himoyalangan. Foydalanuvchilar ushbu materiallarni tijorat maqsadlarda nusxalashi, tarqatishi yoki ishlatishi taqiqlanadi.`,
  },
  {
    title: '7. Shartlarni o\'zgartirish',
    content: `AIAdvokat ushbu shartlarni istalgan vaqtda o'zgartirish huquqini o'zida saqlab qoladi. O'zgartirishlar platforma orqali e'lon qilinadi va kuchga kirgan kundan boshlab amal qiladi.`,
  },
];

const sectionsEn = [
  {
    title: '1. General Provisions',
    content: `Using the AIAdvokat platform signifies your acceptance of these Terms of Service. If you do not agree with these terms, do not use the platform.

The platform operates in accordance with the laws of the Republic of Uzbekistan and is intended solely for informational purposes.`,
  },
  {
    title: '2. Description of Services',
    content: `AIAdvokat provides the following services:
• AI-powered legal consultation and query responses
• Legal document templates and generation
• National law search engine for Uzbekistan
• Access to legal statutory knowledge bases

All answers are provided for informational purposes only and do not replace professional attorney counsel.`,
  },
  {
    title: '3. User Obligations',
    content: `Users agree to:
• Provide accurate and truthful information
• Use the platform exclusively for lawful purposes
• Avoid causing harm, disruption, or detriment to other users
• Respect intellectual property rights
• Safeguard their account security credentials`,
  },
  {
    title: '4. Limitation of Liability',
    content: `AIAdvokat:
• Does not guarantee absolute completeness or official binding nature of generated answers
• Is not liable for damages or consequences resulting from legal actions taken based on AI output
• Is not responsible for external third-party sites or referenced sources
• Does not guarantee uninterrupted 100% service uptime

The platform is powered by artificial intelligence; for formal legal disputes, consulting a certified licensed attorney is strongly advised.`,
  },
  {
    title: '5. Data Handling',
    content: `Information entered into the platform:
• May be utilized to improve service performance and model accuracy (in anonymized form)
• Will never be sold to third-party commercial brokers
• Is protected according to our Privacy Policy
• Can be deleted upon verified user request`,
  },
  {
    title: '6. Intellectual Property',
    content: `All interface designs, algorithms, codebases, and databases are the property of AIAdvokat and protected by copyright and intellectual property laws. Commercial reproduction or distribution without prior permission is strictly prohibited.`,
  },
  {
    title: '7. Amendments to Terms',
    content: `AIAdvokat reserves the right to modify these terms at any time. Changes will be posted directly on the platform and take effect from the date of publication.`,
  },
];

export default function TermsPage() {
  const { language, t } = useLanguage();
  const currentSections = language === 'en' ? sectionsEn : sectionsUz;

  return (
    <div className="min-h-screen bg-white pt-16">
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-teal-50/40">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">{t('terms_tag')}</span>
          <h1 className="text-5xl font-bold text-gray-900 mt-3 mb-4">{t('terms_title')}</h1>
          <p className="text-gray-500">{t('terms_last_update')}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-8">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10 flex gap-4">
            <i className="ri-information-line text-amber-500 text-2xl flex-shrink-0 mt-0.5"></i>
            <div>
              <h3 className="font-bold text-amber-900 mb-1">{t('terms_notice_title')}</h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                {t('terms_notice_desc')}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {currentSections.map((section) => (
              <div key={section.title} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm mb-4">{t('terms_questions')}</p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              <i className="ri-mail-line mr-2"></i>{t('cta_btn_contact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
