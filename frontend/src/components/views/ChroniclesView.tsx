import { useGameStore } from '../../store/gameStore'

export function ChroniclesView() {
  const { profile, streakInfo } = useGameStore()

  const streak = profile?.current_streak ?? 7
  const longest = profile?.longest_streak ?? 14
  const totalXP = profile?.total_xp ?? 320

  const recentHistory = streakInfo?.recent_activity ?? [
    { activity_date: '2026-09-12', completions_count: 3 },
    { activity_date: '2026-09-11', completions_count: 5 },
    { activity_date: '2026-09-10', completions_count: 2 },
    { activity_date: '2026-09-09', completions_count: 4 },
    { activity_date: '2026-09-08', completions_count: 6 },
  ]

  const feats = [
    { title: 'First Ember', desc: 'Complete your initial trial on the Ashen Path', unlocked: true, icon: '🔥' },
    { title: 'Relentless Flame', desc: 'Maintain a 7-day uninterrupted streak', unlocked: streak >= 7, icon: '⚡' },
    { title: 'Behemoth Slayer', desc: 'Deal over 500 combined damage to world bosses', unlocked: true, icon: '💀' },
    { title: 'Kiln Sovereign', desc: 'Reach level 25 across all core disciplines', unlocked: false, icon: '👑' },
  ]

  return (
    <div className="space-y-6">
      <header className="border-b border-[#262018] pb-3">
        <h2 className="font-display text-2xl font-bold tracking-wide text-parchment">
          CHRONICLES & FEATS
        </h2>
        <p className="text-xs text-muted">
          Your immutable historical ledger of quest milestones, feats, and streak records.
        </p>
      </header>

      {/* Stats Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-ember/30 bg-ember/10 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-ember">Current Streak</p>
          <p className="mt-1 font-mono text-3xl font-black text-ember-glow">{streak} Days</p>
          <p className="mt-1 text-[11px] text-muted">Active daily streak modifier active</p>
        </div>

        <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">Longest Streak</p>
          <p className="mt-1 font-mono text-3xl font-black text-gold-bright">{longest} Days</p>
          <p className="mt-1 text-[11px] text-muted">All-time unbroken record</p>
        </div>

        <div className="rounded-xl border border-[#2e261d] bg-[#14110e] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-parchment">Lifetime XP</p>
          <p className="mt-1 font-mono text-3xl font-black text-parchment">{totalXP} XP</p>
          <p className="mt-1 text-[11px] text-muted">Total accumulated experience</p>
        </div>
      </div>

      {/* Feats & Achievements */}
      <div>
        <h3 className="mb-3 font-display text-base font-bold text-parchment">
          UNLOCKED FEATS
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {feats.map((feat) => (
            <div
              key={feat.title}
              className={`flex items-center gap-3.5 rounded-xl border p-3.5 ${
                feat.unlocked
                  ? 'border-gold/30 bg-[#14110e]'
                  : 'border-[#231d17] bg-[#0d0a08] opacity-50'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#382d20] bg-[#100d0a] text-xl">
                {feat.icon}
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-parchment">
                  {feat.title}
                </h4>
                <p className="text-xs text-muted">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div>
        <h3 className="mb-3 font-display text-base font-bold text-parchment">
          RECENT ACTIVITY LEDGER
        </h3>
        <div className="overflow-hidden rounded-xl border border-[#2e261d] bg-[#14110e]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#262018] bg-[#100e0b] font-mono text-muted uppercase">
              <tr>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Quests Completed</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262018] font-mono">
              {recentHistory.map((act) => (
                <tr key={act.activity_date} className="hover:bg-[#181410]">
                  <td className="px-4 py-2.5 text-parchment">{act.activity_date}</td>
                  <td className="px-4 py-2.5 text-gold">{act.completions_count} trials</td>
                  <td className="px-4 py-2.5 text-moss">RECORDED ✓</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
