export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            schemes: {
                Row: {
                    scheme_id: string
                    scheme_name: string
                    scheme_name_hindi: string | null
                    category: string
                    subcategory: string | null
                    ministry: string | null
                    launched_year: number | null
                    benefit_amount: string | null
                    benefit_type: string | null
                    description: string | null
                    eligibility_criteria: Json
                    application_process: Json
                    ai_context: Json
                    status: string
                    created_at: string
                    last_updated: string
                }
                Insert: {
                    scheme_id: string
                    scheme_name: string
                    scheme_name_hindi?: string | null
                    category: string
                    subcategory?: string | null
                    ministry?: string | null
                    launched_year?: number | null
                    benefit_amount?: string | null
                    benefit_type?: string | null
                    description?: string | null
                    eligibility_criteria?: Json
                    application_process?: Json
                    ai_context?: Json
                    status?: string
                    created_at?: string
                    last_updated?: string
                }
                Update: Partial<Database['public']['Tables']['schemes']['Insert']>
            }
            documents: {
                Row: {
                    doc_id: string
                    doc_name: string
                    doc_type: string | null
                    issuing_authority: string | null
                    validity: string | null
                    digital_available: boolean
                }
                Insert: {
                    doc_id: string
                    doc_name: string
                    doc_type?: string | null
                    issuing_authority?: string | null
                    validity?: string | null
                    digital_available?: boolean
                }
                Update: Partial<Database['public']['Tables']['documents']['Insert']>
            }
            scheme_documents: {
                Row: {
                    id: string
                    scheme_id: string
                    doc_id: string
                    mandatory: boolean
                }
                Insert: {
                    id?: string
                    scheme_id: string
                    doc_id: string
                    mandatory?: boolean
                }
                Update: Partial<Database['public']['Tables']['scheme_documents']['Insert']>
            }
            eligibility_rules: {
                Row: {
                    rule_id: string
                    scheme_id: string
                    rule_type: string | null
                    logic: string
                    inclusion_rules: Json
                    exclusion_rules: Json
                    special_priority_rules: Json
                    minimum_score: number
                    alternative_schemes: string[]
                    created_at: string
                }
                Insert: {
                    rule_id?: string
                    scheme_id: string
                    rule_type?: string | null
                    logic?: string
                    inclusion_rules?: Json
                    exclusion_rules?: Json
                    special_priority_rules?: Json
                    minimum_score?: number
                    alternative_schemes?: string[]
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['eligibility_rules']['Insert']>
            }
            citizen_profiles: {
                Row: {
                    citizen_id: string
                    full_name: string
                    name_hindi: string | null
                    age: number | null
                    gender: string | null
                    aadhaar_number: string | null
                    mobile_number: string | null
                    language_preference: string[] | null
                    location: Json
                    occupation: Json
                    farmer_details: Json
                    financial: Json
                    social: Json
                    family: Json
                    housing: Json
                    documents_available: Json
                    exclusions: Json
                    digital: Json
                    enrolled_schemes: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    citizen_id: string
                    full_name: string
                    name_hindi?: string | null
                    age?: number | null
                    gender?: string | null
                    aadhaar_number?: string | null
                    mobile_number?: string | null
                    language_preference?: string[] | null
                    location?: Json
                    occupation?: Json
                    farmer_details?: Json
                    financial?: Json
                    social?: Json
                    family?: Json
                    housing?: Json
                    documents_available?: Json
                    exclusions?: Json
                    digital?: Json
                    enrolled_schemes?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Database['public']['Tables']['citizen_profiles']['Insert']>
            }
            eligibility_results: {
                Row: {
                    result_id: string
                    citizen_id: string
                    scheme_id: string
                    is_eligible: boolean
                    eligibility_score: number
                    reasoning: string[] | null
                    missing_documents: Json
                    alternative_schemes: Json
                    ai_explanation: Json | null
                    engine_time_ms: number | null
                    ai_time_ms: number | null
                    created_at: string
                }
                Insert: {
                    result_id?: string
                    citizen_id: string
                    scheme_id: string
                    is_eligible: boolean
                    eligibility_score?: number
                    reasoning?: string[] | null
                    missing_documents?: Json
                    alternative_schemes?: Json
                    ai_explanation?: Json | null
                    engine_time_ms?: number | null
                    ai_time_ms?: number | null
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['eligibility_results']['Insert']>
            }
        }
    }
}
