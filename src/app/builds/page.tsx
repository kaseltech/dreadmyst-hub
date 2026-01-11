'use client';

import { useState } from 'react';
import Link from 'next/link';

// Sample data - would come from Supabase in production
const sampleBuilds = [
  {
    id: '1',
    title: 'Shadow Assassin - Max Crit DPS',
    class_name: 'Rogue',
    author_name: 'ShadowMaster99',
    description: 'High burst damage build focusing on critical strikes and stealth. Perfect for PvE content.',
    upvotes: 142,
    tags: ['PvE', 'DPS', 'Beginner-Friendly'],
    created_at: '2024-01-10',
  },
  {
    id: '2',
    title: 'Immortal Tank - Never Die Build',
    class_name: 'Warrior',
    author_name: 'TankGod',
    description: 'Maximum survivability tank build. Great for soloing difficult content and protecting your team.',
    upvotes: 98,
    tags: ['Tank', 'Solo', 'Endgame'],
    created_at: '2024-01-09',
  },
  {
    id: '3',
    title: 'AoE Fire Mage - Speed Clear',
    class_name: 'Mage',
    author_name: 'PyroQueen',
    description: 'Fast clearing build with massive AoE damage. Melts through dungeons.',
    upvotes: 87,
    tags: ['PvE', 'AoE', 'Speed'],
    created_at: '2024-01-08',
  },
  {
    id: '4',
    title: 'Holy Healer - Raid Ready',
    class_name: 'Healer',
    author_name: 'HealBot3000',
    description: 'Optimized raid healing build with emergency cooldowns and mana efficiency.',
    upvotes: 65,
    tags: ['Healer', 'Raid', 'Support'],
    created_at: '2024-01-07',
  },
];

const classes = ['All', 'Warrior', 'Mage', 'Rogue', 'Healer'];

export default function BuildsPage() {
  const [selectedClass, setSelectedClass] = useState('All');
  const [sortBy, setSortBy] = useState('upvotes');

  const filteredBuilds = sampleBuilds
    .filter((build) => selectedClass === 'All' || build.class_name === selectedClass)
    .sort((a, b) => {
      if (sortBy === 'upvotes') return b.upvotes - a.upvotes;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Character Builds</h1>
            <p className="text-muted">Community-created builds for every playstyle</p>
          </div>
          <Link
            href="/builds/new"
            className="mt-4 md:mt-0 inline-block px-6 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-lg transition-colors"
          >
            + Submit Build
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 rounded-lg bg-card-bg border border-card-border">
          <div>
            <label className="block text-sm text-muted mb-2">Class</label>
            <div className="flex flex-wrap gap-2">
              {classes.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedClass === cls
                      ? 'bg-accent text-white'
                      : 'bg-card-border text-muted hover:text-foreground'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto">
            <label className="block text-sm text-muted mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 rounded-lg bg-card-border text-foreground border-none focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="upvotes">Most Popular</option>
              <option value="date">Newest</option>
            </select>
          </div>
        </div>

        {/* Builds List */}
        <div className="space-y-4">
          {filteredBuilds.map((build) => (
            <Link
              key={build.id}
              href={`/builds/${build.id}`}
              className="block p-6 rounded-xl border border-card-border bg-card-bg hover:border-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-accent/20 text-accent-light">
                      {build.class_name}
                    </span>
                    <span className="text-muted text-sm">by {build.author_name}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{build.title}</h3>
                  <p className="text-muted text-sm mb-3">{build.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {build.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded bg-card-border text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center ml-4">
                  <span className="text-2xl">▲</span>
                  <span className="font-bold text-accent-light">{build.upvotes}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredBuilds.length === 0 && (
          <div className="text-center py-12 text-muted">
            <p className="text-lg">No builds found for this class</p>
            <p className="text-sm mt-2">Be the first to submit one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
