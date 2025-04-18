"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { AuthUser } from '@/types/auth';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load user from cookies on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const storedToken = Cookies.get('auth_token');
        
        if (storedToken) {
          // Validate token with API
          const response = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            // Invalid token, remove it
            Cookies.remove('auth_token');
            setUser(null);
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    if (isLoading) return;

    const publicPaths = ['/login', '/signup'];
    const isPublicPath = publicPaths.includes(pathname);

    if (!token && !isPublicPath) {
      // Get redirect URL from query params or default to login
      const redirect = searchParams.get('redirect') || '/login';
      router.push(redirect);
    } else if (token && isPublicPath) {
      router.push('/dashboard');
    }
  }, [token, isLoading, pathname, router, searchParams]);

  const login = (newToken: string, newUser: AuthUser) => {
    // Set cookie with secure options
    Cookies.set('auth_token', newToken, { 
      expires: 1, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    // Remove cookie
    Cookies.remove('auth_token');
    
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}; 