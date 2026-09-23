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

      {/* Loyiha ishlab chiquvchisi */}
      <section className="py-16 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <span className="text-teal-600 text-xs font-semibold uppercase tracking-widest">Muallif</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-6">Loyiha ishlab chiquvchisi</h2>
          <div className="inline-flex items-center gap-5 bg-white border border-gray-200/90 rounded-2xl p-5 text-left max-w-md shadow-xs hover:shadow-sm transition-shadow">
            <img
              src="/zafar_zokirov.jpg"
              alt="Zafar Zokirov"
              className="w-16 h-20 rounded-xl object-cover border border-gray-200 shadow-2xs flex-shrink-0"
              loading="lazy"
            />
            <div>
              <h3 className="text-base font-bold text-gray-900">Zafar Zokirov</h3>
              <p className="text-teal-700 text-xs font-medium mt-0.5">AdvokatAI loyihasi ishlab chiquvchisi</p>
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
