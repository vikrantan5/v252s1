"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  Download, 
  Save, 
  Loader2,
  Eye,
  X
} from "lucide-react";
import { toast } from "sonner";
import { saveResume, getResume } from "@/lib/actions/resume-builder.action";
import { enhanceResumeText, suggestSkills } from "@/lib/actions/ai-resume-enhance.action";
import type {
  PersonalInfo,
  Education,
  Experience,
  Skills,
  Project,
  Certification,
  Achievement,
} from "@/lib/actions/resume-builder.action";

// Import templates
import ModernProfessionalTemplate from "@/components/resume-templates/ModernProfessional";
import MinimalCleanTemplate from "@/components/resume-templates/MinimalClean";
import CreativeDesignerTemplate from "@/components/resume-templates/CreativeDesigner";
import ATSFriendlyTemplate from "@/components/resume-templates/ATSFriendly";
import ExecutiveStyleTemplate from "@/components/resume-templates/ExecutiveStyle";

// Template types
const TEMPLATES = [
  { id: "modern", name: "Modern Professional", component: ModernProfessionalTemplate },
  { id: "minimal", name: "Minimal Clean", component: MinimalCleanTemplate },
  { id: "creative", name: "Creative Designer", component: CreativeDesignerTemplate },
  { id: "ats", name: "ATS-Friendly", component: ATSFriendlyTemplate },
  { id: "executive", name: "Executive Style", component: ExecutiveStyleTemplate },
];

