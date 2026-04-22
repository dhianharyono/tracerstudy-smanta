import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import axios from 'axios';
import { User } from '../types';

// Global axios configuration for cookies
axios.defaults.withCredentials = true;

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    role: string,
    captchaToken: string,
  ) => Promise<void>;
  logout: () => void;
  updateUser: (newUser: any) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data) {
        const userData = response.data;
        // Map _id to id if necessary
        const formattedUser = {
          ...userData,
          id: userData._id || userData.id
        };
        setUser(formattedUser);
        localStorage.setItem('user', JSON.stringify(formattedUser));
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial check on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });
      const { user: newUser } = response.data;
      const formattedUser = {
        ...newUser,
        id: newUser.id || newUser._id
      };
      setUser(formattedUser);
      localStorage.setItem('user', JSON.stringify(formattedUser));
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          'Cek Kembali Username dan Password Anda',
      );
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    role: string,
    captchaToken: string,
  ) => {
    try {
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password,
        role,
        captchaToken,
      });
      const { user: newUser } = response.data;
      const formattedUser = {
        ...newUser,
        id: newUser.id || newUser._id
      };
      setUser(formattedUser);
      localStorage.setItem('user', JSON.stringify(formattedUser));
    } catch (error: any) {
      const serverErrors = error.response?.data?.errors;
      const message = serverErrors && serverErrors.length > 0 
        ? serverErrors[0].msg 
        : (error.response?.data?.message || 'Pendaftaran gagal');
      throw new Error(message);
    }
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Prevent infinite loop if already null
          if (user) {
            setUser(null);
            localStorage.removeItem('user');
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [user]);

  const updateUser = (newUser: any) => {
    const formattedUser = {
      ...newUser,
      id: newUser.id || newUser._id,
    };
    setUser(formattedUser);
    localStorage.setItem('user', JSON.stringify(formattedUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
