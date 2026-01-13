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

// Equipment categories only
const equipmentCategories: { value: ItemCategory; label: string }[] = [
  { value: 'weapons', label: 'Weapons' },
  { value: 'armor', label: 'Armor' },
  { value: 'accessories', label: 'Accessories' },
];

// Non-equipment categories
const materialCategories: { value: ItemCategory; label: string }[] = [
  { value: 'consumables', label: 'Consumables' },
  { value: 'materials', label: 'Materials' },
  { value: 'other', label: 'Keys / Other' },
];

// Scroll/consumable tiers (I-V)
const scrollTiers = [
  { value: '1', label: 'Tier I' },
  { value: '2', label: 'Tier II' },
  { value: '3', label: 'Tier III' },
  { value: '4', label: 'Tier IV' },
  { value: '5', label: 'Tier V' },
];

// Equipment subtypes
const weaponTypes = [
  { value: 'sword', label: 'Sword' },
  { value: 'dagger', label: 'Dagger' },
  { value: 'axe', label: 'Axe' },
  { value: 'mace', label: 'Mace' },
  { value: 'staff', label: 'Staff' },
  { value: 'wand', label: 'Wand' },
  { value: 'bow', label: 'Bow' },
  { value: 'shield', label: 'Shield' },
];

const armorSlots = [
  { value: 'helm', label: 'Helm' },
  { value: 'chest', label: 'Chest' },
  { value: 'hands', label: 'Hands' },
  { value: 'legs', label: 'Legs' },
  { value: 'feet', label: 'Feet' },
];

