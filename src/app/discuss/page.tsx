'use client';

import { useState } from 'react';
import Link from 'next/link';

const categories = ['All', 'General', 'Builds', 'Tips & Tricks', 'Questions', 'News'];

const sampleDiscussions = [
  {
    id: '1',
    title: 'Best way to farm gold in early game?',
    content: 'I just started playing and I\'m struggling to make enough gold for basic gear. What are the best methods?',
    author_name: 'NewPlayer2024',
    category: 'Questions',
    created_at: '2024-01-10T14:30:00',
    replies_count: 23,
  },
  {
    id: '2',
    title: 'Patch 1.2 First Impressions',
    content: 'The new dungeon is absolutely insane! Has anyone completed it yet? What are your thoughts on the balance changes?',
    author_name: 'VeteranGamer',
    category: 'General',
    created_at: '2024-01-10T10:15:00',
    replies_count: 45,
  },
  {
    id: '3',
    title: 'Hidden quest in the Mystic Forest - Guide',
    content: 'I found a secret quest that most people seem to miss. Here\'s how to trigger it...',
    author_name: 'ExplorerMike',
    category: 'Tips & Tricks',
    created_at: '2024-01-09T18:00:00',
    replies_count: 67,
  },
  {
    id: '4',
    title: 'Looking for raid guild (NA)',
    content: 'Experienced healer looking for an active raid guild. I play most evenings EST.',
    author_name: 'HealerLFG',
    category: 'General',
    created_at: '2024-01-09T12:45:00',
    replies_count: 8,
  },
  {
    id: '5',
    title: 'Warrior vs Rogue for solo content?',
    content: 'Can\'t decide between these two for mainly solo play. Which one handles difficult content better alone?',
    author_name: 'SoloPlayer',
    category: 'Builds',
    created_at: '2024-01-08T20:30:00',
    replies_count: 31,
  },
];

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
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredDiscussions = sampleDiscussions.filter(
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

        {/* Discussions List */}
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

        {filteredDiscussions.length === 0 && (
          <div className="text-center py-12 text-muted">
            <p className="text-lg">No discussions in this category yet</p>
            <p className="text-sm mt-2">Be the first to start one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
