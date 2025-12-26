
import { GoogleGenAI } from '@google/genai';

async function testApiKey() {
    const apiKey = "AIzaSyDhb4K4NWcEEU9qbNDyVwVqmb3G8G0VfFg"; // Key from .env
    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log("--- STARTING API KEY DIAGNOSTIC ---");
    console.log("Model: gemini-1.5-flash");

    try {
        const result = await model.generateContent("Hello! Are you working?");
        const response = await result.response;
        const text = response.text();
        console.log("--- SUCCESS! ---");
        console.log("Model Response:", text);
    } catch (error: any) {
        console.error("--- API KEY FAILURE ---");
        console.error("Error Message:", error.message);
        console.error("Error Details:", JSON.stringify(error, null, 2));
    }
}

testApiKey();
