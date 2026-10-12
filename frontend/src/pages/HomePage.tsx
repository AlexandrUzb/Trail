import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMarkdown } from '../components/FormattedMarkdown';
import { faqsData } from '../data/faqs';
import { useLanguage } from '../context/LanguageContext';

const suggestions = [
  "O'zbekistonda biznes ochish uchun qanday talablar bor?",
  'Mehnat nizosini qanday hal qilish mumkin?',
  'Ijarachilarning huquqlari qanday?',
];

function getAIResponse(question: string, language: string = 'uz'): string {
  const q = question.toLowerCase();
  const isEn = language === 'en';
  if (isEn) {
    if (q.includes('business') || q.includes('company') || q.includes('start'))
      return "To start a business in Uzbekistan: 1) Online registration through the single portal (my.gov.uz), 2) Opening a commercial bank account, 3) Obtaining any required licenses or permits. Under the Law on Guarantees of Freedom of Entrepreneurial Activity, both domestic and foreign founders enjoy statutory protections.";
    if (q.includes('labor') || q.includes('dispute') || q.includes('work') || q.includes('employ') || q.includes('salary'))
      return "Regarding labor disputes: Under the Labor Code of Uzbekistan, disputes are examined by the labor dispute commission or directly by the Interdistrict Civil Court. Workers are fully exempt from state filing fees for labor claims (Article 559). You can also report violations to the State Labor Inspectorate (hotline: 1176).";
    if (q.includes('tenant') || q.includes('rent') || q.includes('lease') || q.includes('apartment'))
      return "Key tenant rights under the Civil Code of Uzbekistan (Articles 535–564 & 600–615): 1) Undisturbed lawful occupancy during the contract period, 2) Capital maintenance is the landlord's obligation, 3) Protection against arbitrary eviction without a valid judicial court ruling.";
    return "Thank you for your question. Under Uzbekistan law, for detailed legal advice with Lex.uz citations, please visit the AI Advokat chat consultation page.";
  }
  if (q.includes('biznes') || q.includes('tadbirkor'))
    return "O‘zbekistonda biznes ochish uchun: 1) Soliq organida ro‘yxatdan o‘tish, 2) Bank hisobvaraqasi ochish, 3) Litsenziya yoki xabardor qilish (faoliyat turiga ko‘ra) talab etiladi. Tadbirkorlik faoliyati erkinligining kafolatlari to‘g‘risidagi qonunchilikka ko‘ra, jismoniy shaxslar yakka tartibdagi tadbirkor sifatida ham ro‘yxatdan o‘tishi mumkin.";
  if (q.includes('mehnat') || q.includes('ish'))
    return "Mehnat nizolari bo‘yicha: O‘zbekiston Respublikasi Mehnat kodeksiga asosan yakka tartibdagi mehnat nizolari mehnat nizolari komissiyasi (agar korxonada tuzilgan bo‘lsa) yoki to‘g‘ridan-to‘g‘ri fuqarolik ishlari bo‘yicha sud tomonidan ko‘rib chiqiladi. Shuningdek, xodimlar mehnat huquqlari buzilishi yuzasidan Davlat mehnat inspeksiyasiga (1176) murojaat qilishlari mumkin.";
  if (q.includes('ijara') || q.includes('ijarachi'))
    return "Ijarachilarning asosiy huquqlari: 1) Shartnomada belgilangan muddat davomida mulkdan to‘sqinliksiz foydalanish, 2) Asosiy (kapital) ta’mirlash ishlarini mulk egasidan talab qilish, 3) Qonunda belgilangan asoslarsiz va sud qarorisiz uy-joydan chiqarilmaslik. O‘zbekiston Respublikasi Fuqarolik kodeksining 535–564 va 600–615-moddalari ijara munosabatlarini tartibga soladi.";
  return "Savolingiz uchun rahmat. O‘zbekiston qonunchiligiga ko‘ra bu masala bo‘yicha aniq huquqiy tushuntirish olish uchun AI Advokat chat sahifasiga o‘ting.";
}

