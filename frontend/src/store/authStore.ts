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
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
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

    const { data } = await supabase.auth.getSession()
    set({
      session: data.session,
      user: data.session?.user ?? null,
      accessToken: data.session?.access_token ?? null,
      preview: false,
      initializing: false,
      authError: null,
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        accessToken: session?.access_token ?? null,
        preview: false,
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
