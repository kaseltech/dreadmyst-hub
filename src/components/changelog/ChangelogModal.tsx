'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: {
    type: 'new' | 'improved' | 'fixed';
    text: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '0.5.0',
    date: 'January 12, 2026',
    title: 'Rebrand & Build System',
    changes: [
      { type: 'new', text: 'Rebranded to Dreadmyst Nexus with new orange/black theme' },
      { type: 'new', text: 'New logo with portal icon in header' },
      { type: 'new', text: 'Character build system with class-specific abilities' },
      { type: 'new', text: 'Cleric class with all 14 abilities (Paladin, Mage, Ranger coming soon)' },
      { type: 'new', text: 'Base stats input (STR, AGI, INT, WIL, CRG) for builds' },
      { type: 'new', text: 'Ability level selectors (0-5) for each class ability' },
      { type: 'new', text: 'Admin panel for user management and moderation' },
      { type: 'new', text: 'Discussion/reply deletion for authors and admins' },
      { type: 'improved', text: 'Polished UI - refined header, hero section, cards, and buttons' },
      { type: 'improved', text: 'Better typography with improved line-height and letter-spacing' },
      { type: 'improved', text: 'Card hover effects with lift and shadow' },
      { type: 'fixed', text: 'Gold formatting now truncates instead of rounding (1.25M stays 1.25M)' },
      { type: 'fixed', text: 'Marketplace card alignment issues' },
    ],
  },
  {
    version: '0.4.0',
    date: 'January 12, 2026',
    title: 'Marketplace UX Improvements',
    changes: [
      { type: 'new', text: 'Edit listing modal - change price, tier, sockets, and more after posting' },
      { type: 'new', text: 'Stats display on marketplace tiles - see item stats at a glance' },
      { type: 'new', text: 'Dynamic stat picker with type-ahead search - just start typing to filter' },
      { type: 'new', text: 'Equipment vs Materials toggle - list stackable items with quantity' },
      { type: 'new', text: 'In-game name (IGN) shown in chat - easier to find players' },
      { type: 'new', text: 'Whisper command now includes asking price' },
      { type: 'improved', text: 'Simplified listing form - single page, faster to post' },
      { type: 'improved', text: 'Removed confusing suffix system - manually enter stats instead' },
      { type: 'fixed', text: 'Chat widget messages now appear immediately after sending' },
      { type: 'fixed', text: 'Tier colors corrected - Godly (Purple), Holy (Pink), Blessed (Blue)' },
    ],
  },
  {
    version: '0.3.0',
    date: 'January 12, 2026',
    title: 'Chat Widget & Item System',
    changes: [
      { type: 'new', text: 'Floating chat widget - message buyers/sellers without leaving the page' },
      { type: 'new', text: 'Real-time message notifications with toast popups' },
      { type: 'new', text: 'Unread message badge in header' },
      { type: 'new', text: 'Item tier system - Godly, Holy, Blessed tiers with color coding' },
      { type: 'new', text: 'Item builder with base types, suffixes, and socket selection' },
      { type: 'new', text: 'Tier filtering on marketplace' },
      { type: 'new', text: 'Gold formatting (10K, 1.5M) with K/M input shortcuts' },
      { type: 'new', text: 'Keyboard shortcuts - press C to create listing, ESC to close modals' },
      { type: 'new', text: 'Whisper command copy button for in-game contact' },
      { type: 'new', text: 'Discord DM link for direct messaging sellers' },
      { type: 'improved', text: 'Delete confirmation now uses in-app modal instead of browser popup' },
      { type: 'improved', text: 'Listing creation split into easy step-by-step form' },
    ],
  },
  {
    version: '0.2.0',
    date: 'January 11, 2026',
    title: 'Marketplace & Messaging',
    changes: [
      { type: 'new', text: 'Full marketplace for buying and selling items' },
      { type: 'new', text: 'In-app messaging between buyers and sellers' },
      { type: 'new', text: 'Discord authentication' },
      { type: 'new', text: 'User profiles with avatars' },
      { type: 'new', text: 'Real-time chat with message history' },
    ],
  },
  {
    version: '0.1.0',
    date: 'January 10, 2026',
    title: 'Initial Launch',
    changes: [
      { type: 'new', text: 'Wiki section for game information' },
      { type: 'new', text: 'Build guides for character builds' },
      { type: 'new', text: 'Discussion forums' },
      { type: 'new', text: 'Dark fantasy themed design' },
    ],
  },
];

const CHANGELOG_STORAGE_KEY = 'dreadmyst_last_seen_version';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  const typeStyles = {
    new: { label: 'New', bg: 'bg-green-500/20', text: 'text-green-400' },
    improved: { label: 'Improved', bg: 'bg-blue-500/20', text: 'text-blue-400' },
    fixed: { label: 'Fixed', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="What's New" size="lg">
      <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-2">
        {changelog.map((entry, index) => (
          <div key={entry.version} className={index > 0 ? 'pt-6 border-t border-card-border' : ''}>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2 py-1 text-xs font-mono font-bold bg-accent/20 text-accent-light rounded">
                v{entry.version}
              </span>
              <span className="text-sm text-muted">{entry.date}</span>
            </div>
            <h3 className="text-lg font-semibold mb-3">{entry.title}</h3>
            <ul className="space-y-2">
              {entry.changes.map((change, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${typeStyles[change.type].bg} ${typeStyles[change.type].text}`}>
                    {typeStyles[change.type].label}
                  </span>
                  <span className="text-sm text-muted">{change.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// Hook to check if there are new updates since last visit
export function useChangelogNotification() {
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const currentVersion = changelog[0]?.version;

  useEffect(() => {
    const lastSeen = localStorage.getItem(CHANGELOG_STORAGE_KEY);
    if (lastSeen !== currentVersion) {
      setHasNewUpdates(true);
    }
  }, [currentVersion]);

  const markAsSeen = () => {
    localStorage.setItem(CHANGELOG_STORAGE_KEY, currentVersion);
    setHasNewUpdates(false);
  };

  return { hasNewUpdates, markAsSeen, currentVersion };
}
