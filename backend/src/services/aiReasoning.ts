
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CitizenProfile } from '../models/citizen';
import { EligibilityResult } from './eligibilityEngine';

const apiKey = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        // generationConfig: {
        //     responseMimeType: "application/json"
        // } as any
    });
} else {
    console.warn('⚠️ GEMINI_API_KEY is missing. AI reasoning will not work.');
}

export interface AIReasoningResponse {
    explanation_hindi: string;
    explanation_english: string;
    action_steps: string[];
    document_guidance: string[];
    alternative_schemes?: string[];
}

export const generateReasoning = async (
    profile: CitizenProfile,
    ruleResult: EligibilityResult,
    scheme: any
): Promise<AIReasoningResponse> => {
    if (!model) {
        return {
            explanation_english: "AI service unavailable.",
            explanation_hindi: "AI सेवा उपलब्ध नहीं है।",
            action_steps: [],
            document_guidance: []
        };
    }

    const prompt = `
    You are Scheme Saathi AI, helping rural Indian citizens understand government welfare schemes. 
    Explain eligibility decisions in simple Hindi and English. Be empathetic and clear. 
    Focus on actionable guidance. Keep language at a 5th-grade reading level.

    Context:
    - Citizen Name: ${profile.full_name}
    - Scheme: ${scheme.scheme_name} (${scheme.scheme_name_hindi})
    - Rule Engine Result: ${ruleResult.is_eligible ? "Eligible" : "Not Eligible"}
    - Rule Reasoning: ${JSON.stringify(ruleResult.reasoning)}
    - Missing Documents (Rule Engine): ${JSON.stringify(ruleResult.missing_documents)}
    - Application Process: ${JSON.stringify(scheme.application_process)}

    Task:
    Generate a JSON response explaining why they are eligible or not, what they need to do next, document advice, and where/how to apply with timeline.

    Specific Requirements:
    1. **Why Eligible**: Explain strictly based on the provided reasoning.
    2. **Documents**: List mandatory documents they need to bring.
    3. **Where to Apply**: Mention the portal URL and "CSC Center" option.
    4. **Timeline**: Estimate typically 30-45 days for processing.
    5. **Language**: Provide separate Hindi and English explanations.

    Output Schema:
    {
        "explanation_hindi": "Detailed empathetic explanation in Hindi covering eligibility, documents, and application steps.",
        "explanation_english": "Detailed empathetic explanation in English covering eligibility, documents, and application steps.",
        "action_steps": ["Step 1", "Step 2"],
        "document_guidance": ["Specific advice on how to get missing documents"]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("AI Reasoning Error:", error);
        return {
            explanation_english: "We could not generate a detailed explanation at this time.",
            explanation_hindi: "हम इस समय विस्तृत विवरण उत्पन्न नहीं कर सके।",
            action_steps: ["Please visit your local CSC center."],
            document_guidance: []
        };
    }
};
