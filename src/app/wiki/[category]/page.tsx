import Link from 'next/link';

// This would normally come from the database
const getCategoryData = (slug: string) => {
  const categories: Record<string, { title: string; description: string; articles: { title: string; slug: string; summary: string }[] }> = {
    'getting-started': {
      title: 'Getting Started',
      description: 'Everything new players need to know about Dreadmyst Online.',
      articles: [
        { title: 'Welcome to Dreadmyst', slug: 'welcome', summary: 'An introduction to the world and basic concepts.' },
        { title: 'Character Creation', slug: 'character-creation', summary: 'How to create your first character and choose a class.' },
        { title: 'Basic Controls', slug: 'controls', summary: 'Movement, combat, and interface basics.' },
        { title: 'Your First Quest', slug: 'first-quest', summary: 'A walkthrough of the starting area and initial quests.' },
      ],
    },
    classes: {
      title: 'Classes',
      description: 'Detailed information about each playable class.',
      articles: [
        { title: 'Warrior', slug: 'warrior', summary: 'Melee powerhouse with high defense and crowd control.' },
        { title: 'Mage', slug: 'mage', summary: 'Master of elemental magic with devastating AoE damage.' },
        { title: 'Rogue', slug: 'rogue', summary: 'Stealth specialist with high single-target damage.' },
        { title: 'Healer', slug: 'healer', summary: 'Support class focused on keeping the party alive.' },
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
