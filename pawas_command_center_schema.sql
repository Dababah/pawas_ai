-- ============================================================
-- PAWAS AI — COMMAND CENTER DATABASE SCHEMA
-- Optimized for Muhammad Fawwaz Ali (IT Student, Trader, Business Owner)
-- ============================================================

-- 1. TASK MANAGEMENT (Kuliah & Lab Networking)
CREATE TABLE IF NOT EXISTS task_management (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nim TEXT DEFAULT '2111xxxx', -- User identification
  title TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  status_lab TEXT DEFAULT 'Pending' CHECK (status_lab IN ('Pending', 'In Progress', 'Completed', 'Verified')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  category TEXT DEFAULT 'Kuliah', -- e.g., Capstone, Networking, Lab
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. INVENTORY HP (Corepawas Gadget Business)
CREATE TABLE IF NOT EXISTS inventory_hp (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipe_hp TEXT NOT NULL,
  harga_beli BIGINT DEFAULT 0,
  harga_jual BIGINT DEFAULT 0,
  status_barang TEXT DEFAULT 'Ready' CHECK (status_barang IN ('Ready', 'Sold', 'Reserved', 'Service')),
  buyer_name TEXT DEFAULT '',
  sold_at TIMESTAMPTZ,
  imei TEXT,
  condition TEXT DEFAULT 'Second' CHECK (condition IN ('New', 'Second', 'Refurbished')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TRADING JOURNAL (XAUUSD / BTCUSD)
CREATE TABLE IF NOT EXISTS trading_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pair TEXT DEFAULT 'XAUUSD',
  major_trend TEXT DEFAULT 'Bullish' CHECK (major_trend IN ('Bullish', 'Bearish', 'Sideways')),
  entry_price DECIMAL(18,8),
  exit_price DECIMAL(18,8),
  profit_loss DECIMAL(18,8) DEFAULT 0,
  strategy TEXT DEFAULT 'SMC', -- Smart Money Concepts
  notes TEXT,
  image_url TEXT, -- Link to chart screenshot
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SCHEDULES (Gym, Meetings, Deadlines)
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General' CHECK (category IN ('Gym', 'Project', 'Meeting', 'Personal')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. DASHBOARD SUMMARY VIEW (For "Command-to-Widget" Logic)
-- This view helps the AI quickly summarize state
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT 
  (SELECT COUNT(*) FROM task_management WHERE status_lab != 'Completed') as pending_tasks,
  (SELECT COUNT(*) FROM inventory_hp WHERE status_barang = 'Ready') as available_stock,
  (SELECT SUM(profit_loss) FROM trading_journal WHERE created_at >= date_trunc('day', now())) as daily_trading_pnl;

-- ============================================================
-- INDEXES for fast AI lookups
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_task_deadline ON task_management(deadline);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_hp(status_barang);
CREATE INDEX IF NOT EXISTS idx_trading_pair ON trading_journal(pair);
CREATE INDEX IF NOT EXISTS idx_schedule_time ON schedules(scheduled_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE task_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_hp ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Development policy: allow everything
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['task_management','inventory_hp','trading_journal','schedules'])
  LOOP
    EXECUTE format('
      CREATE POLICY "Allow all for %s" ON %s
        FOR ALL USING (true) WITH CHECK (true);
    ', t, t);
  END LOOP;
END;
$$;
