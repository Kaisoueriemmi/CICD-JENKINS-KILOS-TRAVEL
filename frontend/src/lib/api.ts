import axios from 'axios'

// NEXT_PUBLIC_API_URL is already set to http://localhost:8000/api/v1
// in next.config.js — do NOT append /api/v1 again.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
})

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Auth ──────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (email: string, password: string) => {
    // FastAPI OAuth2PasswordRequestForm requires x-www-form-urlencoded with 'username'
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    return api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },

  register: (data: {
    email: string
    password: string
    full_name: string
    phone_number?: string
  }) => api.post('/auth/register', data),

  getCurrentUser: () => api.get('/auth/me'),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),

  logout: () => api.post('/auth/logout'),

  /** Generic request helper used by some pages (e.g. settings/security) */
  request: (path: string, method: string, data?: any) =>
    api.request({ url: path, method, data }),
}

// ── Users ─────────────────────────────────────────────────────────────────

export const usersAPI = {
  getMe: () => api.get('/auth/me'),
  updateMe: (id: number, data: { full_name?: string; phone_number?: string }) =>
    api.put(`/users/${id}`, data),
}

// ── Wallet ────────────────────────────────────────────────────────────────

export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  getStats: () => api.get('/wallet/stats'),
  transfer: (data: { recipient_email: string; amount_kg: number; description?: string }) =>
    api.post('/transactions/transfer', null, { params: { recipient_email: data.recipient_email, amount_kg: data.amount_kg } }),
}

// ── Flights ───────────────────────────────────────────────────────────────

export const flightAPI = {
  getFlights: (skip = 0, limit = 20) =>
    api.get('/flights', { params: { skip, limit } }),
  getFlight: (id: number) => api.get(`/flights/${id}`),
  createFlight: (data: {
    flight_number: string
    airline: string
    departure_airport: string
    arrival_airport: string
    flight_date: string
    flight_type?: string
    allowed_weight_kg: number
    actual_weight_kg: number
  }) => api.post('/flights', data),
  deleteFlight: (id: number) => api.delete(`/flights/${id}`),
}

// ── Transactions ──────────────────────────────────────────────────────────

export const transactionAPI = {
  getTransactions: (skip = 0, limit = 20) =>
    api.get('/transactions', { params: { skip, limit } }),
}

// ── Notifications ─────────────────────────────────────────────────────────

export const notificationsAPI = {
  getNotifications: (params?: { skip?: number; limit?: number; unread_only?: boolean }) =>
    api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
  deleteNotification: (id: number) => api.delete(`/notifications/${id}`),
}

export default api
