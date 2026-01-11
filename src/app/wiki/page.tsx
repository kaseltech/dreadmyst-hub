import Link from 'next/link';
import Card from '@/components/Card';

const wikiCategories = [
  {
    title: 'Getting Started',
    description: 'New to Dreadmyst? Start here with beginner guides and tutorials.',
    icon: '🎮',
    slug: 'getting-started',
  },
  {
    title: 'Classes',
    description: 'Detailed breakdowns of each class, their skills, and playstyles.',
    icon: '🛡️',
    slug: 'classes',
  },
  {
    title: 'Skills & Abilities',
    description: 'Complete skill trees, ability mechanics, and synergies.',
    icon: '✨',
    slug: 'skills',
  },
  {
    title: 'Items & Equipment',
    description: 'Weapons, armor, accessories, and where to find them.',
    icon: '⚔️',
    slug: 'items',
  },
  {
    title: 'Quests',
    description: 'Main story, side quests, and hidden objectives.',
    icon: '📜',
    slug: 'quests',
  },
  {
    title: 'Crafting',
    description: 'Crafting systems, recipes, and material gathering.',
    icon: '🔨',
    slug: 'crafting',
  },
  {
    title: 'World & Lore',
    description: 'Explore the world of Dreadmyst, its history and secrets.',
    icon: '🗺️',
    slug: 'world',
  },
  {
    title: 'Game Mechanics',
    description: 'Combat systems, stats, formulas, and game mechanics.',
    icon: '⚙️',
    slug: 'mechanics',
  },
];

export default function WikiPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Game Wiki</h1>
        <p className="text-muted text-lg mb-8">
          Your comprehensive guide to everything in Dreadmyst Online.
          Browse categories or search for specific topics.
        </p>

        {/* Search Bar */}
        <div className="mb-12">
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
            Know something that&apos;s missing? The wiki is community-driven and we welcome contributions.
          </p>
          <Link
            href="/discuss"
            className="inline-block px-4 py-2 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors"
          >
            Suggest an Article
          </Link>
        </div>
      </div>
    </div>
  );
}
