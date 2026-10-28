# Portfolio

A multi-user portfolio platform: anyone signs in, fills in their resume details, and gets a hosted one-page portfolio at `yoursite.com/<username>`.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Firebase Auth + Firestore · Vercel

## What's included

| Route | What it does |
|---|---|
| `/` | Landing page |
| `/demo` | Sample portfolio (works without Firebase) |
| `/login` | Google or email/password sign-in, password reset |
| `/dashboard` | Claim a username, edit profile with live preview, save (⌘S), publish/unpublish, change link |
| `/<username>` | Public portfolio, server-rendered with SEO + social card metadata; 404 when unpublished |

Portfolio sections: hero (photo, headline, tagline, resume button, socials), about with stats, skills, experience timeline, filterable project grid, education, contact. Each user picks an accent colour.

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill it in (see below)
npm run dev                  # http://localhost:3000
```

`/demo` works right away. Accounts need Firebase:

1. Create a project at https://console.firebase.google.com
2. **Build → Authentication → Sign-in method:** enable **Google** and **Email/Password**
3. **Build → Firestore Database:** create a database (production mode)
4. **Project settings → General → Your apps:** add a **Web app**, copy its config into `.env.local`
5. Deploy the security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add          # pick your project
   firebase deploy --only firestore:rules
   ```

## Deploy to Vercel

1. Import the GitHub repo at https://vercel.com/new
2. Add the same `NEXT_PUBLIC_FIREBASE_*` variables, plus `NEXT_PUBLIC_SITE_URL=https://your-domain`
3. In Firebase **Authentication → Settings → Authorized domains**, add your Vercel domain

## Data model

```
usernames/{username}  { uid }                        one doc per handle → guarantees uniqueness
profiles/{uid}        { username, published, ... }   readable by anyone only when published
```

Username claims and changes run in a Firestore transaction; `firestore.rules` enforces that a profile's username belongs to its owner.

## Ideas for next steps

- Photo and resume PDF upload (Firebase Storage) instead of URLs
- More themes/layouts in the Design tab
- Import from LinkedIn or a resume PDF (AI parsing)
- Custom domains per user, view analytics, contact form
