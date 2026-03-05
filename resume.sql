-- Create user_resumes table for AI Resume Builder
CREATE TABLE IF NOT EXISTS user_resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Firebase UID
  
  -- Personal Information
  personal_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { fullName, email, phone, linkedin, github, portfolio, location, title }
  
  -- Professional Summary
  summary TEXT,
  
  -- Education (array of education entries)
  education JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{ degree, institution, location, startDate, endDate, gpa, description }]
  
  -- Work Experience (array of experiences)
  experience JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{ title, company, location, startDate, endDate, current, responsibilities }]
  
  -- Skills
  skills JSONB DEFAULT '{}'::jsonb,
  -- Structure: { technical: [], soft: [], tools: [], frameworks: [], languages: [] }
  
  -- Projects (array of projects)
  projects JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{ title, description, technologies, github, liveLink }]
  
  -- Certifications (array)
  certifications JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{ name, issuer, date, url }]
  
  -- Achievements (array)
  achievements JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{ title, description, date }]
  
  -- Template Selection
  selected_template TEXT DEFAULT 'modern',
  -- Options: 'modern', 'minimal', 'creative', 'ats-friendly', 'executive'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT user_resumes_user_id_key UNIQUE (user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON user_resumes(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_resumes_updated_at
  BEFORE UPDATE ON user_resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE user_resumes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view and manage their own resumes
CREATE POLICY "Users can view their own resumes"
  ON user_resumes FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own resumes"
  ON user_resumes FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own resumes"
  ON user_resumes FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own resumes"
  ON user_resumes FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
