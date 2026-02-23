/**
 * Add firebase_id column to platform_jobs table
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addFirebaseIdColumn() {
  console.log("🔧 Adding firebase_id column to platform_jobs table...");
  
  try {
    // Check if column exists by trying to select it
    const { error: checkError } = await supabase
      .from('platform_jobs')
      .select('firebase_id')
      .limit(1);
    
    // If error contains "column does not exist", we need to add it
    if (checkError && checkError.message.includes('column "firebase_id" does not exist')) {
      console.log("📝 Column doesn't exist. Please run this SQL in Supabase SQL Editor:");
      console.log("════════════════════════════════════════════════════════════");
      console.log(`
-- Add firebase_id column
ALTER TABLE public.platform_jobs 
ADD COLUMN IF NOT EXISTS firebase_id TEXT UNIQUE;

-- Add index
CREATE INDEX IF NOT EXISTS idx_platform_jobs_firebase_id 
ON public.platform_jobs(firebase_id);
      `);
      console.log("════════════════════════════════════════════════════════════");
    } else {
      console.log("✅ Column already exists or can be queried!");
    }
    
  } catch (error: any) {
    console.log("⚠️  Could not check column automatically.");
    console.log("📝 Please run this SQL manually in Supabase SQL Editor:");
    console.log("════════════════════════════════════════════════════════════");
    console.log(`
-- Add firebase_id column
ALTER TABLE public.platform_jobs 
ADD COLUMN IF NOT EXISTS firebase_id TEXT UNIQUE;

-- Add index
CREATE INDEX IF NOT EXISTS idx_platform_jobs_firebase_id 
ON public.platform_jobs(firebase_id);
    `);
    console.log("════════════════════════════════════════════════════════════");
  }
  
  console.log("\n📋 After adding the column, run: yarn sync-all-jobs");
}

addFirebaseIdColumn();