'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import gameData from '@/lib/game-data.json';
import { Affix, STAT_DISPLAY_NAMES } from '@/lib/game-data-types';

interface ItemAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAffixSelect?: (affix: Affix | null) => void;
  placeholder?: string;
}

interface Suggestion {
  type: 'affix' | 'base_item';
  name: string;
  affix?: Affix;
  slot?: string;
}

export default function ItemAutocomplete({
  value,
  onChange,
  onAffixSelect,
  placeholder = 'Start typing item name...',
}: ItemAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Build searchable data from game data
  const searchableItems = useMemo(() => {
    const items: Suggestion[] = [];

    // Add all affixes
    const affixes = gameData.affixes as Affix[];
    for (const affix of affixes) {
      items.push({
        type: 'affix',
        name: affix.name,
        affix,
      });
    }

    // Add base items
    for (const item of gameData.base_items) {
      items.push({
        type: 'base_item',
        name: item.name,
        slot: item.slot,
      });
    }

    return items;
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const query = value.toLowerCase();
    const matches: Suggestion[] = [];
    const seen = new Set<string>();

    for (const item of searchableItems) {
      if (item.name.toLowerCase().includes(query)) {
        // Dedupe by name
        if (!seen.has(item.name)) {
          seen.add(item.name);
          matches.push(item);
        }
      }
      if (matches.length >= 20) break;
    }

    // Sort: exact matches first, then starts with, then contains
    matches.sort((a, b) => {
      const aLower = a.name.toLowerCase();
      const bLower = b.name.toLowerCase();
      const aExact = aLower === query;
      const bExact = bLower === query;
      const aStarts = aLower.startsWith(query);
      const bStarts = bLower.startsWith(query);

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    });

    setSuggestions(matches);
    setSelectedIndex(0);
    setIsOpen(matches.length > 0);
  }, [value, searchableItems]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    onChange(suggestion.name);
    setIsOpen(false);

    if (suggestion.type === 'affix' && suggestion.affix && onAffixSelect) {
      onAffixSelect(suggestion.affix);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatStats = (affix: Affix) => {
    return affix.stats
      .map((s) => `+${s.value} ${STAT_DISPLAY_NAMES[s.stat] || s.stat}`)
      .join(', ');
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => value.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg placeholder:text-muted/50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e5e5' }}
        autoComplete="off"
      />

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto rounded-lg shadow-xl"
          style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.name}-${index}`}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                index === selectedIndex ? 'bg-amber-500/20' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{suggestion.name}</span>
                {suggestion.type === 'affix' && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    Affix
                  </span>
                )}
                {suggestion.type === 'base_item' && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    {suggestion.slot}
                  </span>
                )}
              </div>
              {suggestion.type === 'affix' && suggestion.affix && (
                <div className="text-xs text-muted mt-0.5">
                  Lv{suggestion.affix.min_level}-{suggestion.affix.max_level} | {formatStats(suggestion.affix)}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
