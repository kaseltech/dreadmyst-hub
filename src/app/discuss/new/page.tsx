'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const categories = ['General', 'Builds', 'Tips & Tricks', 'Questions', 'News'];

export default function NewDiscussionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    author_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('discussions').insert({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      author_name: formData.author_name,
      replies_count: 0,
    });

    if (error) {
      console.error('Error posting discussion:', error);
      alert('Error posting discussion. Please try again.');
      setSubmitting(false);
    } else {
      router.push('/discuss');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <nav className="text-sm text-muted mb-6">
          <Link href="/discuss" className="hover:text-foreground transition-colors">Discussions</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">New Topic</span>
        </nav>

        <h1 className="text-4xl font-bold mb-8">Start a Discussion</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              required
              placeholder="What do you want to discuss?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground focus:outline-none focus:border-accent"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Content *</label>
            <textarea
              required
              rows={8}
              placeholder="Share your thoughts, ask a question, or start a discussion..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
              {submitting ? 'Posting...' : 'Post Discussion'}
            </button>
            <Link
              href="/discuss"
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
