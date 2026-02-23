/**
 * COMPREHENSIVE FIREBASE → SUPABASE JOB SYNC MIGRATION
 * 
 * This script performs a one-time migration of ALL jobs from Firebase to Supabase.
 * It handles:
 * - Missing firebase_id column creation
 * - Recruiter lookup and auto-sync
 * - Job creation with proper field mapping
 * - Progress logging and error handling
 * 
 * Run with: yarn sync-all-jobs or npm run sync-all-jobs
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import admin from "firebase-admin";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/n/g, 'n');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.error("   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (!firebaseProjectId || !firebaseClientEmail || !firebasePrivateKey) {
  console.error("❌ Missing Firebase environment variables!");
  console.error("   Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
  process.exit(1);
}

// Initialize Firebase Admin
let firebaseApp: admin.app.App;
try {
  if (admin.apps.length === 0) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseProjectId,
        clientEmail: firebaseClientEmail,
        privateKey: firebasePrivateKey,
      }),
    });
    console.log("✅ Firebase Admin initialized");
  } else {
    firebaseApp = admin.apps[0]!;
  }
} catch (error: any) {
  console.error("❌ Failed to initialize Firebase Admin:", error.message);
  process.exit(1);
}

// Create Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const db = firebaseApp.firestore();

// Statistics
let stats = {
  totalJobs: 0,
  created: 0,
  skipped: 0,
  failed: 0,
  recruitersCreated: 0,
};

/**
 * Ensure firebase_id column exists in platform_jobs table
 */
async function ensureSchemaUpdated(): Promise<boolean> {
  console.log("🔧 Checking schema...");
  
  try {
    // Try to select firebase_id column
    const { error } = await supabaseAdmin
      .from("platform_jobs")
      .select("firebase_id")
      .limit(1);
    
    if (error && error.message.includes("column")) {
      console.log("⚠️  firebase_id column doesn't exist!");
      console.log("📝 Adding firebase_id column to platform_jobs table...");
      
      // Note: We can't directly execute DDL from the client, but we can check if it exists
      console.log("⚠️  MANUAL ACTION REQUIRED:");
      console.log("Please run this SQL in your Supabase SQL editor:");
      console.log("ALTER TABLE public.platform_jobs ADD COLUMN IF NOT EXISTS firebase_id TEXT UNIQUE;");
      console.log("CREATE INDEX IF NOT EXISTS idx_platform_jobs_firebase_id ON public.platform_jobs(firebase_id);");
      
      return false;
    }
    
    console.log("✅ Schema is ready (firebase_id column exists)");
    return true;
  } catch (error: any) {
    console.error("❌ Schema check failed:", error.message);
    return false;
  }
}

/**
 * Get or create external recruiter for scraped jobs
 */
