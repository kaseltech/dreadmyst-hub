import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Build {
  id: string;
  title: string;
  class_name: string;
  description: string;
  skills: string | null;
  equipment: string | null;
  playstyle: string | null;
  author_name: string;
  created_at: string;
  upvotes: number;
  tags: string[];
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
  created_at: string;
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
