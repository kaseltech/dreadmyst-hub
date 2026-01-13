'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createBrowserClient } from '@supabase/ssr';
import { Listing } from '@/lib/supabase';

// Create fresh client for each fetch to avoid stale connections
function getSupabase() {
  return createBrowserClient(
    'https://vnafrwxtxadddpbnfdgr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYWZyd3h0eGFkZGRwYm5mZGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNjAzMjQsImV4cCI6MjA4MzgzNjMyNH0.fAbkswHI8ex_AxQI7zoIZfR82OCChrMjJDQoadDnaTg'
  );
}
import { useAuth } from '@/components/AuthProvider';
import { useHotkeys } from '@/hooks/useHotkeys';
import MarketplaceFilters, { FilterState, defaultFilters } from '@/components/market/MarketplaceFilters';
import ListingCard from '@/components/market/ListingCard';

// Dynamically import CreateListingModal to avoid bundling the 2.3MB game-data.json on initial load
const CreateListingModal = dynamic(() => import('@/components/market/CreateListingModal'), {
  ssr: false,
  loading: () => null,
});

export default function MarketPage() {
  const router = useRouter();
  const { user, signInWithDiscord } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Hotkey: C to create new listing
  useHotkeys([
    {
      key: 'c',
      handler: () => {
        if (user) {
          setShowCreateModal(true);
        }
      },
      enabled: !!user,
    },
  ]);

  // Fetch all active listings on mount
  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    console.log('[Market] Starting fetch at', new Date().toISOString());
    const startTime = Date.now();

    try {
      // Use fresh client to avoid stale connection issues
      const client = getSupabase();
      const { data, error } = await client
        .from('listings')
        .select('*, seller:profiles(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      console.log('[Market] Fetch completed in', Date.now() - startTime, 'ms');

      if (error) {
        console.error('[Market] Supabase error:', error.message, error.code, error.details);
      } else {
        console.log('[Market] Got', data?.length || 0, 'listings');
        setListings(data || []);
      }
    } catch (err: unknown) {
      console.error('[Market] Exception:', err);
    }

    setLoading(false);
  }

  // Apply all filters client-side for instant feedback
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(listing =>
        listing.item_name.toLowerCase().includes(searchLower) ||
        listing.item_description?.toLowerCase().includes(searchLower)
      );
    }

    // Category
    if (filters.category !== 'all') {
      result = result.filter(listing => listing.category === filters.category);
    }

    // Tier
    if (filters.tier !== 'all') {
      result = result.filter(listing => (listing.tier || 'none') === filters.tier);
    }

    // Stats filter - item must have ALL selected stats
    if (filters.stats.length > 0) {
      result = result.filter(listing => {
        const stats = listing.stats;
        if (!stats) return false;
        return filters.stats.every(stat => stat in stats && stats[stat] > 0);
      });
    }

    // Socket count
    if (filters.minSockets > 0 || filters.maxSockets < 3) {
      result = result.filter(listing => {
        const sockets = listing.socket_count || 0;
        return sockets >= filters.minSockets && sockets <= filters.maxSockets;
      });
    }

    // Price range
    if (filters.minPrice !== null) {
      result = result.filter(listing => listing.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== null) {
      result = result.filter(listing => listing.price <= filters.maxPrice!);
    }

    // Level range
    if (filters.minLevel !== null) {
      result = result.filter(listing => (listing.level_requirement || 1) >= filters.minLevel!);
    }
    if (filters.maxLevel !== null) {
      result = result.filter(listing => (listing.level_requirement || 1) <= filters.maxLevel!);
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'level_low':
          return (a.level_requirement || 1) - (b.level_requirement || 1);
        case 'level_high':
          return (b.level_requirement || 1) - (a.level_requirement || 1);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [listings, filters, user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Trade</h1>
            <p className="text-muted text-sm">Buy and sell items with other players</p>
          </div>
          {user ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, #b45309, #e68a00)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              List Item
              <kbd className="px-1.5 py-0.5 text-xs bg-white/20 rounded ml-1">C</kbd>
            </button>
          ) : (
            <button
              onClick={signInWithDiscord}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Sign in to Sell
            </button>
          )}
        </div>

        {/* Filters */}
        <MarketplaceFilters
          filters={filters}
          onChange={setFilters}
          resultCount={filteredListings.length}
        />

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-muted">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading listings...
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && filteredListings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredListings.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-card-bg border border-card-border mb-4">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1">No listings found</h3>
            <p className="text-muted text-sm mb-4">
              {listings.length === 0
                ? user
                  ? 'Be the first to list an item!'
                  : 'Sign in to list items for sale.'
                : 'Try adjusting your filters to find more items.'}
            </p>
            {listings.length > 0 && (
              <button
                onClick={() => setFilters(defaultFilters)}
                className="text-accent hover:text-accent-light text-sm font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(listingId) => {
          fetchListings(); // Refresh listings
          router.push(`/market/${listingId}`); // Navigate to the new listing
        }}
      />
    </div>
  );
}
