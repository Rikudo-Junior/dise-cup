import api from './client';
import type { RegisterDto, LoginDto } from './types';

// Auth
export const authApi = {
  register: (data: RegisterDto) => api.post('/auth/register', data).then(r => r.data),
  login: (data: LoginDto) => api.post('/auth/login', data).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
};

// Matches
export const matchesApi = {
  getAll: (params?: { tournamentId?: string; status?: string }) =>
    api.get('/matches', { params }).then(r => r.data),
  getUpcoming: (limit = 10) =>
    api.get('/matches/upcoming', { params: { limit } }).then(r => r.data),
  getOne: (id: string) => api.get(`/matches/${id}`).then(r => r.data),
  updateScore: (id: string, data: { homeScore: number; awayScore: number; status?: string }) =>
    api.patch(`/matches/${id}/score`, data).then(r => r.data),
  updateStatus: (id: string, data: { status: string; homeScore?: number; awayScore?: number }) =>
    api.patch(`/matches/${id}/status`, data).then(r => r.data),
  create: (data: object) => api.post('/matches', data).then(r => r.data),
  delete: (id: string) => api.delete(`/matches/${id}`).then(r => r.data),
  getTournaments: () => api.get('/tournaments').then(r => r.data),
};

// Predictions
export const predictionsApi = {
  create: (data: { matchId: string; predictedHome: number; predictedAway: number; firstScorer?: string }) =>
    api.post('/predictions', data).then(r => r.data),
  getForMatch: (matchId: string) =>
    api.get(`/predictions/match/${matchId}`).then(r => r.data),
  getMyPredictionForMatch: (matchId: string) =>
    api.get(`/predictions/match/${matchId}/mine`).then(r => r.data),
};

// Rankings
export const rankingsApi = {
  getGlobal: (page = 1, limit = 50) =>
    api.get('/rankings', { params: { page, limit } }).then(r => r.data),
  getMyRank: () => api.get('/rankings/me').then(r => r.data),
  getByPromotion: (promotion: string) =>
    api.get(`/rankings/promotion/${promotion}`).then(r => r.data),
  getPublicStats: () => api.get('/rankings/public-stats').then(r => r.data),
};

// Users
export const usersApi = {
  getMe: () => api.get('/users/me').then(r => r.data),
  updateMe: (data: object) => api.patch('/users/me', data).then(r => r.data),
  getStats: () => api.get('/users/me/stats').then(r => r.data),
  getMyPredictions: (page = 1) =>
    api.get('/users/me/predictions', { params: { page } }).then(r => r.data),
};

// Badges
export const badgesApi = {
  getAll: () => api.get('/badges').then(r => r.data),
  getMy: () => api.get('/badges/me').then(r => r.data),
};

// Admin
export const adminApi = {
  getStats: () => api.get('/admin/stats').then(r => r.data),
  getUsers: (params?: { page?: number; search?: string }) =>
    api.get('/admin/users', { params }).then(r => r.data),
  banUser: (id: string, reason?: string) =>
    api.patch(`/admin/users/${id}/ban`, { reason }).then(r => r.data),
  unbanUser: (id: string) =>
    api.patch(`/admin/users/${id}/unban`).then(r => r.data),
};

interface RegisterDto {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  promotion: string;
  password: string;
}
interface LoginDto { email: string; password: string; }
