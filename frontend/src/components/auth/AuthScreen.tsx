import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { isSupabaseConfigured, useAuthStore } from '../../store/authStore'

type AuthMode = 'signin' | 'signup' | 'forgot'

interface AuthScreenProps {
  initialMode?: AuthMode
  onBack?: () => void
}

export function AuthScreen({ initialMode = 'signin', onBack }: AuthScreenProps) {
  const reduceMotion = useReducedMotion()
  const { signIn, signUp, resetPassword, authError, clearError } = useAuthStore()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const heading =
    mode === 'signin'
      ? 'Enter the guild'
      : mode === 'signup'
      ? 'Create your hero'
      : 'Reset your password'

  const actionLabel =
    mode === 'signin'
      ? 'Sign in'
      : mode === 'signup'
      ? 'Create account'
      : 'Send reset link'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()
    setNotice(null)
    setSubmitting(true)

    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else if (mode === 'signup') {
        await signUp(email, password, username)
        setNotice('Account created. If email confirmation is enabled, check your inbox, then sign in.')
      } else {
        const res = await resetPassword(email)
        if (res.success) {
          setNotice('Password reset link sent to your email. Check your inbox and follow the link to reset.')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(next: AuthMode) {
    setMode(next)
    clearError()
    setNotice(null)
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12"
      tabIndex={-1}
    >
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative rounded-2xl border border-gold/25 bg-panel/90 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
        aria-labelledby="auth-heading"
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-muted hover:text-gold transition-colors"
          >
            ← Back to Home
          </button>
        )}

        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-xl">🔥</span>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-gradient">
            ASHEN PATH • CHRONICLES OF ASH
          </p>
        </div>
        <h1 id="auth-heading" className="font-display text-3xl font-bold text-parchment">
          {heading}
        </h1>
        <p className="mt-2 text-xs text-muted">
          {mode === 'forgot'
            ? 'Enter your registered email address and we will dispatch a password recovery seal.'
            : 'Inscribe your soul with Supabase Auth to begin your journey through the Ashen Wastes.'}
        </p>

        {!isSupabaseConfigured && (
          <p className="mt-4 rounded-lg border border-ember/40 bg-ember/10 px-3 py-2 text-sm text-parchment" role="alert">
            Missing Supabase env vars. Copy <code>frontend/.env.example</code> to <code>frontend/.env</code> and add
            your project URL and anon key.
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} aria-describedby="auth-status">
          {mode === 'signup' && (
            <Field
              id="username"
              label="Hero name"
              autoComplete="username"
              value={username}
              onChange={setUsername}
              minLength={3}
              required
            />
          )}
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            required
          />
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-parchment">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="font-mono text-xs font-semibold text-gold hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
                className="w-full rounded-xl border border-gold/20 bg-ink px-3 py-2.5 text-parchment placeholder:text-muted/60"
              />
            </div>
          )}

          <div id="auth-status" aria-live="polite" className="min-h-[1.5rem] text-sm">
            {authError && <p className="text-ember">{authError}</p>}
            {notice && <p className="text-moss">{notice}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting || !isSupabaseConfigured}
            aria-label={
              mode === 'signin'
                ? 'Sign in to Life RPG'
                : mode === 'signup'
                ? 'Create Life RPG account'
                : 'Send password recovery link'
            }
            className="w-full rounded-xl bg-gold px-4 py-3 text-sm font-bold text-ink transition enabled:hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-60 shadow-[0_0_20px_rgba(226,179,104,0.25)]"
          >
            {submitting ? 'Binding the seal…' : actionLabel}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-3 text-sm">
          {mode === 'forgot' ? (
            <button
              type="button"
              className="font-semibold text-gold underline-offset-4 hover:underline mx-auto"
              onClick={() => switchMode('signin')}
            >
              ← Back to Sign in
            </button>
          ) : (
            <>
              <span className="text-muted">
                {mode === 'signin' ? 'New adventurer?' : 'Already sworn in?'}
              </span>
              <button
                type="button"
                className="font-semibold text-gold underline-offset-4 hover:underline"
                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                aria-label={mode === 'signin' ? 'Switch to create account' : 'Switch to sign in'}
              >
                {mode === 'signin' ? 'Create account' : 'Sign in'}
              </button>
            </>
          )}
        </div>
      </motion.section>

      <AnimatePresence>
        {submitting && (
          <motion.span className="sr-only" role="status">
            Authenticating
          </motion.span>
        )}
      </AnimatePresence>
    </main>
  )
}

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  required?: boolean
  minLength?: number
}

function Field({ id, label, value, onChange, type = 'text', autoComplete, required, minLength }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-parchment">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className="w-full rounded-xl border border-gold/20 bg-ink px-3 py-2.5 text-parchment placeholder:text-muted/60"
      />
    </div>
  )
}
