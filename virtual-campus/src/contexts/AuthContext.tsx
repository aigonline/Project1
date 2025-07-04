// contexts/AuthContext.tsx
import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { User } from '../types/user.types';
import authService from '../services/auth.service';

interface AuthContextProps {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: any) => Promise<void>;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user: User | null = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
    localStorage.removeItem('user');
  }
  if (token && user) {
    setCurrentUser(user);
    // Optionally, validate token with backend here
    authService.getCurrentUser()
      .then(response => {
        setCurrentUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  } else {
    setLoading(false);
  }
}, [router]);

  const login = async (email: string, password: string) => {
  const response = await authService.login(email, password);
  setCurrentUser(response.data.user);
  localStorage.setItem('token', response.token);
  localStorage.setItem('user', JSON.stringify(response.data.user)); // Save user
};

  const signup = async (userData: any) => {
    const response = await authService.signup(userData);
    setCurrentUser(response.data.user);
    localStorage.setItem('token', response.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    router.push('/login');
  };

  const updateUser = (user: User) => {
    setCurrentUser(user);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, signup, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};