
import { CitizenProfile } from '@/types';

export interface EligibilityResult {
    scheme_id: string;
    scheme_name: string;
    is_eligible: boolean;
    score: number;
    reasoning: string[];
    missing_documents: string[];
    priority_boost: number;
}

export interface EngineRule {
    rule_id: string;
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'in' | 'not_empty' | 'between' | 'less_than_equal';
    value: any;
    weight?: number;
    disqualifies?: boolean;
    priority_boost?: number;
    explanation: string;
}

export class EligibilityEngine {

    /**
     * Main function to check eligibility for all schemes
     */
    public static evaluate(profile: CitizenProfile, schemes: any[]): any {
        const results = schemes.map(scheme => this.evaluateScheme(profile, scheme));

        const eligible = results.filter(r => r.is_eligible);
        const ineligible = results.filter(r => !r.is_eligible);

        return {
            citizen_id: profile.citizen_id,
            eligible_schemes: eligible,
            ineligible_schemes: ineligible,
            summary: `${profile.full_name} is eligible for ${eligible.length} schemes.`
        };
    }

    /**
     * Evaluate a single scheme for a profile
     */
    private static evaluateScheme(profile: CitizenProfile, scheme: any): EligibilityResult {
        const rules = scheme.eligibility_criteria?.engine_rules;
        if (!rules) {
            return {
                scheme_id: scheme.scheme_id,
                scheme_name: scheme.scheme_name,
                is_eligible: false,
                score: 0,
                reasoning: ["No eligibility rules defined for this scheme."],
                missing_documents: [],
                priority_boost: 0
            };
        }

        let score = 0;
        let priorityBoost = 0;
        let isDisqualified = false;
        const reasoning: string[] = [];
        const missingDocs: string[] = [];

        // 1. Check Exclusion Rules (Disqualifiers)
        for (const rule of (rules.exclusion_rules || [])) {
            if (this.evaluateRule(profile, rule)) {
                isDisqualified = true;
                reasoning.push(`❌ Disqualified: ${rule.explanation}`);
            }
        }

        // 2. Check Inclusion Rules (Weighted)
        for (const rule of (rules.inclusion_rules || [])) {
            if (this.evaluateRule(profile, rule)) {
                score += rule.weight || 0;
                reasoning.push(`✅ ${rule.explanation}`);
            } else {
                reasoning.push(`ℹ️ Failed: ${rule.explanation}`);
                if (rule.field.startsWith('documents.')) {
                    missingDocs.push(rule.explanation.replace(' required', ''));
                }
            }
        }

        // 3. Check Special Priority Rules (Boosts)
        for (const rule of (rules.special_priority_rules || [])) {
            if (this.evaluateRule(profile, rule)) {
                priorityBoost += rule.priority_boost || 0;
                reasoning.push(`⭐ Priority Boost (${rule.priority_boost}): ${rule.explanation}`);
            }
        }

        const totalScore = score + priorityBoost;
        const minScore = rules.minimum_score || 0;
        const isEligible = !isDisqualified && totalScore >= minScore;

        if (!isEligible && !isDisqualified && totalScore < minScore) {
            reasoning.push(`⚠️ Total score (${totalScore}) is below minimum threshold (${minScore})`);
        }

        return {
            scheme_id: scheme.scheme_id,
            scheme_name: scheme.scheme_name,
            is_eligible: isEligible,
            score: totalScore,
            reasoning,
            missing_documents: missingDocs,
            priority_boost: priorityBoost
        };
    }

    /**
     * Helper to evaluate a single rule against a profile
     */
    private static evaluateRule(profile: any, rule: EngineRule): boolean {
        const value = this.getNestedValue(profile, rule.field);

        switch (rule.operator) {
            case 'equals':
                if (typeof value === 'string' && typeof rule.value === 'string') {
                    return value.toLowerCase() === rule.value.toLowerCase();
                }
                return value === rule.value;
            case 'greater_than':
                return value > rule.value;
            case 'less_than':
                return value < rule.value;
            case 'less_than_equal':
                return value <= rule.value;
            case 'in':
                return Array.isArray(rule.value) && rule.value.includes(value);
            case 'not_empty':
                return value !== null && value !== undefined && (Array.isArray(value) ? value.length > 0 : true);
            case 'between':
                return Array.isArray(rule.value) && value >= rule.value[0] && value <= rule.value[1];
            default:
                return false;
        }
    }

    /**
     * Helper to get nested value using dot notation
     */
    private static getNestedValue(obj: any, path: string): any {
        const directValue = path.split('.').reduce((prev, curr) => {
            return prev ? prev[curr] : undefined;
        }, obj);

        if (directValue !== undefined) return directValue;

        if (!path.includes('.')) {
            const categories = [
                'personal_info', 'location', 'occupation', 'farmer_details',
                'financial', 'social', 'family', 'housing', 'documents',
                'exclusions', 'digital'
            ];
            for (const cat of categories) {
                if (obj[cat] && obj[cat][path] !== undefined) {
                    return obj[cat][path];
                }
            }
        }

        return undefined;
    }
}
