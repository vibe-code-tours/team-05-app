'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SELLER' | 'CLIENT';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isSeller: boolean;
  isClient: boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Read from Zustand store (single source of truth)
  const storeUser = useAuthStore((s) => s.user);
  const storeToken = useAuthStore((s) => s.accessToken);
  const storeLogin = useAuthStore((s) => s.login);
  const storeLogout = useAuthStore((s) => s.logout);

  const [user, setUser] = useState<User | null>(storeUser);

  // Sync Zustand state to local state
  useEffect(() => {
    setUser(storeUser);
  }, [storeUser]);

  useEffect(() => {
    // Validate token on mount if one exists in Zustand
    if (storeToken && storeUser) {
      validateToken(storeToken);
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const validateToken = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${apiUrl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUser(data.data);
          storeLogin(data.data, token);
        } else {
          clearAuth();
        }
      } else {
        // Token invalid - try refresh
        clearAuth();
      }
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      const { user: userData, accessToken } = data.data;
      storeLogin(userData, accessToken);
      setUser(userData);

      // Redirect based on role
      redirectByRole(userData.role);
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const logout = () => {
    storeLogout();
    setUser(null);
    router.push('/login');
  };

  const clearAuth = () => {
    storeLogout();
    setUser(null);
  };

  const refreshToken = async () => {
    // Token refresh not yet implemented on backend
    clearAuth();
  };

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        router.push('/admin');
        break;
      case 'SELLER':
        router.push('/seller');
        break;
      case 'CLIENT':
      default:
        router.push('/');
        break;
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isSeller = user?.role === 'SELLER';
  const isClient = user?.role === 'CLIENT';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isSeller, isClient, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
