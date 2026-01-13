'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, ItemCategory } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { useEscapeKey } from '@/hooks/useHotkeys';
import ItemBuilder, { ItemBuilderData } from '@/components/market/ItemBuilder';
import SocketSelector from '@/components/market/SocketSelector';
import { formatGoldShort } from '@/lib/formatters';
import { STAT_CONFIG, PrimaryStat, ItemStats } from '@/types/items';

const categories: { value: ItemCategory; label: string }[] = [
  { value: 'weapons', label: 'Weapons' },
  { value: 'armor', label: 'Armor' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'consumables', label: 'Consumables' },
  { value: 'materials', label: 'Materials' },
  { value: 'other', label: 'Other' },
];

export default function NewListingPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signInWithDiscord } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<'item' | 'stats' | 'price'>('item');

  // Item builder data
  const [itemData, setItemData] = useState<ItemBuilderData>({
    tier: 'none',
    baseTypeId: null,
    suffixModifierId: null,
    suffixAnimalId: null,
    customName: '',
    useCustomName: false,
  });

  // Additional item properties
  const [socketCount, setSocketCount] = useState(0);
  const [levelRequirement, setLevelRequirement] = useState(1);
  const [stats, setStats] = useState<ItemStats>({});
  const [equipEffects, setEquipEffects] = useState('');

  // Listing data
  const [category, setCategory] = useState<ItemCategory | ''>('');
  const [price, setPrice] = useState('');
  const [priceDisplay, setPriceDisplay] = useState('');
  const [description, setDescription] = useState('');

  // Handle ESC to go back
  useEscapeKey(() => router.push('/market'));

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/market');
    }
  }, [authLoading, user, router]);

  // Handle item builder changes
  const handleItemChange = useCallback((data: ItemBuilderData) => {
    setItemData(data);
  }, []);

  // Parse price input with K/M shortcuts
  const handlePriceChange = (value: string) => {
    setPriceDisplay(value);

    // Parse K and M suffixes
    const cleaned = value.trim().toLowerCase();
    let numericValue = 0;

    if (cleaned.endsWith('m')) {
      numericValue = parseFloat(cleaned.slice(0, -1)) * 1000000;
    } else if (cleaned.endsWith('k')) {
      numericValue = parseFloat(cleaned.slice(0, -1)) * 1000;
    } else {
      numericValue = parseFloat(cleaned.replace(/,/g, ''));
    }

    if (!isNaN(numericValue) && numericValue > 0) {
      setPrice(Math.floor(numericValue).toString());
    } else {
      setPrice('');
    }
  };

  // Update stat value
  const handleStatChange = (stat: PrimaryStat, value: string) => {
    const numValue = parseInt(value);
    if (value === '' || isNaN(numValue)) {
      const newStats = { ...stats };
      delete newStats[stat];
      setStats(newStats);
    } else {
      setStats({ ...stats, [stat]: numValue });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    // Validate
    if (!itemData.customName && !itemData.baseTypeId) {
      alert('Please select a base item type or enter a custom name');
      return;
    }

    if (!price) {
      alert('Please enter a valid price');
      return;
    }

    setSubmitting(true);

    // Determine category from base type if not selected
    let finalCategory = category;
    if (!finalCategory && itemData.baseTypeId) {
      const baseTypes = await import('@/types/items').then(m => m.BASE_TYPES);
      const baseType = baseTypes.find(b => b.id === itemData.baseTypeId);
      if (baseType) {
        finalCategory = baseType.category as ItemCategory;
      }
    }

    const { data, error } = await supabase.from('listings').insert({
      seller_id: user.id,
      item_name: itemData.customName,
      item_description: description || null,
      price: parseInt(price),
      category: finalCategory || 'other',
      status: 'active',
      // New structured fields
      tier: itemData.tier,
      base_type_id: itemData.baseTypeId,
      suffix_modifier_id: itemData.suffixModifierId,
      suffix_animal_id: itemData.suffixAnimalId,
      socket_count: socketCount,
      level_requirement: levelRequirement,
      stats: Object.keys(stats).length > 0 ? stats : null,
      equip_effects: equipEffects ? equipEffects.split('\n').filter(e => e.trim()) : null,
    }).select().single();

    if (error) {
      console.error('Error creating listing:', error);
      alert('Error creating listing. Please try again.');
      setSubmitting(false);
    } else {
      router.push(`/market/${data.id}`);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in to list items</h1>
        <button
          onClick={signInWithDiscord}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg transition-colors"
        >
          Sign in with Discord
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <nav className="text-sm text-muted mb-6">
          <Link href="/market" className="hover:text-foreground transition-colors">Marketplace</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">List Item</span>
        </nav>

        <h1 className="text-4xl font-bold mb-2">List an Item for Sale</h1>
        <p className="text-muted mb-8">Press ESC to cancel</p>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-8 border-b border-card-border">
          {[
            { id: 'item', label: 'Item Details' },
            { id: 'stats', label: 'Stats & Sockets' },
            { id: 'price', label: 'Price & Description' },
          ].map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id as 'item' | 'stats' | 'price')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                activeSection === section.id
                  ? 'border-accent text-foreground'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Item Details */}
          {activeSection === 'item' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <ItemBuilder onChange={handleItemChange} initialData={itemData} />

              {/* Category Override */}
              <div>
                <label className="block text-sm text-muted mb-2">Category Override</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                >
                  <option value="">Auto-detect from base type</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Section: Stats & Sockets */}
          {activeSection === 'stats' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Socket Selector */}
              <SocketSelector value={socketCount} onChange={setSocketCount} />

              {/* Level Requirement */}
              <div>
                <label className="block text-sm text-muted mb-2">Level Requirement</label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={levelRequirement}
                  onChange={(e) => setLevelRequirement(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              {/* Stats */}
              <div>
                <label className="block text-sm text-muted mb-3">Primary Stats</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(Object.entries(STAT_CONFIG) as [PrimaryStat, typeof STAT_CONFIG.strength][]).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${config.color} w-10`}>{config.abbrev}</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={stats[key] ?? ''}
                        onChange={(e) => handleStatChange(key, e.target.value)}
                        className="flex-1 px-3 py-2 bg-background border border-card-border rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Equip Effects */}
              <div>
                <label className="block text-sm text-muted mb-2">Equip Effects (one per line)</label>
                <textarea
                  rows={3}
                  placeholder="+10% Melee Damage&#10;+5 Fire Resistance&#10;+2% Movement Speed"
                  value={equipEffects}
                  onChange={(e) => setEquipEffects(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent resize-none"
                />
              </div>
            </div>
          )}

          {/* Section: Price & Description */}
          {activeSection === 'price' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-2">Price (Gold) *</label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    required
                    placeholder="e.g., 50k or 1.5m"
                    value={priceDisplay}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                  />
                  {price && (
                    <span className="text-accent font-medium">
                      = {formatGoldShort(parseInt(price))} Gold
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-1">Use K for thousands, M for millions (e.g., 50k, 1.5m)</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Additional Description</label>
                <textarea
                  rows={4}
                  placeholder="Any additional notes about the item, trade terms, etc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
                />
              </div>

              {/* Seller Info */}
              <div className="p-4 rounded-lg bg-card-bg border border-card-border">
                <p className="text-sm text-muted">
                  Listing as: <span className="text-foreground font-medium">{profile?.username}</span>
                </p>
                {profile?.in_game_name && (
                  <p className="text-sm text-muted">
                    In-game name: <span className="text-foreground">{profile.in_game_name}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation & Submit */}
          <div className="flex items-center justify-between pt-6 border-t border-card-border">
            <div className="flex gap-2">
              {activeSection !== 'item' && (
                <button
                  type="button"
                  onClick={() => setActiveSection(activeSection === 'price' ? 'stats' : 'item')}
                  className="px-6 py-3 border border-card-border text-muted hover:text-foreground font-medium rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex gap-4">
              <Link
                href="/market"
                className="px-6 py-3 border border-card-border text-muted hover:text-foreground font-medium rounded-lg transition-colors"
              >
                Cancel
              </Link>

              {activeSection !== 'price' ? (
                <button
                  type="button"
                  onClick={() => setActiveSection(activeSection === 'item' ? 'stats' : 'price')}
                  className="px-6 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-lg transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {submitting ? 'Creating...' : 'List Item'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
