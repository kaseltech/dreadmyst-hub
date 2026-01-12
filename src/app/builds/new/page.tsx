'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const classes = ['Warrior', 'Mage', 'Rogue', 'Healer'];
const tagOptions = ['PvE', 'PvP', 'DPS', 'Tank', 'Healer', 'Support', 'Solo', 'Raid', 'Beginner-Friendly', 'Endgame', 'AoE', 'Speed'];

export default function NewBuildPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    class_name: '',
    description: '',
    skills: '',
    equipment: '',
    playstyle: '',
    author_name: '',
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('builds').insert({
      title: formData.title,
      class_name: formData.class_name,
      description: formData.description,
      skills: formData.skills || null,
      equipment: formData.equipment || null,
      playstyle: formData.playstyle || null,
      author_name: formData.author_name,
      tags: selectedTags,
      upvotes: 0,
    });

    if (error) {
      console.error('Error submitting build:', error);
      alert('Error submitting build. Please try again.');
      setSubmitting(false);
    } else {
      router.push('/builds');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <nav className="text-sm text-muted mb-6">
          <Link href="/builds" className="hover:text-foreground transition-colors">Builds</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Submit New Build</span>
        </nav>

        <h1 className="text-4xl font-bold mb-8">Submit Your Build</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Build Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Shadow Assassin - Max Crit DPS"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {/* Class */}
          <div>
            <label className="block text-sm font-medium mb-2">Class *</label>
            <select
              required
              value={formData.class_name}
              onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground focus:outline-none focus:border-accent"
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-accent text-white'
                      : 'bg-card-border text-muted hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Brief overview of the build and its strengths..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium mb-2">Skills & Abilities *</label>
            <textarea
              required
              rows={5}
              placeholder="List the skills/abilities and explain your skill choices..."
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Equipment */}
          <div>
            <label className="block text-sm font-medium mb-2">Equipment & Gear</label>
            <textarea
              rows={4}
              placeholder="Recommended weapons, armor, and accessories..."
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Playstyle */}
          <div>
            <label className="block text-sm font-medium mb-2">Playstyle & Tips</label>
            <textarea
              rows={4}
              placeholder="How to play this build effectively, rotation tips, etc..."
              value={formData.playstyle}
              onChange={(e) => setFormData({ ...formData, playstyle: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Name *</label>
            <input
              type="text"
              required
              placeholder="Your in-game name or username"
              value={formData.author_name}
              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Build'}
            </button>
            <Link
              href="/builds"
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
