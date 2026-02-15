
export interface CitizenProfile {
    citizen_id: string;
    full_name: string;
    name_hindi?: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    aadhaar_number: string;
    mobile_number: string;
    language_preference?: string[];
    location: {
        state: string;
        district: string;
        block: string;
        village_city: string;
        area_type: 'Rural' | 'Urban' | 'Semi-Urban';
        pincode: string;
    };
    occupation: {
        primary_occupation: string;
        occupation_category: string;
        monthly_income: number;
        income_source?: string;
        employment_type?: string;
        is_bpl?: boolean;
    };
    farmer_details: {
        is_farmer: boolean;
        land_ownership?: boolean;
        land_area_acres?: number;
        land_type?: string;
        crops_grown?: string[];
        has_kisan_credit_card?: boolean;
        farmer_category?: string;
    };
    financial: {
        has_bank_account: boolean;
        bank_name?: string;
        account_number?: string;
        ifsc_code?: string;
        is_income_tax_payer?: boolean;
        annual_income?: number;
    };
    social: {
        caste_category?: string;
        religion?: string;
        minority_status?: boolean;
    };
    family: {
        family_size?: number;
        dependents?: number;
        has_disabled_member?: boolean;
        is_widow?: boolean;
        has_adult_earning_member?: boolean;
        female_head_of_family?: boolean;
        has_girl_child?: boolean;
        number_of_girl_children?: number;
        girl_child_ages?: number[];
    };
    housing: {
        house_type?: 'Pucca' | 'Semi-pucca' | 'Kutcha' | 'No House';
        owns_house?: boolean;
        has_electricity?: boolean;
        has_toilet?: boolean;
    };
    documents: {
        aadhaar_card: boolean;
        pan_card?: boolean;
        bank_passbook?: boolean;
        land_records?: boolean;
        bpl_card?: boolean;
        ration_card?: boolean;
        voter_id?: boolean;
        driving_license?: boolean;
    };
    exclusions: {
        is_government_employee?: boolean;
        is_pensioner?: boolean;
        pension_amount?: number;
        owns_motorized_vehicle?: boolean;
        is_professional?: boolean;
        professional_type?: string;
        constitutional_post?: boolean;
        is_mp_mla?: boolean;
    };
    digital: {
        can_use_smartphone?: boolean;
        internet_access?: boolean;
        literacy_level?: string;
    };
}