export default function ResumeBuilderPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  // Resume data state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    portfolio: "",
    location: "",
    title: "",
  });

  const [summary, setSummary] = useState("");
  const [education, setEducation] = useState<Education[]>([{
    degree: "",
    institution: "",
    location: "",
    startDate: "",
    endDate: "",
    gpa: "",
    description: "",
  }]);

  const [experience, setExperience] = useState<Experience[]>([{
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    responsibilities: [""],
  }]);

  const [skills, setSkills] = useState<Skills>({
    technical: [],
    soft: [],
    tools: [],
    frameworks: [],
    languages: [],
  });

  const [projects, setProjects] = useState<Project[]>([{
    title: "",
    description: "",
    technologies: [],
    github: "",
    liveLink: "",
  }]);

  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Auth check and load saved resume
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/sign-in");
      } else {
        setUserId(user.uid);
        await loadSavedResume(user.uid);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const loadSavedResume = async (uid: string) => {
    const result = await getResume(uid);
    if (result.success && result.resume) {
      const resume = result.resume;
      setPersonalInfo(resume.personal_info);
      setSummary(resume.summary || "");
      setEducation(resume.education.length > 0 ? resume.education : education);
      setExperience(resume.experience.length > 0 ? resume.experience : experience);
      setSkills(resume.skills);
      setProjects(resume.projects.length > 0 ? resume.projects : projects);
      setCertifications(resume.certifications);
      setAchievements(resume.achievements);
      setSelectedTemplate(resume.selected_template || "modern");
      toast.success("Resume draft loaded");
    }
  };

  const handleSaveResume = async () => {
    if (!userId) return;
    
    setSaving(true);
    const result = await saveResume(userId, {
      personal_info: personalInfo,
      summary,
      education,
      experience,
      skills,
      projects,
      certifications,
      achievements,
      selected_template: selectedTemplate,
    });

    if (result.success) {
      toast.success("Resume saved successfully!");
    } else {
      toast.error(result.error || "Failed to save resume");
    }
    setSaving(false);
  };

  const handleEnhanceText = async (text: string, context: any, setter: any) => {
    if (!text.trim()) {
      toast.error("Please enter some text first");
      return;
    }

    setEnhancing(context);
    const result = await enhanceResumeText(text, context);
    
    if (result.success && result.enhancedText) {
      setter(result.enhancedText);
      toast.success("Text enhanced with AI!");
    } else {
      toast.error(result.error || "Failed to enhance text");
    }
    setEnhancing(null);
  };

  const addEducation = () => {
    setEducation([...education, {
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: "",
    }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const addExperience = () => {
    setExperience([...experience, {
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      responsibilities: [""],
    }]);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const addResponsibility = (expIndex: number) => {
    const updated = [...experience];
    updated[expIndex].responsibilities.push("");
    setExperience(updated);
  };

  const updateResponsibility = (expIndex: number, respIndex: number, value: string) => {
    const updated = [...experience];
    updated[expIndex].responsibilities[respIndex] = value;
    setExperience(updated);
  };

  const removeResponsibility = (expIndex: number, respIndex: number) => {
    const updated = [...experience];
    updated[expIndex].responsibilities = updated[expIndex].responsibilities.filter((_, i) => i !== respIndex);
    setExperience(updated);
  };

  const addProject = () => {
    setProjects([...projects, {
      title: "",
      description: "",
      technologies: [],
      github: "",
      liveLink: "",
    }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const addCertification = () => {
    setCertifications([...certifications, {
      name: "",
      issuer: "",
      date: "",
      url: "",
    }]);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const updateCertification = (index: number, field: keyof Certification, value: any) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const addAchievement = () => {
    setAchievements([...achievements, {
      title: "",
      description: "",
      date: "",
    }]);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const updateAchievement = (index: number, field: keyof Achievement, value: any) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  const handleDownload = async (format: "pdf" | "docx") => {
    toast.info(`Generating ${format.toUpperCase()}...`);
    
    // Dynamic import to avoid SSR issues
    if (format === "pdf") {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      
      const element = document.getElementById("resume-preview");
      if (!element) {
        toast.error("Preview not found");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${personalInfo.fullName || "resume"}.pdf`);
      toast.success("PDF downloaded!");
    } else {
      // DOCX generation
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
      
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text: personalInfo.fullName,
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun(`${personalInfo.email} | ${personalInfo.phone}`),
              ],
            }),
            new Paragraph({
              text: summary,
            }),
            // Add more sections as needed
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${personalInfo.fullName || "resume"}.docx`;
      link.click();
      toast.success("DOCX downloaded!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const TemplateComponent = TEMPLATES.find(t => t.id === selectedTemplate)?.component || ModernProfessionalTemplate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" data-testid="resume-builder-title">
            AI Resume Builder
          </h1>
          <p className="text-gray-600">
            Create a professional resume with AI-powered enhancements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="certifications">Certifications</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              {/* Personal Info Tab */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={personalInfo.fullName}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="title">Professional Title</Label>
                        <Input
                          id="title"
                          value={personalInfo.title}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={personalInfo.location}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                          placeholder="San Francisco, CA"
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={personalInfo.linkedin}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                          placeholder="linkedin.com/in/johndoe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          value={personalInfo.github}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                          placeholder="github.com/johndoe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="portfolio">Portfolio</Label>
                        <Input
                          id="portfolio"
                          value={personalInfo.portfolio}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, portfolio: e.target.value })}
                          placeholder="johndoe.com"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="summary">Summary</Label>
                      <Textarea
                        id="summary"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Write a brief professional summary..."
                        rows={6}
                      />
                    </div>
                    <Button
                      onClick={() => handleEnhanceText(summary, "summary", setSummary)}
                      disabled={enhancing === "summary" || !summary.trim()}
                      className="w-full"
                      variant="outline"
                    >
                      {enhancing === "summary" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Enhance with AI
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Education</CardTitle>
                      <Button onClick={addEducation} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Education
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {education.map((edu, index) => (
                      <div key={index} className="border-b pb-6 last:border-b-0">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold">Education {index + 1}</h4>
                          {education.length > 1 && (
                            <Button
                              onClick={() => removeEducation(index)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label>Degree *</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, "degree", e.target.value)}
                              placeholder="Bachelor of Science in Computer Science"
                            />
                          </div>
                          <div>
                            <Label>Institution *</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => updateEducation(index, "institution", e.target.value)}
                              placeholder="Stanford University"
                            />
                          </div>
                          <div>
                            <Label>Location</Label>
                            <Input
                              value={edu.location}
                              onChange={(e) => updateEducation(index, "location", e.target.value)}
                              placeholder="Stanford, CA"
                            />
                          </div>
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="month"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="month"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>GPA (Optional)</Label>
                            <Input
                              value={edu.gpa}
                              onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                              placeholder="3.8/4.0"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Description</Label>
                            <Textarea
                              value={edu.description}
                              onChange={(e) => updateEducation(index, "description", e.target.value)}
                              placeholder="Relevant coursework, achievements..."
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Experience Tab - truncated for brevity, similar pattern */}
              <TabsContent value="experience">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Work Experience</CardTitle>
                      <Button onClick={addExperience} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Experience
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {experience.map((exp, expIndex) => (
                      <div key={expIndex} className="border-b pb-6 last:border-b-0">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold">Experience {expIndex + 1}</h4>
                          {experience.length > 1 && (
                            <Button
                              onClick={() => removeExperience(expIndex)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Job Title *</Label>
                              <Input
                                value={exp.title}
                                onChange={(e) => updateExperience(expIndex, "title", e.target.value)}
                                placeholder="Senior Software Engineer"
                              />
                            </div>
                            <div>
                              <Label>Company *</Label>
                              <Input
                                value={exp.company}
                                onChange={(e) => updateExperience(expIndex, "company", e.target.value)}
                                placeholder="Google"
                              />
                            </div>
                            <div>
                              <Label>Location</Label>
                              <Input
                                value={exp.location}
                                onChange={(e) => updateExperience(expIndex, "location", e.target.value)}
                                placeholder="Mountain View, CA"
                              />
                            </div>
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="month"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(expIndex, "startDate", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input
                                type="month"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(expIndex, "endDate", e.target.value)}
                                disabled={exp.current}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) => updateExperience(expIndex, "current", e.target.checked)}
                                className="rounded"
                              />
                              <Label>Currently working here</Label>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label>Responsibilities</Label>
                              <Button
                                onClick={() => addResponsibility(expIndex)}
                                size="sm"
                                variant="outline"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Point
                              </Button>
                            </div>
                            {exp.responsibilities.map((resp, respIndex) => (
                              <div key={respIndex} className="flex gap-2 mb-2">
                                <Textarea
                                  value={resp}
                                  onChange={(e) => updateResponsibility(expIndex, respIndex, e.target.value)}
                                  placeholder="Describe your responsibility..."
                                  rows={2}
                                />
                                {exp.responsibilities.length > 1 && (
                                  <Button
                                    onClick={() => removeResponsibility(expIndex, respIndex)}
                                    size="sm"
                                    variant="ghost"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              onClick={() => {
                                const allResp = exp.responsibilities.join("");
                                handleEnhanceText(allResp, "experience", (enhanced: string) => {
                                  const points = enhanced.split("").filter(p => p.trim());
                                  updateExperience(expIndex, "responsibilities", points);
                                });
                              }}
                              disabled={enhancing === "experience"}
                              variant="outline"
                              size="sm"
                              className="mt-2"
                            >
                              {enhancing === "experience" ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Enhancing...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="mr-2 h-4 w-4" />
                                  Enhance with AI
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Technical Skills</Label>
                      <Input
                        value={skills.technical?.join(", ")}
                        onChange={(e) => setSkills({ ...skills, technical: e.target.value.split(",").map(s => s.trim()) })}
                        placeholder="JavaScript, Python, React, Node.js"
                      />
                    </div>
                    <div>
                      <Label>Soft Skills</Label>
                      <Input
                        value={skills.soft?.join(", ")}
                        onChange={(e) => setSkills({ ...skills, soft: e.target.value.split(",").map(s => s.trim()) })}
                        placeholder="Leadership, Communication, Problem Solving"
                      />
                    </div>
                    <div>
                      <Label>Tools</Label>
                      <Input
                        value={skills.tools?.join(", ")}
                        onChange={(e) => setSkills({ ...skills, tools: e.target.value.split(",").map(s => s.trim()) })}
                        placeholder="Git, Docker, AWS, Jenkins"
                      />
                    </div>
                    <div>
                      <Label>Frameworks</Label>
                      <Input
                        value={skills.frameworks?.join(", ")}
                        onChange={(e) => setSkills({ ...skills, frameworks: e.target.value.split(",").map(s => s.trim()) })}
                        placeholder="React, Angular, Express, Django"
                      />
                    </div>
                    <div>
                      <Label>Languages</Label>
                      <Input
                        value={skills.languages?.join(", ")}
                        onChange={(e) => setSkills({ ...skills, languages: e.target.value.split(",").map(s => s.trim()) })}
                        placeholder="English (Native), Spanish (Fluent)"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Projects</CardTitle>
                      <Button onClick={addProject} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Project
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {projects.map((project, index) => (
                      <div key={index} className="border-b pb-6 last:border-b-0">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold">Project {index + 1}</h4>
                          {projects.length > 1 && (
                            <Button
                              onClick={() => removeProject(index)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label>Project Title *</Label>
                            <Input
                              value={project.title}
                              onChange={(e) => updateProject(index, "title", e.target.value)}
                              placeholder="E-commerce Platform"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={project.description}
                              onChange={(e) => updateProject(index, "description", e.target.value)}
                              placeholder="Describe the project..."
                              rows={4}
                            />
                            <Button
                              onClick={() => handleEnhanceText(project.description, "project", (enhanced: string) => {
                                updateProject(index, "description", enhanced);
                              })}
                              disabled={enhancing === "project"}
                              variant="outline"
                              size="sm"
                              className="mt-2"
                            >
                              {enhancing === "project" ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Enhancing...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="mr-2 h-4 w-4" />
                                  Enhance with AI
                                </>
                              )}
                            </Button>
                          </div>
                          <div>
                            <Label>Technologies</Label>
                            <Input
                              value={project.technologies.join(", ")}
                              onChange={(e) => updateProject(index, "technologies", e.target.value.split(",").map(t => t.trim()))}
                              placeholder="React, Node.js, MongoDB"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>GitHub Link</Label>
                              <Input
                                value={project.github}
                                onChange={(e) => updateProject(index, "github", e.target.value)}
                                placeholder="github.com/username/project"
                              />
                            </div>
                            <div>
                              <Label>Live Link</Label>
                              <Input
                                value={project.liveLink}
                                onChange={(e) => updateProject(index, "liveLink", e.target.value)}
                                placeholder="project.com"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Certifications Tab */}
              <TabsContent value="certifications">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Certifications</CardTitle>
                      <Button onClick={addCertification} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Certification
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {certifications.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No certifications added yet</p>
                    ) : (
                      certifications.map((cert, index) => (
                        <div key={index} className="border-b pb-6 last:border-b-0">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold">Certification {index + 1}</h4>
                            <Button
                              onClick={() => removeCertification(index)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <Label>Certification Name *</Label>
                              <Input
                                value={cert.name}
                                onChange={(e) => updateCertification(index, "name", e.target.value)}
                                placeholder="AWS Certified Solutions Architect"
                              />
                            </div>
                            <div>
                              <Label>Issuing Organization *</Label>
                              <Input
                                value={cert.issuer}
                                onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                                placeholder="Amazon Web Services"
                              />
                            </div>
                            <div>
                              <Label>Date</Label>
                              <Input
                                type="month"
                                value={cert.date}
                                onChange={(e) => updateCertification(index, "date", e.target.value)}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>URL</Label>
                              <Input
                                value={cert.url}
                                onChange={(e) => updateCertification(index, "url", e.target.value)}
                                placeholder="credential-url.com"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Achievements & Awards</CardTitle>
                      <Button onClick={addAchievement} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Achievement
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {achievements.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No achievements added yet</p>
                    ) : (
                      achievements.map((achievement, index) => (
                        <div key={index} className="border-b pb-6 last:border-b-0">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold">Achievement {index + 1}</h4>
                            <Button
                              onClick={() => removeAchievement(index)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label>Title *</Label>
                              <Input
                                value={achievement.title}
                                onChange={(e) => updateAchievement(index, "title", e.target.value)}
                                placeholder="Best Innovation Award"
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={achievement.description}
                                onChange={(e) => updateAchievement(index, "description", e.target.value)}
                                placeholder="Describe the achievement..."
                                rows={3}
                              />
                              <Button
                                onClick={() => handleEnhanceText(achievement.description || "", "achievement", (enhanced: string) => {
                                  updateAchievement(index, "description", enhanced);
                                })}
                                disabled={enhancing === "achievement"}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                {enhancing === "achievement" ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enhancing...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Enhance with AI
                                  </>
                                )}
                              </Button>
                            </div>
                            <div>
                              <Label>Date</Label>
                              <Input
                                type="month"
                                value={achievement.date}
                                onChange={(e) => updateAchievement(index, "date", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Button
                    onClick={handleSaveResume}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {showPreview ? "Hide" : "Show"} Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Template Selector & Preview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Template Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedTemplate === template.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                      </div>
                      {selectedTemplate === template.id && (
                        <FileText className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Download Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Download Resume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleDownload("pdf")}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download as PDF
                </Button>
                <Button
                  onClick={() => handleDownload("docx")}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download as DOCX
                </Button>
              </CardContent>
            </Card>

            {/* Live Preview (shown when toggle is on) */}
            {showPreview && (
              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    id="resume-preview"
                    className="bg-white border rounded-lg shadow-sm overflow-auto"
                    style={{ maxHeight: "600px" }}
                  >
                    <TemplateComponent
                      personalInfo={personalInfo}
                      summary={summary}
                      education={education}
                      experience={experience}
                      skills={skills}
                      projects={projects}
                      certifications={certifications}
                      achievements={achievements}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
