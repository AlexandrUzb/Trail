import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMarkdown } from '../components/FormattedMarkdown';
import { faqsData } from '../data/faqs';

const initialMessage = {
  role: 'assistant',
  text: "Salom! Men AdvokatAI — O'zbekiston qonunlari bo'yicha sun'iy intellekt yordamchingizman. Har qanday huquqiy savolingizni bering, sizga yordam beraman.",
};

const suggestions = [
  "O'zbekistonda biznes ochish uchun qanday talablar bor?",
  'Mehnat nizosini qanday hal qilish mumkin?',
  'Ijarachilarning huquqlari qanday?',
];

function getAIResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('biznes') || q.includes('tadbirkor'))
    return "O‘zbekistonda biznes ochish uchun: 1) Soliq organida ro‘yxatdan o‘tish, 2) Bank hisobvaraqasi ochish, 3) Litsenziya yoki xabardor qilish (faoliyat turiga ko‘ra) talab etiladi. Tadbirkorlik faoliyati erkinligining kafolatlari to‘g‘risidagi qonunchilikka ko‘ra, jismoniy shaxslar yakka tartibdagi tadbirkor sifatida ham ro‘yxatdan o‘tishi mumkin.";
  if (q.includes('mehnat') || q.includes('ish'))
    return "Mehnat nizolari bo‘yicha: O‘zbekiston Respublikasi Mehnat kodeksiga asosan yakka tartibdagi mehnat nizolari mehnat nizolari komissiyasi (agar korxonada tuzilgan bo‘lsa) yoki to‘g‘ridan-to‘g‘ri fuqarolik ishlari bo‘yicha sud tomonidan ko‘rib chiqiladi. Shuningdek, xodimlar mehnat huquqlari buzilishi yuzasidan Davlat mehnat inspeksiyasiga (1176) murojaat qilishlari mumkin.";
  if (q.includes('ijara') || q.includes('ijarachi'))
    return "Ijarachilarning asosiy huquqlari: 1) Shartnomada belgilangan muddat davomida mulkdan to‘sqinliksiz foydalanish, 2) Asosiy (kapital) ta’mirlash ishlarini mulk egasidan talab qilish, 3) Qonunda belgilangan asoslarsiz va sud qarorisiz uy-joydan chiqarilmaslik. O‘zbekiston Respublikasi Fuqarolik kodeksining 535–564 va 600–615-moddalari ijara munosabatlarini tartibga soladi.";
  return "Savolingiz uchun rahmat. O‘zbekiston qonunchiligiga ko‘ra bu masala bo‘yicha aniq huquqiy tushuntirish olish uchun AdvokatAI chat sahifasiga o‘ting.";
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-teal-50/40 pt-20">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-50 rounded-full opacity-60 translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-50 rounded-full opacity-50 -translate-x-1/3 translate-y-1/4 pointer-events-none"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium">
              <i className="ri-sparkling-line text-teal-500"></i>
              <span>O'zbekiston uchun birinchi AdvokatAI</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Huquqiy Maslahat<br />
                <span className="text-teal-600">Sun'iy Intellekt bilan</span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
                O'zbek qonunlariga asoslangan tezkor va arzon huquqiy maslahat oling. Savollar bering, hujjatlar yarating va javoblar toping — barchasi bir platformada.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/chat" className="inline-flex items-center justify-center bg-gray-900 text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer shadow-sm">
                <i className="ri-chat-3-line mr-2"></i>AdvokatAI ga So'rang →
              </Link>
              <Link to="/about" className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-7 py-3.5 rounded-full text-sm font-semibold hover:border-teal-500 hover:text-teal-600 transition-colors whitespace-nowrap cursor-pointer">
                Ko'proq bilish
              </Link>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-1.5">
                <i className="ri-time-line text-teal-500"></i>
                <span>24/7 Mavjud</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <i className="ri-shield-check-line text-teal-500"></i>
                <span>Xavfsiz va Maxfiy</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <i className="ri-global-line text-teal-500"></i>
                <span>O'zbek Qonunlari</span>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-sm text-gray-400 mb-4">O'zbekistondagi mutaxassislar va fuqarolar ishonadi</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="text-2xl font-bold text-teal-600 mb-1">500+</div>
                  <div className="text-xs text-gray-500">Foydalanuvchilar</div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="text-2xl font-bold text-teal-600 mb-1">100%</div>
                  <div className="text-xs text-gray-500">O'zbek Qonunlari</div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="text-2xl font-bold text-teal-600 mb-1">24/7</div>
                  <div className="text-xs text-gray-500">Mavjud</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: 'ri-user-line', value: '500+', label: 'Foydalanuvchilar' },
              { icon: 'ri-question-answer-line', value: '2000+', label: 'Savollarga javob berilgan' },
              { icon: 'ri-customer-service-2-line', value: '24/7', label: 'AI Yordam' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                  <i className={`${stat.icon} text-teal-600 text-lg`}></i>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const services = [
    {
      icon: 'ri-chat-3-line',
      color: 'bg-teal-600',
      title: 'AI Huquqiy Chatbot',
      desc: "Huquqiy savollarni tabiiy tilda bering va O'zbek qonunlariga asoslangan tezkor javob oling. O'zbek, Rus va Ingliz tillarida 24/7 ishlaydi.",
      features: [
        { icon: 'ri-flashlight-line', text: 'Tezkor javoblar' },
        { icon: 'ri-scales-3-line', text: 'Qonunga asoslangan' },
        { icon: 'ri-global-line', text: "Ko'p tilli qo'llab-quvvatlash" },
        { icon: 'ri-brain-line', text: 'Kontekstni tushunadi' },
      ],
      link: '/chat',
      linkText: 'Maslahatni boshlash →',
    },
    {
      icon: 'ri-file-text-line',
      color: 'bg-cyan-500',
      title: 'Hujjat Generatori',
      desc: "AI yordami bilan professional huquqiy hujjatlar, shartnomalar, shikoyatlar va rasmiy shablonlar yarating. O'zbek huquqiy standartlariga mos.",
      features: [
        { icon: 'ri-file-list-line', text: 'Shartnoma shablonlari' },
        { icon: 'ri-article-line', text: 'Huquqiy shikoyatlar' },
        { icon: 'ri-file-shield-line', text: 'Rasmiy hujjatlar' },
        { icon: 'ri-magic-line', text: 'Maxsus yaratish' },
      ],
      link: '/templates',
      linkText: 'Hujjat yaratish →',
    },
    {
      icon: 'ri-search-line',
      color: 'bg-teal-400',
      title: 'Qonun Qidiruv Tizimi',
      desc: "Kalit so'zlar va tabiiy til so'rovlari yordamida tegishli maqolalar, bandlar va qonuniy normalarni toping. Keng qamrovli ma'lumotlar bazasi.",
      features: [
        { icon: 'ri-search-2-line', text: "Kalit so'z qidiruvi" },
        { icon: 'ri-bookmark-line', text: 'Maqola qidirish' },
        { icon: 'ri-links-line', text: 'Iqtibos topish' },
        { icon: 'ri-file-list-3-line', text: 'Huquqiy pretsedentlar' },
      ],
      link: '/search',
      linkText: 'Tadqiqotni boshlash →',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Xizmatlarimiz</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">O'zbekiston uchun keng qamrovli AI-huquqiy yordam</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Bizning AI platformasi O'zbekiston qonun tizimiga moslashtirilgan keng qamrovli huquqiy yordamni taqdim etadi
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
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
    const reply = getAIResponse(text);
    setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    setLoading(false);
  };

  return (
    <section className="py-24 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Hozir Sinab Ko'ring</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">AdvokatAI dan So'rang — Jonli</h2>
              <p className="text-gray-500 leading-relaxed">
                Huquqiy savolingizni yozing va O'zbekiston qonunchiligiga asoslangan tezkor, aniq javob oling. Ro'yxatdan o'tish shart emas.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: 'ri-flashlight-line', title: 'Tezkor Javoblar', desc: "Eng zamonaviy AI va Lex.uz milliy qonunchilik bazasi asosida soniyalar ichida keladi." },
                { icon: 'ri-scales-3-line', title: "O'zbek Qonuniga Yo'naltirilgan", desc: "O'zbekiston qonunlari, qoidalari va huquqiy pretsedentlari bo'yicha o'rgatilgan." },
                { icon: 'ri-shield-check-line', title: 'Maxfiy', desc: "Savollaringiz hech qachon saqlanmaydi yoki uchinchi shaxslarga uzatilmaydi." },
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
                  <div className="text-white font-semibold text-sm">AdvokatAI</div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-green-300 rounded-full inline-block animate-pulse"></span>
                    <span className="text-teal-100 text-xs">Online · O'zbek Huquq Mutaxassisi</span>
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
                    <p className="text-xs text-gray-400 font-medium">Savollar:</p>
                    {suggestions.map((s) => (
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
                    placeholder="Huquqiy savolingizni yozing… (Enter yuborish)"
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
                <p className="text-xs text-gray-400 mt-1.5 text-center">Faqat ma'lumot maqsadida · Professional huquqiy maslahat o'rnini bosmaydi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSnippetSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img
              alt="AdvokatAI Jamoasi"
              className="w-full h-80 rounded-2xl shadow-lg object-cover object-top"
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop"
            />
          </div>
          <div className="space-y-8">
            <div>
              <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Bizning Tariximiz</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">AdvokatAI Haqida</h2>
              <p className="text-gray-500 leading-relaxed">
                Biz an'anaviy huquqiy tajribani ilg'or sun'iy intellekt bilan birlashtirish orqali O'zbekistondagi huquqiy xizmatlarni inqilob qilmoqdamiz. Bizning maqsadimiz — professional huquqiy yordamni hamma uchun qulay, arzon va mavjud qilish.
              </p>
            </div>
            <div className="space-y-5">
              {[
                { title: 'Huquqiy Mutaxassislar Ishonadi', desc: "O'zbekistonlik tajribali yurist va huquq ekspertlari bilan hamkorlikda ishlab chiqilgan." },
                { title: 'AI-quvvatlangan Aniqlik', desc: "Bizning AI keng qamrovli huquqiy ma'lumotlar bazasida o'rgatilgan va eng so'nggi qoidalar bilan doimiy yangilanib turadi." },
                { title: 'Mahalliy Tajriba', desc: "O'zbekistonning huquqiy tizimi va madaniy konteksti uchun maxsus ishlab chiqilgan." },
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
  const stack = [
    { icon: 'ri-brain-line', color: 'bg-teal-600', title: 'GPT + RAG', desc: "O'zbek huquqiy hujjatlarida o'rgatilgan ilg'or til modellari aniq va kontekstga mos javoblar beradi." },
    { icon: 'ri-database-2-line', color: 'bg-cyan-500', title: "PostgreSQL Ma'lumotlar Bazasi", desc: "O'zbek qonunlari, qoidalari va huquqiy pretsedentlarni tez topish uchun saqlaydi." },
    { icon: 'ri-shield-check-line', color: 'bg-teal-400', title: "Ma'lumotlar Maxfiyligi", desc: "Barcha foydalanuvchi so'rovlari va yaratilgan hujjatlar maxfiy qolishini ta'minlovchi korporativ darajadagi xavfsizlik." },
    { icon: 'ri-rocket-line', color: 'bg-teal-700', title: 'FastAPI Backend', desc: "Tezkor javoblar va muammosiz foydalanuvchi tajribasini ta'minlovchi yuqori unumdorlikdagi API infratuzilmasi." },
  ];

  const steps = [
    { icon: 'ri-question-line', color: 'bg-teal-600', title: "Foydalanuvchi So'rovi", desc: "Siz o'zingiz yoqtirgan tilda huquqiy savol berasiz" },
    { icon: 'ri-cpu-line', color: 'bg-cyan-500', title: 'AI Qayta Ishlash', desc: "Bizning AI tegishli qonunlarni topadi va so'rovingizni tahlil qiladi" },
    { icon: 'ri-check-double-line', color: 'bg-teal-400', title: 'Tezkor Javob', desc: "O'zbek qonunlariga asoslangan aniq javoblar olasiz" },
  ];

  return (
    <section className="py-24 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Texnologiya Asoslari</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Ilg'or AI Texnologiyasi</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Aniqlik, xavfsizlik va miqyos uchun mo'ljallangan mustahkam texnologik stekda qurilgan</p>
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
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Qanday Ishlaydi</h3>
            <p className="text-gray-500 text-sm">Bizning AI-quvvatlangan huquqiy yordam jarayoni uch oddiy qadamda</p>
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

function PricingSnippet() {
  const plans = [
    {
      name: 'Bepul',
      price: '0',
      period: 'doim',
      desc: "AI huquqiy yordamini o'rganayotgan shaxslar uchun ideal",
      popular: false,
      btnClass: 'bg-gray-900 text-white hover:bg-gray-800',
      btnText: 'Bepul boshlash',
      btnLink: '/chat',
      features: [
        { label: 'AI Huquqiy Chatbot', sub: 'Kuniga 10 ta savol', on: true },
        { label: 'Qonun Qidiruv Tizimi', sub: 'Asosiy qidiruv', on: true },
        { label: 'Hujjat Shablonlari', sub: 'Asosiy shablonlar', on: true },
        { label: "Ko'p tilli qo'llab-quvvatlash", sub: "Faqat O'zbek", on: true },
        { label: 'Maxsus Hujjat Yaratish', sub: '', on: false },
        { label: 'Ustuvor Javob Vaqti', sub: '', on: false },
      ],
    },
    {
      name: 'Pro',
      price: '18,000',
      period: '/oy',
      desc: "Ishonchli huquqiy vositalarga muhtoj mutaxassislar uchun",
      popular: true,
      btnClass: 'bg-white text-teal-600 hover:bg-teal-50',
      btnText: 'Pro obunasi',
      btnLink: '/payment?plan=pro',
      features: [
        { label: 'AI Huquqiy Chatbot', sub: 'Kuniga 50 ta savol', on: true },
        { label: 'Qonun Qidiruv Tizimi', sub: "Kengaytirilgan + filtrlar", on: true },
        { label: 'Hujjat Shablonlari', sub: 'Barcha shablonlar', on: true },
        { label: "Ko'p tilli qo'llab-quvvatlash", sub: "O'Z, RU, EN", on: true },
        { label: 'Maxsus Hujjat Yaratish', sub: 'Oyiga 50 ta', on: true },
        { label: 'Ustuvor Javob Vaqti', sub: '2 soniyadan kam', on: true },
      ],
    },
    {
      name: 'Premium',
      price: '30,000',
      period: '/oy',
      desc: "To'liq integratsiya va miqyos talab qiluvchi firmalar uchun",
      popular: false,
      btnClass: 'bg-gray-900 text-white hover:bg-gray-800',
      btnText: 'Premium obunasi',
      btnLink: '/payment?plan=premium',
      features: [
        { label: 'AI Huquqiy Chatbot', sub: "Kuniga 200 ta savol", on: true },
        { label: 'Qonun Qidiruv Tizimi', sub: "To'liq ma'lumotlar bazasi", on: true },
        { label: 'Hujjat Shablonlari', sub: 'Brendlangan shablonlar', on: true },
        { label: "Ko'p tilli qo'llab-quvvatlash", sub: "O'Z, RU, EN + maxsus", on: true },
        { label: 'Maxsus Hujjat Yaratish', sub: 'Cheksiz', on: true },
        { label: 'Ustuvor Javob Vaqti', sub: '500ms dan kam', on: true },
      ],
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Narxlar</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Oddiy, Shaffof Rejalar</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Huquqiy ehtiyojlaringizga mos rejani tanlang</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-8 relative ${plan.popular ? 'bg-teal-600 border-2 border-teal-600 shadow-xl transform scale-105' : 'bg-white border-2 border-gray-200 hover:shadow-lg transition-shadow'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-400 text-gray-900 px-4 py-1 rounded-full text-xs font-bold">Mashhur</span>
                </div>
              )}
              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <div className="flex items-baseline mb-1">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                  <span className={`ml-1.5 text-sm ${plan.popular ? 'text-teal-100' : 'text-gray-500'}`}> so'm {plan.period}</span>
                </div>
                <p className={`text-sm ${plan.popular ? 'text-teal-100' : 'text-gray-500'}`}>{plan.desc}</p>
              </div>
              <div className="space-y-4 mb-8">
                {plan.features.map((f) => (
                  <div key={f.label} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <i className={`text-lg ${f.on ? (plan.popular ? 'ri-check-line text-white' : 'ri-check-line text-teal-600') : (plan.popular ? 'ri-close-line text-teal-300' : 'ri-close-line text-gray-300')}`}></i>
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${f.on ? (plan.popular ? 'text-white' : 'text-gray-900') : (plan.popular ? 'text-teal-200' : 'text-gray-400')}`}>{f.label}</div>
                      {f.sub && <div className={`text-xs ${plan.popular ? 'text-teal-100' : 'text-gray-500'}`}>{f.sub}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <Link to={plan.btnLink} className={`block w-full text-center py-3 rounded-xl font-semibold transition-colors text-sm cursor-pointer ${plan.btnClass}`}>
                {plan.btnText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InvestorSection() {
  const metrics = [
    { icon: 'ri-line-chart-line', color: 'bg-cyan-500', value: '50K+', label: '1-yil Maqsadli Foydalanuvchilar', sub: "O'zbek fuqaro va korxonalar" },
    { icon: 'ri-line-chart-line', color: 'bg-teal-400', value: 'SaaS + API', label: 'Daromad Modeli', sub: 'Davriy obunalar + foydalanish' },
    { icon: 'ri-line-chart-line', color: 'bg-teal-700', value: '85%+', label: 'Yalpi Margin Maqsadi', sub: "AI-quvvatlangan, past marginal xarajat" },
  ];

  const advantages = [
    { icon: 'ri-rocket-line', title: "O'zbek huquqiy AI'da birinchi", desc: "O'zbekiston bozorida AI-quvvatlangan huquqiy yordamda bevosita raqobatchi yo'q" },
    { icon: 'ri-brain-line', title: "Mahalliy qonunlarda RAG-o'rgatilgan", desc: "O'zbek huquqiy hujjatlarida maxsus o'rgatilgan Retrieval-Augmented Generation" },
    { icon: 'ri-translate-2', title: "Milliy O'zbek tili qo'llab-quvvatlash", desc: "Madaniy kontekst bilan O'zbek, Rus va Ingliz tillarini to'liq qo'llab-quvvatlash" },
    { icon: 'ri-government-line', title: "Hukumat hamkorlik truboprovodi", desc: "Rasmiy integratsiya uchun Adliya vazirligi bilan faol muloqotlar" },
  ];

  const strategies = [
    { icon: 'ri-global-line', title: "Qozog'iston va Qirg'izistonga kengayish", desc: "18 oy ichida Markaziy Osiyo bozorini egallash uchun mintaqaviy kengayish" },
    { icon: 'ri-briefcase-line', title: "B2B huquq firmalari hamkorliklari", desc: "Mavjud yuridik amaliyot va konsultatsiyalar uchun white-label yechimlar" },
    { icon: 'ri-building-2-line', title: "Hukumat shartnoma imkoniyatlari", desc: "Huquqiy axborot tizimlari va fuqarolarga xizmat ko'rsatish bo'yicha davlat sektor shartnomalari" },
    { icon: 'ri-graduation-cap-line', title: "Huquqiy ta'lim platformasi qo'shimchasi", desc: "Huquq talabalari va uzluksiz huquqiy ta'lim uchun ta'lim modullari" },
  ];

  return (
    <section className="py-24 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Investorlar Uchun</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Biznes Modeli va Bozor Imkoniyati</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">AdvokatAI tez o'sayotgan Markaziy Osiyo huquqiy-tech bozorini egallash uchun yaxshi joylashgan</p>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Raqobatbardosh Afzalliklar</h3>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-6">O'sish Strategiyasi</h3>
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
          <h3 className="text-2xl font-bold text-white mb-3">Investitsiya qilishga qiziqasizmi?</h3>
          <p className="text-teal-50 mb-6 max-w-2xl mx-auto text-sm">Markaziy Osiyoda huquqiy xizmatlarni inqilob qilishda bizga qo'shiling. Investitsiya imkoniyatlari haqida ko'proq bilish uchun biz bilan bog'laning.</p>
          <Link to="/contact" className="inline-flex items-center justify-center bg-white text-teal-600 px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-teal-50 transition-colors whitespace-nowrap cursor-pointer shadow-sm">
            <i className="ri-mail-line mr-2"></i>Investitsiya Jamoasi bilan Bog'lanish
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 bg-teal-600">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Huquqiy Yordam Olishga Tayyormisiz?</h2>
        <p className="text-teal-100 mb-10 max-w-2xl mx-auto">AdvokatAI ga ishonuvchi minglab foydalanuvchilarga qo'shiling. Bugun boshlang va huquqiy yordamning kelajagini his qiling.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/chat" className="inline-flex items-center justify-center bg-white text-teal-600 px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-teal-50 transition-colors whitespace-nowrap cursor-pointer shadow-sm">
            <i className="ri-chat-3-line mr-2"></i>Bepul Maslahat Boshlash
          </Link>
          <Link to="/contact" className="inline-flex items-center justify-center border-2 border-white/60 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer">
            <i className="ri-phone-line mr-2"></i>Savdo bilan Bog'lanish
          </Link>
        </div>
      </div>
    </section>
  );
}

function HomeFounderSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50/50 via-white to-teal-50/30 border-t border-gray-100">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-12">
          <span className="text-teal-600 text-xs sm:text-sm font-semibold uppercase tracking-widest bg-teal-50 px-3.5 py-1 rounded-full border border-teal-100">
            Loyiha Asoschisi
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 mb-4">
            Loyiha Asoschisi va Bosh Dasturchisi
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
            O'zbekistonda yuridik sohada sun'iy intellektni joriy etish va fuqarolarning huquqiy savodxonligini oshirish tashabbuskori
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
              <p className="text-teal-700 font-semibold text-sm mt-0.5">Asoschi va Bosh Dasturchi</p>
              <span className="inline-block mt-2 px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-medium border border-teal-200/80">
                Termiz Prezident maktabi · 11-sinf
              </span>
            </div>

            <div className="md:col-span-8 space-y-5 text-left">
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Huquqiy Texnologiyalar (LegalTech) Kelajagi</h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  Men Zafar Zokirov, Surxondaryo viloyati Termiz shahridagi Prezident maktabining 11-sinf o'quvchisiman. <strong>AdvokatAI</strong> loyihasini yaratishdan asosiy maqsadim — O'zbekiston fuqarolariga o'z huquqlarini chuqur anglash, murakkab huquqiy me'yorlarni oddiy tilda tushunish va har qanday sharoitda professional yuridik yordam olish imkoniyatini taqdim etishdir.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Platforma Retrieval-Augmented Generation (RAG) texnologiyasiga tayanadi. Barcha javoblar O'zbekiston Respublikasining Lex.uz rasmiy qonunchilik bazasiga, 5 ta asosiy kodeks va 3,000 dan ortiq huquqiy moddalarga qat'iy asoslangan holda shakllantiriladi.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <i className="ri-graduation-cap-line text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <div>
                    <div className="text-xs font-bold text-gray-800">Ta'lim</div>
                    <div className="text-xs text-gray-500">Termiz shahridagi Prezident maktabi 11-sinf</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <i className="ri-code-s-slash-line text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <div>
                    <div className="text-xs font-bold text-gray-800">Ixtisoslashuv</div>
                    <div className="text-xs text-gray-500">AI & Full-stack LegalTech muhandisligi</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-gray-700">Bog'lanish va ijtimoiy tarmoqlar:</span>
                <div className="flex flex-wrap items-center gap-2">
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

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-8">
        <div className="text-center mb-12">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Savol-Javob</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">Tez-tez So'raladigan Savollar</h2>
          <p className="text-gray-500 text-sm">AdvokatAI platformasi, uning yuridik maqomi va imkoniyatlari haqida muhim ma'lumotlar</p>
        </div>

        <div className="space-y-4">
          {faqsData.map((faq, i) => (
            <div key={faq.id} className="bg-gray-50/70 hover:bg-gray-50 rounded-2xl border border-gray-200/80 transition-all overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
              >
                <h3 className="font-bold text-gray-900 text-sm sm:text-base pr-4">{faq.question}</h3>
                <i className={`text-gray-400 text-xl transition-transform ${openFaq === i ? 'ri-arrow-up-s-line text-teal-600' : 'ri-arrow-down-s-line'}`}></i>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 pt-1 border-t border-gray-100 bg-white/60">
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSnippet() {
  return (
    <section className="py-24 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Aloqa</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Biz bilan Bog'laning</h2>
          <p className="text-gray-500">Sizdan eshitishdan mamnun bo'lamiz. Istalgan vaqtda murojaat qiling.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: 'ri-mail-line', label: 'Email', value: 'zokirovzafar881@gmail.com' },
            { icon: 'ri-phone-line', label: 'Telefon', value: '+998 90 695 08 11' },
            { icon: 'ri-map-pin-line', label: 'Manzil', value: 'Surxondaryo, Termiz shahridagi Prezident maktabi.' },
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
      <PricingSnippet />
      <InvestorSection />
      <HomeFounderSection />
      <HomeFAQSection />
      <CTASection />
      <ContactSnippet />
    </div>
  );
}
