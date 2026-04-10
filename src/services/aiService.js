// AI Service - Gemini API Integration
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API (lazy initialization)
const getGeminiAPI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('Gemini API key is missing or invalid');
    return null;
  }
  
  return new GoogleGenerativeAI(apiKey);
};

const GEMINI_MODEL = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `You are a smart AI assistant integrated into a notes and productivity app.
Your tasks:
1. Answer questions
2. Summarize notes
3. Generate quotes or ideas
4. Help users stay productive
5. Give simple explanations for technical topics

Behavior:
- Be concise but helpful
- Use simple language
- When given notes, analyze and extract key ideas
- Offer suggestions when possible
- Stay relevant to the user's request`;

export async function analyzeNoteForQuotes(text) {
  console.log('analyzeNoteForQuotes: Starting analysis for text length:', text?.length);
  
  try {
    if (!text || text.trim() === '') {
      console.log('analyzeNoteForQuotes: Empty text provided');
      return [];
    }

    const genAI = getGeminiAPI();
    if (!genAI) throw new Error('Gemini API key not configured.');
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction: SYSTEM_PROMPT });
    
    const prompt = `Analyze the following text and extract 3-5 meaningful, inspirational, or important quotes that would be worth remembering. Return ONLY the quotes, one per line, without numbering or extra formatting:\n\n${text}`;
    
    console.log('analyzeNoteForQuotes: Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();
    
    console.log('analyzeNoteForQuotes: Received response from Gemini');
    
    // Parse quotes from response
    const quotes = aiText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 10);
    
    console.log('analyzeNoteForQuotes: Found quotes:', quotes.length);
    return quotes;
  } catch (error) {
    console.error('analyzeNoteForQuotes: Error during analysis:', error);
    throw error;
  }
}

export async function highlightExamContent(text) {
  console.log('highlightExamContent: Starting analysis for text length:', text?.length);
  
  try {
    if (!text || text.trim() === '') {
      console.log('highlightExamContent: Empty text provided');
      return [];
    }

    const genAI = getGeminiAPI();
    if (!genAI) throw new Error('Gemini API key not configured.');
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction: SYSTEM_PROMPT });
    
    const prompt = `Analyze the following text and identify key exam content, important definitions, concepts, and facts that a student should remember. Return ONLY the important highlights, one per line, without numbering:\n\n${text}`;
    
    console.log('highlightExamContent: Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();
    
    console.log('highlightExamContent: Received response from Gemini');
    
    // Parse highlights from response
    const highlights = aiText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 10);
    
    console.log('highlightExamContent: Total highlights found:', highlights.length);
    return highlights;
  } catch (error) {
    console.error('highlightExamContent: Error during analysis:', error);
    throw error;
  }
}

export async function askAIAssistant(question, context = null) {
  console.log('askAIAssistant: Starting with question:', question);
  
  try {
    if (!question || question.trim() === '') {
      console.log('askAIAssistant: Empty question provided');
      throw new Error('Please enter a question');
    }

    const genAI = getGeminiAPI();
    if (!genAI) throw new Error('Gemini API key not configured.');
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction: SYSTEM_PROMPT });
    
    let prompt = question;
    
    // If context is provided (from notes, PDFs, etc.), include it
    if (context && context.trim() !== '') {
      prompt = `Based on the following content, answer this question: ${question}\n\nContent:\n${context}`;
      console.log('askAIAssistant: Using context from document');
    } else {
      console.log('askAIAssistant: No context provided, answering general question');
    }
    
    console.log('askAIAssistant: Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();
    
    console.log('askAIAssistant: Received response from Gemini');
    return aiText;
  } catch (error) {
    console.error('askAIAssistant: Error during query:', error);
    throw error;
  }
}

export async function textToSpeech(text) {
  console.log('textToSpeech: Starting speech for text length:', text?.length);
  
  try {
    if (!text || text.trim() === '') {
      console.log('textToSpeech: Empty text provided');
      return;
    }

    // Using Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
      console.log('textToSpeech: Speech started');
    } else {
      console.warn('textToSpeech: Speech synthesis not supported');
    }
  } catch (error) {
    console.error('textToSpeech: Error during speech:', error);
  }
}

export function stopSpeech() {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      console.log('stopSpeech: Speech stopped');
    }
  } catch (error) {
    console.error('stopSpeech: Error stopping speech:', error);
  }
}
