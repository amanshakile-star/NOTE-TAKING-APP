# Memory Intelligence - Project Structure

```
memory-intelligence/
├── public/                          # Static assets
│   ├── favicon.ico                  # Browser favicon
│   ├── icon-192.png                 # PWA icon (192x192)
│   ├── icon-512.png                 # PWA icon (512x512)
│   ├── apple-touch-icon.png         # iOS icon (180x180)
│   ├── robots.txt                   # Search engine instructions
│   ├── manifest.webmanifest         # PWA manifest
│   └── firebase-messaging-sw.js     # Firebase Cloud Messaging service worker
│
├── src/                             # Source code
│   ├── components/                  # Reusable React components
│   │   └── Layout.jsx               # Main app layout with navigation
│   │
│   ├── config/                      # Configuration files
│   │   └── firebase.js              # Firebase initialization
│   │
│   ├── contexts/                    # React Context providers
│   │   └── AuthContext.jsx          # Authentication state management
│   │
│   ├── hooks/                       # Custom React hooks
│   │   └── useNotifications.js      # Notification setup hook
│   │
│   ├── pages/                       # Page components (routes)
│   │   ├── Dashboard.jsx            # Main dashboard with stats
│   │   ├── Login.jsx                # Authentication page
│   │   ├── Notes.jsx                # Notes list view
│   │   ├── NoteEditor.jsx           # Note creation/editing
│   │   └── Quotes.jsx               # Saved quotes view
│   │
│   ├── services/                    # Business logic & API calls
│   │   ├── aiService.js             # AI integration (quotes, TTS, highlighting)
│   │   ├── noteService.js           # Firestore CRUD operations
│   │   └── notificationService.js   # Push notification handling
│   │
│   ├── utils/                       # Utility functions
│   │   ├── encryption.js            # Encryption utilities (future)
│   │   └── memoryResurfacing.js     # Memory resurfacing logic
│   │
│   ├── App.jsx                      # Root component with routing
│   ├── main.jsx                     # Application entry point
│   └── index.css                    # Global styles (Tailwind)
│
├── scripts/                         # Helper scripts
│   └── generate-icons.html          # Icon generation tool
│
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── index.html                       # HTML entry point
├── package.json                     # Dependencies & scripts
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── vite.config.js                   # Vite build configuration
│
├── README.md                        # Project overview
├── SETUP.md                         # Setup instructions
├── FEATURES.md                      # Feature documentation
├── DEPLOYMENT.md                    # Deployment guide
└── PROJECT_STRUCTURE.md             # This file
```

## Key Files Explained

### Configuration Files

#### `vite.config.js`
- Vite build configuration
- PWA plugin setup
- Service worker configuration
- Manifest generation
- Workbox caching strategies

#### `tailwind.config.js`
- Tailwind CSS customization
- Dark mode configuration
- Content paths for purging

#### `postcss.config.js`
- PostCSS plugins
- Tailwind and Autoprefixer setup

#### `.env`
- Firebase credentials
- API keys
- Environment-specific settings
- **Never commit this file!**

### Source Code

#### `src/main.jsx`
- React app initialization
- Root component mounting
- Global imports

#### `src/App.jsx`
- Route definitions
- Authentication wrapper
- Layout structure

#### `src/index.css`
- Tailwind directives
- Global styles
- Custom CSS overrides
- Quill editor theming

### Components

#### `src/components/Layout.jsx`
- Navigation bar
- User menu
- Page wrapper
- Notification initialization

### Contexts

#### `src/contexts/AuthContext.jsx`
- Authentication state
- Login/logout functions
- User session management
- Firebase Auth integration

### Pages

#### `src/pages/Dashboard.jsx`
- Statistics display
- Quick actions
- User overview

#### `src/pages/Login.jsx`
- Google sign-in
- Email/password authentication
- Sign up form

#### `src/pages/Notes.jsx`
- Notes list
- Filtering options
- Delete functionality
- Navigation to editor

#### `src/pages/NoteEditor.jsx`
- Rich text editor (Quill)
- Tag management
- Reminder date picker
- AI analysis
- Text-to-speech
- Save/update logic

#### `src/pages/Quotes.jsx`
- Saved quotes display
- Random quote notification
- Quote cards

### Services

#### `src/services/noteService.js`
**Functions:**
- `createNote(userId, noteData)` - Create new note
- `updateNote(noteId, noteData)` - Update existing note
- `deleteNote(noteId)` - Delete note
- `getUserNotes(userId)` - Fetch all user notes
- `getNote(noteId)` - Fetch single note
- `saveQuote(userId, quoteData)` - Save quote
- `getUserQuotes(userId)` - Fetch all user quotes

#### `src/services/aiService.js`
**Functions:**
- `analyzeNoteForQuotes(text)` - Extract powerful sentences
- `highlightExamContent(text)` - Detect exam-relevant content
- `textToSpeech(text)` - Convert text to speech
- `stopSpeech()` - Stop TTS playback

**Note:** Currently uses mock implementations. Replace with real AI API.

#### `src/services/notificationService.js`
**Functions:**
- `requestNotificationPermission()` - Request permission
- `setupNotificationListener(callback)` - Listen for messages
- `showLocalNotification(title, body)` - Show notification

### Utilities

#### `src/utils/memoryResurfacing.js`
**Functions:**
- `setupMemoryResurfacing(userId)` - Initialize resurfacing
- `suggestDailyEntry()` - Daily journal reminder

**Logic:**
- Checks for notes older than 7 days
- Randomly selects one to resurface
- Shows notification with time elapsed
- Tracks resurfacing count

