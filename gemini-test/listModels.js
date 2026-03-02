import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === "PASTE_YOUR_KEY_HERE") {
  console.error("❌ API key is missing in .env file!");
  process.exit(1);
}

async function listModels() {
  try {
    console.log("Fetching available models for your API key...\n");
    console.log("API Key:", apiKey.substring(0, 10) + "..." + apiKey.substring(apiKey.length - 4));
    console.log("=" .repeat(60));
    
    // Direct API call to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.models || data.models.length === 0) {
      console.log("❌ No models found for your API key.");
      console.log("\nThis could mean:");
      console.log("1. The Generative Language API is not enabled");
      console.log("2. Your API key doesn't have access to any models");
      console.log("\nTo fix:");
      console.log("- Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com");
      console.log("- Enable the API");
      console.log("- Or get a new key from: https://aistudio.google.com/app/apikey");
      return;
    }
    
    console.log(`\n✅ Found ${data.models.length} model(s)!\n`);
    
    data.models.forEach((model, index) => {
      console.log(`${index + 1}. Model Name: ${model.name}`);
      console.log(`   Display Name: ${model.displayName || 'N/A'}`);
      console.log(`   Description: ${model.description || 'N/A'}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log(`   Input Token Limit: ${model.inputTokenLimit || 'N/A'}`);
      console.log(`   Output Token Limit: ${model.outputTokenLimit || 'N/A'}`);
      console.log("-".repeat(60));
    });
    
    console.log("\n📝 How to use a model:");
    console.log("1. Copy the 'Model Name' from above (e.g., 'models/gemini-pro')");
    console.log("2. Open index.js");
    console.log("3. Find the line with: const model = genAI.getGenerativeModel({ model: ... })");
    console.log("4. Replace the model name with one from the list above");
    console.log("5. Run 'npm start' to test");
    
    console.log("\n💡 Recommended models for text generation:");
    const textModels = data.models.filter(m => 
      m.supportedGenerationMethods?.includes('generateContent')
    );
    if (textModels.length > 0) {
      textModels.forEach(m => {
        console.log(`   - ${m.name}`);
      });
    }
    
  } catch (error) {
    console.error("\n❌ Error fetching models:", error.message);
    
    if (error.message.includes("API_KEY_INVALID") || error.message.includes("400")) {
      console.error("\nYour API key may be invalid or restricted.");
      console.error("Get a new key from: https://aistudio.google.com/app/apikey");
    } else if (error.message.includes("403")) {
      console.error("\nThe Generative Language API is not enabled.");
      console.error("Enable it at: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com");
    }
  }
}

listModels();
