import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { soundFx } from '../../lib/audio'
import type { Task } from '../../types/rpg'
import { QuestItem } from './QuestItem'
import { QuestBoardSkeleton } from '../ui/Skeleton'

export const AVAILABLE_TAGS = [
  { name: 'Work', icon: '💼', color: 'border-blue-500/30 bg-blue-500/10 text-blue-300' },
  { name: 'Exercise', icon: '🏃', color: 'border-orange-500/30 bg-orange-500/10 text-orange-300' },
  { name: 'Health + Wellness', icon: '🌿', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
  { name: 'School', icon: '📚', color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300' },
  { name: 'Teams', icon: '👥', color: 'border-purple-500/30 bg-purple-500/10 text-purple-300' },
  { name: 'Chores', icon: '🧹', color: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
  { name: 'Creativity', icon: '🎨', color: 'border-pink-500/30 bg-pink-500/10 text-pink-300' },
  { name: 'Others', icon: '✨', color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' },
] as const

export type TagName = (typeof AVAILABLE_TAGS)[number]['name']

interface QuestBoardProps {
  quests: Task[]
  busy: boolean
  onComplete: (taskId: number) => Promise<void>
  onEdit?: (quest: Task) => void
  onDelete?: (taskId: number) => Promise<void>
  onOpenCreateModal?: () => void
}

type FilterType = 'ALL' | 'ACTIVE' | 'DONE'

export function QuestBoard({ quests, busy, onComplete, onEdit, onDelete, onOpenCreateModal }: QuestBoardProps) {
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null)

  const completedCount = quests.filter((q) => q.status === 'completed').length
  const totalCount = quests.length

  const filteredQuests = quests.filter((quest) => {
    if (filter === 'ACTIVE' && (quest.status === 'completed' || quest.status === 'archived')) return false
    if (filter === 'DONE' && quest.status !== 'completed') return false
    if (quest.status === 'archived') return false
    if (selectedTagFilter) {
      if (!quest.tags || !quest.tags.includes(selectedTagFilter)) return false
    }
    return true
  })

  return (
    <section aria-labelledby="quest-board-heading" className="space-y-4">
      {/* Board Header & Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h3 id="quest-board-heading" className="font-display text-lg sm:text-xl font-bold tracking-wide text-parchment">
            TODAY'S QUESTS
          </h3>
          <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 font-mono text-xs font-bold text-gold">
            {completedCount} / {totalCount}
          </span>
        </div>

        {/* Action button & Filter Tabs */}
        <div className="flex items-center gap-2">
          {onOpenCreateModal && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick()
                onOpenCreateModal()
              }}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-3 py-1 font-display text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold/20 transition-all active:scale-95"
            >
              <span>+ NEW QUEST</span>
            </button>
          )}

          <div className="flex items-center gap-1 rounded-xl border border-[#2e261d] bg-[#100e0b] p-1 text-xs">
            {(['ALL', 'ACTIVE', 'DONE'] as FilterType[]).map((f) => {
              const isSelected = filter === f
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    soundFx.playClick()
                    setFilter(f)
                  }}
                  className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold transition-all ${
                    isSelected
                      ? 'border border-gold/40 bg-gold text-[#0a0908] shadow-[0_0_10px_rgba(226,179,104,0.3)]'
                      : 'text-muted hover:text-parchment hover:bg-[#181410]'
                  }`}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tag Filter Chips Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          type="button"
          onClick={() => {
            soundFx.playClick()
            setSelectedTagFilter(null)
          }}
          className={`shrink-0 rounded-lg px-2.5 py-1 font-mono text-[10px] font-semibold uppercase transition-all ${
            selectedTagFilter === null
              ? 'border border-gold/40 bg-gold/20 text-gold'
              : 'border border-[#262018] bg-[#120f0c] text-muted hover:text-parchment'
          }`}
        >
          All Tags
        </button>
        {AVAILABLE_TAGS.map((t) => {
          const isSelected = selectedTagFilter === t.name
          return (
            <button
              key={t.name}
              type="button"
              onClick={() => {
                soundFx.playClick()
                setSelectedTagFilter(isSelected ? null : t.name)
              }}
              className={`shrink-0 flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-[10px] font-medium transition-all ${
                isSelected
                  ? 'border border-gold bg-gold/20 text-gold shadow-[0_0_8px_rgba(226,179,104,0.3)]'
                  : 'border border-[#262018] bg-[#120f0c] text-muted hover:text-parchment'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.name}</span>
            </button>
          )
        })}
      </div>

      {/* Quests List */}
      {busy && quests.length === 0 ? (
        <QuestBoardSkeleton count={4} />
      ) : filteredQuests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#382d20] bg-[#120f0c]/50 px-4 py-8 text-center text-sm text-muted">
          <p className="font-display">No quests in this chamber.</p>
          <p className="mt-1 text-xs text-muted-dark">Inscribe a new trial on the left to begin earning XP and striking the Behemoth.</p>
        </div>
      ) : (
        <ul className="space-y-2.5" aria-label="Quest list">
          <AnimatePresence initial={false}>
            {filteredQuests.map((quest) => (
              <QuestItem
                key={quest.task_id}
                quest={quest}
                onComplete={onComplete}
                onEdit={onEdit}
                onDelete={onDelete}
                disabled={busy}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}

