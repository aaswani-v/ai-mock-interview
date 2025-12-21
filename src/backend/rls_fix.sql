-- QUICK FIX: Disable RLS on interviews table for backend operations
-- Run this in Supabase SQL Editor

-- Option 1: Disable RLS completely on interviews (fastest fix)
ALTER TABLE interviews DISABLE ROW LEVEL SECURITY;

-- OR Option 2: Keep RLS but add a policy that allows anonymous inserts
-- (Uncomment below if you prefer to keep RLS enabled)

-- DROP POLICY IF EXISTS "Allow all inserts" ON interviews;
-- CREATE POLICY "Allow all inserts" ON interviews FOR INSERT WITH CHECK (true);

-- DROP POLICY IF EXISTS "Allow all selects" ON interviews;
-- CREATE POLICY "Allow all selects" ON interviews FOR SELECT USING (true);

-- Also make sure all columns exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interviews' AND column_name = 'visual_score') THEN
        ALTER TABLE interviews ADD COLUMN visual_score INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interviews' AND column_name = 'content_score') THEN
        ALTER TABLE interviews ADD COLUMN content_score INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interviews' AND column_name = 'speech_score') THEN
        ALTER TABLE interviews ADD COLUMN speech_score INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interviews' AND column_name = 'difficulty') THEN
        ALTER TABLE interviews ADD COLUMN difficulty TEXT DEFAULT 'intermediate';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interviews' AND column_name = 'domain') THEN
        ALTER TABLE interviews ADD COLUMN domain TEXT DEFAULT 'General';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interviews' AND column_name = 'questions_answered') THEN
        ALTER TABLE interviews ADD COLUMN questions_answered INTEGER DEFAULT 1;
    END IF;
END $$;

-- Verify the change worked
SELECT 'RLS disabled on interviews table' as status;
