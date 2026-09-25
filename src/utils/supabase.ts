/**
 * AdvokatAI - Supabase Database Types
 * Exactly matches the SOURCE OF TRUTH schema in PostgreSQL.
 */
export interface Profile {
  id: string; // uuid PRIMARY KEY, references auth.users.id
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  login_count?: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string; // uuid PRIMARY KEY
  name: string;
  description: string | null;
  price_uzs: number;
  duration_days: number;
  daily_question_limit: number;
  document_limit?: number;
  search_limit?: number;
  can_copy: boolean;
  can_download: boolean;
  can_edit: boolean;
  is_active: boolean;
  created_at: string;
}


export interface UserSubscription {
  id: string; // uuid PRIMARY KEY
  user_id: string; // references auth.users.id
  plan_id: string; // references public.plans.id
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  started_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  plans?: Plan | null;
}

export interface Conversation {
  id: string; // uuid PRIMARY KEY
  user_id: string; // references auth.users.id
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string; // uuid PRIMARY KEY
  conversation_id: string; // references public.conversations.id
  user_id: string; // references auth.users.id
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface LegalCategory {
  id: string; // uuid PRIMARY KEY
  name_uz: string;
  slug: string;
  description_uz: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LegalArticle {
  id: string; // uuid PRIMARY KEY
  category_id: string | null; // references public.legal_categories.id
  title_uz: string;
  article_number: string | null;
  source_name: string;
  source_url: string | null;
  content_uz: string;
  summary_uz: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  legal_categories?: LegalCategory | null;
}

export interface DocumentTemplate {
  id: string; // uuid PRIMARY KEY
  title_uz: string;
  description_uz: string | null;
  category_id: string | null; // references public.legal_categories.id
  content_template: string;
  is_active: boolean;
  requires_login: boolean;
  created_at: string;
  updated_at: string;
  legal_categories?: LegalCategory | null;
}

export interface UserDocument {
  id: string; // uuid PRIMARY KEY
  user_id: string; // references auth.users.id
  template_id: string | null; // references public.document_templates.id
  title: string;
  content: string;
  file_url: string | null;
  status: 'draft' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  document_templates?: DocumentTemplate | null;
}

export interface Favorite {
  id: string; // uuid PRIMARY KEY
  user_id: string; // references auth.users.id
  legal_article_id: string | null; // references public.legal_articles.id
  document_template_id: string | null; // references public.document_templates.id
  created_at: string;
  legal_articles?: LegalArticle | null;
  document_templates?: DocumentTemplate | null;
}

export interface AiUsage {
  id: string; // uuid PRIMARY KEY
  user_id: string; // references auth.users.id
  conversation_id: string | null; // references public.conversations.id
  usage_date: string;
  question_count: number;
  document_count?: number;
  search_count?: number;
  created_at: string;
  updated_at: string;
}


export interface Feedback {
  id: string; // uuid PRIMARY KEY
  user_id: string | null; // references auth.users.id
  conversation_id: string | null; // references public.conversations.id
  message_id: string | null; // references public.messages.id
  rating: number | null; // 1 through 5
  comment: string | null;
  status: 'new' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface Notification {
  id: string; // uuid PRIMARY KEY
  user_id: string; // references auth.users.id
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

import { supabase } from '../lib/supabaseClient';
export { supabase };

// --- HELPER QUERIES MATCHING SOURCE OF TRUTH SCHEMA ---

/**
 * Fetch profile for an authenticated user from public.profiles
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

/**
 * Ensure a profile row exists for an authenticated user in public.profiles
 */
export async function ensureProfile(userId: string, email: string, fullName?: string): Promise<Profile | null> {
  try {
    const existing = await getProfile(userId);
    if (existing) return existing;

    const newProfile = {
      id: userId,
      email: email,
      full_name: fullName || email.split('@')[0],
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(newProfile, { onConflict: 'id' })
      .select('*')
      .single();

    if (error || !data) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

/**
 * Retrieve active subscription for a user by user_id and verify current validity.
 * Joins user_subscriptions with plans to extract permissions.
 */
export async function getActiveSubscription(userId: string): Promise<{
  subscription: UserSubscription | null;
  plan: Plan | null;
}> {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*, plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .lte('started_at', now)
      .gte('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { subscription: null, plan: null };
    }

    const sub = data as any;
    const plan = sub.plans as Plan || null;
    return {
      subscription: sub,
      plan: plan
    };
  } catch {
    return { subscription: null, plan: null };
  }
}

/**
 * Retrieve all active subscription plans from public.plans
 */
export async function getActivePlans(): Promise<Plan[]> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price_uzs', { ascending: true });

    if (error || !data) return [];
    return data as Plan[];
  } catch {
    return [];
  }
}

/**
 * Retrieve all active legal categories from public.legal_categories
 */
export async function getLegalCategories(): Promise<LegalCategory[]> {
  try {
    const { data, error } = await supabase
      .from('legal_categories')
      .select('*')
      .eq('is_active', true)
      .order('name_uz', { ascending: true });

    if (error || !data) return [];
    return data as LegalCategory[];
  } catch {
    return [];
  }
}

/**
 * Search or list legal articles from public.legal_articles
 */
export async function getLegalArticles(options?: {
  categoryId?: string;
  searchQuery?: string;
  limit?: number;
}): Promise<LegalArticle[]> {
  try {
    let query = supabase
      .from('legal_articles')
      .select('*, legal_categories(*)')
      .eq('is_active', true);

    if (options?.categoryId && options.categoryId !== 'all') {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.trim();
      query = query.or(`title_uz.ilike.%${q}%,article_number.ilike.%${q}%,content_uz.ilike.%${q}%`);
    }

    query = query.order('created_at', { ascending: false }).limit(options?.limit || 50);

    const { data, error } = await query;
    if (error || !data) return [];
    return data as LegalArticle[];
  } catch {
    return [];
  }
}

/**
 * Retrieve document templates from public.document_templates
 */
export async function getDocumentTemplates(categoryId?: string): Promise<DocumentTemplate[]> {
  try {
    let query = supabase
      .from('document_templates')
      .select('*, legal_categories(*)')
      .eq('is_active', true);

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error || !data) return [];
    return data as DocumentTemplate[];
  } catch {
    return [];
  }
}

/**
 * Retrieve user's own saved documents from public.user_documents
 */
export async function getUserDocuments(userId: string): Promise<UserDocument[]> {
  try {
    const { data, error } = await supabase
      .from('user_documents')
      .select('*, document_templates(*)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error || !data) return [];
    return data as UserDocument[];
  } catch {
    return [];
  }
}

/**
 * Retrieve conversations for authenticated user from public.conversations
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error || !data) return [];
    return data as Conversation[];
  } catch {
    return [];
  }
}

/**
 * Retrieve messages for a conversation from public.messages
 */
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data as Message[];
  } catch {
    return [];
  }
}

/**
 * Retrieve user's favorites from public.favorites
 */
export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, legal_articles(*), document_templates(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as Favorite[];
  } catch {
    return [];
  }
}

/**
 * Check and get today's comprehensive usage counts for an authenticated user
 */
export async function getTodayUserUsage(userId: string): Promise<{ question_count: number; document_count: number; search_count: number }> {
  try {
    const { data, error } = await supabase.rpc('get_user_usage', { p_user_id: userId });
    if (!error && data) {
      return {
        question_count: Number(data.question_count || 0),
        document_count: Number(data.document_count || 0),
        search_count: Number(data.search_count || 0),
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const { data: rowData, error: rowError } = await supabase
      .from('ai_usage')
      .select('question_count, document_count, search_count')
      .eq('user_id', userId)
      .eq('usage_date', today)
      .maybeSingle();

    if (rowError || !rowData) {
      return { question_count: 0, document_count: 0, search_count: 0 };
    }

    return {
      question_count: Number(rowData.question_count || 0),
      document_count: Number(rowData.document_count || 0),
      search_count: Number(rowData.search_count || 0),
    };
  } catch {
    return { question_count: 0, document_count: 0, search_count: 0 };
  }
}

/**
 * Backward-compatible helper for today's AI question count
 */
export async function getTodayAiUsage(userId: string): Promise<number> {
  const usage = await getTodayUserUsage(userId);
  return usage.question_count;
}

/**
 * Increment user usage counter atomically in Supabase
 */
export async function incrementUserUsage(
  userId: string, 
  type: 'question' | 'document' | 'search'
): Promise<{ question_count: number; document_count: number; search_count: number }> {
  try {
    const { data, error } = await supabase.rpc('increment_user_usage', {
      p_user_id: userId,
      p_usage_type: type
    });

    if (!error && data) {
      return {
        question_count: Number(data.question_count || 0),
        document_count: Number(data.document_count || 0),
        search_count: Number(data.search_count || 0),
      };
    }

    // Fallback: direct table select and upsert
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('ai_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('usage_date', today)
      .maybeSingle();

    const currentQuestions = existing?.question_count || 0;
    const currentDocs = existing?.document_count || 0;
    const currentSearches = existing?.search_count || 0;

    const newQuestions = type === 'question' ? currentQuestions + 1 : currentQuestions;
    const newDocs = type === 'document' ? currentDocs + 1 : currentDocs;
    const newSearches = type === 'search' ? currentSearches + 1 : currentSearches;

    if (existing) {
      await supabase
        .from('ai_usage')
        .update({
          question_count: newQuestions,
          document_count: newDocs,
          search_count: newSearches,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('ai_usage').insert({
        user_id: userId,
        usage_date: today,
        question_count: newQuestions,
        document_count: newDocs,
        search_count: newSearches,
      });
    }

    return {
      question_count: newQuestions,
      document_count: newDocs,
      search_count: newSearches,
    };
  } catch (err) {
    console.warn('[Supabase] incrementUserUsage notice:', err);
    return { question_count: 0, document_count: 0, search_count: 0 };
  }
}

/**
 * Record user login event in Supabase profiles
 */
export async function recordUserLogin(userId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('record_user_login', { p_user_id: userId });
    if (error) {
      // Direct update fallback
      await supabase
        .from('profiles')
        .update({
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }
  } catch (err) {
    console.warn('[Supabase] recordUserLogin notice:', err);
  }
}


/**
 * Retrieve user notifications from public.notifications
 */
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as Notification[];
  } catch {
    return [];
  }
}

/**
 * Mark a notification as read in public.notifications
 */
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}

export default supabase;
