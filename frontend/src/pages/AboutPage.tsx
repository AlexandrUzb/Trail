import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function AboutPage() {
  const { language } = useLanguage();

  const stats = [
    {
      value: '24/7',
      label: language === 'en' ? 'Works 24/7' : '24/7 ishlaydi',
      sub: language === 'en' ? 'Round-the-clock legal assistance' : 'Tunu kun uzluksiz huquqiy yordam',
    },
    {
      value: '4500+',
      label: language === 'en' ? 'Legal Articles' : 'Moddalar soni',
      sub: language === 'en' ? 'Lex.uz laws & code articles' : 'Lex.uz qonun va kodeks moddalari',
    },
    {
      value: '250+',
      label: language === 'en' ? 'Legal Templates' : 'Hujjatlar soni',
      sub: language === 'en' ? 'Official forms, claims & contracts' : 'Rasmiy shablon va arizalar',
    },
  ];

  const missionPoints = [
    language === 'en' ? 'Fully grounded in Uzbekistan legislation' : "O'zbekiston qonunchiligiga to'liq asoslangan",
    language === 'en' ? '24/7 availability with zero wait time' : '24/7 mavjud, hech qanday kutish yo\'q',
    language === 'en' ? 'Clear, accessible language for everyone' : 'Barcha saviyada tushunarli tilda javob',
    language === 'en' ? 'Data is confidential and protected' : "Ma'lumotlaringiz himoyalangan va maxfiy",
  ];

  const audienceCards = [
    {
      icon: 'ri-user-line',
      label: language === 'en' ? 'For Citizens' : 'Fuqarolar uchun',
      desc: language === 'en' ? 'Resolve daily legal matters quickly and confidently' : 'Kundalik huquqiy savollarni hal qiling',
    },
    {
      icon: 'ri-briefcase-line',
      label: language === 'en' ? 'For Entrepreneurs' : 'Tadbirkorlar uchun',
      desc: language === 'en' ? 'Streamline contract compliance and business laws' : 'Biznes huquqiy masalalarini tezda yeching',
    },
    {
      icon: 'ri-scales-3-line',
      label: language === 'en' ? 'For Jurists' : 'Yuristlar uchun',
      desc: language === 'en' ? 'Accelerate research and alleviate workload' : 'Ish yukini yengillashtiring, tezlikni oshiring',
    },
  ];

  const techCards = [
    {
      icon: 'ri-brain-line',
      title: language === 'en' ? 'RAG Technology' : 'RAG Texnologiyasi',
      desc: language === 'en' ? 'Retrieval-Augmented Generation for pinpoint statutory search' : "Qonunlar bazasidan aniq ma'lumotlarni topish va taqdim etish",
    },
    {
      icon: 'ri-cpu-line',
      title: language === 'en' ? 'State-of-the-Art LLMs' : 'LLM Modellari',
      desc: language === 'en' ? 'Natural language dialog and accurate document synthesis' : 'Tabiiy til bilan muloqot va hujjat yaratish',
    },
    {
      icon: 'ri-links-line',
      title: language === 'en' ? 'Lex.uz Synchronization' : 'Lex.uz Integratsiyasi',
      desc: language === 'en' ? 'Direct indexing of Uzbekistan national legislation' : "O'zbekiston qonunlari bazasiga to'g'ridan-to'g'ri ulanish",
    },
    {
      icon: 'ri-server-line',
      title: language === 'en' ? 'FastAPI Backend' : 'FastAPI Backend',
      desc: language === 'en' ? 'High-performance, secure asynchronous data processing' : "Tez va xavfsiz ma'lumotlar qayta ishlash",
    },
  ];

  const valueCards = [
    {
      icon: 'ri-shield-check-line',
      title: language === 'en' ? 'Trust' : 'Ishonch',
      desc: language === 'en' ? 'Every response is strictly verified against official Uzbek statutes' : "Barcha ma'lumotlar rasmiy O'zbek qonunlari asosida taqdim etiladi",
    },
    {
      icon: 'ri-flashlight-line',
      title: language === 'en' ? 'Speed' : 'Tezlik',
      desc: language === 'en' ? 'Complex consultations and drafts generated within seconds' : "Javoblar va hujjatlar bir necha soniyada tayyor bo'ladi",
    },
    {
      icon: 'ri-hand-heart-line',
      title: language === 'en' ? 'Accessibility' : 'Qulaylik',
      desc: language === 'en' ? 'Simple interface and intuitive explanations — for everyone' : 'Oddiy interfeys va tushunarli til — hamma uchun',
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-gray-50 via-white to-teal-50/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full opacity-60 translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-50 rounded-full opacity-50 -translate-x-1/3 translate-y-1/4 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <i className="ri-information-line text-teal-500"></i>
            <span>{language === 'en' ? 'About Us' : 'Biz haqimizda'}</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {language === 'en' ? (
              <>
                <span className="notranslate" translate="no">AI Advokat</span> — accessible legal aid for<br />
                <span className="text-teal-600">every citizen</span>
              </>
            ) : (
              <>
                <span className="notranslate" translate="no">AI Advokat</span> — har bir fuqaro uchun<br />
                <span className="text-teal-600">huquqiy yordam</span>
              </>
            )}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {language === 'en'
              ? 'A fusion of modern technology and legal precision. Fast, reliable, and convenient solutions for the people of Uzbekistan.'
              : "Zamonaviy texnologiya va huquqiy bilimlarning uyg'unligi. O'zbekiston fuqarolariga tez, ishonchli va qulay yechim."}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-teal-600 mb-1">{s.value}</div>
                <div className="text-sm font-semibold text-gray-800 mb-1">{s.label}</div>
                <div className="text-xs text-gray-400">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">
                {language === 'en' ? 'Our Mission' : 'Missiyamiz'}
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-6">
                {language === 'en' ? (
                  <>Why <span className="notranslate" translate="no">AI Advokat</span>?</>
                ) : (
                  <>Nima uchun <span className="notranslate" translate="no">AI Advokat</span>?</>
                )}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                {language === 'en'
                  ? 'Professional legal consultation is often expensive and difficult to access. Many citizens do not know their rights or lack the means to defend them effectively.'
                  : "O'zbekistonda professional huquqiy maslahat ko'pincha qimmat va noqulay. Ko'plab fuqarolar huquqlarini bilmaydi yoki uni himoya qila olmaydi."}
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                {language === 'en'
                  ? 'We united artificial intelligence with the complete corpus of Uzbek laws — empowering anyone to access precise legal guidance anytime, anywhere.'
                  : "Biz sun'iy intellektni O'zbek qonunlari bazasi bilan birlashtirdik — endi har kim istalgan vaqtda, istalgan joyda aniq huquqiy ma'lumot ola oladi."}
              </p>
              <div className="space-y-3">
                {missionPoints.map((item) => (
                  <div key={item} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-teal-50 rounded flex items-center justify-center flex-shrink-0">
                      <i className="ri-check-line text-teal-600 text-xs"></i>
                    </div>
                    <span className="text-gray-600 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border border-teal-100">
              <div className="space-y-5">
                {audienceCards.map((item) => (
                  <div key={item.label} className="bg-white rounded-xl p-4 border border-white shadow-sm flex items-start space-x-4">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${item.icon} text-teal-600 text-base`}></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm mb-0.5">{item.label}</div>
                      <div className="text-gray-500 text-xs">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-20 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">
              {language === 'en' ? 'Technology' : 'Texnologiya'}
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">
              {language === 'en' ? 'Our Technological Foundation' : 'Bizning Texnologiyamiz'}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Leveraging modern AI to make national jurisprudence effortless and transparent for all'
                : "Ilg'or AI texnologiyalari yordamida O'zbek qonunchiligini hamma uchun qulay qilamiz"}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techCards.map((item) => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <i className={`${item.icon} text-white text-xl`}></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">
              {language === 'en' ? 'Values' : 'Qadriyatlar'}
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">
              {language === 'en' ? 'Our Core Values' : 'Bizning Qadriyatlarimiz'}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {valueCards.map((item) => (
              <div key={item.title} className="text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <i className={`${item.icon} text-2xl text-teal-600`}></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loyiha Asoschisi va Dasturchisi */}
      <section className="py-24 bg-gradient-to-b from-white via-gray-50/70 to-teal-50/30 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-12">
            <span className="text-teal-600 text-xs sm:text-sm font-semibold uppercase tracking-widest bg-teal-50 px-3.5 py-1 rounded-full border border-teal-100">
              {language === 'en' ? 'Project Founder' : 'Loyiha Asoschisi'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 mb-4">
              {language === 'en' ? 'Project Founder & Lead Developer' : 'Loyiha Asoschisi va Bosh Dasturchisi'}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
              {language === 'en'
                ? 'Pioneering artificial intelligence in the legal sphere of Uzbekistan and enhancing public legal literacy'
                : "O'zbekistonda yuridik sohada sun'iy intellektni joriy etish va fuqarolarning huquqiy savodxonligini oshirish tashabbuskori"}
            </p>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-10 shadow-lg hover:shadow-xl transition-all">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              {/* Photo & quick info */}
              <div className="md:col-span-4 flex flex-col items-center text-center">
                <div className="relative mb-4 group">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl blur-xs opacity-60 group-hover:opacity-100 transition duration-300"></div>
                  <img
                    src="/zafar_zokirov.jpg"
                    alt="Zafar Zokirov"
                    className="relative w-44 h-56 object-cover rounded-2xl border-2 border-white shadow-md"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 right-2 bg-teal-600 text-white p-1.5 rounded-xl shadow-sm">
                    <i className="ri-verified-badge-fill text-lg"></i>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Zafar Zokirov</h3>
                <p className="text-teal-700 font-semibold text-sm mt-0.5">
                  {language === 'en' ? 'Founder & Lead Developer' : 'Asoschi va Bosh Dasturchi'}
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-medium border border-teal-200/80">
                  {language === 'en' ? 'Presidential School in Termez · Grade 11' : 'Termiz Prezident maktabi · 11-sinf'}
                </span>
              </div>

              {/* Bio & Details */}
              <div className="md:col-span-8 space-y-5 text-left">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {language === 'en' ? 'The Future of Legal Technologies (LegalTech)' : 'Huquqiy Texnologiyalar (LegalTech) Kelajagi'}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {language === 'en' ? (
                      <>
                        I am Zafar Zokirov, an 11th-grade student at the Presidential School in Termez, Surkhandarya Region. My foremost mission in founding <strong className="notranslate" translate="no">AI Advokat</strong> is to provide Uzbekistan citizens with an accessible platform to deeply understand their legal rights, demystify complex statutes, and receive dependable legal assistance whenever needed.
                      </>
                    ) : (
                      <>
                        Men Zafar Zokirov, Surxondaryo viloyati Termiz shahridagi Prezident maktabining 11-sinf o'quvchisiman. <strong className="notranslate" translate="no">AI Advokat</strong> loyihasini yaratishdan asosiy maqsadim — O'zbekiston fuqarolariga o'z huquqlarini chuqur anglash, murakkab huquqiy me'yorlarni oddiy tilda tushunish va har qanday sharoitda professional yuridik yordam olish imkoniyatini taqdim etishdir.
                      </>
                    )}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {language === 'en'
                      ? 'The platform is anchored on Retrieval-Augmented Generation (RAG) technology. All answers are strictly grounded in the official Lex.uz national legislation database, key legal codes, and thousands of statutory articles.'
                      : "Platforma Retrieval-Augmented Generation (RAG) texnologiyasiga tayanadi. Barcha javoblar O'zbekiston Respublikasining Lex.uz rasmiy qonunchilik bazasiga, 5 ta asosiy kodeks va 3,000 dan ortiq huquqiy moddalarga qat'iy asoslangan holda shakllantiriladi."}
                  </p>
                </div>

                {/* Achievements / Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <i className="ri-graduation-cap-line text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                    <div>
                      <div className="text-xs font-bold text-gray-800">{language === 'en' ? 'Education' : "Ta'lim"}</div>
                      <div className="text-xs text-gray-500">{language === 'en' ? 'Presidential School in Termez · 11th Grade' : 'Termiz shahridagi Prezident maktabi 11-sinf'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <i className="ri-code-s-slash-line text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                    <div>
                      <div className="text-xs font-bold text-gray-800">{language === 'en' ? 'Specialization' : 'Ixtisoslashuv'}</div>
                      <div className="text-xs text-gray-500">{language === 'en' ? 'AI & Full-stack LegalTech Engineering' : 'AI & Full-stack LegalTech muhandisligi'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <i className="ri-scales-3-line text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                    <div>
                      <div className="text-xs font-bold text-gray-800">{language === 'en' ? 'Focus Area' : "Loyiha yo'nalishi"}</div>
                      <div className="text-xs text-gray-500">{language === 'en' ? 'Independent AI for National Jurisprudence' : "Milliy qonunchilik bo'yicha mustaqil AI"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <i className="ri-shield-star-line text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                    <div>
                      <div className="text-xs font-bold text-gray-800">{language === 'en' ? 'Mission' : 'Maqsad'}</div>
                      <div className="text-xs text-gray-500">{language === 'en' ? 'Accessible and transparent legal aid for all' : "Har bir fuqaro uchun qulay va ochiq yuridik ko'mak"}</div>
                    </div>
                  </div>
                </div>

                {/* Social Channels */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-gray-700">{language === 'en' ? 'Connect & Social Media:' : "Bog'lanish va ijtimoiy tarmoqlar:"}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href="tel:+998906950811"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl text-xs font-semibold transition-all border border-emerald-200 shadow-2xs"
                    >
                      <i className="ri-phone-fill text-sm"></i>
                      <span>+998 90 695 08 11</span>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/zafar-zokirov-5222a2354/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0077b5]/10 hover:bg-[#0077b5] text-[#0077b5] hover:text-white rounded-xl text-xs font-semibold transition-all border border-[#0077b5]/20 shadow-2xs"
                    >
                      <i className="ri-linkedin-box-fill text-sm"></i>
                      <span>LinkedIn</span>
                    </a>
                    <a
                      href="https://t.me/alexandr_o9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#229ED9]/10 hover:bg-[#229ED9] text-[#229ED9] hover:text-white rounded-xl text-xs font-semibold transition-all border border-[#229ED9]/20 shadow-2xs"
                    >
                      <i className="ri-telegram-fill text-sm"></i>
                      <span>Telegram: @alexandr_o9</span>
                    </a>
                    <a
                      href="https://instagram.com/alexandr_2oo9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E1306C]/10 hover:bg-[#E1306C] text-[#E1306C] hover:text-white rounded-xl text-xs font-semibold transition-all border border-[#E1306C]/20 shadow-2xs"
                    >
                      <i className="ri-instagram-fill text-sm"></i>
                      <span>Instagram: @alexandr_2oo9</span>
                    </a>
                    <a
                      href="mailto:zokirovzafar881@gmail.com"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-800 text-gray-700 hover:text-white rounded-xl text-xs font-semibold transition-all border border-gray-200 shadow-2xs"
                    >
                      <i className="ri-mail-fill text-sm"></i>
                      <span>zokirovzafar881@gmail.com</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-teal-600">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            {language === 'en' ? (
              <>Get Started with <span className="notranslate" translate="no">AI Advokat</span></>
            ) : (
              <><span className="notranslate" translate="no">AI Advokat</span> bilan tanishing</>
            )}
          </h2>
          <p className="text-teal-100 mb-10 text-lg max-w-xl mx-auto">
            {language === 'en' ? 'Resolve your legal questions today — fast and hassle-free' : "Huquqiy masalalaringizni bugun hal qiling — tez va oson boshlang"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/chat" className="inline-flex items-center justify-center bg-white text-teal-600 px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-teal-50 transition-colors whitespace-nowrap shadow-sm">
              <i className="ri-chat-3-line mr-2"></i>
              {language === 'en' ? 'Start Consultation' : 'Savol berishni boshlash'}
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center border-2 border-white/60 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors whitespace-nowrap">
              <i className="ri-mail-line mr-2"></i>
              {language === 'en' ? 'Contact Us' : "Biz bilan bog'laning"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