#### `src/utils/encryption.js`
- Placeholder for future encryption
- Web Crypto API examples
- Client-side encryption utilities

### Hooks

#### `src/hooks/useNotifications.js`
- Requests notification permission
- Sets up message listener
- Initializes memory resurfacing
- Triggers daily suggestions

### Public Assets

#### `public/manifest.webmanifest`
- PWA configuration
- App name and description
- Icons and theme colors
- Display mode (standalone)
- Start URL

#### `public/firebase-messaging-sw.js`
- Service worker for Firebase Cloud Messaging
- Background notification handling
- Must be in public root

## Data Flow

### Authentication Flow
```
User → Login.jsx → AuthContext → Firebase Auth → Firestore
```

### Note Creation Flow
```
User → NoteEditor.jsx → noteService.js → Firestore → Notes.jsx
```

### Memory Resurfacing Flow
```
Timer → memoryResurfacing.js → noteService.js → notificationService.js → User
```

### AI Analysis Flow
```
User → NoteEditor.jsx → aiService.js → Display Results
```

## State Management

### Global State (Context)
- **AuthContext**: User authentication state
- Accessible via `useAuth()` hook

### Local State (Component)
- Notes list
- Editor content
- Form inputs
- UI toggles

### Persistent State
- **Firestore**: Notes, quotes, user data
- **localStorage**: Resurfacing count, last suggestion date
- **Service Worker**: Cached assets

## Routing

```
/ (root)
├── /login              → Login.jsx (public)
└── / (authenticated)   → Layout.jsx
    ├── /               → Dashboard.jsx
    ├── /notes          → Notes.jsx
    ├── /notes/new      → NoteEditor.jsx
    ├── /notes/:id      → NoteEditor.jsx
    └── /quotes         → Quotes.jsx
```

## Build Output

```
dist/
├── assets/
│   ├── index-[hash].js      # Main bundle
│   ├── index-[hash].css     # Styles
│   └── [other chunks]       # Code-split chunks
├── icon-192.png
├── icon-512.png
├── manifest.webmanifest
├── firebase-messaging-sw.js
├── sw.js                    # Generated service worker
└── index.html               # Entry HTML
```

## Dependencies

### Core
- **react**: UI library
- **react-dom**: React DOM renderer
- **react-router-dom**: Client-side routing

### Firebase
- **firebase**: Firebase SDK (Auth, Firestore, Messaging)

### UI
- **react-quill**: Rich text editor
- **lucide-react**: Icon library
- **tailwindcss**: Utility-first CSS

### Build Tools
- **vite**: Build tool and dev server
- **@vitejs/plugin-react**: React support for Vite
- **vite-plugin-pwa**: PWA plugin for Vite

### Styling
- **postcss**: CSS processing
- **autoprefixer**: CSS vendor prefixes

## Development Workflow

1. **Start dev server**: `npm run dev`
2. **Make changes**: Edit files in `src/`
3. **Hot reload**: Changes reflect immediately
4. **Test features**: Use browser DevTools
5. **Build**: `npm run build`
6. **Preview**: `npm run preview`
7. **Deploy**: Follow DEPLOYMENT.md

## Testing Strategy

### Manual Testing
- [ ] Authentication (Google + Email)
- [ ] Note CRUD operations
- [ ] Rich text editing
- [ ] Tag management
- [ ] Reminder dates
- [ ] AI analysis
- [ ] Text-to-speech
- [ ] Quote saving
- [ ] Notifications
- [ ] Offline mode
- [ ] PWA installation

### Browser Testing
- [ ] Chrome (Desktop & Android)
- [ ] Edge (Desktop)
- [ ] Safari (iOS)
- [ ] Firefox (Desktop)

### PWA Testing
- [ ] Install on Android
- [ ] Install on Windows
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Service worker updates

## Code Style

### Naming Conventions
- **Components**: PascalCase (e.g., `NoteEditor.jsx`)
- **Functions**: camelCase (e.g., `getUserNotes`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `NOTES_COLLECTION`)
- **Files**: kebab-case for utilities (e.g., `memory-resurfacing.js`)

### Component Structure
```javascript
// Imports
import { useState } from 'react';

// Component
export default function ComponentName() {
  // State
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {}, []);
  
  // Handlers
  const handleAction = () => {};
  
  // Render
  return <div>...</div>;
}
```

### File Organization
- One component per file
- Related utilities in same directory
- Shared utilities in `src/utils/`
- Keep files under 300 lines

## Performance Optimization

### Current Optimizations
- Code splitting by route
- Lazy loading components
- Service worker caching
- Firestore offline persistence
- Optimized bundle size

### Future Optimizations
- Image lazy loading
- Virtual scrolling for long lists
- Debounced search
- Memoized components
- Web Workers for AI processing

## Security Considerations

### Implemented
- HTTPS required (PWA requirement)
- Firebase security rules
- User data isolation
- XSS protection (React)
- CSRF protection (Firebase)

### Future Enhancements
- Client-side encryption
- Rate limiting
- Input sanitization
- Content Security Policy
- Audit logging

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review Firebase usage
- Monitor error logs
- Test PWA installation
- Backup Firestore data

### Version Updates
```bash
# Check outdated packages
npm outdated

# Update minor/patch versions
npm update

# Update major versions (carefully)
npm install package@latest
```

## Contributing

When adding new features:
1. Create feature branch
2. Update relevant documentation
3. Test thoroughly
4. Update this structure doc if needed
5. Submit pull request

## Resources

- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
