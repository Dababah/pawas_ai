import { createClient } from '@supabase/supabase-js';

// Connection: Pawas.ai Unified Database (Notes, Tasks, Trading, Inventory)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Task = {
  id?: number;
  title: string;
  matkul: string;
  deadline: string;
  status: 'pending' | 'completed';
};

export type Inventory = {
  id?: number;
  unit: string;
  buy_price: number;
  sell_price: number;
  status: 'ready' | 'sold';
};

export type Trade = {
  id?: number;
  pair: string;
  entry: number;
  result: string;
  notes: string;
  created_at?: string;
};

export type Note = {
  id?: number;
  title: string;
  content: string;
  category: string;
  icon: string;
};
