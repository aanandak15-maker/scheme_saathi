
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { Database } from '../src/types/database';

dotenv.config();

// Load JSON data
const SCHEMES_FILE = path.join(__dirname, '../data/master_schemes.json');
const RULES_FILE = SCHEMES_FILE; // Unified
const DOCS_FILE = path.join(__dirname, '../../documents_master.json');
const CITIZENS_FILE = path.join(__dirname, '../../citizen_profiles_test_data.json');

const schemesData = JSON.parse(fs.readFileSync(SCHEMES_FILE, 'utf-8'));
const docsData = JSON.parse(fs.readFileSync(DOCS_FILE, 'utf-8'));
const citizensData = JSON.parse(fs.readFileSync(CITIZENS_FILE, 'utf-8'));

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey || supabaseKey.includes('placeholder')) {
    console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file.');
    console.error('Please configure your Supabase credentials in backend/.env before running the seed script.');
    process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function seed() {
    console.log('🌱 Starting seed process...');
    console.log(`Connecting to Supabase at ${supabaseUrl.substring(0, 20)}...`);

    // 1. Seed Documents
    console.log(`\n📄 Seeding ${docsData.length} documents...`);
    const { error: docsError } = await supabase
        .from('documents')
        .upsert(docsData.map((d: any) => ({
            doc_id: d.doc_id,
            doc_name: d.doc_name,
            doc_type: d.doc_type,
            issuing_authority: d.issuing_authority,
            validity: d.validity,
            digital_available: d.digital_available
        })), { onConflict: 'doc_id' });

    if (docsError) console.error('Error seeding documents:', docsError);
    else console.log('✅ Documents seeded.');

    // 2. Seed Schemes
    console.log(`\n🏛️  Seeding ${schemesData.length} schemes...`);
    const { error: schemesError } = await supabase
        .from('schemes')
        .upsert(schemesData.map((s: any) => ({
            scheme_id: s.scheme_id,
            scheme_name: s.scheme_name,
            scheme_name_hindi: s.scheme_name_hindi,
            category: s.category,
            subcategory: s.subcategory,
            ministry: s.ministry,
            launched_year: s.launched_year,
            benefit_amount: s.benefit_amount,
            benefit_type: s.benefit_type,
            description: s.description,
            eligibility_criteria: s.eligibility_criteria,
            application_process: s.application_process,
            ai_context: s.ai_context,
            status: s.status,
            last_updated: s.last_updated
        })), { onConflict: 'scheme_id' });

    if (schemesError) console.error('Error seeding schemes:', schemesError);
    else console.log('✅ Schemes seeded.');

    // 3. Seed Scheme Documents (Junction)
    console.log(`\n🔗 Seeding scheme_documents requirements...`);
    const schemeDocsPayload: any[] = [];

    // Create a map for doc_name -> doc_id for easy lookup
    const docMapByNames: Record<string, string> = {};
    docsData.forEach((d: any) => {
        docMapByNames[d.doc_name.toLowerCase()] = d.doc_id;
    });

    schemesData.forEach((s: any) => {
        if (s.required_documents) {
            s.required_documents.forEach((doc: any) => {
                const docId = doc.doc_id || docMapByNames[doc.doc_name.toLowerCase()];
                if (docId) {
                    schemeDocsPayload.push({
                        scheme_id: s.scheme_id,
                        doc_id: docId,
                        mandatory: doc.mandatory
                    });
                } else {
                    console.warn(`⚠️  Could not find doc_id for document: "${doc.doc_name}" in scheme ${s.scheme_id}`);
                }
            });
        }
    });

    const { error: schemeDocsError } = await supabase
        .from('scheme_documents')
        .upsert(schemeDocsPayload as any, { onConflict: 'scheme_id,doc_id' });

    if (schemeDocsError) console.error('Error seeding scheme_documents:', schemeDocsError);
    else console.log(`✅ ${schemeDocsPayload.length} Scheme-Document links seeded.`);

    // 4. Seed Eligibility Rules
    console.log(`\n📏 Seeding eligibility rules...`);
    const rulesPayload: any[] = [];

    schemesData.forEach((s: any) => {
        if (s.eligibility_criteria?.engine_rules) {
            const ruleSet = s.eligibility_criteria.engine_rules;
            rulesPayload.push({
                scheme_id: s.scheme_id,
                rule_type: ruleSet.rule_type,
                logic: ruleSet.logic,
                inclusion_rules: ruleSet.inclusion_rules,
                exclusion_rules: ruleSet.exclusion_rules,
                special_priority_rules: ruleSet.special_priority_rules || [],
                minimum_score: ruleSet.minimum_score,
                alternative_schemes: ruleSet.alternative_schemes || []
            });
        }
    });

    // Important: We need a conflict strategy. Since rule_id is auto-gen, we delete existing first for this scheme
    for (const rule of rulesPayload) {
        await supabase.from('eligibility_rules').delete().eq('scheme_id', rule.scheme_id);
    }

    const { error: rulesError } = await supabase
        .from('eligibility_rules')
        .insert(rulesPayload as any);

    if (rulesError) console.error('Error seeding rules:', rulesError);
    else console.log(`✅ ${rulesPayload.length} Rule sets seeded.`);

    // 5. Seed Citizen Profiles
    console.log(`\n👤 Seeding ${citizensData.length} citizen profiles...`);
    const { error: citizenError } = await supabase
        .from('citizen_profiles')
        .upsert(citizensData.map((c: any) => ({
            citizen_id: c.citizen_id,
            full_name: c.full_name,
            name_hindi: c.name_hindi,
            age: c.age,
            gender: c.gender,
            aadhaar_number: c.aadhaar_number,
            mobile_number: c.mobile_number,
            language_preference: c.language_preference,

            // Nested JSONB fields
            location: c.location,
            occupation: c.occupation,
            farmer_details: c.farmer_details,
            financial: c.financial,
            social: c.social,
            family: c.family,
            housing: c.housing,
            documents_available: c.documents, // Mismatch: JSON has 'documents', DB has 'documents_available'
            exclusions: c.exclusions,
            digital: c.digital,
            enrolled_schemes: c.schemes_enrolled // Mismatch: JSON has 'schemes_enrolled', DB has 'enrolled_schemes'
        })), { onConflict: 'citizen_id' });

    if (citizenError) console.error('Error seeding citizens:', citizenError);
    else console.log('✅ Citizen profiles seeded.');

    console.log('\n✨ Database seed completed!');
}

seed().catch(console.error);
