-- Create schemes table
CREATE TABLE schemes (
    scheme_id TEXT PRIMARY KEY,
    scheme_name TEXT NOT NULL,
    scheme_name_hindi TEXT,
    category TEXT,
    subcategory TEXT,
    ministry TEXT,
    launched_year INTEGER,
    benefit_amount TEXT,
    benefit_type TEXT,
    description TEXT,
    eligibility_criteria JSONB,
    required_documents JSONB,
    application_process JSONB,
    ai_context JSONB,
    status TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create citizen_profiles table
CREATE TABLE citizen_profiles (
    citizen_id TEXT PRIMARY KEY,
    full_name TEXT,
    name_hindi TEXT,
    age INTEGER,
    gender TEXT,
    mobile_number TEXT,
    profile_data JSONB, -- stores complete profile
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create eligibility_results table
CREATE TABLE eligibility_results (
    result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id TEXT REFERENCES citizen_profiles(citizen_id),
    scheme_id TEXT REFERENCES schemes(scheme_id),
    is_eligible BOOLEAN,
    eligibility_score INTEGER,
    reasoning TEXT,
    missing_documents JSONB,
    alternative_schemes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create documents table
CREATE TABLE documents (
    doc_id TEXT PRIMARY KEY,
    doc_name TEXT NOT NULL,
    doc_type TEXT,
    issuing_authority TEXT,
    validity TEXT,
    digital_available BOOLEAN
);

-- Enable Row Level Security (RLS)
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies (modify as per actual auth requirements)
-- For now, allowing public read access for demonstration purposes
CREATE POLICY "Enable read access for all users" ON schemes FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON documents FOR SELECT USING (true);

-- Allow authenticated users to insert/update their own profiles (if auth is implemented)
-- For now, allowing full access to service role
