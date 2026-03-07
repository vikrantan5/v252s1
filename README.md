🚀 HireAI — AI Powered Career & Job Platform

HireAI is a modern AI-powered career platform that combines a Job Portal, Resume Tools, and AI Interview System in one integrated application.

It helps students and job seekers prepare, apply, and get evaluated using AI, while giving recruiters powerful tools to find the best candidates faster.

The platform includes Resume Builder, Resume Analyzer, AI Mock Interviews, Interview Scheduler, and a Public Jobs Portal.

🌟 Core Features
👨‍🎓 For Students / Job Seekers
🧾 Resume Builder

Create a professional resume easily using a modern builder.

Features:

Clean ATS-friendly templates

Structured sections (Education, Skills, Projects, Experience)

Live preview

Export resume for job applications

📊 Resume Analyzer (AI Powered)

Upload or paste your resume and get AI feedback instantly.

AI analysis includes:

Resume quality score

Missing skills detection

Job role match analysis

ATS compatibility check

Suggestions to improve resume

Example insights:

Resume Score: 78 / 100

Strengths
✔ Strong project portfolio
✔ Good technical stack

Missing Skills
❌ Docker
❌ System Design
❌ REST API Security
🤖 AI Mock Interview

Practice interviews with an AI interviewer.

Features:

AI generates questions based on:

Job role

Tech stack

Experience level

Real-time interview simulation

AI interviewer avatar

Voice or text interaction

Interview scoring system

AI evaluates:

Technical knowledge

Communication

Problem solving

Experience depth

📅 Interview Scheduler

Students can schedule interviews for later.

Options include:

Schedule AI interview for later

Choose date and time

Get reminder

Resume interview session later

💼 Public Jobs Section

Users can browse all available jobs publicly.

Features:

Search jobs

Filter by:

location

tech stack

experience

View job details

Apply instantly

📊 Student Dashboard

A personalized dashboard showing:

Applications submitted

Interview scores

Resume analysis history

Upcoming interviews

Recommended jobs

🏢 For Recruiters
🏢 Company Management

Recruiters can:

Create company profile

Manage company information

Post jobs under company

📢 Job Posting

Recruiters can post jobs including:

Job title

Job description

Required tech stack

Experience level

Location

AI automatically uses this information to generate interview questions.

👨‍💻 Candidate Applications

Recruiters can view:

All applicants

Resume

AI interview scores

AI feedback reports

This allows faster candidate filtering.

📊 Recruiter Dashboard

Recruiters get insights like:

Total jobs posted

Total applications

AI interview performance

Candidate ranking

🧠 AI Powered Features

HireAI uses Generative AI to enhance hiring.

AI Question Generator

Automatically generates interview questions using:

Job role

Required technologies

Experience level

Job description

Example:

Role: Frontend Developer

Generated Questions:
1. Explain the Virtual DOM in React.
2. How does useEffect work?
3. What is code splitting?
AI Interview Evaluation

AI analyzes answers and generates:

Overall Score (0-100)

Technical Score

Communication Score

Problem Solving Score

Strengths

Weaknesses

Final recommendation

Example:

Overall Score: 82

Strengths
✔ Clear explanation of React hooks
✔ Good problem solving approach

Improvements
⚠ Improve communication clarity
⚠ Expand system design knowledge
🏗️ Tech Stack
Frontend

Next.js 15 (App Router)

React

TypeScript

Tailwind CSS

UI Framework

shadcn/ui

Radix UI

Backend

Firebase Authentication

Firestore Database

AI Integration

Google Gemini 3 Flash

AI Question Generation

AI Resume Analysis

AI Interview Feedback

Additional Tools

Sonner – notifications

Lucide React – icons

📁 Project Structure
/app
│
├── (auth)
│   ├── sign-in
│   └── sign-up
│
├── (jobseeker)
│   └── jobseeker
│       ├── dashboard
│       ├── jobs
│       ├── applications
│       ├── resume-builder
│       ├── resume-analyzer
│       ├── mock-interview
│       └── interview-scheduler
│
├── (recruiter)
│   └── recruiter
│       ├── dashboard
│       ├── companies
│       ├── jobs
│       │   └── new
│       └── applications
│
├── interview
│   └── [id]
│       ├── page.tsx
│       └── feedback
│
├── public-jobs
│
└── components
🗄️ Database Schema (Firestore)
Collections
users
id
name
email
role (student / recruiter)
resume
createdAt
companies
id
name
description
ownerId
createdAt
jobs
id
title
description
techStack
experience
companyId
createdAt
applications
id
jobId
userId
status
interviewId
createdAt
interviews
id
jobId
questions
answers
userId
status
feedbacks
id
interviewId
overallScore
technicalScore
communicationScore
strengths
improvements
⚙️ Environment Variables

Create a .env.local file.

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

GEMINI_API_KEY=
🛠️ Setup & Installation
1️⃣ Clone Repository
git clone https://github.com/vikrantan5/v252s1.git
2️⃣ Install Dependencies
yarn install
3️⃣ Run Development Server
yarn dev

Open:

http://localhost:3000
4️⃣ Build Production
yarn build
yarn start
🚦 User Flow
Student Flow
Sign Up
   ↓
Build Resume
   ↓
Analyze Resume
   ↓
Browse Jobs
   ↓
Apply
   ↓
Take AI Interview
   ↓
Get AI Feedback
Recruiter Flow
Sign Up
   ↓
Create Company
   ↓
Post Job
   ↓
Receive Applications
   ↓
View AI Scores
   ↓
Select Candidates
📈 Future Enhancements

Planned features:

🎙️ Real-time AI voice interviewer

🧑‍💻 Video interviews

📩 Email notifications

📊 Advanced recruiter analytics

🌍 Multi-language support

🧠 AI career guidance

📱 Mobile app

🤝 Contributing

Contributions are welcome.

Steps:

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Open pull request
📄 License

MIT License

❤️ Built With Passion

Developed using Next.js, Firebase, and Generative AI to transform how students prepare for careers.