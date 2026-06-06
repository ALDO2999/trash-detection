import api from './api';
import { WasteType } from './scan.service';

export interface DashboardData {
  pointBalance: number;
  totalPointsEarned: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
  totalWeightKg: number;
  wasteStats: Record<WasteType, { totalWeight: number; totalSubmissions: number }>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  pointBalance: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  points: number;
  isCurrentUser: boolean;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  currentUser: { id: string; rank: number; name: string; points: number } | null;
}

const UserService = {
  async getDashboard(): Promise<DashboardData> {
    const res = await api.get('/user/dashboard');
    return res.data.data as DashboardData;
  },

  async getProfile(): Promise<UserProfile> {
    const res = await api.get('/user/profile');
    return res.data.data as UserProfile;
  },

  async getLeaderboard(): Promise<LeaderboardData> {
    const res = await api.get('/user/leaderboard');
    return res.data.data as LeaderboardData;
  },

  async updateProfile(data: { name?: string; phone?: string }): Promise<UserProfile> {
    const res = await api.patch('/user/profile', data);
    return res.data.data as UserProfile;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.patch('/user/password', { currentPassword, newPassword });
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/user/account');
  },
};

export default UserService;
