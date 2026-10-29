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

  // Restaura sessão existente
  useEffect(() => {
    // 1. Tenta restaurar sessão Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          const authUser = data.session.user;
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.full_name || authUser.email,
          });
          setIsAdmin(true);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email,
          });
          setIsAdmin(true);
        } else {
          // Se não houver sessão Supabase, checa se há sessão local
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
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || data.user.email,
          });
          setIsAdmin(true);
          return { success: true };
        }
      } catch (err) {
        return { success: false, error: String(err) };
      }
    }

    // Se Supabase não estiver configurado, aceita senha local de preview
    if (password === LOCAL_PREVIEW_SECRET) {
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
      error: 'Credenciais inválidas. Para modo preview local use a senha do projeto.',
    };
  };

  const sendMagicLink = async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin + window.location.pathname,
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
            redirectTo: window.location.origin + window.location.pathname,
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
