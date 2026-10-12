import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const { language, t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    setErrorMessage('');

    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim();
    const cleanMessage = form.message.trim();

    if (!cleanName) {
      setErrorMessage(language === 'en' ? 'Please enter your name.' : 'Ismingizni kiriting.');
      setStatus('error');
      return;
    }

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setErrorMessage(language === 'en' ? 'Please enter a valid email address.' : 'Toʻgʻri email manzilini kiriting.');
      setStatus('error');
      return;
    }

    if (!cleanMessage || cleanMessage.length < 5) {
      setErrorMessage(
        language === 'en'
          ? 'Message must be at least 5 characters long.'
          : 'Xabaringiz kamida 5 ta belgidan iborat boʻlishi kerak.'
      );
      setStatus('error');
      return;
    }

    if (cleanMessage.length > 500) {
      setErrorMessage(
        language === 'en'
          ? 'Message must not exceed 500 characters.'
          : 'Xabar uzunligi 500 ta belgidan oshmasligi kerak.'
      );
      setStatus('error');
      return;
    }

    setStatus('submitting');
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
      setErrorMessage(
        language === 'en'
          ? 'An unexpected error occurred. Please try again.'
          : "Xatolik yuz berdi. Qayta urinib ko'ring."
      );
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-teal-50/40">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">
            {t('contact_tag')}
          </span>
          <h1 className="text-5xl font-bold text-gray-900 mt-3 mb-4">
            {t('contact_title')}
          </h1>
          <p className="text-lg text-gray-500">
            {t('contact_desc')}
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
            {[
              { icon: 'ri-mail-line', label: 'Email', value: 'zokirovzafar881@gmail.com' },
              {
                icon: 'ri-phone-line',
                label: language === 'en' ? 'Phone' : 'Telefon',
                value: '+998 90 695 08 11',
              },
              {
                icon: 'ri-map-pin-line',
                label: language === 'en' ? 'Address' : 'Manzil',
                value:
                  language === 'en'
                    ? 'Presidential School in Termez, Surkhandarya Region.'
                    : 'Surxondaryo, Termiz shahridagi Prezident maktabi.',
              },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className={`${item.icon} text-teal-600 text-xl`}></i>
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">{item.label}</div>
                <div className="text-sm font-medium text-gray-700 break-words">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Contact form */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('contact_form_title')}
              </h2>

              {status === 'success' && (
                <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center space-x-2">
                  <i className="ri-check-line text-teal-600 text-xl"></i>
                  <p className="text-teal-800 text-sm">{t('contact_success')}</p>
                </div>
              )}
              {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
                  <i className="ri-error-warning-line text-red-600 text-xl"></i>
                  <p className="text-red-800 text-sm">
                    {errorMessage || (language === 'en' ? 'An error occurred.' : "Xatolik yuz berdi.")}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('contact_name_label')}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    disabled={status === 'submitting'}
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (status === 'error') setStatus('idle');
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm disabled:bg-gray-100"
                    placeholder={t('contact_name_placeholder')}
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('contact_email_label')}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    disabled={status === 'submitting'}
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (status === 'error') setStatus('idle');
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm disabled:bg-gray-100"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="contact-msg" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('contact_msg_label')}
                  </label>
                  <textarea
                    id="contact-msg"
                    name="message"
                    disabled={status === 'submitting'}
                    maxLength={500}
                    rows={5}
                    value={form.message}
                    onChange={(e) => {
                      setForm({ ...form, message: e.target.value });
                      if (status === 'error') setStatus('idle');
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm disabled:bg-gray-100"
                    placeholder={t('contact_msg_placeholder')}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/500</p>
                </div>
                <button
                  type="submit"
                  disabled={status === 'submitting' || form.message.length > 500}
                  className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {status === 'submitting' && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{status === 'submitting' ? t('contact_btn_sending') : t('contact_btn_send')}</span>
                </button>
              </form>
            </div>

            <div className="space-y-6">
              {/* Social links */}
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {t('contact_social_title')}
                </h2>
                <div className="space-y-4">
                  {[
                    { icon: 'ri-telegram-line', label: 'Telegram', value: '@uzbadvokatai', href: 'https://t.me/uzbadvokatai' },
                    { icon: 'ri-instagram-line', label: 'Instagram', value: 'aiadvokat.uz', href: 'https://instagram.com/aiadvokat.uz' },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 p-3 rounded-xl hover:bg-teal-50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                        <i className={`${s.icon} text-teal-600 text-xl`}></i>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{s.label}</div>
                        <div className="text-xs text-gray-500">{s.value}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick help */}
              <div className="bg-gradient-to-br from-teal-600 to-cyan-500 rounded-2xl p-8 text-white">
                <h3 className="text-xl font-bold mb-3">{t('contact_quick_title')}</h3>
                <p className="text-teal-100 mb-6 text-sm">{t('contact_quick_desc')}</p>
                <Link
                  to="/chat"
                  className="inline-block px-6 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  {t('contact_quick_btn')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
