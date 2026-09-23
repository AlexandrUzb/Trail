import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { safeFetchJson } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { supabase, ensureProfile } from '../utils/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect immediately to /chat
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/chat', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // Real-time validation states
  const passwordsMatch = form.confirmPassword.length > 0 && form.password.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;
  const passwordTooShort = form.password.length > 0 && form.password.length < 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');

    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim();
    const cleanPassword = form.password;
    const cleanConfirmPassword = form.confirmPassword;

    // 1. Name validation
    if (!cleanName) {
      setError("Ismingizni kiriting.");
      return;
    }

    // 2. Email validation
    if (!cleanEmail) {
      setError("Email manzilingizni kiriting.");
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError("Notoʻgʻri email formati. Iltimos, toʻgʻri email manzilini kiriting.");
      return;
    }

    // 3. Password length & presence validation
    if (!cleanPassword || cleanPassword.trim() === '') {
      setError("Parolni kiriting.");
      return;
    }

    if (cleanPassword.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat boʻlishi kerak.");
      return;
    }

    // 4. Client-side password confirmation match BEFORE making any network call
    if (!cleanConfirmPassword || cleanPassword !== cleanConfirmPassword) {
      setError("Kiritilgan parollar bir-biriga mos kelmadi. Iltimos, qayta tekshiring.");
      return;
    }

    setLoading(true);

    try {
      // 1. Supabase Auth Sign Up
      const { data: authData, error: sbError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (sbError) {
        // Fallback to backend API if needed
        const res = await safeFetchJson('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            password: cleanPassword,
            confirmPassword: cleanConfirmPassword,
          }),
        });

        if (!res.ok) {
          setLoading(false);
          const errText = sbError.message.includes('already registered')
            ? "Bu email manzili bilan hisob allaqachon ro'yxatdan o'tgan."
            : res.error || "Roʻyxatdan oʻtishda xatolik yuz berdi.";
          setError(errText);
          return;
        }

        const userData = res.data?.data?.user;
        const token = res.data?.data?.token;
        if (userData && token) {
          login(userData, token);
        }
      } else if (authData?.user) {
        // Ensure profile row exists in public.profiles (SOURCE OF TRUTH)
        await ensureProfile(authData.user.id, cleanEmail, cleanName);

        const authUser: any = {
          id: authData.user.id,
          userId: authData.user.id,
          email: cleanEmail,
          name: cleanName,
          full_name: cleanName,
          role: 'user',
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
      }, 500);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ro'yxatdan o'tish</h1>
          <p className="text-gray-600">Yangi hisob yarating</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {submitted && (
            <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center space-x-2">
              <i className="ri-check-line text-teal-600 text-xl"></i>
              <p className="text-teal-800 text-sm">Hisob muvaffaqiyatli yaratildi! Yoʻnaltirilmoqda...</p>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
              <i className="ri-error-warning-line text-red-600 text-xl"></i>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ism</label>
              <input
                type="text"
                disabled={loading}
                value={form.name}
                maxLength={100}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (error) setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                placeholder="Ismingiz"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                disabled={loading}
                value={form.email}
                maxLength={120}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (error) setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Parol</label>
              <input
                type="password"
                disabled={loading}
                value={form.password}
                maxLength={64}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (error) setError('');
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  passwordTooShort ? 'border-amber-400 focus:ring-amber-400' : 'border-gray-300 focus:ring-teal-500'
                }`}
                placeholder="••••••••"
              />
              {passwordTooShort && (
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1 font-medium">
                  <i className="ri-information-line"></i> Parol kamida 6 ta belgidan iborat boʻlishi kerak
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Parolni tasdiqlang</label>
              <div className="relative">
                <input
                  type="password"
                  disabled={loading}
                  value={form.confirmPassword}
                  maxLength={64}
                  onChange={(e) => {
                    setForm({ ...form, confirmPassword: e.target.value });
                    if (error) setError('');
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    passwordsMismatch 
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/20' 
                      : passwordsMatch 
                        ? 'border-teal-500 focus:ring-teal-500 bg-teal-50/20' 
                        : 'border-gray-300 focus:ring-teal-500'
                  }`}
                  placeholder="••••••••"
                />
                {passwordsMatch && (
                  <i className="ri-checkbox-circle-fill text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 text-lg"></i>
                )}
                {passwordsMismatch && (
                  <i className="ri-close-circle-fill text-red-500 absolute right-3 top-1/2 -translate-y-1/2 text-lg"></i>
                )}
              </div>
              {passwordsMismatch && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 font-medium">
                  <i className="ri-error-warning-line"></i> Kiritilgan parollar bir-biriga mos kelmadi
                </p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-teal-600 mt-1.5 flex items-center gap-1 font-medium">
                  <i className="ri-check-line"></i> Parollar mos keldi
                </p>
              )}
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" required className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5 cursor-pointer" />
              <p className="text-sm text-gray-600">
                <Link to="/terms" className="text-teal-600 hover:underline">Foydalanish shartlari</Link> va{' '}
                <Link to="/privacy" className="text-teal-600 hover:underline">Maxfiylik siyosati</Link>ni qabul qilaman
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || passwordsMismatch}
              className={`w-full px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer text-white ${
                loading || passwordsMismatch 
                  ? 'bg-gray-400 cursor-not-allowed opacity-75' 
                  : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800'
              }`}
            >
              {loading && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{loading ? "Tekshirilmoqda..." : "Ro'yxatdan o'tish"}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Allaqachon hisobingiz bormi?{' '}
              <Link to="/login" state={location.state} className="text-teal-600 hover:text-teal-700 font-semibold">
                Kirish
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
