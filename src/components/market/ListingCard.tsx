'use client';

import Link from 'next/link';
import { Listing } from '@/lib/supabase';
import { ItemTier, TIER_CONFIG, STAT_CONFIG, PrimaryStat } from '@/types/items';
import { formatGoldShort, formatTimeAgo } from '@/lib/formatters';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const tier = (listing.tier as ItemTier) || 'none';
  const tierConfig = TIER_CONFIG[tier];

  // Tier-based styling - reduced glow saturation for subtlety
  const tierStyles: Record<ItemTier, { border: string; glow: string; gradient: string }> = {
    godly: {
      border: 'border-purple-500/40',
      glow: 'shadow-[0_0_12px_rgba(168,85,247,0.12)] hover:shadow-[0_0_18px_rgba(168,85,247,0.2)]',
      gradient: 'from-purple-500/15 via-transparent to-transparent',
    },
    holy: {
      border: 'border-pink-500/40',
      glow: 'shadow-[0_0_12px_rgba(236,72,153,0.12)] hover:shadow-[0_0_18px_rgba(236,72,153,0.2)]',
      gradient: 'from-pink-500/15 via-transparent to-transparent',
    },
    blessed: {
      border: 'border-blue-500/40',
      glow: 'shadow-[0_0_12px_rgba(59,130,246,0.12)] hover:shadow-[0_0_18px_rgba(59,130,246,0.2)]',
      gradient: 'from-blue-500/15 via-transparent to-transparent',
    },
    none: {
      border: 'border-gray-700/40',
      glow: 'hover:shadow-[0_0_12px_rgba(255,255,255,0.03)]',
      gradient: 'from-gray-500/8 via-transparent to-transparent',
    },
  };

  const style = tierStyles[tier];

  return (
    <Link
      href={`/market/${listing.id}`}
      className={`group flex flex-col relative overflow-hidden rounded-lg border-2 ${style.border} ${style.glow} bg-[#0d0d12] transition-all duration-300 hover:scale-[1.02] h-full`}
    >
      {/* Top gradient bar */}
      <div className={`h-1 bg-gradient-to-r ${style.gradient}`} />

      {/* Corner decoration for high tier items */}
      {tier !== 'none' && (
        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${style.gradient} opacity-50`} />
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* Header - Tier badge and time */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-wrap gap-1.5">
            {tier !== 'none' && (
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${tierConfig.bgColor} ${tierConfig.color} uppercase tracking-wide`}>
                {tierConfig.label}
              </span>
            )}
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-800/80 text-gray-400 capitalize">
              {listing.category}
            </span>
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">{formatTimeAgo(listing.created_at)}</span>
        </div>

        {/* Item Name - Fixed height for 2 lines */}
        <h3 className={`text-lg font-bold leading-tight group-hover:brightness-125 transition-all ${tierConfig.color} h-[3.5rem] line-clamp-2`}>
          {listing.item_name}
        </h3>

        {/* Stats Row - Fixed height */}
        <div className="h-6 mb-2">
          {listing.stats && Object.keys(listing.stats).length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {Object.entries(listing.stats).map(([stat, value]) => {
                const config = STAT_CONFIG[stat as PrimaryStat];
                return (
                  <span key={stat} className={`text-sm font-medium ${config?.color || 'text-gray-400'}`}>
                    +{value} {config?.abbrev || stat.slice(0, 3).toUpperCase()}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Sockets & Level Row - Fixed height */}
        <div className="flex items-center gap-4 h-5 mb-3">
          {/* Sockets */}
          {listing.socket_count > 0 && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: listing.socket_count }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border-2 border-gray-500 bg-gray-900 flex items-center justify-center"
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-gray-500 to-gray-700" />
                </div>
              ))}
              {Array.from({ length: 3 - listing.socket_count }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-4 h-4 rounded-full border border-gray-800 bg-gray-900/50"
                />
              ))}
            </div>
          )}

          {/* Level */}
          {listing.level_requirement && listing.level_requirement > 1 && (
            <span className="text-xs text-gray-500">
              Lvl <span className="text-gray-400">{listing.level_requirement}</span>
            </span>
          )}
        </div>

        {/* Spacer to push footer down */}
        <div className="flex-1" />

        {/* Divider */}
        <div className="border-t border-gray-800 my-3" />

        {/* Footer - Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-yellow-500">
              {formatGoldShort(listing.price)}
            </span>
            <span className="text-sm text-yellow-600">Gold</span>
          </div>
        </div>
      </div>

      {/* Bottom gradient bar */}
      <div className={`h-0.5 bg-gradient-to-r ${style.gradient}`} />
    </Link>
  );
}
