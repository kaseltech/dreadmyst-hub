'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, ItemCategory } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { formatGoldShort } from '@/lib/formatters';
import { ItemTier, TIER_CONFIG } from '@/types/items';
import StatPicker from '@/components/market/StatPicker';
import SocketSelector from '@/components/market/SocketSelector';
import Modal from '@/components/ui/Modal';

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

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (listingId: string) => void;
}

export default function CreateListingModal({ isOpen, onClose, onSuccess }: CreateListingModalProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
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
  const [stats, setStats] = useState<StatEntry[]>([
    { id: '1', stat: 'strength', value: 0 },
    { id: '2', stat: 'agility', value: 0 },
    { id: '3', stat: 'intelligence', value: 0 },
  ]);

  // Non-equipment (materials, etc.)
  const [quantity, setQuantity] = useState(1);
  const [scrollTier, setScrollTier] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setItemName('');
      setCategory('weapons');
      setEquipmentSubtype('');
      setDescription('');
      setPriceDisplay('');
      setPricePerUnit(0);
      setTier('none');
      setSocketCount(0);
      setLevelRequirement(1);
      setStats([
        { id: '1', stat: 'strength', value: 0 },
        { id: '2', stat: 'agility', value: 0 },
        { id: '3', stat: 'intelligence', value: 0 },
      ]);
      setQuantity(1);
      setScrollTier('');
      setIsEquipment(true);
    }
  }, [isOpen]);

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

    if (!itemName.trim()) {
      alert('Please enter an item name');
      return;
    }

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

    // Build item name for materials (include quantity if > 1)
    let finalItemName = itemName.trim();
    if (!isEquipment && quantity > 1) {
      finalItemName = `${finalItemName} x${quantity}`;
    }

    const listingData: Record<string, unknown> = {
      seller_id: user.id,
      item_name: finalItemName,
      item_description: description.trim() || null,
      price: totalPrice,
      category,
      status: 'active',
    };

    // Add equipment-specific fields
    if (isEquipment) {
      listingData.tier = tier;
      listingData.socket_count = socketCount;
      listingData.level_requirement = levelRequirement;
      listingData.stats = Object.keys(statsObj).length > 0 ? statsObj : null;
      if (equipmentSubtype) {
        listingData.equipment_subtype = equipmentSubtype;
      }
    } else {
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
      onClose();
      if (onSuccess) {
        onSuccess(data.id);
      } else {
        router.push(`/market/${data.id}`);
      }
    }
  };

  const subtypeOptions = getSubtypeOptions();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="List an Item" size="2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Item Type Toggle - Segmented Control */}
        <div className="p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setIsEquipment(true)}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all ${
                isEquipment ? 'text-white' : 'text-muted/70 hover:text-white/80'
              }`}
              style={isEquipment ? { background: 'linear-gradient(135deg, #a84b08, #d97706)' } : {}}
            >
              Equipment
            </button>
            <button
              type="button"
              onClick={() => setIsEquipment(false)}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all ${
                !isEquipment ? 'text-white' : 'text-muted/70 hover:text-white/80'
              }`}
              style={!isEquipment ? { background: 'linear-gradient(135deg, #a84b08, #d97706)' } : {}}
            >
              Materials / Keys
            </button>
          </div>
        </div>

        {/* Item Details Section */}
        <div className="p-4 rounded-xl space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted/80">Item Details</h3>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {(isEquipment ? equipmentCategories : materialCategories).map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    category === cat.value ? 'text-white' : 'hover:text-white/80'
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

          {/* Equipment Subtype */}
          {isEquipment && subtypeOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {category === 'weapons' ? 'Type' : 'Slot'}
              </label>
              <select
                value={equipmentSubtype}
                onChange={(e) => setEquipmentSubtype(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e5e5' }}
              >
                <option value="" style={{ background: '#1a1a24', color: '#9ca3af' }}>Select...</option>
                {subtypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} style={{ background: '#1a1a24', color: '#e5e5e5' }}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Item Name *</label>
            <input
              type="text"
              required
              placeholder={isEquipment ? 'e.g., Godly Breastplate of the Lion' : 'e.g., Keys to the Barracks'}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg placeholder:text-muted/50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e5e5' }}
            />
          </div>
        </div>

        {/* Equipment Properties */}
        {isEquipment && (
          <div className="p-4 rounded-xl space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted/80">Equipment Properties</h3>

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
                        className="px-2 py-1.5 rounded-lg transition-all text-xs font-medium"
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
            <div className="grid grid-cols-2 gap-4">
              <SocketSelector value={socketCount} onChange={setSocketCount} />
              <div>
                <label className="block text-sm font-medium mb-2">Level Req</label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={levelRequirement}
                  onChange={(e) => setLevelRequirement(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e5e5' }}
                />
              </div>
            </div>

          </div>
        )}

        {/* Consumable Properties */}
        {!isEquipment && category === 'consumables' && (
          <div className="p-4 rounded-xl space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted/80">Consumable Properties</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Scroll Tier</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setScrollTier('')}
                  className="px-2 py-1 rounded-lg text-xs font-medium transition-all"
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
                    className="px-2 py-1 rounded-lg text-xs font-medium transition-all"
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

        {/* Pricing Section */}
        <div className="p-4 rounded-xl space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted/80">
            {!isEquipment ? 'Quantity & Pricing' : 'Pricing'}
          </h3>

          {/* Quantity for non-equipment */}
          {!isEquipment && (
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e5e5' }}
              />
            </div>
          )}

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {!isEquipment && quantity > 1 ? 'Price Each *' : 'Price *'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                required
                placeholder="e.g., 50k or 1.5m"
                value={priceDisplay}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg placeholder:text-muted/50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e5e5' }}
              />
              {pricePerUnit > 0 && (
                <span className="text-amber-500 font-semibold text-sm whitespace-nowrap">
                  {!isEquipment && quantity > 1 ? `${formatGoldShort(pricePerUnit)}/ea` : `= ${formatGoldShort(pricePerUnit)} Gold`}
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-1">Use K for thousands, M for millions</p>
          </div>

          {/* Total for materials */}
          {!isEquipment && pricePerUnit > 0 && quantity > 1 && (
            <div className="p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">
                  {quantity}x @ {formatGoldShort(pricePerUnit)} each
                </span>
                <span className="text-lg font-bold text-amber-500">
                  = {formatGoldShort(totalPrice)} Gold
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Notes (optional)</label>
          <textarea
            rows={2}
            placeholder="Any additional details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg placeholder:text-muted/50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
            style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e5e5' }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: submitting ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #b45309, #e68a00)',
              boxShadow: submitting ? 'none' : '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            {submitting ? 'Creating...' : 'List Item'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-muted hover:text-foreground font-semibold rounded-lg transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.10)' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
