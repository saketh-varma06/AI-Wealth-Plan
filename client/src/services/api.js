import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  googleAuth: (data) => API.post('/auth/google', data),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password }),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// User
export const userAPI = {
  saveOnboarding: (data) => API.post('/user/onboarding', data),
  getFinancialProfile: () => API.get('/user/financial-profile'),
  updateFinancialProfile: (data) => API.put('/user/financial-profile', data),
  getDashboardStats: () => API.get('/user/dashboard-stats'),
};

// Expenses
export const expenseAPI = {
  getExpenses: (params) => API.get('/expenses', { params }),
  addExpense: (data) => API.post('/expenses', data),
  updateExpense: (id, data) => API.put(`/expenses/${id}`, data),
  deleteExpense: (id) => API.delete(`/expenses/${id}`),
  getStats: () => API.get('/expenses/stats'),
};

// Goals
export const goalAPI = {
  getGoals: () => API.get('/goals'),
  createGoal: (data) => API.post('/goals', data),
  updateGoal: (id, data) => API.put(`/goals/${id}`, data),
  deleteGoal: (id) => API.delete(`/goals/${id}`),
  addContribution: (id, data) => API.post(`/goals/${id}/contribute`, data),
  getPurchaseImpact: (id) => API.get(`/goals/${id}/impact`),
};

// Investments
export const investmentAPI = {
  getInvestments: () => API.get('/investments'),
  addInvestment: (data) => API.post('/investments', data),
  updateInvestment: (id, data) => API.put(`/investments/${id}`, data),
  deleteInvestment: (id) => API.delete(`/investments/${id}`),
  getPortfolio: () => API.get('/investments/portfolio'),
  getWatchlist: () => API.get('/investments/watchlist'),
};

// Notifications
export const notificationAPI = {
  getNotifications: () => API.get('/notifications'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
  deleteNotification: (id) => API.delete(`/notifications/${id}`),
};

// Reports
export const reportAPI = {
  getReportData: (params) => API.get('/reports/data', { params }),
  downloadCSV: (params) => API.get('/reports/csv', { params, responseType: 'blob' }),
};

// Admin
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getAllUsers: (params) => API.get('/admin/users', { params }),
  updateUserRole: (id, role) => API.put(`/admin/users/${id}/role`, { role }),
};

export default API;
