'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, ItemCategory } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { useEscapeKey } from '@/hooks/useHotkeys';
import { formatGoldShort } from '@/lib/formatters';
import { ItemTier, TIER_CONFIG } from '@/types/items';
import StatPicker from '@/components/market/StatPicker';
import SocketSelector from '@/components/market/SocketSelector';

interface StatEntry {
  id: string;
  stat: string;
  value: number;
}

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

  // Item type toggle
  const [isEquipment, setIsEquipment] = useState(true);

  // Basic info
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('weapons');
  const [description, setDescription] = useState('');

  // Price
  const [priceDisplay, setPriceDisplay] = useState('');
  const [price, setPrice] = useState(0);

  // Equipment-specific
  const [tier, setTier] = useState<ItemTier>('none');
  const [socketCount, setSocketCount] = useState(0);
  const [levelRequirement, setLevelRequirement] = useState(1);
  const [stats, setStats] = useState<StatEntry[]>([]);
  const [equipEffects, setEquipEffects] = useState('');

  // Non-equipment (materials, etc.)
  const [quantity, setQuantity] = useState(1);

  useEscapeKey(() => router.push('/market'));

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/market');
    }
  }, [authLoading, user, router]);

  const handlePriceChange = (value: string) => {
    setPriceDisplay(value);
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
      setPrice(Math.floor(numericValue));
    } else {
      setPrice(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (!itemName.trim()) {
      alert('Please enter an item name');
      return;
    }

    if (price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    setSubmitting(true);

    // Convert stats array to object
    const statsObj: Record<string, number> = {};
    stats.forEach(s => {
      if (s.stat && s.value > 0) {
        statsObj[s.stat] = s.value;
      }
    });

    const listingData: Record<string, unknown> = {
      seller_id: user.id,
      item_name: isEquipment ? itemName.trim() : `${itemName.trim()}${quantity > 1 ? ` x${quantity}` : ''}`,
      item_description: description.trim() || null,
      price,
      category,
      status: 'active',
    };

    // Add equipment-specific fields
    if (isEquipment) {
      listingData.tier = tier;
      listingData.socket_count = socketCount;
      listingData.level_requirement = levelRequirement;
      listingData.stats = Object.keys(statsObj).length > 0 ? statsObj : null;
      listingData.equip_effects = equipEffects ? equipEffects.split('\n').filter(e => e.trim()) : null;
    }

    const { data, error } = await supabase
      .from('listings')
      .insert(listingData)
      .select()
      .single();

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
      <div className="max-w-2xl mx-auto">
        <nav className="text-sm text-muted mb-6">
          <Link href="/market" className="hover:text-foreground transition-colors">Marketplace</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">List Item</span>
        </nav>

        <h1 className="text-3xl font-bold mb-2">List an Item</h1>
        <p className="text-muted mb-6">Press ESC to cancel</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Type Toggle */}
          <div className="flex gap-2 p-1 bg-card-border rounded-lg">
            <button
              type="button"
              onClick={() => setIsEquipment(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isEquipment ? 'bg-accent text-white' : 'text-muted hover:text-foreground'
              }`}
            >
              Equipment
            </button>
            <button
              type="button"
              onClick={() => setIsEquipment(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isEquipment ? 'bg-accent text-white' : 'text-muted hover:text-foreground'
              }`}
            >
              Materials / Other
            </button>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Item Name *</label>
            <input
              type="text"
              required
              placeholder={isEquipment ? 'e.g., Godly Breastplate of the Lion' : 'e.g., Keys to the Barracks'}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    category === cat.value
                      ? 'bg-accent border-accent text-white'
                      : 'border-card-border text-muted hover:border-accent/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment-specific fields */}
          {isEquipment && (
            <>
              {/* Tier */}
              <div>
                <label className="block text-sm font-medium mb-2">Tier</label>
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

              {/* Stats */}
              <StatPicker stats={stats} onChange={setStats} />

              {/* Sockets & Level */}
              <div className="grid grid-cols-2 gap-6">
                <SocketSelector value={socketCount} onChange={setSocketCount} />
                <div>
                  <label className="block text-sm font-medium mb-2">Level Requirement</label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={levelRequirement}
                    onChange={(e) => setLevelRequirement(parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Equip Effects */}
              <div>
                <label className="block text-sm font-medium mb-2">Equip Effects (one per line)</label>
                <textarea
                  rows={2}
                  placeholder="+10% Melee Damage&#10;+5 Fire Resistance"
                  value={equipEffects}
                  onChange={(e) => setEquipEffects(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent resize-none"
                />
              </div>
            </>
          )}

          {/* Non-equipment: Quantity */}
          {!isEquipment && (
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-24 px-3 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          )}

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {isEquipment ? 'Price *' : `Price ${quantity > 1 ? '(total)' : ''} *`}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                required
                placeholder="e.g., 50k or 1.5m"
                value={priceDisplay}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
              />
              {price > 0 && (
                <span className="text-accent font-medium whitespace-nowrap">
                  = {formatGoldShort(price)} Gold
                  {!isEquipment && quantity > 1 && (
                    <span className="text-muted text-sm ml-2">
                      ({formatGoldShort(Math.round(price / quantity))}/ea)
                    </span>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-1">Use K for thousands, M for millions</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Additional Notes</label>
            <textarea
              rows={2}
              placeholder="Any additional details..."
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
                In-game: <span className="text-foreground">{profile.in_game_name}</span>
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-8 py-3 bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {submitting ? 'Creating...' : 'List Item'}
            </button>
            <Link
              href="/market"
              className="px-8 py-3 border border-card-border text-muted hover:text-foreground font-semibold rounded-lg transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
