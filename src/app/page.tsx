import Link from 'next/link';
import Card from '@/components/Card';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-b from-card-bg to-background">
        <div className="container mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-accent-light via-purple-400 to-accent bg-clip-text text-transparent">
              Dreadmyst Hub
            </span>
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
            Your community-driven resource for Dreadmyst Online.
            Discover builds, explore guides, and connect with fellow adventurers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/wiki"
              className="px-6 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-lg transition-colors"
            >
              Explore Wiki
            </Link>
            <Link
              href="/builds"
              className="px-6 py-3 border border-accent text-accent-light hover:bg-accent/10 font-semibold rounded-lg transition-colors"
            >
              Browse Builds
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <section className="py-16 px-4 bg-card-bg">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Latest Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl border border-card-border bg-background">
              <span className="text-xs text-accent-light uppercase tracking-wider">New Build</span>
              <h3 className="text-lg font-semibold mt-2 mb-2">Shadow Assassin - Max DPS Guide</h3>
              <p className="text-muted text-sm">A high-damage build focusing on critical strikes and stealth mechanics...</p>
              <p className="text-xs text-muted mt-3">Posted by Player123</p>
            </div>
            <div className="p-6 rounded-xl border border-card-border bg-background">
              <span className="text-xs text-accent-light uppercase tracking-wider">Wiki Update</span>
              <h3 className="text-lg font-semibold mt-2 mb-2">Beginner&apos;s Guide Updated</h3>
              <p className="text-muted text-sm">Complete walkthrough for new players including starter tips...</p>
              <p className="text-xs text-muted mt-3">Updated today</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
          <p className="text-muted mb-8 max-w-xl mx-auto">
            Share your knowledge, submit your builds, and help grow the Dreadmyst community.
          </p>
          <Link
            href="/builds"
            className="inline-block px-8 py-4 bg-gradient-to-r from-accent to-purple-600 hover:from-accent-light hover:to-purple-500 text-white font-semibold rounded-lg transition-all"
          >
            Submit Your Build
          </Link>
        </div>
      </section>
    </div>
  );
}
