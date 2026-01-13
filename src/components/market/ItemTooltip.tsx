'use client';

import {
  ItemTier,
  TIER_CONFIG,
  BASE_TYPES,
  SUFFIX_ANIMALS,
  SUFFIX_MODIFIERS,
  STAT_CONFIG,
  PrimaryStat,
} from '@/types/items';

interface ItemTooltipProps {
  itemName: string;
  tier: ItemTier;
  baseTypeId?: string | null;
  suffixAnimalId?: string | null;
  suffixModifierId?: string | null;
  socketCount: number;
  levelRequirement: number;
  stats?: Record<string, number> | null;
  equipEffects?: string[] | null;
  price?: number;
}

export default function ItemTooltip({
  itemName,
  tier,
  baseTypeId,
  suffixAnimalId,
  suffixModifierId,
  socketCount,
  levelRequirement,
  stats,
  equipEffects,
  price,
}: ItemTooltipProps) {
  const baseType = BASE_TYPES.find(b => b.id === baseTypeId);
  const animal = SUFFIX_ANIMALS.find(a => a.id === suffixAnimalId);
  const modifier = SUFFIX_MODIFIERS.find(m => m.id === suffixModifierId);

  // Tier-based border colors
  const borderColors: Record<ItemTier, string> = {
    godly: 'border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    holy: 'border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    blessed: 'border-blue-500/70 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    none: 'border-gray-600/70',
  };

  const tierColor = TIER_CONFIG[tier].color;

  return (
    <div
      className={`relative w-80 bg-[#1a1520]/95 backdrop-blur-sm border-2 rounded-lg overflow-hidden font-[family-name:var(--font-cinzel)] ${borderColors[tier]}`}
    >
      {/* Decorative top border gradient */}
      <div
        className={`h-1 ${
          tier === 'godly' ? 'bg-gradient-to-r from-transparent via-amber-500 to-transparent' :
          tier === 'holy' ? 'bg-gradient-to-r from-transparent via-purple-500 to-transparent' :
          tier === 'blessed' ? 'bg-gradient-to-r from-transparent via-blue-500 to-transparent' :
          'bg-gradient-to-r from-transparent via-gray-500 to-transparent'
        }`}
      />

      <div className="p-4">
        {/* Item Name */}
        <h3 className={`text-lg font-bold text-center mb-1 ${tierColor}`}>
          {itemName}
        </h3>

        {/* Item Type / Slot */}
        {baseType && (
          <p className="text-center text-sm text-gray-400 mb-3 capitalize">
            {baseType.slot === 'weapon' ? 'Weapon' : baseType.slot}
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-gray-700/50 my-3" />

        {/* Animal Stats Info */}
        {animal && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Stat Bonus</p>
            <p className="text-sm text-gray-300">
              <span className={STAT_CONFIG[animal.primaryStat].color}>
                {STAT_CONFIG[animal.primaryStat].label}
              </span>
              {' / '}
              <span className={STAT_CONFIG[animal.secondaryStat].color}>
                {STAT_CONFIG[animal.secondaryStat].label}
              </span>
            </p>
          </div>
        )}

        {/* Modifier Effect */}
        {modifier && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Modifier</p>
            <p className="text-sm text-cyan-400">{modifier.description}</p>
          </div>
        )}

        {/* Stats */}
        {stats && Object.keys(stats).length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Stats</p>
            <div className="space-y-1">
              {Object.entries(stats).map(([stat, value]) => {
                const config = STAT_CONFIG[stat as PrimaryStat];
                return (
                  <p key={stat} className={`text-sm ${config?.color || 'text-white'}`}>
                    +{value} {config?.label || stat}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* Sockets */}
        {socketCount > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sockets</p>
            <div className="flex gap-2">
              {Array.from({ length: socketCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-gray-500 bg-gray-900/80 flex items-center justify-center"
                >
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-800" />
                </div>
              ))}
              {Array.from({ length: 3 - socketCount }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-6 h-6 rounded-full border border-gray-700/50 bg-gray-900/30"
                />
              ))}
            </div>
          </div>
        )}

        {/* Equip Effects */}
        {equipEffects && equipEffects.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Equip</p>
            <div className="space-y-1">
              {equipEffects.map((effect, i) => (
                <p key={i} className="text-sm text-green-400">{effect}</p>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-700/50 my-3" />

        {/* Level Requirement */}
        <p className="text-xs text-gray-400 text-center">
          Requires Level <span className="text-white">{levelRequirement}</span>
        </p>

        {/* Price (if provided) */}
        {price && (
          <p className="text-center mt-2">
            <span className="text-yellow-500 font-bold text-lg">
              {price >= 1000000
                ? `${(price / 1000000).toFixed(1)}M`
                : price >= 1000
                ? `${(price / 1000).toFixed(0)}K`
                : price.toLocaleString()}{' '}
              Gold
            </span>
          </p>
        )}
      </div>

      {/* Decorative bottom border gradient */}
      <div
        className={`h-1 ${
          tier === 'godly' ? 'bg-gradient-to-r from-transparent via-amber-500 to-transparent' :
          tier === 'holy' ? 'bg-gradient-to-r from-transparent via-purple-500 to-transparent' :
          tier === 'blessed' ? 'bg-gradient-to-r from-transparent via-blue-500 to-transparent' :
          'bg-gradient-to-r from-transparent via-gray-500 to-transparent'
        }`}
      />
    </div>
  );
}
