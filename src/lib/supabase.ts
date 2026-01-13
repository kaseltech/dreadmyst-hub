import { createBrowserClient } from '@supabase/ssr';

// Hardcoded temporarily to bypass Vercel env var caching issues
const supabaseUrl = 'https://vnafrwxtxadddpbnfdgr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYWZyd3h0eGFkZGRwYm5mZGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNjAzMjQsImV4cCI6MjA4MzgzNjMyNH0.fAbkswHI8ex_AxQI7zoIZfR82OCChrMjJDQoadDnaTg';

// Create client with realtime disabled for regular queries
// This prevents connection pooling issues on page refresh
let _supabase: ReturnType<typeof createBrowserClient> | null = null;

export const supabase = (() => {
  if (typeof window === 'undefined') {
    // Server-side: create new client each time
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  // Client-side: reuse singleton
  if (!_supabase) {
    _supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
})();

// For realtime subscriptions (chat), create dedicated client
export function createRealtimeClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Types for our database tables
export interface BuildStats {
  strength?: number;
  agility?: number;
  intelligence?: number;
  willpower?: number;
  courage?: number;
}

// More flexible secondary stats - includes general, combat, and skills
export interface BuildSecondaryStats {
  // General
  health?: number;
  mana?: number;
  regeneration?: number;
  meditate?: number;
  // Combat
  meleeCritical?: number;
  rangedCritical?: number;
  spellCritical?: number;
  dodgeRating?: number;
  blockRating?: number;
  resistFrost?: number;
  resistFire?: number;
  resistShadow?: number;
  resistHoly?: number;
  // Skills
  skillStaves?: number;
  skillMaces?: number;
  skillAxes?: number;
  skillSwords?: number;
  skillRanged?: number;
  skillDaggers?: number;
  skillWands?: number;
  skillShields?: number;
  bartering?: number;
  lockpicking?: number;
  [key: string]: number | undefined;
}

export interface BuildAbilities {
  [abilityId: string]: number; // ability id -> level (0-5)
}

export interface Build {
  id: string;
  title: string;
  class_name: string;
  description: string;
  skills: string | null; // Legacy text field
  equipment: string | null;
  playstyle: string | null;
  author_name: string;
  author_id?: string | null;
  created_at: string;
  updated_at?: string | null;
  upvotes: number;
  tags: string[];
  // New structured fields
  base_stats?: BuildStats | null;
  secondary_stats?: BuildSecondaryStats | null;
  abilities?: BuildAbilities | null;
  youtube_video_id?: string | null;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  author_name: string;
  category: string;
  created_at: string;
  replies_count: number;
}

export interface Reply {
  id: string;
  discussion_id: string;
  content: string;
  author_name: string;
  created_at: string;
}

export interface WikiArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  updated_at: string;
}

// Marketplace types
export interface Profile {
  id: string;
  username: string;
  in_game_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  hide_ign: boolean;
  discord_id: string | null;
  created_at: string;
}

// Character/alt types
export interface Character {
  id: string;
  user_id: string;
  name: string;
  is_primary: boolean;
  class_name: string | null;
  level: number;
  notes: string | null;
  created_at: string;
}

// Chat feature types
export interface ArchivedConversation {
  id: string;
  user_id: string;
  conversation_id: string;
  archived_at: string;
}

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  blocked_at: string;
  reason: string | null;
  blocked_profile?: Profile;
}

export interface BookmarkedUser {
  id: string;
  user_id: string;
  bookmarked_id: string;
  nickname: string | null;
  created_at: string;
  bookmarked_profile?: Profile;
}

export type ItemCategory = 'weapons' | 'armor' | 'accessories' | 'consumables' | 'materials' | 'other';
export type ListingStatus = 'active' | 'sold' | 'expired' | 'deleted';

export interface Listing {
  id: string;
  seller_id: string;
  item_name: string;
  item_description: string | null;
  price: number;
  category: ItemCategory;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  // New item system fields
  tier: string | null;
  base_type_id: string | null;
  suffix_modifier_id: string | null;
  suffix_animal_id: string | null;
  socket_count: number;
  level_requirement: number;
  stats: Record<string, number> | null;
  equip_effects: string[] | null;
  // Relations
  seller?: Profile;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  listing?: Listing;
  buyer?: Profile;
  seller?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: Profile;
}
