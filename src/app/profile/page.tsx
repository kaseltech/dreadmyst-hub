'use client';

import { useState, useEffect } from 'react';
import { supabase, Character, BlockedUser, BookmarkedUser } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { CLASS_DATA, ClassName } from '@/lib/class-data';

export default function ProfilePage() {
  const { user, profile, loading: authLoading, signInWithDiscord, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form
  const [inGameName, setInGameName] = useState('');
  const [hideIgn, setHideIgn] = useState(false);

  // Characters
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newCharName, setNewCharName] = useState('');
  const [newCharClass, setNewCharClass] = useState<ClassName | ''>('');
  const [newCharLevel, setNewCharLevel] = useState(1);
  const [loadingChars, setLoadingChars] = useState(true);

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(true);

  // Bookmarked users
  const [bookmarkedUsers, setBookmarkedUsers] = useState<BookmarkedUser[]>([]);
  const [loadingBookmarked, setLoadingBookmarked] = useState(true);

  // Active tab
  const [activeTab, setActiveTab] = useState<'profile' | 'characters' | 'blocked' | 'friends'>('profile');

  // Load profile data
  useEffect(() => {
    if (profile) {
      setInGameName(profile.in_game_name || '');
      setHideIgn(profile.hide_ign || false);
    }
  }, [profile]);

  // Load characters
  useEffect(() => {
    if (user) {
      fetchCharacters();
      fetchBlockedUsers();
      fetchBookmarkedUsers();
    }
  }, [user]);

  const fetchCharacters = async () => {
    if (!user) return;
    setLoadingChars(true);
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });
    if (!error && data) {
      setCharacters(data);
    }
    setLoadingChars(false);
  };

  const fetchBlockedUsers = async () => {
    if (!user) return;
    setLoadingBlocked(true);
    const { data, error } = await supabase
      .from('blocked_users')
      .select('*, blocked_profile:profiles!blocked_users_blocked_id_fkey(*)')
      .eq('blocker_id', user.id);
    if (!error && data) {
      setBlockedUsers(data.map(b => ({
        ...b,
        blocked_profile: b.blocked_profile
      })));
    }
    setLoadingBlocked(false);
  };

  const fetchBookmarkedUsers = async () => {
    if (!user) return;
    setLoadingBookmarked(true);
    const { data, error } = await supabase
      .from('bookmarked_users')
      .select('*, bookmarked_profile:profiles!bookmarked_users_bookmarked_id_fkey(*)')
      .eq('user_id', user.id);
    if (!error && data) {
      setBookmarkedUsers(data.map(b => ({
        ...b,
        bookmarked_profile: b.bookmarked_profile
      })));
    }
    setLoadingBookmarked(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        in_game_name: inGameName.trim() || null,
        hide_ign: hideIgn,
      })
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save profile' });
    } else {
      setMessage({ type: 'success', text: 'Profile updated!' });
      refreshProfile?.();
    }
    setSaving(false);
  };

  const handleAddCharacter = async () => {
    if (!user || !newCharName.trim()) return;
    setSaving(true);

    const isPrimary = characters.length === 0;
    const { error } = await supabase
      .from('characters')
      .insert({
        user_id: user.id,
        name: newCharName.trim(),
        class_name: newCharClass || null,
        level: newCharLevel,
        is_primary: isPrimary,
      });

    if (error) {
      setMessage({ type: 'error', text: 'Failed to add character' });
    } else {
      setNewCharName('');
      setNewCharClass('');
      setNewCharLevel(1);
      fetchCharacters();
      setMessage({ type: 'success', text: 'Character added!' });
    }
    setSaving(false);
  };

  const handleSetPrimary = async (charId: string) => {
    if (!user) return;

    // First, unset all as primary
    await supabase
      .from('characters')
      .update({ is_primary: false })
      .eq('user_id', user.id);

    // Set the selected one as primary
    await supabase
      .from('characters')
      .update({ is_primary: true })
      .eq('id', charId);

    fetchCharacters();
  };

  const handleDeleteCharacter = async (charId: string) => {
    if (!confirm('Delete this character?')) return;

    await supabase
      .from('characters')
      .delete()
      .eq('id', charId);

    fetchCharacters();
  };

  const handleUnblock = async (blockedId: string) => {
    if (!user) return;

    await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', blockedId);

    fetchBlockedUsers();
    setMessage({ type: 'success', text: 'User unblocked' });
  };

  const handleRemoveBookmark = async (bookmarkedId: string) => {
    if (!user) return;

    await supabase
      .from('bookmarked_users')
      .delete()
      .eq('user_id', user.id)
      .eq('bookmarked_id', bookmarkedId);

    fetchBookmarkedUsers();
    setMessage({ type: 'success', text: 'Bookmark removed' });
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Profile</h1>
          <p className="text-muted mb-6">Sign in to manage your profile</p>
          <button
            onClick={signInWithDiscord}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Sign in with Discord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full" />
          )}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {profile.username}
              {profile.is_admin && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full">
                  ADMIN
                </span>
              )}
            </h1>
            <p className="text-muted">Manage your profile and settings</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-card-border pb-2">
          {(['profile', 'characters', 'friends', 'blocked'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-card-bg text-amber-400 border border-card-border border-b-0'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'characters' && characters.length > 0 && (
                <span className="ml-1.5 text-xs text-muted">({characters.length})</span>
              )}
              {tab === 'friends' && bookmarkedUsers.length > 0 && (
                <span className="ml-1.5 text-xs text-muted">({bookmarkedUsers.length})</span>
              )}
              {tab === 'blocked' && blockedUsers.length > 0 && (
                <span className="ml-1.5 text-xs text-muted">({blockedUsers.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="p-6 rounded-xl bg-card-bg border border-card-border space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">In-Game Name (Primary)</label>
              <input
                type="text"
                value={inGameName}
                onChange={(e) => setInGameName(e.target.value)}
                placeholder="Your main character name"
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e5e5' }}
              />
              <p className="text-xs text-muted mt-1">This is shown when others want to whisper you in-game</p>
            </div>

            {profile.is_admin && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideIgn}
                    onChange={(e) => setHideIgn(e.target.checked)}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <div>
                    <span className="font-medium text-red-400">Hide In-Game Name</span>
                    <p className="text-xs text-muted">As an admin, your IGN won't be shown to other users</p>
                  </div>
                </label>
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #b45309, #e68a00)' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <div className="space-y-4">
            {/* Add Character Form */}
            <div className="p-6 rounded-xl bg-card-bg border border-card-border">
              <h3 className="font-semibold mb-4">Add Character</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  placeholder="Character name"
                  className="sm:col-span-2 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e5e5' }}
                />
                <select
                  value={newCharClass}
                  onChange={(e) => setNewCharClass(e.target.value as ClassName | '')}
                  className="px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e5e5' }}
                >
                  <option value="">Class...</option>
                  {Object.values(CLASS_DATA).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddCharacter}
                  disabled={!newCharName.trim() || saving}
                  className="px-4 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #b45309, #e68a00)' }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Character List */}
            {loadingChars ? (
              <p className="text-muted text-center py-8">Loading characters...</p>
            ) : characters.length === 0 ? (
              <div className="text-center py-12 p-6 rounded-xl bg-card-bg border border-card-border">
                <p className="text-muted">No characters added yet</p>
                <p className="text-xs text-muted mt-1">Add your main and alt characters above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {characters.map((char) => (
                  <div
                    key={char.id}
                    className={`p-4 rounded-xl border transition-all ${
                      char.is_primary
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-card-bg border-card-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {char.class_name === 'paladin' && '🛡️'}
                          {char.class_name === 'mage' && '🔮'}
                          {char.class_name === 'ranger' && '🏹'}
                          {char.class_name === 'cleric' && '✨'}
                          {!char.class_name && '👤'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{char.name}</span>
                            {char.is_primary && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-500 text-white rounded">
                                PRIMARY
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted">
                            {char.class_name ? CLASS_DATA[char.class_name as ClassName]?.name : 'Unknown class'}
                            {char.level > 1 && ` • Level ${char.level}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!char.is_primary && (
                          <button
                            onClick={() => handleSetPrimary(char.id)}
                            className="px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCharacter(char.id)}
                          className="p-1.5 text-muted hover:text-red-400 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friends/Bookmarks Tab */}
        {activeTab === 'friends' && (
          <div className="p-6 rounded-xl bg-card-bg border border-card-border">
            {loadingBookmarked ? (
              <p className="text-muted text-center py-8">Loading...</p>
            ) : bookmarkedUsers.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-muted/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-muted">No bookmarked users yet</p>
                <p className="text-xs text-muted mt-1">Bookmark users from chat to quickly find them later</p>
              </div>
            ) : (
              <div className="space-y-2">
                {bookmarkedUsers.map((bm) => (
                  <div key={bm.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-card-border/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {bm.bookmarked_profile?.avatar_url ? (
                        <img src={bm.bookmarked_profile.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <span className="text-amber-400 font-medium">
                            {bm.bookmarked_profile?.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{bm.nickname || bm.bookmarked_profile?.username}</p>
                        {bm.bookmarked_profile?.in_game_name && (
                          <p className="text-xs text-muted">IGN: {bm.bookmarked_profile.in_game_name}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveBookmark(bm.bookmarked_id)}
                      className="px-3 py-1.5 text-xs text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Blocked Tab */}
        {activeTab === 'blocked' && (
          <div className="p-6 rounded-xl bg-card-bg border border-card-border">
            {loadingBlocked ? (
              <p className="text-muted text-center py-8">Loading...</p>
            ) : blockedUsers.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-muted/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p className="text-muted">No blocked users</p>
                <p className="text-xs text-muted mt-1">Users you block won't be able to message you</p>
              </div>
            ) : (
              <div className="space-y-2">
                {blockedUsers.map((bu) => (
                  <div key={bu.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-card-border/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {bu.blocked_profile?.avatar_url ? (
                        <img src={bu.blocked_profile.avatar_url} alt="" className="w-10 h-10 rounded-full opacity-50" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                          <span className="text-gray-400 font-medium">
                            {bu.blocked_profile?.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-muted">{bu.blocked_profile?.username}</p>
                        <p className="text-xs text-muted/50">
                          Blocked {new Date(bu.blocked_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnblock(bu.blocked_id)}
                      className="px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
