# Portfolio

A multi-user portfolio platform: anyone signs in, fills in their resume details, and gets a hosted one-page portfolio at `yoursite.com/<username>`.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Firebase Auth + Firestore · Vercel

## What's included

| Route | What it does |
|---|---|
| `/` | Landing page |
| `/demo` | Sample portfolio (works without Firebase) |
| `/login` | Google or email/password sign-in, password reset |
| `/dashboard` | Claim a username, edit with live preview, save (⌘S), Draft / Public / Private, invite emails, page password, change link |
| `/<username>` | Portfolio page; when Private, sign-in for invited emails and/or password prompt; 404 when Draft |
| `/search?q=` | Find Public profiles by name, skills or location |

Portfolio layout: sticky profile card on the left (photo, "Available for work" badge, scrolling specialties, years/projects/clients stats, contact list, Contact and Meet buttons) and sections on the right — About with info cards, colour-coded Skills, Experience timeline + Education, filterable Portfolio, Reviews, Contact and Meeting. Light/dark toggle, per-user accent colour and optional background image.

## Editor

The dashboard groups the profile into collapsible sections, all closed by default, each marked **Complete** (green tick), **In progress** or **Empty**, with a profile-strength bar:

Personal Details (with photo upload) · Professional Summary · Education · Certifications · Work Experience · Skills · Projects · Personal Projects · Immigration Details · References · Links · Additional Info · Testimonials · Design & Extras

Email, phone, immigration details and references each have a "show on my page" switch. Immigration and references are hidden by default.

## Export

Every profile page, and the dashboard's top bar, has an **Export** menu. It only exports what that visitor can see:

- **PDF résumé:** a plain, ATS-friendly layout printed through the browser's Save as PDF (`ResumeDocument.tsx`).
- **Excel workbook (.xlsx):** one sheet per section, with bold frozen headers. It's built without any extra packages (`lib/export/xlsx.ts`).
- **Contact card (.vcf):** vCard 3.0 for Contacts, Outlook or Google Contacts.

Uploaded photos are cropped to a 400×400 JPEG in the browser and stored with the profile, so they don't need Firebase Storage.

## Visibility

| Setting | Who can see it | Searchable |
|---|---|---|
| **Draft** | Only the owner | No |
| **Public** | Anyone with the link | Yes, by name, headline, skills, city, state, ZIP or country at `/search` |
| **Private** | People the owner invites by email (they sign in with that email), or anyone with the page password if one is set | No |

How it's enforced (see `firestore.rules`):

- `profiles/{uid}` holds the editable profile, including the invite list, and only its owner can read it.
- Visitors only ever read a copy built by `publishedView()`, which leaves out anything switched off and the invite list.
- **Public:** the copy goes to `publicProfiles/{username}` with `searchTokens`. This is the only collection that can be queried.
- **Private, by email:** the copy goes to `sharedProfiles/{uid}`. Each invited email is a doc in `sharedProfiles/{uid}/viewers/{email}`. A visitor can read the copy only when signed in with a verified email that has a viewer doc. Email/password accounts get a verification email at sign-up.
- **Private, by password:** the copy goes to `privateProfiles/{key}`, where `key = PBKDF2(password, uid)`. The password is never stored.
- Changing visibility, invites or password updates all copies in one batch.
- Profile pages send `noindex`.

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
