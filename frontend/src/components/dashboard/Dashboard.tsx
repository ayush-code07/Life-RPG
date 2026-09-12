import { useState, useEffect } from 'react'
import { Sidebar } from '../layout/Sidebar'
import { TopHeader } from '../layout/TopHeader'
import { BonfireScene } from '../character/BonfireScene'
import { HeroStatsPanel } from '../character/HeroStatsPanel'
import { QuestBoard } from '../quests/QuestBoard'
import { CreateQuestModal } from '../quests/CreateQuestModal'
import { EditQuestModal } from '../quests/EditQuestModal'
import { AttributesView } from '../views/AttributesView'
import { RewardsView } from '../views/RewardsView'
import { ArmoryView } from '../views/ArmoryView'
import { ChroniclesView } from '../views/ChroniclesView'
import { BossArenaView } from '../boss/BossArenaView'
import { CelebrationModal } from '../ui/CelebrationModal'
import { LootChestModal } from '../ui/LootChestModal'
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
    lootDrop,
    boss,
    setActiveTab,
    hydrate,
    completeQuest,
    addQuest,
    updateQuest,
    deleteQuest,
    clearError,
    dismissLootDrop,
    claimLootDrop,
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
              {/* Abyss Raid Alert Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/30 via-[#18110d] to-[#140e0b] p-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                <div className="flex items-center gap-3">
                  <span className="text-2xl animate-pulse">{boss.avatar || '👹'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-xs font-bold text-parchment uppercase tracking-wider">
                        ABYSS RAID ACTIVE: {boss.name}
                      </p>
                      <span className="rounded bg-red-950/80 border border-red-500/40 px-1.5 py-0.5 font-mono text-[9px] font-bold text-red-300">
                        {boss.currentHp}/{boss.maxHp} HP
                      </span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">Complete quests to channel critical strike damage to the World Boss!</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('boss_raid')}
                  className="rounded-xl border border-red-500/50 bg-red-950/60 px-4 py-2 font-display text-xs font-bold text-red-300 hover:bg-red-900/80 transition-all shadow-sm"
                >
                  ⚔️ ENTER ARENA
                </button>
              </div>

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

          {activeTab === 'boss_raid' && <BossArenaView />}
          {activeTab === 'attributes' && <AttributesView />}
          {activeTab === 'rewards' && <RewardsView />}
          {activeTab === 'armory' && <ArmoryView />}
          {activeTab === 'chronicles' && <ChroniclesView />}
          </div>
        </main>
      </div>

      {/* Global Celebratory Rewards & Level Up Overlay */}
      <CelebrationModal />

      {/* Mystery RPG Loot Chest Overlay */}
      <LootChestModal
        loot={lootDrop}
        isOpen={Boolean(lootDrop)}
        onClose={dismissLootDrop}
        onClaim={claimLootDrop}
      />

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

