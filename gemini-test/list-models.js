// Import required packages
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log('Fetching available models...');
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'Missing');
    console.log('---');

    // Try to list models
    const models = await genAI.listModels();
    
    console.log('Available models:');
    for await (const model of models) {
      console.log(`- ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

listModels();
