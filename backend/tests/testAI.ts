
import { generateReasoning } from '../src/services/aiReasoning';
import { EligibilityEngine } from '../src/services/eligibilityEngine';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { CitizenProfile } from '../src/models/citizen';

// Helper to handle both import and require environments
const requireJSON = (filePath: string) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));

dotenv.config({ path: path.join(__dirname, '../.env') });

const SCHEMES_FILE = path.join(__dirname, '../tests/fixtures/test_schemes_with_rules.json');
const CITIZENS_FILE = path.join(__dirname, '../../citizen_profiles_test_data.json');

// Using the fixture scheme data as it contains the rules needed for the engine
const schemesData = requireJSON(SCHEMES_FILE);
const citizensData = requireJSON(CITIZENS_FILE);

async function runAITest() {
    console.log('🤖 Running AI Reasoning Tests with Gemini 2.0 Flash...\n');

    // Test Case 1: Ramesh Kumar (Farmer) -> PM-KISAN (SCH001)
    const ramesh = citizensData.find((c: any) => c.full_name === 'Ramesh Kumar');
    const pmKisan = schemesData.find((s: any) => s.scheme_id === 'SCH001');

    if (ramesh && pmKisan) {
        console.log(`\n--------------------------------------------------`);
        console.log(`TEST 1: ${ramesh.full_name} -> ${pmKisan.scheme_name}`);
        console.log(`--------------------------------------------------`);

        // 1. Run Rule Engine
        const evaluation = EligibilityEngine.evaluate(ramesh as CitizenProfile, [pmKisan]);
        const ruleResult = evaluation.eligible_schemes.find((r: any) => r.scheme_id === pmKisan.scheme_id)
            || evaluation.ineligible_schemes.find((r: any) => r.scheme_id === pmKisan.scheme_id);

        if (ruleResult) {
            console.log(`Rule Result: ${ruleResult.is_eligible ? '✅ Eligible' : '❌ Not Eligible'}`);
            console.log(`Reasoning: ${ruleResult.reasoning.join(', ')}`);

            // 2. Run AI Reasoning
            console.log(`\nGenerating AI Explanation...`);
            const aiResult = await generateReasoning(ramesh as CitizenProfile, ruleResult, pmKisan);

            console.log(`\n[HINDI]:\n${aiResult.explanation_hindi}`);
            console.log(`\n[ENGLISH]:\n${aiResult.explanation_english}`);
            console.log(`\n[STEPS]:\n${aiResult.action_steps.join('\n')}`);
        } else {
            console.error('❌ Could not evaluate scheme.');
        }
    }

    // Test Case 2: Sunita Devi (Widow) -> PMAY-G (SCH003)
    const sunita = citizensData.find((c: any) => c.full_name === 'Sunita Devi');
    const pmayg = schemesData.find((s: any) => s.scheme_id === 'SCH003');

    if (sunita && pmayg) {
        console.log(`\n--------------------------------------------------`);
        console.log(`TEST 2: ${sunita.full_name} -> ${pmayg.scheme_name}`);
        console.log(`--------------------------------------------------`);

        const evaluation = EligibilityEngine.evaluate(sunita as CitizenProfile, [pmayg]);
        const ruleResult = evaluation.eligible_schemes.find((r: any) => r.scheme_id === pmayg.scheme_id)
            || evaluation.ineligible_schemes.find((r: any) => r.scheme_id === pmayg.scheme_id);

        if (ruleResult) {
            console.log(`Rule Result: ${ruleResult.is_eligible ? '✅ Eligible' : '❌ Not Eligible'}`);
            console.log(`Reasoning: ${ruleResult.reasoning.join(', ')}`);

            console.log(`\nGenerating AI Explanation...`);
            const aiResult = await generateReasoning(sunita as CitizenProfile, ruleResult, pmayg);

            console.log(`\n[HINDI]:\n${aiResult.explanation_hindi}`);
            console.log(`\n[ENGLISH]:\n${aiResult.explanation_english}`);
            console.log(`\n[STEPS]:\n${aiResult.action_steps.join('\n')}`);
        } else {
            console.error('❌ Could not evaluate scheme.');
        }
    } else {
        console.log('\n⚠️ PMAY-G scheme or Sunita profile not found in test data.');
    }
}

runAITest().catch(console.error);
