import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { safeFetchJson, safeStorage } from '../utils/api';
import { useAuth } from '../context/AuthContext';

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
  name?: string;
  email?: string;
  role?: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [adminKey, setAdminKey] = useState<string>(() => {
    return safeStorage.getItem('advokatai_admin_key', '') || '';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'users' | 'analytics'>('users');

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  const [loading, setLoading] = useState(false);
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
      const [uRes, aRes] = await Promise.all([
        safeFetchJson<{ success: boolean; data: AdminUser[] }>('/api/admin/users', { headers }),
        safeFetchJson<{ success: boolean; data: { analytics: AnalyticsData; feedback: FeedbackData } }>('/api/admin/analytics', { headers }),
      ]);

      if (uRes.ok && uRes.data?.success) {
        setUsers(uRes.data.data || []);
      }
      if (aRes.ok && aRes.data?.success && aRes.data.data) {
        setAnalytics(aRes.data.data.analytics);
        setFeedback(aRes.data.data.feedback);
      }
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
      const res = await safeFetchJson('/api/admin/users', {
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
    } catch {
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
              Foydalanuvchilar hisoblari, xizmat koʻrsatkichlari va tizim monitoringi
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
            <div className="text-xs text-gray-500 mb-1">Jami foydalanuvchilar</div>
            <div className="text-2xl font-bold text-teal-700">
              {users.length} ta
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
            <div className="text-xs text-gray-500 mb-1">Oʻrtacha aniqlik darajasi</div>
            <div className="text-2xl font-bold text-teal-700">
              {analytics?.averageConfidence ?? 0}%
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-group-line"></i>
            <span>Foydalanuvchilar ({users.length})</span>
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
            <span>AI Sifat & Analitika</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: USERS LIST
           ======================================================== */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Barcha Foydalanuvchilar</h3>
                <p className="text-xs text-gray-500">
                  Roʻyxatdan oʻtgan foydalanuvchilar hisoblari
                </p>
              </div>
              <span className="text-xs text-gray-500 font-semibold">
                Jami: {users.length} ta
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-3.5">Foydalanuvchi / ID</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Roli</th>
                    <th className="p-3.5">Roʻyxatdan oʻtgan sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const isAdmin = u.role === 'admin';

                    return (
                      <tr key={u.id} className="hover:bg-gray-50/70">
                        <td className="p-3.5">
                          <div className="font-semibold text-gray-900">{u.name || 'Foydalanuvchi'}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{u.id}</div>
                        </td>
                        <td className="p-3.5 text-gray-700">{u.email || '—'}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                              isAdmin
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {isAdmin ? 'Administrator' : 'Foydalanuvchi'}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('uz-UZ') : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: AI SIFAT & ANALITIKA
           ======================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Intent Breakdown */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-folder-info-line text-teal-600"></i> Huquqiy Mavzular Taqsimoti
                </h3>
                {analytics?.intentBreakdown && Object.keys(analytics.intentBreakdown).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.intentBreakdown).map(([intent, count]) => {
                      const total = analytics.totalQueries || 1;
                      const percent = Math.round((count / total) * 100);
                      return (
                        <div key={intent} className="text-xs">
                          <div className="flex justify-between font-semibold mb-1 text-gray-700">
                            <span>{intent}</span>
                            <span>{count} ta ({percent}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-teal-600 h-2 rounded-full"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 text-center py-8">Mavzular maʼlumoti mavjud emas</div>
                )}
              </div>

              {/* Guardrails & Quality */}
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
                    <span className="text-gray-600">Noaniq/Past ishonchli savollar:</span>
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
      </div>
    </div>
  );
}
