import Link from 'next/link';
import { wikiData, quickFacts, getAllArticles } from '@/lib/wiki-data';

export default function WikiPage() {
  const allArticles = getAllArticles();
  const publishedCount = allArticles.filter(a => a.article.status === 'published').length;
  const totalCount = allArticles.length;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Dreadmyst Wiki</h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Your comprehensive guide to Dreadmyst Online.
            Community-sourced from Discord and player research.
          </p>
          <p className="text-sm text-muted mt-2">
            {publishedCount} of {totalCount} articles complete
          </p>
        </div>

        {/* Quick Facts */}
        <div className="mb-10 p-6 rounded-xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20">
          <h2 className="text-lg font-semibold mb-4 text-center">Quick Facts</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="text-center">
                <div className="text-xl md:text-2xl font-bold text-accent-light">{fact.value}</div>
                <div className="text-xs md:text-sm text-muted">{fact.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* External Links */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <a
            href="https://dreadmyst.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card-bg border border-card-border hover:border-accent/50 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Official Site & Ladder
          </a>
          <Link
            href="/discuss"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card-bg border border-card-border hover:border-accent/50 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Contribute Info
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {wikiData.map((category) => {
            const publishedArticles = category.articles.filter(a => a.status === 'published').length;
            const totalArticles = category.articles.length;
            const hasContent = publishedArticles > 0;

            return (
              <Link
                key={category.slug}
                href={`/wiki/${category.slug}`}
                className={`group block p-5 rounded-xl border transition-all duration-200 ${
                  hasContent
                    ? 'border-card-border bg-card-bg hover:border-accent/50 hover:bg-card-bg/80'
                    : 'border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{category.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg group-hover:text-accent-light transition-colors">
                        {category.title}
                      </h3>
                      {!hasContent && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-500">
                          WIP
                        </span>
                      )}
                    </div>
                    <p className="text-muted text-sm mb-2 line-clamp-2">{category.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span>{totalArticles} article{totalArticles !== 1 ? 's' : ''}</span>
                      {publishedArticles < totalArticles && (
                        <span className="text-yellow-500">
                          {totalArticles - publishedArticles} in progress
                        </span>
                      )}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-muted group-hover:text-accent-light transition-colors flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Popular Articles */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Popular Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { category: 'getting-started', article: 'new-player-guide', title: 'New Player Guide', icon: '🎮' },
              { category: 'classes', article: 'overview', title: 'Class Overview', icon: '🛡️' },
              { category: 'mechanics', article: 'stats', title: 'Stats & Attributes', icon: '⚙️' },
              { category: 'mechanics', article: 'respec', title: 'Respec System', icon: '🔄' },
              { category: 'items', article: 'equipment-tiers', title: 'Equipment Tiers', icon: '⚔️' },
              { category: 'quests', article: 'endgame', title: 'End-Game Content', icon: '🏆' },
            ].map((item) => (
              <Link
                key={`${item.category}/${item.article}`}
                href={`/wiki/${item.category}/${item.article}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-card-border bg-card-bg hover:border-accent/50 transition-colors"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Contributing Notice */}
        <div className="p-6 rounded-xl border border-accent/30 bg-accent/5 text-center">
          <h3 className="text-lg font-semibold mb-2">Help Build the Wiki</h3>
          <p className="text-muted text-sm mb-4 max-w-md mx-auto">
            Found new information? The wiki is community-driven. Share your discoveries
            in the discussions and help fellow players!
          </p>
          <Link
            href="/discuss"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Contribute
          </Link>
        </div>
      </div>
    </div>
  );
}
