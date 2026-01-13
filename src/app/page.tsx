import Link from 'next/link';
import Card from '@/components/Card';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative px-4 text-center"
        style={{
          paddingTop: '140px',
          paddingBottom: '120px',
          background: 'radial-gradient(circle at center 30%, rgba(245,158,11,0.12), transparent 55%), linear-gradient(#0b0c0f, #06070a)'
        }}
      >
        <div className="container mx-auto">
          {/* Full Logo */}
          <div className="mb-10">
            <img
              src="/logo.png"
              alt="Dreadmyst Nexus"
              className="w-[260px] sm:w-[300px] md:w-[340px] mx-auto"
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
                background: 'linear-gradient(135deg, #b45309, #f59e0b)',
                color: 'rgba(255,255,255,0.92)',
                boxShadow: '0 8px 18px rgba(0,0,0,0.45)',
                border: '1px solid rgba(0,0,0,0.25)'
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card
              title="Game Wiki"
              description="Comprehensive guides covering classes, skills, items, quests, and game mechanics."
              href="/wiki"
              icon={
                <svg className="w-5 h-5" style={{ color: 'rgba(245,158,11,0.85)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />
            <Card
              title="Character Builds"
              description="Community-submitted builds for every class. Find the perfect setup or share your own."
              href="/builds"
              icon={
                <svg className="w-5 h-5" style={{ color: 'rgba(245,158,11,0.85)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
            <Card
              title="Discussions"
              description="Connect with the community. Ask questions, share tips, and discuss strategies."
              href="/discuss"
              icon={
                <svg className="w-5 h-5" style={{ color: 'rgba(245,158,11,0.85)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="card-hover bg-card-bg cursor-pointer">
              <span className="text-[10px] text-amber-500/80 uppercase tracking-widest font-semibold">New Build</span>
              <h3 className="text-lg font-semibold mt-3 mb-2 text-foreground">Shadow Assassin - Max DPS Guide</h3>
              <p className="text-sm">A high-damage build focusing on critical strikes and stealth mechanics...</p>
              <p className="text-xs text-muted mt-4">Posted by Player123</p>
            </div>
            <div className="card-hover bg-card-bg cursor-pointer">
              <span className="text-[10px] text-amber-500/80 uppercase tracking-widest font-semibold">Wiki Update</span>
              <h3 className="text-lg font-semibold mt-3 mb-2 text-foreground">Beginner&apos;s Guide Updated</h3>
              <p className="text-sm">Complete walkthrough for new players including starter tips...</p>
              <p className="text-xs text-muted mt-4">Updated today</p>
            </div>
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
              background: 'linear-gradient(135deg, #b45309, #f59e0b)',
              color: 'rgba(255,255,255,0.92)',
              boxShadow: '0 8px 18px rgba(0,0,0,0.45)',
              border: '1px solid rgba(0,0,0,0.25)'
            }}
          >
            Submit Your Build
          </Link>
        </div>
      </section>
    </div>
  );
}
