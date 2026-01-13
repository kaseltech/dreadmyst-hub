'use client';

// Auth context for Discord login
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';
import CharacterNamePrompt from '@/components/profile/CharacterNamePrompt';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signInWithDiscord: async () => {},
  signOut: async () => {},
  updateProfile: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCharacterPrompt, setShowCharacterPrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

  // Check if we should show character name prompt
  useEffect(() => {
    if (profile && !profile.in_game_name && !promptDismissed && !loading) {
      // Small delay to avoid flashing on initial load
      const timer = setTimeout(() => setShowCharacterPrompt(true), 500);
      return () => clearTimeout(timer);
    }
  }, [profile, promptDismissed, loading]);

  // Update profile in state
  function updateProfile(updates: Partial<Profile>) {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      // Direct fetch to Supabase REST API (more reliable than client library)
      const response = await fetch(
        `https://vnafrwxtxadddpbnfdgr.supabase.co/rest/v1/profiles?id=eq.${userId}&select=*`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYWZyd3h0eGFkZGRwYm5mZGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNjAzMjQsImV4cCI6MjA4MzgzNjMyNH0.fAbkswHI8ex_AxQI7zoIZfR82OCChrMjJDQoadDnaTg',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYWZyd3h0eGFkZGRwYm5mZGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNjAzMjQsImV4cCI6MjA4MzgzNjMyNH0.fAbkswHI8ex_AxQI7zoIZfR82OCChrMjJDQoadDnaTg`,
          }
        }
      );
      const profiles = await response.json();
      const data = profiles[0] || null;
      const error = profiles.length === 0 ? { message: 'No profile found' } : null;

      if (error) {
        console.error('Error fetching profile:', error);
        // Profile doesn't exist, try to create it from user metadata
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const username = user.user_metadata?.full_name ||
                          user.user_metadata?.name ||
                          user.email?.split('@')[0] ||
                          'User';
          const avatar = user.user_metadata?.avatar_url ||
                        user.user_metadata?.picture || null;

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              username: username,
              avatar_url: avatar,
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            // Fallback: use user metadata as profile
            setProfile({
              id: userId,
              username: username,
              avatar_url: avatar,
              in_game_name: null,
              created_at: new Date().toISOString(),
            });
          } else {
            setProfile(newProfile);
          }
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Exception in fetchProfile:', err);
      // Fallback to user metadata
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile({
          id: userId,
          username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          in_game_name: null,
          created_at: new Date().toISOString(),
        });
      }
    }
    setLoading(false);
  }

  async function signInWithDiscord() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error('Error signing in:', error);
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signInWithDiscord, signOut, updateProfile }}>
      {children}
      {user && showCharacterPrompt && (
        <CharacterNamePrompt
          isOpen={showCharacterPrompt}
          userId={user.id}
          onComplete={(name) => {
            updateProfile({ in_game_name: name });
            setShowCharacterPrompt(false);
          }}
          onSkip={() => {
            setShowCharacterPrompt(false);
            setPromptDismissed(true);
          }}
        />
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
