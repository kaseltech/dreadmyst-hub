import Link from 'next/link';

// This would normally come from Supabase
const getBuild = (id: string) => {
  const builds: Record<string, {
    id: string;
    title: string;
    class_name: string;
    author_name: string;
    description: string;
    skills: string;
    equipment: string;
    playstyle: string;
    upvotes: number;
    tags: string[];
    created_at: string;
  }> = {
    '1': {
      id: '1',
      title: 'Shadow Assassin - Max Crit DPS',
      class_name: 'Rogue',
      author_name: 'ShadowMaster99',
      description: 'High burst damage build focusing on critical strikes and stealth. Perfect for PvE content and demolishing bosses.',
      skills: `Core Skills:
- Shadow Strike (Max) - Your main damage dealer
- Critical Mastery (Max) - Essential for crit builds
- Vanish (5 points) - Survivability and repositioning
- Backstab (Max) - Massive damage from stealth
- Poison Blade (7 points) - DoT for sustained damage

Passives:
- Deadly Precision (Max)
- Shadow Affinity (Max)
- Quick Reflexes (5 points)`,
      equipment: `Weapons:
- Dagger of the Night (Main Hand) - Best crit chance
- Shadow Fang (Off Hand) - Crit damage bonus

Armor:
- Assassin's Cowl (Head) - +15% crit
- Nightstalker Vest (Chest) - Stealth bonus
- Swift Leather Boots - Movement speed

Accessories:
- Ring of Shadows x2
- Pendant of Precision`,
      playstyle: `Rotation:
1. Open from stealth with Backstab
2. Apply Poison Blade
3. Spam Shadow Strike
4. Use Vanish when in danger or to reset Backstab

Tips:
- Always position behind enemies for bonus damage
- Save Vanish for emergencies or burst phases
- Keep Poison Blade active at all times`,
      upvotes: 142,
      tags: ['PvE', 'DPS', 'Beginner-Friendly'],
      created_at: '2024-01-10',
    },
  };

  return builds[id] || null;
};

export default async function BuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const build = getBuild(id);

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
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 text-sm font-medium rounded-lg bg-accent/20 text-accent-light">
                {build.class_name}
              </span>
              {build.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-xs rounded bg-card-border text-muted">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-bold mb-2">{build.title}</h1>
            <p className="text-muted">
              by <span className="text-foreground">{build.author_name}</span> • {build.created_at}
            </p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-card-bg border border-card-border">
            <button className="text-3xl hover:scale-110 transition-transform">▲</button>
            <span className="text-2xl font-bold text-accent-light">{build.upvotes}</span>
            <span className="text-xs text-muted">upvotes</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 p-6 rounded-xl bg-card-bg border border-card-border">
          <h2 className="text-xl font-semibold mb-3">Overview</h2>
          <p className="text-muted">{build.description}</p>
        </div>

        {/* Skills */}
        <div className="mb-8 p-6 rounded-xl bg-card-bg border border-card-border">
          <h2 className="text-xl font-semibold mb-3">Skills & Abilities</h2>
          <pre className="text-muted whitespace-pre-wrap font-sans">{build.skills}</pre>
        </div>

        {/* Equipment */}
        <div className="mb-8 p-6 rounded-xl bg-card-bg border border-card-border">
          <h2 className="text-xl font-semibold mb-3">Equipment & Gear</h2>
          <pre className="text-muted whitespace-pre-wrap font-sans">{build.equipment}</pre>
        </div>

        {/* Playstyle */}
        <div className="mb-8 p-6 rounded-xl bg-card-bg border border-card-border">
          <h2 className="text-xl font-semibold mb-3">Playstyle & Tips</h2>
          <pre className="text-muted whitespace-pre-wrap font-sans">{build.playstyle}</pre>
        </div>

        {/* Comments section placeholder */}
        <div className="p-6 rounded-xl bg-card-bg border border-card-border">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          <p className="text-muted text-center py-8">
            Comments coming soon! Connect Supabase to enable discussions.
          </p>
        </div>

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
