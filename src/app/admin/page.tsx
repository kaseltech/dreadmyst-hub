'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Profile } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Check if current user is admin
  const isAdmin = profile?.is_admin === true;

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
      return;
    }
    if (isAdmin) {
      fetchUsers();
    }
  }, [authLoading, isAdmin, router]);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  async function toggleAdmin(userId: string, currentStatus: boolean) {
    setUpdating(userId);

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId);

    if (error) {
      console.error('Error updating admin status:', error);
      alert('Failed to update admin status');
    } else {
      setUsers(users.map(u =>
        u.id === userId ? { ...u, is_admin: !currentStatus } : u
      ));
    }
    setUpdating(null);
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted mb-8">Manage users and site moderation</p>

        {/* User Management */}
        <div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
          <div className="px-6 py-4 border-b border-card-border">
            <h2 className="text-lg font-semibold">Users ({users.length})</h2>
          </div>

          <div className="divide-y divide-card-border">
            {users.map((u) => (
              <div key={u.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {u.avatar_url ? (
                    <img
                      src={u.avatar_url}
                      alt={u.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-card-border flex items-center justify-center text-foreground font-medium">
                      {u.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {u.username}
                      {u.id === user?.id && (
                        <span className="ml-2 text-xs text-muted">(you)</span>
                      )}
                    </p>
                    {u.in_game_name && (
                      <p className="text-sm text-muted">IGN: {u.in_game_name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {u.is_admin && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-amber-500/20 text-amber-400">
                      Admin
                    </span>
                  )}

                  {/* Don't allow removing own admin status */}
                  {u.id !== user?.id && (
                    <button
                      onClick={() => toggleAdmin(u.id, u.is_admin)}
                      disabled={updating === u.id}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                        u.is_admin
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-card-border text-muted hover:text-foreground'
                      }`}
                    >
                      {updating === u.id
                        ? 'Updating...'
                        : u.is_admin
                        ? 'Remove Admin'
                        : 'Make Admin'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-lg border border-card-border bg-card-bg/50 text-sm text-muted">
          <p><strong className="text-foreground">Admin privileges:</strong></p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Delete any discussion or reply</li>
            <li>Access this admin panel</li>
            <li>Grant/revoke admin status to other users</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
