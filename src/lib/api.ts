import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const ACCESS_KEY = 'admin_token';
const REFRESH_KEY = 'admin_refresh_token';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mutex: kalau 2 request 401 barengan, hanya 1 yang panggil refresh.
// Yang lain await promise yang sama, baru replay request-nya.
let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;

  // Pakai axios "mentah" (no interceptors) biar gak loop. Endpoint refresh
  // gak butuh Authorization header.
  const raw = axios.create({ baseURL: API_BASE_URL });
  try {
    const res = await raw.post<{
      access_token: string;
      refresh_token?: string;
    }>('/api/v1/auth/refresh', { refresh_token: refresh });

    if (!res.data?.access_token) return null;

    localStorage.setItem(ACCESS_KEY, res.data.access_token);
    // Refresh token SELALU baru setelah rotation. Yang lama udah hangus
    // (server hapus atomic). Kalau gak di-save, request berikutnya bakal
    // pakai token lama → 401 lagi.
    if (res.data.refresh_token) {
      localStorage.setItem(REFRESH_KEY, res.data.refresh_token);
    }
    return res.data.access_token;
  } catch {
    return null;
  }
}

function refreshToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = performRefresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

// Callback dipasang dari AuthContext (lihat src/contexts/AuthContext.tsx).
// Dipanggil saat refresh gagal = sesi beneran berakhir.
let onAuthExpired: (() => void) | null = null;
export function setOnAuthExpired(cb: () => void) {
  onAuthExpired = cb;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      const newToken = await refreshToken();
      if (newToken && original) {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        return api.request(original);
      }
      // Refresh gagal = sesi berakhir. Bersihin + broadcast.
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      onAuthExpired?.();
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
  refresh: (refreshToken: string) =>
    api.post('/api/v1/auth/refresh', { refresh_token: refreshToken }),
  logout: () => api.post('/api/v1/auth/logout'),
  forgotPassword: (email: string) =>
    api.post('/api/v1/auth/forgot-password', { email }),
  verifyOTP: (email: string, otp: string) =>
    api.post('/api/v1/auth/verify-otp', { email, otp }),
  resetPassword: (email: string, otp: string, password: string, confirmPassword: string) =>
    api.post('/api/v1/auth/reset-password', { email, otp, password, confirm_password: confirmPassword }),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/api/v1/auth/change-password', { old_password: oldPassword, new_password: newPassword }),
};

export const statsAPI = {
  getOverview: () => api.get('/api/v1/admin/stats'),
};

export interface RiderLocation {
  user_id: string;
  user_name: string;
  lat: number;
  lng: number;
  speed?: number | null;
  heading?: number | null;
  timestamp: string;
}

export const ridesAPI = {
  getActive: () => api.get('/api/v1/admin/rides?status=active'),
  getHistory: () => api.get('/api/v1/admin/rides?status=completed'),
  // Tanpa filter status — dipakai log "ride terakhir" di dashboard, yang justru
  // perlu melihat planned dan cancelled juga.
  getRecent: (limit = 6) => api.get(`/api/v1/admin/rides?limit=${limit}`),
  getRideLocations: (rideId: string) =>
    api.get(`/api/v1/admin/rides/${rideId}/locations`),
};

export const usersAPI = {
  getAll: () => api.get('/api/v1/admin/users'),
  create: (payload: UserFormPayload) =>
    api.post('/api/v1/admin/users', payload),
  update: (id: string, payload: UserUpdatePayload) =>
    api.put(`/api/v1/admin/users/${id}`, payload),
  remove: (id: string) => api.delete(`/api/v1/admin/users/${id}`),
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

/** Payload untuk POST /api/v1/admin/users (create). Password wajib. */
export interface UserFormPayload {
  email: string;
  name: string;
  role: 'user' | 'admin';
  password: string;
}

/** Payload untuk PUT /api/v1/admin/users/:id (update). Semua field opsional. */
export interface UserUpdatePayload {
  email?: string;
  name?: string;
  role?: 'user' | 'admin';
}
