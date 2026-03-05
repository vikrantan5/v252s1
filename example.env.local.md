# HireAI Project – Environment Setup Guide

This project requires several API keys and service credentials to run properly.
All these values must be added inside a file named:

.env.local

Place this file in the **root directory of the project**.

Example:

project-folder
├── app
├── components
├── package.json
└── .env.local

---

# 1. Supabase Configuration

Supabase is used for **database and authentication**.

### Step 1: Create a Supabase Project

1. Go to: https://supabase.com
2. Create an account or sign in.
3. Click **New Project**.
4. Fill:

   * Project Name
   * Database Password
   * Region

After the project is created:

### Step 2: Get API Keys

Go to:

Project Dashboard → Settings → API

You will find:

Project URL
Anon Public Key
Service Role Key

Add them in `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

# 2. Firebase Configuration

Firebase is used for **notifications, authentication, and storage**.

### Step 1: Create Firebase Project

1. Go to: https://console.firebase.google.com
2. Click **Add Project**
3. Enter project name
4. Continue setup

### Step 2: Register Web App

Inside the Firebase project:

Project Settings → General → Your Apps → Add Web App

Firebase will generate configuration values.

Add them to `.env.local`

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

### Step 3: Firebase Admin SDK Credentials

Go to:

Project Settings → Service Accounts → Generate New Private Key

Download the JSON file.

From the JSON file extract:

```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Important:
Replace line breaks in the private key with `\n`.

Example:

```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC123\nXYZ456\n-----END PRIVATE KEY-----\n"
```

---

# 3. VAPI Configuration (Voice AI Interview System)

This platform powers the **AI Mock Interview voice system**.

### Step 1

Go to:

https://dashboard.vapi.ai

Create an account.

### Step 2

Inside the dashboard:

Settings → API Keys

Copy the **Web Token**.

```
NEXT_PUBLIC_VAPI_WEB_TOKEN=
```

### Step 3

Create a **Workflow** inside Vapi and copy the Workflow ID.

```
NEXT_PUBLIC_VAPI_WORKFLOW_ID=mock-workflow
```

---

# 4. Groq AI Configuration

Groq provides **AI processing for resume analysis and AI features**.

### Step 1

Go to:

https://console.groq.com

### Step 2

Create an account.

### Step 3

Go to:

API Keys → Create API Key

Copy and add:

```
GROQ_API_KEY=
```

---

# 5. Beyond Presence Configuration (AI Avatar)

Beyond Presence is used for **AI avatar interviews**.

### Step 1

Go to:

https://beyondpresence.ai

Create an account.

### Step 2

Inside dashboard:

Generate API Key

```
NEXT_PUBLIC_BEY_API_KEY=
```

### Step 3

Create Avatar

Copy Avatar ID

```
NEXT_PUBLIC_BEY_AVATAR_ID=
```

### Step 4

Create Agent

Copy Agent ID

```
NEXT_PUBLIC_BEY_AGENT_ID=
```

---

# 6. Razorpay Configuration (Payment Gateway)

Used for **handling payments in the platform**.

### Step 1

Go to:

https://dashboard.razorpay.com

Create an account.

### Step 2

Go to:

Settings → API Keys

Generate Key.

Add:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

# 7. Cal.com API Configuration (Meeting Scheduling)

Used for **interview scheduling and meeting booking**.

### Step 1

Go to:

https://cal.com

Create account.

### Step 2

Go to:

Developer Settings → API Keys

Generate API key.

```
CAL_COM_API_KEY=
```

---

# 8. SendGrid Email Configuration (Email Notifications)

SendGrid is used for sending **emails such as interview invites, notifications, and verification emails**.

### Step 1

Go to:

https://sendgrid.com

Create account.

### Step 2

Go to:

Settings → API Keys → Create API Key

Add:

```
SENDGRID_API_KEY=
```

### Step 3

Add Sender Email

Settings → Sender Authentication → Verify Sender

Then configure:

```
DEFAULT_FROM_EMAIL=your_verified_email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
```

---

# 9. Base URL Configuration

For local development:

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

For production deployment:

```
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

# 10. Final Step – Run the Project

After setting all environment variables:

Install dependencies:

```
npm install
```

Start the project:

```
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

# Important Notes

• Never share `.env.local` publicly.
• Never commit `.env.local` to GitHub.
• Keep all API keys secure.
• Production deployment should use environment variables on the hosting platform.

---

If any API key setup is unclear, please contact the developer for assistance.
