import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { PREVIEW_TOKEN } from '../lib/previewData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  accessToken: string | null
  preview: boolean
  initializing: boolean
  authError: string | null
  isPasswordRecovery: boolean
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>
  updatePassword: (newPassword: string) => Promise<{ success: boolean; message?: string }>
  setPasswordRecovery: (val: boolean) => void
  enterPreview: () => void
  signOut: () => Promise<void>
  clearError: () => void
}

let unsubscribe: (() => void) | undefined

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  accessToken: null,
  preview: false,
  initializing: true,
  authError: null,
  isPasswordRecovery: false,

  initialize: async () => {
    if (!supabase) {
      set({
        initializing: false,
        authError:
          'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      })
      return
    }

    unsubscribe?.()

    const hasRecoveryHash =
      typeof window !== 'undefined' &&
      (window.location.hash.includes('type=recovery') ||
        window.location.search.includes('type=recovery'))

    const { data } = await supabase.auth.getSession()
    set({
      session: data.session,
      user: data.session?.user ?? null,
      accessToken: data.session?.access_token ?? null,
      preview: false,
      initializing: false,
      authError: null,
      isPasswordRecovery: Boolean(hasRecoveryHash),
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const isRecovery = event === 'PASSWORD_RECOVERY' || (
        typeof window !== 'undefined' &&
        (window.location.hash.includes('type=recovery') ||
          window.location.search.includes('type=recovery'))
      )

      set({
        session,
        user: session?.user ?? null,
        accessToken: session?.access_token ?? null,
        preview: false,
        isPasswordRecovery: Boolean(isRecovery),
      })
    })

    unsubscribe = () => listener.subscription.unsubscribe()
  },

  signIn: async (email, password) => {
    if (!supabase) {
      set({ authError: 'Supabase is not configured.' })
      return
    }

    set({ authError: null })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) set({ authError: error.message })
  },

  signUp: async (email, password, username) => {
    if (!supabase) {
      set({ authError: 'Supabase is not configured.' })
      return
    }

    set({ authError: null })
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: username },
      },
    })
    if (error) set({ authError: error.message })
  },

  resetPassword: async (email: string) => {
    if (!supabase) {
      set({ authError: 'Supabase is not configured.' })
      return { success: false, message: 'Supabase is not configured.' }
    }

    set({ authError: null })
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
    })
    if (error) {
      set({ authError: error.message })
      return { success: false, message: error.message }
    }
    return { success: true }
  },

  updatePassword: async (newPassword: string) => {
    if (!supabase) {
      set({ authError: 'Supabase is not configured.' })
      return { success: false, message: 'Supabase is not configured.' }
    }

    set({ authError: null })
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      set({ authError: error.message })
      return { success: false, message: error.message }
    }

    // Explicitly sign out recovery session so user logs in cleanly with new password
    await supabase.auth.signOut()
    set({
      session: null,
      user: null,
      accessToken: null,
      isPasswordRecovery: false,
      authError: null,
    })

    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    return { success: true }
  },

  setPasswordRecovery: (val: boolean) => set({ isPasswordRecovery: val }),

  enterPreview: () => {
    set({
      preview: true,
      accessToken: PREVIEW_TOKEN,
      authError: null,
      initializing: false,
    })
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut()
    set({
      user: null,
      session: null,
      accessToken: null,
      preview: false,
      authError: null,
    })
  },

  clearError: () => set({ authError: null }),
}))

export { isSupabaseConfigured }
