'use client';

import { useState, useRef, useEffect } from 'react';
import { STAT_CONFIG, PrimaryStat } from '@/types/items';

// Extended stats list for items
const ALL_STATS = [
  { id: 'strength', label: 'Strength', abbrev: 'STR', color: 'text-red-400' },
  { id: 'agility', label: 'Agility', abbrev: 'AGI', color: 'text-green-400' },
  { id: 'intelligence', label: 'Intelligence', abbrev: 'INT', color: 'text-blue-400' },
  { id: 'willpower', label: 'Willpower', abbrev: 'WIL', color: 'text-purple-400' },
  { id: 'courage', label: 'Courage', abbrev: 'CRG', color: 'text-yellow-400' },
  { id: 'weaponValue', label: 'Weapon Value', abbrev: 'WPN', color: 'text-orange-400' },
  { id: 'armorValue', label: 'Armor Value', abbrev: 'ARM', color: 'text-cyan-400' },
  { id: 'health', label: 'Health', abbrev: 'HP', color: 'text-red-300' },
  { id: 'mana', label: 'Mana', abbrev: 'MP', color: 'text-blue-300' },
  { id: 'stamina', label: 'Stamina', abbrev: 'STA', color: 'text-green-300' },
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
          className="w-full py-3 border-2 border-dashed border-card-border rounded-lg text-muted hover:border-accent/50 hover:text-foreground transition-colors"
        >
          + Add Item Stats
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
          className="flex items-center gap-2 px-3 py-2 bg-background border border-card-border rounded-lg cursor-pointer hover:border-accent/50"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
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
        className="w-20 px-3 py-2 bg-background border border-card-border rounded-lg text-foreground text-center focus:outline-none focus:border-accent"
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
