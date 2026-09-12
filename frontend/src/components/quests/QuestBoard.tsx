import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Task, TaskDifficulty } from '../../types/rpg'
import { QuestItem } from './QuestItem'

interface QuestBoardProps {
  quests: Task[]
  busy: boolean
  onComplete: (taskId: number) => Promise<void>
  onCreate: (input: { title: string; description?: string; difficulty: TaskDifficulty }) => Promise<void>
}

export function QuestBoard({ quests, busy, onComplete, onCreate }: QuestBoardProps) {
  const openQuests = quests.filter((quest) => quest.status !== 'completed' && quest.status !== 'archived')

  return (
    <section
      aria-labelledby="quest-board-heading"
      className="rounded-2xl border border-gold/20 bg-panel p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
    >
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Notice board</p>
          <h2 id="quest-board-heading" className="font-display text-2xl">
            Active quests
          </h2>
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          {openQuests.length} open
        </p>
      </header>

      <NewQuestForm busy={busy} onCreate={onCreate} />

      {quests.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-gold/20 px-4 py-6 text-center text-sm text-muted">
          No quests yet. Post a new one to start earning XP.
        </p>
      ) : (
        <ul className="mt-5 space-y-3" aria-label="Quest list">
          <AnimatePresence initial={false}>
            {quests.map((quest) => (
              <QuestItem key={quest.task_id} quest={quest} onComplete={onComplete} disabled={busy} />
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
  const [open, setOpen] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
    })
    setTitle('')
    setDescription('')
    setDifficulty(2)
    setOpen(false)
  }

  return (
    <div className="rounded-xl border border-gold/15 bg-ink/50 p-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="new-quest-panel"
        onClick={() => setOpen((value) => !value)}
        className="w-full text-left text-sm font-semibold text-gold"
      >
        {open ? 'Hide new quest form' : 'Post a new quest'}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.form
            id="new-quest-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            onSubmit={handleSubmit}
          >
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="quest-title" className="mb-1 block text-sm">
                  Quest title
                </label>
                <input
                  id="quest-title"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-lg border border-gold/20 bg-panel px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="quest-desc" className="mb-1 block text-sm">
                  Description (optional)
                </label>
                <textarea
                  id="quest-desc"
                  rows={2}
                  maxLength={1000}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full rounded-lg border border-gold/20 bg-panel px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="quest-difficulty" className="mb-1 block text-sm">
                  Difficulty
                </label>
                <select
                  id="quest-difficulty"
                  value={difficulty}
                  onChange={(event) => setDifficulty(Number(event.target.value) as TaskDifficulty)}
                  className="w-full rounded-lg border border-gold/20 bg-panel px-3 py-2"
                >
                  <option value={1}>1 — Novice</option>
                  <option value={2}>2 — Adept</option>
                  <option value={3}>3 — Veteran</option>
                  <option value={4}>4 — Elite</option>
                  <option value={5}>5 — Legendary</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={busy || !title.trim()}
                aria-label="Add quest to the board"
                className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-ink disabled:opacity-60"
              >
                Pin to board
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
