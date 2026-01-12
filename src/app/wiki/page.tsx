import Link from 'next/link';
import Card from '@/components/Card';

const wikiCategories = [
  {
    title: 'Getting Started',
    description: 'New to Dreadmyst? Max level 25, ~4-5 hours to cap. Start here!',
    icon: '🎮',
    slug: 'getting-started',
  },
  {
    title: 'Game Mechanics',
    description: 'XP investment, stat scaling, respec costs (500k gold), and core systems.',
    icon: '⚙️',
    slug: 'mechanics',
  },
  {
    title: 'Classes',
    description: 'Class info and builds. Note: Meta is still being discovered!',
    icon: '🛡️',
    slug: 'classes',
  },
  {
    title: 'Skills & Abilities',
    description: 'Skill investment with escalating costs. Lockpicking and more.',
    icon: '✨',
    slug: 'skills',
  },
  {
    title: 'Items & Equipment',
    description: 'Trading (no AH), banking in St. Revere, and gear guides.',
    icon: '⚔️',
    slug: 'items',
  },
  {
    title: 'Quests',
    description: 'Quest progression guides and end-game content (Dungeons, Arena, PvP).',
    icon: '📜',
    slug: 'quests',
  },
  {
    title: 'World & Lore',
    description: 'Locations like St. Revere, PvP zones, and dungeon info.',
    icon: '🗺️',
    slug: 'world',
  },
  {
    title: 'Crafting',
    description: 'Crafting systems (currently no professions available).',
    icon: '🔨',
    slug: 'crafting',
  },
];

const quickFacts = [
  { label: 'Max Level', value: '25' },
  { label: 'Total XP', value: '500,000' },
  { label: 'Time to Cap', value: '4-5 hours' },
  { label: 'Respec Cost', value: '500k gold' },
  { label: 'Channel Cap', value: '125 players' },
  { label: 'Server', value: 'Canada' },
];

export default function WikiPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Game Wiki</h1>
        <p className="text-muted text-lg mb-8">
          Your comprehensive guide to Dreadmyst Online.
          Community-sourced info from Discord and player research.
        </p>

        {/* Quick Facts */}
        <div className="mb-12 p-6 rounded-xl bg-card-bg border border-card-border">
          <h2 className="text-lg font-semibold mb-4">Quick Facts</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="text-center">
                <div className="text-2xl font-bold text-accent-light">{fact.value}</div>
                <div className="text-sm text-muted">{fact.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search the wiki..."
              className="w-full px-4 py-3 pl-12 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">🔍</span>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wikiCategories.map((category) => (
            <Card
              key={category.slug}
              title={category.title}
              description={category.description}
              href={`/wiki/${category.slug}`}
              icon={category.icon}
            />
          ))}
        </div>

        {/* Contributing Notice */}
        <div className="mt-12 p-6 rounded-xl border border-accent/30 bg-accent/5 text-center">
          <h3 className="text-lg font-semibold mb-2">Help Build the Wiki</h3>
          <p className="text-muted text-sm mb-4">
            Found new info? The wiki is community-driven. Share discoveries in the discussions!
          </p>
          <Link
            href="/discuss"
            className="inline-block px-4 py-2 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors"
          >
            Share Info
          </Link>
        </div>
      </div>
    </div>
  );
}
