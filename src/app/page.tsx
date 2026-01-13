'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import { supabase, Build, Discussion } from '@/lib/supabase';

export default function Home() {
  const [latestBuild, setLatestBuild] = useState<Build | null>(null);
  const [latestDiscussion, setLatestDiscussion] = useState<Discussion | null>(null);

  useEffect(() => {
    async function fetchLatest() {
      // Fetch latest build
      const { data: build } = await supabase
        .from('builds')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (build) setLatestBuild(build);

      // Fetch latest discussion
      const { data: discussion } = await supabase
        .from('discussions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (discussion) setLatestDiscussion(discussion);
    }

    fetchLatest();
  }, []);
  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative px-4 text-center"
        style={{
          paddingTop: '120px',
          paddingBottom: '120px',
          background: 'radial-gradient(circle at center 30%, rgba(245,158,11,0.13), transparent 55%), linear-gradient(#07080b, #050608)'
        }}
      >
        <div className="container mx-auto">
          {/* Full Logo */}
          <div className="mb-10">
            <img
              src="/logo.png"
              alt="Dreadmyst Nexus"
              className="mx-auto"
              style={{ width: '360px', maxWidth: '80vw' }}
            />
          </div>
          <p className="max-w-xl mx-auto mb-10" style={{ fontSize: '16px', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.78)' }}>
            A community-driven hub for Dreadmyst Online. Discover builds, explore guides, and trade with fellow adventurers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/wiki"
              className="px-6 py-2.5 text-[14px] font-semibold tracking-[0.02em] rounded-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, #b45309, #e68a00)',
                color: 'rgba(255,255,255,0.92)',
                boxShadow: '0 8px 18px rgba(0,0,0,0.45)'
              }}
            >
              Explore Wiki
            </Link>
            <Link
              href="/builds"
              className="px-6 py-2.5 text-[14px] font-semibold tracking-[0.02em] text-amber-500 rounded-lg transition-all hover:bg-amber-500/[0.08]"
              style={{ border: '1px solid rgba(245,158,11,0.6)' }}
            >
              Browse Builds
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14">Everything You Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              title="Trade"
              description="Buy and sell items with other players. Real-time chat, whisper commands, and more."
              href="/market"
              icon={
                <svg className="w-[18px] h-[18px]" style={{ color: 'rgba(245,158,11,0.75)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <Card
              title="Game Wiki"
              description="Comprehensive guides covering classes, skills, items, quests, and mechanics."
              href="/wiki"
              icon={
                <svg className="w-[18px] h-[18px]" style={{ color: 'rgba(245,158,11,0.75)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />
            <Card
              title="Character Builds"
              description="Community builds for every class. Find the perfect setup or share your own."
              href="/builds"
              icon={
                <svg className="w-[18px] h-[18px]" style={{ color: 'rgba(245,158,11,0.75)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
            <Card
              title="Discussions"
              description="Connect with the community. Ask questions, share tips, and strategies."
              href="/discuss"
              icon={
                <svg className="w-[18px] h-[18px]" style={{ color: 'rgba(245,158,11,0.75)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <section className="py-20 px-4" style={{ background: '#111114' }}>
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14">Latest Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {latestBuild && (
              <Link href={`/builds/${latestBuild.id}`} className="card-hover bg-card-bg cursor-pointer block">
                <span className="text-[10px] text-amber-500/80 uppercase tracking-widest font-semibold">New Build</span>
                <h3 className="text-lg font-semibold mt-3 mb-2 text-foreground">{latestBuild.title}</h3>
                <p className="text-sm line-clamp-2">{latestBuild.description}</p>
                <p className="text-xs text-muted mt-4">
                  {latestBuild.class_name} build by {latestBuild.author_name}
                </p>
              </Link>
            )}
            {latestDiscussion && (
              <Link href={`/discuss/${latestDiscussion.id}`} className="card-hover bg-card-bg cursor-pointer block">
                <span className="text-[10px] text-amber-500/80 uppercase tracking-widest font-semibold">New Discussion</span>
                <h3 className="text-lg font-semibold mt-3 mb-2 text-foreground">{latestDiscussion.title}</h3>
                <p className="text-sm line-clamp-2">{latestDiscussion.content}</p>
                <p className="text-xs text-muted mt-4">
                  Posted by {latestDiscussion.author_name}
                </p>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-5">Join the Community</h2>
          <p className="mb-10 max-w-lg mx-auto" style={{ color: 'rgba(228, 228, 231, 0.7)' }}>
            Share your knowledge, submit your builds, and help grow the Dreadmyst community.
          </p>
          <Link
            href="/builds"
            className="inline-block px-6 py-2.5 text-[14px] font-semibold tracking-[0.02em] rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #b45309, #e68a00)',
              color: 'rgba(255,255,255,0.92)',
              boxShadow: '0 8px 18px rgba(0,0,0,0.45)'
            }}
          >
            Submit Your Build
          </Link>
        </div>
      </section>
    </div>
  );
}
