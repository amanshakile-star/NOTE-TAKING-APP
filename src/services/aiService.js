// AI Service - Gemini API Integration
// Uses direct REST API for maximum compatibility with Vite + Vercel

const GEMINI_MODEL = 'gemini-1.5-flash-latest';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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

// Get and validate API key at call time (not module load time)
function getApiKey() {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key.trim() === '' || key === 'your_gemini_api_key_here') {
    throw new Error(
      'VITE_GEMINI_API_KEY is missing or invalid. ' +
      'Add it to your .env file locally, and to Vercel Environment Variables in production.'
    );
  }
  return key.trim();
}

// Core fetch function - direct REST call to Gemini API
async function callGemini(userPrompt) {
  const apiKey = getApiKey();

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents: [
      {
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024
    }
  };

  console.log(`[Gemini] Calling model: ${GEMINI_MODEL}`);

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error('[Gemini] HTTP error:', res.status, errBody);
    throw new Error(`Gemini API error ${res.status}: ${errBody}`);
  }

  const data = await res.json();

  // Extract text from response
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error('[Gemini] Unexpected response shape:', JSON.stringify(data));
    throw new Error('Gemini returned an empty or unexpected response.');
  }

  console.log('[Gemini] Response received, length:', text.length);
  return text;
}

// Parse response into array of non-empty lines
function parseLines(text, minLength = 10) {
  return text
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.length >= minLength);
}

/* ─── Public API ─────────────────────────────────────────────── */

export async function analyzeNoteForQuotes(text) {
  if (!text?.trim()) return [];

  const prompt =
    `Extract 3-5 meaningful, inspirational, or important quotes from the text below. ` +
    `Return ONLY the quotes, one per line, no numbering:\n\n${text}`;

  const result = await callGemini(prompt);
  const quotes = parseLines(result);
  console.log('[Gemini] Quotes found:', quotes.length);
  return quotes;
}

export async function highlightExamContent(text) {
  if (!text?.trim()) return [];

  const prompt =
    `Analyze the text below and identify key exam content: important definitions, ` +
    `concepts, and facts a student must remember. ` +
    `Return ONLY the highlights, one per line, no numbering:\n\n${text}`;

  const result = await callGemini(prompt);
  const highlights = parseLines(result);
  console.log('[Gemini] Highlights found:', highlights.length);
  return highlights;
}

export async function askAIAssistant(question, context = null) {
  if (!question?.trim()) throw new Error('Please enter a question.');

  let prompt = question;
  if (context?.trim()) {
    prompt = `Using the content below as context, answer this question: ${question}\n\nContent:\n${context}`;
  }

  return await callGemini(prompt);
}

/* ─── Web Speech API (no Gemini needed) ─────────────────────── */

export function textToSpeech(text) {
  if (!text?.trim() || !('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
