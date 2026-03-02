import dotenv from "dotenv";

dotenv.config();

console.log("Testing .env file loading...\n");
console.log("API Key from .env:", process.env.GEMINI_API_KEY);
console.log("API Key length:", process.env.GEMINI_API_KEY?.length || 0);
console.log("First 10 chars:", process.env.GEMINI_API_KEY?.substring(0, 10));
console.log("Last 4 chars:", process.env.GEMINI_API_KEY?.substring(process.env.GEMINI_API_KEY.length - 4));