const accessorySlots = [
  { value: 'neck', label: 'Neck' },
  { value: 'ring', label: 'Ring' },
  { value: 'belt', label: 'Belt' },
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
  const [equipmentSubtype, setEquipmentSubtype] = useState('');
  const [description, setDescription] = useState('');

  // Price - for materials this is price per item
  const [priceDisplay, setPriceDisplay] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState(0);

  // Equipment-specific
  const [tier, setTier] = useState<ItemTier>('none');
  const [socketCount, setSocketCount] = useState(0);
  const [levelRequirement, setLevelRequirement] = useState(1);
  // Initialize with empty stats
  const [stats, setStats] = useState<StatEntry[]>([]);
  const [equipEffects, setEquipEffects] = useState('');

  // Non-equipment (materials, etc.)
  const [quantity, setQuantity] = useState(1);
  const [scrollTier, setScrollTier] = useState('');

  useEscapeKey(() => router.push('/market'));

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/market');
    }
  }, [authLoading, user, router]);

  // Reset subtype when category changes
  useEffect(() => {
    setEquipmentSubtype('');
  }, [category]);

  // Reset category when switching modes
  useEffect(() => {
    if (isEquipment) {
      setCategory('weapons');
    } else {
      setCategory('materials');
    }
    setEquipmentSubtype('');
  }, [isEquipment]);

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
      setPricePerUnit(Math.floor(numericValue));
    } else {
      setPricePerUnit(0);
    }
  };

  // Calculate total price for materials
  const totalPrice = isEquipment ? pricePerUnit : pricePerUnit * quantity;

  const getSubtypeOptions = () => {
    switch (category) {
      case 'weapons':
        return weaponTypes;
      case 'armor':
        return armorSlots;
      case 'accessories':
        return accessorySlots;
      default:
        return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (pricePerUnit <= 0) {
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

    // Build item name
    let finalItemName = itemName.trim();

    // For equipment: auto-generate name if not provided
    if (isEquipment && !finalItemName) {
      const tierLabel = tier !== 'none' ? TIER_CONFIG[tier].label + ' ' : '';
      const subtypeName = getSubtypeOptions().find(o => o.value === equipmentSubtype)?.label || category;
      finalItemName = `${tierLabel}${subtypeName}`.trim();
    }

    // For materials: include quantity if > 1
    if (!isEquipment && quantity > 1) {
      finalItemName = `${finalItemName} x${quantity}`;
    }

    const listingData: Record<string, unknown> = {
      seller_id: user.id,
      item_name: finalItemName,
      item_description: description.trim() || null,
      price: totalPrice, // Store total price in DB
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
      if (equipmentSubtype) {
        listingData.equipment_subtype = equipmentSubtype;
      }
    } else {
      // Non-equipment fields
      if (scrollTier) {
        listingData.scroll_tier = parseInt(scrollTier);
      }
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

  const subtypeOptions = getSubtypeOptions();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <nav className="text-sm text-muted mb-6">
          <Link href="/market" className="hover:text-foreground transition-colors">Trade</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">List Item</span>
        </nav>

        <h1 className="text-3xl font-bold mb-2">List an Item</h1>
        <p className="text-muted mb-8">Press ESC to cancel</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Type Toggle - Segmented Control */}
          <div className="p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setIsEquipment(true)}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all ${
                  isEquipment
                    ? 'text-white'
                    : 'text-muted/70 hover:text-white/80'
                }`}
                style={isEquipment ? { background: 'linear-gradient(135deg, #a84b08, #d97706)' } : {}}
              >
                Equipment
              </button>
              <button
                type="button"
                onClick={() => setIsEquipment(false)}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all ${
                  !isEquipment
                    ? 'text-white'
                    : 'text-muted/70 hover:text-white/80'
                }`}
                style={!isEquipment ? { background: 'linear-gradient(135deg, #a84b08, #d97706)' } : {}}
              >
                Materials / Keys / Other
              </button>
            </div>
          </div>

          {/* Item Details Section */}
          <div className="p-5 rounded-xl space-y-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted/80">Item Details</h2>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {(isEquipment ? equipmentCategories : materialCategories).map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      category === cat.value
                        ? 'text-white'
                        : 'hover:text-white/80'
                    }`}
                    style={category === cat.value
                      ? { background: 'linear-gradient(135deg, #a84b08, #d97706)', border: '1px solid transparent' }
                      : { background: 'transparent', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.65)' }
                    }
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment Subtype Dropdown */}
            {isEquipment && subtypeOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {category === 'weapons' ? 'Weapon Type' : category === 'armor' ? 'Armor Slot' : 'Accessory Type'}
                </label>
                <select
                  value={equipmentSubtype}
                  onChange={(e) => setEquipmentSubtype(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <option value="">Select {category === 'weapons' ? 'weapon type' : 'slot'}...</option>
                  {subtypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Item Name - Optional for equipment, required for non-equipment */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Item Name {!isEquipment && '*'}
                {isEquipment && <span className="text-muted/50 font-normal ml-1">(optional)</span>}
              </label>
              <input
                type="text"
                required={!isEquipment}
                placeholder={isEquipment ? 'Will auto-generate based on properties' : 'e.g., Keys to the Barracks'}
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              />
              {isEquipment && (
                <p className="text-xs text-muted/50 mt-1">Leave blank to use tier + subtype as the name</p>
              )}
            </div>
          </div>

          {/* Equipment Properties Section */}
          {isEquipment && (
            <div className="p-5 rounded-xl space-y-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted/80">Equipment Properties</h2>

              {/* Tier */}
              <div>
                <label className="block text-sm font-medium mb-2">Tier</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(TIER_CONFIG) as [ItemTier, typeof TIER_CONFIG.godly][])
                    .sort((a, b) => a[1].order - b[1].order)
                    .map(([value, config]) => {
                      const isActive = tier === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setTier(value)}
                          className="px-3 py-2 rounded-lg transition-all text-sm font-medium"
                          style={isActive
                            ? { background: `rgba(245,158,11,0.08)`, border: `1px solid ${config.hexColor}`, color: config.hexColor }
                            : { background: 'transparent', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.60)' }
                          }
                        >
                          {config.label}
                        </button>
                      );
                    })}
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
                    className="w-24 px-3 py-2 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  />
                </div>
              </div>

              {/* Equip Effects */}
              <div>
                <label className="block text-sm font-medium mb-2">Equip Effects (one per line)</label>
                <textarea
                  rows={2}
                  placeholder={"+10% Melee Damage\n+5 Fire Resistance"}
                  value={equipEffects}
                  onChange={(e) => setEquipEffects(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              </div>
            </div>
          )}

          {/* Pricing Section */}
          {isEquipment && (
            <div className="p-5 rounded-xl space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted/80">Pricing</h2>
              <div>
                <label className="block text-sm font-medium mb-2">Price *</label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    required
                    placeholder="e.g., 50k or 1.5m"
                    value={priceDisplay}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  />
                  {pricePerUnit > 0 && (
                    <span className="text-amber-500 font-semibold whitespace-nowrap">
                      = {formatGoldShort(pricePerUnit)} Gold
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-1.5">Use K for thousands, M for millions</p>
              </div>
            </div>
          )}

          {/* Non-equipment: Quantity and Price */}
          {!isEquipment && (
            <>
              {/* Scroll Tier (for consumables) */}
              {category === 'consumables' && (
                <div className="p-5 rounded-xl space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted/80">Consumable Properties</h2>
                  <div>
                    <label className="block text-sm font-medium mb-2">Scroll Tier (optional)</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setScrollTier('')}
                        className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                        style={scrollTier === ''
                          ? { background: 'linear-gradient(135deg, #a84b08, #d97706)', border: '1px solid transparent', color: '#fff' }
                          : { background: 'transparent', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.60)' }
                        }
                      >
                        None
                      </button>
                      {scrollTiers.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setScrollTier(t.value)}
                          className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                          style={scrollTier === t.value
                            ? { background: 'rgba(6, 182, 212, 0.15)', border: '1px solid #06b6d4', color: '#22d3ee' }
                            : { background: 'transparent', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.60)' }
                          }
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing Section for Materials */}
              <div className="p-5 rounded-xl space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted/80">Quantity & Pricing</h2>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-3 py-2 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  />
                </div>

                {/* Price Per Item */}
                <div>
                  <label className="block text-sm font-medium mb-2">Price Each *</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      required
                      placeholder="e.g., 50k or 1.5m"
                      value={priceDisplay}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    />
                    {pricePerUnit > 0 && (
                      <span className="text-amber-500 font-semibold whitespace-nowrap">
                        {formatGoldShort(pricePerUnit)}/ea
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1.5">Use K for thousands, M for millions</p>
                </div>

                {/* Total Price Display */}
                {pricePerUnit > 0 && quantity > 1 && (
                  <div className="p-4 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">
                        {quantity}x @ {formatGoldShort(pricePerUnit)} each
                      </span>
                      <span className="text-xl font-bold text-amber-500">
                        = {formatGoldShort(totalPrice)} Gold Total
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Additional Info Section */}
          <div className="p-5 rounded-xl space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted/80">Additional Info</h2>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes (optional)</label>
              <textarea
                rows={2}
                placeholder="Any additional details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              />
            </div>

            {/* Seller Info */}
            <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm text-muted">
                Listing as: <span className="text-foreground font-medium">{profile?.in_game_name || profile?.username}</span>
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-8 py-3.5 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: submitting ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #b45309, #e68a00)',
                boxShadow: submitting ? 'none' : '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              {submitting ? 'Creating...' : 'List Item'}
            </button>
            <Link
              href="/market"
              className="px-8 py-3.5 text-muted hover:text-foreground font-semibold rounded-lg transition-colors text-center"
              style={{ border: '1px solid rgba(255,255,255,0.10)' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
