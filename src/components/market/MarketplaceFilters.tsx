'use client';

import { useState, useEffect } from 'react';
import { ItemCategory } from '@/lib/supabase';
import { ItemTier, TIER_CONFIG, STAT_CONFIG, ItemStatType } from '@/types/items';
import { Layers, Swords, Shield, CircleDot, FlaskConical, Package, Sparkles } from 'lucide-react';

// All available stats for filtering - grouped by category
const ALL_STATS = (Object.entries(STAT_CONFIG) as [ItemStatType, typeof STAT_CONFIG[ItemStatType]][])
  .map(([id, info]) => ({
    id,
    label: info.label,
    abbrev: info.abbrev,
    color: info.color,
    category: info.category,
  }));

// Stat groups for filter display
const STAT_GROUPS = [
  {
    label: 'Primary',
    categories: ['primary'] as const,
    stats: ALL_STATS.filter(s => s.category === 'primary'),
  },
  {
    label: 'Resists',
    categories: ['resist'] as const,
    stats: ALL_STATS.filter(s => s.category === 'resist'),
  },
  {
    label: 'Bonuses',
    categories: ['secondary', 'regen', 'combat', 'defense'] as const,
    stats: ALL_STATS.filter(s => ['secondary', 'regen', 'combat', 'defense'].includes(s.category)),
  },
];

const categoryIcons: Record<ItemCategory | 'all', React.ComponentType<{ className?: string }>> = {
  all: Layers,
  weapons: Swords,
  armor: Shield,
  accessories: CircleDot,
  consumables: FlaskConical,
  materials: Package,
  other: Sparkles,
};

const categories: { value: ItemCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'weapons', label: 'Weapons' },
  { value: 'armor', label: 'Armor' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'consumables', label: 'Consumables' },
  { value: 'materials', label: 'Materials' },
  { value: 'other', label: 'Other' },
];

const tiers: { value: ItemTier | 'all'; label: string }[] = [
  { value: 'all', label: 'All Tiers' },
  { value: 'godly', label: 'Godly' },
  { value: 'holy', label: 'Holy' },
  { value: 'blessed', label: 'Blessed' },
  { value: 'none', label: 'Normal' },
];

export interface FilterState {
  search: string;
  category: ItemCategory | 'all';
  tier: ItemTier | 'all';
  stats: string[]; // Stats the item must have
  minSockets: number;
  maxSockets: number;
  minPrice: number | null;
  maxPrice: number | null;
  minLevel: number | null;
  maxLevel: number | null;
  sortBy: 'newest' | 'price_low' | 'price_high' | 'level_low' | 'level_high';
}

export const defaultFilters: FilterState = {
  search: '',
  category: 'all',
  tier: 'all',
  stats: [],
  minSockets: 0,
  maxSockets: 3,
  minPrice: null,
  maxPrice: null,
  minLevel: null,
  maxLevel: null,
  sortBy: 'newest',
};

interface MarketplaceFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
}

