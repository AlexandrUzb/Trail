import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
                <i className="ri-scales-3-line text-white text-lg"></i>
              </div>
              <span className="text-lg font-bold text-gray-900 notranslate" translate="no">AI Advokat</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t('footer_desc')}
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a href="https://instagram.com/aiadvokat.uz" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:border-teal-400 hover:text-teal-600 transition-colors text-gray-500" title="Instagram: aiadvokat.uz" aria-label="Instagram: aiadvokat.uz">
                <i className="ri-instagram-line text-sm"></i>
              </a>
              <a href="https://t.me/uzbadvokatai" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:border-teal-400 hover:text-teal-600 transition-colors text-gray-500" title="Telegram: @uzbadvokatai" aria-label="Telegram: @uzbadvokatai">
                <i className="ri-telegram-line text-sm"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">{t('footer_services')}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/chat" className="hover:text-teal-600 cursor-pointer">{t('footer_srv_chat')}</Link></li>
              <li><Link to="/templates" className="hover:text-teal-600 cursor-pointer">{t('footer_srv_templates')}</Link></li>
              <li><Link to="/search" className="hover:text-teal-600 cursor-pointer">{t('footer_srv_search')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">{t('footer_company')}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/about" className="hover:text-teal-600 cursor-pointer">{t('footer_about')}</Link></li>
              <li><a href="https://buymeacoffee.com/advokatai" target="_blank" rel="noopener noreferrer" className="hover:text-amber-800 text-amber-700 font-medium cursor-pointer">{t('nav_support_project')}</a></li>
              <li><Link to="/terms" className="hover:text-teal-600 cursor-pointer">{t('footer_terms')}</Link></li>
              <li><Link to="/privacy" className="hover:text-teal-600 cursor-pointer">{t('footer_privacy')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">{t('footer_contact')}</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center space-x-2">
                <i className="ri-mail-line text-teal-500"></i>
                <a href="mailto:zokirovzafar881@gmail.com" className="hover:text-teal-600 truncate">
                  zokirovzafar881@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <i className="ri-phone-line text-teal-500"></i>
                <a href="tel:+998906950811" className="hover:text-teal-600">
                  +998 90 695 08 11
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <i className="ri-map-pin-line text-teal-500 mt-1 flex-shrink-0"></i>
                <span className="text-xs leading-relaxed">
                  {t('footer_address')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-gray-400 text-xs">{t('footer_rights')}</p>
            <span className="hidden sm:inline text-gray-300">·</span>
            <Link to="/about" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-teal-700 transition-colors">
              <img src="/zafar_zokirov.jpg" alt="Zafar Zokirov" className="w-5 h-5 rounded-full object-cover border border-gray-300" />
              <span>{t('footer_developer')} <strong className="font-semibold text-gray-700">Zafar Zokirov</strong></span>
            </Link>
          </div>
          <div className="flex items-center space-x-4 mt-3 md:mt-0">
            <Link to="/terms" className="text-xs text-gray-400 hover:text-teal-600">{t('footer_terms')}</Link>
            <Link to="/privacy" className="text-xs text-gray-400 hover:text-teal-600">{t('footer_privacy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
