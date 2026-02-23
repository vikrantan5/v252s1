"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import { getJobApplications, updateApplicationStatus } from "@/lib/actions/supabase-job.action";
import { getJobById as getSupabaseJob } from "@/lib/actions/supabase-job.action";
import { createInterviewInvitation, sendInterviewInvitationEmail, generateGoogleMeetLink } from "@/lib/actions/interview-invitation.action";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, Calendar, Award, CheckCircle, XCircle, Target, User, 
  Briefcase, Phone, GraduationCap, ExternalLink, Video, Send 
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function ViewSupabaseApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [sendingInterview, setSendingInterview] = useState(false);
  
  // Interview form data
  const [interviewForm, setInterviewForm] = useState({
    scheduledDate: "",
    scheduledTime: "",
    interviewerName: "",
    interviewType: "technical",
    instructions: "",
    durationMinutes: 60,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/sign-in");
      } else {
        await loadData();
      }
    });
    return () => unsubscribe();
  }, [router, jobId]);

  const loadData = async () => {
  setLoading(true);

  // Step 1 — try getting job from Supabase
  let jobResult = await getSupabaseJob(jobId);

  // Step 2 — if not found → sync job first
  if (!jobResult.success || !jobResult.job) {
    console.log("Job missing in Supabase → syncing...");

    const syncRes = await fetch("/api/sync-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebaseJobId: jobId }),
    });

    const syncData = await syncRes.json();

    if (!syncData.success) {
      console.error("Job sync failed:", syncData.error);
      toast.error("Failed to sync job data");
      setLoading(false);
      return;
    }

    // fetch again after sync
    jobResult = await getSupabaseJob(jobId);
  }

  // Step 3 — fetch applications normally
  const appsResult = await getJobApplications(jobId);

  if (jobResult.success) {
    setJob(jobResult.job);
  }

  if (appsResult.success) {
    const sortedApps = (appsResult.applications || []).sort(
      (a: any, b: any) => (b.skill_match_score || 0) - (a.skill_match_score || 0)
    );
    setApplications(sortedApps);
  }

  setLoading(false);
};

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    const result = await updateApplicationStatus(applicationId, newStatus as any);

    if (result.success) {
      toast.success(`Application status updated to ${newStatus}`);
      await loadData();
    } else {
      toast.error(result.error || "Failed to update application");
    }
  };

  const handleSendInterviewInvitation = (application: any) => {
    setSelectedApplication(application);
    setShowInterviewDialog(true);
  };

  const handleCreateInterview = async () => {
    if (!selectedApplication) return;

    setSendingInterview(true);
    try {
      // Generate Google Meet link
      const meetResult = await generateGoogleMeetLink({
        interviewTitle: `${job.job_title} Interview - ${selectedApplication.students_profile?.full_name}`,
        scheduledDate: interviewForm.scheduledDate ? 
          new Date(`${interviewForm.scheduledDate}T${interviewForm.scheduledTime}`).toISOString() : 
          undefined,
      });

      if (!meetResult.success || !meetResult.link) {
        toast.error("Failed to generate Google Meet link");
        return;
      }

      // Create interview invitation
      const inviteResult = await createInterviewInvitation({
        applicationId: selectedApplication.id,
        meetingUrl: meetResult.link,
        scheduledDate: interviewForm.scheduledDate ? 
          new Date(`${interviewForm.scheduledDate}T${interviewForm.scheduledTime}`).toISOString() : 
          undefined,
        interviewerName: interviewForm.interviewerName || job.recruiters?.full_name || "Recruiter",
        interviewType: interviewForm.interviewType,
        interviewInstructions: interviewForm.instructions,
        durationMinutes: interviewForm.durationMinutes,
      });

      if (!inviteResult.success) {
        toast.error(inviteResult.error || "Failed to create interview invitation");
        return;
      }

      // Send email
      const emailResult = await sendInterviewInvitationEmail({
        invitationId: inviteResult.invitationId!,
        studentEmail: selectedApplication.students_profile?.email,
        studentName: selectedApplication.students_profile?.full_name,
        companyName: job.recruiters?.company_name || "Our Company",
        jobTitle: job.job_title,
        interviewerName: interviewForm.interviewerName || job.recruiters?.full_name || "Recruiter",
        meetingUrl: meetResult.link,
        scheduledDate: interviewForm.scheduledDate ? 
          new Date(`${interviewForm.scheduledDate}T${interviewForm.scheduledTime}`).toISOString() : 
          undefined,
      });

      if (emailResult.success) {
        toast.success("Interview invitation sent successfully!");
        setShowInterviewDialog(false);
        setSelectedApplication(null);
        setInterviewForm({
          scheduledDate: "",
          scheduledTime: "",
          interviewerName: "",
          interviewType: "technical",
          instructions: "",
          durationMinutes: 60,
        });
        await loadData();
      } else {
        toast.warning("Interview created but email failed to send. Please contact the candidate manually.");
        setShowInterviewDialog(false);
        await loadData();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send interview invitation");
    } finally {
      setSendingInterview(false);
    }
  };

  const filterApplications = (status?: string) => {
    if (!status || status === "all") return applications;
    return applications.filter((app) => app.status === status);
  };

  const getMatchBadge = (score: number) => {
    if (score >= 80) return { color: "bg-green-600", text: "Excellent" };
    if (score >= 60) return { color: "bg-blue-600", text: "Good" };
    if (score >= 40) return { color: "bg-yellow-600", text: "Fair" };
    return { color: "bg-gray-600", text: "Low" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Job not found</p>
          <Button onClick={() => router.push("/recruiter/jobs")} className="mt-4">
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  const pendingApps = filterApplications("pending");
  const shortlistedApps = filterApplications("shortlisted");
  const interviewScheduledApps = filterApplications("interview_scheduled");
  const selectedApps = filterApplications("selected");
  const rejectedApps = filterApplications("rejected");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back to Jobs
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">
            Applications for {job.job_title}
          </h1>
          <p className="text-gray-600 mt-2">
            {applications.length} total applications
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">{pendingApps.length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{shortlistedApps.length}</div>
              <div className="text-sm text-gray-600">Shortlisted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{interviewScheduledApps.length}</div>
              <div className="text-sm text-gray-600">Interviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{selectedApps.length}</div>
              <div className="text-sm text-gray-600">Selected</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{rejectedApps.length}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingApps.length})</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({shortlistedApps.length})</TabsTrigger>
            <TabsTrigger value="interview_scheduled">Interviews ({interviewScheduledApps.length})</TabsTrigger>
            <TabsTrigger value="selected">Selected ({selectedApps.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedApps.length})</TabsTrigger>
          </TabsList>

          {["all", "pending", "shortlisted", "interview_scheduled", "selected", "rejected"].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {filterApplications(status === "all" ? undefined : status).length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-600">No applications in this category</p>
                  </CardContent>
                </Card>
              ) : (
                filterApplications(status === "all" ? undefined : status).map((application) => {
                  const student = application.students_profile;
                  const matchBadge = getMatchBadge(application.skill_match_score || 0);

                  return (
                    <Card key={application.id} data-testid={`application-${application.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-xl">{student?.full_name || "Applicant"}</CardTitle>
                                <Badge className={`${matchBadge.color} text-white`}>
                                  <Target className="h-3 w-3 mr-1" />
                                  {application.skill_match_score}% {matchBadge.text} Match
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {application.status.replace("_", " ")}
                                </Badge>
                              </div>
                              <CardDescription className="flex flex-col gap-1">
                                <span className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  {student?.email}
                                </span>
                                {student?.phone && (
                                  <span className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {student?.phone}
                                  </span>
                                )}
                                <span className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Applied {formatDate(application.applied_at)}
                                </span>
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Education */}
                        <div className="flex items-start gap-2">
                          <GraduationCap className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium">{student?.degree} in {student?.specialization}</p>
                            <p className="text-sm text-gray-600">{student?.college}</p>
                          </div>
                        </div>

                        {/* Experience */}
                        <div className="flex items-start gap-2">
                          <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium capitalize">{student?.experience_level || "Fresher"}</p>
                            {student?.years_of_experience > 0 && (
                              <p className="text-sm text-gray-600">{student.years_of_experience} years experience</p>
                            )}
                          </div>
                        </div>

                        {/* Skills Match */}
                        {application.matching_skills && application.matching_skills.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-green-700 mb-2">
                              ✓ Matching Skills ({application.matching_skills.length}):
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {application.matching_skills.map((skill: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="border-green-500 bg-green-50 text-green-700">
                                  ✓ {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Missing Skills */}
                        {application.missing_skills && application.missing_skills.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-orange-700 mb-2">
                              Skills to Learn ({application.missing_skills.length}):
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {application.missing_skills.slice(0, 5).map((skill: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="border-orange-400 bg-orange-50 text-orange-700">
                                  {skill}
                                </Badge>
                              ))}
                              {application.missing_skills.length > 5 && (
                                <Badge variant="outline">+{application.missing_skills.length - 5} more</Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Resume Link */}
                        {student?.resume_url && (
                          <a 
                            href={student.resume_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Resume
                          </a>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t">
                          <Select
                            value={application.status}
                            onValueChange={(value) => handleStatusChange(application.id, value)}
                          >
                            <SelectTrigger className="flex-1" data-testid="status-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="shortlisted">Shortlist</SelectItem>
                              <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                              <SelectItem value="selected">Select</SelectItem>
                              <SelectItem value="rejected">Reject</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            onClick={() => handleSendInterviewInvitation(application)}
                            disabled={application.status === "interview_scheduled" || application.status === "rejected"}
                            variant="default"
                            data-testid="send-interview-btn"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Send Interview Invite
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Interview Invitation Dialog */}
      <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Interview Invitation</DialogTitle>
            <DialogDescription>
              Schedule an interview with {selectedApplication?.students_profile?.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduled_date">Interview Date *</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={interviewForm.scheduledDate}
                  onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="scheduled_time">Interview Time *</Label>
                <Input
                  id="scheduled_time"
                  type="time"
                  value={interviewForm.scheduledTime}
                  onChange={(e) => setInterviewForm({ ...interviewForm, scheduledTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="interviewer_name">Interviewer Name</Label>
              <Input
                id="interviewer_name"
                value={interviewForm.interviewerName}
                onChange={(e) => setInterviewForm({ ...interviewForm, interviewerName: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interview_type">Interview Type</Label>
                <Select
                  value={interviewForm.interviewType}
                  onValueChange={(value) => setInterviewForm({ ...interviewForm, interviewType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="final">Final Round</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={interviewForm.durationMinutes}
                  onChange={(e) => setInterviewForm({ ...interviewForm, durationMinutes: parseInt(e.target.value) || 60 })}
                  min="15"
                  step="15"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">Interview Instructions</Label>
              <Textarea
                id="instructions"
                value={interviewForm.instructions}
                onChange={(e) => setInterviewForm({ ...interviewForm, instructions: e.target.value })}
                placeholder="Please be prepared to discuss your experience with React and Node.js..."
                rows={4}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-sm">
              <p className="text-blue-900">
                <strong>Note:</strong> A Google Meet link will be automatically generated and included in the invitation email.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInterviewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateInterview}
              disabled={sendingInterview || !interviewForm.scheduledDate || !interviewForm.scheduledTime}
            >
              {sendingInterview ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
