import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const sectionsUz = [
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
• Afzalliklaringizni eslab qolish (til va interfeys)
• Foydalanish statistikasi (Google Analytics 4 orqali anonim tahlil)

Siz istalgan vaqtda saytning pastki qismidagi "Cookie sozlamalari" havolasi yoki brauzer sozlamalaringiz orqali tahliliy cookie fayllarni boshqarishingiz mumkin.`,
  },
  {
    title: '5. Uchinchi tomon xizmatlar',
    content: `Biz quyidagi uchinchi tomon xizmatlardan foydalanamiz:
• Google Analytics 4 (sayt tashriflarini anonim umumiy tahlil qilish)
• OpenAI va Google Gemini (sun'iy intellekt javoblari uchun)
• Google Fonts (shriftlar uchun)
• Cloudflare (CDN va xavfsizlik)

Ushbu xizmatlar o'zlarining rasmiy maxfiylik siyosatiga ega bo'lib, foydalanuvchilarning maxfiy yuridik savollari yoki shaxsiy ma'lumotlari tahlil xizmatlariga uzatilmaydi.`,
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
    content: `AIAdvokat 18 yoshdan kichik shaxslarga mo'ljallanmagan. Biz ataylab 18 yoshdan kichiklar haqida ma'lumot to'plamaymiz. Agar siz ota-ona yoki qo'riqchi bo'lsangiz va farzandingiz bizga ma'lumot taqdim etganini bilsangiz, darhol biz bilan bog'laning.`,
  },
];

const sectionsEn = [
  {
    title: "1. Information We Collect",
    content: `We collect the following categories of data:

Account Information:
• Full name
• Email address
• Phone number (optional)

Usage Data:
• Questions and legal queries submitted to the platform
• Documents created
• Search history
• Login timestamps and device technical metadata`,
  },
  {
    title: "2. Purposes of Data Processing",
    content: `Your data is processed strictly for:
• Providing and enhancing AI legal assistance
• Improving model accuracy (in anonymized form)
• Delivering technical support
• Protecting platform and user security
• Fulfilling applicable legal obligations

We never sell or disclose your personal data to commercial third-party advertisers.`,
  },
  {
    title: "3. Data Storage & Protection",
    content: `All information:
• Is transmitted via industry-standard SSL/TLS encryption
• Stored on secured, hardened cloud servers
• Accessible solely to authorized personnel
• Backed up regularly for disaster recovery

Upon account deletion, all personal data is permanently wiped within 30 days.`,
  },
  {
    title: "4. Cookie Files",
    content: `We utilize cookie files for:
• Session maintenance (essential)
• Remembering your preferences (e.g., chosen language and UI settings)
• Anonymous usage analytics via Google Analytics 4

You can manage or disable analytical cookies at any time via the "Cookie Settings" link in the footer or in your browser settings.`,
  },
  {
    title: "5. Third-Party Services",
    content: `We integrate trusted third-party providers:
• Google Analytics 4 (for anonymous, aggregated site traffic analytics)
• Google Gemini & OpenAI (for intelligent legal assistant responses)
• Google Fonts (for typography delivery)
• Cloudflare (for CDN caching and cyber protection)

Each provider adheres to international privacy and security benchmarks. Confidential legal inquiries and chat transcripts are never sent to analytics providers.`,
  },
  {
    title: "6. User Rights",
    content: `You possess the legal right to:
• Access and inspect your personal data
• Request correction of inaccurate information
• Request full erasure of your account ("Right to be Forgotten")
• Restrict data processing
• Export your data archive

To exercise any of these rights, contact us at zokirovzafar881@gmail.com.`,
  },
  {
    title: "7. Protection of Minors",
    content: `AIAdvokat is designed for individuals aged 18 and older. We do not knowingly collect personal data from minors. If you believe a minor has registered an account, please reach out to us immediately for prompt deletion.`,
  },
];

export default function PrivacyPage() {
  const { language, t } = useLanguage();
  const currentSections = language === 'en' ? sectionsEn : sectionsUz;

  return (
    <div className="min-h-screen bg-white pt-16">
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-teal-50/40">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">{t('terms_tag')}</span>
          <h1 className="text-5xl font-bold text-gray-900 mt-3 mb-4">{t('privacy_title')}</h1>
          <p className="text-gray-500">{t('terms_last_update')}</p>
        </div>
      </section>

      {/* Notice */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-8">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-10 flex gap-4">
            <i className="ri-shield-check-line text-teal-600 text-2xl flex-shrink-0 mt-0.5"></i>
            <div>
              <h3 className="font-bold text-teal-900 mb-1">{t('privacy_notice_title')}</h3>
              <p className="text-teal-800 text-sm leading-relaxed">
                {t('privacy_notice_desc')}
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

          <div className="mt-12 bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3">{t('privacy_contact_title')}</h3>
            <p className="text-gray-700 text-sm mb-4">
              {t('privacy_contact_desc')}
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
                <span>{language === 'en' ? 'Address: Presidential School in Termez, Surkhandarya' : 'Manzil: Termiz shahridagi Prezident maktabi'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <i className="ri-global-line text-teal-600"></i>
                <span>{language === 'en' ? 'Uzbekistan' : 'O‘zbekiston'}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
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
