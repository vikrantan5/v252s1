"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StudentProfile } from "@/lib/supabase";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Code, 
  FolderGit2, 
  Link as LinkIcon,
  Award,
  Target,
  DollarSign,
  FileText
} from "lucide-react";

interface StudentProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: StudentProfile | null;
  loading?: boolean;
}

export default function StudentProfileModal({
  open,
  onOpenChange,
  profile,
  loading = false,
}: StudentProfileModalProps) {
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-12 text-gray-500">
            Profile not found
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="student-profile-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-700">
            Student Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-purple-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-semibold">{profile.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-semibold">{profile.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Phone
                  </p>
                  <p className="font-semibold">{profile.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    Experience Level
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {profile.experience_level || "N/A"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Years of Experience</p>
                  <p className="font-semibold">{profile.years_of_experience || 0} years</p>
                </div>
              </div>

              {profile.bio && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Bio</p>
                  <p className="mt-1 text-gray-700">{profile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.college && (
                  <div>
                    <p className="text-sm text-gray-500">College</p>
                    <p className="font-semibold">{profile.college}</p>
                  </div>
                )}
                {profile.university && (
                  <div>
                    <p className="text-sm text-gray-500">University</p>
                    <p className="font-semibold">{profile.university}</p>
                  </div>
                )}
                {profile.degree && (
                  <div>
                    <p className="text-sm text-gray-500">Degree</p>
                    <p className="font-semibold">{profile.degree}</p>
                  </div>
                )}
                {profile.specialization && (
                  <div>
                    <p className="text-sm text-gray-500">Specialization</p>
                    <p className="font-semibold">{profile.specialization}</p>
                  </div>
                )}
                {profile.graduation_year && (
                  <div>
                    <p className="text-sm text-gray-500">Graduation Year</p>
                    <p className="font-semibold">{profile.graduation_year}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="h-5 w-5 text-purple-600" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-50">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {profile.projects && profile.projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FolderGit2 className="h-5 w-5 text-purple-600" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.projects.map((project, index) => (
                  <div key={index} className="border-l-4 border-purple-300 pl-4">
                    <h4 className="font-semibold text-lg">{project.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.tech_stack.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:underline mt-2 inline-flex items-center gap-1"
                      >
                        <LinkIcon className="h-3 w-3" />
                        View Project
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Portfolio Links */}
          {profile.portfolio_links && profile.portfolio_links.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LinkIcon className="h-5 w-5 text-purple-600" />
                  Portfolio Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.portfolio_links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline">{link.platform}</Badge>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:underline truncate"
                      >
                        {link.url}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-purple-600" />
                Job Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.preferred_job_roles && profile.preferred_job_roles.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Preferred Job Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferred_job_roles.map((role, index) => (
                      <Badge key={index} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.preferred_locations && profile.preferred_locations.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Preferred Locations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferred_locations.map((location, index) => (
                      <Badge key={index} variant="outline">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.preferred_job_types && profile.preferred_job_types.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Preferred Job Types</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferred_job_types.map((type, index) => (
                      <Badge key={index} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(profile.expected_salary_min || profile.expected_salary_max) && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Expected Salary
                  </p>
                  <p className="font-semibold">
                    ₹{profile.expected_salary_min?.toLocaleString() || "0"} - ₹
                    {profile.expected_salary_max?.toLocaleString() || "0"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resume */}
          {profile.resume_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  data-testid="view-resume-button"
                >
                  <FileText className="h-4 w-4" />
                  View Resume
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
