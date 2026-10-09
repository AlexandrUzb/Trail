import { safeStorage } from './api';

export const GUEST_DAILY_SEARCH_LIMIT = 3;
export const GUEST_DAILY_DOCUMENT_LIMIT = 2;

export interface GuestUsageRecord {
  date: string;
  search_count: number;
  document_count: number;
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getStorageKey(dateStr: string): string {
  return `advokatai_guest_usage_${dateStr}`;
}

/**
 * Get current day's guest usage from persistent local storage.
 * Automatically cleans up old dates.
 */
export function getTodayGuestUsage(): GuestUsageRecord {
  const today = getTodayDateString();
  const key = getStorageKey(today);

  try {
    const record = safeStorage.getJSON<GuestUsageRecord | null>(key, null);
    if (record && record.date === today) {
      return {
        date: today,
        search_count: Number(record.search_count || 0),
        document_count: Number(record.document_count || 0),
      };
    }
  } catch {}

  // Clean old days (prevent localStorage accumulation)
  try {
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('advokatai_guest_usage_') && k !== key) {
          localStorage.removeItem(k);
        }
      }
    }
  } catch {}

  const initialRecord: GuestUsageRecord = {
    date: today,
    search_count: 0,
    document_count: 0,
  };
  safeStorage.setJSON(key, initialRecord);
  return initialRecord;
}

/**
 * Increment guest usage for searches or documents and persist.
 */
export function incrementGuestUsage(type: 'search' | 'document'): GuestUsageRecord {
  const today = getTodayDateString();
  const key = getStorageKey(today);
  const current = getTodayGuestUsage();

  const updated: GuestUsageRecord = {
    date: today,
    search_count: type === 'search' ? current.search_count + 1 : current.search_count,
    document_count: type === 'document' ? current.document_count + 1 : current.document_count,
  };

  safeStorage.setJSON(key, updated);
  return updated;
}

/**
 * Check if the guest has exhausted their free search quota
 */
export function isGuestSearchLimitReached(): boolean {
  const usage = getTodayGuestUsage();
  return usage.search_count >= GUEST_DAILY_SEARCH_LIMIT;
}

/**
 * Check if the guest has exhausted their free document generation quota
 */
export function isGuestDocumentLimitReached(): boolean {
  const usage = getTodayGuestUsage();
  return usage.document_count >= GUEST_DAILY_DOCUMENT_LIMIT;
}
