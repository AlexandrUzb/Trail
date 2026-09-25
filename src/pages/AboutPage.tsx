import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-gray-50 via-white to-teal-50/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full opacity-60 translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-50 rounded-full opacity-50 -translate-x-1/3 translate-y-1/4 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <i className="ri-information-line text-teal-500"></i>
            <span>Biz haqimizda</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            AdvokatAI — har bir fuqaro uchun<br />
            <span className="text-teal-600">huquqiy yordam</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Zamonaviy texnologiya va huquqiy bilimlarning uyg'unligi. O'zbekiston fuqarolariga tez, ishonchli va qulay yechim.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: '500+', label: 'Foydalanuvchilar' },
              { value: '2000+', label: 'Savollarga javob berilgan' },
              { value: '24/7', label: 'Ishlash vaqti' },
            ].map((s) => (
              <div key={s.label} className="text-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-teal-600 mb-2">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
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
              <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Missiyamiz</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-6">Nima uchun AdvokatAI?</h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                O'zbekistonda professional huquqiy maslahat ko'pincha qimmat va noqulay. Ko'plab fuqarolar huquqlarini bilmaydi yoki uni himoya qila olmaydi.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                Biz sun'iy intellektni O'zbek qonunlari bazasi bilan birlashtirdik — endi har kim istalgan vaqtda, istalgan joyda aniq huquqiy ma'lumot ola oladi.
              </p>
              <div className="space-y-3">
                {[
                  "O'zbekiston qonunchiligiga to'liq asoslangan",
                  "24/7 mavjud, hech qanday kutish yo'q",
                  "Barcha saviyada tushunarli tilda javob",
                  "Ma'lumotlaringiz himoyalangan va maxfiy",
                ].map((item) => (
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
                {[
                  { icon: 'ri-user-line', label: 'Fuqarolar uchun', desc: 'Kundalik huquqiy savollarni hal qiling' },
                  { icon: 'ri-briefcase-line', label: 'Tadbirkorlar uchun', desc: 'Biznes huquqiy masalalarini tezda yeching' },
                  { icon: 'ri-scales-3-line', label: 'Yuristlar uchun', desc: 'Ish yukini yengillashtiring, tezlikni oshiring' },
                ].map((item) => (
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
            <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Texnologiya</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Bizning Texnologiyamiz</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Ilg'or AI texnologiyalari yordamida O'zbek qonunchiligini hamma uchun qulay qilamiz
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'ri-brain-line', title: 'RAG Texnologiyasi', desc: "Qonunlar bazasidan aniq ma'lumotlarni topish va taqdim etish" },
              { icon: 'ri-cpu-line', title: 'LLM Modellari', desc: "Tabiiy til bilan muloqot va hujjat yaratish" },
              { icon: 'ri-links-line', title: 'Lex.uz Integratsiyasi', desc: "O'zbekiston qonunlari bazasiga to'g'ridan-to'g'ri ulanish" },
              { icon: 'ri-server-line', title: 'FastAPI Backend', desc: "Tez va xavfsiz ma'lumotlar qayta ishlash" },
            ].map((item) => (
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
            <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Qadriyatlar</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Bizning Qadriyatlarimiz</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: 'ri-shield-check-line', title: 'Ishonch', desc: "Barcha ma'lumotlar rasmiy O'zbek qonunlari asosida taqdim etiladi" },
              { icon: 'ri-flashlight-line', title: 'Tezlik', desc: "Javoblar va hujjatlar bir necha soniyada tayyor bo'ladi" },
              { icon: 'ri-hand-heart-line', title: 'Qulaylik', desc: "Oddiy interfeys va tushunarli til — hamma uchun" },
            ].map((item) => (
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
                <p className="text-teal-700 font-semibold text-sm mt-0.5">Asoschi va Bosh Dasturchi</p>
                <span className="inline-block mt-2 px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-medium border border-teal-200/80">
                  Termiz Prezident maktabi · 11-sinf
                </span>
              </div>

              {/* Bio & Details */}
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

                {/* Achievements / Highlights */}
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
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <i className="ri-scales-3-line text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                    <div>
                      <div className="text-xs font-bold text-gray-800">Loyiha yo'nalishi</div>
                      <div className="text-xs text-gray-500">Milliy qonunchilik bo'yicha mustaqil AI</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <i className="ri-shield-star-line text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                    <div>
                      <div className="text-xs font-bold text-gray-800">Maqsad</div>
                      <div className="text-xs text-gray-500">Har bir fuqaro uchun bepul va qulay yuridik himoya</div>
                    </div>
                  </div>
                </div>

                {/* Social Channels */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-gray-700">Bog'lanish va ijtimoiy tarmoqlar:</span>
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
          <h2 className="text-4xl font-bold text-white mb-4">AdvokatAI bilan tanishing</h2>
          <p className="text-teal-100 mb-10 text-lg max-w-xl mx-auto">Huquqiy masalalaringizni bugun hal qiling — bepul boshlang</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/chat" className="inline-flex items-center justify-center bg-white text-teal-600 px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-teal-50 transition-colors whitespace-nowrap shadow-sm">
              <i className="ri-chat-3-line mr-2"></i>Bepul boshlash
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center border-2 border-white/60 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors whitespace-nowrap">
              <i className="ri-mail-line mr-2"></i>Biz bilan bog'laning
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
