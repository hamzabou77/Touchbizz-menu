import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api, tokenStorage } from '../lib/api';
import { localStore } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password?: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  isSupabaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = tokenStorage.get();
      if (token) {
        try {
          const res = await api.auth.me();
          if (res?.user) {
            setUser(res.user);
            localStore.setUser(res.user);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('[TouchBizz Auth] Token expired or invalid, clearing session.');
          tokenStorage.set(null);
        }
      }

      // Check stored user fallback
      const localUser = localStore.getUser();
      setUser(localUser);
      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        localStore.setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Connexion échouée.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Identifiants invalides.' };
    }
  };

  const signup = async (email: string, password?: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.register(email, password, name);
      if (res.success && res.user) {
        setUser(res.user);
        localStore.setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Inscription échouée.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de l’inscription.' };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    setUser(null);
    localStore.setUser(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.auth.forgotPassword(email);
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erreur lors de la demande de réinitialisation.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        resetPassword,
        isSupabaseActive: false, // Supabase completely removed; replaced by Hostinger MySQL & Backend Auth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
