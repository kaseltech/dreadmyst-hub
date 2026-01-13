'use client';

import { useState, useRef, useEffect } from 'react';
import { STAT_CONFIG, ItemStatType } from '@/types/items';

// Generate stats list from STAT_CONFIG - organized by category for better UX
const ALL_STATS = (Object.entries(STAT_CONFIG) as [ItemStatType, typeof STAT_CONFIG[ItemStatType]][])
  .map(([id, info]) => ({
    id,
    label: info.label,
    abbrev: info.abbrev,
    color: info.color,
    category: info.category,
  }));

// Primary stats (5 main attributes)
const PRIMARY_STATS = ALL_STATS.filter(s => s.category === 'primary');
// Secondary stats (everything else)
const SECONDARY_STATS = ALL_STATS.filter(s => s.category !== 'primary');

// Group secondary stats by category for dropdown display
const SECONDARY_GROUPS = [
  { label: 'Core', stats: ALL_STATS.filter(s => s.category === 'secondary') },
  { label: 'Regen', stats: ALL_STATS.filter(s => s.category === 'regen') },
  { label: 'Combat', stats: ALL_STATS.filter(s => s.category === 'combat') },
  { label: 'Defense', stats: ALL_STATS.filter(s => s.category === 'defense') },
  { label: 'Weapon Skills', stats: ALL_STATS.filter(s => s.category === 'skills') },
  { label: 'Resistances', stats: ALL_STATS.filter(s => s.category === 'resist') },
];

interface StatEntry {
  id: string;
  stat: string;
  value: number;
}

interface StatPickerProps {
  stats: StatEntry[];
  onChange: (stats: StatEntry[]) => void;
}

