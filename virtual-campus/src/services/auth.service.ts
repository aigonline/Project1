// services/auth.service.ts
import api from '../utils/api';
import { User } from '../types/user.types';

interface AuthResponse {
  token: string;
  data: {
    user: User;
  };
}

const authService = {
  login: (email: string, password: string): Promise<AuthResponse> => {
    return api.post('/auth/login', { email, password });
  },

  signup: (userData: any): Promise<AuthResponse> => {
    return api.post('/auth/signup', userData);
  },

  getCurrentUser: (): Promise<{ data: { user: User } }> => {
    return api.get('/auth/me');
  },
};

export default authService;