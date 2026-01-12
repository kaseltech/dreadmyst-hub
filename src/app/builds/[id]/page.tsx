'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase, Build } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, signInWithDiscord } = useAuth();
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetchBuild();
    checkIfVoted();
  }, [id, user]);

  async function fetchBuild() {
    const { data, error } = await supabase
      .from('builds')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching build:', error);
    } else {
      setBuild(data);
    }
    setLoading(false);
  }

  async function checkIfVoted() {
    if (!user) {
      setHasVoted(false);
      return;
    }

    const { data } = await supabase
      .from('build_votes')
      .select('id')
      .eq('build_id', id)
      .eq('user_id', user.id)
      .single();

    setHasVoted(!!data);
  }

  async function handleUpvote() {
    if (!user || !build || voting) return;

    setVoting(true);

    if (hasVoted) {
      // Remove vote
      await supabase
        .from('build_votes')
        .delete()
        .eq('build_id', id)
        .eq('user_id', user.id);

      await supabase
        .from('builds')
        .update({ upvotes: build.upvotes - 1 })
        .eq('id', id);

      setBuild({ ...build, upvotes: build.upvotes - 1 });
      setHasVoted(false);
    } else {
      // Add vote
      await supabase
        .from('build_votes')
        .insert({ build_id: id, user_id: user.id });

      await supabase
        .from('builds')
        .update({ upvotes: build.upvotes + 1 })
        .eq('id', id);

      setBuild({ ...build, upvotes: build.upvotes + 1 });
      setHasVoted(true);
    }

    setVoting(false);
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!build) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Build not found</h1>
        <Link href="/builds" className="text-accent-light hover:text-accent">
          ← Back to Builds
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted mb-6">
          <Link href="/builds" className="hover:text-foreground transition-colors">Builds</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{build.title}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="px-3 py-1 text-sm font-medium rounded-lg bg-accent/20 text-accent-light">
                {build.class_name}
              </span>
              {build.tags?.map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-xs rounded bg-card-border text-muted">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-bold mb-2">{build.title}</h1>
            <p className="text-muted">
              by <span className="text-foreground">{build.author_name}</span> • {formatDate(build.created_at)}
            </p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-card-bg border border-card-border">
            {user ? (
              <button
                onClick={handleUpvote}
                disabled={voting}
                className={`text-3xl hover:scale-110 transition-transform disabled:opacity-50 ${
                  hasVoted ? 'text-accent' : ''
                }`}
                title={hasVoted ? 'Remove upvote' : 'Upvote this build'}
              >
                {hasVoted ? '▲' : '△'}
              </button>
            ) : (
              <button
                onClick={signInWithDiscord}
                className="text-3xl hover:scale-110 transition-transform text-muted"
                title="Sign in to upvote"
              >
                △
              </button>
            )}
            <span className="text-2xl font-bold text-accent-light">{build.upvotes}</span>
            <span className="text-xs text-muted">upvotes</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 p-6 rounded-xl bg-card-bg border border-card-border">
          <h2 className="text-xl font-semibold mb-3">Overview</h2>
          <p className="text-muted whitespace-pre-wrap">{build.description}</p>
        </div>

        {/* Skills */}
        {build.skills && (
          <div className="mb-8 p-6 rounded-xl bg-card-bg border border-card-border">
            <h2 className="text-xl font-semibold mb-3">Skills & Abilities</h2>
            <pre className="text-muted whitespace-pre-wrap font-sans">{build.skills}</pre>
          </div>
        )}

        {/* Equipment */}
        {build.equipment && (
          <div className="mb-8 p-6 rounded-xl bg-card-bg border border-card-border">
            <h2 className="text-xl font-semibold mb-3">Equipment & Gear</h2>
            <pre className="text-muted whitespace-pre-wrap font-sans">{build.equipment}</pre>
          </div>
        )}

        {/* Playstyle */}
        {build.playstyle && (
          <div className="mb-8 p-6 rounded-xl bg-card-bg border border-card-border">
            <h2 className="text-xl font-semibold mb-3">Playstyle & Tips</h2>
            <pre className="text-muted whitespace-pre-wrap font-sans">{build.playstyle}</pre>
          </div>
        )}

        {/* Back link */}
        <div className="mt-8">
          <Link
            href="/builds"
            className="text-accent-light hover:text-accent transition-colors"
          >
            ← Back to Builds
          </Link>
        </div>
      </div>
    </div>
  );
}
