/**
 * Add firebase_id column to platform_jobs table
 * This script uses Supabase REST API to execute SQL
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

async function addFirebaseIdColumn() {
  console.log("🔧 Adding firebase_id column to platform_jobs table...");
  
  const sql = `
    -- Add firebase_id column
    ALTER TABLE public.platform_jobs 
    ADD COLUMN IF NOT EXISTS firebase_id TEXT UNIQUE;
    
    -- Add index
    CREATE INDEX IF NOT EXISTS idx_platform_jobs_firebase_id 
    ON public.platform_jobs(firebase_id);
  `;
  
  try {
    // Use Supabase REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      console.log("⚠️  Note: Direct SQL execution via API is not available.");
      console.log("📝 Please run this SQL manually in Supabase SQL Editor:");
      console.log("════════════════════════════════════════════════════════════");
      console.log(sql);
      console.log("════════════════════════════════════════════════════════════");
      console.log("After running the SQL, execute: yarn sync-all-jobs");
      return;
    }
    
    console.log("✅ Column added successfully!");
    
  } catch (error: any) {
    console.log("⚠️  Could not add column automatically.");
    console.log("📝 Please run this SQL manually in Supabase SQL Editor:");
    console.log("════════════════════════════════════════════════════════════");
    console.log(sql);
    console.log("════════════════════════════════════════════════════════════");
    console.log("After running the SQL, execute: yarn sync-all-jobs");
  }
}

addFirebaseIdColumn();
