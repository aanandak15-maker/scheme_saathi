
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Database } from '../types/supabase';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function seed() {
    console.log('🌱 Starting database seeding...');

    try {
        // 1. Read JSON files
        const schemesPath = path.join(__dirname, '../schemes_database.json');
        const documentsPath = path.join(__dirname, '../documents_master.json');
        const citizensPath = path.join(__dirname, '../citizen_profiles_test_data.json');
        const rulesPath = path.join(__dirname, '../eligibility_rules_engine.json');

        const schemesData = JSON.parse(fs.readFileSync(schemesPath, 'utf-8'));
        const documentsData = JSON.parse(fs.readFileSync(documentsPath, 'utf-8'));
        const citizensData = JSON.parse(fs.readFileSync(citizensPath, 'utf-8'));
        const rulesData = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));

        // 2. Seed Documents
        console.log('📄 Seeding documents...');
        const { error: documentsError } = await supabase
            .from('documents')
            .upsert(documentsData, { onConflict: 'doc_id' });

        if (documentsError) {
            throw new Error(`Error seeding documents: ${documentsError.message}`);
        }
        console.log(`✅ ${documentsData.length} documents seeded successfully.`);

        // 3. Seed Schemes (merging rules engine data)
        console.log('🏛️  Seeding schemes...');

        const enrichedSchemes = schemesData.map((scheme: any) => {
            const schemeRules = rulesData.rules_by_scheme[scheme.scheme_id];
            if (schemeRules) {
                // Merge engine rules into eligibility_criteria
                scheme.eligibility_criteria = {
                    ...scheme.eligibility_criteria,
                    engine_rules: schemeRules
                };
            }
            return scheme;
        });

        const { error: schemesError } = await supabase
            .from('schemes')
            .upsert(enrichedSchemes, { onConflict: 'scheme_id' });

        if (schemesError) {
            throw new Error(`Error seeding schemes: ${schemesError.message}`);
        }
        console.log(`✅ ${enrichedSchemes.length} schemes seeded successfully.`);

        // 4. Seed Citizen Profiles
        console.log('👤 Seeding citizen profiles...');

        // Transform citizen data to match table schema
        const formattedCitizens = citizensData.map((citizen: any) => {
            return {
                citizen_id: citizen.citizen_id,
                full_name: citizen.full_name,
                name_hindi: citizen.name_hindi || null,
                age: citizen.age,
                gender: citizen.gender,
                mobile_number: citizen.mobile_number,
                profile_data: citizen, // Store complete profile JSON
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        });

        const { error: citizenError } = await supabase
            .from('citizen_profiles')
            .upsert(formattedCitizens, { onConflict: 'citizen_id' });

        if (citizenError) {
            throw new Error(`Error seeding citizen profiles: ${citizenError.message}`);
        }
        console.log(`✅ ${formattedCitizens.length} citizen profiles seeded successfully.`);

        console.log('✨ Database seeding completed successfully!');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