async function getExternalRecruiter(): Promise<string | null> {
  try {
    // Check if external recruiter exists
    const { data: existing } = await supabaseAdmin
      .from("recruiters")
      .select("id")
      .eq("firebase_uid", "external_scraper")
      .maybeSingle();
    
    if (existing) {
      return existing.id;
    }
    
    // Create external recruiter
    const { data: newRecruiter, error } = await supabaseAdmin
      .from("recruiters")
      .insert({
        firebase_uid: "external_scraper",
        full_name: "External Jobs",
        email: "external@hireai.platform",
        company_name: "External Sources",
        company_description: "Jobs aggregated from external platforms",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id")
      .single();
    
    if (error) {
      console.error(`   ❌ Failed to create external recruiter: ${error.message}`);
      return null;
    }
    
    console.log(`   ✅ Created external recruiter in Supabase: ${newRecruiter.id}`);
    stats.recruitersCreated++;
    return newRecruiter.id;
    
  } catch (error: any) {
    console.error(`   ❌ External recruiter error: ${error.message}`);
    return null;
  }
}

/**
 * Sync or get recruiter from Supabase
 */
async function syncRecruiter(firebaseUid: string): Promise<string | null> {
  try {
    // Handle external scraper jobs
    if (firebaseUid === "external_scraper") {
      return await getExternalRecruiter();
    }
    // Check if recruiter already exists
    const { data: existing } = await supabaseAdmin
      .from("recruiters")
      .select("id")
      .eq("firebase_uid", firebaseUid)
      .maybeSingle();
    
    if (existing) {
      return existing.id;
    }
    
    // Fetch recruiter from Firebase
    const recruiterDoc = await db.collection("recruiters").doc(firebaseUid).get();
    
    if (!recruiterDoc.exists) {
      console.log(`   ⚠️  Recruiter not found in Firebase: ${firebaseUid}`);
        // For external/missing recruiters, use external recruiter
      return await getExternalRecruiter();
    }
    
    const recruiterData = recruiterDoc.data()!;
    
    // Create recruiter in Supabase
    const { data: newRecruiter, error } = await supabaseAdmin
      .from("recruiters")
      .insert({
        firebase_uid: firebaseUid,
        full_name: recruiterData.full_name || recruiterData.name || "Unknown",
        email: recruiterData.email || "",
        phone: recruiterData.phone || "",
        company_name: recruiterData.company_name || recruiterData.companyName || "Unknown Company",
        company_website: recruiterData.company_website || recruiterData.companyWebsite || "",
        company_logo_url: recruiterData.company_logo_url || recruiterData.companyLogo || "",
        company_description: recruiterData.company_description || "",
        industry: recruiterData.industry || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id")
      .single();
    
    if (error) {
      console.error(`   ❌ Failed to create recruiter: ${error.message}`);
      return null;
    }
    
    console.log(`   ✅ Created recruiter in Supabase: ${newRecruiter.id}`);
    stats.recruitersCreated++;
    return newRecruiter.id;
    
  } catch (error: any) {
    console.error(`   ❌ Recruiter sync error: ${error.message}`);
    return null;
  }
}

/**
 * Sync a single job from Firebase to Supabase
 */
async function syncJob(firebaseJobId: string, jobData: any): Promise<boolean> {
  try {
    console.log(`
🔄 Processing: ${firebaseJobId}`);
    console.log(`   Title: ${jobData.title || 'Untitled'}`);
    
    // Check if job already exists in Supabase
    const { data: existingJob } = await supabaseAdmin
      .from("platform_jobs")
      .select("id, job_title")
      .eq("firebase_id", firebaseJobId)
      .maybeSingle();
    
    if (existingJob) {
      console.log(`   ⏭️  Already synced (Supabase ID: ${existingJob.id})`);
      stats.skipped++;
      return true;
    }
    
    // Get or create recruiter
    if (!jobData.recruiterId) {
      console.log(`   ❌ Missing recruiterId in Firebase job`);
        // Use external recruiter for jobs without recruiter
      const externalRecruiterId = await getExternalRecruiter();
      if (!externalRecruiterId) {
      stats.failed++;
      return false;
      }
      jobData.recruiterId = "external_scraper";
    }
    
    const recruiterId = await syncRecruiter(jobData.recruiterId);
    
    if (!recruiterId) {
      console.log(`   ❌ Failed to sync recruiter, skipping job`);
      stats.failed++;
      return false;
    }
    
    console.log(`   📝 Recruiter ID: ${recruiterId}`);
    
    // Map Firebase job data to Supabase schema
    const supabaseJobData = {
      firebase_id: firebaseJobId,
      recruiter_id: recruiterId,
      job_title: jobData.title || "Untitled Position",
      job_description: jobData.description || "",
      role_category: jobData.roleCategory || jobData.category || null,
      required_skills: jobData.requiredSkills || jobData.skills || [],
      experience_required: jobData.experienceRequired || jobData.experience || 0,
      min_qualifications: jobData.minQualifications || jobData.qualifications || null,
      salary_min: jobData.salaryMin || jobData.minSalary || null,
      salary_max: jobData.salaryMax || jobData.maxSalary || null,
      currency: jobData.currency || "INR",
      is_paid: jobData.isPaid !== false,
      job_type: jobData.type || jobData.jobType || "full-time",
      internship_duration_months: jobData.internshipDuration || jobData.duration || null,
      work_mode: jobData.workMode || jobData.mode || "remote",
      location: jobData.location || "",
      status: jobData.status || "open",
      openings: jobData.openings || 1,
      application_deadline: jobData.deadline || jobData.applicationDeadline || null,
      perks: jobData.perks || [],
      created_at: jobData.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert job into Supabase
    const { data: newJob, error } = await supabaseAdmin
      .from("platform_jobs")
      .insert(supabaseJobData)
      .select("id")
      .single();
    
    if (error) {
      console.error(`   ❌ Failed to create job: ${error.message}`);
      stats.failed++;
      return false;
    }
    
    console.log(`   ✅ Created job in Supabase: ${newJob.id}`);
    stats.created++;
    return true;
    
  } catch (error: any) {
    console.error(`   ❌ Job sync error: ${error.message}`);
    stats.failed++;
    return false;
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  FIREBASE → SUPABASE JOB MIGRATION                        ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  
  try {
    // Step 1: Check schema
    const schemaReady = await ensureSchemaUpdated();
    if (!schemaReady) {
      console.log("⚠️  Please update the schema first, then run this script again.");
      process.exit(0);
    }
    
    // Step 2: Fetch all jobs from Firebase
    console.log("📥 Fetching jobs from Firebase...");
    const jobsSnapshot = await db.collection("jobs").get();
    stats.totalJobs = jobsSnapshot.docs.length;
    
    console.log(`📊 Found ${stats.totalJobs} jobs in Firebase`);
    console.log("════════════════════════════════════════════════════════════");
    
    if (stats.totalJobs === 0) {
      console.log("✅ No jobs to sync!");
      return;
    }
    
    // Step 3: Process each job
    for (const doc of jobsSnapshot.docs) {
      await syncJob(doc.id, doc.data());
    }
    
    // Step 4: Print summary
    console.log("════════════════════════════════════════════════════════════");
    console.log("📊 MIGRATION SUMMARY");
    console.log("════════════════════════════════════════════════════════════");
    console.log(`📦 Total jobs in Firebase:     ${stats.totalJobs}`);
    console.log(`✅ Successfully created:       ${stats.created}`);
    console.log(`⏭️  Skipped (already synced):  ${stats.skipped}`);
    console.log(`❌ Failed:                     ${stats.failed}`);
    console.log(`👥 Recruiters created:         ${stats.recruitersCreated}`);
    console.log("════════════════════════════════════════════════════════════");
    
    if (stats.failed > 0) {
      console.log("⚠️  Some jobs failed to sync. Check the logs above for details.");
    } else {
      console.log("🎉 Migration completed successfully!");
    }
    
  } catch (error: any) {
    console.error("❌ Fatal error during migration:", error);
    process.exit(1);
  }
}

// Run the migration
runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
