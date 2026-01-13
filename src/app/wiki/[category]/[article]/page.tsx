import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategory, getArticle, wikiData } from '@/lib/wiki-data';
import UnderConstruction from '@/components/wiki/UnderConstruction';

// Simple markdown-like parser for wiki content
function parseContent(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let currentKey = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={currentKey++} className="list-disc list-inside space-y-1 mb-4 text-muted">
          {listItems.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const parseInline = (text: string): React.ReactNode => {
    // Parse bold and links
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold: **text**
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(remaining.slice(0, boldMatch.index));
        }
        parts.push(
          <strong key={key++} className="text-foreground font-semibold">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
        continue;
      }

      parts.push(remaining);
      break;
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      continue;
    }

    // List item
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const content = trimmed.slice(1).trim();
      listItems.push(content);
      continue;
    }

    // Numbered list
    if (/^\d+\./.test(trimmed)) {
      flushList();
      const content = trimmed.replace(/^\d+\.\s*/, '');
      elements.push(
        <p key={currentKey++} className="text-muted mb-2 pl-4">
          <span className="text-accent-light font-medium">{trimmed.match(/^\d+/)?.[0]}.</span>{' '}
          {parseInline(content)}
        </p>
      );
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={currentKey++} className="text-muted mb-4">
        {parseInline(trimmed)}
      </p>
    );
  }

  flushList();
  return elements;
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; article: string }>;
}) {
  const { category: categorySlug, article: articleSlug } = await params;
  const category = getCategory(categorySlug);
  const article = getArticle(categorySlug, articleSlug);

  if (!category || !article) {
    notFound();
  }

  // Show under construction for drafts and stubs
  if (article.status === 'draft' || article.status === 'stub') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted mb-6">
            <Link href="/wiki" className="hover:text-foreground transition-colors">Wiki</Link>
            <span className="mx-2">/</span>
            <Link href={`/wiki/${categorySlug}`} className="hover:text-foreground transition-colors">
              {category.title}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{article.title}</span>
          </nav>

          <UnderConstruction
            title={article.title}
            type={article.status}
            summary={article.summary}
            backLink={`/wiki/${categorySlug}`}
            backLabel={`Back to ${category.title}`}
          />
        </div>
      </div>
    );
  }

  // Get related articles
  const relatedArticles = article.relatedArticles
    ?.map((path) => {
      const [catSlug, artSlug] = path.split('/');
      const cat = wikiData.find((c) => c.slug === catSlug);
      const art = cat?.articles.find((a) => a.slug === artSlug);
      return art && cat ? { category: cat, article: art } : null;
    })
    .filter(Boolean) as { category: typeof category; article: typeof article }[] | undefined;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted mb-6">
          <Link href="/wiki" className="hover:text-foreground transition-colors">Wiki</Link>
          <span className="mx-2">/</span>
          <Link href={`/wiki/${categorySlug}`} className="hover:text-foreground transition-colors">
            {category.title}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{article.title}</span>
        </nav>

        {/* Article Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">{article.title}</h1>
          <p className="text-muted text-lg">{article.summary}</p>
          {article.lastUpdated && (
            <p className="text-sm text-muted/60 mt-2">
              Last updated: {article.lastUpdated}
            </p>
          )}
        </div>

        {/* Table of Contents */}
        {article.sections && article.sections.length > 1 && (
          <div className="mb-8 p-4 rounded-lg border border-card-border bg-card-bg">
            <h2 className="text-sm font-semibold text-muted mb-3">Contents</h2>
            <ul className="space-y-1">
              {article.sections.map((section, i) => (
                <li key={i}>
                  <a
                    href={`#section-${i}`}
                    className="text-sm text-accent-light hover:text-accent transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Article Content */}
        <div className="space-y-8">
          {article.sections?.map((section, i) => (
            <section key={i} id={`section-${i}`} className="scroll-mt-20">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-card-border">
                {section.title}
              </h2>
              <div className="prose prose-invert max-w-none">
                {parseContent(section.content)}
              </div>
            </section>
          ))}
        </div>

        {/* Tips */}
        {article.tips && article.tips.length > 0 && (
          <div className="mt-10 p-5 rounded-xl border border-accent/30 bg-accent/5">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Tips
            </h3>
            <ul className="space-y-2">
              {article.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-muted">
                  <span className="text-accent-light">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedArticles.map(({ category: cat, article: art }) => (
                <Link
                  key={`${cat.slug}/${art.slug}`}
                  href={`/wiki/${cat.slug}/${art.slug}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-card-border bg-card-bg hover:border-accent/50 transition-colors"
                >
                  <span className="text-xl">{cat.icon}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{art.title}</p>
                    <p className="text-xs text-muted truncate">{cat.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contribute CTA */}
        <div className="mt-10 p-5 rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-center">
          <h3 className="font-semibold mb-2">Have More Info?</h3>
          <p className="text-muted text-sm mb-4">
            Help improve this article by sharing your knowledge in the discussions!
          </p>
          <Link
            href="/discuss"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors"
          >
            Contribute
          </Link>
        </div>

        {/* Navigation */}
        <div className="mt-10 pt-8 border-t border-card-border flex justify-between items-center">
          <Link
            href={`/wiki/${categorySlug}`}
            className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {category.title}
          </Link>
          <Link
            href="/wiki"
            className="text-muted hover:text-foreground transition-colors text-sm"
          >
            Wiki Home
          </Link>
        </div>
      </div>
    </div>
  );
}
