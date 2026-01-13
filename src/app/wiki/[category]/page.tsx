import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategory } from '@/lib/wiki-data';

// Status badge component
function StatusBadge({ status }: { status: string }) {
  if (status === 'published') return null;

  const config = status === 'draft'
    ? { label: 'Draft', bg: 'bg-yellow-500/20', text: 'text-yellow-500' }
    : { label: 'Stub', bg: 'bg-orange-500/20', text: 'text-orange-500' };

  return (
    <span className={`px-1.5 py-0.5 text-xs rounded ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = getCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const publishedArticles = category.articles.filter(a => a.status === 'published');
  const draftArticles = category.articles.filter(a => a.status === 'draft' || a.status === 'stub');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted mb-6">
          <Link href="/wiki" className="hover:text-foreground transition-colors">Wiki</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{category.title}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <span className="text-4xl">{category.icon}</span>
          <div>
            <h1 className="text-3xl font-bold mb-2">{category.title}</h1>
            <p className="text-muted">{category.description}</p>
          </div>
        </div>

        {/* Published Articles */}
        {publishedArticles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-muted">
              Articles ({publishedArticles.length})
            </h2>
            <div className="space-y-3">
              {publishedArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/wiki/${categorySlug}/${article.slug}`}
                  className="group block p-4 rounded-lg border border-card-border bg-card-bg hover:border-accent/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 group-hover:text-accent-light transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted text-sm line-clamp-2">{article.summary}</p>
                      {article.lastUpdated && (
                        <p className="text-xs text-muted/60 mt-2">
                          Updated {article.lastUpdated}
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-5 h-5 text-muted group-hover:text-accent-light transition-colors flex-shrink-0 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Draft/Stub Articles */}
        {draftArticles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-yellow-500">
              In Progress ({draftArticles.length})
            </h2>
            <div className="space-y-3">
              {draftArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/wiki/${categorySlug}/${article.slug}`}
                  className="group block p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">
                          {article.title}
                        </h3>
                        <StatusBadge status={article.status} />
                      </div>
                      <p className="text-muted text-sm line-clamp-2">{article.summary}</p>
                    </div>
                    <svg
                      className="w-5 h-5 text-muted group-hover:text-yellow-400 transition-colors flex-shrink-0 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {category.articles.length === 0 && (
          <div className="text-center py-16 border border-dashed border-card-border rounded-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 mb-4">
              <span className="text-2xl">🚧</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted text-sm max-w-md mx-auto mb-4">
              This section is still being researched. Help us build it by sharing info in the discussions!
            </p>
            <Link
              href="/discuss"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors"
            >
              Contribute Info
            </Link>
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 pt-8 border-t border-card-border">
          <Link
            href="/wiki"
            className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Wiki
          </Link>
        </div>
      </div>
    </div>
  );
}
