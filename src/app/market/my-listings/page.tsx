'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, Listing } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { formatGoldShort, formatTimeAgo } from '@/lib/formatters';
import { ItemTier, TIER_CONFIG } from '@/types/items';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Layers, Swords, Shield, CircleDot, FlaskConical, Package, Sparkles, Check, Trash2, RotateCcw, MoreVertical } from 'lucide-react';

type TabType = 'active' | 'sold';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  all: Layers,
  weapons: Swords,
  armor: Shield,
  accessories: CircleDot,
  consumables: FlaskConical,
  materials: Package,
  other: Sparkles,
};

export default function MyListingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'sold' | 'delete' | null>(null);
  const [processing, setProcessing] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/market');
    }
  }, [user, authLoading, router]);

  // Fetch user's listings
  useEffect(() => {
    if (user) fetchListings();
  }, [user]);

  async function fetchListings() {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  }

  // Filter by tab
  const filteredListings = useMemo(() => {
    return listings.filter(l =>
      activeTab === 'active' ? l.status === 'active' : l.status === 'sold'
    );
  }, [listings, activeTab]);

  const activeCount = listings.filter(l => l.status === 'active').length;
  const soldCount = listings.filter(l => l.status === 'sold').length;

  // Selection handlers
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredListings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredListings.map(l => l.id)));
    }
  };

  // Bulk actions
  const handleBulkMarkSold = async () => {
    setProcessing(true);
    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold', updated_at: new Date().toISOString() })
      .in('id', Array.from(selectedIds));

    if (error) {
      console.error('Error marking as sold:', error);
    } else {
      await fetchListings();
      setSelectedIds(new Set());
    }
    setProcessing(false);
    setBulkAction(null);
  };

  const handleBulkDelete = async () => {
    setProcessing(true);
    const { error } = await supabase
      .from('listings')
      .delete()
      .in('id', Array.from(selectedIds));

    if (error) {
      console.error('Error deleting:', error);
    } else {
      await fetchListings();
      setSelectedIds(new Set());
    }
    setProcessing(false);
    setBulkAction(null);
  };

  const handleRelist = async (id: string) => {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error relisting:', error);
    } else {
      await fetchListings();
    }
  };

  const handleMarkSold = async (id: string) => {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error marking as sold:', error);
    } else {
      await fetchListings();
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Listings</h1>
            <p className="text-muted text-sm">Manage your marketplace listings</p>
          </div>
          <Link
            href="/market"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Layers className="w-4 h-4" />
            Back to Trade
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveTab('active'); setSelectedIds(new Set()); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'active' ? 'text-white' : 'text-muted hover:text-white'
            }`}
            style={activeTab === 'active'
              ? { background: 'linear-gradient(135deg, #a84b08, #d97706)' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => { setActiveTab('sold'); setSelectedIds(new Set()); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'sold' ? 'text-white' : 'text-muted hover:text-white'
            }`}
            style={activeTab === 'sold'
              ? { background: 'linear-gradient(135deg, #16a34a, #22c55e)' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            Sold ({soldCount})
          </button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-4 p-3 mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <span className="text-sm font-medium text-amber-400">
              {selectedIds.size} selected
            </span>
            <div className="flex-1" />
            {activeTab === 'active' && (
              <button
                onClick={() => setBulkAction('sold')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors"
              >
                <Check className="w-4 h-4" />
                Mark Sold
              </button>
            )}
            <button
              onClick={() => setBulkAction('delete')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-muted">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </div>
          </div>
        )}

        {/* Listings Table */}
        {!loading && filteredListings.length > 0 && (
          <div className="rounded-xl border border-card-border overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center gap-4 px-4 py-3 bg-card-bg border-b border-card-border text-xs font-semibold text-muted uppercase tracking-wider">
              <div className="w-8">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredListings.length && filteredListings.length > 0}
                  onChange={selectAll}
                  className="w-4 h-4 rounded border-card-border bg-card-bg text-amber-500 focus:ring-amber-500/50"
                />
              </div>
              <div className="flex-1">Item</div>
              <div className="w-24 text-right">Price</div>
              <div className="w-24 text-right hidden sm:block">Listed</div>
              <div className="w-24 text-right">Actions</div>
            </div>

            {/* Table Body */}
            {filteredListings.map((listing) => {
              const tier = (listing.tier as ItemTier) || 'none';
              const tierConfig = TIER_CONFIG[tier];
              const Icon = categoryIcons[listing.category] || Layers;
              const isSelected = selectedIds.has(listing.id);

              return (
                <div
                  key={listing.id}
                  className={`flex items-center gap-4 px-4 py-3 border-b border-card-border/50 last:border-0 transition-colors ${
                    isSelected ? 'bg-amber-500/5' : 'hover:bg-card-bg/50'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="w-8">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(listing.id)}
                      className="w-4 h-4 rounded border-card-border bg-card-bg text-amber-500 focus:ring-amber-500/50"
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/market/${listing.id}`} className="group">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted flex-shrink-0" />
                        {tier !== 'none' && (
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${tierConfig.bgColor} ${tierConfig.color}`}>
                            {tierConfig.label}
                          </span>
                        )}
                      </div>
                      <p className={`font-medium truncate group-hover:text-amber-400 transition-colors ${tier !== 'none' ? tierConfig.color : ''}`}>
                        {listing.item_name}
                      </p>
                    </Link>
                  </div>

                  {/* Price */}
                  <div className="w-24 text-right">
                    <span className="font-semibold text-yellow-500">{formatGoldShort(listing.price)}</span>
                  </div>

                  {/* Date */}
                  <div className="w-24 text-right hidden sm:block">
                    <span className="text-sm text-muted">{formatTimeAgo(listing.created_at)}</span>
                  </div>

                  {/* Actions */}
                  <div className="w-24 flex justify-end gap-1">
                    {activeTab === 'active' ? (
                      <>
                        <button
                          onClick={() => handleMarkSold(listing.id)}
                          className="p-1.5 rounded-lg text-muted hover:text-green-400 hover:bg-green-500/10 transition-colors"
                          title="Mark as Sold"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/market/${listing.id}`}
                          className="p-1.5 rounded-lg text-muted hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title="View/Edit"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Link>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRelist(listing.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors"
                        title="Relist"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Relist
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredListings.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-card-bg border border-card-border mb-4">
              {activeTab === 'active' ? (
                <Package className="w-8 h-8 text-muted" />
              ) : (
                <Check className="w-8 h-8 text-muted" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {activeTab === 'active' ? 'No active listings' : 'No sold items'}
            </h3>
            <p className="text-muted text-sm mb-4">
              {activeTab === 'active'
                ? 'List an item to start selling!'
                : 'Items you sell will appear here.'}
            </p>
            {activeTab === 'active' && (
              <Link
                href="/market"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, #b45309, #e68a00)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                <Layers className="w-5 h-5" />
                Go to Trade
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Bulk Action Modals */}
      <ConfirmModal
        isOpen={bulkAction === 'sold'}
        onClose={() => setBulkAction(null)}
        onConfirm={handleBulkMarkSold}
        title="Mark as Sold"
        message={`Mark ${selectedIds.size} listing${selectedIds.size > 1 ? 's' : ''} as sold?`}
        confirmText="Mark Sold"
        cancelText="Cancel"
        loading={processing}
      />

      <ConfirmModal
        isOpen={bulkAction === 'delete'}
        onClose={() => setBulkAction(null)}
        onConfirm={handleBulkDelete}
        title="Delete Listings"
        message={`Permanently delete ${selectedIds.size} listing${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={processing}
      />
    </div>
  );
}
