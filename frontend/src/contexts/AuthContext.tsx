import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';
import { User, AuthResponse, ApiResponse } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde kullanıcıyı kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Token'ın geçerli olup olmadığını kontrol et
          const response = await api.get<ApiResponse<User>>('/auth/me');
          
          if (response.data.success && response.data.data) {
            setUser(response.data.data);
            setToken(storedToken);
          } else {
            // Token geçersizse temizle
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Token geçersizse temizle
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
        email,
        password
      });

      if (response.data.success && response.data.data) {
        const { user: userData, token: userToken } = response.data.data;
        
        setUser(userData);
        setToken(userToken);
        
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success('Başarıyla giriş yaptınız!');
        return true;
      }
      
      toast.error(response.data.message || 'Giriş başarısız!');
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Giriş sırasında hata oluştu';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
        name,
        email,
        password
      });

      if (response.data.success && response.data.data) {
        const { user: userData, token: userToken } = response.data.data;
        
        setUser(userData);
        setToken(userToken);
        
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success('Hesabınız başarıyla oluşturuldu!');
        return true;
      }
      
      toast.error(response.data.message || 'Kayıt başarısız!');
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Kayıt sırasında hata oluştu';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Başarıyla çıkış yaptınız');
  };

  const updateProfile = async (name: string): Promise<boolean> => {
    try {
      const response = await api.put<ApiResponse<User>>('/auth/me', { name });
      
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        toast.success('Profil güncellendi');
        return true;
      }
      
      toast.error(response.data.message || 'Profil güncellenemedi');
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profil güncellenirken hata oluştu';
      toast.error(message);
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};