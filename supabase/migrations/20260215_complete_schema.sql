-- Database Schema for Scheme Saathi
-- Generated based on schemes_database.json, citizen_profile_schema.json, and eligibility_rules_engine.json

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reset Schema (DROP existing tables to prevent conflicts)
DROP TABLE IF EXISTS call_logs CASCADE;
DROP TABLE IF EXISTS eligibility_results CASCADE;
DROP TABLE IF EXISTS eligibility_rules CASCADE;
DROP TABLE IF EXISTS scheme_documents CASCADE;
DROP TABLE IF EXISTS citizen_profiles CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS schemes CASCADE;

-- 1. Schemes Table
CREATE TABLE schemes (
    scheme_id TEXT PRIMARY KEY,
    scheme_name TEXT NOT NULL,
    scheme_name_hindi TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    ministry TEXT,
    launched_year INTEGER,
    benefit_amount TEXT,
    benefit_type TEXT,
    description TEXT,
    eligibility_criteria JSONB DEFAULT '{}'::jsonb,
    application_process JSONB DEFAULT '{}'::jsonb,
    ai_context JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Documents Table
CREATE TABLE documents (
    doc_id TEXT PRIMARY KEY,
    doc_name TEXT NOT NULL,
    doc_type TEXT,
    issuing_authority TEXT,
    validity TEXT,
    digital_available BOOLEAN DEFAULT false
);

-- 3. Scheme Documents Junction Table (Many-to-Many)
CREATE TABLE scheme_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id TEXT REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    doc_id TEXT REFERENCES documents(doc_id) ON DELETE CASCADE,
    mandatory BOOLEAN DEFAULT true,
    UNIQUE(scheme_id, doc_id)
);

-- 4. Eligibility Rules Table (Decoupled from schemes for engine)
CREATE TABLE eligibility_rules (
    rule_id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(), -- Can use scheme_id as PK if 1:1, but UUID is safer for versioning
    scheme_id TEXT REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    rule_type TEXT, -- inclusion_based, exclusion_based, etc.
    logic TEXT DEFAULT 'AND',
    inclusion_rules JSONB DEFAULT '[]'::jsonb,
    exclusion_rules JSONB DEFAULT '[]'::jsonb,
    special_priority_rules JSONB DEFAULT '[]'::jsonb,
    minimum_score INTEGER DEFAULT 0,
    alternative_schemes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Citizen Profiles Table (Hybrid Relational + JSONB)
CREATE TABLE citizen_profiles (
    citizen_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    name_hindi TEXT,
    age INTEGER,
    gender TEXT,
    aadhaar_number TEXT, -- Hashed/Masked in real app
    mobile_number TEXT,
    language_preference TEXT[],
    
    -- JSONB Columns for complex nested structures
    location JSONB DEFAULT '{}'::jsonb,
    occupation JSONB DEFAULT '{}'::jsonb,
    farmer_details JSONB DEFAULT '{}'::jsonb,
    financial JSONB DEFAULT '{}'::jsonb,
    social JSONB DEFAULT '{}'::jsonb,
    family JSONB DEFAULT '{}'::jsonb,
    housing JSONB DEFAULT '{}'::jsonb,
    documents_available JSONB DEFAULT '{}'::jsonb,
    exclusions JSONB DEFAULT '{}'::jsonb,
    digital JSONB DEFAULT '{}'::jsonb,
    enrolled_schemes JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Eligibility Results Table (Traceability & Analytics)
CREATE TABLE eligibility_results (
    result_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id TEXT REFERENCES citizen_profiles(citizen_id) ON DELETE CASCADE,
    scheme_id TEXT REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    is_eligible BOOLEAN NOT NULL,
    eligibility_score INTEGER DEFAULT 0,
    reasoning TEXT[], -- List of reasons/rules passed
    missing_documents JSONB DEFAULT '[]'::jsonb,
    alternative_schemes JSONB DEFAULT '[]'::jsonb,
    ai_explanation JSONB, -- Stores the generated explanation
    
    -- Performance Metrics
    engine_time_ms INTEGER,
    ai_time_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Call Logs Table (Voice Interactions)
CREATE TABLE call_logs (
    call_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id TEXT REFERENCES citizen_profiles(citizen_id),
    twilio_sid TEXT,
    from_number TEXT,
    detected_language TEXT,
    transcript TEXT,
    eligibility_snapshot JSONB, -- What was the result at the time of call
    status TEXT, -- completed, dropped, failed
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for Performance
CREATE INDEX idx_schemes_category ON schemes(category);
CREATE INDEX idx_citizen_mobile ON citizen_profiles(mobile_number);
CREATE INDEX idx_eligibility_citizen ON eligibility_results(citizen_id);
CREATE INDEX idx_eligibility_scheme ON eligibility_results(scheme_id);
CREATE INDEX idx_rules_scheme ON eligibility_rules(scheme_id);

-- JSONB GIN Indexes for fast querying inside JSON
CREATE INDEX idx_citizen_location ON citizen_profiles USING GIN (location);
CREATE INDEX idx_citizen_occupation ON citizen_profiles USING GIN (occupation);
CREATE INDEX idx_citizen_farmer ON citizen_profiles USING GIN (farmer_details);

-- RLS Policies (Basic for Hackathon)
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read for static data
CREATE POLICY "Public read schemes" ON schemes FOR SELECT USING (true);
CREATE POLICY "Public read documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Public read rules" ON eligibility_rules FOR SELECT USING (true);
CREATE POLICY "Public read scheme_docs" ON scheme_documents FOR SELECT USING (true);

-- Allow service role full access (for seed script & backend)
CREATE POLICY "Service role full access" ON citizen_profiles USING (true) WITH CHECK (true);
CREATE POLICY "Service role results access" ON eligibility_results USING (true) WITH CHECK (true);
CREATE POLICY "Service role logs access" ON call_logs USING (true) WITH CHECK (true);
