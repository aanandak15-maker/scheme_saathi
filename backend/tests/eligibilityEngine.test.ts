import { EligibilityEngine } from '../src/services/eligibilityEngine';
const testCitizens = require('../../citizen_profiles_test_data.json');
const testSchemes = require('./fixtures/test_schemes_with_rules.json');

describe('EligibilityEngine Integration Tests', () => {
    const citizens = testCitizens;
    const schemes = testSchemes;

    test('Ramesh Kumar (CIT001) should be eligible for PM-KISAN (SCH001)', () => {
        const ramesh = citizens.find((c: any) => c.citizen_id === 'CIT001');
        const pmKisan = schemes.find((s: any) => s.scheme_id === 'SCH001');

        const result = EligibilityEngine.evaluate(ramesh, [pmKisan]);
        const evaluation = result.eligible_schemes[0];

        expect(evaluation.is_eligible).toBe(true);
        expect(evaluation.scheme_id).toBe('SCH001');
        expect(evaluation.score).toBeGreaterThanOrEqual(20);
        expect(evaluation.reasoning).toContain('✅ Primary occupation must be farming');
        expect(evaluation.reasoning).toContain('✅ Must own cultivable land');
    });

    test('Sunita Devi (CIT002) should be eligible for PMAY-G (SCH003)', () => {
        const sunita = citizens.find((c: any) => c.citizen_id === 'CIT002');
        const pmayg = schemes.find((s: any) => s.scheme_id === 'SCH003');

        const result = EligibilityEngine.evaluate(sunita, [pmayg]);
        const evaluation = result.eligible_schemes[0];

        expect(evaluation.is_eligible).toBe(true);
        expect(evaluation.scheme_id).toBe('SCH003');
        expect(evaluation.score).toBeGreaterThanOrEqual(15);
        expect(evaluation.reasoning).toContain('✅ Must reside in a rural area');
        expect(evaluation.reasoning).toContain('✅ Priority for BPL households');
        expect(evaluation.reasoning).toContain('✅ Must have kutcha or semi-pucca house');
    });

    test('Rajesh Sharma (CIT003) should be eligible for PM SVANidhi (SCH005)', () => {
        const rajesh = citizens.find((c: any) => c.citizen_id === 'CIT003');
        const svanidhi = schemes.find((s: any) => s.scheme_id === 'SCH005');

        const result = EligibilityEngine.evaluate(rajesh, [svanidhi]);
        const evaluation = result.eligible_schemes[0];

        expect(evaluation.is_eligible).toBe(true);
        expect(evaluation.scheme_id).toBe('SCH005');
        expect(evaluation.score).toBeGreaterThanOrEqual(20);
        expect(evaluation.reasoning).toContain('✅ Must be a street vendor');
        expect(evaluation.reasoning).toContain('✅ Urban street vendors are eligible');
    });

    test('Manoj Yadav (CIT004) should be eligible for PM-SYM (SCH004)', () => {
        const manoj = citizens.find((c: any) => c.citizen_id === 'CIT004');
        const pmsym = schemes.find((s: any) => s.scheme_id === 'SCH004');

        const result = EligibilityEngine.evaluate(manoj, [pmsym]);
        const evaluation = result.eligible_schemes[0];

        expect(evaluation.is_eligible).toBe(true);
        expect(evaluation.scheme_id).toBe('SCH004');
        expect(evaluation.score).toBeGreaterThanOrEqual(25);
        expect(evaluation.reasoning).toContain('✅ Must be an unorganised worker');
        expect(evaluation.reasoning).toContain('✅ Age must be between 18 and 40');
        expect(evaluation.reasoning).toContain('✅ Monthly income must be below 15000');
    });

    test('Ramesh should be disqualified from PM-SYM if he were a gov employee (Logic test)', () => {
        const ramesh = JSON.parse(JSON.stringify(citizens.find((c: any) => c.citizen_id === 'CIT001')));
        ramesh.exclusions.is_government_employee = true;
        const pmKisan = schemes.find((s: any) => s.scheme_id === 'SCH001');

        const result = EligibilityEngine.evaluate(ramesh, [pmKisan]);
        const evaluation = result.ineligible_schemes[0];

        expect(evaluation.is_eligible).toBe(false);
        expect(evaluation.reasoning).toContain('❌ Disqualified: Government employees are excluded');
    });
});
