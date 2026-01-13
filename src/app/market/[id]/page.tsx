'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, Listing, Profile } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatGold, generateWhisperCommand } from '@/lib/formatters';
import { TIER_CONFIG, ItemTier, getTierColorClass, BASE_TYPES, SUFFIX_ANIMALS, SUFFIX_MODIFIERS, STAT_CONFIG, PrimaryStat } from '@/types/items';
import ItemTooltip from '@/components/market/ItemTooltip';
import EditListingModal from '@/components/market/EditListingModal';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, signInWithDiscord } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [whisperCopied, setWhisperCopied] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  async function fetchListing() {
    const { data, error } = await supabase
      .from('listings')
      .select('*, seller:profiles(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
    } else {
      setListing(data);
      setSeller(data.seller);
    }
    setLoading(false);
  }

  async function handleContact() {
    if (!user || !listing || !seller) return;

    setContacting(true);

    // Check if conversation already exists
    const { data: existingConvo } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listing.id)
      .eq('buyer_id', user.id)
      .single();

    if (!existingConvo) {
      // Create new conversation
      const { error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
        });

      if (error) {
        console.error('Error creating conversation:', error);
        alert('Error starting conversation. Please try again.');
        setContacting(false);
        return;
      }
    }

    // Open chat widget and set active user to seller
    window.dispatchEvent(new CustomEvent('openChatWithUser', { detail: { userId: seller.id } }));
    setContacting(false);
  }

  async function handleMarkSold() {
    if (!listing) return;

    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold', updated_at: new Date().toISOString() })
      .eq('id', listing.id);

    if (error) {
      console.error('Error updating listing:', error);
    } else {
      setListing({ ...listing, status: 'sold' });
    }
  }

  async function handleDelete() {
    if (!listing) return;

    setDeleting(true);
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listing.id);

    if (error) {
      console.error('Error deleting listing:', error);
      setDeleting(false);
      setDeleteModalOpen(false);
    } else {
      router.push('/market');
    }
  }

  async function copyWhisperCommand() {
    if (!seller?.in_game_name) return;

    const command = generateWhisperCommand(seller.in_game_name);
    await navigator.clipboard.writeText(command);
    setWhisperCopied(true);
    setTimeout(() => setWhisperCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
        <Link href="/market" className="text-accent-light hover:text-accent">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === listing.seller_id;
  const isSold = listing.status === 'sold';

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted mb-6">
          <Link href="/market" className="hover:text-foreground transition-colors">Marketplace</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{listing.item_name}</span>
        </nav>

        {/* Status Banner */}
        {isSold && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-center font-semibold">
            This item has been sold
          </div>
        )}

        {/* Main Content */}
        <div className="p-6 rounded-xl bg-card-bg border border-card-border">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {listing.tier && listing.tier !== 'none' && (
                  <span className={`px-2 py-1 text-sm font-medium rounded ${TIER_CONFIG[listing.tier as ItemTier].bgColor} ${TIER_CONFIG[listing.tier as ItemTier].color}`}>
                    {TIER_CONFIG[listing.tier as ItemTier].label}
                  </span>
                )}
                <span className="px-3 py-1 text-sm font-medium rounded-lg bg-accent/20 text-accent-light capitalize">
                  {listing.category}
                </span>
              </div>
              <h1 className={`text-3xl font-bold ${listing.tier ? getTierColorClass(listing.tier as ItemTier) : ''}`}>
                {listing.item_name}
              </h1>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-500">{formatGold(listing.price)}</div>
              {listing.level_requirement && listing.level_requirement > 1 && (
                <p className="text-sm text-muted mt-1">Requires Level {listing.level_requirement}</p>
              )}
            </div>
          </div>

          {/* Game-style Item Tooltip */}
          <div className="flex justify-center mb-6">
            <ItemTooltip
              itemName={listing.item_name}
              tier={(listing.tier as ItemTier) || 'none'}
              baseTypeId={listing.base_type_id}
              suffixAnimalId={listing.suffix_animal_id}
              suffixModifierId={listing.suffix_modifier_id}
              socketCount={listing.socket_count || 0}
              levelRequirement={listing.level_requirement || 1}
              stats={listing.stats}
              equipEffects={listing.equip_effects}
              price={listing.price}
            />
          </div>

          {/* Description */}
          {listing.item_description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted whitespace-pre-wrap">{listing.item_description}</p>
            </div>
          )}

          {/* Seller Info */}
          <div className="p-4 rounded-lg bg-background border border-card-border mb-6">
            <h2 className="text-sm font-semibold text-muted mb-2">Seller</h2>
            <div className="flex items-center gap-3">
              {seller?.avatar_url && (
                <img
                  src={seller.avatar_url}
                  alt={seller.username}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{seller?.username || 'Unknown'}</p>
                {seller?.in_game_name && (
                  <p className="text-sm text-muted">IGN: {seller.in_game_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Options (for non-owners) */}
          {!isOwner && !isSold && user && (
            <div className="p-4 rounded-lg bg-background border border-card-border mb-6">
              <h2 className="text-sm font-semibold text-muted mb-3">Contact Seller</h2>
              <div className="flex flex-wrap gap-3">
                {/* In-app chat */}
                <button
                  onClick={handleContact}
                  disabled={contacting}
                  className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-light disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {contacting ? 'Opening...' : 'Message'}
                </button>

                {/* Whisper command copy */}
                {seller?.in_game_name && (
                  <button
                    onClick={copyWhisperCommand}
                    className="flex items-center gap-2 px-4 py-2 bg-card-border hover:bg-card-border/80 text-foreground text-sm font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    {whisperCopied ? 'Copied!' : 'Copy Whisper'}
                  </button>
                )}

                {/* Discord DM - using seller's Discord ID from profile metadata */}
                {seller && (
                  <a
                    href={`https://discord.com/users/${seller.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Discord DM
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Listing Info */}
          <div className="text-sm text-muted mb-6">
            <p>Listed: {formatDate(listing.created_at)}</p>
            {listing.updated_at !== listing.created_at && (
              <p>Updated: {formatDate(listing.updated_at)}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            {isOwner ? (
              <>
                {!isSold && (
                  <>
                    <button
                      onClick={() => setEditModalOpen(true)}
                      className="px-6 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-lg transition-colors"
                    >
                      Edit Listing
                    </button>
                    <button
                      onClick={handleMarkSold}
                      className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
                    >
                      Mark as Sold
                    </button>
                  </>
                )}
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Delete Listing
                </button>
              </>
            ) : !user ? (
              <button
                onClick={signInWithDiscord}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Sign in to Contact
              </button>
            ) : null}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link
            href="/market"
            className="text-accent-light hover:text-accent transition-colors"
          >
            ← Back to Marketplace
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />

      {/* Edit Listing Modal */}
      {listing && (
        <EditListingModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          listing={listing}
          onUpdate={(updated) => setListing(updated)}
        />
      )}
    </div>
  );
}
