
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key found in env.");
    process.exit(1);
}

// We can also use fetch directly to avoid SDK version issues for listing
async function listModels() {
    try {
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
        console.log("\n✅ Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                // Filter for gemini models
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
