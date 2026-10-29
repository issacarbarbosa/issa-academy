import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export type AdminViewMode = 'aluno' | 'edicao';

export interface AdminEditTarget {
  type: 'site_text' | 'announcement' | 'lesson' | 'question' | 'game_config';
  key?: string;
  data?: unknown;
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  isLocalPreview?: boolean;
}

interface AdminContextType {
  isAdmin: boolean;
  user: AdminUser | null;
  mode: AdminViewMode;
  setMode: (mode: AdminViewMode) => void;
  activeEditTarget: AdminEditTarget | null;
  openEditTarget: (target: AdminEditTarget) => void;
  closeEditTarget: () => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginLocalPreview: (password: string) => boolean;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const LOCAL_ADMIN_STORAGE_KEY = 'issa_admin_session_v2';
const LOCAL_PREVIEW_SECRET = 'issa2026';

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [mode, setMode] = useState<AdminViewMode>('aluno');
  const [activeEditTarget, setActiveEditTarget] = useState<AdminEditTarget | null>(null);

  const handleAuthenticatedUser = async (authUser: {
    id: string;
    email?: string;
    user_metadata?: { full_name?: string };
  }) => {
    const userEmail = authUser.email || '';

    // Valida se o usuário autenticado realmente consta na whitelist de admins
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_whitelist')
          .select('email')
          .eq('email', userEmail.toLowerCase())
          .maybeSingle();

        if (error || !data) {
          console.warn(`Acesso negado: o e-mail ${userEmail} não consta na admin_whitelist.`);
          await supabase.auth.signOut();
          setUser(null);
          setIsAdmin(false);
          setMode('aluno');
          return;
        }
      } catch {
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
        setMode('aluno');
        return;
      }
    }

    setUser({
      id: authUser.id,
      email: userEmail,
      name: authUser.user_metadata?.full_name || userEmail,
    });
    setIsAdmin(true);
  };

  // Restaura sessão existente e trata tokens na URL
  useEffect(() => {
    // 1. Trata e recupera tokens residuais no fragmento/hash (conflito do HashRouter)
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      const hash = window.location.hash;
      const tokenIdx = hash.indexOf('access_token=');
      if (tokenIdx !== -1) {
        const params = new URLSearchParams(hash.substring(tokenIdx));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token && isSupabaseConfigured && supabase) {
          void supabase.auth.setSession({ access_token, refresh_token }).then(({ data, error }) => {
            if (!error && data.session?.user) {
              void handleAuthenticatedUser(data.session.user);
            }
          });
          // Limpa tokens da URL imediatamente para proteger histórico e telemetria
          window.history.replaceState(null, '', `${window.location.origin}${window.location.pathname}#/admin`);
        }
      }
    }

    // 2. Tenta restaurar sessão Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          void handleAuthenticatedUser(data.session.user);
        } else {
          checkLocalSession();
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          void handleAuthenticatedUser(session.user);
        } else {
          checkLocalSession();
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      checkLocalSession();
    }
  }, []);

  const checkLocalSession = () => {
    // Em produção, nunca permite sessão local sem credenciais reais
    if (import.meta.env.PROD) {
      localStorage.removeItem(LOCAL_ADMIN_STORAGE_KEY);
      setUser(null);
      setIsAdmin(false);
      setMode('aluno');
      return;
    }

    try {
      const stored = localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsAdmin(true);
      } else {
        setUser(null);
        setIsAdmin(false);
        setMode('aluno');
      }
    } catch {
      setUser(null);
      setIsAdmin(false);
      setMode('aluno');
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          await handleAuthenticatedUser(data.user);
          return { success: true };
        }
      } catch (err) {
        return { success: false, error: String(err) };
      }
    }

    // Se Supabase não estiver configurado (apenas desenvolvimento local)
    if (!import.meta.env.PROD && password === LOCAL_PREVIEW_SECRET) {
      const localUser: AdminUser = {
        id: 'local_preview_admin',
        email,
        name: 'Administrador Local (Preview)',
        isLocalPreview: true,
      };
      localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(localUser));
      setUser(localUser);
      setIsAdmin(true);
      return { success: true };
    }

    return {
      success: false,
      error: 'Credenciais inválidas.',
    };
  };

  const sendMagicLink = async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
          },
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    }
    return { success: false, error: 'Supabase não está configurado no .env' };
  };

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}${window.location.pathname}`,
          },
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    }
    return { success: false, error: 'Google OAuth requer chaves do Supabase no .env' };
  };

  const loginLocalPreview = (password: string) => {
    if (import.meta.env.PROD) {
      console.warn('Modo preview local bloqueado em produção.');
      return false;
    }

    if (password === LOCAL_PREVIEW_SECRET) {
      const localUser: AdminUser = {
        id: 'local_preview_admin',
        email: 'admin@issa-academy.com',
        name: 'Administrador Local (Preview)',
        isLocalPreview: true,
      };
      localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(localUser));
      setUser(localUser);
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_ADMIN_STORAGE_KEY);
    setUser(null);
    setIsAdmin(false);
    setMode('aluno');
    setActiveEditTarget(null);
  };

  const openEditTarget = (target: AdminEditTarget) => {
    setActiveEditTarget(target);
  };

  const closeEditTarget = () => {
    setActiveEditTarget(null);
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        user,
        mode,
        setMode,
        activeEditTarget,
        openEditTarget,
        closeEditTarget,
        loginWithEmail,
        sendMagicLink,
        loginWithGoogle,
        loginLocalPreview,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin deve ser usado dentro de um AdminProvider');
  }
  return context;
};
