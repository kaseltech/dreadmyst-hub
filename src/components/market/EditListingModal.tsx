'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { supabase, Listing } from '@/lib/supabase';
import { formatGoldShort } from '@/lib/formatters';
import { ItemTier, TIER_CONFIG } from '@/types/items';

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onUpdate: (updated: Listing) => void;
}

export default function EditListingModal({
  isOpen,
  onClose,
  listing,
  onUpdate,
}: EditListingModalProps) {
  const [saving, setSaving] = useState(false);
  const [itemName, setItemName] = useState(listing.item_name);
  const [priceDisplay, setPriceDisplay] = useState('');
  const [price, setPrice] = useState(listing.price);
  const [tier, setTier] = useState<ItemTier>((listing.tier as ItemTier) || 'none');
  const [socketCount, setSocketCount] = useState(listing.socket_count || 0);
  const [levelRequirement, setLevelRequirement] = useState(listing.level_requirement || 1);
  const [description, setDescription] = useState(listing.item_description || '');

  // Initialize price display
  useEffect(() => {
    setPriceDisplay(formatGoldShort(listing.price));
    setPrice(listing.price);
    setItemName(listing.item_name);
    setTier((listing.tier as ItemTier) || 'none');
    setSocketCount(listing.socket_count || 0);
    setLevelRequirement(listing.level_requirement || 1);
    setDescription(listing.item_description || '');
  }, [listing]);

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
    }
  };

  const handleSave = async () => {
    if (!itemName.trim() || price <= 0) return;

    setSaving(true);

    const { data, error } = await supabase
      .from('listings')
      .update({
        item_name: itemName.trim(),
        item_description: description.trim() || null,
        price,
        tier,
        socket_count: socketCount,
        level_requirement: levelRequirement,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating listing:', error);
      alert('Failed to update listing. Please try again.');
    } else {
      onUpdate(data);
      onClose();
    }

    setSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Listing" size="md">
      <div className="space-y-4">
        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Item Name</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={priceDisplay}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="e.g., 50k or 1.5m"
              className="flex-1 px-3 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-accent"
            />
            <span className="text-sm text-muted">= {formatGoldShort(price)} Gold</span>
          </div>
        </div>

        {/* Tier */}
        <div>
          <label className="block text-sm font-medium mb-1">Tier</label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(TIER_CONFIG) as [ItemTier, typeof TIER_CONFIG.godly][])
              .sort((a, b) => a[1].order - b[1].order)
              .map(([value, config]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTier(value)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all ${
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

        {/* Sockets & Level */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sockets</label>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setSocketCount(count)}
                  className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all ${
                    socketCount === count
                      ? 'bg-accent border-accent text-white'
                      : 'border-card-border text-muted hover:border-accent/50'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level Req.</label>
            <input
              type="number"
              min="1"
              max="25"
              value={levelRequirement}
              onChange={(e) => setLevelRequirement(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional notes..."
            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-card-border">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-accent hover:bg-accent-light disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
