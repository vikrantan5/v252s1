// scripts/sync-job-ids.ts
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import admin from "firebase-admin";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.error("   Check your .env.local file for:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Initialize Firebase Admin directly
let firebaseApp: admin.app.App;

try {
  // Check if Firebase is already initialized
  if (admin.apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.error("❌ Missing Firebase environment variables!");
      console.error("   Check your .env.local file for:");
      console.error("   - FIREBASE_PROJECT_ID");
      console.error("   - FIREBASE_CLIENT_EMAIL");
      console.error("   - FIREBASE_PRIVATE_KEY");
      process.exit(1);
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("✅ Firebase Admin initialized successfully");
  } else {
    firebaseApp = admin.apps[0]!;
  }
} catch (error: any) {
  console.error("❌ Failed to initialize Firebase Admin:", error.message);
  process.exit(1);
}

// Create Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Get Firestore instance
const db = firebaseApp.firestore();

async function syncJobFirebaseIds() {
  console.log("🚀 Starting job Firebase ID sync...");
  console.log("======================================");
  
  try {
    // First, add the firebase_id column if it doesn't exist
    console.log("🔧 Checking if firebase_id column exists...");
    
    // Check if column exists by trying to select it
    const { error: checkError } = await supabaseAdmin
      .from("platform_jobs")
      .select("firebase_id")
      .limit(1);
    
    if (checkError && checkError.message.includes("column")) {
      console.log("⚠️  firebase_id column doesn't exist!");
      console.log(`
📝 Please run this SQL in your Supabase SQL editor first:

ALTER TABLE public.platform_jobs 
ADD COLUMN IF NOT EXISTS firebase_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_platform_jobs_firebase_id 
ON public.platform_jobs(firebase_id);
      `);
      return;
    }
    
    // Get all jobs from Firebase
    console.log("📥 Fetching jobs from Firebase...");
    const firebaseJobsSnapshot = await db.collection("jobs").get();
    console.log(`📊 Found ${firebaseJobsSnapshot.docs.length} jobs in Firebase\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (const doc of firebaseJobsSnapshot.docs) {
      const firebaseJobId = doc.id;
      const jobData = doc.data();
      
      console.log(`\n🔄 Processing: ${firebaseJobId}`);
      console.log(`   Title: ${jobData.title || 'Untitled'}`);
      console.log(`   Recruiter ID: ${jobData.recruiterId || 'Unknown'}`);
      
      // Check if this firebase_id already exists
      const { data: existingJob } = await supabaseAdmin
        .from("platform_jobs")
        .select("id, job_title")
        .eq("firebase_id", firebaseJobId)
        .maybeSingle();
      
      if (existingJob) {
        console.log(`⏭️  Job already has firebase_id (Supabase ID: ${existingJob.id})`);
        skippedCount++;
        continue;
      }
      
      // Get recruiter from Supabase
      let recruiterId = null;
      if (jobData.recruiterId) {
        const { data: recruiter } = await supabaseAdmin
          .from("recruiters")
          .select("id")
          .eq("firebase_uid", jobData.recruiterId)
          .maybeSingle();
        
        if (recruiter) {
          recruiterId = recruiter.id;
          console.log(`   Found recruiter in Supabase: ${recruiterId}`);
        } else {
          console.log(`   ⚠️ Recruiter not found in Supabase for Firebase UID: ${jobData.recruiterId}`);
        }
      }
      
      // Try to find matching job in Supabase
      let query = supabaseAdmin
        .from("platform_jobs")
        .select("id, job_title, recruiter_id");
      
      if (jobData.title) {
        query = query.eq("job_title", jobData.title);
      }
      
      if (recruiterId) {
        query = query.eq("recruiter_id", recruiterId);
      }
      
      const { data: jobs, error: searchError } = await query.limit(1);
      
      if (searchError) {
        console.error(`❌ Error searching jobs:`, searchError.message);
        errorCount++;
        continue;
      }
      
      if (jobs && jobs.length > 0) {
        const { error: updateError } = await supabaseAdmin
          .from("platform_jobs")
          .update({ firebase_id: firebaseJobId })
          .eq("id", jobs[0].id);
        
        if (updateError) {
          console.error(`❌ Error updating job:`, updateError.message);
          errorCount++;
        } else {
          console.log(`✅ Updated job ${jobs[0].id} (${jobs[0].job_title}) with firebase_id: ${firebaseJobId}`);
          successCount++;
        }
      } else {
        console.log(`❌ No matching job found in Supabase`);
        errorCount++;
      }
    }
    
    console.log("\n======================================");
    console.log(`✅ Sync completed!`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${errorCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log("======================================");
    
  } catch (error: any) {
    console.error("❌ Fatal error:", error);
  }
}

syncJobFirebaseIds();