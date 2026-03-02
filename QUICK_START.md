# Quick Start Guide - Memory Intelligence

Get up and running in 10 minutes!

## Prerequisites

- Node.js 16+ installed
- npm or yarn
- Firebase account (free tier works)
- Modern browser (Chrome/Edge recommended)

## 1. Install Dependencies (2 min)

```bash
npm install
```

## 2. Firebase Setup (5 min)

### Create Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" → Enter "memory-intelligence"
3. Disable Analytics (optional) → Create

### Enable Services
1. **Authentication**: 
   - Click "Get started"
   - Enable "Email/Password"
   - Enable "Google"

2. **Firestore**:
   - Click "Create database"
   - Start in production mode
   - Choose location → Enable

3. **Cloud Messaging**:
   - Go to Project Settings → Cloud Messaging
   - Generate Web Push certificate
   - Copy VAPID key

### Get Config
1. Project Settings → Your apps → Web (</>)
2. Register app: "memory-intelligence-web"
3. Copy config values

## 3. Configure Environment (1 min)

Create `.env` file:
```bash
cp .env.example .env
```

Fill in Firebase values:
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=memory-intelligence.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=memory-intelligence
VITE_FIREBASE_STORAGE_BUCKET=memory-intelligence.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_VAPID_KEY=BNx...
```

Update `public/firebase-messaging-sw.js` with same values.

## 4. Generate Icons (1 min)

Open `scripts/generate-icons.html` in browser:
- Right-click each canvas
- Save as `public/icon-192.png` and `public/icon-512.png`

Or use any 192x192 and 512x512 PNG images.

## 5. Run Development Server (1 min)

```bash
npm run dev
```

Open http://localhost:5173

## 6. Test the App

1. **Sign Up**: Create account with email/password
2. **Create Note**: Click "New Note" → Write something → Save
3. **Add Tags**: Tag your note
4. **Set Reminder**: Pick a future date
5. **AI Analysis**: Click "AI Analyze" to highlight content
6. **Text-to-Speech**: Click "Read" to hear your note
7. **Save Quote**: Go to Quotes page
8. **Check Dashboard**: View your stats

## 7. Test PWA Features

### Test Offline
1. Open DevTools (F12)
2. Application → Service Workers
3. Check "Offline"
4. Refresh page → Should still work!

### Test Installation
1. Look for install icon in address bar
2. Click to install
3. App opens in standalone window

### Test Notifications
1. Allow notifications when prompted
2. Create a note
3. Check for daily suggestion notification

## Common Issues

### "Firebase not configured"
- Check `.env` file exists
- Verify all variables start with `VITE_`
- Restart dev server after changing `.env`

### "Service worker not registering"
- Must use HTTPS (or localhost)
- Check browser console for errors
- Clear cache and reload

### "Notifications not working"
- Check notification permission granted
- Verify VAPID key is correct
- Check `firebase-messaging-sw.js` is configured

### "Icons not loading"
- Ensure icons exist in `public/` folder
- Check file names match manifest
- Clear browser cache

## Next Steps

1. **Customize**: Edit colors in `tailwind.config.js`
2. **Add AI**: Integrate real AI API in `src/services/aiService.js`
3. **Deploy**: Follow `DEPLOYMENT.md`
4. **Explore**: Read `FEATURES.md` for all capabilities

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for updates
npm outdated
```

## File Structure Quick Reference

```
src/
├── pages/          # Add new pages here
├── components/     # Reusable UI components
├── services/       # API calls and business logic
├── contexts/       # Global state management
└── utils/          # Helper functions

public/             # Static assets (icons, manifest)
```

## Adding Features

### New Page
1. Create `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Layout.jsx`

### New Service
1. Create `src/services/newService.js`
2. Export functions
3. Import and use in components

### New Component
1. Create `src/components/NewComponent.jsx`
2. Export default
3. Import where needed

## Keyboard Shortcuts (in editor)

- **Ctrl/Cmd + B**: Bold
- **Ctrl/Cmd + I**: Italic
- **Ctrl/Cmd + U**: Underline
- **Ctrl/Cmd + S**: Save (if implemented)

## Tips

1. **Use Tags**: Organize notes with consistent tags
2. **Set Reminders**: Review important notes periodically
3. **AI Mode**: Let AI highlight key concepts for studying
4. **Daily Entries**: Build a journaling habit
5. **Quotes**: Mark powerful insights immediately

## Getting Help

- Check `README.md` for overview
- Read `SETUP.md` for detailed setup
- See `FEATURES.md` for feature documentation
- Review `DEPLOYMENT.md` for deployment
- Check browser console for errors

## Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com)
- [PWA Guide](https://web.dev/progressive-web-apps/)

## Support

Found a bug? Have a question?
- Check existing issues
- Review documentation
- Check browser console
- Verify Firebase configuration

---

**You're ready to go! Start building your memory intelligence system.** 🧠
