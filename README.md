# Portfolio

A multi-user portfolio platform: anyone signs in, fills in their resume details, and gets a hosted one-page portfolio at `yoursite.com/<username>`.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Firebase Auth + Firestore · Vercel

## What's included

| Route | What it does |
|---|---|
| `/` | Landing page |
| `/demo` | Sample portfolio (works without Firebase) |
| `/login` | Google or email/password sign-in, password reset |
| `/dashboard` | Claim a username, edit with live preview, save (⌘S), set Draft / Public / Private, page password, change link |
| `/<username>` | Portfolio page; password prompt when Private; 404 when Draft |
| `/search?q=` | Find Public profiles by city or ZIP code |

Portfolio layout: sticky profile card on the left (photo, "Available for work" badge, scrolling specialties, years/projects/clients stats, contact list, Contact and Meet buttons) and sections on the right — About with info cards, colour-coded Skills, Experience timeline + Education, filterable Portfolio, Reviews, Contact and Meeting. Light/dark toggle, per-user accent colour and optional background image.

## Visibility

Each profile has one of three settings, switched at the top of the dashboard:

| Setting | Who can see it | Searchable |
|---|---|---|
| **Draft** | Only the owner | No |
| **Public** | Anyone with the link | Yes, by city or ZIP at `/search` |
| **Private** | Anyone with the link **and** the page password | No |

How it's enforced (see `firestore.rules`):

- `profiles/{uid}` holds the editable profile and is readable only by its owner.
- When Public, a copy is written to `publicProfiles/{username}` with `cityKey`/`zipKey` for search. Only this collection can be queried.
- When Private, a copy is written to `privateProfiles/{key}`, where `key = PBKDF2(password, uid)`. The password is never stored. Visitors derive the key in their browser, so without the password the data can't be found, and the collection can't be listed.
- Switching away from Public/Private deletes that copy in the same batch.
- Profile pages send `noindex`, so search engines don't list them.

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
