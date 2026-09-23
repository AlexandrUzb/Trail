/**
 * AdvokatAI - Production-Safe API Client
 * 
 * Features:
 * - Dynamic API Base URL resolution (supports VITE_API_BASE_URL or relative /api)
 * - Safe JSON parsing preventing "Unexpected end of JSON input" and "Unexpected token '<'..."
 * - Detects empty responses, HTML error pages, and non-JSON content before parsing
 * - Timeout protection (30s) preventing indefinite hangs on slow mobile networks
 * - Standardized, context-aware error messages in natural Uzbek
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  isHtml?: boolean;
}

export interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Returns the configured API base URL without trailing slash.
 * In development / single-domain Netlify deployment, defaults to empty string (relative paths).
 * If VITE_API_BASE_URL is defined (e.g. https://api.advokatai.uz), it prepends it.
 */
export function getApiBaseUrl(): string {
  const envUrl = (import.meta as any)?.env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return '';
}

/**
 * Resolves a full API URL given an endpoint (e.g. '/api/chat' or 'api/chat').
 */
export function getApiUrl(endpoint: string): string {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
}

/**
 * Performs a safe fetch and parses JSON robustly.
 * NEVER throws unhandled syntax errors when receiving empty or HTML responses.
 */
export async function safeFetchJson<T = any>(
  endpoint: string,
  options?: SafeFetchOptions
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://') 
    ? endpoint 
    : getApiUrl(endpoint);

  const defaultHeaders: Record<string, string> = {};
  if (options?.body && typeof options.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Automatically attach auth token if available in safeStorage
  try {
    const token = safeStorage.getItem('advokatai_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  } catch {}

  // Timeout protection via AbortController
  const timeoutMs = options?.timeoutMs ?? 30000;
  const controller = new AbortController();
  let timer: any = null;

  if (timeoutMs > 0) {
    timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);
  }

  const mergedOptions: RequestInit = {
    ...options,
    signal: options?.signal || controller.signal,
    headers: {
      ...defaultHeaders,
      ...(options?.headers || {}),
    },
  };

  try {
    const res = await fetch(url, mergedOptions);
    if (timer) clearTimeout(timer);

    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    // 1. Handle Empty Response Body
    if (!text || text.trim() === '') {
      let emptyMsg = "Serverdan maʼlumot olinmadi.";
      if (!res.ok) {
        if (res.status === 404) {
          emptyMsg = "Soʻralgan sahifa yoki xizmat topilmadi.";
        } else if (res.status >= 500) {
          emptyMsg = "Server bilan bogʻlanishda muammo yuz berdi. Iltimos, birozdan soʻng qayta urinib koʻring.";
        } else {
          emptyMsg = "Server bilan bogʻlanishda muammo yuz berdi. Iltimos, qayta urinib koʻring.";
        }
      }
      return {
        ok: false,
        status: res.status,
        error: emptyMsg,
      };
    }

    const trimmed = text.trim();

    // 2. Handle HTML response (e.g. Netlify index.html fallback, 404, or 502/504 Bad Gateway HTML)
    if (
      contentType.includes('text/html') ||
      trimmed.startsWith('<!DOCTYPE') ||
      trimmed.startsWith('<!doctype') ||
      trimmed.startsWith('<html')
    ) {
      if ((import.meta as any)?.env?.DEV) {
        console.warn(`[safeFetchJson] Expected JSON but received HTML from ${url} (Status: ${res.status})`);
      }

      let htmlError = "Server bilan bogʻlanishda muammo yuz berdi. Iltimos, birozdan soʻng qayta urinib koʻring.";
      if (res.status === 404) {
        htmlError = "Soʻralgan API xizmati topilmadi.";
      } else if (res.status === 502 || res.status === 504 || res.status >= 500) {
        htmlError = "Server bilan bogʻlanishda muammo yuz berdi. Iltimos, birozdan soʻng qayta urinib koʻring.";
      }

      return {
        ok: false,
        status: res.status,
        isHtml: true,
        error: htmlError,
      };
    }

    // 3. Parse JSON safely
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      if ((import.meta as any)?.env?.DEV) {
        console.warn(`[safeFetchJson] JSON parse error from ${url}:`, trimmed.slice(0, 100));
      }

      // Detect if text is a raw platform or infrastructure error (Vercel, Netlify, Cloudflare, Lambda)
      const isPlatformError = 
        trimmed.includes('NOT_FOUND') ||
        trimmed.includes('hkg1::') ||
        trimmed.includes('::') ||
        trimmed.includes('Cannot GET') ||
        trimmed.includes('Cannot POST') ||
        trimmed.toLowerCase().includes('bad gateway') ||
        trimmed.toLowerCase().includes('internal server error');

      let fallbackError: string;
      if (res.status === 404) {
        fallbackError = "Soʻralgan API xizmati topilmadi. Iltimos, keyinroq qayta urinib koʻring.";
      } else if (res.status === 401) {
        fallbackError = "Avtorizatsiya talab qilinadi. Iltimos, hisobingizga kiring.";
      } else if (res.status === 403) {
        fallbackError = "Sizda ushbu amalni bajarish uchun ruxsat yoʻq.";
      } else if (res.status === 422) {
        fallbackError = "Kiritilgan maʼlumotlar notoʻgʻri formatda.";
      } else if (res.status >= 500) {
        fallbackError = "Server bilan bogʻlanishda muammo yuz berdi. Iltimos, birozdan soʻng qayta urinib koʻring.";
      } else if (!isPlatformError && trimmed.length < 120 && !trimmed.includes('<') && !trimmed.includes('{')) {
        fallbackError = trimmed;
      } else {
        fallbackError = "Server bilan bogʻlanishda muammo yuz berdi. Iltimos, qayta urinib koʻring.";
      }

      return {
        ok: false,
        status: res.status,
        error: fallbackError,
      };
    }

    // 4. Check HTTP status code
    if (!res.ok) {
      let errMsg = parsed?.message || parsed?.error;
      if (!errMsg) {
        if (res.status === 404) {
          errMsg = "Soʻralgan API xizmati topilmadi (404).";
        } else if (res.status === 401) {
          errMsg = "Email yoki parol notoʻgʻri yoki avtorizatsiya talab qilinadi (401).";
        } else if (res.status === 403) {
          errMsg = "Ushbu amalni bajarish uchun ruxsat yoʻq (403).";
        } else if (res.status === 422) {
          errMsg = "Kiritilgan maʼlumotlar notoʻgʻri formatda (422).";
        } else if (res.status >= 500) {
          errMsg = "Server bilan bogʻlanishda muammo yuz berdi. Iltimos, birozdan soʻng qayta urinib koʻring.";
        } else {
          errMsg = `Server xatosi (${res.status}).`;
        }
      }

      return {
        ok: false,
        status: res.status,
        data: parsed,
        error: errMsg,
      };
    }

    // 5. Success
    return {
      ok: true,
      status: res.status,
      data: parsed,
    };
  } catch (networkErr: any) {
    if (timer) clearTimeout(timer);

    const isAbort = networkErr?.name === 'AbortError' || networkErr?.code === 20;
    if ((import.meta as any)?.env?.DEV) {
      console.warn(`[safeFetchJson] Network/Fetch error on ${url}:`, networkErr?.message || networkErr);
    }

    return {
      ok: false,
      status: 0,
      error: isAbort
        ? `Server javob berish vaqti tugadi (${Math.round(timeoutMs / 1000)}s). Internet tezligini tekshiring yoki keyinroq urinib koʻring.`
        : "Tarmoqqa ulanishda vaqtinchalik uzilish roʻy berdi. Internet aloqasini tekshiring yoki bir ozdan soʻng urinib koʻring.",
    };
  }
}

/**
 * Fault-tolerant storage wrapper for localStorage.
 * Safely handles:
 * - Safari Private Browsing mode QuotaExceededError / SecurityError
 * - Disabled third-party storage / cookies
 * - Corrupted JSON strings in storage
 * - Missing keys with sensible defaults
 */
export const safeStorage = {
  getItem(key: string, fallback: string | null = null): string | null {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch {
      return fallback;
    }
  },

  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      if ((import.meta as any)?.env?.DEV) {
        console.warn(`[safeStorage] Failed to set "${key}":`, e);
      }
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      if ((import.meta as any)?.env?.DEV) {
        console.warn(`[safeStorage] Failed to remove "${key}":`, e);
      }
      return false;
    }
  },

  getJSON<T = any>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  setJSON<T = any>(key: string, data: T): boolean {
    try {
      const raw = JSON.stringify(data);
      localStorage.setItem(key, raw);
      return true;
    } catch (e) {
      if ((import.meta as any)?.env?.DEV) {
        console.warn(`[safeStorage] Failed to stringify and set "${key}":`, e);
      }
      return false;
    }
  }
};

