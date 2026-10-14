import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  getAnalyticsConsent,
  updateAnalyticsConsent,
  trackPageView,
} from '../utils/analytics';

export default function CookieConsentBanner() {
  const { t, language } = useLanguage();
  const [consent, setConsent] = useState<'granted' | 'denied' | null>(() => getAnalyticsConsent());
  const [showBanner, setShowBanner] = useState<boolean>(() => getAnalyticsConsent() === null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const handleConsentChange = (e: Event) => {
      const customEvent = e as CustomEvent<'granted' | 'denied'>;
      setConsent(customEvent.detail);
      setShowBanner(false);
    };

    const handleOpenSettings = () => {
      setShowModal(true);
    };

    window.addEventListener('aiadvokat_cookie_consent_changed', handleConsentChange);
    window.addEventListener('open-cookie-settings', handleOpenSettings);

    return () => {
      window.removeEventListener('aiadvokat_cookie_consent_changed', handleConsentChange);
      window.removeEventListener('open-cookie-settings', handleOpenSettings);
    };
  }, []);

  const handleAccept = () => {
    updateAnalyticsConsent(true);
    setConsent('granted');
    setShowBanner(false);
    // Track current page upon initial consent grant
    trackPageView(window.location.pathname, window.location.search);
  };

  const handleDecline = () => {
    updateAnalyticsConsent(false);
    setConsent('denied');
    setShowBanner(false);
  };

  return (
    <>
      {/* 1. Floating Bottom Cookie Consent Banner */}
      {showBanner && (
        <aside
          role="region"
          aria-label={language === 'en' ? 'Cookie Consent Notice' : 'Cookie xabarnomasi'}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-white border border-gray-200 rounded-2xl p-5 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0 text-teal-600">
              <i className="ri-shield-check-line text-lg"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900">
                {language === 'en' ? 'Privacy & Analytics Cookies' : 'Maxfiylik va Cookie fayllar'}
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {t('cookie_banner_desc')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-gray-100">
            <Link
              to="/privacy"
              className="text-xs text-teal-600 hover:text-teal-700 font-medium underline self-start sm:self-center"
            >
              {t('cookie_learn_more')}
            </Link>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleDecline}
                className="flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors cursor-pointer"
              >
                {t('cookie_decline')}
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                {t('cookie_accept')}
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Interactive Cookie Settings Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-lg">
                  <i className="ri-settings-4-line"></i>
                </div>
                <h2 id="cookie-settings-title" className="text-base font-bold text-gray-900">
                  {t('cookie_modal_title')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                aria-label={t('btn_close')}
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              {t('cookie_modal_desc')}
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">
                  Google Analytics 4 (GA4)
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    consent === 'granted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {consent === 'granted'
                    ? t('cookie_status_granted')
                    : t('cookie_status_denied')}
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                {language === 'en'
                  ? 'Measures page views, session counts, and general traffic sources without storing personal information or chat content.'
                  : 'Shaxsiy maʼlumotlar yoki yuridik yozishmalarsiz sahifalar ko‘rish soni, seanslar va umumiy trafik manbalarini anonim tahlil qiladi.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <div className="w-full sm:w-auto">
                {consent === 'granted' ? (
                  <button
                    type="button"
                    onClick={() => {
                      updateAnalyticsConsent(false);
                      setConsent('denied');
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors cursor-pointer"
                  >
                    {t('cookie_btn_disable')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      updateAnalyticsConsent(true);
                      setConsent('granted');
                      trackPageView(window.location.pathname, window.location.search);
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors cursor-pointer"
                  >
                    {t('cookie_btn_allow')}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors cursor-pointer"
              >
                {t('cookie_btn_close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
