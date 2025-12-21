-- Migration script for existing Supabase databases
-- Run this in Supabase SQL Editor to add new columns to existing tables

-- Add new columns to interviews table (if they don't exist)
DO $$ 
BEGIN
    -- Add visual_score column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interviews' AND column_name = 'visual_score') THEN
        ALTER TABLE interviews ADD COLUMN visual_score INTEGER DEFAULT 0;
    END IF;
    
    -- Add content_score column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interviews' AND column_name = 'content_score') THEN
        ALTER TABLE interviews ADD COLUMN content_score INTEGER DEFAULT 0;
    END IF;
    
    -- Add speech_score column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interviews' AND column_name = 'speech_score') THEN
        ALTER TABLE interviews ADD COLUMN speech_score INTEGER DEFAULT 0;
    END IF;
    
    -- Add difficulty column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interviews' AND column_name = 'difficulty') THEN
        ALTER TABLE interviews ADD COLUMN difficulty TEXT DEFAULT 'intermediate';
    END IF;
    
    -- Add domain column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interviews' AND column_name = 'domain') THEN
        ALTER TABLE interviews ADD COLUMN domain TEXT DEFAULT 'General';
    END IF;
    
    -- Add questions_answered column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interviews' AND column_name = 'questions_answered') THEN
        ALTER TABLE interviews ADD COLUMN questions_answered INTEGER DEFAULT 1;
    END IF;
END $$;

-- Create index on domain for faster querying
CREATE INDEX IF NOT EXISTS idx_interviews_domain ON interviews(domain);

-- Create index on difficulty for faster querying  
CREATE INDEX IF NOT EXISTS idx_interviews_difficulty ON interviews(difficulty);

-- Update RLS policies to allow service role access (for backend operations)
-- Note: The backend uses the service role key which bypasses RLS,
-- but users should still have their own RLS policies for client-side access

COMMENT ON TABLE interviews IS 'Extended interview tracking with visual, content, and speech scores';
