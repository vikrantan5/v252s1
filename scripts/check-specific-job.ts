import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkJob() {
  console.log("🔍 Checking for job: 1771850705319-iv0ex706g");
  
  const { data, error } = await supabase
    .from("platform_jobs")
    .select("*")
    .eq("firebase_id", "1771850705319-iv0ex706g")
    .single();
  
  if (error) {
    console.log("❌ Error:", error.message);
  } else if (data) {
    console.log("✅ Job FOUND in Supabase!");
    console.log("════════════════════════════════════════════════════════════");
    console.log("   Supabase ID:", data.id);
    console.log("   Firebase ID:", data.firebase_id);
    console.log("   Job Title:", data.job_title);
    console.log("   Recruiter ID:", data.recruiter_id);
    console.log("   Status:", data.status);
    console.log("════════════════════════════════════════════════════════════");
  } else {
    console.log("❌ Job not found");
  }
}

checkJob();
