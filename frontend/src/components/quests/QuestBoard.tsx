import { useState, type FormEvent } from 'react'
import { AnimatePresence } from 'framer-motion'
import { soundFx } from '../../lib/audio'
import type { Task, TaskDifficulty } from '../../types/rpg'
import { QuestItem } from './QuestItem'

interface QuestBoardProps {
  quests: Task[]
  busy: boolean
  onComplete: (taskId: number) => Promise<void>
  onCreate: (input: { title: string; description?: string; difficulty: TaskDifficulty }) => Promise<void>
}

type FilterType = 'ALL' | 'ACTIVE' | 'DONE'

export function QuestBoard({ quests, busy, onComplete, onCreate }: QuestBoardProps) {
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [formOpen, setFormOpen] = useState(false)

  const completedCount = quests.filter((q) => q.status === 'completed').length
  const totalCount = quests.length || 5

  const filteredQuests = quests.filter((quest) => {
    if (filter === 'ACTIVE') return quest.status !== 'completed' && quest.status !== 'archived'
    if (filter === 'DONE') return quest.status === 'completed'
    return quest.status !== 'archived'
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
      {filteredQuests.length === 0 ? (
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
  onCreate: (input: { title: string; description?: string; difficulty: TaskDifficulty }) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(2)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return
    await onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
    })
    setTitle('')
    setDescription('')
    setDifficulty(2)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 border-t border-[#262018] pt-3.5">
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
          className="mt-4 rounded-xl border border-gold/40 bg-gold px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-[#0a0908] shadow-[0_0_15px_rgba(226,179,104,0.3)] hover:bg-gold-bright transition-all active:scale-95 disabled:opacity-50"
        >
          {busy ? 'INSCRIBING...' : 'PIN TO BOARD'}
        </button>
      </div>
    </form>
  )
}
