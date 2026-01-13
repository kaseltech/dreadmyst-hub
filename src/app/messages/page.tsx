'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, Conversation } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithDiscord } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchConversations();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  async function fetchConversations() {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, listing:listings(*), buyer:profiles!conversations_buyer_id_fkey(*), seller:profiles!conversations_seller_id_fkey(*)')
      .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
    } else {
      setConversations(data || []);
    }
    setLoading(false);
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Messages</h1>
          <p className="text-muted mb-6">Sign in to view your messages</p>
          <button
            onClick={signInWithDiscord}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Sign in with Discord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Messages</h1>
        <p className="text-muted mb-8">Your conversations about marketplace listings</p>

        {conversations.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-xl bg-card-bg border border-card-border">
            <p className="text-lg text-muted mb-2">No messages yet</p>
            <p className="text-sm text-muted mb-4">
              Start a conversation by contacting a seller on the marketplace
            </p>
            <Link
              href="/market"
              className="inline-block px-6 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-lg transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((convo) => {
              const otherUser = convo.buyer_id === user.id ? convo.seller : convo.buyer;
              const isBuyer = convo.buyer_id === user.id;

              return (
                <Link
                  key={convo.id}
                  href={`/messages/${convo.id}`}
                  className="block p-4 rounded-xl border border-card-border bg-card-bg hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {otherUser?.avatar_url && (
                      <img
                        src={otherUser.avatar_url}
                        alt={otherUser.username}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="font-semibold">{otherUser?.username || 'Unknown'}</span>
                          {otherUser?.in_game_name && (
                            <span className="text-xs text-accent ml-2">IGN: {otherUser.in_game_name}</span>
                          )}
                        </div>
                        <span className="text-xs text-muted">{formatTimeAgo(convo.updated_at)}</span>
                      </div>
                      <p className="text-sm text-muted truncate">
                        Re: {convo.listing?.item_name || 'Unknown Item'}
                      </p>
                      <span className="text-xs text-accent-light">
                        {isBuyer ? 'You are buying' : 'You are selling'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
