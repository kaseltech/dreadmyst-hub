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
  const addStat = () => {
    const usedStats = stats.map(s => s.stat);
    const availableStat = ALL_STATS.find(s => !usedStats.includes(s.id));
    if (availableStat) {
      onChange([...stats, { id: Date.now().toString(), stat: availableStat.id, value: 0 }]);
    }
  };

  const removeStat = (id: string) => {
    onChange(stats.filter(s => s.id !== id));
  };

  const updateStat = (id: string, field: 'stat' | 'value', val: string | number) => {
    onChange(stats.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const usedStats = stats.map(s => s.stat);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Stats</label>
        {stats.length < ALL_STATS.length && (
          <button
            type="button"
            onClick={addStat}
            className="text-xs text-accent hover:text-accent-light transition-colors"
          >
            + Add Stat
          </button>
        )}
      </div>

      {stats.length === 0 ? (
        <button
          type="button"
          onClick={addStat}
          className="w-full py-4 rounded-lg text-muted/70 hover:text-foreground transition-all group"
          style={{
            border: '2px dashed rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.02)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)';
            e.currentTarget.style.background = 'rgba(245,158,11,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item Stats
          </span>
        </button>
      ) : (
        <div className="space-y-2">
          {stats.map((entry) => (
            <StatRow
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
  );
}

interface StatRowProps {
  entry: StatEntry;
  usedStats: string[];
  onUpdate: (field: 'stat' | 'value', val: string | number) => void;
  onRemove: () => void;
}

function StatRow({ entry, usedStats, onUpdate, onRemove }: StatRowProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentStat = ALL_STATS.find(s => s.id === entry.stat);

  // Filter stats based on search
  const filteredStats = ALL_STATS.filter(stat => {
    // Show current stat or unused stats that match search
    if (stat.id === entry.stat) return true;
    if (usedStats.includes(stat.id)) return false;
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return stat.label.toLowerCase().includes(searchLower) ||
           stat.abbrev.toLowerCase().includes(searchLower);
  });

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

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card-bg border border-card-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredStats.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted">No stats found</div>
            ) : (
              filteredStats.map((stat) => (
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
