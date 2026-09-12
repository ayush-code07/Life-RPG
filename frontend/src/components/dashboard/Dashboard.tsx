import { useEffect } from 'react'
import { Sidebar } from '../layout/Sidebar'
import { TopHeader } from '../layout/TopHeader'
import { AxiomBanner } from './AxiomBanner'
import { BonfireScene } from '../character/BonfireScene'
import { BossRaidWidget } from './BossRaidWidget'
import { QuestBoard } from '../quests/QuestBoard'
import { AttributesView } from '../views/AttributesView'
import { ArmoryView } from '../views/ArmoryView'
import { ChroniclesView } from '../views/ChroniclesView'
import { useAuthStore } from '../../store/authStore'
import { useGameStore } from '../../store/gameStore'

export function Dashboard() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const preview = useAuthStore((state) => state.preview)
  const {
    tasks,
    activeTab,
    crtEnabled,
    loading,
    syncing,
    error,
    hydrate,
    completeQuest,
    addQuest,
    clearError,
  } = useGameStore()

  useEffect(() => {
    if (accessToken) void hydrate(accessToken)
  }, [accessToken, hydrate])

  return (
    <div className={`h-screen w-screen overflow-hidden bg-[#0a0908] text-parchment ${crtEnabled ? 'crt-overlay' : ''}`}>
      <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area with independent scroll */}
        <main id="main-content" tabIndex={-1} className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {/* Top Header */}
            <TopHeader />

          {/* Offline / Preview status notice */}
          {preview && (
            <div className="flex items-center justify-between rounded-xl border border-gold/30 bg-gold/10 px-4 py-2.5 text-xs text-gold">
              <span>⚔️ Offline Preview mode active. Changes will save in local trial state.</span>
            </div>
          )}

          {/* Dismissible Error Banner */}
          {error && (
            <div className="flex items-center justify-between rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-xs text-ember">
              <span>{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="font-mono text-xs font-bold text-parchment hover:text-gold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Axiom Codex Banner */}
          <AxiomBanner />

          {/* Tab Views */}
          {activeTab === 'sanctuary' && (
            <div className="grid gap-6 lg:grid-cols-[minmax(320px,440px)_1fr]">
              {/* Left Column: Bonfire & Level Bar */}
              <div>
                <BonfireScene />
              </div>

              {/* Right Column: World Boss & Quest Board */}
              <div className="space-y-6">
                <BossRaidWidget />
                <QuestBoard
                  quests={tasks}
                  busy={loading || syncing}
                  onComplete={async (taskId) => {
                    if (accessToken) await completeQuest(accessToken, taskId)
                  }}
                  onCreate={async (input) => {
                    if (accessToken) await addQuest(accessToken, input)
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'attributes' && <AttributesView />}
          {activeTab === 'armory' && <ArmoryView />}
          {activeTab === 'chronicles' && <ChroniclesView />}
          </div>
        </main>
      </div>
    </div>
  )
}
