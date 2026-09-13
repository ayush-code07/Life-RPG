import { useState } from 'react'
import { soundFx } from '../../lib/audio'
import { useGameStore } from '../../store/gameStore'
import { PixelHeroSprite } from '../character/PixelHeroSprite'

type SubTab = 'profile' | 'feats' | 'codex' | 'settings'
type SpritePose = 'idle' | 'attack' | 'cast' | 'cheer'
type FeatCategory = 'all' | 'combat' | 'discipline' | 'mastery' | 'wealth'

export function ChroniclesView() {
  const [subTab, setSubTab] = useState<SubTab>('profile')
  const [spritePose, setSpritePose] = useState<SpritePose>('idle')
  const [featCategory, setFeatCategory] = useState<FeatCategory>('all')
  const {
    profile,
    coins,
    achievements,
    sfxEnabled,
    crtEnabled,
    bgmPlaying,
    toggleSfx,
    toggleCrt,
    toggleBgm,
    claimAchievement,
  } = useGameStore()

  const level = profile?.current_level ?? 1
  const currentXP = profile?.progress_xp ?? 0
  const neededXP = profile?.xp_needed_for_next ?? 100
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentXP / Math.max(1, neededXP)) * 100)))
  const streak = profile?.current_streak ?? 0
  const gold = coins

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length
  const filteredAchievements = achievements.filter((a) =>
    featCategory === 'all' ? true : a.category === featCategory
  )

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
            Soul identity, hall of legends feats, ancient book of rules & procedural acoustic synthesizer.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleBgm}
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 font-display text-xs font-bold tracking-wider transition-all ${
            bgmPlaying
              ? 'border-gold bg-gold/20 text-gold shadow-[0_0_15px_rgba(226,179,104,0.3)] animate-pulse'
              : 'border-[#2e261d] bg-[#14100c] text-muted hover:text-parchment hover:border-gold/40'
          }`}
        >
          <span>{bgmPlaying ? '🎵' : '🔇'}</span>
          <span>{bgmPlaying ? 'AMBIENT SYNTH ON' : 'PLAY AMBIENT BGM'}</span>
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
          <span>FEATS ({unlockedCount}/{achievements.length})</span>
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
          <span>📜</span>
          <span>ANCIENT RULES</span>
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
                      {profile?.active_badge || 'KEEPER OF THE SACRED KILN'}
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
                      🏆 FEATS
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold text-parchment">{unlockedCount} / {achievements.length}</p>
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

      {/* Hall of Legends / Feats View */}
      {subTab === 'feats' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'ALL FEATS' },
              { id: 'combat', label: '⚔️ COMBAT' },
              { id: 'discipline', label: '⚡ DISCIPLINE' },
              { id: 'mastery', label: '🧠 MASTERY' },
              { id: 'wealth', label: '🪙 WEALTH' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  soundFx.playClick()
                  setFeatCategory(cat.id as FeatCategory)
                }}
                className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold uppercase transition-all ${
                  featCategory === cat.id
                    ? 'border border-gold/50 bg-gold/15 text-gold shadow-[0_0_10px_rgba(226,179,104,0.2)]'
                    : 'border border-[#262018] bg-[#120f0c] text-muted hover:text-parchment'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filteredAchievements.map((feat) => {
              const progressPct = Math.min(100, Math.round((feat.progress / Math.max(1, feat.maxProgress)) * 100))
              const isComplete = feat.isUnlocked

              return (
                <div
                  key={feat.id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 ${
                    isComplete
                      ? 'border-gold/40 bg-gradient-to-br from-[#1c1610] to-[#120e0a] shadow-[0_0_20px_rgba(226,179,104,0.1)]'
                      : 'border-[#262018] bg-[#0e0b08] opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-[#14100c] text-2xl shadow-inner">
                      {feat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display text-sm font-bold text-parchment truncate">{feat.title}</h4>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-gold shrink-0">
                          <span>+{feat.rewardXP} XP</span>
                          <span>•</span>
                          <span>+{feat.rewardCoins} 🪙</span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted leading-relaxed">{feat.description}</p>
                    </div>
                  </div>

                  {/* Progress Bar & Status Action */}
                  <div className="mt-3.5 pt-3 border-t border-[#221b14] space-y-2">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-muted">Progress</span>
                      <span className={isComplete ? 'font-bold text-gold' : 'text-parchment'}>
                        {feat.progress} / {feat.maxProgress} ({progressPct}%)
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full border border-[#2e261d] bg-[#0c0a08] p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isComplete
                            ? 'bg-gradient-to-r from-gold to-gold-bright shadow-[0_0_8px_rgba(226,179,104,0.6)]'
                            : 'bg-gradient-to-r from-[#5a3a1d] to-[#996515]'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {isComplete && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => claimAchievement(feat.id)}
                          className="rounded-lg border border-gold/50 bg-gold/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-gold hover:bg-gold hover:text-black transition-all shadow-[0_0_10px_rgba(226,179,104,0.15)]"
                        >
                          ✨ REWARD CLAIMED ✨
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Codex / Ancient Rules View */}
      {subTab === 'codex' && (
        <div className="rounded-2xl border border-[#382d20] bg-[#14110e] p-6 space-y-5">
          <div>
            <h3 className="font-display text-xl font-black text-parchment">ANCIENT BOOK OF REALM RULES</h3>
            <p className="text-xs text-muted leading-relaxed mt-1">
              The Ashen Path is a philosophy of disciplined rebirth. Consult the sacred doctrines of flame streak multipliers, stat mappings, mystery loot drops, and combat mechanics.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gold/20 bg-[#0d0b09] p-4 text-xs space-y-2">
              <p className="text-gold font-bold">🔥 Bonfire Flame Evolution Tiers:</p>
              <p className="text-muted">• <strong className="text-parchment">Novice Ember</strong> (0-2d streak): 1.0x Base XP</p>
              <p className="text-muted">• <strong className="text-amber-400">Kindled Blaze</strong> (3-6d streak): 1.1x XP (+10% Bonus)</p>
              <p className="text-muted">• <strong className="text-cyan-400">Astral Blue Flame</strong> (7-13d streak): 1.25x XP (+25% Bonus)</p>
              <p className="text-muted">• <strong className="text-yellow-300">Solar Ascendant</strong> (14d+ streak): 1.5x XP (+50% Bonus)</p>
            </div>

            <div className="rounded-xl border border-gold/20 bg-[#0d0b09] p-4 text-xs space-y-2">
              <p className="text-gold font-bold">🎁 Mystery RPG Loot Drops:</p>
              <p className="text-muted">• Quests drop unsealable chests with rarity tiers (Common to Legendary).</p>
              <p className="text-muted">• Higher difficulty tiers increase drop rate (up to 90% chance at Tier 5).</p>
              <p className="text-muted">• Unseal chests for bonus Gold Coins, Character XP, and Attribute Potions.</p>
            </div>

            <div className="rounded-xl border border-gold/20 bg-[#0d0b09] p-4 text-xs space-y-2">
              <p className="text-gold font-bold">⚔️ Stat Attribute Mapping:</p>
              <p className="text-muted">• <strong>Coding/Study</strong> increases <strong className="text-cyan-400">Intellect</strong></p>
              <p className="text-muted">• <strong>Gym/Workouts</strong> increases <strong className="text-red-400">Strength</strong></p>
              <p className="text-muted">• <strong>Sleep/Health/Meals</strong> increases <strong className="text-emerald-400">Vitality</strong></p>
              <p className="text-muted">• <strong>Morning Routine/Habits</strong> increases <strong className="text-amber-400">Focus & Discipline</strong></p>
            </div>

            <div className="rounded-xl border border-gold/20 bg-[#0d0b09] p-4 text-xs space-y-2">
              <p className="text-gold font-bold">🛍️ Royal Armory & Bazaar:</p>
              <p className="text-muted">• Earn gold coins from quests (+1 per task, +10 on level up, mystery drops).</p>
              <p className="text-muted">• Purchase weapons, armor, badges, and dynamic environmental shaders.</p>
              <p className="text-muted">• All purchases and equips persist across sessions and database profiles.</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings View */}
      {subTab === 'settings' && (
        <div className="rounded-2xl border border-[#382d20] bg-[#14110e] p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-parchment">REALM & ACOUSTIC SETTINGS</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={toggleSfx}
              className={`flex items-center justify-between rounded-xl border p-4 font-mono text-xs font-bold transition-all ${
                sfxEnabled ? 'border-gold/40 bg-gold/10 text-gold' : 'border-[#262018] bg-[#0d0b09] text-muted'
              }`}
            >
              <span>🔊 Procedural Sound FX</span>
              <span>{sfxEnabled ? 'ENABLED' : 'DISABLED'}</span>
            </button>

            <button
              type="button"
              onClick={toggleBgm}
              className={`flex items-center justify-between rounded-xl border p-4 font-mono text-xs font-bold transition-all ${
                bgmPlaying ? 'border-gold/40 bg-gold/15 text-gold shadow-[0_0_15px_rgba(226,179,104,0.2)]' : 'border-[#262018] bg-[#0d0b09] text-muted'
              }`}
            >
              <span>🎵 Dark Fantasy Ambient BGM</span>
              <span>{bgmPlaying ? 'PLAYING' : 'MUTED'}</span>
            </button>

            <button
              type="button"
              onClick={toggleCrt}
              className={`flex items-center justify-between rounded-xl border p-4 font-mono text-xs font-bold transition-all ${
                crtEnabled ? 'border-gold/40 bg-gold/10 text-gold' : 'border-[#262018] bg-[#0d0b09] text-muted'
              }`}
            >
              <span>📺 Scanline CRT Shader</span>
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

