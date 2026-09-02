import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/v1/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post('/api/v1/auth/register', { email, password, name }),
  me: () => api.get('/api/v1/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/api/v1/auth/forgot-password', { email }),
  verifyOTP: (email: string, otp: string) =>
    api.post('/api/v1/auth/verify-otp', { email, otp }),
  resetPassword: (email: string, otp: string, password: string, confirmPassword: string) =>
    api.post('/api/v1/auth/reset-password', { email, otp, password, confirm_password: confirmPassword }),
  logout: () => api.post('/api/v1/auth/logout'),
};

export const statsAPI = {
  getOverview: () => api.get('/api/v1/admin/stats'),
};

export const ridesAPI = {
  getActive: () => api.get('/api/v1/admin/rides?status=active'),
  getHistory: () => api.get('/api/v1/admin/rides?status=completed'),
  // Tanpa filter status — dipakai log "ride terakhir" di dashboard, yang justru
  // perlu melihat planned dan cancelled juga.
  getRecent: (limit = 6) => api.get(`/api/v1/admin/rides?limit=${limit}`),
};

export const usersAPI = {
  getAll: () => api.get('/api/v1/admin/users'),
};

/* ---------------------------------------------------------------------------
   Bentuk data dari backend.

   Field-field baru ditulis opsional dengan sengaja. Kalau binary backend yang
   sedang jalan masih versi lama, field-nya memang tidak ada — dan halaman harus
   bisa mengatakan "angkanya tidak dikirim" alih-alih menampilkan 0 sebagai
   fakta. Itu persis bug yang bikin dashboard ini dulu memamerkan angka nol.
   Nama field mengikuti tag JSON di backend, jadi jangan di-camelCase-kan.
   --------------------------------------------------------------------------- */

/** Satu baris dari GET /api/v1/admin/rides — repository.RideSummary. */
export interface RideRow {
  id: string;
  owner_id: string;
  /** Nama pemilik hasil LEFT JOIN users; string kosong kalau usernya terhapus. */
  owner_name?: string;
  invite_code?: string;
  /** planned | active | completed | cancelled. Sengaja string, bukan union:
   *  status baru di backend tidak boleh bikin halaman ini pecah. */
  status: string;
  started_at?: string | null;
  ended_at?: string | null;
  created_at: string;
  members_count?: number;
}

export interface RidesListResponse {
  rides?: RideRow[];
  limit?: number;
  offset?: number;
  status?: string;
}

export interface RideStatusBreakdown {
  planned: number;
  active: number;
  completed: number;
  cancelled: number;
}

/** Jumlah ride yang dibuat per jam, indeks 0–23. */
export interface ActivityProfile {
  today: number[];
  yesterday: number[];
  current_hour: number;
}

/** GET /api/v1/admin/stats. */
export interface StatsOverview {
  users?: number;
  rides?: number;
  rides_today?: number;
  by_status?: RideStatusBreakdown;
  activity?: ActivityProfile;
  /** Waktu server saat angka dihitung, RFC3339. */
  generated_at?: string;
  /** Zona waktu yang benar-benar dipakai backend untuk batas "hari ini". */
  time_zone?: string;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
  ridesCount?: number;
}

export interface UsersListResponse {
  users?: UserRow[];
}
