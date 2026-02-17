import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { EligibilityEngine } from '@/lib/eligibilityEngine';
import { generateReasoning } from '@/lib/aiReasoning';

export async function POST(request: NextRequest) {
    try {
        const citizenProfile = await request.json();

        // 1. Fetch All Schemes and Rules
        const { data: schemes, error: schemeError } = await supabaseServer
            .from('schemes')
            .select('*');

        const { data: rules, error: rulesError } = await supabaseServer
            .from('eligibility_rules')
            .select('*');

        if (schemeError || !schemes) throw new Error('Failed to fetch schemes');

        // 2. Merge rules into schemes
        const schemesWithRules = schemes.map((s: any) => {
            const ruleSet = rules?.find((r: any) => r.scheme_id === s.scheme_id);
            if (ruleSet) {
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
            const fullScheme = schemesWithRules.find((s: any) => s.scheme_id === topScheme.scheme_id);
            if (fullScheme) {
                aiReasoning = await generateReasoning(citizenProfile, topScheme, fullScheme);
            }
        }

        return NextResponse.json({
            summary: engineResult.summary,
            eligible_schemes: engineResult.eligible_schemes,
            ineligible_schemes_count: engineResult.ineligible_schemes.length,
            ai_insight: aiReasoning
        });

    } catch (error: any) {
        console.error('Batch Check Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
