import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserNotifications, markNotificationAsRead, Notification } from '../utils/supabase';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { user, isLoggedIn, loading, logout } = useAuth();

  const userName = user?.name || user?.email?.split('@')[0] || '';
  const userEmail = user?.email || '';
  const userPlan = user?.plan || 'Bepul';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications from Supabase
  useEffect(() => {
    if (!isLoggedIn || !user?.id) {
      setNotifications([]);
      return;
    }
    getUserNotifications(user.id).then(setNotifications);
  }, [isLoggedIn, user?.id]);

  const handleMarkRead = async (id: string) => {
    if (!user?.id) return;
    await markNotificationAsRead(id, user.id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    await logout();
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Bosh sahifa' },
    { path: '/chat', label: 'AI Maslahat' },
    { path: '/search', label: 'Qonun Qidiruvi' },
    { path: '/templates', label: 'Hujjatlar' },
    { path: '/pricing', label: 'Narxlar' },
    { path: '/about', label: 'Biz haqimizda' },
  ];

  const firstLetter = (userName || 'F')[0].toUpperCase();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${scrolled ? 'shadow-md border-b border-gray-100' : 'border-b border-transparent'}`}>
      <nav className="px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
              <i className="ri-scales-3-line text-white text-lg"></i>
            </div>
            <span className="text-xl font-bold text-gray-900">AdvokatAI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }}
                className={`text-sm font-medium transition-colors cursor-pointer ${isActive(link.path) ? 'text-teal-600' : 'text-gray-600 hover:text-teal-600'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Profile / Auth Area */}
          <div className="hidden md:flex items-center space-x-3">
            {!loading && isLoggedIn && user ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    title="Bildirishnomalar"
                    aria-label="Bildirishnomalar"
                  >
                    <i className="ri-notification-3-line text-lg"></i>
                    {notifications.some(n => !n.is_read) && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Bildirishnomalar</span>
                        {notifications.filter(n => !n.is_read).length > 0 && (
                          <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">
                            {notifications.filter(n => !n.is_read).length} ta yangi
                          </span>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto py-1 divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-gray-400">
                            Hozircha bildirishnomalar mavjud emas
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleMarkRead(n.id)}
                              className={`px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors ${
                                !n.is_read ? 'bg-teal-50/40' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                                {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1"></span>}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-gray-400 mt-1 block">
                                {new Date(n.created_at).toLocaleDateString('uz-UZ')}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-teal-400 bg-gray-50/80 hover:bg-teal-50/40 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 bg-gradient-to-tr from-teal-600 to-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-xs">
                      {firstLetter}
                    </div>
                    <div className="flex items-center gap-1.5 text-left">
                      <span className="text-sm font-semibold text-gray-800 max-w-[130px] truncate">
                        {userName}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        userPlan === 'Pro' || userPlan === 'Premium'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {userPlan}
                      </span>
                    </div>
                    <i className={`ri-arrow-down-s-line text-gray-500 text-sm transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}></i>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400 font-medium">Hisob egasi</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                        {userEmail && <p className="text-xs text-gray-500 truncate mt-0.5">{userEmail}</p>}
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">Faol reja:</span>
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                            {userPlan} obuna
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/chat"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        >
                          <i className="ri-chat-voice-line text-teal-600 text-base"></i>
                          <span>AI Maslahatxonaga oʻtish</span>
                        </Link>
                        <Link
                          to="/history"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        >
                          <i className="ri-history-line text-teal-600 text-base"></i>
                          <span>Suhbatlar tarixi</span>
                        </Link>
                        <Link
                          to="/pricing"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        >
                          <i className="ri-vip-crown-line text-amber-500 text-base"></i>
                          <span>Tarifni oshirish</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <i className="ri-logout-box-r-line text-base"></i>
                          <span>Chiqish</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors px-3 py-2">
                  Kirish
                </Link>
                <Link to="/register" className="bg-teal-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-teal-700 transition-colors whitespace-nowrap shadow-sm">
                  Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden cursor-pointer p-1">
            <i className={`text-2xl text-gray-700 ${mobileOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <div className="flex flex-col space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.path) ? 'bg-teal-50 text-teal-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-4 border-t border-gray-100 space-y-2 mt-2">
                {!loading && isLoggedIn && user ? (
                  <div className="px-4 py-2 bg-gray-50 rounded-xl space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {firstLetter}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{userName}</p>
                        <p className="text-xs text-teal-700 font-medium">Reja: {userPlan}</p>
                      </div>
                    </div>
                    <div className="pt-2 flex gap-2">
                      <Link
                        to="/chat"
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 bg-teal-600 text-white text-center py-2 rounded-lg text-xs font-semibold"
                      >
                        AI Maslahat
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-3 bg-red-100 text-red-700 rounded-lg text-xs font-semibold"
                      >
                        Chiqish
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-center text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm">
                      Kirish
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-center bg-teal-600 text-white rounded-full font-semibold text-sm hover:bg-teal-700 transition-colors">
                      Ro'yxatdan o'tish
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
