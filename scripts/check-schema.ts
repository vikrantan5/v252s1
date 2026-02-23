/**
 * Check and prepare Supabase schema for sync
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log("🔍 Checking Supabase schema...");
  
  try {
    // Try to query the firebase_id column
    const { data, error } = await supabase
      .from("platform_jobs")
      .select("firebase_id")
      .limit(1);
    
    if (error) {
      if (error.message.includes("column") || error.message.includes("firebase_id")) {
        console.log("❌ firebase_id column does NOT exist");
        console.log("📝 ACTION REQUIRED: Run this SQL in Supabase SQL Editor:");
        console.log("════════════════════════════════════════════════════════════");
        console.log(`ALTER TABLE public.platform_jobs ADD COLUMN IF NOT EXISTS firebase_id TEXT UNIQUE;`);
        console.log(`CREATE INDEX IF NOT EXISTS idx_platform_jobs_firebase_id ON public.platform_jobs(firebase_id);`);
        console.log("════════════════════════════════════════════════════════════");
        console.log("Then run: yarn sync-all-jobs");
        return false;
      } else {
        console.error("Error checking schema:", error);
        return false;
      }
    }
    
    console.log("✅ firebase_id column exists!");
    console.log("✅ Schema is ready for sync");
    
    // Check how many jobs have firebase_id
    const { count } = await supabase
      .from("platform_jobs")
      .select("*", { count: 'exact', head: true })
      .not("firebase_id", "is", null);
    
    const { count: totalCount } = await supabase
      .from("platform_jobs")
      .select("*", { count: 'exact', head: true });
    
    console.log(`📊 Jobs with firebase_id: ${count || 0} / ${totalCount || 0}`);
    
    if ((count || 0) < (totalCount || 0)) {
      console.log("💡 Some jobs are missing firebase_id. Run: yarn sync-all-jobs");
    } else if (totalCount === 0) {
      console.log("💡 No jobs in Supabase yet. Run: yarn sync-all-jobs to import from Firebas");
    } else {
      console.log("✅ All jobs have firebase_id!");
    }
    
    return true;
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

checkSchema();
