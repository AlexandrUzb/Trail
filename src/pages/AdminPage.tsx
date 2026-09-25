import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { safeFetchJson, safeStorage } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface PaymentItem {
  id: string;
  userId: string;
  planId: string;
  amountUzs: number;
  status: 'PENDING' | 'PAID' | 'REJECTED' | 'REFUNDED';
  transactionReference: string;
  payerName?: string;
  createdAt: string;
}

interface AnalyticsData {
  totalQueries: number;
  averageLatencyMs: number;
  averageConfidence: number;
  intentBreakdown: Record<string, number>;
  lowConfidenceCount: number;
  errorCount: number;
  recentQueries: any[];
}

interface FeedbackData {
  total: number;
  positive: number;
  negative: number;
  satisfactionRate: number;
  recent: any[];
}

interface AdminUser {
  id: string;
  plan: string;
  planExpiresAt?: string;
  createdAt: string;
  usage?: {
    dailyUsed: number;
    monthlyUsed: number;
    dailyLimit: number | null;
  };
}

export default function AdminPage() {
  const { user } = useAuth();
  const [adminKey, setAdminKey] = useState<string>(() => {
    return safeStorage.getItem('advokatai_admin_key', '') || '';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'payments' | 'analytics' | 'users' | 'settings'>('payments');

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [settings, setSettings] = useState({
    payment_card_number: '',
    payment_card_holder: '',
    payment_bank_name: '',
    payment_instructions: '',
  });

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const getAdminHeaders = useCallback(() => {
    const headers: Record<string, string> = {};
    if (adminKey && adminKey.trim()) {
      headers['x-admin-key'] = adminKey.trim();
    }
    const token = safeStorage.getItem('advokatai_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [adminKey]);

  const loadAllData = useCallback(async () => {
    try {
      const headers = getAdminHeaders();
      const [pRes, aRes, uRes, sRes] = await Promise.all([
        safeFetchJson<{ success: boolean; data: PaymentItem[] }>('/api/admin/payments', { headers }),
        safeFetchJson<{ success: boolean; data: { analytics: AnalyticsData; feedback: FeedbackData } }>('/api/admin/analytics', { headers }),
        safeFetchJson<{ success: boolean; data: AdminUser[] }>('/api/admin/users', { headers }),
        safeFetchJson<{ success: boolean; data: any }>('/api/admin/settings', { headers }),
      ]);

      if (pRes.ok && pRes.data?.success) setPayments(pRes.data.data || []);
      if (aRes.ok && aRes.data?.success && aRes.data.data) {
        setAnalytics(aRes.data.data.analytics);
        setFeedback(aRes.data.data.feedback);
      }
      if (uRes.ok && uRes.data?.success) setUsers(uRes.data.data || []);
      if (sRes.ok && sRes.data?.success) setSettings(sRes.data.data || {});
    } catch (e) {
      console.error('Failed to load admin data:', e);
    }
  }, [getAdminHeaders]);

  const verifyKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;
    setLoginError(null);
    setLoading(true);
    try {
      const res = await safeFetchJson('/api/admin/payments', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        if (adminKey.trim()) {
          safeStorage.setItem('advokatai_admin_key', adminKey.trim());
        }
        loadAllData();
      } else {
        setLoginError("Notoʻgʻri Admin kaliti yoki admin ruxsati mavjud emas.");
      }
    } catch (e: any) {
      setLoginError("Server bilan bogʻlanib boʻlmadi. Qayta urinib koʻring.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      setIsAuthenticated(true);
      loadAllData();
    } else if (adminKey) {
      verifyKey();
    }
  }, [user?.role, adminKey, loadAllData]);

  const handleVerifyPayment = async (paymentId: string, status: 'PAID' | 'REJECTED') => {
    setActionLoading(paymentId);
    try {
      const res = await safeFetchJson<{ success: boolean; error?: string }>(`/api/admin/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok && res.data?.success) {
        setNotification(`Toʻlov holati muvaffaqiyatli ${status === 'PAID' ? 'Tasdiqlandi' : 'Rad etildi'}`);
        setTimeout(() => setNotification(null), 4000);
        loadAllData();
      } else {
        alert(res.error || res.data?.error || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean; error?: string }>('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(settings),
      });
      if (res.ok && res.data?.success) {
        setNotification('Toʻlov sozlamalari yangilandi!');
        setTimeout(() => setNotification(null), 4000);
      } else {
        alert(res.error || res.data?.error || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-200 shadow-xl text-center">
          <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl shadow-sm">
            <i className="ri-shield-keyhole-line"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AdvokatAI Boshqaruv Paneli</h2>
          <p className="text-xs text-gray-500 mb-6">
            Tizimga kirish uchun administrator maxfiy kalitini kiriting
          </p>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 text-left">
              <i className="ri-error-warning-line text-base flex-shrink-0"></i>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={verifyKey} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Admin API Key:</label>
              <input
                type="password"
                required
                disabled={loading}
                value={adminKey}
                onChange={(e) => {
                  setAdminKey(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                className="w-full text-sm border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-gray-100"
                placeholder="Admin kalitini kiriting..."
              />
            </div>
            <button
              type="submit"
              disabled={loading || !adminKey.trim()}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{loading ? 'Tekshirilmoqda...' : 'Tizimga kirish'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">AdvokatAI Admin Dashboard</h1>
              <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-full">
                Jonli boshqaruv
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Toʻlovlarni tasdiqlash, foydalanuvchilar kvotasi, AI sifati va tizim monitoringi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllData}
              className="text-xs bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-xl flex items-center gap-1.5 font-semibold text-gray-700 shadow-2xs cursor-pointer"
            >
              <i className="ri-refresh-line"></i> Yangilash
            </button>
            <Link
              to="/chat"
              className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-semibold transition-colors shadow-2xs"
            >
              <i className="ri-chat-3-line"></i> Chatga oʻtish
            </Link>
          </div>
        </div>

        {notification && (
          <div className="mb-6 p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="ri-checkbox-circle-fill text-teal-600 text-base"></i>
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600">
              <i className="ri-close-line"></i>
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="text-xs text-gray-500 mb-1">Kutilayotgan toʻlovlar</div>
            <div className="text-2xl font-bold text-amber-600">
              {payments.filter((p) => p.status === 'PENDING').length} ta
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="text-xs text-gray-500 mb-1">Mijozlar mamnuniyati (👍)</div>
            <div className="text-2xl font-bold text-green-600">
              {feedback?.satisfactionRate ?? 100}%
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="text-xs text-gray-500 mb-1">Jami huquqiy soʻrovlar</div>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.totalQueries ?? 0}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="text-xs text-gray-500 mb-1">Oʻrtacha tezlik (RAG+AI)</div>
            <div className="text-2xl font-bold text-teal-600">
              {analytics?.averageLatencyMs ?? 0} ms
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'payments'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-bank-card-line"></i>
            Toʻlovlar ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-pie-chart-line"></i>
            Sifat & Analitika
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-group-line"></i>
            Foydalanuvchilar ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-settings-3-line"></i>
            Toʻlov Sozlamalari
          </button>
        </div>

        {/* Tab 1: Payments */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-sm text-gray-900">Barcha toʻlov arizalari</h3>
              <span className="text-xs text-gray-500">
                Tasdiqlash tugmasi bosilganda foydalanuvchi tarifi avtomatik 30 kunga faollashadi.
              </span>
            </div>
            {payments.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">Hozircha toʻlov arizalari yoʻq.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="p-3.5">ID / Sana</th>
                      <th className="p-3.5">Mijoz / User ID</th>
                      <th className="p-3.5">Tarif</th>
                      <th className="p-3.5">Summa</th>
                      <th className="p-3.5">Tranzaksiya / Chek maʼlumoti</th>
                      <th className="p-3.5">Holat</th>
                      <th className="p-3.5 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/70">
                        <td className="p-3.5">
                          <div className="font-mono font-semibold text-gray-900">{p.id}</div>
                          <div className="text-[11px] text-gray-400">
                            {new Date(p.createdAt).toLocaleString('uz-UZ')}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-gray-900">{p.payerName || 'Nomaʼlum'}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{p.userId}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-teal-50 text-teal-800 uppercase">
                            {p.planId}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-gray-900">
                          {p.amountUzs?.toLocaleString('uz-UZ')} soʻm
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 font-mono text-[11px] break-words">
                            {p.transactionReference}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              p.status === 'PAID'
                                ? 'bg-green-100 text-green-800'
                                : p.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800 animate-pulse'
                            }`}
                          >
                            {p.status === 'PAID'
                              ? '✓ Tasdiqlangan'
                              : p.status === 'REJECTED'
                              ? '✗ Rad etilgan'
                              : '⏳ Kutilmoqda'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {p.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleVerifyPayment(p.id, 'PAID')}
                                disabled={actionLoading === p.id}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer disabled:bg-gray-300 transition-colors"
                              >
                                {actionLoading === p.id ? '...' : 'Tasdiqlash'}
                              </button>
                              <button
                                onClick={() => handleVerifyPayment(p.id, 'REJECTED')}
                                disabled={actionLoading === p.id}
                                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                              >
                                Rad
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400">Yakunlangan</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quality & Feedback */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-star-line text-amber-500"></i> Foydalanuvchilar Bahosi (👍 / 👎)
                </h3>
                <div className="flex items-center gap-6 mb-6">
                  <div>
                    <div className="text-4xl font-extrabold text-teal-700">
                      {feedback?.satisfactionRate ?? 100}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Ijobiy javoblar ulushi</div>
                  </div>
                  <div className="border-l border-gray-200 pl-6 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <i className="ri-thumb-up-fill text-green-500"></i>
                      <span>Foydali: {feedback?.positive ?? 0} ta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="ri-thumb-down-fill text-red-500"></i>
                      <span>Kamchilikli: {feedback?.negative ?? 0} ta</span>
                    </div>
                  </div>
                </div>

                <h4 className="font-semibold text-xs text-gray-700 mb-2">Soʻnggi baholashlar:</h4>
                <div className="space-y-2">
                  {feedback?.recent?.slice(0, 5).map((f: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-800 truncate max-w-[70%]">{f.query}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          f.rating === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {f.rating === 1 ? '👍 Foydali' : '👎 Noaniq'}
                        </span>
                      </div>
                      <div className="text-gray-500 text-[11px] line-clamp-1">{f.answer}</div>
                    </div>
                  )) || <div className="text-gray-400 text-xs">Baholar mavjud emas</div>}
                </div>
              </div>

              {/* Guardrails & Low-Confidence */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-shield-check-line text-teal-600"></i> Ishonchlilik & Guardrail Koʻrsatkichlari
                </h3>
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between p-3 rounded-xl bg-gray-50">
                    <span className="text-gray-600">Oʻrtacha aniqlik darajasi:</span>
                    <span className="font-bold text-teal-700">{analytics?.averageConfidence ?? 0}%</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-gray-50">
                    <span className="text-gray-600">Noaniq/Uydirilmagan savollar soni:</span>
                    <span className="font-bold text-amber-700">{analytics?.lowConfidenceCount ?? 0} ta</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-gray-50">
                    <span className="text-gray-600">Server xatoliklari:</span>
                    <span className="font-bold text-gray-900">{analytics?.errorCount ?? 0} ta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">Faol foydalanuvchilar va kvotalar</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-3.5">Foydalanuvchi ID</th>
                    <th className="p-3.5">Tarif</th>
                    <th className="p-3.5">Kunlik ishlatilgan</th>
                    <th className="p-3.5">Oylik ishlatilgan</th>
                    <th className="p-3.5">Amal qilish muddati</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/70">
                      <td className="p-3.5 font-mono text-gray-900 font-semibold">{u.id}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            u.plan === 'premium'
                              ? 'bg-amber-100 text-amber-800'
                              : u.plan === 'pro'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {u.plan}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-gray-800">
                          {u.usage?.dailyUsed ?? 0}
                        </span>
                        <span className="text-gray-400">
                          {' '}
                          / {u.usage?.dailyLimit !== null ? u.usage?.dailyLimit : '∞'}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-gray-800">{u.usage?.monthlyUsed ?? 0} ta</td>
                      <td className="p-3.5 text-gray-500">
                        {u.planExpiresAt ? new Date(u.planExpiresAt).toLocaleDateString('uz-UZ') : 'Doimiy (bepul)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm max-w-2xl">
            <h3 className="font-bold text-sm text-gray-900 mb-4">Toʻlov sozlamalarini tahrirlash</h3>
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Toʻlov qabul qiluvchi karta raqami:</label>
                <input
                  type="text"
                  value={settings.payment_card_number}
                  onChange={(e) => setSettings({ ...settings, payment_card_number: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 font-mono"
                  placeholder="8600 0000 0000 0000"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Karta egasi (F.I.SH yoki Korxona):</label>
                <input
                  type="text"
                  value={settings.payment_card_holder}
                  onChange={(e) => setSettings({ ...settings, payment_card_holder: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500"
                  placeholder="ADVOKATAI MCHJ"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Bank nomi:</label>
                <input
                  type="text"
                  value={settings.payment_bank_name}
                  onChange={(e) => setSettings({ ...settings, payment_bank_name: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500"
                  placeholder="Oʻzmilliybank / Humo / Uzcard"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Toʻlov yoʻriqnomasi:</label>
                <textarea
                  rows={3}
                  value={settings.payment_instructions}
                  onChange={(e) => setSettings({ ...settings, payment_instructions: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500"
                  placeholder="Istalgan bank ilovasi orqali to'lang..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors cursor-pointer"
              >
                {loading ? 'Saqlanmoqda...' : 'Sozlamalarni saqlash'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
