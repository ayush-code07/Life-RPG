import { useState, useEffect } from 'react'
import { Sidebar } from '../layout/Sidebar'
import { TopHeader } from '../layout/TopHeader'
import { AxiomBanner } from './AxiomBanner'
import { BonfireScene } from '../character/BonfireScene'
import { HeroStatsPanel } from '../character/HeroStatsPanel'
import { BossRaidWidget } from './BossRaidWidget'
import { QuestBoard } from '../quests/QuestBoard'
import { CreateQuestModal } from '../quests/CreateQuestModal'
import { EditQuestModal } from '../quests/EditQuestModal'
import { AttributesView } from '../views/AttributesView'
import { RewardsView } from '../views/RewardsView'
import { ArmoryView } from '../views/ArmoryView'
import { ChroniclesView } from '../views/ChroniclesView'
import { CelebrationModal } from '../ui/CelebrationModal'
import { useAuthStore } from '../../store/authStore'
import { useGameStore } from '../../store/gameStore'
import type { Task } from '../../types/rpg'

export function Dashboard() {
  const [createQuestOpen, setCreateQuestOpen] = useState(false)
  const [editingQuest, setEditingQuest] = useState<Task | null>(null)
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
    updateQuest,
    deleteQuest,
    clearError,
  } = useGameStore()

  const activeTheme = useGameStore((state) => state.profile?.active_theme) || 'theme-midnight-ember'

  useEffect(() => {
    if (accessToken) void hydrate(accessToken)
  }, [accessToken, hydrate])

  return (
    <div className={`h-screen w-screen overflow-hidden text-parchment ${activeTheme} ${crtEnabled ? 'crt-overlay' : ''}`}>
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

          {/* Tab Views */}
          {activeTab === 'sanctuary' && (
            <div className="space-y-6">
              {/* Top Hero Section: Character Box + Level & Core Abilities Side-by-Side */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* Left: Character Bonfire Scene Canvas Box */}
                <div className="lg:col-span-6 xl:col-span-5 flex flex-col">
                  <BonfireScene />
                </div>

                {/* Right: Level & Core Abilities to the side of Character */}
                <div className="lg:col-span-6 xl:col-span-7 flex flex-col">
                  <HeroStatsPanel />
                </div>
              </div>

              {/* Boss Raid Widget */}
              <BossRaidWidget />

              {/* Full Width Quests Section Below */}
              <div className="w-full">
                <QuestBoard
                  quests={tasks}
                  busy={loading || syncing}
                  onComplete={async (taskId) => {
                    if (accessToken) await completeQuest(accessToken, taskId)
                  }}
                  onEdit={(quest) => setEditingQuest(quest)}
                  onDelete={async (taskId) => {
                    if (accessToken) await deleteQuest(accessToken, taskId)
                  }}
                  onOpenCreateModal={() => setCreateQuestOpen(true)}
                />
              </div>
            </div>
          )}

          {activeTab === 'attributes' && <AttributesView />}
          {activeTab === 'rewards' && <RewardsView />}
          {activeTab === 'armory' && <ArmoryView />}
          {activeTab === 'chronicles' && <ChroniclesView />}

          {/* Ambient Axiom Inscription at bottom */}
          <AxiomBanner />
          </div>
        </main>
      </div>

      {/* Global Celebratory Rewards & Level Up Overlay */}
      <CelebrationModal />

      {/* Dialog Modal for Inscribing New Quests */}
      <CreateQuestModal
        isOpen={createQuestOpen}
        onClose={() => setCreateQuestOpen(false)}
        busy={loading || syncing}
        onCreate={async (input) => {
          if (accessToken) await addQuest(accessToken, input)
        }}
      />

      {/* Dialog Modal for Updating Existing Quests */}
      <EditQuestModal
        quest={editingQuest}
        isOpen={Boolean(editingQuest)}
        onClose={() => setEditingQuest(null)}
        busy={loading || syncing}
        onSave={async (taskId, updates) => {
          if (accessToken) await updateQuest(accessToken, taskId, updates)
        }}
      />
    </div>
  )
}
