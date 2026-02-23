"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import {
  getStudentProfile,
  updateStudentProfile,
  checkProfileCompletion,
} from "@/lib/actions/profile.action";
import type { StudentProfile } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, X, Upload, CheckCircle2 } from "lucide-react";

const SKILLS_OPTIONS = [
  "React", "Next.js", "Vue.js", "Angular", "Svelte",
  "Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI",
  "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust",
  "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Material-UI",
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "Firebase",
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes",
  "Git", "CI/CD", "Jest", "Testing", "Agile",
];

const JOB_ROLES = [
  "Full Stack Developer", "Frontend Developer", "Backend Developer",
  "Mobile Developer", "DevOps Engineer", "Data Scientist",
  "Machine Learning Engineer", "UI/UX Designer", "Product Manager",
  "Software Engineer", "Cloud Architect", "QA Engineer",
];

export default function StudentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Profile state
  const [profile, setProfile] = useState<Partial<StudentProfile>>({
    skills: [],
    projects: [],
    portfolio_links: [],
    preferred_job_roles: [],
    preferred_locations: [],
    preferred_job_types: [],
    years_of_experience: 0,
  });

  // Completion status
  const [completionStatus, setCompletionStatus] = useState({
    completed: false,
    missingFields: [] as string[],
  });

  // UI state
  const [customSkill, setCustomSkill] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    url: "",
    tech_stack: [] as string[],
  });
  const [newPortfolio, setNewPortfolio] = useState({ platform: "", url: "" });
  const [newLocation, setNewLocation] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await loadProfile(user.uid);
      } else {
        router.push("/sign-in");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadProfile = async (uid: string) => {
    try {
      const result = await getStudentProfile(uid);
      if (result.success && result.profile) {
        setProfile(result.profile);
      }

      // Check completion status
      const status = await checkProfileCompletion(uid);
    //   setCompletionStatus(status);
    setCompletionStatus({
  completed: status.completed,
  missingFields: status.missingFields || [], // Ensure it's always an array
});
    } catch (error) {
      console.error("Load profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      const result = await updateStudentProfile(userId, profile);
      
      if (result.success) {
        toast.success("Profile updated successfully!");
        
        // Re-check completion status
        const status = await checkProfileCompletion(userId);
setCompletionStatus({
  completed: status.completed,
  missingFields: status.missingFields || [],
});
        
        // If profile is now complete, redirect to dashboard
        if (status.completed) {
          setTimeout(() => {
            router.push("/jobseeker/dashboard");
          }, 1500);
        }
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !profile.skills?.includes(skill)) {
      setProfile({
        ...profile,
        skills: [...(profile.skills || []), skill],
      });
    }
    setCustomSkill("");
  };

  const removeSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills?.filter((s) => s !== skill) || [],
    });
  };

  const addProject = () => {
    if (newProject.title && newProject.description) {
      setProfile({
        ...profile,
        projects: [...(profile.projects || []), newProject],
      });
      setNewProject({ title: "", description: "", url: "", tech_stack: [] });
    }
  };

  const removeProject = (index: number) => {
    setProfile({
      ...profile,
      projects: profile.projects?.filter((_, i) => i !== index) || [],
    });
  };

  const addPortfolio = () => {
    if (newPortfolio.platform && newPortfolio.url) {
      setProfile({
        ...profile,
        portfolio_links: [...(profile.portfolio_links || []), newPortfolio],
      });
      setNewPortfolio({ platform: "", url: "" });
    }
  };

  const removePortfolio = (index: number) => {
    setProfile({
      ...profile,
      portfolio_links: profile.portfolio_links?.filter((_, i) => i !== index) || [],
    });
  };

  const addPreferredRole = (role: string) => {
    if (role && !profile.preferred_job_roles?.includes(role)) {
      setProfile({
        ...profile,
        preferred_job_roles: [...(profile.preferred_job_roles || []), role],
      });
    }
    setCustomRole("");
  };

  const removePreferredRole = (role: string) => {
    setProfile({
      ...profile,
      preferred_job_roles: profile.preferred_job_roles?.filter((r) => r !== role) || [],
    });
  };

  const addLocation = () => {
    if (newLocation && !profile.preferred_locations?.includes(newLocation)) {
      setProfile({
        ...profile,
        preferred_locations: [...(profile.preferred_locations || []), newLocation],
      });
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    setProfile({
      ...profile,
      preferred_locations: profile.preferred_locations?.filter((l) => l !== location) || [],
    });
  };

  const toggleJobType = (type: string) => {
    const currentTypes = profile.preferred_job_types || [];
    if (currentTypes.includes(type)) {
      setProfile({
        ...profile,
        preferred_job_types: currentTypes.filter((t) => t !== type),
      });
    } else {
      setProfile({
        ...profile,
        preferred_job_types: [...currentTypes, type],
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const progressPercentage = completionStatus.completed
    ? 100
    : Math.max(10, 100 - completionStatus.missingFields.length * 10);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="profile-page-title">Complete Your Profile</h1>
        <p className="text-muted-foreground">
          Fill out your profile to start applying for jobs
        </p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {!completionStatus.completed && completionStatus.missingFields.length > 0 && (
            <p className="text-sm text-red-500 mt-2">
              Missing: {completionStatus.missingFields.join(", ")}
            </p>
          )}
          {completionStatus.completed && (
            <div className="flex items-center gap-2 mt-2 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Profile Complete!</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <section className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="John Doe"
                data-testid="profile-full-name-input"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="john@example.com"
                data-testid="profile-email-input"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1234567890"
                data-testid="profile-phone-input"
              />
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Education</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="college">College/University *</Label>
              <Input
                id="college"
                value={profile.college || ""}
                onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                placeholder="MIT"
                data-testid="profile-college-input"
              />
            </div>
            <div>
              <Label htmlFor="university">University Name</Label>
              <Input
                id="university"
                value={profile.university || ""}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                placeholder="Massachusetts Institute of Technology"
              />
            </div>
            <div>
              <Label htmlFor="degree">Degree *</Label>
              <Input
                id="degree"
                value={profile.degree || ""}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                placeholder="B.Tech"
                data-testid="profile-degree-input"
              />
            </div>
            <div>
              <Label htmlFor="specialization">Specialization *</Label>
              <Input
                id="specialization"
                value={profile.specialization || ""}
                onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                placeholder="Computer Science"
                data-testid="profile-specialization-input"
              />
            </div>
            <div>
              <Label htmlFor="graduation_year">Graduation Year</Label>
              <Input
                id="graduation_year"
                type="number"
                value={profile.graduation_year || ""}
                onChange={(e) => setProfile({ ...profile, graduation_year: parseInt(e.target.value) })}
                placeholder="2024"
              />
            </div>
          </div>
        </section>

        {/* Professional Information */}
        <section className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
          
          <div className="space-y-4">
            {/* Experience Level */}
            <div>
              <Label htmlFor="experience_level">Experience Level *</Label>
              <Select
                value={profile.experience_level || ""}
                onValueChange={(value) => setProfile({ ...profile, experience_level: value as any })}
              >
                <SelectTrigger id="experience_level" data-testid="profile-experience-select">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fresher">Fresher (0-1 years)</SelectItem>
                  <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                  <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
                  <SelectItem value="senior">Senior (5-8 years)</SelectItem>
                  <SelectItem value="lead">Lead (8+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Years of Experience */}
            <div>
              <Label htmlFor="years_of_experience">Years of Experience</Label>
              <Input
                id="years_of_experience"
                type="number"
                min="0"
                value={profile.years_of_experience || 0}
                onChange={(e) => setProfile({ ...profile, years_of_experience: parseInt(e.target.value) || 0 })}
              />
            </div>

            {/* Skills */}
            <div>
              <Label>Skills * (Select from list or add custom)</Label>
              <div className="flex gap-2 mb-2">
                <Select onValueChange={(skill) => addSkill(skill)}>
                  <SelectTrigger className="flex-1" data-testid="profile-skills-select">
                    <SelectValue placeholder="Select skills from list" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILLS_OPTIONS.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Or type custom skill"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (addSkill(customSkill), e.preventDefault())}
                  data-testid="profile-custom-skill-input"
                />
                <Button onClick={() => addSkill(customSkill)} variant="outline" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill) => (
                  <div
                    key={skill}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2"
                    data-testid={`skill-badge-${skill}`}
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
          </div>
        </section>

        {/* Projects */}
        <section className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          
          {/* Existing Projects */}
          <div className="space-y-3 mb-4">
            {profile.projects?.map((project, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg" data-testid={`project-${index}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                    {project.url && (
                      <a href={project.url} className="text-sm text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        View Project
                      </a>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeProject(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Project */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <Input
              placeholder="Project Title"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              data-testid="new-project-title-input"
            />
            <Textarea
              placeholder="Project Description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              rows={2}
            />
            <Input
              placeholder="Project URL (optional)"
              value={newProject.url}
              onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
            />
            <Button onClick={addProject} variant="outline" size="sm" data-testid="add-project-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </div>
        </section>

        {/* Portfolio Links */}
        <section className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Portfolio & Social Links</h2>
          
          {/* Existing Links */}
          <div className="space-y-2 mb-4">
            {profile.portfolio_links?.map((link, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <span className="font-medium">{link.platform}</span>
                  <a href={link.url} className="text-sm text-blue-600 hover:underline ml-2" target="_blank" rel="noopener noreferrer">
                    {link.url}
                  </a>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removePortfolio(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Link */}
          <div className="flex gap-2">
            <Input
              placeholder="Platform (e.g., GitHub, LinkedIn)"
              value={newPortfolio.platform}
              onChange={(e) => setNewPortfolio({ ...newPortfolio, platform: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder="URL"
              value={newPortfolio.url}
              onChange={(e) => setNewPortfolio({ ...newPortfolio, url: e.target.value })}
              className="flex-1"
            />
            <Button onClick={addPortfolio} variant="outline" size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Resume */}
        <section className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Resume</h2>
          <div>
            <Label htmlFor="resume_url">Resume URL</Label>
            <Input
              id="resume_url"
              value={profile.resume_url || ""}
              onChange={(e) => setProfile({ ...profile, resume_url: e.target.value })}
              placeholder="https://drive.google.com/..."
              data-testid="profile-resume-url-input"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Upload your resume to Google Drive or Dropbox and paste the shareable link here
            </p>
          </div>
        </section>

        {/* Job Preferences */}
        <section className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Job Preferences</h2>
          
          <div className="space-y-4">
            {/* Preferred Roles */}
            <div>
              <Label>Preferred Job Roles *</Label>
              <div className="flex gap-2 mb-2">
                <Select onValueChange={(role) => addPreferredRole(role)}>
                  <SelectTrigger className="flex-1" data-testid="profile-preferred-roles-select">
                    <SelectValue placeholder="Select preferred roles" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Or type custom role"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (addPreferredRole(customRole), e.preventDefault())}
                />
                <Button onClick={() => addPreferredRole(customRole)} variant="outline" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.preferred_job_roles?.map((role) => (
                  <div
                    key={role}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {role}
                    <button onClick={() => removePreferredRole(role)} className="hover:text-green-900">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred Locations */}
            <div>
              <Label>Preferred Locations</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add location (e.g., San Francisco, Remote)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (addLocation(), e.preventDefault())}
                  data-testid="profile-location-input"
                />
                <Button onClick={addLocation} variant="outline" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.preferred_locations?.map((location) => (
                  <div
                    key={location}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {location}
                    <button onClick={() => removeLocation(location)} className="hover:text-purple-900">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Types */}
            <div>
              <Label>Preferred Job Types</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["internship", "full-time", "part-time", "contract", "freelance"].map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleJobType(type)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      profile.preferred_job_types?.includes(type)
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                    data-testid={`job-type-${type}`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Expected Salary */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expected_salary_min">Expected Salary (Min)</Label>
                <Input
                  id="expected_salary_min"
                  type="number"
                  value={profile.expected_salary_min || ""}
                  onChange={(e) => setProfile({ ...profile, expected_salary_min: parseInt(e.target.value) })}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="expected_salary_max">Expected Salary (Max)</Label>
                <Input
                  id="expected_salary_max"
                  type="number"
                  value={profile.expected_salary_max || ""}
                  onChange={(e) => setProfile({ ...profile, expected_salary_max: parseInt(e.target.value) })}
                  placeholder="100000"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="min-w-[150px]"
            data-testid="save-profile-btn"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
