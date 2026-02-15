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
          category: string | null
          ministry: string | null
          benefit_amount: string | null
          description: string | null
          eligibility_criteria: Json | null
          required_documents: Json | null
          application_process: Json | null
          ai_context: Json | null
          status: string | null
          last_updated: string | null
        }
        Insert: {
          scheme_id: string
          scheme_name: string
          scheme_name_hindi?: string | null
          category?: string | null
          ministry?: string | null
          benefit_amount?: string | null
          description?: string | null
          eligibility_criteria?: Json | null
          required_documents?: Json | null
          application_process?: Json | null
          ai_context?: Json | null
          status?: string | null
          last_updated?: string | null
        }
        Update: {
          scheme_id?: string
          scheme_name?: string
          scheme_name_hindi?: string | null
          category?: string | null
          ministry?: string | null
          benefit_amount?: string | null
          description?: string | null
          eligibility_criteria?: Json | null
          required_documents?: Json | null
          application_process?: Json | null
          ai_context?: Json | null
          status?: string | null
          last_updated?: string | null
        }
        Relationships: []
      }
      citizen_profiles: {
        Row: {
          citizen_id: string
          full_name: string | null
          name_hindi: string | null
          age: number | null
          gender: string | null
          mobile_number: string | null
          profile_data: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          citizen_id: string
          full_name?: string | null
          name_hindi?: string | null
          age?: number | null
          gender?: string | null
          mobile_number?: string | null
          profile_data?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          citizen_id?: string
          full_name?: string | null
          name_hindi?: string | null
          age?: number | null
          gender?: string | null
          mobile_number?: string | null
          profile_data?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      eligibility_results: {
        Row: {
          result_id: string
          citizen_id: string | null
          scheme_id: string | null
          is_eligible: boolean | null
          eligibility_score: number | null
          reasoning: string | null
          missing_documents: Json | null
          alternative_schemes: Json | null
          created_at: string | null
        }
        Insert: {
          result_id?: string
          citizen_id?: string | null
          scheme_id?: string | null
          is_eligible?: boolean | null
          eligibility_score?: number | null
          reasoning?: string | null
          missing_documents?: Json | null
          alternative_schemes?: Json | null
          created_at?: string | null
        }
        Update: {
          result_id?: string
          citizen_id?: string | null
          scheme_id?: string | null
          is_eligible?: boolean | null
          eligibility_score?: number | null
          reasoning?: string | null
          missing_documents?: Json | null
          alternative_schemes?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eligibility_results_citizen_id_fkey"
            columns: ["citizen_id"]
            referencedRelation: "citizen_profiles"
            referencedColumns: ["citizen_id"]
          },
          {
            foreignKeyName: "eligibility_results_scheme_id_fkey"
            columns: ["scheme_id"]
            referencedRelation: "schemes"
            referencedColumns: ["scheme_id"]
          }
        ]
      }
      documents: {
        Row: {
          doc_id: string
          doc_name: string
          doc_type: string | null
          issuing_authority: string | null
          digital_available: boolean | null
        }
        Insert: {
          doc_id: string
          doc_name: string
          doc_type?: string | null
          issuing_authority?: string | null
          digital_available?: boolean | null
        }
        Update: {
          doc_id?: string
          doc_name?: string
          doc_type?: string | null
          issuing_authority?: string | null
          digital_available?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
