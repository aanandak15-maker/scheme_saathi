
export interface CitizenProfile {
    citizen_id?: string;
    full_name: string;
    age: number;
    gender: string;
    location: {
        state: string;
        district: string;
        residence_type: 'Rural' | 'Urban';
    };
    occupation: {
        primary_occupation: string;
        income_level: string;
    };
    caste_category: string;
    marital_status: string;
    disability_status: string;
    is_student: boolean;
    education_level: string;
    employment_status: string;
    land_ownership?: {
        owns_land: boolean;
        land_area?: number;
    };
    // Added to match backend structure
    documents?: {
        aadhaar_card: boolean;
        pan_card?: boolean;
        bank_passbook?: boolean;
        land_records?: boolean;
        bpl_card?: boolean;
        ration_card?: boolean;
        voter_id?: boolean;
        driving_license?: boolean;
        income_certificate?: boolean;
        caste_certificate?: boolean;
        residence_certificate?: boolean;
    };
    family?: {
        family_size?: number;
        dependents?: number;
        has_disabled_member?: boolean;
        is_widow?: boolean;
        has_adult_earning_member?: boolean;
        female_head_of_family?: boolean;
    };
    housing?: {
        house_type?: 'Pucca' | 'Semi-pucca' | 'Kutcha' | 'No House';
        owns_house?: boolean;
        has_electricity?: boolean;
        has_toilet?: boolean;
    };
    financial?: {
        has_bank_account: boolean;
        bank_name?: string;
        account_number?: string;
        ifsc_code?: string;
        is_income_tax_payer?: boolean;
        annual_income?: number;
    };
    farmer_details?: {
        is_farmer: boolean;
        land_ownership?: boolean;
        land_area_acres?: number;
        land_type?: string;
        crops_grown?: string[];
        has_kisan_credit_card?: boolean;
        farmer_category?: string;
    };
    exclusions?: {
        is_government_employee?: boolean;
        is_pensioner?: boolean;
        pension_amount?: number;
        owns_motorized_vehicle?: boolean;
        is_professional?: boolean;
        professional_type?: string;
        constitutional_post?: boolean;
        is_mp_mla?: boolean;
    };
    digital?: {
        can_use_smartphone?: boolean;
        internet_access?: boolean;
        literacy_level?: string;
    };
}

export interface ApplicationStatus {
    id: string;
    citizen_id: string;
    scheme_id: string;
    scheme_name: string;
    status: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
    applied_date: string;
    last_updated: string;
}

export interface Scheme {
    scheme_id: string;
    scheme_name: string;
    scheme_name_hindi?: string;
    category: string;
    benefit_type: string;
    benefit_amount?: string;
    subcategory?: string;
    launched_year?: number;
    description?: string;
    application_process?: {
        portal_url: string;
        steps: string[];
    };
    required_documents?: {
        doc_name: string;
        mandatory: boolean;
    }[];
}

export interface EligibilityResult {
    summary: string;
    eligible_schemes: {
        scheme_id: string;
        scheme_name: string;
        is_eligible?: boolean;
        score: number;
        reasoning: string[];
        missing_documents: string[];
        priority_boost?: number;
    }[];
    ineligible_schemes_count: number;
    ai_insight?: {
        explanation_english: string;
        explanation_hindi: string;
        action_steps: string[];
        document_guidance: string[];
        alternative_schemes?: string[];
    };
}
