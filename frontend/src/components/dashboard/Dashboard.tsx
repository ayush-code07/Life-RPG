import { useEffect } from 'react'
import { CharacterProfile } from '../character/CharacterProfile'
import { QuestBoard } from '../quests/QuestBoard'
import { useAuthStore } from '../../store/authStore'
import { useGameStore } from '../../store/gameStore'

export function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const preview = useAuthStore((state) => state.preview)
  const signOut = useAuthStore((state) => state.signOut)
  const { profile, attributes, tasks, loading, syncing, error, hydrate, completeQuest, addQuest } =
    useGameStore()

  useEffect(() => {
    if (accessToken) void hydrate(accessToken)
  }, [accessToken, hydrate])

  const displayName =
    profile?.username ??
    (user?.user_metadata?.username as string | undefined) ??
    user?.email ??
    'Adventurer'

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Life RPG</p>
          <h1 className="font-display text-3xl sm:text-4xl">Command deck</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted">Signed in as {displayName}</p>
          <button
            type="button"
            onClick={() => void signOut()}
            aria-label="Sign out of Life RPG"
            className="rounded-lg border border-gold/30 px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/10"
          >
            Sign out
          </button>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]"
        aria-busy={loading || syncing}
      >
        {preview && (
          <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm lg:col-span-2" role="status">
            Offline preview. Connect Supabase and the API on port 5000 to sync a live character.
          </p>
        )}

        {error && (
          <p className="rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-sm lg:col-span-2" role="alert">
            {error}
          </p>
        )}

        {loading && !profile ? (
          <p className="lg:col-span-2 text-muted" role="status">
            Syncing your character from the backend…
          </p>
        ) : profile ? (
          <>
            <CharacterProfile profile={profile} attributes={attributes} />
            <QuestBoard
              quests={tasks}
              busy={syncing}
              onComplete={async (taskId) => {
                if (!accessToken) return
                await completeQuest(accessToken, taskId)
              }}
              onCreate={async (input) => {
                if (!accessToken) return
                await addQuest(accessToken, input)
              }}
            />
          </>
        ) : (
          <p className="lg:col-span-2 text-muted" role="status">
            No character data yet. Complete sign-in and keep the API server running on port 5000.
          </p>
        )}
      </main>
    </div>
  )
}
