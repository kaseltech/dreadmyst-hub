'use client';

// Auth context for Discord login
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signInWithDiscord: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session ? 'exists' : 'none');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('User ID:', session.user.id);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(err => {
      console.error('Error getting session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'has session' : 'no session');
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
    console.log('fetchProfile called with userId:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Profile fetch result:', { data, error });

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
        console.log('Setting profile from DB:', data);
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
    <AuthContext.Provider value={{ user, profile, session, loading, signInWithDiscord, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
