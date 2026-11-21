import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Types ─────────────────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  full_name: string
  phone_number?: string
  is_active: boolean
  is_verified: boolean
}

interface Wallet {
  id: number
  balance_kg: number
  total_earned_kg?: number
  total_spent_kg?: number
}

// ── Auth Store ────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  /** Set full auth state after login */
  setAuth: (user: User, token: string, refreshToken: string) => void
  /** Update only the user object (e.g. after profile save) */
  setUser: (user: User) => void
  /** Clear all auth state and localStorage tokens */
  clearAuth: () => void
  /** Alias for clearAuth — used by Navbar and Profile page */
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
        }
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
        }
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// ── Wallet Store ──────────────────────────────────────────────────────────

interface WalletState {
  wallet: Wallet | null
  setWallet: (wallet: Wallet) => void
  clearWallet: () => void
}

export const useWalletStore = create<WalletState>()((set) => ({
  wallet: null,
  setWallet: (wallet) => set({ wallet }),
  clearWallet: () => set({ wallet: null }),
}))
