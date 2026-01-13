'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';
import ChangelogModal, { useChangelogNotification } from './changelog/ChangelogModal';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/market', label: 'Market', highlight: true },
  { href: '/wiki', label: 'Wiki' },
  { href: '/builds', label: 'Builds' },
  { href: '/discuss', label: 'Discuss' },
];

export default function Header() {
  const pathname = usePathname();
  const { user, profile, loading, signInWithDiscord, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const { hasNewUpdates, markAsSeen } = useChangelogNotification();

  const handleOpenChangelog = () => {
    setChangelogOpen(true);
    markAsSeen();
  };

  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    const { data: convos } = await supabase
      .from('conversations')
      .select('id')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

    if (!convos || convos.length === 0) {
      setUnreadCount(0);
      return;
    }

    const convoIds = convos.map(c => c.id);

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convoIds)
      .eq('read', false)
      .neq('sender_id', user.id);

    setUnreadCount(count || 0);
  }, [user]);

  // Subscribe to message changes
  useEffect(() => {
    if (!user) return;

    fetchUnreadCount();

    const channel = supabase
      .channel('header-unread')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUnreadCount]);

  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-card-bg/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo - Portal icon */}
          <Link
            href="/"
            className="flex items-center hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] transition-all duration-200"
          >
            <img
              src="/portal.png"
              alt="Dreadmyst Nexus"
              className="w-[56px] h-[56px] object-contain -my-3"
            />
          </Link>

          {/* Navigation - centered */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-2.5 text-[14px] font-medium tracking-[0.04em] transition-colors duration-200 ${
                    isActive
                      ? 'text-amber-500'
                      : 'text-white/70 hover:text-white/90'
                  }`}
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-amber-500 rounded-sm" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile nav */}
          <nav className="flex md:hidden items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-foreground'
                      : 'text-muted'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-card-border animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/messages"
                  className={`relative p-2 rounded-lg transition-colors ${
                    pathname.startsWith('/messages')
                      ? 'bg-card-border text-foreground'
                      : 'text-muted hover:text-foreground hover:bg-card-border/50'
                  }`}
                  title="Messages"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-card-border/50 transition-colors">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="w-8 h-8 rounded-full ring-2 ring-card-border"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-card-border flex items-center justify-center text-foreground text-sm font-medium">
                        {(profile?.in_game_name || profile?.username)?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </button>
                  <div className="absolute right-0 mt-2 w-52 py-2 bg-card-bg border border-card-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="px-4 py-2 border-b border-card-border">
                      <p className="font-medium text-sm">{profile?.in_game_name || profile?.username}</p>
                      <p className="text-xs text-muted">Signed in</p>
                    </div>
                    <Link
                      href="/market?mine=true"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-card-border/50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      My Listings
                    </Link>
                    <button
                      onClick={handleOpenChangelog}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-card-border/50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      What&apos;s New
                      {hasNewUpdates && (
                        <span className="ml-auto w-2 h-2 bg-orange-500 rounded-full" />
                      )}
                    </button>
                    {profile?.is_admin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-card-border/50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-card-border mt-1 pt-1">
                      <button
                        onClick={signOut}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-card-border/50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={signInWithDiscord}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <ChangelogModal isOpen={changelogOpen} onClose={() => setChangelogOpen(false)} />
    </header>
  );
}
