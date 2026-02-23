"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { createPlatformJob } from "@/lib/actions/supabase-job.action";
import { getRecruiterProfile } from "@/lib/actions/profile.action";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, DollarSign, Briefcase, MapPin, Clock, Info } from "lucide-react";
import { toast } from "sonner";

const SKILLS_OPTIONS = [
  "React", "Next.js", "Vue.js", "Angular", "Svelte",
  "Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI",
  "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust",
  "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Material-UI",
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "Firebase",
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes",
  "Git", "CI/CD", "Jest", "Testing", "Agile",
];

export default function PostPlatformJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [recruiterProfile, setRecruiterProfile] = useState<any>(null);
  const [skillInput, setSkillInput] = useState("");

  const [formData, setFormData] = useState({
    job_title: "",
    job_description: "",
    role_category: "",
    required_skills: [] as string[],
    experience_required: 0,
    min_qualifications: "",
    salary_min: 0,
    salary_max: 0,
    currency: "INR",
    is_paid: true,
    job_type: "full-time" as "internship" | "full-time" | "part-time" | "contract" | "freelance",
    internship_duration_months: 0,
    work_mode: "remote" as "remote" | "onsite" | "hybrid",
    location: "",
    openings: 1,
    perks: [] as string[],
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/sign-in");
      } else {
        setCurrentUserId(user.uid);
        await loadRecruiterProfile(user.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const loadRecruiterProfile = async (uid: string) => {
    setLoading(true);
    const result = await getRecruiterProfile(uid);
    if (result.success && result.profile) {
      setRecruiterProfile(result.profile);
      if (!result.profile.company_name) {
        toast.error("Please complete your recruiter profile first");
        router.push("/recruiter/dashboard");
      }
    } else {
      toast.error("Recruiter profile not found");
      router.push("/recruiter/dashboard");
    }
    setLoading(false);
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.required_skills.includes(skill)) {
      setFormData({
        ...formData,
        required_skills: [...formData.required_skills, skill],
      });
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      required_skills: formData.required_skills.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !recruiterProfile) return;

    if (formData.required_skills.length === 0) {
      toast.error("Please add at least one required skill");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createPlatformJob({
        recruiterFirebaseUid: currentUserId,
        jobData: {
          ...formData,
          status: "open",
        },
      });

      if (result.success) {
        toast.success("Job posted successfully!");
        router.push("/recruiter/jobs");
      } else {
        toast.error(result.error || "Failed to post job");
      }
    } catch (error) {
      toast.error("Failed to post job");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">
            Post New Job
          </h1>
          <p className="text-gray-600 mt-2">
            Create a detailed job posting with skill-based matching
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Basic Information
                </h3>

                <div>
                  <Label htmlFor="job_title">Job Title *</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder="e.g. Senior Full Stack Developer"
                    required
                    data-testid="job-title-input"
                  />
                </div>

                <div>
                  <Label htmlFor="role_category">Role Category</Label>
                  <Input
                    id="role_category"
                    value={formData.role_category || ""}
                    onChange={(e) => setFormData({ ...formData, role_category: e.target.value })}
                    placeholder="e.g. Software Engineering, Data Science"
                  />
                </div>

                <div>
                  <Label htmlFor="job_description">Job Description *</Label>
                  <Textarea
                    id="job_description"
                    value={formData.job_description}
                    onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                    placeholder="Detailed job description, responsibilities, requirements..."
                    required
                    rows={6}
                    data-testid="job-description-input"
                  />
                </div>

                <div>
                  <Label htmlFor="min_qualifications">Minimum Qualifications</Label>
                  <Textarea
                    id="min_qualifications"
                    value={formData.min_qualifications || ""}
                    onChange={(e) => setFormData({ ...formData, min_qualifications: e.target.value })}
                    placeholder="Bachelor's degree in Computer Science or equivalent..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Required Skills * (For Skill Matching)
                </h3>
                <p className="text-sm text-blue-800">
                  These skills will be used to match candidates and calculate their skill match percentage.
                </p>
                <div className="flex gap-2">
                  <Select onValueChange={(skill) => addSkill(skill)}>
                    <SelectTrigger className="flex-1" data-testid="skills-select">
                      <SelectValue placeholder="Select from common skills" />
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
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))}
                    placeholder="Or type custom skill"
                    className="flex-1"
                    data-testid="custom-skill-input"
                  />
                  <Button type="button" onClick={() => addSkill(skillInput)} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.required_skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1 text-sm">
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Experience & Compensation */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Experience & Compensation
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experience_required">Experience Required (Years) *</Label>
                    <Input
                      id="experience_required"
                      type="number"
                      min="0"
                      value={formData.experience_required}
                      onChange={(e) => setFormData({ ...formData, experience_required: parseInt(e.target.value) || 0 })}
                      required
                      data-testid="experience-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="is_paid">Job Type *</Label>
                    <Select
                      value={formData.is_paid ? "paid" : "unpaid"}
                      onValueChange={(value) => setFormData({ ...formData, is_paid: value === "paid" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="unpaid">Unpaid (Internship)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.is_paid && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="salary_min">Min Salary *</Label>
                      <Input
                        id="salary_min"
                        type="number"
                        value={formData.salary_min}
                        onChange={(e) => setFormData({ ...formData, salary_min: parseInt(e.target.value) || 0 })}
                        placeholder="50000"
                        required={formData.is_paid}
                      />
                    </div>
                    <div>
                      <Label htmlFor="salary_max">Max Salary *</Label>
                      <Input
                        id="salary_max"
                        type="number"
                        value={formData.salary_max}
                        onChange={(e) => setFormData({ ...formData, salary_max: parseInt(e.target.value) || 0 })}
                        placeholder="100000"
                        required={formData.is_paid}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Job Type & Work Mode */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Job Type & Work Mode
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="job_type">Job Type *</Label>
                    <Select
                      value={formData.job_type}
                      onValueChange={(value: any) => setFormData({ ...formData, job_type: value })}
                    >
                      <SelectTrigger data-testid="job-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="work_mode">Work Mode *</Label>
                    <Select
                      value={formData.work_mode}
                      onValueChange={(value: any) => setFormData({ ...formData, work_mode: value })}
                    >
                      <SelectTrigger data-testid="work-mode-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="onsite">Onsite</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.job_type === "internship" && (
                  <div>
                    <Label htmlFor="internship_duration_months">Internship Duration (Months)</Label>
                    <Input
                      id="internship_duration_months"
                      type="number"
                      min="1"
                      value={formData.internship_duration_months || ""}
                      onChange={(e) => setFormData({ ...formData, internship_duration_months: parseInt(e.target.value) || 0 })}
                      placeholder="3"
                    />
                  </div>
                )}
              </div>

              {/* Location & Openings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location & Openings
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="San Francisco, CA / Remote"
                      required
                      data-testid="location-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="openings">Number of Openings *</Label>
                    <Input
                      id="openings"
                      type="number"
                      min="1"
                      value={formData.openings}
                      onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                  data-testid="submit-job-button"
                >
                  {submitting ? "Posting..." : "Post Job"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
