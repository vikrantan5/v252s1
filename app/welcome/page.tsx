"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase/client";
import { getUserById } from "@/lib/actions/auth.action";
import { User } from "@/types";
import FeatureCard from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FileEdit,
  Video,
  Briefcase,
  FolderOpen,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/sign-in");
        return;
      }

      try {
        const userData = await getUserById(firebaseUser.uid);
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSkipToDashboard = () => {
    if (user?.role === "recruiter") {
      router.push("/recruiter/dashboard");
    } else {
      router.push("/jobseeker/dashboard");
    }
  };

  const handleFeatureClick = (href: string) => {
    router.push(href);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Features for Job Seekers
  const jobSeekerFeatures = [
    {
      title: "Resume Analyzer",
      description: "Analyze your resume and improve ATS score",
      icon: FileText,
      href: "/jobseeker/resume",
      gradient: "bg-gradient-to-br from-blue-50 to-indigo-100",
    },
    {
      title: "Resume Builder",
      description: "Build a professional resume with templates",
      icon: FileEdit,
      href: "/jobseeker/resume-builder",
      gradient: "bg-gradient-to-br from-purple-50 to-pink-100",
    },
    {
      title: "AI Mock Interview",
      description: "Practice interviews with AI and get feedback",
      icon: Video,
      href: "/mock-interview/setup",
      gradient: "bg-gradient-to-br from-green-50 to-emerald-100",
    },
    {
      title: "Browse Jobs",
      description: "Explore thousands of job opportunities",
      icon: Briefcase,
      href: "/jobseeker/jobs",
      gradient: "bg-gradient-to-br from-orange-50 to-yellow-100",
    },
    {
      title: "My Applications",
      description: "Track your job applications and interviews",
      icon: FolderOpen,
      href: "/jobseeker/applications",
      gradient: "bg-gradient-to-br from-pink-50 to-rose-100",
    },
    {
      title: "Dashboard",
      description: "View your complete activity dashboard",
      icon: LayoutDashboard,
      href: "/jobseeker/dashboard",
      gradient: "bg-gradient-to-br from-cyan-50 to-blue-100",
    },
  ];

  // Features for Recruiters
  const recruiterFeatures = [
    {
      title: "Post Jobs",
      description: "Create and manage job postings",
      icon: Briefcase,
      href: "/recruiter/jobs",
      gradient: "bg-gradient-to-br from-blue-50 to-indigo-100",
    },
    {
      title: "Manage Applications",
      description: "Review and manage candidate applications",
      icon: FolderOpen,
      href: "/recruiter/applications",
      gradient: "bg-gradient-to-br from-purple-50 to-pink-100",
    },
    {
      title: "Dashboard",
      description: "View your recruitment dashboard",
      icon: LayoutDashboard,
      href: "/recruiter/dashboard",
      gradient: "bg-gradient-to-br from-cyan-50 to-blue-100",
    },
  ];

  const features = user?.role === "recruiter" ? recruiterFeatures : jobSeekerFeatures;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Message */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: [0, 14, -8, 14, 0] }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {user?.name?.split(" ")[0] || "there"}!
            </h1>
            <motion.div
              animate={{ rotate: [0, -14, 8, -14, 0] }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              👋
            </motion.div>
          </div>

          {/* Subtitle */}
          <motion.p
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {user?.role === "recruiter"
              ? "Your AI-powered recruitment platform is ready"
              : "Your AI career assistant is ready. Choose what you want to do today."}
          </motion.p>

          {/* Skip Button */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              variant="ghost"
              onClick={handleSkipToDashboard}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              data-testid="skip-to-dashboard-button"
            >
              Skip to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              index={index}
              onClick={() => handleFeatureClick(feature.href)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-sm text-gray-500">
            Powered by AI • Built for success
          </p>
        </motion.div>
      </div>
    </div>
  );
}
