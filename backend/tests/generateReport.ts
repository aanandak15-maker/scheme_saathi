import fs from 'fs';
import path from 'path';
import { EligibilityEngine } from '../src/services/eligibilityEngine';
import { generateReasoning } from '../src/services/aiReasoning';
const testCitizensData = require('../../citizen_profiles_test_data.json');
const testSchemesData = require('./fixtures/test_schemes_with_rules.json');

const citizens = Array.isArray(testCitizensData) ? testCitizensData : (testCitizensData as any).default;
const schemes = Array.isArray(testSchemesData) ? testSchemesData : (testSchemesData as any).default;

async function runTests() {
    console.log('🚀 Starting Integration Test Report Generation...');

    const results: any[] = [];
    const startTotal = Date.now();

    const testCases = [
        { citizenId: 'CIT001', schemeId: 'SCH001', expected: true, label: 'Farmer -> PM-KISAN' },
        { citizenId: 'CIT002', schemeId: 'SCH003', expected: true, label: 'BPL -> PMAY-G' },
        { citizenId: 'CIT003', schemeId: 'SCH005', expected: true, label: 'Vendor -> SVANidhi' },
        { citizenId: 'CIT004', schemeId: 'SCH004', expected: true, label: 'Worker -> PM-SYM' },
    ];

    for (const testCase of testCases) {
        const citizen = citizens.find((c: any) => c.citizen_id === testCase.citizenId);
        const scheme = schemes.find((s: any) => s.scheme_id === testCase.schemeId);

        if (!citizen || !scheme) {
            console.error(`Missing data for ${testCase.label}`);
            continue;
        }

        const startEngine = Date.now();
        const engineResult = EligibilityEngine.evaluate(citizen, [scheme]);
        const endEngine = Date.now();

        const evaluation = engineResult.eligible_schemes[0] || engineResult.ineligible_schemes[0];
        const engineTime = endEngine - startEngine;

        let aiResult = null;
        let aiTime = 0;

        if (process.env.GEMINI_API_KEY) {
            const startAI = Date.now();
            try {
                aiResult = await generateReasoning(citizen, evaluation, scheme);
            } catch (err) {
                aiResult = { explanation_english: 'AI Error' };
            }
            aiTime = Date.now() - startAI;
        }

        results.push({
            label: testCase.label,
            actual: evaluation.is_eligible,
            expected: testCase.expected,
            score: evaluation.score,
            engineTime,
            aiTime,
            aiExplanation: aiResult?.explanation_english || 'AI Disabled',
            reasoning: evaluation.reasoning.filter((r: string) => r.startsWith('✅')).length + ' rules passed'
        });
    }

    const endTotal = Date.now();
    generateMarkdownReport(results, endTotal - startTotal);
}

function generateMarkdownReport(results: any[], totalTime: number) {
    const accuracy = (results.filter(r => r.actual === r.expected).length / results.length) * 100;

    let md = `# 📊 Scheme Saathi Integration Test Report\n\n`;
    md += `**Date:** ${new Date().toLocaleString()}\n`;
    md += `**Total Execution Time:** ${totalTime}ms\n\n`;

    md += `## 🎯 Summary Metrics\n`;
    md += `| Metric | Value |\n`;
    md += `| :--- | :--- |\n`;
    md += `| **Decision Accuracy** | ${accuracy}% |\n`;
    md += `| **Avg Engine Latency** | ${Math.round(results.reduce((a, b) => a + b.engineTime, 0) / results.length)}ms |\n`;
    md += `| **Avg AI Latency** | ${Math.round(results.reduce((a, b) => a + b.aiTime, 0) / results.length)}ms |\n\n`;

    md += `## 📋 Detailed Test Results\n`;
    md += `| Case | Decision | Score | Engine | AI | Reasoning | AI Explanation |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    for (const r of results) {
        const status = r.actual === r.expected ? '✅ PASS' : '❌ FAIL';
        md += `| ${r.label} | ${status} | ${r.score} | ${r.engineTime}ms | ${r.aiTime}ms | ${r.reasoning} | ${r.aiExplanation.substring(0, 50)}... |\n`;
    }

    md += `\n---\n*Report generated automatically by Scheme Saathi Test Suite.*`;

    const reportPath = path.join(__dirname, 'TEST_REPORT.md');
    fs.writeFileSync(reportPath, md);
    console.log(`✅ Report saved to: ${reportPath}`);
}

runTests();