function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-teal-50/40 pt-20">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-50 rounded-full opacity-60 translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-50 rounded-full opacity-50 -translate-x-1/3 translate-y-1/4 pointer-events-none"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium">
              <i className="ri-sparkling-line text-teal-500"></i>
              <span>{t('hero_badge')}</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t('hero_title_1')}<br />
                <span className="text-teal-600">{t('hero_title_2')}</span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
                {t('hero_desc')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/chat" className="inline-flex items-center justify-center bg-gray-900 text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer shadow-sm">
                <i className="ri-chat-3-line mr-2"></i>{t('btn_ask_ai')}
              </Link>
              <Link to="/about" className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-7 py-3.5 rounded-full text-sm font-semibold hover:border-teal-500 hover:text-teal-600 transition-colors whitespace-nowrap cursor-pointer">
                {t('btn_learn_more')}
              </Link>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-1.5">
                <i className="ri-time-line text-teal-500"></i>
                <span>{t('hero_trust_247')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <i className="ri-shield-check-line text-teal-500"></i>
                <span>{t('hero_trust_secure')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <i className="ri-global-line text-teal-500"></i>
                <span>{t('hero_trust_laws')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: 'ri-time-line',
                color: 'text-teal-600 bg-teal-50',
                value: t('stat_users_val'),
                label: t('stat_users_label'),
                desc: t('stat_users_desc'),
              },
              {
                icon: 'ri-scales-3-line',
                color: 'text-cyan-600 bg-cyan-50',
                value: t('stat_articles_val'),
                label: t('stat_articles_label'),
                desc: t('stat_articles_desc'),
              },
              {
                icon: 'ri-file-text-line',
                color: 'text-emerald-600 bg-emerald-50',
                value: t('stat_templates_val'),
                label: t('stat_templates_label'),
                desc: t('stat_templates_desc'),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/95 backdrop-blur-xs border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex items-center space-x-5"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                  <i className={`${stat.icon} text-2xl`}></i>
                </div>
                <div>
                  <div className="flex items-baseline space-x-2.5 mb-1">
                    <span className="text-3xl font-extrabold text-gray-900">{stat.value}</span>
                    <span className="text-sm font-bold text-gray-800">{stat.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const { t, language } = useLanguage();
  const services = [
    {
      icon: 'ri-chat-3-line',
      color: 'bg-teal-600',
      title: t('srv_chat_title'),
      desc: t('srv_chat_desc'),
      features: [
        { icon: 'ri-flashlight-line', text: language === 'en' ? 'Instant responses' : 'Tezkor javoblar' },
        { icon: 'ri-scales-3-line', text: language === 'en' ? 'Grounded in law' : 'Qonunga asoslangan' },
        { icon: 'ri-global-line', text: language === 'en' ? 'Multilingual support' : "Ko'p tilli qo'llab-quvvatlash" },
        { icon: 'ri-brain-line', text: language === 'en' ? 'Understands legal context' : 'Kontekstni tushunadi' },
      ],
      link: '/chat',
      linkText: t('srv_chat_btn'),
    },
    {
      icon: 'ri-file-text-line',
      color: 'bg-cyan-500',
      title: t('srv_templates_title'),
      desc: t('srv_templates_desc'),
      features: [
        { icon: 'ri-file-list-line', text: language === 'en' ? '250+ verified templates' : '250+ tayyor shablonlar' },
        { icon: 'ri-article-line', text: language === 'en' ? 'Legal appeals & claims' : "Huquqiy shikoyatlar va da'volar" },
        { icon: 'ri-file-shield-line', text: language === 'en' ? 'Official document standards' : 'Rasmiy hujjat standartlari' },
        { icon: 'ri-magic-line', text: language === 'en' ? 'Custom generation' : 'Maxsus yaratish' },
      ],
      link: '/templates',
      linkText: t('srv_templates_btn'),
    },
    {
      icon: 'ri-search-line',
      color: 'bg-teal-400',
      title: t('srv_search_title'),
      desc: t('srv_search_desc'),
      features: [
        { icon: 'ri-scales-3-line', text: language === 'en' ? '4500+ statutory articles' : '4500+ qonun moddalari' },
        { icon: 'ri-search-2-line', text: language === 'en' ? 'Keyword & semantic search' : "Kalit so'z va semantik qidiruv" },
        { icon: 'ri-links-line', text: language === 'en' ? 'Citation & article analysis' : 'Iqtibos va moddalar tahlili' },
        { icon: 'ri-file-list-3-line', text: language === 'en' ? 'Legal precedents' : 'Huquqiy pretsedentlar' },
      ],
      link: '/search',
      linkText: t('srv_search_btn'),
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">{t('services_tag')}</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">{t('services_title')}</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {t('services_desc')}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((svc) => (
            <div key={svc.title} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all group">
              <div className={`w-14 h-14 ${svc.color} rounded-xl flex items-center justify-center mb-6`}>
                <i className={`${svc.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{svc.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{svc.desc}</p>
              <div className="space-y-2.5 mb-6">
                {svc.features.map((f) => (
                  <div key={f.text} className="flex items-center space-x-2.5">
                    <div className="w-5 h-5 bg-teal-50 rounded flex items-center justify-center flex-shrink-0">
                      <i className={`${f.icon} text-teal-600 text-xs`}></i>
                    </div>
                    <span className="text-gray-600 text-sm">{f.text}</span>
                  </div>
                ))}
              </div>
              <Link to={svc.link} className="text-teal-600 text-sm font-semibold hover:text-teal-700 cursor-pointer">
                {svc.linkText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChatDemoSection() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: language === 'en'
        ? "Hello! I am AI Advokat — your AI assistant on the laws of Uzbekistan. Ask any legal question, and I will help you."
        : "Salom! Men AI Advokat — O'zbekiston qonunlari bo'yicha sun'iy intellekt advokatingizman. Har qanday huquqiy savolingizni bering, sizga yordam beraman.",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        text: language === 'en'
          ? "Hello! I am AI Advokat — your AI assistant on the laws of Uzbekistan. Ask any legal question, and I will help you."
          : "Salom! Men AI Advokat — O'zbekiston qonunlari bo'yicha sun'iy intellekt advokatingizman. Har qanday huquqiy savolingizni bering, sizga yordam beraman.",
      }
    ]);
  }, [language]);

  useEffect(() => {
    // Only scroll internally inside the chat box container when user or assistant sends a new message
    if (messages.length > 1 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: 'user', text: text.trim() }]);
    setInput('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const reply = getAIResponse(text, language);
    setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    setLoading(false);
  };

  const currentSuggestions = language === 'en'
    ? [
        'What are the requirements for starting a business in Uzbekistan?',
        'How can a labor dispute be resolved?',
        'What are the legal rights of tenants in Uzbekistan?',
      ]
    : suggestions;

  return (
    <section className="py-24 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">{t('demo_tag')}</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">{t('demo_title')}</h2>
              <p className="text-gray-500 leading-relaxed">
                {t('demo_desc')}
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: 'ri-flashlight-line', title: t('demo_feat_1_title'), desc: t('demo_feat_1_desc') },
                { icon: 'ri-scales-3-line', title: t('demo_feat_2_title'), desc: t('demo_feat_2_desc') },
                { icon: 'ri-shield-check-line', title: t('demo_feat_3_title'), desc: t('demo_feat_3_desc') },
              ].map((item) => (
                <div key={item.title} className="flex items-start space-x-4">
                  <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`${item.icon} text-teal-600 text-base`}></i>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm mb-0.5">{item.title}</div>
                    <div className="text-gray-500 text-sm">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col h-[520px] overflow-hidden">
              <div className="flex items-center space-x-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-600 to-cyan-500 rounded-t-2xl">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-scales-3-line text-white text-lg"></i>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm notranslate" translate="no">AI Advokat</div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-green-300 rounded-full inline-block animate-pulse"></span>
                    <span className="text-teal-100 text-xs">
                      {language === 'en' ? "Online · Uzbekistan Legal AI Specialist" : "Online · O'zbek Huquq Mutaxassisi"}
                    </span>
                  </div>
                </div>
              </div>

              <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                        <i className="ri-scales-3-line text-teal-600 text-xs"></i>
                      </div>
                    )}
                    <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-teal-600 text-white rounded-br-sm' : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-sm'}`}>
                      <FormattedMarkdown content={msg.text} isUser={msg.role === 'user'} />
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <i className="ri-scales-3-line text-teal-600 text-xs"></i>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                {messages.length === 1 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs text-gray-400 font-medium">{t('demo_questions_label')}</p>
                    {currentSuggestions.map((s) => (
                      <button key={s} onClick={() => sendMessage(s)} className="block w-full text-left text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-3 py-2 rounded-lg transition-colors cursor-pointer">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-gray-100 bg-white">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-end space-x-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                    placeholder={t('demo_placeholder')}
                    rows={1}
                    maxLength={500}
                    className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none leading-relaxed max-h-28 overflow-y-auto"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="w-10 h-10 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <i className="ri-send-plane-fill text-sm"></i>
                  </button>
                </form>
                <p className="text-xs text-gray-400 mt-1.5 text-center">{t('demo_disclaimer')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSnippetSection() {
  const { language } = useLanguage();
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img
              alt="AI Advokat Jamoasi"
              className="w-full h-80 rounded-2xl shadow-lg object-cover object-top"
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop"
            />
          </div>
          <div className="space-y-8">
            <div>
              <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">
                {language === 'en' ? 'Our Story' : 'Bizning Tariximiz'}
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">
                {language === 'en' ? 'About AI Advokat' : 'AI Advokat Haqida'}
              </h2>
              <p className="text-gray-500 leading-relaxed">
                {language === 'en'
                  ? 'We are transforming legal services in Uzbekistan by pairing traditional jurisprudence with state-of-the-art artificial intelligence. Our mission is to make professional legal assistance accessible, affordable, and readily available to everyone.'
                  : "Biz an'anaviy huquqiy tajribani ilg'or sun'iy intellekt bilan birlashtirish orqali O'zbekistondagi huquqiy xizmatlarni inqilob qilmoqdamiz. Bizning maqsadimiz — professional huquqiy yordamni hamma uchun qulay, arzon va mavjud qilish."}
              </p>
            </div>
            <div className="space-y-5">
              {[
                {
                  title: language === 'en' ? 'Trusted by Legal Experts' : 'Huquqiy Mutaxassislar Ishonadi',
                  desc: language === 'en' ? 'Developed in close consultation with seasoned Uzbek attorneys and jurisprudence experts.' : "O'zbekistonlik tajribali yurist va huquq ekspertlari bilan hamkorlikda ishlab chiqilgan.",
                },
                {
                  title: language === 'en' ? 'AI-Powered Precision' : 'AI-quvvatlangan Aniqlik',
                  desc: language === 'en' ? 'Our AI is trained on exhaustive statutory corpora and updated continuously with the latest national regulations.' : "Bizning AI keng qamrovli huquqiy ma'lumotlar bazasida o'rgatilgan va eng so'nggi qoidalar bilan doimiy yangilanib turadi.",
                },
                {
                  title: language === 'en' ? 'Localized for Uzbekistan' : 'Mahalliy Tajriba',
                  desc: language === 'en' ? 'Tailored specifically for Uzbekistan’s legal system and cultural context.' : "O'zbekistonning huquqiy tizimi va madaniy konteksti uchun maxsus ishlab chiqilgan.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-check-line text-teal-600 text-sm"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">{item.title}</h4>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TechSection() {
  const { language } = useLanguage();
  const stack = [
    {
      icon: 'ri-brain-line',
      color: 'bg-teal-600',
      title: 'GPT + RAG',
      desc: language === 'en' ? 'Advanced language models fine-tuned on Uzbek statutory documents provide context-accurate legal analysis.' : "O'zbek huquqiy hujjatlarida o'rgatilgan ilg'or til modellari aniq va kontekstga mos javoblar beradi."
    },
    {
      icon: 'ri-database-2-line',
      color: 'bg-cyan-500',
      title: language === 'en' ? 'PostgreSQL Legal Database' : "PostgreSQL Ma'lumotlar Bazasi",
      desc: language === 'en' ? 'Stores national laws, codexes, and precedents for millisecond retrieval.' : "O'zbek qonunlari, qoidalari va huquqiy pretsedentlarni tez topish uchun saqlaydi."
    },
    {
      icon: 'ri-shield-check-line',
      color: 'bg-teal-400',
      title: language === 'en' ? 'Data Privacy & Encryption' : "Ma'lumotlar Maxfiyligi",
      desc: language === 'en' ? 'Enterprise-grade encryption ensuring all user conversations and generated drafts stay private.' : "Barcha foydalanuvchi so'rovlari va yaratilgan hujjatlar maxfiy qolishini ta'minlovchi korporativ darajadagi xavfsizlik."
    },
    {
      icon: 'ri-rocket-line',
      color: 'bg-teal-700',
      title: language === 'en' ? 'High-Performance API' : 'FastAPI Backend',
      desc: language === 'en' ? 'High-throughput backend infrastructure delivering sub-second response times.' : "Tezkor javoblar va muammosiz foydalanuvchi tajribasini ta'minlovchi yuqori unumdorlikdagi API infratuzilmasi."
    },
  ];

  const steps = [
    {
      icon: 'ri-question-line',
      color: 'bg-teal-600',
      title: language === 'en' ? 'User Question' : "Foydalanuvchi So'rovi",
      desc: language === 'en' ? 'You formulate your legal question in natural language.' : "Siz o'zingiz yoqtirgan tilda huquqiy savol berasiz"
    },
    {
      icon: 'ri-cpu-line',
      color: 'bg-cyan-500',
      title: language === 'en' ? 'AI Legal Processing' : 'AI Qayta Ishlash',
      desc: language === 'en' ? 'Our AI retrieves relevant statutory articles and analyzes the circumstances.' : "Bizning AI tegishli qonunlarni topadi va so'rovingizni tahlil qiladi"
    },
    {
      icon: 'ri-check-double-line',
      color: 'bg-teal-400',
      title: language === 'en' ? 'Actionable Answer' : 'Tezkor Javob',
      desc: language === 'en' ? 'You receive a legally referenced, clear response and document options.' : "O'zbek qonunlariga asoslangan aniq javoblar olasiz"
    },
  ];

  return (
    <section className="py-24 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">
            {language === 'en' ? 'Technology Foundation' : 'Texnologiya Asoslari'}
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">
            {language === 'en' ? 'Advanced AI Architecture' : "Ilg'or AI Texnologiyasi"}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {language === 'en' ? 'Engineered on a resilient technology stack designed for precision, enterprise security, and speed' : 'Aniqlik, xavfsizlik va miqyos uchun mo\'ljallangan mustahkam texnologik stekda qurilgan'}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stack.map((item) => (
            <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-5`}>
                <i className={`${item.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">{item.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              {language === 'en' ? 'How It Works' : 'Qanday Ishlaydi'}
            </h3>
            <p className="text-gray-500 text-sm">
              {language === 'en' ? 'Our AI-assisted legal aid workflow in three straightforward steps' : 'Bizning AI-quvvatlangan huquqiy yordam jarayoni uch oddiy qadamda'}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="text-center">
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-5 relative`}>
                    <i className={`${step.icon} text-white text-2xl`}></i>
                    <div className="absolute -top-2 -right-2 w-2 h-2 bg-teal-400 rounded-full"></div>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] h-0.5 bg-gray-100"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SupportSection() {
  const { t } = useLanguage();
  return (
    <section className="py-20 bg-slate-50 border-y border-gray-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
          ☕
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
          {t('support_title')}
        </h2>
        <p className="text-sm text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
          {t('support_desc')}
        </p>

        <div>
          <a
            href="https://buymeacoffee.com/advokatai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#FFDD00] hover:bg-[#FACC15] text-gray-900 font-extrabold px-7 py-3.5 rounded-2xl text-sm transition-transform hover:scale-105 shadow-md"
          >
            <span>{t('support_btn')}</span>
            <i className="ri-external-link-line text-sm"></i>
          </a>
        </div>
      </div>
    </section>
  );
}

function InvestorSection() {
  const { language } = useLanguage();
  const metrics = [
    {
      icon: 'ri-line-chart-line',
      color: 'bg-cyan-500',
      value: '50K+',
      label: language === 'en' ? 'Year 1 Target Users' : '1-yil Maqsadli Foydalanuvchilar',
      sub: language === 'en' ? 'Uzbek citizens and businesses' : "O'zbek fuqaro va korxonalar"
    },
    {
      icon: 'ri-heart-3-line',
      color: 'bg-teal-400',
      value: language === 'en' ? 'Open & Accessible' : 'Ochiq & Qulay',
      label: language === 'en' ? 'Project Model' : 'Loyiha Modeli',
      sub: language === 'en' ? 'Voluntary support' : "Ixtiyoriy qo'llab-quvvatlash"
    },
    {
      icon: 'ri-line-chart-line',
      color: 'bg-teal-700',
      value: '85%+',
      label: language === 'en' ? 'Target Gross Margin' : 'Yalpi Margin Maqsadi',
      sub: language === 'en' ? 'AI-powered, low marginal cost' : "AI-quvvatlangan, past marginal xarajat"
    },
  ];

  const advantages = [
    {
      icon: 'ri-rocket-line',
      title: language === 'en' ? 'First-Mover in Uzbek Legal AI' : "O'zbek huquqiy AI'da birinchi",
      desc: language === 'en' ? 'No direct competitor offering specialized legal AI solutions in Uzbekistan.' : "O'zbekiston bozorida AI-quvvatlangan huquqiy yordamda bevosita raqobatchi yo'q"
    },
    {
      icon: 'ri-brain-line',
      title: language === 'en' ? 'RAG-Trained on National Law' : "Mahalliy qonunlarda RAG-o'rgatilgan",
      desc: language === 'en' ? 'Retrieval-Augmented Generation fine-tuned specifically on statutory documents.' : "O'zbek huquqiy hujjatlarida maxsus o'rgatilgan Retrieval-Augmented Generation"
    },
    {
      icon: 'ri-translate-2',
      title: language === 'en' ? 'National Uzbek Language Support' : "Milliy O'zbek tili qo'llab-quvvatlash",
      desc: language === 'en' ? 'Comprehensive support for Uzbek, Russian, and English with deep cultural context.' : "Madaniy kontekst bilan O'zbek, Rus va Ingliz tillarini to'liq qo'llab-quvvatlash"
    },
    {
      icon: 'ri-government-line',
      title: language === 'en' ? 'Institutional Partnership Pipeline' : "Hukumat hamkorlik truboprovodi",
      desc: language === 'en' ? 'Active dialogue with institutions for official regulatory data synchronization.' : "Rasmiy integratsiya uchun Adliya vazirligi bilan faol muloqotlar"
    },
  ];

  const strategies = [
    {
      icon: 'ri-global-line',
      title: language === 'en' ? 'Central Asian Regional Expansion' : "Qozog'iston va Qirg'izistonga kengayish",
      desc: language === 'en' ? 'Targeting the regional Central Asian market within 18 months.' : "18 oy ichida Markaziy Osiyo bozorini egallash uchun mintaqaviy kengayish"
    },
    {
      icon: 'ri-briefcase-line',
      title: language === 'en' ? 'B2B Law Firm Partnerships' : "B2B huquq firmalari hamkorliklari",
      desc: language === 'en' ? 'White-label solutions for legal practices and enterprise compliance teams.' : "Mavjud yuridik amaliyot va konsultatsiyalar uchun white-label yechimlar"
    },
    {
      icon: 'ri-building-2-line',
      title: language === 'en' ? 'Public Sector Integration' : "Hukumat shartnoma imkoniyatlari",
      desc: language === 'en' ? 'Citizen digital services contracts and legal information portals.' : "Huquqiy axborot tizimlari va fuqarolarga xizmat ko'rsatish bo'yicha davlat sektor shartnomalari"
    },
    {
      icon: 'ri-graduation-cap-line',
      title: language === 'en' ? 'Legal Education Add-On' : "Huquqiy ta'lim platformasi qo'shimchasi",
      desc: language === 'en' ? 'Educational modules for law students and continuing jurisprudence training.' : "Huquq talabalari va uzluksiz huquqiy ta'lim uchun ta'lim modullari"
    },
  ];

  return (
    <section className="py-24 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">
            {language === 'en' ? 'For Investors' : 'Investorlar Uchun'}
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">
            {language === 'en' ? 'Business Model & Market Opportunity' : 'Biznes Modeli va Bozor Imkoniyati'}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {language === 'en' ? 'AI Advokat is strategically positioned to capture the burgeoning Central Asian LegalTech market.' : 'AI Advokat tez o\'sayotgan Markaziy Osiyo huquqiy-tech bozorini egallash uchun yaxshi joylashgan'}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {metrics.map((m) => (
            <div key={m.label} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className={`w-12 h-12 ${m.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <i className={`${m.icon} text-white text-xl`}></i>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{m.value}</div>
              <div className="text-sm font-semibold text-gray-900 mb-1">{m.label}</div>
              <div className="text-xs text-gray-500">{m.sub}</div>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {language === 'en' ? 'Competitive Advantages' : 'Raqobatbardosh Afzalliklar'}
            </h3>
            <div className="space-y-5">
              {advantages.map((a) => (
                <div key={a.title} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`${a.icon} text-teal-600 text-lg`}></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">{a.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {language === 'en' ? 'Growth Strategy' : "O'sish Strategiyasi"}
            </h3>
            <div className="space-y-5">
              {strategies.map((s) => (
                <div key={s.title} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`${s.icon} text-cyan-600 text-lg`}></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">{s.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 bg-gradient-to-br from-teal-600 to-cyan-500 rounded-2xl p-8 text-center shadow-lg">
          <h3 className="text-2xl font-bold text-white mb-3">
            {language === 'en' ? 'Interested in Partnering or Investing?' : 'Investitsiya qilishga qiziqasizmi?'}
          </h3>
          <p className="text-teal-50 mb-6 max-w-2xl mx-auto text-sm">
            {language === 'en' ? 'Join us in transforming legal technology across Central Asia. Connect with us to explore strategic partnership and investment opportunities.' : "Markaziy Osiyoda huquqiy xizmatlarni inqilob qilishda bizga qo'shiling. Investitsiya imkoniyatlari haqida ko'proq bilish uchun biz bilan bog'laning."}
          </p>
          <Link to="/contact" className="inline-flex items-center justify-center bg-white text-teal-600 px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-teal-50 transition-colors whitespace-nowrap cursor-pointer shadow-sm">
            <i className="ri-mail-line mr-2"></i>
            {language === 'en' ? 'Contact Investment Team' : 'Investitsiya Jamoasi bilan Bog\'lanish'}
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { t } = useLanguage();
  return (
    <section className="py-24 bg-teal-600">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">{t('cta_title')}</h2>
        <p className="text-teal-100 mb-10 max-w-2xl mx-auto">{t('cta_desc')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/chat" className="inline-flex items-center justify-center bg-white text-teal-600 px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-teal-50 transition-colors whitespace-nowrap cursor-pointer shadow-sm">
            <i className="ri-chat-3-line mr-2"></i>{t('cta_btn_chat')}
          </Link>
          <Link to="/contact" className="inline-flex items-center justify-center border-2 border-white/60 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer">
            <i className="ri-phone-line mr-2"></i>{t('cta_btn_contact')}
          </Link>
        </div>
      </div>
    </section>
  );
}

function HomeFounderSection() {
  const { language } = useLanguage();
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50/50 via-white to-teal-50/30 border-t border-gray-100">
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

            <div className="md:col-span-8 space-y-5 text-left">
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {language === 'en' ? 'The Future of Legal Technologies (LegalTech)' : 'Huquqiy Texnologiyalar (LegalTech) Kelajagi'}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {language === 'en' ? (
                    <>
                      I am Zafar Zokirov, an 11th-grade student at the Presidential School in Termez, Surkhandarya Region. My foremost mission in founding <strong>AI Advokat</strong> is to provide Uzbekistan citizens with an accessible platform to deeply understand their legal rights, demystify complex statutes, and receive dependable legal assistance whenever needed.
                    </>
                  ) : (
                    <>
                      Men Zafar Zokirov, Surxondaryo viloyati Termiz shahridagi Prezident maktabining 11-sinf o'quvchisiman. <strong>AI Advokat</strong> loyihasini yaratishdan asosiy maqsadim — O'zbekiston fuqarolariga o'z huquqlarini chuqur anglash, murakkab huquqiy me'yorlarni oddiy tilda tushunish va har qanday sharoitda professional yuridik yordam olish imkoniyatini taqdim etishdir.
                    </>
                  )}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'The platform is anchored on Retrieval-Augmented Generation (RAG) technology. All answers are strictly grounded in the official Lex.uz national legislation database, key legal codes, and thousands of statutory articles.'
                    : "Platforma Retrieval-Augmented Generation (RAG) texnologiyasiga tayanadi. Barcha javoblar O'zbekiston Respublikasining Lex.uz rasmiy qonunchilik bazasiga, 5 ta asosiy kodeks va 3,000 dan ortiq huquqiy moddalarga qat'iy asoslangan holda shakllantiriladi."}
                </p>
              </div>

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
              </div>

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
  );
}

function HomeFAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { language } = useLanguage();

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-8">
        <div className="text-center mb-12">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">
            {language === 'en' ? 'FAQ' : 'Savol-Javob'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">
            {language === 'en' ? 'Frequently Asked Questions' : "Tez-tez So'raladigan Savollar"}
          </h2>
          <p className="text-gray-500 text-sm">
            {language === 'en'
              ? 'Key insights regarding AI Advokat, its legal standing, and operational capabilities'
              : "AI Advokat platformasi, uning yuridik maqomi va imkoniyatlari haqida muhim ma'lumotlar"}
          </p>
        </div>

        <div className="space-y-4">
          {faqsData.map((faq, i) => {
            const question = language === 'en' && faq.questionEn ? faq.questionEn : faq.question;
            const answer = language === 'en' && faq.answerEn ? faq.answerEn : faq.answer;
            return (
              <div key={faq.id} className="bg-gray-50/70 hover:bg-gray-50 rounded-2xl border border-gray-200/80 transition-all overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                >
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base pr-4">{question}</h3>
                  <i className={`text-gray-400 text-xl transition-transform ${openFaq === i ? 'ri-arrow-up-s-line text-teal-600' : 'ri-arrow-down-s-line'}`}></i>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-1 border-t border-gray-100 bg-white/60">
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContactSnippet() {
  const { language } = useLanguage();
  return (
    <section className="py-24 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">
            {language === 'en' ? 'Contact' : 'Aloqa'}
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">
            {language === 'en' ? 'Get in Touch with Us' : "Biz bilan Bog'laning"}
          </h2>
          <p className="text-gray-500">
            {language === 'en'
              ? 'We would love to hear from you. Feel free to contact us anytime.'
              : "Sizdan eshitishdan mamnun bo'lamiz. Istalgan vaqtda murojaat qiling."}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: 'ri-mail-line', label: 'Email', value: 'zokirovzafar881@gmail.com' },
            { icon: 'ri-phone-line', label: language === 'en' ? 'Phone' : 'Telefon', value: '+998 90 695 08 11' },
            {
              icon: 'ri-map-pin-line',
              label: language === 'en' ? 'Address' : 'Manzil',
              value: language === 'en' ? 'Presidential School in Termez, Surkhandarya Region.' : 'Surxondaryo, Termiz shahridagi Prezident maktabi.',
            },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className={`${item.icon} text-teal-600 text-xl`}></i>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">{item.label}</div>
              <div className="text-sm font-medium text-gray-700 break-words">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <ServicesSection />
      <ChatDemoSection />
      <AboutSnippetSection />
      <TechSection />
      <SupportSection />
      <InvestorSection />
      <HomeFounderSection />
      <HomeFAQSection />
      <CTASection />
      <ContactSnippet />
    </div>
  );
}
