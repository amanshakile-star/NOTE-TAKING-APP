import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === "PASTE_YOUR_KEY_HERE") {
  console.error("❌ API key is missing!");
  console.error("\nPlease follow these steps:");
  console.error("1. Open the file: gemini-test/.env");
  console.error("2. Replace PASTE_YOUR_KEY_HERE with your real Gemini API key");
  console.error("3. Save the file");
  console.error("4. Run 'npm start' again");
  console.error("\nGet your API key from: https://makersuite.google.com/app/apikey");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    console.log("Initializing Gemini API...\n");
    
    // Using gemini-2.5-flash - one of the latest and fastest models
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    
    const prompt = "Explain what API is in simple words";
    console.log(`Sending prompt: "${prompt}"\n`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Response:\n");
    console.log(text);
    console.log("\n✅ Success!");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\nIf you see a 404 error, run 'node listModels.js' to see available models.");
  }
}

run();
