import { useLanguage } from '../context/LanguageContext';

interface LanguageToggleProps {
  className?: string;
  variant?: 'navbar' | 'compact' | 'mobile';
}

export default function LanguageToggle({ className = '', variant = 'navbar' }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-teal-50/50 text-gray-800 transition-all font-semibold text-sm cursor-pointer shadow-2xs ${className}`}
        title={language === 'uz' ? "Translate to English" : "O'zbek tiliga o'girish"}
      >
        <span className="flex items-center gap-2.5">
          <i className="ri-translate-2 text-teal-600 text-lg"></i>
          <span>{language === 'uz' ? 'English (Translate)' : 'O‘zbek tili'}</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
          {language === 'uz' ? '🇬🇧 EN' : '🇺🇿 UZ'}
        </span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 hover:border-teal-400 bg-white hover:bg-teal-50/60 text-gray-700 transition-all cursor-pointer shadow-2xs hover:scale-105 ${className}`}
        title={language === 'uz' ? "Translate whole website to English" : "Saytni o'zbek tiliga qaytarish"}
      >
        <i className="ri-translate-2 text-teal-600 text-sm"></i>
        <span>{language === 'uz' ? '🇬🇧 English' : '🇺🇿 O‘zbekcha'}</span>
      </button>
    );
  }

  // Default navbar variant
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border border-teal-200/80 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-100/60 text-teal-900 transition-all cursor-pointer shadow-2xs hover:scale-105 ${className}`}
      title={language === 'uz' ? "Translate whole website to English" : "Saytni o'zbek tiliga qaytarish"}
      aria-label="Toggle language"
    >
      <i className="ri-translate-2 text-teal-600 text-base"></i>
      <span className="font-extrabold">{language === 'uz' ? '🇬🇧 English' : '🇺🇿 O‘zbekcha'}</span>
    </button>
  );
}

export { LanguageToggle };
