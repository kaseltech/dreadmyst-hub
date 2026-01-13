import Link from 'next/link';
import Card from '@/components/Card';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative py-16 sm:py-24 px-4 text-center"
        style={{
          background: 'radial-gradient(circle at center top, rgba(245,158,11,0.08) 0%, transparent 50%), linear-gradient(to bottom, #18181b, #09090b)'
        }}
      >
        <div className="container mx-auto">
          {/* Full Logo with glow */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 sm:w-80 sm:h-80 bg-amber-500/10 blur-3xl rounded-full" />
            </div>
            <img
              src="/logo.png"
              alt="Dreadmyst Nexus"
              className="h-40 sm:h-52 md:h-60 lg:h-72 w-auto mx-auto relative"
            />
          </div>
          <p className="text-lg sm:text-xl max-w-xl mx-auto mb-10" style={{ color: 'rgba(228, 228, 231, 0.75)' }}>
            A community-driven hub for Dreadmyst Online. Discover builds, explore guides, and trade with fellow adventurers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/wiki"
              className="btn-primary px-7 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-lg transition-all"
            >
              Explore Wiki
            </Link>
            <Link
              href="/builds"
              className="btn-secondary px-7 py-3 border border-accent text-accent-light hover:bg-accent/10 font-semibold rounded-lg transition-all"
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
              icon="📚"
            />
            <Card
              title="Character Builds"
              description="Community-submitted builds for every class. Find the perfect setup or share your own."
              href="/builds"
              icon="⚔️"
            />
            <Card
              title="Discussions"
              description="Connect with the community. Ask questions, share tips, and discuss strategies."
              href="/discuss"
              icon="💬"
            />
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <section className="py-20 px-4" style={{ background: '#111114' }}>
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14">Latest Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card-hover p-7 rounded-xl bg-card-bg cursor-pointer">
              <span className="text-[10px] text-amber-500/80 uppercase tracking-widest font-semibold">New Build</span>
              <h3 className="text-lg font-semibold mt-3 mb-2">Shadow Assassin - Max DPS Guide</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(228, 228, 231, 0.65)' }}>A high-damage build focusing on critical strikes and stealth mechanics...</p>
              <p className="text-xs text-muted mt-4">Posted by Player123</p>
            </div>
            <div className="card-hover p-7 rounded-xl bg-card-bg cursor-pointer">
              <span className="text-[10px] text-amber-500/80 uppercase tracking-widest font-semibold">Wiki Update</span>
              <h3 className="text-lg font-semibold mt-3 mb-2">Beginner&apos;s Guide Updated</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(228, 228, 231, 0.65)' }}>Complete walkthrough for new players including starter tips...</p>
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
            className="btn-primary inline-block px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold rounded-lg transition-all"
          >
            Submit Your Build
          </Link>
        </div>
      </section>
    </div>
  );
}
