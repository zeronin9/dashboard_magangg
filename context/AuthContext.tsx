'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { User, UserRole, LoginResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (payload: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Cek login saat aplikasi dimuat
  useEffect(() => {
    const savedUser = Cookies.get('user_data');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (payload: any) => {
    setIsLoading(true);
    try {
      // POST ke /api/auth/login sesuai dokumentasi
      const { data } = await api.post<LoginResponse>('/auth/login', payload);
      
      const { token, user } = data;

      // Simpan Token & User Data
      Cookies.set('token', token, { expires: 1 }); // 1 hari
      Cookies.set('user_role', user.role, { expires: 1 });
      Cookies.set('user_data', JSON.stringify(user), { expires: 1 });

      setUser(user);

      // LOGIC REDIRECT BERDASARKAN ROLE
      switch (user.role) {
        case 'admin_platform':
          router.push('/platform');
          break;
        case 'super_admin':
          router.push('/mitra');
          break;
        case 'branch_admin':
          router.push('/branch');
          break;
        default:
          alert('Role tidak dikenali');
      }
    } catch (error: any) {
      console.error('Login Failed:', error);
      throw new Error(error.response?.data?.message || 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user_role');
    Cookies.remove('user_data');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};