import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Build {
  id: string;
  title: string;
  class_name: string;
  description: string;
  build_data: Record<string, unknown>;
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

export interface WikiArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  updated_at: string;
}
