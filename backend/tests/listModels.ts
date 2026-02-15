
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key found.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // The SDK doesn't expose listModels directly on genAI instance in all versions, 
        // but the ModelService does. 
        // However, simplest way with this SDK is to try known models or use the `getGenerativeModel` which we know fails.
        // Wait, the SDK has a `makeRequest` but it's internal.
        // Let's try to check properties of genAI or use fetch directly.

        console.log("Using API Key:", apiKey.substring(0, 10) + "...");

        // Direct fetch to list models
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            console.error("Failed to list models:", response.status, response.statusText);
            const text = await response.text();
            console.error("Response:", text);
            return;
        }

        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes("gemini")) {
                    console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                }
            });
        } else {
            console.log("No models found or structure unexpected:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
