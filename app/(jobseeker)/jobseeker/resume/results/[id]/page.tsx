"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import { getResumeAnalysisById } from "@/lib/actions/resume-supabase.action";
import { ResumeAnalysis } from "@/types";
import { getRoleDisplayName, SKILL_RESOURCES } from "@/lib/skills-matcher";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

export default function ResumeAnalysisResultsPage() {
  const router = useRouter();
  const params = useParams();
  const analysisId = params?.id as string;

  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  // ---------------- AUTH CHECK ----------------
  useEffect(() => {
    if (!analysisId) return;

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/sign-in");
        return;
      }
      await loadAnalysis();
    });

    return () => unsubscribe();
  }, [analysisId]);

  // ---------------- LOAD DATA ----------------
const loadAnalysis = async () => {
  setLoading(true);

  try {
    const data = await getResumeAnalysisById(analysisId);

    if (!data) {
      setAnalysis(null);
      return;
    }

    const safeAnalysis: ResumeAnalysis = {
      ...data,

      overallScore: Number(data.overallScore),
      atsCompatibility: Number(data.atsCompatibility),

      categoryScores: {
        experience: Number(data.categoryScores?.experience ?? 0),
        education: Number(data.categoryScores?.education ?? 0),
        skills: Number(data.categoryScores?.skills ?? 0),
        keywords: Number(data.categoryScores?.keywords ?? 0),
        formatting: Number(data.categoryScores?.formatting ?? 0),
      },
    };

    setAnalysis(safeAnalysis);

  } catch (error) {
    console.error("Error loading analysis:", error);
    setAnalysis(null);
  } finally {
    setLoading(false);
  }
};

  // ---------------- UI HELPERS ----------------
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80)
      return "bg-green-100 text-green-800 border-green-300";
    if (score >= 60)
      return "bg-blue-100 text-blue-800 border-blue-300";
    if (score >= 40)
      return "bg-yellow-100 text-yellow-800 border-yellow-300";

    return "bg-red-100 text-red-800 border-red-300";
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
        </div>
      </div>
    );
  }

  // ---------------- NOT FOUND ----------------
  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">Analysis not found</p>
          <Link href="/jobseeker/resume">
            <Button>Analyze New Resume</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ---------------- MAIN UI ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Link href="/jobseeker/resume/history">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>
            </Link>

            <h1 className="text-3xl font-bold">
              Resume Analysis Results
            </h1>

            <p className="text-gray-600 mt-1">
              {analysis.fileName} •{" "}
              {new Date(analysis.createdAt).toLocaleDateString()}
            </p>
          </div>

          <a href={analysis.resumeUrl} target="_blank">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              View Resume
            </Button>
          </a>
        </div>

        {/* OVERALL SCORE */}
        <Card className="mb-6">
          <CardContent className="pt-6 flex items-center justify-between">

            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full border-8 flex items-center justify-center">
                <span
                  className={`text-4xl font-bold ${getScoreColor(
                    analysis.overallScore
                  )}`}
                >
                  {analysis.overallScore}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Overall Score
                </h2>

                <Badge
                  className={`${getCompatibilityColor(
                    analysis.atsCompatibility
                  )} border px-3 py-1`}
                >
                  {analysis.atsCompatibility >= 80
                    ? "Excellent"
                    : analysis.atsCompatibility >= 60
                    ? "Good"
                    : analysis.atsCompatibility >= 40
                    ? "Fair"
                    : "Poor"}{" "}
                  ATS Compatibility
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TAB NAVIGATION */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="strengths">Strengths</TabsTrigger>
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
            <TabsTrigger value="missing-skills">Missing Skills</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {Object.entries(analysis.categoryScores || {}).map(
                  ([category, score], idx) => (
                    <div key={idx}>
                      <div className="flex justify-between">
                        <span className="capitalize font-medium">
                          {category}
                        </span>
                        <span className={getScoreColor(score)}>
                          {score}/100
                        </span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* STRENGTHS TAB */}
          <TabsContent value="strengths">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.strengths.map((s, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-800">{s}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IMPROVEMENTS TAB */}
          <TabsContent value="improvements">
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-700 flex gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.improvements.map((s, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-800">{s}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MISSING SKILLS TAB */}
          <TabsContent value="missing-skills">
            {analysis.skillsMatch && analysis.jobRole ? (
              <div className="space-y-6">
                {/* Job Role Section */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Target Job Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">
                      {getRoleDisplayName(analysis.jobRole)}
                    </div>
                  </CardContent>
                </Card>

                {/* Required Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Required Skills for this Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skillsMatch.requiredSkills.map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="px-3 py-1.5 text-sm"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Detected Skills */}
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Detected Skills in Your Resume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysis.skillsMatch.detectedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysis.skillsMatch.detectedSkills.map((skill, idx) => (
                          <Badge
                            key={idx}
                            className="bg-green-100 text-green-800 border-green-300 px-3 py-1.5 text-sm"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No matching skills detected</p>
                    )}
                  </CardContent>
                </Card>

                {/* Missing Skills - HIGHLIGHTED */}
                <Card className="border-red-300 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                      <AlertTriangle className="h-6 w-6" />
                      Missing Skills
                    </CardTitle>
                    <p className="text-sm text-red-600 mt-2">
                      These skills are required for the role but were not found in your resume
                    </p>
                  </CardHeader>
                  <CardContent>
                    {analysis.skillsMatch.missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysis.skillsMatch.missingSkills.map((skill, idx) => (
                          <Badge
                            key={idx}
                            className="bg-red-200 text-red-900 border-red-400 px-3 py-2 text-sm font-semibold"
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                        <p className="text-lg font-semibold text-green-700">
                          Great! All required skills found in your resume
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Learning Resources */}
                {analysis.skillsMatch.missingSkills.length > 0 && (
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader>
                      <CardTitle className="text-purple-900 flex items-center gap-2">
                        <ExternalLink className="h-5 w-5" />
                        Recommended Learning Resources
                      </CardTitle>
                      <p className="text-sm text-purple-700 mt-2">
                        Start learning these skills to improve your resume
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.skillsMatch.missingSkills.slice(0, 8).map((skill, idx) => {
                          const url = SKILL_RESOURCES[skill] || `https://www.google.com/search?q=learn+${encodeURIComponent(skill)}`;
                          return (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                  <ExternalLink className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{skill}</p>
                                  <p className="text-xs text-gray-500">Click to learn more</p>
                                </div>
                              </div>
                              <ExternalLink className="h-4 w-4 text-purple-400 group-hover:text-purple-600" />
                            </a>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Missing skills analysis not available
                  </p>
                  <p className="text-sm text-gray-500">
                    Make sure to select a job role when analyzing your resume
                  </p>
                  <Link href="/jobseeker/resume">
                    <Button className="mt-4">Analyze New Resume</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
