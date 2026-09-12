import { useState, type FormEvent } from 'react'
import { AnimatePresence } from 'framer-motion'
import { soundFx } from '../../lib/audio'
import type { Task, TaskDifficulty } from '../../types/rpg'
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
] as const

export type TagName = (typeof AVAILABLE_TAGS)[number]['name']

interface QuestBoardProps {
  quests: Task[]
  busy: boolean
  onComplete: (taskId: number) => Promise<void>
  onCreate: (input: { title: string; description?: string; difficulty: TaskDifficulty; tags?: string[] }) => Promise<void>
}

type FilterType = 'ALL' | 'ACTIVE' | 'DONE'

export function QuestBoard({ quests, busy, onComplete, onCreate }: QuestBoardProps) {
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const completedCount = quests.filter((q) => q.status === 'completed').length
  const totalCount = quests.length || 5

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

        {/* Filter Tabs (ALL / ACTIVE / DONE) */}
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

      {/* New Quest Collapsible Box */}
      <div className="rounded-xl border border-[#382d20] bg-[#14110e] p-4 shadow-sm">
        <button
          type="button"
          onClick={() => {
            soundFx.playClick()
            setFormOpen((prev) => !prev)
          }}
          className="flex w-full items-center justify-between font-display text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-bright transition-colors"
        >
          <span>{formOpen ? '− HIDE NEW QUEST FORM' : '+ POST NEW QUEST TO NOTICE BOARD'}</span>
          <span className="font-mono text-sm">{formOpen ? '▲' : '▼'}</span>
        </button>

        {formOpen && (
          <NewQuestForm
            busy={busy}
            onCreate={async (data) => {
              await onCreate(data)
              setFormOpen(false)
            }}
          />
        )}
      </div>

      {/* Quests List */}
      {busy && quests.length === 0 ? (
        <QuestBoardSkeleton count={4} />
      ) : filteredQuests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#382d20] bg-[#120f0c]/50 px-4 py-8 text-center text-sm text-muted">
          <p className="font-display">No quests in this chamber.</p>
          <p className="mt-1 text-xs text-muted-dark">Post a new trial above to begin earning XP and striking the Behemoth.</p>
        </div>
      ) : (
        <ul className="space-y-2.5" aria-label="Quest list">
          <AnimatePresence initial={false}>
            {filteredQuests.map((quest) => (
              <QuestItem
                key={quest.task_id}
                quest={quest}
                onComplete={onComplete}
                disabled={busy}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}

function NewQuestForm({
  busy,
  onCreate,
}: {
  busy: boolean
  onCreate: (input: { title: string; description?: string; difficulty: TaskDifficulty; tags?: string[] }) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(2)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const toggleTag = (tagName: string) => {
    soundFx.playClick()
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return
    await onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      tags: selectedTags,
    })
    setTitle('')
    setDescription('')
    setDifficulty(2)
    setSelectedTags([])
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 border-t border-[#262018] pt-3.5">
      <div>
        <label htmlFor="quest-title" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
          Quest Title
        </label>
        <input
          id="quest-title"
          type="text"
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Read for 30 minutes, Go to the gym, Code project"
          className="w-full rounded-lg border border-[#2e261d] bg-[#0c0a08] px-3 py-2 text-sm text-parchment placeholder:text-muted-dark focus:border-gold focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="quest-desc" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
          Description (optional)
        </label>
        <textarea
          id="quest-desc"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief details or requirements..."
          className="w-full rounded-lg border border-[#2e261d] bg-[#0c0a08] px-3 py-2 text-sm text-parchment placeholder:text-muted-dark focus:border-gold focus:outline-none"
        />
      </div>

      {/* Tags Checklist Section */}
      <div className="rounded-xl border border-[#2a221a] bg-[#0e0c0a] p-3.5 space-y-2.5">
        <div>
          <h4 className="font-display text-xs font-bold uppercase tracking-wider text-parchment">
            Tags
          </h4>
          <p className="text-[11px] text-muted">Your Tags</p>
        </div>

        <div className="space-y-2 pt-1">
          {AVAILABLE_TAGS.map((tag) => {
            const isChecked = selectedTags.includes(tag.name)
            return (
              <label
                key={tag.name}
                onClick={() => toggleTag(tag.name)}
                className="group flex items-center gap-3 cursor-pointer select-none rounded-lg p-1.5 hover:bg-[#181410] transition-colors"
              >
                {/* Custom Styled Checkbox */}
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                    isChecked
                      ? 'border-gold bg-gold text-[#0a0908] shadow-[0_0_8px_rgba(226,179,104,0.4)]'
                      : 'border-[#4a3f33] bg-[#14110e] group-hover:border-gold/60'
                  }`}
                >
                  {isChecked && (
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                {/* Tag Icon & Label */}
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-80">{tag.icon}</span>
                  <span
                    className={`font-mono text-xs transition-colors ${
                      isChecked ? 'font-bold text-gold' : 'text-parchment group-hover:text-gold'
                    }`}
                  >
                    {tag.name}
                  </span>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div>
          <label htmlFor="quest-diff" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
            Difficulty Tier
          </label>
          <select
            id="quest-diff"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value) as TaskDifficulty)}
            className="rounded-lg border border-[#2e261d] bg-[#0c0a08] px-3 py-1.5 text-xs text-parchment focus:border-gold focus:outline-none"
          >
            <option value={1}>1 — Novice (+25 XP)</option>
            <option value={2}>2 — Adept (+50 XP)</option>
            <option value={3}>3 — Veteran (+90 XP)</option>
            <option value={4}>4 — Master (+150 XP)</option>
            <option value={5}>5 — Legendary (+250 XP)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="rounded-xl border border-gold/40 bg-gold px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-[#0a0908] shadow-[0_0_15px_rgba(226,179,104,0.3)] hover:bg-gold-bright transition-all active:scale-95 disabled:opacity-50"
        >
          {busy ? 'INSCRIBING...' : 'PIN TO BOARD'}
        </button>
      </div>
    </form>
  )
}
