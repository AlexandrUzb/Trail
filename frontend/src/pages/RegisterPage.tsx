import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { safeFetchJson } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { supabase, ensureProfile, recordUserLogin } from '../utils/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn } = useAuth();
  const { language, t } = useLanguage();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refCode, setRefCode] = useState<string>('');

  // Extract and store referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('ref') || params.get('referral');
    if (code) {
      setRefCode(code.trim());
      try {
        localStorage.setItem('advokatai_ref', code.trim());
      } catch {}
    } else {
      try {
        const stored = localStorage.getItem('advokatai_ref');
        if (stored) setRefCode(stored);
      } catch {}
    }
  }, [location.search]);

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
      setError(t('auth_name_required'));
      return;
    }

    // 2. Email validation
    if (!cleanEmail) {
      setError(t('auth_email_required'));
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError(t('auth_email_invalid'));
      return;
    }

    // 3. Password length & presence validation
    if (!cleanPassword || cleanPassword.trim() === '') {
      setError(t('auth_password_required'));
      return;
    }

    if (cleanPassword.length < 6) {
      setError(t('auth_password_min'));
      return;
    }

    // 4. Client-side password confirmation match BEFORE making any network call
    if (!cleanConfirmPassword || cleanPassword !== cleanConfirmPassword) {
      setError(t('auth_password_mismatch'));
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
            referralCode: refCode || undefined,
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
          recordUserLogin(userData.id).catch(() => {});
          safeFetchJson('/api/auth/track-login', {
            method: 'POST',
            body: JSON.stringify({ userId: userData.id, email: cleanEmail })
          }).catch(() => {});
        }
      } else if (authData?.user) {
        // Ensure profile row exists in public.profiles (SOURCE OF TRUTH)
        await ensureProfile(authData.user.id, cleanEmail, cleanName);

        // Track referral in backend if refCode was supplied
        if (refCode) {
          safeFetchJson('/api/entitlements/referral/track', {
            method: 'POST',
            body: JSON.stringify({
              newUserId: authData.user.id,
              referralCode: refCode,
            }),
          }).catch(() => {});
        }

        // Immediate login if session not returned directly
        let sessionToken = authData.session?.access_token;
        if (!sessionToken) {
          const loginRes = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword,
          });
          if (loginRes.data?.session?.access_token) {
            sessionToken = loginRes.data.session.access_token;
          }
        }

        const authUser: any = {
          id: authData.user.id,
          userId: authData.user.id,
          email: cleanEmail,
          name: cleanName,
          full_name: cleanName,
          role: 'user',
          plan: 'free',
          dailyLimit: 10,
          documentLimit: 2,
          searchLimit: 3,
          canCopy: false,
          canDownload: false,
          canEdit: false,
        };
        login(authUser, sessionToken);
        recordUserLogin(authData.user.id).catch(() => {});
        safeFetchJson('/api/auth/track-login', {
          method: 'POST',
          body: JSON.stringify({ userId: authData.user.id, email: cleanEmail })
        }).catch(() => {});
      }

      // Save email for quick login later
      try {
        localStorage.setItem('advokatai_saved_email', cleanEmail);
      } catch {}

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
      setError(t('auth_server_err'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageToggle variant="compact" />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <i className="ri-scales-3-line text-white text-xl"></i>
              </div>
              <span className="text-3xl font-bold text-teal-600">AIAdvokat</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('register_title')}</h1>
          <p className="text-gray-600">{t('register_subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {submitted && (
            <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center space-x-2">
              <i className="ri-check-line text-teal-600 text-xl"></i>
              <p className="text-teal-800 text-sm">{t('auth_register_success')}</p>
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
              <label htmlFor="register-name" className="block text-sm font-semibold text-gray-700 mb-2">{t('name_label')}</label>
              <input
                id="register-name"
                name="name"
                type="text"
                disabled={loading}
                value={form.name}
                maxLength={100}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (error) setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                placeholder={language === 'en' ? 'Your full name' : 'Ismingiz'}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label htmlFor="register-email" className="block text-sm font-semibold text-gray-700 mb-2">{t('email_label')}</label>
              <input
                id="register-email"
                name="email"
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
                autoComplete="username email"
                required
              />
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-semibold text-gray-700 mb-2">{t('password_label')}</label>
              <input
                id="register-password"
                name="password"
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
                autoComplete="new-password"
                required
              />
              {passwordTooShort && (
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1 font-medium">
                  <i className="ri-information-line"></i> {t('auth_password_min')}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="register-confirm-password" className="block text-sm font-semibold text-gray-700 mb-2">{t('confirm_password_label')}</label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type="password"
                  disabled={loading}
                  value={form.confirmPassword}
                  maxLength={64}
                  autoComplete="new-password"
                  required
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
                  <i className="ri-error-warning-line"></i> {t('auth_password_mismatch')}
                </p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-teal-600 mt-1.5 flex items-center gap-1 font-medium">
                  <i className="ri-check-line"></i> {t('auth_passwords_match')}
                </p>
              )}
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" required className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5 cursor-pointer" />
              <p className="text-sm text-gray-600">
                <Link to="/terms" className="text-teal-600 hover:underline">{t('footer_terms')}</Link> {language === 'en' ? 'and' : 'va'}{' '}
                <Link to="/privacy" className="text-teal-600 hover:underline">{t('footer_privacy')}</Link>{language === 'en' ? ' accepted' : 'ni qabul qilaman'}
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
              <span>{loading ? t('auth_checking') : t('register_btn')}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('register_has_account')}{' '}
              <Link to="/login" state={location.state} className="text-teal-600 hover:text-teal-700 font-semibold">
                {t('register_login_link')}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm flex items-center justify-center gap-1">
            <i className="ri-arrow-left-line mr-1"></i>{t('btn_back_home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
