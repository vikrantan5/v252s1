"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import { getJobById } from "@/lib/actions/job.action";
import { getApplicationsByJob, updateApplication } from "@/lib/actions/application.action";
import { getFeedbackByApplicationId } from "@/lib/actions/interview.action";
import { createInterviewInvitation, sendInterviewInvitationEmail } from "@/lib/actions/interview-invitation.action";
import { Application, Job, Feedback } from "@/types";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Calendar, Award, CheckCircle, XCircle , Video ,Clock} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function ViewApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [feedbacks, setFeedbacks] = useState<Record<string, Feedback>>({});
  const [loading, setLoading] = useState(true);
   const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [inviteForm, setInviteForm] = useState({
    interviewerName: "",
    scheduledDate: "",
    scheduledTime: "",
    interviewType: "technical",
    instructions: "",
    meetingUrl: "",
  });
  const [sendingInvite, setSendingInvite] = useState(false);

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
    const [jobData, apps] = await Promise.all([
      getJobById(jobId),
      getApplicationsByJob(jobId),
    ]);

    setJob(jobData);
    setApplications(apps);

    // Load feedbacks for applications with interviews
    const feedbackData: Record<string, Feedback> = {};
    for (const app of apps) {
      if (app.interviewId && app.interviewStatus === "completed") {
        const feedback = await getFeedbackByApplicationId(app.id);
        if (feedback) {
          feedbackData[app.id] = feedback;
        }
      }
    }
    setFeedbacks(feedbackData);

    setLoading(false);
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    const result = await updateApplication(applicationId, {
      status: newStatus as "pending" | "accepted" | "rejected",
    });

    if (result.success) {
      toast.success(`Application ${newStatus}`);
      await loadData();
    } else {
      toast.error("Failed to update application");
    }
  };


  const handleScheduleInterview = (application: Application) => {
    setSelectedApplication(application);
    // Reset form
    setInviteForm({
      interviewerName: "",
      scheduledDate: "",
      scheduledTime: "",
      interviewType: "technical",
      instructions: "",
      meetingUrl: "",
    });
    setShowInviteDialog(true);
  };

  const handleSendInvitation = async () => {
    if (!selectedApplication || !job) return;

    // Validate form
    if (!inviteForm.interviewerName || !inviteForm.meetingUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSendingInvite(true);
    try {
      // Combine date and time if provided
      let scheduledDateTime: string | undefined;
      if (inviteForm.scheduledDate && inviteForm.scheduledTime) {
        scheduledDateTime = `${inviteForm.scheduledDate}T${inviteForm.scheduledTime}:00`;
      }

      // Create interview invitation in Supabase
      const invitationResult = await createInterviewInvitation({
        applicationId: selectedApplication.id,
        meetingUrl: inviteForm.meetingUrl,
        scheduledDate: scheduledDateTime,
        interviewerName: inviteForm.interviewerName,
        interviewType: inviteForm.interviewType,
        interviewInstructions: inviteForm.instructions,
        durationMinutes: 60,
      });

      if (!invitationResult.success) {
        toast.error(invitationResult.error || "Failed to create invitation");
        setSendingInvite(false);
        return;
      }

      // Send email to student
      const emailResult = await sendInterviewInvitationEmail({
        invitationId: invitationResult.invitationId!,
        studentEmail: selectedApplication.applicantEmail,
        studentName: selectedApplication.applicantName,
        companyName: job.companyName || "Our Company",
        jobTitle: job.title,
        interviewerName: inviteForm.interviewerName,
        meetingUrl: inviteForm.meetingUrl,
        scheduledDate: scheduledDateTime,
      });

      if (emailResult.success) {
        toast.success("Interview invitation sent successfully! ✉️");
        setShowInviteDialog(false);
        await loadData();
      } else {
        toast.error(`Email failed: ${emailResult.error}`);
      }
    } catch (error: any) {
      console.error("Send invitation error:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setSendingInvite(false);
    }
  };
  const filterApplications = (status?: string) => {
    if (!status) return applications;
    return applications.filter((app) => app.status === status);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
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
          <p>Job not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">
            Applications for {job.title}
          </h1>
          <p className="text-gray-600 mt-2">{applications.length} total applications</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="all" data-testid="tab-all">
              All ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({filterApplications("pending").length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({filterApplications("accepted").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({filterApplications("rejected").length})
            </TabsTrigger>
          </TabsList>

          {["all", "pending", "accepted", "rejected"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              {(tab === "all" ? applications : filterApplications(tab)).length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12 text-gray-600">
                    No {tab !== "all" && tab} applications found
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {(tab === "all" ? applications : filterApplications(tab)).map((app) => {
                    const feedback = feedbacks[app.id];
                    return (
                      <Card key={app.id} data-testid={`application-${app.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{app.applicantName}</CardTitle>
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span>{app.applicantEmail}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Applied {formatDate(app.createdAt)}</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <Badge
                                variant={
                                  app.status === "accepted"
                                    ? "success"
                                    : app.status === "rejected"
                                    ? "destructive"
                                    : "warning"
                                }
                              >
                                {app.status}
                              </Badge>

                               <div className="flex gap-2">

                              <Select
                                value={app.status}
                                onValueChange={(value) => handleStatusChange(app.id, value)}
                              >
                                <SelectTrigger className="w-[140px]" data-testid={`status-select-${app.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="accepted">Accept</SelectItem>
                                  <SelectItem value="rejected">Reject</SelectItem>
                                </SelectContent>
                              </Select>
                                       <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => handleScheduleInterview(app)}
                                  data-testid={`schedule-interview-${app.id}`}
                                >
                                  <Video className="h-4 w-4" />
                                  Schedule
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Interview Status */}
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-gray-400" />
                            {app.interviewId ? (
                              app.interviewStatus === "completed" ? (
                                <Badge variant="success">Interview Completed</Badge>
                              ) : (
                                <Badge variant="warning">Interview Pending</Badge>
                              )
                            ) : (
                              <Badge variant="outline">No Interview Yet</Badge>
                            )}
                          </div>

                          {/* AI Interview Score */}
                          {feedback && (
                            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-blue-900">AI Interview Score</h3>
                                <span className={`text-2xl font-bold ${getScoreColor(feedback.totalScore)}`}>
                                  {feedback.totalScore}/100
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {feedback.categoryScores.map((cat, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span className="text-gray-700">{cat.name}:</span>
                                    <span className={`font-medium ${getScoreColor(cat.score)}`}>
                                      {cat.score}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-blue-900 mb-1">Strengths:</p>
                                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                                  {feedback.strengths.slice(0, 2).map((s, i) => (
                                    <li key={i}>{s}</li>
                                  ))}
                                </ul>
                              </div>

                              <p className="text-sm text-blue-800 italic">"{feedback.finalAssessment}"</p>

                              <Link href={`/interview/${app.interviewId}/feedback`}>
                                <Button variant="outline" size="sm" className="w-full" data-testid={`view-full-feedback-${app.id}`}>
                                  View Full Feedback
                                </Button>
                              </Link>
                            </div>
                          )}

                          {/* Resume */}
                          {app.resumeUrl && (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View Resume →
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

           {/* Interview Invitation Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                Schedule Interview
              </DialogTitle>
              <DialogDescription>
                Send an interview invitation to {selectedApplication?.applicantName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Interviewer Name */}
              <div className="space-y-2">
                <Label htmlFor="interviewer-name">
                  Interviewer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="interviewer-name"
                  placeholder="John Smith"
                  value={inviteForm.interviewerName}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, interviewerName: e.target.value })
                  }
                  required
                />
              </div>

              {/* Interview Type */}
              <div className="space-y-2">
                <Label htmlFor="interview-type">Interview Type</Label>
                <Select
                  value={inviteForm.interviewType}
                  onValueChange={(value) =>
                    setInviteForm({ ...inviteForm, interviewType: value })
                  }
                >
                  <SelectTrigger id="interview-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Interview</SelectItem>
                    <SelectItem value="hr">HR Interview</SelectItem>
                    <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                    <SelectItem value="final">Final Round</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled-date">
                    Date <span className="text-sm text-gray-500">(Optional)</span>
                  </Label>
                  <Input
                    id="scheduled-date"
                    type="date"
                    value={inviteForm.scheduledDate}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, scheduledDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled-time">
                    Time <span className="text-sm text-gray-500">(Optional)</span>
                  </Label>
                  <Input
                    id="scheduled-time"
                    type="time"
                    value={inviteForm.scheduledTime}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, scheduledTime: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Meeting URL */}
              <div className="space-y-2">
                <Label htmlFor="meeting-url">
                  Meeting Link (Cal.com, Google Meet, Zoom) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="meeting-url"
                  type="url"
                  placeholder="https://cal.com/your-username/interview or https://meet.google.com/xxx-yyyy-zzz"
                  value={inviteForm.meetingUrl}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, meetingUrl: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-gray-500">
                  💡 Tip: Create a Cal.com booking link for scheduling flexibility, or generate a Google Meet link
                </p>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">
                  Interview Instructions <span className="text-sm text-gray-500">(Optional)</span>
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="Any specific instructions for the candidate (e.g., prepare coding environment, review specific topics, etc.)"
                  value={inviteForm.instructions}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, instructions: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Email Preview</p>
                    <p>
                      An interview invitation email will be sent to{" "}
                      <strong>{selectedApplication?.applicantEmail}</strong> with:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-blue-800">
                      <li>Interview details and meeting link</li>
                      <li>Date & time (if specified)</li>
                      <li>Preparation tips</li>
                      <li>Interviewer contact information</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
                disabled={sendingInvite}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendInvitation}
                disabled={sendingInvite}
                className="gap-2"
              >
                {sendingInvite ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
