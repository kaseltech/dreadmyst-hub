import Link from 'next/link';

// Game data from community research
const getCategoryData = (slug: string) => {
  const categories: Record<string, { title: string; description: string; articles: { title: string; slug: string; summary: string }[] }> = {
    'getting-started': {
      title: 'Getting Started',
      description: 'Everything new players need to know about Dreadmyst Online.',
      articles: [
        { title: 'Leveling Guide', slug: 'leveling', summary: 'Max level is 25 with 500,000 total XP. Fastest runs: 4-5 hours, casual pace: ~2 days.' },
        { title: 'Progression Tips', slug: 'progression', summary: 'Follow quests to new grinding areas. When quests end, find mobs closest to your level.' },
        { title: 'Server & Channels', slug: 'servers', summary: 'Channel-based system with 125 players max per channel. 5-min cooldown between switches.' },
        { title: 'Platform Support', slug: 'platforms', summary: 'Windows PC only. Runs on Steam Deck via Proton Experimental. No native Mac/Linux.' },
      ],
    },
    mechanics: {
      title: 'Game Mechanics',
      description: 'Core systems and how they work in Dreadmyst Online.',
      articles: [
        { title: 'Experience System', slug: 'experience', summary: 'XP can be invested into stats or skills with escalating costs. No way to gain extra XP past cap.' },
        { title: 'Stat Investment', slug: 'stats', summary: 'Mana costs 1 XP per point initially, then 100 XP per point after 1,000 investment.' },
        { title: 'Skills Overview', slug: 'skills', summary: 'Skills like Lockpicking are activatable and upgraded through experience spending.' },
        { title: 'Respec System', slug: 'respec', summary: 'Costs 500,000 gold and requires level 25 to reset your character.' },
      ],
    },
    world: {
      title: 'World & Lore',
      description: 'Explore the world of Dreadmyst, its locations and secrets.',
      articles: [
        { title: 'St. Revere', slug: 'st-revere', summary: 'Major hub city. Bank located north of St. Revere (not shared between characters).' },
        { title: 'PvP Zones', slug: 'pvp-zones', summary: 'Dangerous areas with loot runs. Part of end-game content.' },
        { title: 'Dungeons', slug: 'dungeons', summary: 'End-game PvE content available at max level.' },
      ],
    },
    items: {
      title: 'Items & Equipment',
      description: 'Weapons, armor, accessories, and where to find them.',
      articles: [
        { title: 'Trading Guide', slug: 'trading', summary: 'Player-to-player trading enabled with gold. No Auction House system.' },
        { title: 'Banking', slug: 'banking', summary: 'Bank is north of St. Revere. Storage is NOT shared between characters.' },
        { title: 'Gold Guide', slug: 'gold', summary: 'Gold is essential for respec (500k) and trading. Farm efficiently!' },
      ],
    },
    classes: {
      title: 'Classes',
      description: 'Class information. Note: A meta has not been established yet!',
      articles: [
        { title: 'Class Overview', slug: 'overview', summary: 'No class-specific build guides exist yet. The community is still discovering optimal builds.' },
      ],
    },
    skills: {
      title: 'Skills & Abilities',
      description: 'Complete skill information and mechanics.',
      articles: [
        { title: 'Skill Investment', slug: 'investment', summary: 'Skills are upgraded through experience spending with escalating costs.' },
        { title: 'Lockpicking', slug: 'lockpicking', summary: 'Activatable skill that can be upgraded. Useful for accessing locked content.' },
      ],
    },
    quests: {
      title: 'Quests',
      description: 'Main story, side quests, and progression.',
      articles: [
        { title: 'Quest Progression', slug: 'progression', summary: 'Quests guide you to new grinding areas. New quests appear as you level up.' },
        { title: 'End-Game Content', slug: 'endgame', summary: 'Dungeons, Arena PvP, and loot runs in PvP areas await at max level.' },
      ],
    },
    crafting: {
      title: 'Crafting',
      description: 'Crafting systems and professions.',
      articles: [
        { title: 'Professions', slug: 'professions', summary: 'No professions currently available in Dreadmyst Online.' },
      ],
    },
  };

  return categories[slug] || { title: 'Category', description: 'Articles coming soon.', articles: [] };
};

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const data = getCategoryData(category);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted mb-6">
          <Link href="/wiki" className="hover:text-foreground transition-colors">Wiki</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{data.title}</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
        <p className="text-muted text-lg mb-8">{data.description}</p>

        {/* Articles List */}
        <div className="space-y-4">
          {data.articles.length > 0 ? (
            data.articles.map((article) => (
              <Link
                key={article.slug}
                href={`/wiki/${category}/${article.slug}`}
                className="block p-4 rounded-lg border border-card-border bg-card-bg hover:border-accent/50 transition-colors"
              >
                <h3 className="font-semibold mb-1">{article.title}</h3>
                <p className="text-muted text-sm">{article.summary}</p>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 text-muted">
              <p className="text-lg mb-2">No articles yet</p>
              <p className="text-sm">This section is still being built. Check back soon!</p>
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link
            href="/wiki"
            className="text-accent-light hover:text-accent transition-colors"
          >
            ← Back to Wiki
          </Link>
        </div>
      </div>
    </div>
  );
}
