'use client';

import { useState } from 'react';
import Link from 'next/link';
import ChangelogModal from './changelog/ChangelogModal';

export default function Footer() {
  const [changelogOpen, setChangelogOpen] = useState(false);

  return (
    <footer className="border-t border-card-border bg-card-bg mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3 text-accent-light">Dreadmyst Nexus</h3>
            <p className="text-muted text-sm">
              Community-driven resource for Dreadmyst Online. Guides, builds, marketplace, and discussions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/wiki" className="hover:text-foreground transition-colors">Wiki</Link></li>
              <li><Link href="/builds" className="hover:text-foreground transition-colors">Character Builds</Link></li>
              <li><Link href="/discuss" className="hover:text-foreground transition-colors">Discussions</Link></li>
              <li><Link href="/market" className="hover:text-foreground transition-colors">Trade</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-foreground transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Reddit</a></li>
              <li>
                <button
                  onClick={() => setChangelogOpen(true)}
                  className="hover:text-foreground transition-colors"
                >
                  What&apos;s New
                </button>
              </li>
              <li>
                <a
                  href="https://ko-fi.com/dreadmystnexus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-pink-400 hover:text-pink-300 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  Support Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-card-border text-center text-sm text-muted">
          <p>Dreadmyst Nexus is a fan-made community resource. Not affiliated with the game developers.</p>
        </div>
      </div>

      <ChangelogModal isOpen={changelogOpen} onClose={() => setChangelogOpen(false)} />
    </footer>
  );
}
