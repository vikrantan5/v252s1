// Comprehensive job-role skills database

export interface SkillSet {
  technical: string[];
  soft?: string[];
  tools?: string[];
}

export const ROLE_SKILLS: Record<string, SkillSet> = {
  // Software Development
  "frontend-developer": {
    technical: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Vue.js",
      "Angular",
      "Next.js",
      "Responsive Design",
      "REST API",
      "GraphQL",
      "Web Performance",
      "Browser DevTools",
      "Testing (Jest/Cypress)",
    ],
    tools: ["Git", "npm/yarn", "Webpack", "Vite", "Chrome DevTools"],
    soft: ["Problem Solving", "Attention to Detail", "Communication"],
  },
  "backend-developer": {
    technical: [
      "Node.js",
      "Python",
      "Java",
      "REST API",
      "GraphQL",
      "Database Design",
      "SQL",
      "NoSQL",
      "Authentication",
      "Security",
      "Microservices",
      "API Design",
      "Testing",
    ],
    tools: ["Git", "Docker", "Postman", "MongoDB", "PostgreSQL"],
    soft: ["Problem Solving", "System Design", "Communication"],
  },
  "full-stack-developer": {
    technical: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "REST API",
      "Database Design",
      "SQL",
      "NoSQL",
      "Git",
      "Testing",
      "Deployment",
    ],
    tools: ["Git", "Docker", "VS Code", "Postman", "MongoDB", "PostgreSQL"],
    soft: ["Problem Solving", "Communication", "Team Collaboration"],
  },
  "software-engineer": {
    technical: [
      "Data Structures",
      "Algorithms",
      "OOP",
      "Design Patterns",
      "Testing",
      "Version Control",
      "CI/CD",
      "API Development",
      "Database Design",
    ],
    tools: ["Git", "JIRA", "Docker"],
    soft: ["Problem Solving", "Communication", "Team Collaboration"],
  },
  "senior-software-engineer": {
    technical: [
      "System Design",
      "Architecture",
      "Scalability",
      "Performance Optimization",
      "Code Review",
      "Mentoring",
      "Technical Leadership",
      "Design Patterns",
      "Microservices",
    ],
    tools: ["Git", "Docker", "Kubernetes", "CI/CD Tools"],
    soft: ["Leadership", "Mentoring", "Strategic Thinking", "Communication"],
  },
  "tech-lead": {
    technical: [
      "System Architecture",
      "Technical Leadership",
      "Code Review",
      "Performance Optimization",
      "Security Best Practices",
      "Team Management",
    ],
    tools: ["Git", "JIRA", "Confluence", "Docker", "Kubernetes"],
    soft: ["Leadership", "Communication", "Decision Making", "Mentoring"],
  },
  "software-architect": {
    technical: [
      "System Architecture",
      "Design Patterns",
      "Scalability",
      "Cloud Architecture",
      "Microservices",
      "Security Architecture",
      "Technical Strategy",
    ],
    tools: ["UML", "Architecture Tools", "Cloud Platforms"],
    soft: ["Strategic Thinking", "Communication", "Leadership"],
  },

  // Data Science
  "data-scientist": {
    technical: [
      "Python",
      "R",
      "Machine Learning",
      "Statistics",
      "Data Analysis",
      "Pandas",
      "NumPy",
      "Scikit-learn",
      "TensorFlow",
      "PyTorch",
      "SQL",
      "Data Visualization",
      "Feature Engineering",
    ],
    tools: ["Jupyter", "Git", "Tableau", "Power BI"],
    soft: ["Analytical Thinking", "Communication", "Problem Solving"],
  },
  "data-analyst": {
    technical: [
      "SQL",
      "Python",
      "R",
      "Excel",
      "Data Visualization",
      "Statistics",
      "Data Cleaning",
      "Business Intelligence",
      "Reporting",
    ],
    tools: ["Tableau", "Power BI", "Excel", "SQL"],
    soft: ["Analytical Thinking", "Communication", "Attention to Detail"],
  },
  "business-analyst": {
    technical: [
      "Requirements Gathering",
      "Data Analysis",
      "SQL",
      "Process Modeling",
      "Business Intelligence",
      "Documentation",
    ],
    tools: ["JIRA", "Excel", "Tableau", "Confluence"],
    soft: ["Communication", "Problem Solving", "Stakeholder Management"],
  },
  "data-engineer": {
    technical: [
      "Python",
      "SQL",
      "ETL",
      "Data Pipelines",
      "Apache Spark",
      "Kafka",
      "Data Warehousing",
      "Cloud Platforms",
      "Big Data",
    ],
    tools: ["Airflow", "Spark", "Kafka", "AWS", "Docker"],
    soft: ["Problem Solving", "Communication", "Attention to Detail"],
  },
  "analytics-engineer": {
    technical: [
      "SQL",
      "Python",
      "dbt",
      "Data Modeling",
      "ETL",
      "Data Visualization",
      "Git",
    ],
    tools: ["dbt", "SQL", "Git", "Looker", "Tableau"],
    soft: ["Analytical Thinking", "Communication", "Problem Solving"],
  },
  "quantitative-analyst": {
    technical: [
      "Statistics",
      "Python",
      "R",
      "Financial Modeling",
      "Risk Analysis",
      "Time Series",
      "Mathematics",
    ],
    tools: ["Python", "R", "MATLAB", "Excel"],
    soft: ["Analytical Thinking", "Attention to Detail", "Problem Solving"],
  },

  // AI/ML
  "ml-engineer": {
    technical: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "TensorFlow",
      "PyTorch",
      "Model Deployment",
      "MLOps",
      "Feature Engineering",
      "Model Optimization",
    ],
    tools: ["Git", "Docker", "Kubernetes", "MLflow"],
    soft: ["Problem Solving", "Communication", "Research"],
  },
  "ai-engineer": {
    technical: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "Neural Networks",
      "NLP",
      "Computer Vision",
      "Model Deployment",
      "MLOps",
    ],
    tools: ["TensorFlow", "PyTorch", "Docker", "Git"],
    soft: ["Innovation", "Problem Solving", "Research"],
  },
  "research-scientist": {
    technical: [
      "Machine Learning",
      "Deep Learning",
      "Research Methodology",
      "Statistical Analysis",
      "Python",
      "Mathematics",
      "Publications",
    ],
    tools: ["Python", "TensorFlow", "PyTorch", "LaTeX"],
    soft: ["Research", "Critical Thinking", "Communication"],
  },
  "nlp-engineer": {
    technical: [
      "Python",
      "NLP",
      "Deep Learning",
      "Transformers",
      "BERT",
      "GPT",
      "Text Processing",
      "Named Entity Recognition",
    ],
    tools: ["Hugging Face", "spaCy", "NLTK", "TensorFlow", "PyTorch"],
    soft: ["Problem Solving", "Research", "Communication"],
  },
  "computer-vision-engineer": {
    technical: [
      "Python",
      "Computer Vision",
      "Deep Learning",
      "CNNs",
      "Object Detection",
      "Image Processing",
      "OpenCV",
    ],
    tools: ["PyTorch", "TensorFlow", "OpenCV", "CUDA"],
    soft: ["Problem Solving", "Research", "Attention to Detail"],
  },
  "ai-researcher": {
    technical: [
      "Machine Learning",
      "Deep Learning",
      "Research Methodology",
      "Mathematics",
      "Statistics",
      "Python",
      "Algorithm Design",
    ],
    tools: ["Python", "TensorFlow", "PyTorch", "LaTeX"],
    soft: ["Research", "Innovation", "Critical Thinking"],
  },

  // DevOps
  "devops-engineer": {
    technical: [
      "Linux",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Jenkins",
      "Git",
      "Infrastructure as Code",
      "Terraform",
      "Ansible",
      "Monitoring",
    ],
    tools: ["Docker", "Kubernetes", "Jenkins", "Git", "AWS"],
    soft: ["Problem Solving", "Communication", "Automation Mindset"],
  },
  "sre": {
    technical: [
      "Linux",
      "Kubernetes",
      "Monitoring",
      "Incident Response",
      "Automation",
      "Reliability Engineering",
      "Performance Tuning",
    ],
    tools: ["Prometheus", "Grafana", "Kubernetes", "Docker"],
    soft: ["Problem Solving", "Communication", "Reliability Focus"],
  },
  "platform-engineer": {
    technical: [
      "Kubernetes",
      "Docker",
      "CI/CD",
      "Infrastructure as Code",
      "Cloud Platforms",
      "API Design",
    ],
    tools: ["Kubernetes", "Docker", "Terraform", "Git"],
    soft: ["Problem Solving", "Communication", "System Thinking"],
  },
  "infrastructure-engineer": {
    technical: [
      "Cloud Infrastructure",
      "Networking",
      "Security",
      "Automation",
      "Infrastructure as Code",
      "Terraform",
    ],
    tools: ["AWS", "Azure", "GCP", "Terraform", "Ansible"],
    soft: ["Problem Solving", "Communication", "Planning"],
  },
  "automation-engineer": {
    technical: [
      "Python",
      "Automation",
      "Scripting",
      "CI/CD",
      "Testing Automation",
      "Infrastructure Automation",
    ],
    tools: ["Selenium", "Jenkins", "Python", "Git"],
    soft: ["Problem Solving", "Efficiency Focus", "Attention to Detail"],
  },
  "release-manager": {
    technical: [
      "Release Management",
      "CI/CD",
      "Version Control",
      "Deployment Strategies",
      "Risk Management",
    ],
    tools: ["JIRA", "Jenkins", "Git", "CI/CD Tools"],
    soft: ["Communication", "Planning", "Risk Management"],
  },

  // Cybersecurity
  "security-engineer": {
    technical: [
      "Network Security",
      "Application Security",
      "Penetration Testing",
      "Security Tools",
      "Cryptography",
      "Vulnerability Assessment",
    ],
    tools: ["Wireshark", "Metasploit", "Burp Suite", "Nmap"],
    soft: ["Analytical Thinking", "Attention to Detail", "Communication"],
  },
  "security-analyst": {
    technical: [
      "Security Monitoring",
      "Incident Response",
      "Threat Analysis",
      "SIEM",
      "Log Analysis",
      "Security Policies",
    ],
    tools: ["Splunk", "SIEM Tools", "Wireshark"],
    soft: ["Analytical Thinking", "Communication", "Attention to Detail"],
  },
  "penetration-tester": {
    technical: [
      "Penetration Testing",
      "Vulnerability Assessment",
      "Exploit Development",
      "Network Security",
      "Web Application Security",
    ],
    tools: ["Metasploit", "Burp Suite", "Nmap", "Kali Linux"],
    soft: ["Problem Solving", "Ethical Mindset", "Documentation"],
  },
  "security-architect": {
    technical: [
      "Security Architecture",
      "Risk Assessment",
      "Compliance",
      "Security Design",
      "Cryptography",
      "Security Standards",
    ],
    tools: ["Security Frameworks", "Architecture Tools"],
    soft: ["Strategic Thinking", "Communication", "Risk Management"],
  },
  "incident-response": {
    technical: [
      "Incident Response",
      "Forensics",
      "Threat Hunting",
      "Malware Analysis",
      "Security Monitoring",
    ],
    tools: ["SIEM Tools", "Forensic Tools", "Wireshark"],
    soft: ["Problem Solving", "Quick Thinking", "Communication"],
  },
  "compliance-analyst": {
    technical: [
      "Compliance Standards",
      "Risk Assessment",
      "Audit",
      "Policy Development",
      "Security Controls",
    ],
    tools: ["GRC Tools", "Audit Tools"],
    soft: ["Attention to Detail", "Communication", "Documentation"],
  },

  // UI/UX
  "ui-designer": {
    technical: [
      "Figma",
      "Adobe XD",
      "Sketch",
      "Visual Design",
      "Typography",
      "Color Theory",
      "Design Systems",
    ],
    tools: ["Figma", "Adobe XD", "Sketch", "Photoshop"],
    soft: ["Creativity", "Attention to Detail", "Communication"],
  },
  "ux-designer": {
    technical: [
      "User Research",
      "Wireframing",
      "Prototyping",
      "Usability Testing",
      "Information Architecture",
      "User Flows",
    ],
    tools: ["Figma", "Adobe XD", "Miro", "UserTesting"],
    soft: ["Empathy", "Problem Solving", "Communication"],
  },
  "product-designer": {
    technical: [
      "UI Design",
      "UX Design",
      "Prototyping",
      "User Research",
      "Design Systems",
      "Visual Design",
    ],
    tools: ["Figma", "Adobe XD", "Sketch"],
    soft: ["Creativity", "Problem Solving", "Communication"],
  },
  "interaction-designer": {
    technical: [
      "Interaction Design",
      "Prototyping",
      "Animation",
      "User Flows",
      "Micro-interactions",
    ],
    tools: ["Figma", "Principle", "After Effects"],
    soft: ["Attention to Detail", "Creativity", "Communication"],
  },
  "visual-designer": {
    technical: [
      "Visual Design",
      "Typography",
      "Color Theory",
      "Branding",
      "Illustration",
      "Design Systems",
    ],
    tools: ["Figma", "Adobe Creative Suite", "Sketch"],
    soft: ["Creativity", "Attention to Detail", "Communication"],
  },
  "ux-researcher": {
    technical: [
      "User Research",
      "Usability Testing",
      "Data Analysis",
      "Interview Techniques",
      "Survey Design",
    ],
    tools: ["UserTesting", "Optimal Workshop", "Survey Tools"],
    soft: ["Analytical Thinking", "Communication", "Empathy"],
  },

  // Product Management
  "product-manager": {
    technical: [
      "Product Strategy",
      "Roadmap Planning",
      "User Stories",
      "Data Analysis",
      "Market Research",
      "Agile/Scrum",
    ],
    tools: ["JIRA", "Confluence", "Analytics Tools", "Figma"],
    soft: ["Leadership", "Communication", "Strategic Thinking"],
  },
  "senior-product-manager": {
    technical: [
      "Product Strategy",
      "Stakeholder Management",
      "Business Analysis",
      "OKRs",
      "Market Research",
      "Data-Driven Decision Making",
    ],
    tools: ["JIRA", "Analytics", "Roadmap Tools"],
    soft: ["Leadership", "Strategic Thinking", "Communication"],
  },
  "product-owner": {
    technical: [
      "Agile/Scrum",
      "User Stories",
      "Backlog Management",
      "Requirements Gathering",
      "Acceptance Criteria",
    ],
    tools: ["JIRA", "Confluence", "Miro"],
    soft: ["Communication", "Decision Making", "Prioritization"],
  },
  "technical-product-manager": {
    technical: [
      "Technical Knowledge",
      "API Design",
      "System Architecture",
      "Product Strategy",
      "Agile",
    ],
    tools: ["JIRA", "Git", "API Tools", "Analytics"],
    soft: ["Technical Understanding", "Communication", "Problem Solving"],
  },
  "growth-product-manager": {
    technical: [
      "Growth Strategy",
      "A/B Testing",
      "Analytics",
      "User Acquisition",
      "Retention Strategies",
    ],
    tools: ["Google Analytics", "Mixpanel", "Amplitude"],
    soft: ["Data-Driven", "Strategic Thinking", "Communication"],
  },
  "product-lead": {
    technical: [
      "Product Leadership",
      "Strategy",
      "Team Management",
      "Roadmap Planning",
      "Stakeholder Management",
    ],
    tools: ["JIRA", "Roadmap Tools", "Analytics"],
    soft: ["Leadership", "Strategic Thinking", "Communication"],
  },

  // Marketing
  "digital-marketer": {
    technical: [
      "SEO",
      "SEM",
      "Social Media Marketing",
      "Email Marketing",
      "Google Analytics",
      "Content Marketing",
    ],
    tools: ["Google Ads", "Facebook Ads", "Google Analytics", "SEMrush"],
    soft: ["Creativity", "Communication", "Analytical Thinking"],
  },
  "content-marketer": {
    technical: [
      "Content Strategy",
      "SEO",
      "Copywriting",
      "Content Management",
      "Analytics",
    ],
    tools: ["WordPress", "SEO Tools", "Google Analytics"],
    soft: ["Creativity", "Writing", "Communication"],
  },
  "growth-marketer": {
    technical: [
      "Growth Hacking",
      "A/B Testing",
      "Analytics",
      "User Acquisition",
      "Conversion Optimization",
    ],
    tools: ["Google Analytics", "Mixpanel", "Optimizely"],
    soft: ["Data-Driven", "Creativity", "Strategic Thinking"],
  },
  "seo-specialist": {
    technical: [
      "SEO",
      "Keyword Research",
      "Technical SEO",
      "Link Building",
      "Analytics",
    ],
    tools: ["Google Search Console", "SEMrush", "Ahrefs"],
    soft: ["Analytical Thinking", "Attention to Detail", "Communication"],
  },
  "social-media-manager": {
    technical: [
      "Social Media Strategy",
      "Content Creation",
      "Community Management",
      "Analytics",
      "Paid Social",
    ],
    tools: ["Hootsuite", "Buffer", "Social Media Platforms"],
    soft: ["Creativity", "Communication", "Trend Awareness"],
  },
  "marketing-manager": {
    technical: [
      "Marketing Strategy",
      "Campaign Management",
      "Budget Management",
      "Analytics",
      "Team Leadership",
    ],
    tools: ["Marketing Automation", "Analytics", "CRM"],
    soft: ["Leadership", "Strategic Thinking", "Communication"],
  },

  // Cloud Engineering
  "cloud-engineer": {
    technical: [
      "Cloud Platforms",
      "AWS/Azure/GCP",
      "Infrastructure as Code",
      "Networking",
      "Security",
      "Docker",
      "Kubernetes",
    ],
    tools: ["AWS", "Azure", "GCP", "Terraform", "Docker"],
    soft: ["Problem Solving", "Communication", "Learning Agility"],
  },
  "aws-engineer": {
    technical: [
      "AWS Services",
      "EC2",
      "S3",
      "Lambda",
      "CloudFormation",
      "IAM",
      "Networking",
    ],
    tools: ["AWS Console", "AWS CLI", "CloudFormation"],
    soft: ["Problem Solving", "Communication", "AWS Expertise"],
  },
  "azure-engineer": {
    technical: [
      "Azure Services",
      "Virtual Machines",
      "Azure Storage",
      "ARM Templates",
      "Azure DevOps",
    ],
    tools: ["Azure Portal", "Azure CLI", "Azure DevOps"],
    soft: ["Problem Solving", "Communication", "Azure Expertise"],
  },
  "gcp-engineer": {
    technical: [
      "Google Cloud Services",
      "Compute Engine",
      "Cloud Storage",
      "Kubernetes Engine",
      "Deployment Manager",
    ],
    tools: ["GCP Console", "gcloud CLI", "Terraform"],
    soft: ["Problem Solving", "Communication", "GCP Expertise"],
  },
  "cloud-architect": {
    technical: [
      "Cloud Architecture",
      "Multi-Cloud",
      "Security",
      "Scalability",
      "Cost Optimization",
    ],
    tools: ["AWS", "Azure", "GCP", "Architecture Tools"],
    soft: ["Strategic Thinking", "Communication", "Leadership"],
  },
  "cloud-security-engineer": {
    technical: [
      "Cloud Security",
      "IAM",
      "Compliance",
      "Security Monitoring",
      "Encryption",
    ],
    tools: ["AWS Security", "Azure Security", "Security Tools"],
    soft: ["Security Mindset", "Attention to Detail", "Communication"],
  },

  // Mobile Development
  "ios-developer": {
    technical: [
      "Swift",
      "Objective-C",
      "iOS SDK",
      "UIKit",
      "SwiftUI",
      "Core Data",
      "REST API",
    ],
    tools: ["Xcode", "Git", "TestFlight"],
    soft: ["Problem Solving", "Attention to Detail", "Communication"],
  },
  "android-developer": {
    technical: [
      "Kotlin",
      "Java",
      "Android SDK",
      "Jetpack Compose",
      "Room Database",
      "REST API",
    ],
    tools: ["Android Studio", "Git", "Gradle"],
    soft: ["Problem Solving", "Attention to Detail", "Communication"],
  },
  "react-native-developer": {
    technical: [
      "React Native",
      "JavaScript",
      "TypeScript",
      "React",
      "Mobile UI",
      "REST API",
    ],
    tools: ["React Native", "Expo", "Git"],
    soft: ["Problem Solving", "Communication", "Cross-Platform Thinking"],
  },
  "flutter-developer": {
    technical: [
      "Flutter",
      "Dart",
      "Mobile UI",
      "State Management",
      "REST API",
    ],
    tools: ["Flutter", "Android Studio", "VS Code", "Git"],
    soft: ["Problem Solving", "Communication", "Cross-Platform Thinking"],
  },
  "mobile-architect": {
    technical: [
      "Mobile Architecture",
      "iOS",
      "Android",
      "Design Patterns",
      "Performance Optimization",
    ],
    tools: ["Xcode", "Android Studio", "Architecture Tools"],
    soft: ["Strategic Thinking", "Leadership", "Communication"],
  },
  "mobile-qa-engineer": {
    technical: [
      "Mobile Testing",
      "Test Automation",
      "Appium",
      "XCTest",
      "Espresso",
    ],
    tools: ["Appium", "XCTest", "Espresso", "TestFlight"],
    soft: ["Attention to Detail", "Problem Solving", "Communication"],
  },

  // QA/Testing
  "qa-engineer": {
    technical: [
      "Manual Testing",
      "Test Automation",
      "Test Planning",
      "Bug Tracking",
      "Regression Testing",
    ],
    tools: ["JIRA", "Selenium", "Postman", "Git"],
    soft: ["Attention to Detail", "Communication", "Problem Solving"],
  },
  "test-automation-engineer": {
    technical: [
      "Test Automation",
      "Selenium",
      "Cypress",
      "API Testing",
      "CI/CD",
      "Programming",
    ],
    tools: ["Selenium", "Cypress", "Jest", "Git"],
    soft: ["Problem Solving", "Attention to Detail", "Automation Mindset"],
  },
  "sdet": {
    technical: [
      "Test Automation",
      "Programming",
      "CI/CD",
      "API Testing",
      "Performance Testing",
    ],
    tools: ["Selenium", "Git", "Jenkins", "Postman"],
    soft: ["Problem Solving", "Communication", "Technical Skills"],
  },
  "qa-lead": {
    technical: [
      "Test Strategy",
      "Team Management",
      "Test Automation",
      "Quality Processes",
    ],
    tools: ["JIRA", "Test Management Tools", "Automation Tools"],
    soft: ["Leadership", "Communication", "Strategic Thinking"],
  },
  "performance-tester": {
    technical: [
      "Performance Testing",
      "Load Testing",
      "JMeter",
      "Performance Analysis",
      "Bottleneck Identification",
    ],
    tools: ["JMeter", "LoadRunner", "Gatling"],
    soft: ["Analytical Thinking", "Attention to Detail", "Problem Solving"],
  },
  "manual-tester": {
    technical: [
      "Manual Testing",
      "Test Case Design",
      "Bug Reporting",
      "Regression Testing",
      "User Acceptance Testing",
    ],
    tools: ["JIRA", "Test Management Tools"],
    soft: ["Attention to Detail", "Communication", "Problem Solving"],
  },

  // Finance
  "financial-analyst": {
    technical: [
      "Financial Modeling",
      "Excel",
      "Data Analysis",
      "Financial Reporting",
      "Forecasting",
    ],
    tools: ["Excel", "Financial Software", "SQL"],
    soft: ["Analytical Thinking", "Attention to Detail", "Communication"],
  },
  "accountant": {
    technical: [
      "Accounting",
      "Financial Statements",
      "Tax Compliance",
      "Bookkeeping",
      "Auditing",
    ],
    tools: ["QuickBooks", "Excel", "Accounting Software"],
    soft: ["Attention to Detail", "Ethics", "Communication"],
  },
  "financial-planner": {
    technical: [
      "Financial Planning",
      "Investment Analysis",
      "Risk Assessment",
      "Portfolio Management",
    ],
    tools: ["Financial Planning Software", "Excel"],
    soft: ["Communication", "Advisory Skills", "Analytical Thinking"],
  },
  "investment-analyst": {
    technical: [
      "Investment Analysis",
      "Financial Modeling",
      "Market Research",
      "Valuation",
    ],
    tools: ["Excel", "Bloomberg", "Financial Software"],
    soft: ["Analytical Thinking", "Research", "Communication"],
  },
  "finance-manager": {
    technical: [
      "Financial Management",
      "Budgeting",
      "Financial Reporting",
      "Team Management",
    ],
    tools: ["Excel", "ERP Systems", "Financial Software"],
    soft: ["Leadership", "Strategic Thinking", "Communication"],
  },
  "controller": {
    technical: [
      "Accounting",
      "Financial Reporting",
      "Compliance",
      "Internal Controls",
      "Audit",
    ],
    tools: ["ERP Systems", "Accounting Software"],
    soft: ["Leadership", "Attention to Detail", "Strategic Thinking"],
  },
};

