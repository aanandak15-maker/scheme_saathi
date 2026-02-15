
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
} else {
    console.warn('⚠️ GEMINI_API_KEY is missing. AI features will not work.');
}

export const analyzeEligibility = async (citizenProfile: any, schemeDetails: any) => {
    if (!model) {
        throw new Error('Gemini API is not configured.');
    }

    const prompt = `
    You are an expert government scheme eligibility analyzer for "Scheme Saathi".
    
    Task: Analyze if the citizen is eligible for the given scheme based on their profile and the scheme's criteria.
    
    Citizen Profile:
    ${JSON.stringify(citizenProfile, null, 2)}
    
    Scheme Details:
    ${JSON.stringify(schemeDetails, null, 2)}
    
    Output Format (JSON only):
    {
      "is_eligible": boolean,
      "eligibility_score": number (0-100),
      "reasoning": "Clear explanation in simple English (or Hindi if preferred by profile)",
      "missing_documents": ["List of missing mandatory documents if any"],
      "next_steps": ["Step 1", "Step 2"]
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Gemini Analysis Error:', error);
        throw new Error('Failed to analyze eligibility.');
    }
};
