# Memory Intelligence - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "memory-intelligence"
4. Disable Google Analytics (optional)
5. Click "Create project"

#### Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" provider
4. Enable "Google" provider
   - Add your email as authorized domain
   - Configure OAuth consent screen if needed

#### Enable Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Start in "production mode"
4. Choose a location close to your users
5. Click "Enable"

#### Configure Firestore Security Rules
1. Go to "Firestore Database" > "Rules"
2. Replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /quotes/{quoteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```
3. Click "Publish"

#### Enable Cloud Messaging
1. Go to "Cloud Messaging"
2. Click "Get started"
3. Generate Web Push certificates
4. Copy the VAPID key

#### Get Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click "Web" icon (</>)
4. Register app name: "memory-intelligence-web"
5. Copy the firebaseConfig object

### 3. Environment Configuration

Create `.env` file in project root:
```bash
cp .env.example .env
```

Fill in your Firebase credentials:
```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=memory-intelligence.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=memory-intelligence
VITE_FIREBASE_STORAGE_BUCKET=memory-intelligence.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_VAPID_KEY=BNx...
```

### 4. Update Service Worker

Edit `public/firebase-messaging-sw.js` and replace placeholder values with your Firebase config.

### 5. Create App Icons

Create two PNG icons:
- `public/icon-192.png` (192x192 pixels)
- `public/icon-512.png` (512x512 pixels)

You can use a simple brain/memory icon or your custom design.

Quick icon generation:
```bash
# Using ImageMagick (if installed)
convert -size 192x192 xc:#0f172a -fill white -pointsize 120 -gravity center -annotate +0+0 "🧠" public/icon-192.png
convert -size 512x512 xc:#0f172a -fill white -pointsize 320 -gravity center -annotate +0+0 "🧠" public/icon-512.png
```

Or use online tools like:
- https://realfavicongenerator.net/
- https://www.favicon-generator.org/

### 6. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173

### 7. Test PWA Features

#### Test Installation
1. Open Chrome DevTools (F12)
2. Go to "Application" tab
3. Check "Manifest" - should show no errors
4. Check "Service Workers" - should be registered

#### Test Offline Mode
1. In DevTools > Application > Service Workers
2. Check "Offline"
3. Refresh page - should still work

#### Test Notifications
1. Allow notifications when prompted
2. Create a note
3. Wait for daily suggestion notification
4. Check quotes page and click "Random Quote"

### 8. Build for Production

```bash
npm run build
```

Output will be in `dist/` folder.

### 9. Deploy

#### Option A: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select your project
# Set public directory to: dist
# Configure as single-page app: Yes
firebase deploy
```

#### Option B: Vercel
```bash
npm install -g vercel
vercel
```

#### Option C: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## Testing Installation

### Android
1. Open deployed URL in Chrome
2. Tap menu (⋮) > "Install app"
3. App should appear on home screen
4. Open app - should work offline

### Windows
1. Open deployed URL in Chrome/Edge
2. Click install icon in address bar (⊕)
3. Or: Settings > Apps > Install
4. App should appear in Start Menu
5. Open app - should behave like native app

## AI Integration (Optional)

To add real AI capabilities:

### Option 1: OpenAI
```bash
npm install openai
```

Add to `.env`:
```
VITE_OPENAI_API_KEY=sk-...
```

Update `src/services/aiService.js`:
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For client-side only
});

export async function analyzeNoteForQuotes(text) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{
      role: "user",
      content: `Extract 3 powerful, memorable quotes from this text:\n\n${text}`
    }]
  });
  return response.choices[0].message.content.split('\n');
}
```

### Option 2: Google AI (Gemini)
```bash
npm install @google/generative-ai
```

### Option 3: Anthropic (Claude)
```bash
npm install @anthropic-ai/sdk
```

## Troubleshooting

### Service Worker not registering
- Check HTTPS (required for PWA)
- Clear browser cache
- Check console for errors

### Notifications not working
- Ensure HTTPS
- Check notification permissions
- Verify VAPID key is correct
- Check browser compatibility

### Firebase errors
- Verify all credentials in `.env`
- Check Firestore security rules
- Ensure Authentication is enabled

### Build errors
- Delete `node_modules` and reinstall
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check Node.js version (16+ required)

## Next Steps

1. Customize AI prompts in `src/services/aiService.js`
2. Add more features (voice recording, export, etc.)
3. Implement spaced repetition algorithm
4. Add analytics (Firebase Analytics)
5. Create onboarding tutorial
6. Add data export functionality

## Support

For issues or questions:
- Check README.md
- Review Firebase documentation
- Check browser console for errors