// Learning resources for common skills
export const SKILL_RESOURCES: Record<string, string> = {
  // Programming Languages
  JavaScript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  TypeScript: "https://www.typescriptlang.org/docs",
  Python: "https://docs.python.org/3/tutorial",
  Java: "https://docs.oracle.com/javase/tutorial",
  "Node.js": "https://nodejs.org/en/docs",

  // Frontend
  React: "https://react.dev/learn",
  "Next.js": "https://nextjs.org/learn",
  "Vue.js": "https://vuejs.org/guide",
  Angular: "https://angular.io/docs",
  HTML: "https://developer.mozilla.org/en-US/docs/Web/HTML",
  CSS: "https://developer.mozilla.org/en-US/docs/Web/CSS",

  // APIs
  "REST API": "https://restfulapi.net",
  GraphQL: "https://graphql.org/learn",

  // Testing
  "Testing (Jest/Cypress)": "https://jestjs.io/docs/getting-started",
  Jest: "https://jestjs.io/docs/getting-started",
  Cypress: "https://docs.cypress.io",

  // DevOps
  Docker: "https://docs.docker.com/get-started",
  Kubernetes: "https://kubernetes.io/docs/tutorials",
  "CI/CD": "https://www.atlassian.com/continuous-delivery",
  Git: "https://git-scm.com/doc",

  // Cloud
  AWS: "https://aws.amazon.com/training",
  Azure: "https://learn.microsoft.com/en-us/azure",
  GCP: "https://cloud.google.com/training",

  // Data Science
  "Machine Learning": "https://www.coursera.org/learn/machine-learning",
  TensorFlow: "https://www.tensorflow.org/learn",
  PyTorch: "https://pytorch.org/tutorials",
  Pandas: "https://pandas.pydata.org/docs",
  NumPy: "https://numpy.org/doc",

  // Databases
  SQL: "https://www.w3schools.com/sql",
  MongoDB: "https://learn.mongodb.com",
  PostgreSQL: "https://www.postgresql.org/docs",

  // Security
  "Network Security": "https://www.comptia.org/certifications/security",
  "Penetration Testing": "https://www.offensive-security.com",

  // Design
  Figma: "https://help.figma.com",
  "Adobe XD": "https://helpx.adobe.com/xd/get-started.html",
};
