'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, Discussion, Reply } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DiscussionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, profile, signInWithDiscord } = useAuth();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscussion();
    fetchReplies();
  }, [id]);

  async function fetchDiscussion() {
    const { data, error } = await supabase
      .from('discussions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching discussion:', error);
    } else {
      setDiscussion(data);
    }
    setLoading(false);
  }

  async function fetchReplies() {
    const { data, error } = await supabase
      .from('replies')
      .select('*')
      .eq('discussion_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching replies:', error);
    } else {
      setReplies(data || []);
    }
  }

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyContent.trim() || !user || !profile) return;

    setSubmitting(true);
    const { error } = await supabase.from('replies').insert({
      discussion_id: id,
      content: replyContent.trim(),
      author_name: profile.username,
    });

    if (error) {
      console.error('Error posting reply:', error);
      alert('Error posting reply. Please try again.');
    } else {
      setReplyContent('');
      fetchReplies();
      // Update reply count
      if (discussion) {
        await supabase
          .from('discussions')
          .update({ replies_count: discussion.replies_count + 1 })
          .eq('id', id);
        setDiscussion({ ...discussion, replies_count: discussion.replies_count + 1 });
      }
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Discussion not found</h1>
        <Link href="/discuss" className="text-accent-light hover:text-accent">
          ← Back to Discussions
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted mb-6">
          <Link href="/discuss" className="hover:text-foreground transition-colors">Discussions</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground truncate">{discussion.title}</span>
        </nav>

        {/* Main Post */}
        <div className="p-6 rounded-xl bg-card-bg border border-card-border mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 text-sm font-medium rounded-lg bg-accent/20 text-accent-light">
              {discussion.category}
            </span>
            <span className="text-muted text-sm">{formatTimeAgo(discussion.created_at)}</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{discussion.title}</h1>
          <p className="text-muted whitespace-pre-wrap mb-4">{discussion.content}</p>
          <div className="flex items-center justify-between text-sm text-muted border-t border-card-border pt-4">
            <span>Posted by <span className="text-foreground">{discussion.author_name}</span></span>
            <span>{formatDate(discussion.created_at)}</span>
          </div>
        </div>

        {/* Replies Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Replies ({discussion.replies_count})
          </h2>

          {replies.length === 0 ? (
            <div className="text-center py-8 text-muted p-6 rounded-xl bg-card-bg border border-card-border">
              <p>No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => (
                <div
                  key={reply.id}
                  className="p-4 rounded-xl bg-card-bg border border-card-border"
                >
                  <p className="whitespace-pre-wrap mb-3">{reply.content}</p>
                  <div className="flex items-center justify-between text-sm text-muted">
                    <span className="text-foreground">{reply.author_name}</span>
                    <span>{formatTimeAgo(reply.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        <div className="p-6 rounded-xl bg-card-bg border border-card-border">
          <h3 className="text-lg font-semibold mb-4">Post a Reply</h3>
          {user && profile ? (
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                required
                className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none mb-4"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">
                  Replying as <span className="text-foreground">{profile.username}</span>
                </span>
                <button
                  type="submit"
                  disabled={submitting || !replyContent.trim()}
                  className="px-6 py-2 bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {submitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted mb-4">Sign in to reply to this discussion</p>
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
          )}
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link
            href="/discuss"
            className="text-accent-light hover:text-accent transition-colors"
          >
            ← Back to Discussions
          </Link>
        </div>
      </div>
    </div>
  );
}
