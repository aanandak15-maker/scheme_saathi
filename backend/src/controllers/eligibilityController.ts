
import { Request, Response } from 'express';
import { generateReasoning } from '../services/aiReasoning';
import { EligibilityEngine } from '../services/eligibilityEngine';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const checkEligibility = async (req: Request, res: Response) => {
    const { citizenId, schemeId } = req.body;

    if (!citizenId || !schemeId) {
        return res.status(400).json({ error: 'citizenId and schemeId are required.' });
    }

    try {
        // 1. Fetch Citizen Profile
        const { data: citizen, error: citizenError } = await supabase
            .from('citizen_profiles')
            .select('*')
            .eq('citizen_id', citizenId)
            .single();

        if (citizenError || !citizen) {
            return res.status(404).json({ error: 'Citizen not found.' });
        }

        // 2. Fetch Scheme Details
        const { data: scheme, error: schemeError } = await supabase
            .from('schemes')
            .select('*')
            .eq('scheme_id', schemeId)
            .single();

        if (schemeError || !scheme) {
            return res.status(404).json({ error: 'Scheme not found.' });
        }


        // 3. Run Rule-based Local Engine
        const engineResult = EligibilityEngine.evaluate(citizen.profile_data, [scheme]);
        const localResult = engineResult.eligible_schemes[0] || engineResult.ineligible_schemes[0];

        // 4. Generate AI Reasoning (Empathetic & Multilingual)
        const aiResponse = await generateReasoning(citizen.profile_data, localResult, scheme);

        // 5. Save Result to Database
        const { data: result, error: saveError } = await supabase
            .from('eligibility_results')
            .insert({
                citizen_id: citizenId,
                scheme_id: schemeId,
                is_eligible: localResult.is_eligible,
                eligibility_score: localResult.score,
                reasoning: JSON.stringify({
                    rules: localResult.reasoning,
                    ai_english: aiResponse.explanation_english,
                    ai_hindi: aiResponse.explanation_hindi
                }),
                missing_documents: localResult.missing_documents,
                alternative_schemes: aiResponse.alternative_schemes || []
            })
            .select()
            .single();

        if (saveError) {
            console.error('Error saving result:', saveError);
        }

        res.json({
            eligible: localResult.is_eligible,
            score: localResult.score,
            rule_analysis: localResult.reasoning,
            ai_explanation: {
                english: aiResponse.explanation_english,
                hindi: aiResponse.explanation_hindi
            },
            action_steps: aiResponse.action_steps,
            document_guidance: aiResponse.document_guidance,
            missing_documents: localResult.missing_documents,
            db_record: result
        });

    } catch (error: any) {
        console.error('Eligibility Check Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const checkBatchEligibility = async (req: Request, res: Response) => {
    try {
        const citizenProfile = req.body; // Expects full profile JSON

        // 1. Fetch All Schemes and Rules
        const { data: schemes, error: schemeError } = await supabase
            .from('schemes')
            .select('*');

        const { data: rules, error: rulesError } = await supabase
            .from('eligibility_rules')
            .select('*');

        if (schemeError || !schemes) throw new Error('Failed to fetch schemes');

        // 2. Merge rules into schemes
        const schemesWithRules = schemes.map(s => {
            const ruleSet = rules?.find(r => r.scheme_id === s.scheme_id);
            if (ruleSet) {
                // Return merged object for the engine
                return {
                    ...s,
                    eligibility_criteria: {
                        ...s.eligibility_criteria,
                        engine_rules: ruleSet
                    }
                };
            }
            return s;
        });

        // 3. Run Rule Engine on All Schemes
        const engineResult = EligibilityEngine.evaluate(citizenProfile, schemesWithRules);

        // 4. For the top eligible scheme (if any), run AI reasoning
        let aiReasoning = null;
        const topScheme = engineResult.eligible_schemes[0];

        if (topScheme) {
            const fullScheme = schemesWithRules.find(s => s.scheme_id === topScheme.scheme_id);
            if (fullScheme) {
                aiReasoning = await generateReasoning(citizenProfile, topScheme, fullScheme);
            }
        }

        res.json({
            summary: engineResult.summary,
            eligible_schemes: engineResult.eligible_schemes,
            ineligible_schemes_count: engineResult.ineligible_schemes.length,
            ai_insight: aiReasoning
        });

    } catch (error: any) {
        console.error('Batch Check Error:', error);
        res.status(500).json({ error: error.message });
    }
};
