import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getActivePlans, Plan } from '../utils/supabase';
import { faqsData } from '../data/faqs';

interface PlanDisplayItem {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  popular: boolean;
  btnClass: string;
  btnText: string;
  btnLink: string;
  features: { label: string; sub: string; on: boolean }[];
  apiNote: { title: string; sub: string };
}

const DEFAULT_FALLBACK_PLANS: PlanDisplayItem[] = [
  {
    id: 'free',
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
      { label: 'Hujjat Shablonlari', sub: '2 ta hujjat yaratish', on: true },
      { label: 'Qonun Qidiruv Tizimi', sub: 'Kuniga 3 ta qidiruv', on: true },
      { label: "Ko'p tilli qo'llab-quvvatlash", sub: "Faqat O'zbek", on: true },
      { label: 'Hujjat Nusxasini Olish', sub: '2 ta hujjatgacha', on: true },
      { label: 'Hujjatni Yuklab Olish', sub: '2 ta hujjatgacha', on: true },
      { label: 'Hujjatni Tahrirlash', sub: 'Asosiy tahrirlash', on: true },
      { label: 'Maxsus Yordam', sub: '', on: false },
    ],
    apiNote: { title: 'Foydalanish meʼyori', sub: "Kuniga 10 ta savol · 2 ta hujjat · 3 ta qidiruv" },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '18,000',
    period: '/30 kun',
    desc: "Ishonchli huquqiy vositalarga muhtoj mutaxassislar uchun",
    popular: true,
    btnClass: 'bg-white text-teal-600 hover:bg-teal-50',
    btnText: "Pro Obunasi",
    btnLink: '/payment?plan=pro',
    features: [
      { label: 'AI Huquqiy Chatbot', sub: 'Kuniga 100 ta savol', on: true },
      { label: 'Hujjat Shablonlari', sub: '10 ta hujjat yaratish', on: true },
      { label: 'Qonun Qidiruv Tizimi', sub: "Kuniga 30 ta qidiruv", on: true },
      { label: "Ko'p tilli qo'llab-quvvatlash", sub: "O'Z, RU, EN", on: true },
      { label: 'Hujjat Nusxasini Olish', sub: '10 ta hujjatgacha', on: true },
      { label: 'Hujjatni Yuklab Olish', sub: '10 ta hujjat (DOCX/PDF)', on: true },
      { label: 'Hujjatni Tahrirlash', sub: 'Toʻliq interaktiv tahrir', on: true },
      { label: 'Ustuvor Javob Vaqti', sub: '2 soniyadan kam', on: true },
    ],
    apiNote: { title: 'Foydalanish meʼyori', sub: "Kuniga 100 ta savol · 10 ta hujjat · 30 ta qidiruv" },
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '30,000',
    period: '/30 kun',
    desc: "To'liq integratsiya va yuqori hajm talab qiluvchi korxonalar uchun",
    popular: false,
    btnClass: 'bg-gray-900 text-white hover:bg-gray-800',
    btnText: "Premium Obunasi",
    btnLink: '/payment?plan=premium',
    features: [
      { label: 'AI Huquqiy Chatbot', sub: "Cheksiz savollar", on: true },
      { label: 'Hujjat Shablonlari', sub: '100 ta hujjat yaratish', on: true },
      { label: 'Qonun Qidiruv Tizimi', sub: "Cheksiz qonun qidiruvi", on: true },
      { label: "Ko'p tilli qo'llab-quvvatlash", sub: "O'Z, RU, EN + maxsus", on: true },
      { label: 'Hujjat Nusxasini Olish', sub: '100 ta hujjat', on: true },
      { label: 'Hujjatni Yuklab Olish', sub: '100 ta hujjat (DOCX/PDF)', on: true },
      { label: 'Hujjatni Tahrirlash', sub: 'Toʻliq tahrirlash', on: true },
      { label: 'Maxsus Yordam', sub: '24/7 shaxsiy menejer', on: true },
    ],
    apiNote: { title: 'Foydalanish meʼyori', sub: "Cheksiz savollar · 100 ta hujjat · Cheksiz qidiruv" },
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [plansList, setPlansList] = useState<PlanDisplayItem[]>(DEFAULT_FALLBACK_PLANS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const dbPlans = await getActivePlans();
        if (dbPlans && dbPlans.length > 0) {
          const mapped: PlanDisplayItem[] = dbPlans.map((p: Plan) => {
            const isFree = p.price_uzs === 0;
            const isPopular = p.name.toLowerCase().includes('pro') || p.name.toLowerCase().includes('standard');
            const isPremium = p.name.toLowerCase().includes('premium');
            const docLimit = (p as any).document_limit ?? (isPremium ? 100 : isPopular ? 10 : 2);
            const searchLimit = (p as any).search_limit ?? (isPremium ? 999999 : isPopular ? 30 : 3);
            const questionLimit = p.daily_question_limit >= 999999 ? 'Cheksiz' : `${p.daily_question_limit} ta`;

            return {
              id: p.id,
              name: p.name,
              price: isFree ? '0' : Number(p.price_uzs).toLocaleString('uz-UZ'),
              period: isFree ? 'doim' : `/${p.duration_days} kun`,
              desc: p.description || (isFree ? "AI huquqiy yordam boshlang'ich rejasi" : "To'liq imkoniyatli obuna"),
              popular: isPopular,
              btnClass: isPopular 
                ? 'bg-white text-teal-600 hover:bg-teal-50' 
                : 'bg-gray-900 text-white hover:bg-gray-800',
              btnText: isFree ? 'Bepul boshlash' : `${p.name} Obunasi`,
              btnLink: isFree ? '/chat' : `/payment?plan=${p.id}`,
              features: [
                { 
                  label: 'AI Huquqiy Chatbot', 
                  sub: `Kuniga ${questionLimit} savol`, 
                  on: true 
                },
                { 
                  label: 'Hujjat Shablonlari', 
                  sub: `${docLimit} ta hujjat yaratish`, 
                  on: true 
                },
                { 
                  label: 'Qonun Qidiruv Tizimi', 
                  sub: searchLimit >= 999999 ? 'Cheksiz qidiruv' : `Kuniga ${searchLimit} ta qidiruv`, 
                  on: true 
                },
                { 
                  label: 'Hujjat Nusxasini Olish', 
                  sub: `${docLimit} ta hujjatgacha`, 
                  on: true 
                },
                { 
                  label: 'Hujjatni Yuklab Olish (DOCX/PDF)', 
                  sub: `${docLimit} ta hujjatgacha`, 
                  on: true 
                },
                { 
                  label: 'Hujjatni Tahrirlash', 
                  sub: 'Interaktiv tahrirlash', 
                  on: true 
                },
                { 
                  label: 'Ustuvor Javob Vaqti', 
                  sub: isFree ? '' : 'Yuqori tezlikda AI tahlil', 
                  on: !isFree 
                },
              ],
              apiNote: {
                title: 'Foydalanish meʼyori',
                sub: `Kunlik savollar: ${questionLimit} · Hujjatlar: ${docLimit} ta · Qidiruvlar: ${searchLimit >= 999999 ? 'Cheksiz' : `${searchLimit} ta`}`
              }
            };
          });
          setPlansList(mapped);
        }
      } catch (err) {
        console.error('[PricingPage] Error loading plans from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-teal-50/40">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Narxlar</span>
          <h1 className="text-5xl font-bold text-gray-900 mt-3 mb-4">Oddiy, Shaffof Rejalar</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Huquqiy ehtiyojlaringizga mos rejani tanlang</p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plansList.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-8 relative ${plan.popular ? 'bg-teal-600 border-2 border-teal-600 shadow-xl transform scale-105' : 'bg-white border-2 border-gray-200 hover:shadow-lg transition-shadow'}`}
                >
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
                          <i className={`text-lg ${f.on
                            ? plan.popular ? 'ri-check-line text-white' : 'ri-check-line text-teal-600'
                            : plan.popular ? 'ri-close-line text-teal-300' : 'ri-close-line text-gray-300'
                          }`}></i>
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${f.on
                            ? plan.popular ? 'text-white' : 'text-gray-900'
                            : plan.popular ? 'text-teal-200' : 'text-gray-400'
                          }`}>{f.label}</div>
                          {f.sub && (
                            <div className={`text-xs ${plan.popular ? 'text-teal-100' : 'text-gray-500'}`}>{f.sub}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`mb-6 p-3 rounded-lg border ${plan.popular ? 'bg-teal-700 border-teal-500' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`text-xs font-semibold mb-1 ${plan.popular ? 'text-white' : 'text-gray-700'}`}>{plan.apiNote.title}</div>
                    <div className={`text-xs ${plan.popular ? 'text-teal-100' : 'text-gray-500'}`}>{plan.apiNote.sub}</div>
                  </div>

                  <Link
                    to={plan.btnLink}
                    className={`block w-full text-center py-3 rounded-xl font-semibold transition-colors text-sm cursor-pointer ${plan.btnClass}`}
                  >
                    {plan.btnText}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50/60">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Tez-tez So'raladigan Savollar</h2>
          </div>
          <div className="space-y-4">
            {faqsData.map((faq, i) => (
              <div key={faq.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                >
                  <h3 className="font-bold text-gray-900 text-sm">{faq.question}</h3>
                  <i className={`text-gray-400 text-lg transition-transform ${openFaq === i ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}`}></i>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-teal-600">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Bugun Boshlashga Tayyormisiz?</h2>
          <p className="text-teal-100 mb-8">Bepul rejani sinab ko'ring — hech qanday kredit karta talab etilmaydi</p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center bg-white text-teal-600 px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-teal-50 transition-colors shadow-sm"
          >
            <i className="ri-user-add-line mr-2"></i>Bepul boshlash
          </Link>
        </div>
      </section>
    </div>
  );
}
