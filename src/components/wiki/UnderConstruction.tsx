'use client';

import Link from 'next/link';

interface UnderConstructionProps {
  title: string;
  type: 'draft' | 'stub';
  summary?: string;
  backLink?: string;
  backLabel?: string;
}

export default function UnderConstruction({
  title,
  type,
  summary,
  backLink = '/wiki',
  backLabel = 'Back to Wiki',
}: UnderConstructionProps) {
  const isStub = type === 'stub';

  return (
    <div className="text-center py-16">
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 mb-6">
        <span className="text-4xl">{isStub ? '📝' : '🚧'}</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-3">{title}</h1>

      {/* Status Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-sm font-medium mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {isStub ? 'Stub Article' : 'Under Construction'}
      </div>

      {/* Summary if provided */}
      {summary && (
        <p className="text-muted max-w-md mx-auto mb-6">{summary}</p>
      )}

      {/* Message */}
      <div className="max-w-lg mx-auto mb-8">
        {isStub ? (
          <p className="text-muted">
            This article is a stub and needs more information.
            If you have knowledge about this topic, please share it in the discussions!
          </p>
        ) : (
          <p className="text-muted">
            This page is currently being written.
            Check back soon for complete information, or help contribute in the discussions!
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/discuss"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-light text-white font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Contribute Info
        </Link>
        <Link
          href={backLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-card-border text-muted hover:text-foreground font-medium rounded-lg transition-colors"
        >
          ← {backLabel}
        </Link>
      </div>

      {/* Construction animation */}
      <div className="mt-12 flex justify-center gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-yellow-500/50 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
