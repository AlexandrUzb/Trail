import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { safeFetchJson, safeStorage } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface PaymentConfig {
  cardNumber: string;
  cardHolder: string;
  bankName: string;
  instructions: string;
}

interface PlanInfo {
  id: string;
  name: string;
  priceUzs: number;
  dailyLimit: number | null;
  features: string[];
}

interface PaymentRecord {
  id: string;
  planId: string;
  amountUzs: number;
  status: 'PENDING' | 'PAID' | 'REJECTED' | 'REFUNDED';
  transactionReference: string;
  payerName?: string;
  createdAt: string;
}

function getUserId(): string {
  let id = safeStorage.getItem('advokatai_user_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    safeStorage.setItem('advokatai_user_id', id);
  }
  return id;
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const rawPlan = searchParams.get('plan');
  const validPlan = rawPlan === 'premium' ? 'premium' : 'pro';

  const [selectedPlanId, setSelectedPlanId] = useState<string>(validPlan);
  const [plans] = useState<Record<string, PlanInfo>>({
    pro: {
      id: 'pro',
      name: 'Pro',
      priceUzs: 18000,
      dailyLimit: 50,
      features: [
        'Kuniga 50 ta yuridik savol',
        'Barcha 5 ta rasmiy qonun kodeksi',
        'Eng tezkor AI yuridik tahlil (3-5 soniya)',
        'Rasmiy hujjat shablonlaridan cheksiz foydalanish',
        'Rasmiy Lex.uz havolalari bilan toʻliq asos'
      ],
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      priceUzs: 30000,
      dailyLimit: 200,
      features: [
        'Kuniga 200 ta savol / Yuqori korporativ hajm',
        'Toʻliq Lex.uz milliy qonunchilik bazasi',
        'Ustuvor VIP AI hisoblash quvvati',
        'Murakkab daʼvo arizalari va shartnomalar tahlili',
        '24/7 shaxsiy texnik yordam va kafolat'
      ],
    },
  });

  const [config, setConfig] = useState<PaymentConfig>({
    cardNumber: '4466 1369 5151 4448',
    cardHolder: 'Zokirov Zafar',
    bankName: 'Humo / Uzcard / Visa',
    instructions: 'Istalgan toʻlov ilovasi (Payme, Click, Uzum Bank) orqali kartaga pul oʻtkazing va chek yoki tranzaksiya raqamini yuboring.',
  });

  const { user, updateUser } = useAuth();
  const [userId] = useState<string>(getUserId());
  const activeUserId = user?.id || user?.userId || userId;

  const [payerName, setPayerName] = useState<string>(() => user?.name || safeStorage.getItem('advokatai_user_name', '') || '');
  const [transactionRef, setTransactionRef] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [myPayments, setMyPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    if (user?.name && !payerName) {
      setPayerName(user.name);
    }
  }, [user]);

  useEffect(() => {
    // Keep in sync with query parameter
    if (rawPlan === 'pro' || rawPlan === 'premium') {
      setSelectedPlanId(rawPlan);
    }
  }, [rawPlan]);

  useEffect(() => {
    // Load config from backend
    safeFetchJson('/api/payments/config')
      .then((res) => {
        if (res.ok && res.data?.success && res.data?.data) {
          setConfig(res.data.data);
        }
      })
      .catch(() => {});

    // Load user's previous payments
    loadMyPayments();
  }, [activeUserId]);

  const loadMyPayments = () => {
    safeFetchJson(`/api/payments/my?userId=${activeUserId}`)
      .then((res) => {
        if (res.ok && res.data?.success && Array.isArray(res.data?.data)) {
          setMyPayments(res.data.data);
        }
      })
      .catch(() => {});
  };

  const currentPlan = plans[selectedPlanId] || plans['pro'];

  const handleCopyCard = () => {
    navigator.clipboard.writeText(config.cardNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // 1. Strict Name Validation
    const cleanName = payerName.trim();
    const nameWords = cleanName.split(/\s+/).filter(Boolean);
    const validNameRegex = /^[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ\s'-]{4,60}$/u;

    if (!cleanName || nameWords.length < 2 || !validNameRegex.test(cleanName) || /\d/.test(cleanName)) {
      setErrorMessage('Iltimos, haqiqiy ism va familiyangizni toʻliq kiriting (masalan: Ali Valiyev). Raqamlar qabul qilinmaydi.');
      return;
    }

    // 2. Strict Transaction ID Validation (Reject date/time patterns)
    const cleanTx = transactionRef.trim();
    const dateTimeKeywordsRegex = /(soat|vaqt|kecha|bugun|ertaga|kun|oyda|yilda|otkazdim|o'tkazdim|o‘tkazdim|tashladim|tolandi|to'landi|\b\d{1,2}[:.]\d{2}\b|\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b)/i;

    if (dateTimeKeywordsRegex.test(cleanTx)) {
      setErrorMessage('Sana yoki vaqtni matn koʻrinishida kiritish qabul qilinmaydi. Iltimos, faqat toʻlov ilovasi (Payme, Click, Uzum) chekidagi rasmiy Tranzaksiya ID raqamini kiriting.');
      return;
    }

    const validTxIdRegex = /^[A-Za-z0-9_-]{6,40}$/;
    if (!validTxIdRegex.test(cleanTx)) {
      setErrorMessage('Tranzaksiya ID formati notoʻgʻri. Faqat 6 tadan 40 tagacha belgidan iborat harf-raqamli rasmiy ID raqamini kiriting (masalan: 38472910593).');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await safeFetchJson('/api/payments/submit', {
        method: 'POST',
        body: JSON.stringify({
          userId: activeUserId,
          planId: selectedPlanId,
          payerName: cleanName,
          transactionReference: cleanTx,
        }),
      });

      if (!res.ok || !res.data?.success) {
        throw new Error(res.error || res.data?.error || 'Toʻlov maʼlumotlarini yuborishda xatolik yuz berdi.');
      }

      const json = res.data;

      // Update plan in AuthContext
      const planExpiresAt = json.data?.user?.plan_expires_at || new Date(Date.now() + 30 * 86400000).toISOString();
      updateUser({
        plan: selectedPlanId,
        plan_id: selectedPlanId,
        plan_expires_at: planExpiresAt,
      });

      setSubmitSuccess(true);
      setTransactionRef('');
      loadMyPayments();
    } catch (err: any) {
      setErrorMessage(err.message || 'Xatolik yuz berdi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/40 via-white to-cyan-50/30 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link to="/" className="hover:text-teal-600">Bosh sahifa</Link>
            <span>/</span>
            <Link to="/pricing" className="hover:text-teal-600">Tariflar</Link>
            <span>/</span>
            <span className="text-gray-800 font-semibold">Xavfsiz Toʻlov</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            AdvokatAI Obunasini Rasmiylashtirish
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quyidagi karta raqamiga toʻlovni oʻtkazing va chek maʼlumotlarini taqdim eting.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Plan Selector & ATM Card Display (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Plan Selector */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                  Obuna tarifini tanlang:
                </span>
                <span className="text-xs text-gray-400">1 oylik obuna</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlanId('pro')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    selectedPlanId === 'pro'
                      ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {selectedPlanId === 'pro' && (
                    <div className="absolute top-2 right-2">
                      <i className="ri-checkbox-circle-fill text-teal-600 text-lg"></i>
                    </div>
                  )}
                  <div className="font-bold text-gray-900 text-base">Pro Tarifi</div>
                  <div className="text-2xl font-black text-teal-700 mt-1">
                    18,000 <span className="text-xs font-medium text-gray-500">soʻm/oy</span>
                  </div>
                  <div className="text-xs text-teal-800/80 mt-1 font-medium">
                    ✓ Kuniga 50 ta savol · Barcha kodekslar
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlanId('premium')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    selectedPlanId === 'premium'
                      ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {selectedPlanId === 'premium' && (
                    <div className="absolute top-2 right-2">
                      <i className="ri-checkbox-circle-fill text-teal-600 text-lg"></i>
                    </div>
                  )}
                  <div className="font-bold text-gray-900 text-base">Premium Tarifi</div>
                  <div className="text-2xl font-black text-teal-700 mt-1">
                    30,000 <span className="text-xs font-medium text-gray-500">soʻm/oy</span>
                  </div>
                  <div className="text-xs text-amber-800 mt-1 font-medium">
                    ★ Kuniga 200 ta savol · VIP tezlik
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Modern ATM Bank Card Design */}
            <div className="bg-gradient-to-tr from-slate-900 via-teal-950 to-emerald-900 text-white rounded-3xl p-7 shadow-xl relative overflow-hidden border border-teal-800/40">
              {/* Background watermark */}
              <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                <i className="ri-scales-3-line text-[220px]"></i>
              </div>

              {/* Card header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-600/60 rounded-lg flex items-center justify-center border border-teal-400/30">
                    <i className="ri-scales-3-line text-white text-base"></i>
                  </div>
                  <span className="font-bold tracking-wider text-sm">AdvokatAI Toʻlov</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full font-semibold">
                    {config.bankName || 'Humo / Uzcard'}
                  </span>
                </div>
              </div>

              {/* Chip and contactless wave */}
              <div className="flex items-center justify-between my-4">
                <div className="w-11 h-8 bg-gradient-to-br from-amber-300 to-amber-500 rounded-md border border-amber-200/50 shadow-inner flex items-center justify-center">
                  <div className="w-9 h-6 border border-amber-600/40 rounded-xs grid grid-cols-2 gap-1 opacity-60"></div>
                </div>
                <i className="ri-wireless-charging-line text-2xl text-teal-300/80"></i>
              </div>

              {/* Card Number */}
              <div className="my-5">
                <div className="text-[11px] text-teal-200 uppercase tracking-widest font-semibold mb-1">
                  Karta raqami:
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-widest text-amber-200 drop-shadow-sm">
                    {config.cardNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCard}
                    className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm shadow-sm"
                    title="Karta raqamini nusxalash"
                  >
                    <i className={copied ? 'ri-check-line text-green-400 text-sm' : 'ri-file-copy-line text-sm'}></i>
                    <span>{copied ? 'Nusxalandi!' : 'Nusxalash'}</span>
                  </button>
                </div>
              </div>

              {/* Card bottom details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-teal-700/50 text-xs">
                <div>
                  <div className="text-teal-300/80 text-[10px] uppercase tracking-wider font-semibold">Karta egasi:</div>
                  <div className="font-bold text-sm text-white mt-0.5 tracking-wide uppercase">
                    {config.cardHolder}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-teal-300/80 text-[10px] uppercase tracking-wider font-semibold">Oʻtkaziladigan summa:</div>
                  <div className="font-extrabold text-base text-amber-300 mt-0.5">
                    {currentPlan.priceUzs?.toLocaleString('uz-UZ')} soʻm
                  </div>
                </div>
              </div>
            </div>

            {/* Quick-Open Payment Apps Callout */}
            <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <i className="ri-smartphone-line text-teal-600 text-sm"></i>
                Qulay toʻlov ilovalari orqali oʻtkazish:
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-gray-700">
                <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-100 flex flex-col items-center gap-1">
                  <span className="font-bold text-cyan-800">Payme</span>
                  <span className="text-[10px] text-cyan-600 font-normal">Karta oʻtkazmasi</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center gap-1">
                  <span className="font-bold text-blue-800">Click</span>
                  <span className="text-[10px] text-blue-600 font-normal">Kartaga oʻtkazish</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 flex flex-col items-center gap-1">
                  <span className="font-bold text-purple-800">Uzum Bank</span>
                  <span className="text-[10px] text-purple-600 font-normal">0% komissiya</span>
                </div>
              </div>
            </div>

            {/* Security Guarantee Badges */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs text-gray-500 py-1">
              <div className="flex items-center justify-center gap-1.5">
                <i className="ri-shield-check-line text-teal-600 text-base"></i>
                <span>100% Xavfsiz</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <i className="ri-time-line text-teal-600 text-base"></i>
                <span>Tezkor tasdiqlash</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <i className="ri-customer-service-2-line text-teal-600 text-base"></i>
                <span>24/7 Yordam</span>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Receipt Submission Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-md sticky top-20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                <h3 className="font-bold text-gray-900 text-base">Toʻlovni tasdiqlash</h3>
              </div>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Kartaga toʻlov oʻtkazgach, kvitansiya (chek) maʼlumotlarini kiriting.
              </p>

              {submitSuccess ? (
                <div className="bg-gradient-to-b from-teal-50 to-emerald-50/80 border border-teal-200 rounded-2xl p-5 text-center shadow-xs">
                  <div className="w-14 h-14 bg-teal-100/80 rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-teal-50">
                    <i className="ri-checkbox-circle-fill text-teal-600 text-3xl"></i>
                  </div>
                  <span className="inline-block bg-teal-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1.5 uppercase tracking-wide">
                    Faollashtirildi
                  </span>
                  <h4 className="font-extrabold text-teal-950 text-base mb-1">Toʻlovingiz tasdiqlandi!</h4>
                  <p className="text-xs text-teal-900 leading-relaxed mb-4">
                    Siz tanlagan <strong>{currentPlan.name}</strong> tarifi hisobingizga muvaffaqiyatli biriktirildi. Endi barcha qonuniy maʼlumotlar va AI yuridik tahlildan darhol foydalanishingiz mumkin.
                  </p>
                  <div className="space-y-2">
                    <Link
                      to="/chat"
                      className="flex items-center justify-center gap-2 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-sm hover:shadow-md"
                    >
                      <i className="ri-rocket-line text-sm"></i>
                      <span>AI Maslahatdan foydalanish</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(false)}
                      className="text-xs text-teal-800 font-medium hover:underline py-1"
                    >
                      Toʻlovlar tarixini koʻrish
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="text-xs bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2">
                      <i className="ri-error-warning-line text-base flex-shrink-0"></i>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Toʻlovchi ismi-sharifi (toʻliq ism va familiya): <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={submitting}
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      placeholder="Masalan: Ali Valiyev"
                      className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-3 focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Toʻlov oʻtkazilgan bank kartasi yoki hisob egasining toʻliq ismi-sharifi
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tranzaksiya ID (Faqat toʻlov tizimi kodi): <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={submitting}
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Masalan: 38472910593 yoki PAYME-98234120"
                      className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-3 focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <div className="mt-1.5 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                      <i className="ri-information-line text-amber-600 text-sm flex-shrink-0 mt-0.5"></i>
                      <span>
                        <strong>Muhim qoida:</strong> Sana yoki vaqtni matn koʻrinishida kiritish qabul qilinmaydi. Faqat chekdagi rasmiy Tranzaksiya ID raqamini kiriting.
                      </span>
                    </div>
                  </div>

                  {/* Order Summary box */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Tanlangan obuna:</span>
                      <span className="font-bold text-gray-900">{currentPlan.name} Tarifi</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Amal qilish muddati:</span>
                      <span className="font-medium text-gray-800">30 kun</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Savollar kvotasi:</span>
                      <span className="font-medium text-teal-700">
                        {currentPlan.dailyLimit ? `Kuniga ${currentPlan.dailyLimit} ta` : 'Cheksiz'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline text-sm">
                      <span className="font-bold text-gray-900">Jami toʻlov summasi:</span>
                      <span className="font-extrabold text-teal-700 text-lg">
                        {currentPlan.priceUzs?.toLocaleString('uz-UZ')} soʻm
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <i className="ri-loader-4-line animate-spin text-base"></i>
                        <span>Tekshirilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <i className="ri-send-plane-fill text-sm"></i>
                        <span>Toʻlov arizasini yuborish</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Previous Payment History */}
        {myPayments.length > 0 && (
          <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
              <i className="ri-history-line text-teal-600"></i>
              Mening toʻlov tarixim
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-semibold">
                    <th className="pb-3">Sana</th>
                    <th className="pb-3">Tarif</th>
                    <th className="pb-3">Summa</th>
                    <th className="pb-3">Chek maʼlumoti</th>
                    <th className="pb-3">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {myPayments.map((p) => (
                    <tr key={p.id} className="text-gray-700">
                      <td className="py-3">{new Date(p.createdAt).toLocaleDateString('uz-UZ')}</td>
                      <td className="py-3 font-semibold uppercase">{p.planId}</td>
                      <td className="py-3 font-bold">{p.amountUzs?.toLocaleString('uz-UZ')} soʻm</td>
                      <td className="py-3 max-w-xs truncate" title={p.transactionReference}>
                        {p.transactionReference}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            p.status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : p.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status === 'PAID'
                            ? '✓ Tasdiqlangan (Faol)'
                            : p.status === 'REJECTED'
                            ? '✗ Rad etilgan'
                            : '⏳ Kutilmoqda'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
