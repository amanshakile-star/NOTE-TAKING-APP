# Memory Intelligence PWA

A Progressive Web App for smart note-taking with AI-powered memory resurfacing, quote extraction, and study mode.

## Features

- **Smart Notes System**: Rich text editor with tagging, folders, and future reminders
- **AI Memory Resurfacing**: Random notifications of old notes
- **Quote Extraction**: AI-powered quote detection and manual marking
- **AI Study Mode**: Text-to-speech with exam content highlighting
- **Offline Support**: Full offline functionality with Service Worker
- **Push Notifications**: Random quote notifications and memory reminders
- **Cross-Platform**: Installable on Android and Windows (Chrome/Edge)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Google + Email/Password)
   - Enable Firestore Database
   - Enable Cloud Messaging
   - Get your Firebase config

3. Configure environment:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase credentials

4. Update Firebase Messaging Service Worker:
   - Edit `public/firebase-messaging-sw.js`
   - Replace placeholder values with your Firebase config

5. Run development server:
```bash
npm run dev
```

6. Build for production:
```bash
npm run build
```

## Firebase Security Rules

### Firestore Rules:
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

## AI Integration

The app includes placeholder AI functions in `src/services/aiService.js`. To integrate real AI:

1. Choose an AI provider (OpenAI, Anthropic, Google AI, etc.)
2. Add API key to `.env`
3. Implement the following functions:
   - `analyzeNoteForQuotes()`: Extract powerful sentences
   - `highlightExamContent()`: Detect exam-relevant content
   - `textToSpeech()`: Currently uses Web Speech API

## PWA Installation

### Android:
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Install app" or "Add to Home screen"

### Windows:
1. Open the app in Chrome or Edge
2. Click the install icon in the address bar
3. Or go to Settings > Apps > Install this site as an app

## Architecture

```
src/
├── components/      # Reusable UI components
├── config/          # Firebase configuration
├── contexts/        # React contexts (Auth)
├── pages/           # Main application pages
├── services/        # Business logic (notes, AI, notifications)
└── main.jsx         # Application entry point
```

## Future Enhancements

- Advanced AI models for better quote detection
- Spaced repetition algorithm for memory resurfacing
- Voice recording for notes
- Collaborative notes sharing
- Export to PDF/Markdown
- Advanced search and filtering
- Custom AI training on user notes

## License

MIT
