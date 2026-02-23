"/**
 * Skill Matching Utility
 * Calculates match percentage between student skills and job requirements
 */

export interface SkillMatchResult {
  matchScore: number; // 0-100
  matchingSkills: string[];
  missingSkills: string[];
  totalRequired: number;
  totalMatched: number;
}

/**
 * Calculate skill match between student skills and job requirements
 * Case-insensitive comparison
 */
export function calculateSkillMatch(
  studentSkills: string[],
  requiredSkills: string[]
): SkillMatchResult {
  // Normalize skills to lowercase for comparison
  const normalizedStudentSkills = studentSkills.map(s => s.toLowerCase().trim());
  const normalizedRequiredSkills = requiredSkills.map(s => s.toLowerCase().trim());

  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  // Find matching and missing skills
  normalizedRequiredSkills.forEach((requiredSkill, index) => {
    const originalSkillName = requiredSkills[index]; // Keep original casing for display
    
    if (normalizedStudentSkills.includes(requiredSkill)) {
      matchingSkills.push(originalSkillName);
    } else {
      missingSkills.push(originalSkillName);
    }
  });

  const totalRequired = requiredSkills.length;
  const totalMatched = matchingSkills.length;
  
  // Calculate match score as percentage
  const matchScore = totalRequired > 0 
    ? Math.round((totalMatched / totalRequired) * 100) 
    : 0;

  return {
    matchScore,
    matchingSkills,
    missingSkills,
    totalRequired,
    totalMatched,
  };
}

/**
 * Get match score badge color based on percentage
 */
export function getMatchScoreColor(score: number): string {
  if (score >= 80) return \"bg-green-500\";
  if (score >= 60) return \"bg-blue-500\";
  if (score >= 40) return \"bg-yellow-500\";
  return \"bg-red-500\";
}

/**
 * Get match score text based on percentage
 */
export function getMatchScoreText(score: number): string {
  if (score >= 80) return \"Excellent Match\";
  if (score >= 60) return \"Good Match\";
  if (score >= 40) return \"Fair Match\";
  return \"Low Match\";
}

/**
 * Sort jobs by match score (highest first)
 */
export function sortJobsByMatchScore<T extends { skill_match_score?: number }>(
  jobs: T[]
): T[] {
  return [...jobs].sort((a, b) => {
    const scoreA = a.skill_match_score || 0;
    const scoreB = b.skill_match_score || 0;
    return scoreB - scoreA;
  });
}

/**
 * Filter jobs by minimum match score
 */
export function filterJobsByMinMatch<T extends { skill_match_score?: number }>(
  jobs: T[],
  minScore: number = 40
): T[] {
  return jobs.filter(job => (job.skill_match_score || 0) >= minScore);
}
"