export default function StatPicker({ stats, onChange }: StatPickerProps) {
  // Split stats into primary and secondary
  const primaryStats = stats.filter(s => PRIMARY_STATS.some(p => p.id === s.stat));
  const secondaryStats = stats.filter(s => SECONDARY_STATS.some(p => p.id === s.stat));

  const updateStat = (id: string, field: 'stat' | 'value', val: string | number) => {
    onChange(stats.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const removeStat = (id: string) => {
    onChange(stats.filter(s => s.id !== id));
  };

  // Toggle a primary stat (add/remove)
  const togglePrimaryStat = (statId: string) => {
    const existing = stats.find(s => s.stat === statId);
    if (existing) {
      onChange(stats.filter(s => s.stat !== statId));
    } else {
      onChange([...stats, { id: Date.now().toString(), stat: statId, value: 0 }]);
    }
  };

  // Update primary stat value
  const updatePrimaryValue = (statId: string, value: number) => {
    const existing = stats.find(s => s.stat === statId);
    if (existing) {
      updateStat(existing.id, 'value', value);
    }
  };

  // Add a secondary stat
  const addSecondaryStat = () => {
    const usedStats = stats.map(s => s.stat);
    const availableStat = SECONDARY_STATS.find(s => !usedStats.includes(s.id));
    if (availableStat) {
      onChange([...stats, { id: Date.now().toString(), stat: availableStat.id, value: 0 }]);
    }
  };

  const usedStats = stats.map(s => s.stat);

  return (
    <div className="space-y-4">
      {/* Primary Stats Section */}
      <div>
        <label className="block text-sm font-medium mb-2">Primary Attributes</label>
        <div className="grid grid-cols-5 gap-2">
          {PRIMARY_STATS.map((stat) => {
            const entry = stats.find(s => s.stat === stat.id);
            const isActive = !!entry;
            return (
              <div key={stat.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => togglePrimaryStat(stat.id)}
                  className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive ? stat.color : 'text-muted/60 hover:text-muted'
                  }`}
                  style={isActive
                    ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }
                    : { background: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {stat.abbrev}
                </button>
                {isActive && (
                  <input
                    type="number"
                    min="0"
                    value={entry?.value || ''}
                    onChange={(e) => updatePrimaryValue(stat.id, parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2 py-1 rounded text-xs text-foreground text-center focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-muted/50 mt-1">Click to toggle, enter values for active stats</p>
      </div>

      {/* Secondary Stats Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Secondary Stats</label>
          {secondaryStats.length < SECONDARY_STATS.length && (
            <button
              type="button"
              onClick={addSecondaryStat}
              className="text-xs text-accent hover:text-accent-light transition-colors"
            >
              + Add Stat
            </button>
          )}
        </div>

        {secondaryStats.length === 0 ? (
          <button
            type="button"
            onClick={addSecondaryStat}
            className="w-full py-3 rounded-lg text-muted/60 hover:text-foreground transition-all text-sm"
            style={{
              border: '1px dashed rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.01)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)';
              e.currentTarget.style.background = 'rgba(245,158,11,0.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
            }}
          >
            + Add weapon skills, resistances, etc.
          </button>
        ) : (
          <div className="space-y-2">
            {secondaryStats.map((entry) => (
              <SecondaryStatRow
                key={entry.id}
                entry={entry}
                usedStats={usedStats}
                onUpdate={(field, val) => updateStat(entry.id, field, val)}
                onRemove={() => removeStat(entry.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SecondaryStatRowProps {
  entry: StatEntry;
  usedStats: string[];
  onUpdate: (field: 'stat' | 'value', val: string | number) => void;
  onRemove: () => void;
}

function SecondaryStatRow({ entry, usedStats, onUpdate, onRemove }: SecondaryStatRowProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentStat = SECONDARY_STATS.find(s => s.id === entry.stat);

  // Filter secondary stats based on search
  const filteredStats = SECONDARY_STATS.filter(stat => {
    // Show current stat or unused stats that match search
    if (stat.id === entry.stat) return true;
    if (usedStats.includes(stat.id)) return false;
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return stat.label.toLowerCase().includes(searchLower) ||
           stat.abbrev.toLowerCase().includes(searchLower);
  });

  // Group filtered stats by category
  const groupedStats = SECONDARY_GROUPS
    .map(group => ({
      ...group,
      stats: group.stats.filter(s => filteredStats.some(fs => fs.id === s.id))
    }))
    .filter(group => group.stats.length > 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (statId: string) => {
    onUpdate('stat', statId);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Stat selector with search */}
      <div className="relative flex-1" ref={dropdownRef}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
        >
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="flex-1 bg-transparent outline-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false);
                  setSearch('');
                } else if (e.key === 'Enter' && filteredStats.length > 0) {
                  handleSelect(filteredStats[0].id);
                }
              }}
            />
          ) : (
            <>
              <span className={`text-sm font-medium ${currentStat?.color || 'text-muted'}`}>
                {currentStat?.abbrev || 'Select'}
              </span>
              <span className="text-sm text-muted flex-1">
                {currentStat?.label || 'Select stat...'}
              </span>
              <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </div>

        {/* Dropdown - grouped by category */}
        {isOpen && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card-bg border border-card-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {groupedStats.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted">No stats found</div>
            ) : (
              groupedStats.map((group) => (
                <div key={group.label}>
                  <div className="px-3 py-1 text-[10px] font-semibold text-muted/60 uppercase tracking-wider bg-card-border/30 sticky top-0">
                    {group.label}
                  </div>
                  {group.stats.map((stat) => (
                    <button
                      key={stat.id}
                      type="button"
                      onClick={() => handleSelect(stat.id)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-card-border flex items-center gap-2 ${
                        stat.id === entry.stat ? 'bg-accent/20' : ''
                      }`}
                    >
                      <span className={`font-medium ${stat.color}`}>{stat.abbrev}</span>
                      <span>{stat.label}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Value input */}
      <input
        type="number"
        min="0"
        value={entry.value || ''}
        onChange={(e) => onUpdate('value', parseInt(e.target.value) || 0)}
        placeholder="0"
        className="w-20 px-3 py-2 rounded-lg text-foreground text-center focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      />

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-muted hover:text-red-400 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
