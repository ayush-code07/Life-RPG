import { useState, type FormEvent, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soundFx } from '../../lib/audio'
import { categorizeTaskAttributes } from '../../lib/attributeMapping'
import type { TaskDifficulty } from '../../types/rpg'
import { AVAILABLE_TAGS } from './QuestBoard'

interface CreateQuestModalProps {
  isOpen: boolean
  onClose: () => void
  busy: boolean
  onCreate: (input: { title: string; description?: string; difficulty: TaskDifficulty; tags?: string[]; remind_daily?: boolean }) => Promise<void>
}

export function CreateQuestModal({ isOpen, onClose, busy, onCreate }: CreateQuestModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(2)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [remindDaily, setRemindDaily] = useState(false)
  const [tagError, setTagError] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const toggleTag = (tagName: string) => {
    soundFx.playClick()
    setTagError(false)
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim()) return
    if (selectedTags.length === 0) {
      setTagError(true)
      return
    }

    soundFx.playPurchaseSound()
    await onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      tags: selectedTags,
      remind_daily: remindDaily,
    })

    // Reset and close
    setTitle('')
    setDescription('')
    setDifficulty(2)
    setSelectedTags([])
    setRemindDaily(false)
    setTagError(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-quest-title"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg rounded-2xl border-2 border-gold/40 bg-gradient-to-b from-[#18130e] via-[#120f0c] to-[#0d0a08] p-6 shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_20px_rgba(226,179,104,0.15)] z-10 my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2e261d] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📜</span>
                <div>
                  <h3
                    id="modal-quest-title"
                    className="font-display text-lg font-bold uppercase tracking-wider text-parchment"
                  >
                    POST NEW TRIAL
                  </h3>
                  <p className="text-[11px] text-muted">Inscribe a quest onto the Ashen Notice Board</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick()
                  onClose()
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#382d20] bg-[#14110e] text-muted hover:border-gold hover:text-parchment transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Quest Title */}
              <div>
                <label
                  htmlFor="dialog-quest-title"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5"
                >
                  Quest Title <span className="text-ember">*</span>
                </label>
                <input
                  id="dialog-quest-title"
                  type="text"
                  required
                  autoFocus
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Read for 30 minutes, Morning workout, Code feature"
                  className="w-full rounded-xl border border-[#2e261d] bg-[#0c0a08] px-3.5 py-2.5 text-sm text-parchment placeholder:text-muted-dark focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="dialog-quest-desc"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5"
                >
                  Description (optional)
                </label>
                <textarea
                  id="dialog-quest-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief details or victory requirements..."
                  className="w-full rounded-xl border border-[#2e261d] bg-[#0c0a08] px-3.5 py-2.5 text-sm text-parchment placeholder:text-muted-dark focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              {/* Tags Checklist */}
              <div className={`rounded-xl border p-3.5 space-y-2 transition-all ${
                tagError && selectedTags.length === 0 ? 'border-red-500/60 bg-red-950/20' : 'border-[#2a221a] bg-[#0e0c0a]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-display text-xs font-bold uppercase tracking-wider text-parchment">
                      Choose Tags <span className="text-ember">*</span>
                    </h4>
                    <span className="text-[10px] text-muted font-normal">(Select at least 1)</span>
                  </div>
                  <span className={`text-[10px] font-mono ${selectedTags.length > 0 ? 'text-gold font-bold' : 'text-muted'}`}>
                    {selectedTags.length} selected
                  </span>
                </div>

                {tagError && selectedTags.length === 0 && (
                  <p className="text-[11px] font-mono text-red-400">⚠️ Please select at least one tag to categorize your quest.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {AVAILABLE_TAGS.map((tag) => {
                    const isChecked = selectedTags.includes(tag.name)
                    return (
                      <label
                        key={tag.name}
                        onClick={() => toggleTag(tag.name)}
                        className={`group flex items-center gap-2.5 cursor-pointer select-none rounded-lg p-2 border transition-all ${
                          isChecked
                            ? 'border-gold/50 bg-gold/10'
                            : 'border-[#221c16] bg-[#120f0c] hover:border-[#382d20] hover:bg-[#16130f]'
                        }`}
                      >
                        {/* Custom Checkbox */}
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                            isChecked
                              ? 'border-gold bg-gold text-[#0a0908] shadow-[0_0_6px_rgba(226,179,104,0.4)]'
                              : 'border-[#4a3f33] bg-[#0c0a08] group-hover:border-gold/60'
                          }`}
                        >
                          {isChecked && (
                            <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>

                        {/* Tag Icon & Label */}
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs">{tag.icon}</span>
                          <span
                            className={`font-mono text-xs truncate transition-colors ${
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

              {/* Remind Me Everyday Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-[#2a221a] bg-[#0e0c0a] p-3.5 transition-all">
                <div className="space-y-0.5 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">⏰</span>
                    <label htmlFor="modal-remind-daily-toggle" className="font-display text-xs font-bold text-parchment cursor-pointer">
                      Remind me everyday
                    </label>
                  </div>
                  <p className="text-[11px] text-muted leading-tight">
                    Automatically reset and remind you of this daily trial every dawn to fuel your streak.
                  </p>
                </div>
                <button
                  id="modal-remind-daily-toggle"
                  type="button"
                  role="switch"
                  aria-checked={remindDaily}
                  onClick={() => {
                    soundFx.playClick()
                    setRemindDaily(!remindDaily)
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    remindDaily ? 'bg-gold shadow-[0_0_10px_rgba(226,179,104,0.4)]' : 'bg-[#262018]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0a0908] shadow ring-0 transition duration-200 ease-in-out ${
                      remindDaily ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Difficulty Tier */}
              <div>
                <label
                  htmlFor="dialog-quest-diff"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5"
                >
                  Difficulty Tier & Reward
                </label>
                <select
                  id="dialog-quest-diff"
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value) as TaskDifficulty)}
                  className="w-full rounded-xl border border-[#2e261d] bg-[#0c0a08] px-3.5 py-2 text-xs text-parchment focus:border-gold focus:outline-none"
                >
                  <option value={1}>Tier 1 — Novice (+25 XP, +1 Coin)</option>
                  <option value={2}>Tier 2 — Adept (+50 XP, +1 Coin)</option>
                  <option value={3}>Tier 3 — Veteran (+90 XP, +1 Coin)</option>
                  <option value={4}>Tier 4 — Master (+150 XP, +1 Coin)</option>
                  <option value={5}>Tier 5 — Legendary (+250 XP, +1 Coin)</option>
                </select>
              </div>

              {/* Dynamic Attribute Growth Live Preview */}
              <div className="rounded-xl border border-gold/25 bg-gold/5 p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📈</span>
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
                      CHARACTER STAT MASTERY GAIN
                    </p>
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      {categorizeTaskAttributes(title || 'Trial', selectedTags, difficulty).map((attr) => (
                        <span key={attr.attributeName} className={`font-mono text-[11px] font-bold flex items-center gap-1 ${attr.textColor}`}>
                          <span>{attr.icon}</span>
                          <span>+{attr.xpValue} {attr.attributeName} XP</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262018]">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick()
                    onClose()
                  }}
                  className="rounded-xl border border-[#2e261d] bg-[#14110e] px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-muted hover:text-parchment transition-colors"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={busy || !title.trim() || selectedTags.length === 0}
                  className="rounded-xl border border-gold/40 bg-gold px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-[#0a0908] shadow-[0_0_15px_rgba(226,179,104,0.3)] hover:bg-gold-bright transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {busy ? 'ADDING QUEST...' : 'ADD QUEST'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
