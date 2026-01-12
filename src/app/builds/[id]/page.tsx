import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Build } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getBuild(id: string): Promise<Build | null> {
  const { data, error } = await supabase
    .from('builds')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching build:', error);
    return null;
  }

  return data;
}

export default async function BuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const build = await getBuild(id);

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

  const formattedDate = new Date(build.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

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
              by <span className="text-foreground">{build.author_name}</span> • {formattedDate}
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
