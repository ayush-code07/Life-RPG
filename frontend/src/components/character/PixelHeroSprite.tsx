import { useGameStore } from '../../store/gameStore'

interface PixelHeroSpriteProps {
  pose?: 'idle' | 'attack' | 'cast' | 'cheer'
  resting?: boolean
  size?: number
}

export function PixelHeroSprite({ pose = 'idle', resting = false, size = 80 }: PixelHeroSpriteProps) {
  const { shopItems } = useGameStore()

  // Find equipped wearables by item ID or type
  const isEquipped = (id: number) => shopItems.some((i) => i.id === id && i.isEquipped)

  const hasGreatsword = isEquipped(1)
  const hasCinderHelm = isEquipped(2)
  const hasSovereignCloak = isEquipped(3)
  const hasFlameStaff = isEquipped(4)
  const hasSunkenShield = isEquipped(5)
  const hasSwiftBoots = isEquipped(6)
  const hasFireRing = isEquipped(7)
  const hasEclipseCrown = isEquipped(8)

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {/* Relic Aura (Ring of Everlasting Fire) */}
      {hasFireRing && (
        <div className="absolute -inset-2 rounded-full border border-amber-500/40 bg-amber-500/10 shadow-[0_0_18px_#f59e0b] animate-pulse pointer-events-none" />
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        style={{ imageRendering: 'pixelated' }}
        className="overflow-visible"
      >
        {/* ================= CLOAK / MANTLE ================= */}
        {hasSovereignCloak ? (
          <>
            {/* Royal Gold-trimmed Sovereign Mantle */}
            <rect x="4" y="6" width="8" height="3" fill="#b45309" />
            <rect x="3" y="7" width="2" height="6" fill="#78350f" />
            <rect x="11" y="7" width="2" height="6" fill="#78350f" />
            <rect x="3" y="12" width="2" height="2" fill="#fbbf24" />
            <rect x="11" y="12" width="2" height="2" fill="#fbbf24" />
          </>
        ) : (
          <>
            {/* Standard Crimson Cape */}
            <rect x="5" y="6" width="6" height="2" fill="#c83232" />
            <rect x="4" y="7" width="2" height="4" fill="#991b1b" />
          </>
        )}

        {/* ================= TORSO & ARMOR ================= */}
        <rect x="6" y="7" width="4" height="4" fill="#4b5563" />
        <rect x="7" y="8" width="2" height="2" fill="#9ca3af" />
        {/* Belt */}
        <rect x="6" y="11" width="4" height="1" fill="#78350f" />
        <rect x="7" y="11" width="2" height="1" fill="#e2b368" />

        {/* ================= LEGS & BOOTS ================= */}
        {hasSwiftBoots ? (
          <>
            {/* Swift Resolve Golden Greaves */}
            <rect x="6" y="12" width="1.5" height="2" fill="#d97706" />
            <rect x="8.5" y="12" width="1.5" height="2" fill="#d97706" />
            <rect x="5.5" y="14" width="2" height="2" fill="#fbbf24" />
            <rect x="8.5" y="14" width="2" height="2" fill="#fbbf24" />
          </>
        ) : (
          <>
            {/* Standard Iron Greaves */}
            <rect x="6" y="12" width="1.5" height="3" fill="#374151" />
            <rect x="8.5" y="12" width="1.5" height="3" fill="#374151" />
            <rect x="5.5" y="14" width="2" height="2" fill="#1f2937" />
            <rect x="8.5" y="14" width="2" height="2" fill="#1f2937" />
          </>
        )}

        {/* ================= HEADWEAR / HELMET ================= */}
        {hasEclipseCrown ? (
          <>
            {/* Crown of the Eclipse */}
            <rect x="5" y="1" width="6" height="2" fill="#fbbf24" />
            <rect x="5" y="0" width="1" height="2" fill="#f59e0b" />
            <rect x="7.5" y="0" width="1" height="2" fill="#ef4444" />
            <rect x="10" y="0" width="1" height="2" fill="#f59e0b" />
            {/* Face/Head Base */}
            <rect x="6" y="3" width="4" height="4" fill="#e2b368" />
            <rect x="7" y="4" width="2" height="1" fill="#1f2937" />
          </>
        ) : hasCinderHelm ? (
          <>
            {/* Helm of the Cinder Knight with Flame Plume & Ember Visor */}
            <rect x="7" y="0" width="2" height="3" fill="#ea580c" />
            <rect x="6" y="3" width="4" height="4" fill="#374151" />
            <rect x="6.5" y="4" width="3" height="1" fill="#ff7738" />
            <rect x="7" y="5" width="2" height="2" fill="#f59e0b" />
          </>
        ) : (
          <>
            {/* Standard Knight Helmet */}
            <rect x="7" y="1" width="2" height="2" fill={pose === 'cast' ? '#60a5fa' : '#e65c24'} />
            <rect x="6" y="3" width="4" height="4" fill="#9ca3af" />
            <rect x="7" y="4" width="2" height="1" fill="#1f2937" />
            <rect x="7" y="5" width="2" height="2" fill="#d1d5db" />
          </>
        )}

        {/* ================= SHIELD (LEFT HAND) ================= */}
        {hasSunkenShield ? (
          <>
            {/* Aegis of the Sunken Shield (Gold & Blue Crest) */}
            <rect x="1" y={pose === 'cheer' ? 2 : 5} width="4" height="8" fill="#1e3a8a" />
            <rect x="2" y={pose === 'cheer' ? 3 : 6} width="2" height="6" fill="#fbbf24" />
            <rect x="2.5" y={pose === 'cheer' ? 4 : 7} width="1" height="4" fill="#f59e0b" />
          </>
        ) : (
          <>
            {/* Standard Shield */}
            <rect x="2" y={pose === 'cheer' ? 3 : 6} width="3" height="6" fill="#e5e7eb" />
            <rect x="3" y={pose === 'cheer' ? 4 : 7} width="1" height="4" fill="#3b82f6" />
          </>
        )}

        {/* ================= WEAPON (RIGHT HAND) ================= */}
        {hasFlameStaff ? (
          /* Pyromancer Flame Staff */
          pose === 'attack' ? (
            <>
              <rect x="10" y="7" width="7" height="1.5" fill="#78350f" />
              <circle cx="17" cy="7.5" r="1.5" fill="#f97316" />
            </>
          ) : (
            <>
              <rect x="11" y="2" width="1" height="10" fill="#78350f" />
              <circle cx="11.5" cy="2.5" r="1.5" fill="#f97316" />
              <circle cx="11.5" cy="2.5" r="0.8" fill="#fef08a" />
            </>
          )
        ) : hasGreatsword ? (
          /* Ashen Greatsword */
          pose === 'attack' ? (
            <>
              <rect x="10" y="7" width="7" height="2" fill="#e5e7eb" />
              <rect x="11" y="7.5" width="5" height="1" fill="#f97316" />
              <rect x="9" y="6" width="1.5" height="4" fill="#e2b368" />
            </>
          ) : (
            <>
              <rect x="11" y="3" width="1.5" height="10" fill="#e5e7eb" />
              <rect x="11.5" y="4" width="0.8" height="7" fill="#f97316" />
              <rect x="10" y="8" width="3.5" height="1" fill="#e2b368" />
            </>
          )
        ) : (
          /* Default Arming Sword */
          pose === 'attack' ? (
            <>
              <rect x="10" y="7" width="5" height="1.5" fill="#d1d5db" />
              <rect x="9" y="6" width="1" height="3.5" fill="#e2b368" />
            </>
          ) : (
            <>
              <rect x="11" y="5" width="1" height="8" fill="#d1d5db" />
              <rect x="10" y="8" width="3" height="1" fill="#e2b368" />
            </>
          )
        )}
      </svg>
    </div>
  )
}
