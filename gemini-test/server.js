import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from public directory
app.use(express.static(join(__dirname, 'public')));

// Main route - inject API key into HTML
app.get('/', (req, res) => {
  try {
    const htmlPath = join(__dirname, 'public', 'index.html');
    let html = readFileSync(htmlPath, 'utf-8');
    
    // Inject the API key from .env
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'PASTE_YOUR_KEY_HERE') {
      res.status(500).send(`
        <h1>Error: API Key Missing</h1>
        <p>Please add your Gemini API key to the .env file</p>
        <p>Open: gemini-test/.env</p>
        <p>Add: GEMINI_API_KEY=your_key_here</p>
      `);
      return;
    }
    
    html = html.replace('__GEMINI_API_KEY__', apiKey);
    res.send(html);
    
  } catch (error) {
    res.status(500).send('Error loading page: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Gemini AI Chat is running!`);
  console.log(`\n📱 Open in browser: http://localhost:${PORT}`);
  console.log(`\n✅ API Key loaded successfully`);
  console.log(`\nPress Ctrl+C to stop the server\n`);
});
