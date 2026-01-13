'use client';

import { useState, useEffect } from 'react';
import {
  ItemTier,
  TIER_CONFIG,
  BASE_TYPES,
  SUFFIX_ANIMALS,
  SUFFIX_MODIFIERS,
  ItemCategory,
  getBaseTypesByCategory,
  generateItemName,
  getTierColorClass,
} from '@/types/items';

interface ItemBuilderProps {
  onChange: (data: ItemBuilderData) => void;
  initialData?: Partial<ItemBuilderData>;
}

export interface ItemBuilderData {
  tier: ItemTier;
  baseTypeId: string | null;
  suffixModifierId: string | null;
  suffixAnimalId: string | null;
  customName: string;
  useCustomName: boolean;
}

export default function ItemBuilder({ onChange, initialData }: ItemBuilderProps) {
  const [tier, setTier] = useState<ItemTier>(initialData?.tier ?? 'none');
  const [category, setCategory] = useState<ItemCategory | ''>('');
  const [baseTypeId, setBaseTypeId] = useState<string | null>(initialData?.baseTypeId ?? null);
  const [suffixModifierId, setSuffixModifierId] = useState<string | null>(initialData?.suffixModifierId ?? null);
  const [suffixAnimalId, setSuffixAnimalId] = useState<string | null>(initialData?.suffixAnimalId ?? null);
  const [customName, setCustomName] = useState(initialData?.customName ?? '');
  const [useCustomName, setUseCustomName] = useState(initialData?.useCustomName ?? false);

  // Get generated name
  const generatedName = generateItemName({ tier, baseTypeId, suffixModifierId, suffixAnimalId });

  // Get base types for selected category
  const filteredBaseTypes = category ? getBaseTypesByCategory(category) : BASE_TYPES;

  // Notify parent of changes
  useEffect(() => {
    onChange({
      tier,
      baseTypeId,
      suffixModifierId,
      suffixAnimalId,
      customName: useCustomName ? customName : generatedName,
      useCustomName,
    });
  }, [tier, baseTypeId, suffixModifierId, suffixAnimalId, customName, useCustomName, generatedName, onChange]);

  // Reset base type when category changes
  useEffect(() => {
    if (category && baseTypeId) {
      const baseType = BASE_TYPES.find(b => b.id === baseTypeId);
      if (baseType && baseType.category !== category) {
        setBaseTypeId(null);
      }
    }
  }, [category, baseTypeId]);

  return (
    <div className="space-y-4">
      {/* Generated/Custom Name Preview */}
      <div className="p-4 bg-background/50 border border-card-border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-muted">Item Name Preview</label>
          <button
            type="button"
            onClick={() => setUseCustomName(!useCustomName)}
            className="text-xs text-accent hover:text-accent-light transition-colors"
          >
            {useCustomName ? 'Use Generated Name' : 'Use Custom Name'}
          </button>
        </div>
        {useCustomName ? (
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Enter custom item name..."
            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
          />
        ) : (
          <p className={`text-lg font-medium ${getTierColorClass(tier)}`}>
            {generatedName || 'Select item options below...'}
          </p>
        )}
      </div>

      {/* Tier Selection */}
      <div>
        <label className="block text-sm text-muted mb-2">Item Tier</label>
        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(TIER_CONFIG) as [ItemTier, typeof TIER_CONFIG.godly][])
            .sort((a, b) => a[1].order - b[1].order)
            .map(([value, config]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTier(value)}
                className={`px-3 py-2 rounded-lg border transition-all ${
                  tier === value
                    ? `${config.bgColor} border-accent ${config.color}`
                    : 'border-card-border text-muted hover:border-accent/50'
                }`}
              >
                {config.label}
              </button>
            ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm text-muted mb-2">Category (optional filter)</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ItemCategory | '')}
          className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-accent"
        >
          <option value="">All Categories</option>
          <option value="weapons">Weapons</option>
          <option value="armor">Armor</option>
          <option value="accessories">Accessories</option>
        </select>
      </div>

      {/* Base Type */}
      <div>
        <label className="block text-sm text-muted mb-2">Base Type *</label>
        <select
          value={baseTypeId ?? ''}
          onChange={(e) => setBaseTypeId(e.target.value || null)}
          className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-accent"
        >
          <option value="">Select base type...</option>
          {filteredBaseTypes.map((bt) => (
            <option key={bt.id} value={bt.id}>
              {bt.name} ({bt.slot})
            </option>
          ))}
        </select>
      </div>

      {/* Suffix Section */}
      <div className="border-t border-card-border pt-4">
        <p className="text-sm text-muted mb-3">
          Suffix: &quot;of the {'{Modifier}'} {'{Animal}'}&quot;
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Modifier */}
          <div>
            <label className="block text-sm text-muted mb-2">Modifier</label>
            <select
              value={suffixModifierId ?? ''}
              onChange={(e) => setSuffixModifierId(e.target.value || null)}
              className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-accent"
            >
              <option value="">None</option>
              {SUFFIX_MODIFIERS.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  {mod.name} ({mod.description})
                </option>
              ))}
            </select>
          </div>

          {/* Animal */}
          <div>
            <label className="block text-sm text-muted mb-2">Animal (Stats)</label>
            <select
              value={suffixAnimalId ?? ''}
              onChange={(e) => setSuffixAnimalId(e.target.value || null)}
              className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-accent"
            >
              <option value="">None</option>
              {SUFFIX_ANIMALS.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.name} ({animal.primaryStat.slice(0, 3).toUpperCase()}/{animal.secondaryStat.slice(0, 3).toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
