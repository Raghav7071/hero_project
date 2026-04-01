import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401s globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const authAPI = {
  signup: (data: { email: string; password: string; fullName: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { fullName: string }) =>
    api.patch('/auth/profile', data),
};

// ── Subscription ──
export const subscriptionAPI = {
  checkout: (planId: string) => api.post('/subscription/checkout', { planId }),
  cancel: () => api.post('/subscription/cancel'),
  status: () => api.get('/subscription/status'),
  plans: () => api.get('/subscription/plans'),
};

// ── Scores ──
export const scoresAPI = {
  getAll: () => api.get('/scores'),
  add: (data: { score: number; playDate: string }) => api.post('/scores', data),
  remove: (id: string) => api.delete(`/scores/${id}`),
};

// ── Draw ──
export const drawAPI = {
  results: () => api.get('/draw/results'),
  myResults: () => api.get('/draw/my-results'),
  execute: (data: { drawDate: string; algorithm: string; simulate: boolean }) =>
    api.post('/draw/execute', data),
};

// ── Charity ──
export const charityAPI = {
  getAll: () => api.get('/charity'),
  getBySlug: (slug: string) => api.get(`/charity/${slug}`),
  select: (data: { charityId: string; contributionPct: number }) =>
    api.post('/charity/select', data),
};

// ── Winner ──
export const winnerAPI = {
  myWinnings: () => api.get('/winner/my-winnings'),
  uploadProof: (id: string, proofImageUrl: string) =>
    api.post(`/winner/upload-proof/${id}`, { proofImageUrl }),
};

// ── Admin ──
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  getWinners: () => api.get('/admin/winners'),
  updateWinnerStatus: (id: string, data: any) => api.patch(`/admin/winners/${id}`, data),
  createCharity: (data: any) => api.post('/admin/charities', data),
  deleteCharity: (id: string) => api.delete(`/admin/charities/${id}`),
};

export const contentAPI = {
  getHowItWorks: () => api.get('/content/how-it-works'),
};

export default api;
