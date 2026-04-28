-- 1. Pages Table (The "Files/Folders")
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled',
  icon TEXT,
  cover TEXT,
  parent_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Blocks Table (The "Notion Canvas Content")
CREATE TABLE blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'text', 'image', 'table', 'todo', 'toggle', 'heading'
  content JSONB NOT NULL DEFAULT '{}',
  position_index INTEGER NOT NULL, -- For Drag & Drop ordering
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Databases Table (For Business/College Tables)
CREATE TABLE databases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  properties JSONB NOT NULL DEFAULT '[]', -- Array of properties: [{name: 'Status', type: 'select', options: ['To Do', 'Done']}]
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Database Rows (Items inside the database)
CREATE TABLE database_rows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  database_id UUID REFERENCES databases(id) ON DELETE CASCADE,
  properties_data JSONB NOT NULL DEFAULT '{}', -- Key-value pairs matching database properties
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_rows ENABLE ROW LEVEL SECURITY;

-- Create Policies (Only users can see/edit their own data)
CREATE POLICY "Users can manage their own pages" ON pages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own blocks" ON blocks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own databases" ON databases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own database rows" ON database_rows FOR ALL USING (auth.uid() = user_id);

-- Create a function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_pages_modtime BEFORE UPDATE ON pages FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_blocks_modtime BEFORE UPDATE ON blocks FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_databases_modtime BEFORE UPDATE ON databases FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_database_rows_modtime BEFORE UPDATE ON database_rows FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
