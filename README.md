# MP-yout-ube

A modern, scalable web platform for content management and user authentication.

Built with a focus on performance, clean architecture, and professional user experience.

## Features

- **User authentication** — Email / Google via Firebase  
- **Responsive UI** — Light, dark, and warm display modes  
- **Content management** — Videos, categories, profiles, Firestore-backed data  
- **Local + cloud-ready** — Vite env configuration for development and hosted builds  
- **Scalable structure** — React + TypeScript, clear layers (pages, context, services)

## Tech stack

| Area | Technology |
|------|------------|
| UI | React, TypeScript, Tailwind CSS (v4) |
| Build | Vite |
| Auth & data | Firebase (Authentication, Firestore, Storage) |
| Routing | React Router |
| Forms / validation | React Hook Form, Zod |

Theme preference is persisted in **localStorage** via the app theme context.

## Authentication

The project uses **Firebase Authentication**.

**Supported:**

- Email / password sign-in and registration  
- Google Sign-In (`GoogleAuthProvider` + popup)  
- Password reset  
- **Guest** vs **signed-in member** — protected routes for profile, upload, dashboard, settings  

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd MP-yout-ube
npm install
```

### 2. Environment variables

Create **`.env`** or **`.env.local`** in the project root using **`.env.example`** as a template.

**Required Firebase Web SDK variables** (all six must be non-empty):

- `VITE_FIREBASE_API_KEY`  
- `VITE_FIREBASE_AUTH_DOMAIN`  
- `VITE_FIREBASE_PROJECT_ID`  
- `VITE_FIREBASE_STORAGE_BUCKET`  
- `VITE_FIREBASE_MESSAGING_SENDER_ID`  
- `VITE_FIREBASE_APP_ID`  

After changing env files, **restart** the dev server (`npm run dev`). On **Vercel** (or similar), set the same variable names and **redeploy** so the build embeds them.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Production build

```bash
npm run build
npm run preview   # optional local preview of dist/
```

## System architecture

| Layer | Responsibility |
|-------|----------------|
| **UI** | Components, pages, layout |
| **State & logic** | React context, hooks |
| **Services** | Firebase (auth, Firestore, Storage), data access |
| **Config** | Environment variables (`VITE_*`) |

## Security

Use **Firebase Security Rules** (and/or a trusted backend) to protect Firestore and Storage. Client-side route guards only improve UX.

## Project status

Actively developed with focus on UX, performance, and production readiness.

## Author

**Michael Papismedov – MP**  

Independent developer focused on building modern, scalable, and high-quality web systems.

## License & copyright

© 2026 **Michael Papismedov – MP**  
All rights reserved.

This project and its code are protected. Unauthorized use, copying, or distribution without permission is not allowed.
