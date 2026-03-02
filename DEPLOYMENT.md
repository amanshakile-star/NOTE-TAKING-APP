# Deployment Guide - Memory Intelligence PWA

## Pre-Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Environment variables set in `.env`
- [ ] Service worker configured with Firebase credentials
- [ ] App icons generated (192x192, 512x512)
- [ ] Tested locally with `npm run dev`
- [ ] Tested PWA installation locally
- [ ] Tested offline functionality
- [ ] Tested notifications

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Deployment Options

### Option 1: Firebase Hosting (Recommended)

Firebase Hosting is ideal since you're already using Firebase services.

#### Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting
firebase init hosting
```

#### Configuration
When prompted:
- Select your Firebase project
- Public directory: `dist`
- Configure as single-page app: `Yes`
- Set up automatic builds with GitHub: `No` (or Yes if you want CI/CD)
- Overwrite index.html: `No`

#### Deploy
```bash
# Build and deploy
npm run build
firebase deploy --only hosting

# Your app will be live at:
# https://your-project-id.web.app
# https://your-project-id.firebaseapp.com
```

#### Custom Domain (Optional)
1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow DNS configuration steps
4. SSL certificate auto-provisioned

### Option 2: Vercel

Fast and easy deployment with automatic HTTPS.

#### Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Build command: npm run build
# - Output directory: dist
```

#### Environment Variables
Add in Vercel dashboard:
- Settings > Environment Variables
- Add all `VITE_*` variables from `.env`

#### Custom Domain
- Settings > Domains
- Add your domain
- Configure DNS as instructed

### Option 3: Netlify

Great for static sites with continuous deployment.

#### Setup
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Or use Netlify UI:
1. Go to https://app.netlify.com
2. Drag and drop `dist` folder
3. Or connect GitHub repo for auto-deploy

#### Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Environment Variables
- Site settings > Build & deploy > Environment
- Add all `VITE_*` variables

### Option 4: GitHub Pages

Free hosting for public repositories.

#### Setup
```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
"deploy": "npm run build && gh-pages -d dist"
```

#### Configure Vite
Update `vite.config.js`:
```javascript
export default defineConfig({
  base: '/memory-intelligence/', // Your repo name
  // ... rest of config
});
```

#### Deploy
```bash
npm run deploy
```

Access at: `https://yourusername.github.io/memory-intelligence/`

### Option 5: AWS Amplify

Enterprise-grade hosting with AWS integration.

#### Setup
1. Go to AWS Amplify Console
2. Connect your Git repository
3. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables
5. Deploy

### Option 6: Cloudflare Pages

Fast global CDN with free tier.

#### Setup
1. Go to Cloudflare Pages
2. Connect Git repository
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables
5. Deploy

## Post-Deployment Steps

### 1. Update Firebase Configuration

Add your production domain to Firebase:
1. Firebase Console > Authentication > Settings
2. Authorized domains > Add domain
3. Add your production URL

### 2. Test PWA Installation

#### Android
1. Open site in Chrome
2. Menu > Install app
3. Verify icon appears on home screen
4. Test offline functionality

#### Windows
1. Open site in Chrome/Edge
2. Click install icon in address bar
3. Verify app in Start Menu
4. Test offline functionality

### 3. Test Notifications

1. Allow notifications when prompted
2. Create a test note
3. Wait for daily suggestion
4. Test random quote notification

### 4. Verify Service Worker

1. Open DevTools > Application
2. Check Service Workers tab
3. Verify registration
4. Test offline mode

### 5. Performance Testing

Run Lighthouse audit:
1. Open DevTools
2. Lighthouse tab
3. Generate report
4. Aim for 90+ scores

### 6. Security Headers

Add security headers (varies by platform):

#### Netlify (_headers file)
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

#### Vercel (vercel.json)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

## Continuous Deployment

### GitHub Actions (Firebase)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

### Environment Variables in CI/CD

Add secrets in GitHub:
- Settings > Secrets and variables > Actions
- Add all `VITE_*` variables

## Monitoring

### Firebase Analytics
```javascript
// Add to src/config/firebase.js
import { getAnalytics } from 'firebase/analytics';
export const analytics = getAnalytics(app);
```

### Error Tracking

#### Sentry
```bash
npm install @sentry/react
```

```javascript
// src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

## Troubleshooting

### Service Worker Not Updating
```bash
# Clear service worker cache
# In DevTools > Application > Service Workers
# Click "Unregister" then refresh
```

### Environment Variables Not Working
- Ensure variables start with `VITE_`
- Rebuild after changing variables
- Check deployment platform's env var settings

### CORS Issues
- Verify Firebase authorized domains
- Check API endpoint configurations
- Ensure HTTPS is used

### PWA Not Installing
- Verify HTTPS (required)
- Check manifest.json is accessible
- Verify all icons exist
- Check browser console for errors

## Scaling Considerations

### Database
- Monitor Firestore usage
- Add indexes for complex queries
- Consider Firebase pricing tiers

### Storage
- Implement pagination for notes list
- Add lazy loading for images
- Consider Firebase Storage for media

### Performance
- Enable CDN caching
- Optimize images
- Implement code splitting
- Use React.lazy for routes

## Backup Strategy

### Firestore Backup
```bash
# Using Firebase CLI
firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)
```

### Automated Backups
- Set up Cloud Scheduler
- Export to Cloud Storage
- Retention policy: 30 days

## Cost Optimization

### Firebase Free Tier Limits
- Firestore: 1GB storage, 50K reads/day
- Authentication: Unlimited
- Hosting: 10GB storage, 360MB/day transfer
- Cloud Messaging: Unlimited

### Tips
- Implement pagination
- Cache aggressively
- Optimize queries
- Monitor usage in Firebase Console

## Support & Maintenance

### Regular Tasks
- [ ] Monitor Firebase usage
- [ ] Check error logs
- [ ] Update dependencies monthly
- [ ] Review security rules
- [ ] Test PWA installation
- [ ] Backup database weekly

### Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update major versions carefully
npm install package@latest
```
