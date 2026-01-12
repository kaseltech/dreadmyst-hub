'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, Discussion } from '@/lib/supabase';

const categories = ['All', 'General', 'Builds', 'Tips & Tricks', 'Questions', 'News'];

function formatTimeAgo(dateString: string) {
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

export default function DiscussPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchDiscussions();
  }, []);

  async function fetchDiscussions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('discussions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching discussions:', error);
    } else {
      setDiscussions(data || []);
    }
    setLoading(false);
  }

  const filteredDiscussions = discussions.filter(
    (d) => selectedCategory === 'All' || d.category === selectedCategory
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Discussions</h1>
            <p className="text-muted">Join the conversation with fellow players</p>
          </div>
          <Link
            href="/discuss/new"
            className="mt-4 md:mt-0 inline-block px-6 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-lg transition-colors"
          >
            + New Topic
          </Link>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-accent text-white'
                  : 'bg-card-bg border border-card-border text-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-muted">
            <p className="text-lg">Loading discussions...</p>
          </div>
        )}

        {/* Discussions List */}
        {!loading && (
          <div className="space-y-3">
            {filteredDiscussions.map((discussion) => (
              <Link
                key={discussion.id}
                href={`/discuss/${discussion.id}`}
                className="block p-4 rounded-xl border border-card-border bg-card-bg hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-accent/20 text-accent-light">
                        {discussion.category}
                      </span>
                      <span className="text-muted text-xs">{formatTimeAgo(discussion.created_at)}</span>
                    </div>
                    <h3 className="font-semibold mb-1 truncate">{discussion.title}</h3>
                    <p className="text-muted text-sm line-clamp-2">{discussion.content}</p>
                    <p className="text-xs text-muted mt-2">by {discussion.author_name}</p>
                  </div>
                  <div className="flex flex-col items-center text-muted">
                    <span className="text-lg">💬</span>
                    <span className="text-sm font-medium">{discussion.replies_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredDiscussions.length === 0 && (
          <div className="text-center py-12 text-muted">
            <p className="text-lg">No discussions in this category yet</p>
            <p className="text-sm mt-2">Be the first to start one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
