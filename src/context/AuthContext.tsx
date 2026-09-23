import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, getProfile, ensureProfile, getActiveSubscription } from '../utils/supabase';
import type { Plan, UserSubscription } from '../utils/supabase';
import { safeStorage } from '../utils/api';

export interface AuthUser {
  id: string; // auth.users.id === profiles.id
  userId: string;
  email: string;
  name: string;
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  role: 'user' | 'admin';
  plan: string;
  plan_id?: string;
  plan_expires_at?: string | null;
  activeSubscription?: UserSubscription | null;
  planDetails?: Plan | null;
  dailyLimit: number;
  canCopy: boolean;
  canDownload: boolean;
  canEdit: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (userData: AuthUser, token?: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (fields: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  loading: true,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
  updateUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const clearAuthStorage = useCallback(() => {
    safeStorage.removeItem('advokatai_token');
    safeStorage.removeItem('advokatai_is_logged_in');
    safeStorage.removeItem('advokatai_user');
    safeStorage.removeItem('advokatai_user_name');
    safeStorage.removeItem('advokatai_user_email');
    safeStorage.removeItem('advokatai_user_id');
  }, []);

  const loadUserData = useCallback(async (sbUser: any, token?: string) => {
    try {
      const userId = sbUser.id;
      const userEmail = sbUser.email || '';

      // 1. Retrieve application profile from public.profiles
      let profile = await getProfile(userId);
      if (!profile) {
        // Automatically ensure profile row exists for authenticated Supabase user
        profile = await ensureProfile(
          userId, 
          userEmail, 
          sbUser.user_metadata?.full_name || userEmail.split('@')[0]
        );
      }

      // 2. Retrieve active subscription joined with public.plans
      const { subscription, plan } = await getActiveSubscription(userId);

      const displayName = profile?.full_name || sbUser.user_metadata?.full_name || userEmail.split('@')[0] || 'Foydalanuvchi';
      const planName = plan?.name || 'Bepul';

      const authUser: AuthUser = {
        id: userId,
        userId: userId,
        email: userEmail,
        name: displayName,
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url || null,
        phone: profile?.phone || null,
        role: profile?.role || 'user',
        plan: planName,
        plan_id: plan?.id || undefined,
        plan_expires_at: subscription?.expires_at || null,
        activeSubscription: subscription,
        planDetails: plan,
        dailyLimit: plan?.daily_question_limit ?? 5,
        canCopy: plan?.can_copy ?? false,
        canDownload: plan?.can_download ?? false,
        canEdit: plan?.can_edit ?? false,
      };

      setUser(authUser);
      setIsLoggedIn(true);

      // Store token for backward compatibility / API calls
      if (token) {
        safeStorage.setItem('advokatai_token', token);
      }
      safeStorage.setItem('advokatai_is_logged_in', 'true');
      safeStorage.setItem('advokatai_user_id', userId);
      safeStorage.setItem('advokatai_user_name', displayName);
      safeStorage.setItem('advokatai_user_email', userEmail);
      safeStorage.setJSON('advokatai_user', authUser);
    } catch (err) {
      console.error('[AuthContext] Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize session directly from Supabase Auth
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session || !session.user) {
          if (mounted) {
            clearAuthStorage();
            setUser(null);
            setIsLoggedIn(false);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          await loadUserData(session.user, session.access_token);
        }
      } catch {
        if (mounted) {
          clearAuthStorage();
          setUser(null);
          setIsLoggedIn(false);
          setLoading(false);
        }
      }
    }

    initAuth();

    // Listen to real-time Supabase Auth state transitions
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          await loadUserData(session.user, session.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        clearAuthStorage();
        setUser(null);
        setIsLoggedIn(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [clearAuthStorage, loadUserData]);

  const login = useCallback((userData: AuthUser, token?: string) => {
    setUser(userData);
    setIsLoggedIn(true);
    setLoading(false);
    if (token) safeStorage.setItem('advokatai_token', token);
    safeStorage.setItem('advokatai_is_logged_in', 'true');
    safeStorage.setItem('advokatai_user_id', userData.id);
    safeStorage.setItem('advokatai_user_name', userData.name);
    safeStorage.setItem('advokatai_user_email', userData.email);
    safeStorage.setJSON('advokatai_user', userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuthStorage();
      setUser(null);
      setIsLoggedIn(false);
      setLoading(false);
      window.dispatchEvent(new Event('advokatai_auth_changed'));
    }
  }, [clearAuthStorage]);

  const refreshUser = useCallback(async () => {
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser) {
      const { data: { session } } = await supabase.auth.getSession();
      await loadUserData(sbUser, session?.access_token);
    }
  }, [loadUserData]);

  const updateUser = useCallback(async (fields: Partial<AuthUser>) => {
    if (!user) return;

    // Update in Supabase public.profiles if fields match profile columns
    const profileUpdates: any = {};
    if (fields.name || fields.full_name) profileUpdates.full_name = fields.name || fields.full_name;
    if (fields.phone) profileUpdates.phone = fields.phone;
    if (fields.avatar_url) profileUpdates.avatar_url = fields.avatar_url;

    if (Object.keys(profileUpdates).length > 0) {
      profileUpdates.updated_at = new Date().toISOString();
      await supabase.from('profiles').update(profileUpdates).eq('id', user.id);
    }

    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...fields };
      safeStorage.setJSON('advokatai_user', updated);
      if (updated.name) safeStorage.setItem('advokatai_user_name', updated.name);
      if (updated.email) safeStorage.setItem('advokatai_user_email', updated.email);
      return updated;
    });
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
