import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { safeFetchJson } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { supabase, getProfile } from '../utils/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect immediately to /chat
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/chat', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');

    const cleanEmail = form.email.trim();
    const cleanPassword = form.password;

    // 1. Validate email
    if (!cleanEmail) {
      setError("Email manzilingizni kiriting.");
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError("Notoʻgʻri email formati. Iltimos, toʻgʻri email manzilini kiriting.");
      return;
    }

    // 2. Validate password
    if (!cleanPassword || cleanPassword.trim() === '') {
      setError("Parolingizni kiriting.");
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: sbError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (sbError) {
        // Fallback to backend API if needed
        const res = await safeFetchJson('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
        });

        if (!res.ok) {
          setLoading(false);
          const errText = sbError.message.includes('Invalid login credentials')
            ? "Email yoki parol notoʻgʻri."
            : sbError.message.includes('Email not confirmed')
              ? "Email manzilingiz tasdiqlanmagan. Iltimos, pochtangizni tekshiring."
              : res.error || "Email yoki parol notoʻgʻri.";
          setError(errText);
          return;
        }

        const userData = res.data?.data?.user;
        const token = res.data?.data?.token;
        if (userData && token) {
          login(userData, token);
        }
      } else if (authData?.user) {
        // Fetch profile from public.profiles
        const profile = await getProfile(authData.user.id);
        const displayName = profile?.full_name || authData.user.user_metadata?.full_name || cleanEmail.split('@')[0];
        const authUser: any = {
          id: authData.user.id,
          userId: authData.user.id,
          email: cleanEmail,
          name: displayName,
          full_name: profile?.full_name || null,
          role: profile?.role || 'user',
          plan: 'Bepul',
          dailyLimit: 5,
          canCopy: false,
          canDownload: false,
          canEdit: false,
        };
        login(authUser, authData.session?.access_token);
      }

      setLoading(false);
      setSubmitted(true);

      const fromObj = (location.state as any)?.from;
      const pendingAction = (location.state as any)?.pendingAction;
      let destination = '/chat';
      if (fromObj) {
        if (typeof fromObj === 'string') {
          destination = fromObj;
        } else if (fromObj.pathname) {
          destination = `${fromObj.pathname}${fromObj.search || ''}${fromObj.hash || ''}`;
        }
      }
      setTimeout(() => {
        navigate(destination, { 
          replace: true,
          state: pendingAction ? { resumedAction: pendingAction } : undefined
        });
      }, 400);
    } catch (err: any) {
      setLoading(false);
      setError("Serverga ulanishda xatolik yuz berdi. Iltimos, qaytadan urinib koʻring.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <i className="ri-scales-3-line text-white text-xl"></i>
              </div>
              <span className="text-3xl font-bold text-teal-600">AdvokatAI</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Xush kelibsiz</h1>
          <p className="text-gray-600">Hisobingizga kiring</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {submitted && (
            <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center space-x-2">
              <i className="ri-check-line text-teal-600 text-xl"></i>
              <p className="text-teal-800 text-sm">Tizimga muvaffaqiyatli kirildi! Yoʻnaltirilmoqda...</p>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
              <i className="ri-error-warning-line text-red-600 text-xl"></i>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                maxLength={120}
                disabled={loading}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (error) setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                placeholder="email@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Parol</label>
              <input
                type="password"
                value={form.password}
                maxLength={64}
                disabled={loading}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (error) setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                <span className="text-sm text-gray-600">Eslab qolish</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-4 rounded-xl font-semibold transition-colors cursor-pointer text-white flex items-center justify-center gap-2 ${
                loading ? 'bg-teal-700 opacity-80 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              {loading && <i className="ri-loader-4-line animate-spin text-lg"></i>}
              <span>{loading ? "Tekshirilmoqda..." : "Kirish"}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Ro'yxatdan o'tmaganmisiz?{' '}
              <Link to="/register" state={location.state} className="text-teal-600 hover:text-teal-700 font-semibold">
                Ro'yxatdan o'ting
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm flex items-center justify-center gap-1">
            <i className="ri-arrow-left-line mr-1"></i>Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
