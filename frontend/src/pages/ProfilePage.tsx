import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      console.error('[ProfilePage] Error refreshing user:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* User Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50/40 rounded-full blur-3xl -z-0 pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'Foydalanuvchi'}</h1>
                <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                  <span>ID: <code className="font-mono text-gray-600">{user?.id?.slice(0, 12)}...</code></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-teal-500 bg-white hover:bg-teal-50/40 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
              >
                <i className={`ri-refresh-line ${loading ? 'animate-spin' : ''}`}></i>
                <span>Yangilash</span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-100 hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors cursor-pointer"
              >
                <i className="ri-logout-box-r-line"></i>
                <span>Chiqish</span>
              </button>
            </div>
          </div>

          {/* Service Limits Overview Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>AI Savollar meʼyori</span>
                <i className="ri-chat-voice-line text-teal-600 text-sm"></i>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {user?.dailyLimit ? (user.dailyLimit > 1000 ? 'Cheksiz' : `${user.dailyLimit} ta / kun`) : 'Mavjud'}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Har kuni yarim tunda yangilanadi</p>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Hujjatlar tayyorlash</span>
                <i className="ri-file-text-line text-teal-600 text-sm"></i>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {user?.documentLimit ? `${user.documentLimit} ta` : 'Mavjud'}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">DOCX va PDF formatida</p>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Qonun qidiruvi</span>
                <i className="ri-search-2-line text-teal-600 text-sm"></i>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {user?.searchLimit ? (user.searchLimit > 1000 ? 'Cheksiz' : `${user.searchLimit} ta / kun`) : 'Mavjud'}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Lex.uz milliy qonunchilik bazasi</p>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            to="/chat"
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:border-teal-500 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <i className="ri-chat-voice-line"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors">AI Maslahat</h3>
              <p className="text-xs text-gray-500">Huquqiy savol berish</p>
            </div>
          </Link>

          <Link
            to="/search"
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:border-teal-500 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <i className="ri-search-2-line"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Qonun Qidiruvi</h3>
              <p className="text-xs text-gray-500">Moddalar va kodekslar</p>
            </div>
          </Link>

          <Link
            to="/templates"
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:border-teal-500 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <i className="ri-file-text-line"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Hujjatlar</h3>
              <p className="text-xs text-gray-500">Shablonlar va arizalar</p>
            </div>
          </Link>
        </div>

        {/* Support Section: AdvokatAI'ni qo'llab-quvvatlash ☕ */}
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 text-2xl shadow-2xs">
            ☕
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
            AdvokatAI loyihasini rivojlantirishga hissa qoʻshing
          </h3>
          <p className="text-xs text-gray-600 max-w-lg mx-auto mb-5 leading-relaxed">
            AdvokatAI mutlaqo ochiq va barcha foydalanuvchilar uchun qulay loyiha. Agar ushbu xizmat sizga yordam berayotgan boʻlsa, muallifni qahva bilan siylab ixtiyoriy qoʻllab-quvvatlashingiz mumkin.
          </p>

          <div>
            <a
              href="https://buymeacoffee.com/advokatai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#FFDD00] hover:bg-[#FACC15] text-gray-900 font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-transform hover:scale-105 shadow-md"
            >
              <span>AdvokatAI'ni qo'llab-quvvatlash ☕</span>
              <i className="ri-external-link-line text-xs"></i>
            </a>
          </div>

          <p className="text-[11px] text-gray-400 mt-3 italic">
            * Bu ixtiyoriy xayriya / qoʻllab-quvvatlash havolasi boʻlib, xizmatdan foydalanish erkinligini oʻzgartirmaydi.
          </p>
        </div>
      </div>
    </div>
  );
}
