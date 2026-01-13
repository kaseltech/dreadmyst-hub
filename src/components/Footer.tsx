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
              <li><Link href="/market" className="hover:text-foreground transition-colors">Marketplace</Link></li>
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
