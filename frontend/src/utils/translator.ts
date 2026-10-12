/**
 * Full website translation engine using Google Translate Web Translator
 * with React 19 DOM reconciliation safeguards.
 */

// Safeguard against React 19 removeChild / insertBefore crashes when external DOM translator operates
if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

declare global {
  interface Window {
    google?: any;
    __initGoogleTranslate?: () => void;
    __googleTranslateLoaded?: boolean;
  }
}

/**
 * Initializes Google Translate script invisibly in the background.
 */
export function initGoogleTranslate(): void {
  if (typeof window === 'undefined') return;

  // Add hidden container if missing
  if (!document.getElementById('google_translate_element')) {
    const el = document.createElement('div');
    el.id = 'google_translate_element';
    el.style.display = 'none';
    el.style.position = 'absolute';
    el.style.top = '-9999px';
    el.style.left = '-9999px';
    document.body.appendChild(el);
  }

  window.__initGoogleTranslate = () => {
    try {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'uz',
            includedLanguages: 'en,uz',
            autoDisplay: false,
            multilanguagePage: true,
          },
          'google_translate_element'
        );
        window.__googleTranslateLoaded = true;

        const currentLang = localStorage.getItem('aiadvokat_lang');
        if (currentLang === 'en') {
          setTimeout(() => {
            triggerGoogleCombo('en');
          }, 300);
        }
      }
    } catch (e) {
      console.warn('Google Translate initialization note:', e);
    }
  };

  if (!document.getElementById('google-translate-script')) {
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=__initGoogleTranslate';
    script.async = true;
    document.head.appendChild(script);
  }
}

function setGoogleTransCookie(cookieVal: string) {
  const domain = window.location.hostname;
  document.cookie = `googtrans=${cookieVal}; path=/;`;
  document.cookie = `googtrans=${cookieVal}; path=/; domain=${domain};`;
  if (domain.includes('.') && !/^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
    const parts = domain.split('.');
    if (parts.length >= 2) {
      const rootDomain = parts.slice(-2).join('.');
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${rootDomain};`;
    }
  }
}

function triggerGoogleCombo(targetLang: 'en' | 'uz'): boolean {
  const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (combo) {
    if (combo.value !== targetLang) {
      combo.value = targetLang;
      combo.dispatchEvent(new Event('change'));
    }
    return true;
  }
  return false;
}

/**
 * Triggers full DOM translation to English or restores to original Uzbek.
 */
export function applyFullPageTranslation(lang: 'en' | 'uz'): void {
  if (typeof window === 'undefined') return;

  if (lang === 'en') {
    setGoogleTransCookie('/uz/en');
    const ok = triggerGoogleCombo('en');
    if (!ok) {
      let tries = 0;
      const interval = setInterval(() => {
        tries++;
        if (triggerGoogleCombo('en') || tries > 20) {
          clearInterval(interval);
        }
      }, 150);
    }
  } else {
    setGoogleTransCookie('/uz/uz');
    triggerGoogleCombo('uz');
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    const domain = window.location.hostname;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    // If google translate altered any wrapper frames, gently re-trigger combo
    setTimeout(() => {
      triggerGoogleCombo('uz');
    }, 100);
  }
}
