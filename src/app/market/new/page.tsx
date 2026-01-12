'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, ItemCategory } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

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
  const [formData, setFormData] = useState({
    item_name: '',
    item_description: '',
    price: '',
    category: '' as ItemCategory | '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to market if not logged in
      router.push('/market');
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSubmitting(true);

    const { data, error } = await supabase.from('listings').insert({
      seller_id: user.id,
      item_name: formData.item_name,
      item_description: formData.item_description || null,
      price: parseInt(formData.price),
      category: formData.category || 'other',
      status: 'active',
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
      <div className="max-w-2xl mx-auto">
        <nav className="text-sm text-muted mb-6">
          <Link href="/market" className="hover:text-foreground transition-colors">Marketplace</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">List Item</span>
        </nav>

        <h1 className="text-4xl font-bold mb-8">List an Item for Sale</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Item Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., Sword of the Dragon"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ItemCategory })}
              className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground focus:outline-none focus:border-accent"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Price (Gold) *</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g., 50000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-muted mt-1">Enter the amount in gold coins</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              rows={4}
              placeholder="Item stats, condition, or any other details..."
              value={formData.item_description}
              onChange={(e) => setFormData({ ...formData, item_description: e.target.value })}
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

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {submitting ? 'Creating...' : 'List Item'}
            </button>
            <Link
              href="/market"
              className="px-8 py-3 border border-card-border text-muted hover:text-foreground font-semibold rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
