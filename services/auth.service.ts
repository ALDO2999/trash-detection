import api from './api';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'PETUGAS';
  pointBalance: number;
  avatarUrl?: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

const AuthService = {
  async register(payload: RegisterPayload) {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },

  async verifyOtp(email: string, otp: string) {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  },

  async resendOtp(email: string) {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  },

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await api.post('/auth/login', payload);
    return res.data.data as LoginResponse;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const res = await api.post('/auth/reset-password', { email, otp, newPassword });
    return res.data;
  },

  async logout(refreshToken: string) {
    const res = await api.post('/auth/logout', { refreshToken });
    return res.data;
  },
};

export default AuthService;
