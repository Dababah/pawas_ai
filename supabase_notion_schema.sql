-- ============================================================
-- PAWAS AI — Complete Supabase Schema
-- Optimized for AI Agent CRUD operations
-- ============================================================

-- 1. PAGES (Workspace — Notion-like pages)
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT DEFAULT '',
  icon TEXT DEFAULT '📄',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BLOCKS (Content blocks inside pages)
CREATE TABLE IF NOT EXISTS blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'document',
  content JSONB,
  position_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TASKS (Deadline & Task Management)
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  matkul TEXT DEFAULT '',
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. NOTES (Quick notes — legacy support)
CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  category TEXT DEFAULT 'Personal',
  icon TEXT DEFAULT '📝',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. INVENTORY (Corepawas Gadget Business)
CREATE TABLE IF NOT EXISTS inventory (
  id BIGSERIAL PRIMARY KEY,
  unit TEXT NOT NULL,
  buy_price BIGINT DEFAULT 0,
  sell_price BIGINT DEFAULT 0,
  status TEXT DEFAULT 'ready' CHECK (status IN ('ready', 'sold', 'reserved')),
  buyer_name TEXT DEFAULT '',
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TRADES (Trading Journal — XAUUSD & BTCUSD)
CREATE TABLE IF NOT EXISTS trades (
  id BIGSERIAL PRIMARY KEY,
  pair TEXT DEFAULT 'XAUUSD',
  entry DECIMAL(12,4),
  exit_price DECIMAL(12,4),
  result TEXT DEFAULT '',
  pips DECIMAL(8,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  strategy TEXT DEFAULT 'SMC',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SCHEDULES (Gym, meetings, events)
CREATE TABLE IF NOT EXISTS schedules (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  recurring TEXT DEFAULT 'none' CHECK (recurring IN ('none', 'daily', 'weekly')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES for fast AI queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_trades_pair ON trades(pair);
CREATE INDEX IF NOT EXISTS idx_pages_updated ON pages(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_blocks_page ON blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(scheduled_at);

-- ============================================================
-- AUTO-UPDATE updated_at on pages
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pages_updated_at ON pages;
CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Enable for production
-- ============================================================
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anon users (dev mode)
-- Replace with proper policies for production
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['pages','blocks','tasks','notes','inventory','trades','schedules'])
  LOOP
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS "Allow all for %s" ON %s
        FOR ALL USING (true) WITH CHECK (true);
    ', t, t);
  END LOOP;
END;
$$;
