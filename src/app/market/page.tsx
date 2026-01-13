'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, Listing, ItemCategory } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { useHotkeys } from '@/hooks/useHotkeys';
import { formatGoldShort, formatTimeAgo } from '@/lib/formatters';
import { ItemTier, TIER_CONFIG, getTierColorClass } from '@/types/items';

const categories: { value: ItemCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Items' },
  { value: 'weapons', label: 'Weapons' },
  { value: 'armor', label: 'Armor' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'consumables', label: 'Consumables' },
  { value: 'materials', label: 'Materials' },
  { value: 'other', label: 'Other' },
];

const tiers: { value: ItemTier | 'all'; label: string }[] = [
  { value: 'all', label: 'All Tiers' },
  { value: 'godly', label: 'Godly' },
  { value: 'holy', label: 'Holy' },
  { value: 'blessed', label: 'Blessed' },
  { value: 'none', label: 'Normal' },
];

export default function MarketPage() {
  const router = useRouter();
  const { user, signInWithDiscord } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<ItemCategory | 'all'>('all');
  const [tier, setTier] = useState<ItemTier | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');

  // Hotkey: C to create new listing
  useHotkeys([
    {
      key: 'c',
      handler: () => {
        if (user) {
          router.push('/market/new');
        }
      },
      enabled: !!user,
    },
  ]);

  useEffect(() => {
    fetchListings();
  }, [category, tier, sortBy]);

  async function fetchListings() {
    setLoading(true);
    let query = supabase
      .from('listings')
      .select('*, seller:profiles(*)')
      .eq('status', 'active');

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    if (tier !== 'all') {
      query = query.eq('tier', tier);
    }

    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'price_low') {
      query = query.order('price', { ascending: true });
    } else {
      query = query.order('price', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching listings:', error);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  }

  const filteredListings = listings.filter((listing) =>
    listing.item_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
            <p className="text-muted">Buy and sell items with other players</p>
          </div>
          {user ? (
            <Link
              href="/market/new"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-lg transition-colors"
            >
              + List Item
              <kbd className="px-1.5 py-0.5 text-xs bg-white/20 rounded">C</kbd>
            </Link>
          ) : (
            <button
              onClick={signInWithDiscord}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Sign in to Sell
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 p-4 rounded-lg bg-card-bg border border-card-border">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-card-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  category === cat.value
                    ? 'bg-accent text-white'
                    : 'bg-card-border text-muted hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Tier Filter */}
          <div className="flex flex-wrap gap-2">
            {tiers.map((t) => (
              <button
                key={t.value}
                onClick={() => setTier(t.value)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  tier === t.value
                    ? t.value === 'all'
                      ? 'bg-accent text-white'
                      : `${TIER_CONFIG[t.value as ItemTier].bgColor} ${TIER_CONFIG[t.value as ItemTier].color}`
                    : 'bg-card-border text-muted hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 rounded-lg bg-card-border text-foreground border-none focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-muted">
            <p className="text-lg">Loading listings...</p>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => {
              const listingTier = (listing.tier as ItemTier) || 'none';
              return (
                <Link
                  key={listing.id}
                  href={`/market/${listing.id}`}
                  className="block p-4 rounded-xl border border-card-border bg-card-bg hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {listingTier !== 'none' && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${TIER_CONFIG[listingTier].bgColor} ${TIER_CONFIG[listingTier].color}`}>
                          {TIER_CONFIG[listingTier].label}
                        </span>
                      )}
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-accent/20 text-accent-light capitalize">
                        {listing.category}
                      </span>
                    </div>
                    <span className="text-xs text-muted">{formatTimeAgo(listing.created_at)}</span>
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${getTierColorClass(listingTier)}`}>
                    {listing.item_name}
                  </h3>
                  {listing.item_description && (
                    <p className="text-muted text-sm mb-3 line-clamp-2">{listing.item_description}</p>
                  )}
                  {/* Socket indicators */}
                  {listing.socket_count > 0 && (
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: listing.socket_count }).map((_, i) => (
                        <div key={i} className="w-4 h-4 rounded-full border border-accent/50 bg-accent/20" />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-card-border">
                    <span className="text-xl font-bold text-yellow-500">{formatGoldShort(listing.price)}g</span>
                    <span className="text-sm text-muted">
                      by {listing.seller?.username || 'Unknown'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filteredListings.length === 0 && (
          <div className="text-center py-12 text-muted">
            <p className="text-lg">No listings found</p>
            <p className="text-sm mt-2">
              {user ? 'Be the first to list an item!' : 'Sign in to list items for sale.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