export default function MarketplaceFilters({
  filters,
  onChange,
  resultCount,
}: MarketplaceFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Count active filters (excluding defaults)
  const activeFilterCount = [
    filters.category !== 'all',
    filters.tier !== 'all',
    filters.stats.length > 0,
    filters.minSockets > 0 || filters.maxSockets < 3,
    filters.minPrice !== null,
    filters.maxPrice !== null,
    filters.minLevel !== null,
    filters.maxLevel !== null,
  ].filter(Boolean).length;

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleStat = (statId: string) => {
    const newStats = filters.stats.includes(statId)
      ? filters.stats.filter(s => s !== statId)
      : [...filters.stats, statId];
    updateFilter('stats', newStats);
  };

  const clearAllFilters = () => {
    onChange({ ...defaultFilters, search: filters.search });
  };

  const handlePriceInput = (type: 'min' | 'max', value: string) => {
    const cleaned = value.trim().toLowerCase();
    let numericValue: number | null = null;

    if (cleaned) {
      if (cleaned.endsWith('m')) {
        numericValue = parseFloat(cleaned.slice(0, -1)) * 1000000;
      } else if (cleaned.endsWith('k')) {
        numericValue = parseFloat(cleaned.slice(0, -1)) * 1000;
      } else {
        numericValue = parseFloat(cleaned.replace(/,/g, ''));
      }
      if (isNaN(numericValue)) numericValue = null;
    }

    updateFilter(type === 'min' ? 'minPrice' : 'maxPrice', numericValue);
  };

  // Quick filter presets
  const presets = [
    { label: 'Has Sockets', action: () => updateFilter('minSockets', 1) },
    { label: 'High Tier', action: () => onChange({ ...filters, tier: 'godly' }) },
    { label: 'Budget (<10K)', action: () => updateFilter('maxPrice', 10000) },
  ];

  // Filter panel content (shared between desktop and mobile)
  const filterContent = (
    <>
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search items..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        {filters.search && (
          <button
            onClick={() => updateFilter('search', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div>
        <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.value];
            return (
              <button
                key={cat.value}
                onClick={() => updateFilter('category', cat.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5 ${
                  filters.category === cat.value
                    ? 'text-white'
                    : 'hover:text-white/80'
                }`}
                style={filters.category === cat.value
                  ? { background: 'linear-gradient(135deg, #a84b08, #d97706)', border: '1px solid transparent' }
                  : { background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }
                }
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tier Filter */}
      <div>
        <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">Tier</label>
        <div className="flex flex-wrap gap-2">
          {tiers.map((t) => {
            const isActive = filters.tier === t.value;
            const tierColor = t.value !== 'all' && t.value !== 'none'
              ? TIER_CONFIG[t.value as ItemTier].hexColor
              : '#f59e0b';
            return (
              <button
                key={t.value}
                onClick={() => updateFilter('tier', t.value)}
                className="px-3 py-1.5 text-sm rounded-lg transition-all"
                style={isActive
                  ? {
                      background: `rgba(245,158,11,0.08)`,
                      border: `1px solid ${tierColor}`,
                      color: tierColor
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.10)',
                      color: 'rgba(255,255,255,0.60)'
                    }
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value as FilterState['sortBy'])}
          className="w-full px-3 py-2.5 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 appearance-none cursor-pointer"
          style={{
            background: '#1a1a24',
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a3a3a3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1.25rem',
            paddingRight: '2.5rem',
          }}
        >
          <option value="newest" style={{ background: '#1a1a24', color: '#e5e5e5' }}>Newest First</option>
          <option value="price_low" style={{ background: '#1a1a24', color: '#e5e5e5' }}>Price: Low → High</option>
          <option value="price_high" style={{ background: '#1a1a24', color: '#e5e5e5' }}>Price: High → Low</option>
          <option value="level_low" style={{ background: '#1a1a24', color: '#e5e5e5' }}>Level: Low → High</option>
          <option value="level_high" style={{ background: '#1a1a24', color: '#e5e5e5' }}>Level: High → Low</option>
        </select>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center justify-between w-full py-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced Filters
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-accent text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </span>
        <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="space-y-4 pt-2 border-t border-card-border animate-in slide-in-from-top-2 duration-200">
          {/* Stat Filters - Grouped */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider">
              Has Stats
              {filters.stats.length > 0 && <span className="ml-1 text-accent">({filters.stats.length})</span>}
            </label>

            {STAT_GROUPS.map((group) => (
              <div key={group.label}>
                <span className="text-[10px] font-semibold text-muted/60 uppercase tracking-wider">{group.label}</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {group.stats.map((stat) => (
                    <button
                      key={stat.id}
                      onClick={() => toggleStat(stat.id)}
                      className={`px-2 py-1 text-xs rounded-md transition-all flex items-center gap-1 ${
                        filters.stats.includes(stat.id)
                          ? `ring-1 ring-current ${stat.color}`
                          : 'bg-card-border/50 text-muted hover:text-foreground'
                      }`}
                      style={filters.stats.includes(stat.id) ? { backgroundColor: 'rgba(255,255,255,0.08)' } : {}}
                    >
                      <span className={`font-bold ${filters.stats.includes(stat.id) ? stat.color : ''}`}>
                        {stat.abbrev}
                      </span>
                      <span className="hidden lg:inline">{stat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Socket Filter */}
          <div>
            <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">Sockets</label>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((count) => {
                const isInRange = count >= filters.minSockets && count <= filters.maxSockets;
                const isMin = count === filters.minSockets;
                const isMax = count === filters.maxSockets;
                return (
                  <button
                    key={count}
                    onClick={() => {
                      // Click behavior: set as both min and max, or expand range
                      if (filters.minSockets === count && filters.maxSockets === count) {
                        // Already selected alone, expand to all
                        onChange({ ...filters, minSockets: 0, maxSockets: 3 });
                      } else if (count < filters.minSockets) {
                        updateFilter('minSockets', count);
                      } else if (count > filters.maxSockets) {
                        updateFilter('maxSockets', count);
                      } else {
                        // Set exact
                        onChange({ ...filters, minSockets: count, maxSockets: count });
                      }
                    }}
                    className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all flex items-center justify-center ${
                      isInRange
                        ? 'bg-accent/20 border-accent text-accent-light'
                        : 'border-card-border text-muted hover:border-accent/50'
                    }`}
                  >
                    <div className="flex gap-0.5">
                      {count === 0 ? (
                        <span>0</span>
                      ) : (
                        Array.from({ length: count }).map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-current" />
                        ))
                      )}
                    </div>
                  </button>
                );
              })}
              <span className="text-xs text-muted ml-2">
                {filters.minSockets === filters.maxSockets
                  ? `Exactly ${filters.minSockets}`
                  : filters.minSockets === 0 && filters.maxSockets === 3
                  ? 'Any'
                  : `${filters.minSockets}-${filters.maxSockets}`}
              </span>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">Price Range</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Min (e.g. 5k)"
                defaultValue={filters.minPrice ? (filters.minPrice >= 1000000 ? `${filters.minPrice/1000000}m` : filters.minPrice >= 1000 ? `${filters.minPrice/1000}k` : filters.minPrice) : ''}
                onBlur={(e) => handlePriceInput('min', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePriceInput('min', (e.target as HTMLInputElement).value)}
                className="flex-1 px-3 py-2 rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm"
                style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <span className="text-muted">—</span>
              <input
                type="text"
                placeholder="Max (e.g. 1m)"
                defaultValue={filters.maxPrice ? (filters.maxPrice >= 1000000 ? `${filters.maxPrice/1000000}m` : filters.maxPrice >= 1000 ? `${filters.maxPrice/1000}k` : filters.maxPrice) : ''}
                onBlur={(e) => handlePriceInput('max', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePriceInput('max', (e.target as HTMLInputElement).value)}
                className="flex-1 px-3 py-2 rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm"
                style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>

          {/* Level Range */}
          <div>
            <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">Level Requirement</label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Min"
                  min="1"
                  max="25"
                  value={filters.minLevel || ''}
                  onChange={(e) => updateFilter('minLevel', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-24 px-3 py-2 pr-8 rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <div className="absolute right-1 inset-y-1 flex flex-col justify-center">
                  <button
                    type="button"
                    onClick={() => updateFilter('minLevel', Math.min(25, (filters.minLevel || 0) + 1))}
                    className="px-1 h-3 flex items-center justify-center text-muted hover:text-amber-400 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFilter('minLevel', Math.max(1, (filters.minLevel || 2) - 1))}
                    className="px-1 h-3 flex items-center justify-center text-muted hover:text-amber-400 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              </div>
              <span className="text-muted">—</span>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Max"
                  min="1"
                  max="25"
                  value={filters.maxLevel || ''}
                  onChange={(e) => updateFilter('maxLevel', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-24 px-3 py-2 pr-8 rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <div className="absolute right-1 inset-y-1 flex flex-col justify-center">
                  <button
                    type="button"
                    onClick={() => updateFilter('maxLevel', Math.min(25, (filters.maxLevel || 0) + 1))}
                    className="px-1 h-3 flex items-center justify-center text-muted hover:text-amber-400 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFilter('maxLevel', Math.max(1, (filters.maxLevel || 2) - 1))}
                    className="px-1 h-3 flex items-center justify-center text-muted hover:text-amber-400 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              </div>
              <span className="text-xs text-muted">(1-25)</span>
            </div>
          </div>

          {/* Clear All */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="w-full py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              Clear All Filters ({activeFilterCount})
            </button>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block p-4 rounded-xl bg-card-bg border border-card-border space-y-4 mb-6">
        {filterContent}

        {/* Results count */}
        <div className="pt-3 border-t border-card-border flex items-center justify-between">
          <span className="text-sm text-muted">
            {resultCount} {resultCount === 1 ? 'listing' : 'listings'} found
          </span>
          {/* Quick presets */}
          <div className="flex gap-2">
            {presets.map((preset, i) => (
              <button
                key={i}
                onClick={preset.action}
                className="px-2 py-1 text-xs text-muted hover:text-foreground hover:bg-card-border rounded transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-card-bg border border-card-border"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-accent text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </span>
          <span className="text-sm text-muted">{resultCount} results</span>
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-background border-l border-card-border overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-4 py-3 bg-background border-b border-card-border">
              <h2 className="font-semibold">Filters</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-muted hover:text-foreground rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {filterContent}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 p-4 bg-background border-t border-card-border">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-lg transition-colors"
              >
                Show {resultCount} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
