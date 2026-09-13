import { useState, useEffect } from 'react'
import { AuthScreen } from './components/auth/AuthScreen'
import { LandingPage } from './components/landing/LandingPage'
import { Dashboard } from './components/dashboard/Dashboard'
import { SkipLink } from './components/ui/SkipLink'
import { useAuthStore } from './store/authStore'
import { useGameStore } from './store/gameStore'

export default function App() {
  const initialize = useAuthStore((state) => state.initialize)
  const initializing = useAuthStore((state) => state.initializing)
  const session = useAuthStore((state) => state.session)
  const preview = useAuthStore((state) => state.preview)
  const resetGame = useGameStore((state) => state.reset)

  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  useEffect(() => {
    void initialize()
  }, [initialize])

  useEffect(() => {
    if (!session && !preview) resetGame()
  }, [session, preview, resetGame])

  const signedIn = Boolean(session || preview)

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setShowAuth(true)
  }

  return (
    <>
      <SkipLink />
      {initializing ? (
        <main id="main-content" className="grid min-h-screen place-items-center px-4" tabIndex={-1}>
          <p role="status" className="text-muted">
            Restoring session…
          </p>
        </main>
      ) : signedIn ? (
        <Dashboard />
      ) : showAuth ? (
        <AuthScreen
          initialMode={authMode}
          onBack={() => setShowAuth(false)}
        />
      ) : (
        <LandingPage onOpenAuth={handleOpenAuth} />
      )}
    </>
  )
}
