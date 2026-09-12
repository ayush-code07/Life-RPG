import { useState } from 'react'
import { soundFx } from '../../lib/audio'
import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'
import { PixelHeroSprite } from '../character/PixelHeroSprite'

type SubTab = 'profile' | 'feats' | 'codex' | 'settings'
type SpritePose = 'idle' | 'attack' | 'cast' | 'cheer'

export function ChroniclesView() {
  const [subTab, setSubTab] = useState<SubTab>('profile')
  const [spritePose, setSpritePose] = useState<SpritePose>('idle')
  const { profile, sfxEnabled, crtEnabled, toggleSfx, toggleCrt, tasks } = useGameStore()
  const user = useAuthStore((state) => state.user)

  const level = profile?.current_level ?? 12
  const currentXP = profile?.progress_xp ?? 320
  const neededXP = profile?.xp_needed_for_next ?? 500
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentXP / neededXP) * 100)))
  const streak = profile?.current_streak ?? 7
  const gold = Math.max(120, (profile?.total_xp ?? 0) + 240)

  const handlePoseChange = (pose: SpritePose) => {
    setSpritePose(pose)
    if (pose === 'attack') soundFx.playSwordSlash()
    else if (pose === 'cast') soundFx.playBonfireRest()
    else if (pose === 'cheer') soundFx.playLevelUp()
    else soundFx.playClick()
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Title */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262018] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-parchment">
              SANCTUARY & ARCHIVES
            </h2>
            <span className="rounded border border-gold/30 bg-gold/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-gold">
              v2.0
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Soul identity, feats of valor, sanctuary chronicles, acoustic synthesizer & realm controls.
          </p>
        </div>

        <button
          type="button"
          onClick={() => soundFx.playClick()}
          className="flex items-center gap-2 rounded-xl border border-gold/30 bg-[#14100c] px-3.5 py-2 font-display text-xs font-bold tracking-wider text-gold hover:border-gold hover:bg-gold/10 transition-all shadow-[0_0_15px_rgba(226,179,104,0.1)]"
        >
          <span>📜</span>
          <span>TITLE GATEWAY</span>
        </button>
      </header>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 rounded-xl border border-[#2e261d] bg-[#100e0b] p-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            soundFx.playClick()
            setSubTab('profile')
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-bold tracking-wider transition-all ${
            subTab === 'profile'
              ? 'border border-gold/40 bg-gold/15 text-gold shadow-[0_0_12px_rgba(226,179,104,0.2)]'
              : 'text-muted hover:text-parchment hover:bg-[#181410]'
          }`}
        >
          <span>👤</span>
          <span>PROFILE</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playClick()
            setSubTab('feats')
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-bold tracking-wider transition-all ${
            subTab === 'feats'
              ? 'border border-gold/40 bg-gold/15 text-gold shadow-[0_0_12px_rgba(226,179,104,0.2)]'
              : 'text-muted hover:text-parchment hover:bg-[#181410]'
          }`}
        >
          <span>🏆</span>
          <span>FEATS (5)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playClick()
            setSubTab('codex')
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-bold tracking-wider transition-all ${
            subTab === 'codex'
              ? 'border border-gold/40 bg-gold/15 text-gold shadow-[0_0_12px_rgba(226,179,104,0.2)]'
              : 'text-muted hover:text-parchment hover:bg-[#181410]'
          }`}
        >
          <span>❓</span>
          <span>CODEX</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playClick()
            setSubTab('settings')
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-bold tracking-wider transition-all ${
            subTab === 'settings'
              ? 'border border-gold/40 bg-gold/15 text-gold shadow-[0_0_12px_rgba(226,179,104,0.2)]'
              : 'text-muted hover:text-parchment hover:bg-[#181410]'
          }`}
        >
          <span>🎛️</span>
          <span>SETTINGS</span>
        </button>
      </div>

      {/* Main Profile View */}
      {subTab === 'profile' && (
        <div className="space-y-6">
          {/* Hero Profile Card */}
          <div className="rounded-2xl border border-[#382d20] bg-gradient-to-r from-[#14110e] via-[#181410] to-[#120f0c] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* 16-BIT Pixel Avatar Box */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative flex h-36 w-36 items-center justify-center rounded-xl border-2 border-gold/40 bg-[#0d0b08] p-2 shadow-[0_0_20px_rgba(226,179,104,0.15)]">
                  <div className={`transition-transform duration-300 ${spritePose === 'idle' ? 'animate-knight-idle' : spritePose === 'attack' ? 'translate-x-2' : spritePose === 'cheer' ? '-translate-y-2' : 'scale-105'}`}>
                    <PixelHeroSprite pose={spritePose} size={84} />
                  </div>
                  <span className="absolute bottom-1 right-1.5 rounded bg-[#100d0a] px-1 font-mono text-[9px] font-bold text-muted border border-[#2e261d]">
                    16-BIT
                  </span>
                </div>

                {/* Pose Action Buttons */}
                <div className="grid grid-cols-4 gap-1 w-36">
                  {(['idle', 'attack', 'cast', 'cheer'] as SpritePose[]).map((pose) => (
                    <button
                      key={pose}
                      type="button"
                      onClick={() => handlePoseChange(pose)}
                      className={`rounded px-1 py-0.5 font-mono text-[10px] font-semibold uppercase transition-colors ${
                        spritePose === pose
                          ? 'bg-gold text-[#0a0908] font-bold'
                          : 'bg-[#100d0a] text-muted hover:text-parchment border border-[#2e261d]'
                      }`}
                    >
                      {pose}
                    </button>
                  ))}
                </div>
              </div>

              {/* Character Details & Level Bar */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-2xl font-bold tracking-wider text-parchment">
                        {profile?.username ? profile.username.toUpperCase() : 'ASHEN HERO'}
                      </h3>
                      <span className="rounded border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-xs font-bold text-gold">
                        Lv. {level}
                      </span>
                    </div>
                    <p className="font-display text-xs tracking-widest text-muted uppercase mt-0.5">
                      KEEPER OF THE SACRED KILN
                    </p>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-parchment text-sm">LEVEL {level}</span>
                      <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-gold">{progressPercent}%</span>
                    </div>
                    <span className="text-muted">
                      <strong className="text-parchment">{currentXP}</strong> / {neededXP} XP
                    </span>
                  </div>
                  <div className="relative h-3.5 w-full overflow-hidden rounded-full border border-[#2e261d] bg-[#0c0a08] p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#a83210] via-[#e65c24] to-[#ffd175] shadow-[0_0_10px_rgba(255,155,83,0.5)] transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Stat Summary Boxes */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="rounded-xl border border-gold/30 bg-gold/5 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted font-mono">
                      🪙 TREASURY
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold text-gold">{gold} Gold</p>
                  </div>

                  <div className="rounded-xl border border-ember/30 bg-ember/5 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted font-mono">
                      🔥 BONFIRE
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold text-ember">{streak}d Streak</p>
                  </div>

                  <div className="rounded-xl border border-[#2e261d] bg-[#14110e] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted font-mono">
                      🎒 EQUIPMENT
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold text-parchment">1 Relics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Disciplines & Attributes (Segmented Meter Bars) */}
          <div className="rounded-2xl border border-[#382d20] bg-[#14110e] p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#262018] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-gold">⚡</span>
                <h3 className="font-display text-sm font-bold tracking-wider text-parchment uppercase">
                  CORE DISCIPLINES & ATTRIBUTES
                </h3>
              </div>
              <span className="font-mono text-xs text-muted">MAX 40</span>
            </div>

            <div className="space-y-3.5">
              <SegmentedMeter label="STRENGTH" icon="⚔️" value={10} max={40} color="red" />
              <SegmentedMeter label="INTELLECT" icon="🧠" value={18} max={40} color="cyan" />
              <SegmentedMeter label="VITALITY" icon="❤️" value={12} max={40} color="green" />
              <SegmentedMeter label="FOCUS" icon="✨" value={15} max={40} color="gold" />
            </div>
          </div>
        </div>
      )}

      {/* Feats View */}
      {subTab === 'feats' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { title: 'First Spark', desc: 'Inscribe your first quest on the notice board.', xp: '+50 XP', unlocked: true, icon: '🔥' },
            { title: 'Keeper of Habit', desc: 'Maintain an unbroken streak for 7 consecutive days.', xp: '+150 XP', unlocked: streak >= 7, icon: '⚡' },
            { title: 'Behemoth Striker', desc: 'Deal fatal damage to a World Boss during a trial.', xp: '+250 XP', unlocked: true, icon: '💀' },
            { title: 'Pyromancer Ascendant', desc: 'Achieve Level 15 in the Sacred Kiln.', xp: '+500 XP', unlocked: level >= 15, icon: '👑' },
            { title: 'Relic Collector', desc: 'Equip an Epic or Legendary item in your Armory.', xp: '+200 XP', unlocked: true, icon: '🎒' },
          ].map((feat) => (
            <div
              key={feat.title}
              className={`flex items-center gap-4 rounded-xl border p-4 ${
                feat.unlocked
                  ? 'border-gold/30 bg-[#14110e] shadow-[0_0_15px_rgba(226,179,104,0.06)]'
                  : 'border-[#262018] bg-[#0d0b09] opacity-40'
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-[#100d0a] text-2xl">
                {feat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-sm font-bold text-parchment">{feat.title}</h4>
                  <span className="font-mono text-xs font-bold text-gold">{feat.xp}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Codex View */}
      {subTab === 'codex' && (
        <div className="rounded-2xl border border-[#382d20] bg-[#14110e] p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-parchment">ANCIENT KILN CODEX</h3>
          <p className="text-xs text-muted leading-relaxed">
            The Ashen Path is a philosophy of disciplined rebirth. Every completed quest kindles the flame of your soul, chipping away at cognitive lethargy (represented by the Corrupted Behemoth).
          </p>
          <div className="rounded-xl border border-gold/20 bg-[#0d0b09] p-4 text-xs space-y-2">
            <p className="text-gold font-bold">⚔️ Progression Axioms:</p>
            <p className="text-muted">• Tasks award XP based on difficulty tier (Tier 1: 25 XP → Tier 5: 250 XP).</p>
            <p className="text-muted">• Daily streaks enhance XP multipliers and prevent boss regeneration.</p>
            <p className="text-muted">• Rest at the bonfire to commit progress and temper cognitive stamina.</p>
          </div>
        </div>
      )}

      {/* Settings View */}
      {subTab === 'settings' && (
        <div className="rounded-2xl border border-[#382d20] bg-[#14110e] p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-parchment">REALM & ACOUSTIC SETTINGS</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={toggleSfx}
              className={`flex items-center justify-between rounded-xl border p-4 font-mono text-xs font-bold ${
                sfxEnabled ? 'border-gold/40 bg-gold/10 text-gold' : 'border-[#262018] bg-[#0d0b09] text-muted'
              }`}
            >
              <span>🔊 Web Audio Synthesizer</span>
              <span>{sfxEnabled ? 'ENABLED' : 'DISABLED'}</span>
            </button>

            <button
              type="button"
              onClick={toggleCrt}
              className={`flex items-center justify-between rounded-xl border p-4 font-mono text-xs font-bold ${
                crtEnabled ? 'border-gold/40 bg-gold/10 text-gold' : 'border-[#262018] bg-[#0d0b09] text-muted'
              }`}
            >
              <span>📺 Scanline CRT Filter</span>
              <span>{crtEnabled ? 'ENABLED' : 'DISABLED'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Segmented colored block progress meter matching reference screenshot
function SegmentedMeter({
  label,
  icon,
  value,
  max,
  color,
}: {
  label: string
  icon: string
  value: number
  max: number
  color: 'red' | 'cyan' | 'green' | 'gold'
}) {
  const totalBlocks = 16
  const filledBlocks = Math.round((value / max) * totalBlocks)

  const colorStyles: Record<string, string> = {
    red: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
    cyan: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]',
    green: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    gold: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
  }

  return (
    <div className="flex items-center gap-4 text-xs font-mono">
      <div className="flex items-center gap-2 w-28 shrink-0">
        <span>{icon}</span>
        <span className="font-display text-[11px] font-bold text-parchment tracking-wider">{label}</span>
      </div>

      {/* Segmented Blocks Track */}
      <div className="flex-1 flex gap-1.5 h-3 items-center bg-[#0c0a08] p-1 rounded border border-[#262018]">
        {Array.from({ length: totalBlocks }).map((_, idx) => (
          <div
            key={idx}
            className={`h-full flex-1 rounded-xs transition-all duration-300 ${
              idx < filledBlocks
                ? colorStyles[color]
                : 'bg-[#181410] border border-[#231d17]'
            }`}
          />
        ))}
      </div>

      <span className="font-mono text-xs font-bold text-parchment w-6 text-right">{value}</span>
    </div>
  )
}

