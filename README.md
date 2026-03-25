# MP-yout-ube (YouTube-inspired Video Platform)

פרויקט דמו מודרני בהשראת YouTube, עם SPA React + TypeScript + React Router ו- Firebase Authentication/Firestore/Storage.

## מצב הפרויקט (בהתאם ל-Phases שלך)
- **Phase 1 (מוכן ובפועל בקוד):**
  - Home (Hero + חיפוש + קטגוריות + גריד סרטונים)
  - Watch (נגן וידאו + פרטי וידאו + Related videos + Comments UI כ-placeholder)
  - Auth (Login/Register עם Email+Password, Google Login דרך Firebase Auth, ו-Forgot Password)
  - Upload (העלאת וידאו + Thumbnail ל-Storage + יצירת רשומת וידאו ב-Firestore)
  - Profile (תצוגת פרטים + סרטוני המשתמש כפי שנשלפים מ-Firestore)
  - Dashboard (סטטיסטיקות בסיסיות + רשימת סרטונים read-only)
  - Settings/About/Legal/404 (מסכים קיימים; חלק מהפונקציונליות מופיעה כ-"Phase 2" בהערות UI)
  - Admin dashboard (מסך קיים; פעולות ממשיות של Phase 3 עדיין deferred)
- **Phase 2+3:** Favorites/History/Comments פעילים, עריכת/מחיקת וידאו, Moderation, Reports, Categories management — עדיין לא יושמו כפעולות.

## Tech Stack
- **Frontend:** React + TypeScript
- **Routing:** React Router
- **UI:** Tailwind CSS (v4) עם `@tailwindcss/vite` + `@import "tailwindcss";` בקובץ `src/style.css`
- **Auth:** Firebase Authentication
  - Email/Password login/register
  - Google Login באמצעות `GoogleAuthProvider` (Firebase מודרני, לא Google Sign-In הישן)
  - Password reset (“forgot password”)
- **Data:**
  - Firestore לרשומות `users/videos/categories`
  - Firebase Storage לקבצי וידאו ו-thumbnail

## דרישות מקדימות
- Node.js (מומלץ Node 18+)

## התקנה והרצה מקומית
1. התקן חבילות:
   ```bash
   npm install
   ```
2. הגדר Firebase (ראה סעיף הבא).
3. הרצה:
   ```bash
   npm run dev
   ```
4. פתח בדפדפן:
   - `http://localhost:5173/`

## Build (בדיקת קומפילציה)
```bash
npm run build
```

## הגדרת Firebase (Critical)
יש ליצור קובץ `.env` בשורש הפרויקט, לפי `/.env.example`.

דוגמה לקובץ:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

בנוסף:
- `VITE_ADMIN_EMAILS` — רשימת אימיילים מופרדת בפסיקים שייחשבו כ-`admin` בדמו.

### מה קורה אם ה-Firebase לא מוגדר?
- `AuthProvider` יציג הודעת שגיאה (“Firebase is not configured yet…”).
- קריאות לקטגוריות/וידאו מחזירות ברירת מחדל/ריק כדי שלא תתרסק האפליקציה בזמן פיתוח.

## Role System (איך נקבע `guest/user/admin`)
- **guest**: אין משתמש מחובר
- **user**: משתמש מחובר שלא מוגדר כ-admin
- **admin**: המשתמש מוגדר כ-admin אם ה-email שלו נמצא בתוך `VITE_ADMIN_EMAILS`

בנוסף קיימת תמיכה ב-`blocked`:
- אם `users/{uid}.blocked === true`:
  - המשתמש מסומן כ-Blocked,
  - מתבצע sign-out,
  - מוצגת הודעה בממשק.

## Route Protection (Routes שעבורם יש Guards)
- `GET /upload` — RequireAuth
- `GET /profile` — RequireAuth
- `GET /dashboard` — RequireAuth
- `GET /settings` — RequireAuth
- `GET /admin` — RequireRole(`admin`)

העמוד Home ו-Watch זמינים לכולם (לפי הרשאות צפייה של וידאו):
- Watch בודק `visibility=hidden`:
  - מותר לצפות ב-hidden רק אם:
    - admin, או
    - המשתמש הוא `ownerId` של הוידאו.

> חשוב: יש לוודא **Security Rules** ב-Firebase כך שלא יוכלו לקרוא hidden videos ע"י משתמשים שאינם הבעלים (כי הקוד עושה check ב-UI, אבל כל עוד Security Rules לא חוסמים, קיימת אפשרות דליפה).

## Firestore / Storage Contract (מה ה-UI מצפה למצוא)
### Firestore collections
1. `users/{uid}`
   - `email` (string | null)
   - `name` (string)
   - `photoURL` (string | null)
   - `role` (`'guest'|'user'|'admin'` בהתאם לדמו)
   - `blocked` (boolean)
   - `createdAt` (timestamp)

   שים לב: ב-Login הראשון, אם הרשומה לא קיימת, המערכת יוצרת אותה אוטומטית.

2. `videos/{videoId}`
   - `ownerId` (string)
   - `title` (string)
   - `description` (string)
   - `categoryId` (string)
   - `tags` (string[])
   - `videoUrl` (string)
   - `thumbnailUrl` (string)
   - `durationSec` (number)
   - `views` (number)
   - `uploadedAt` (number / timestamp במימוש הנוכחי מתקבל כמספר)
   - `visibility` (`'public'|'hidden'`)

3. `categories`
   - `name` (string)
   - `slug` (string)

אם אין categories ב-Firestore, ה-UI משתמש בסט קטגוריות ברירת מחדל (דמו).

### Firebase Storage paths (כפי שהקוד מעלה)
- thumbnail:
  - `thumbnails/{ownerId}/{videoId}/{thumbnailFile.name}`
- video file:
  - `videos/{ownerId}/{videoId}/{videoFile.name}`

## מבנה תיקיות (הארגון הקיים בפרויקט)
- `src/components/` (layout + video + comments placeholders)
- `src/pages/` (כל עמוד בנפרד: Home/Watch/Auth/Upload/Profile/Dashboard/Settings/About/Legal/Admin/NotFound)
- `src/context/` (AuthContext)
- `src/routes/` (Guards)
- `src/services/` (firebase, videosService, categoriesService)
- `src/types/` (models טיפוסיים)
- `src/utils/` (helpers כגון formatDuration/extractTags)
- `assets/` (תיקיית assets ברמת root)

## Responsiveness (מובייל/טאבלט) — YouTube-like
- Header כולל:
  - Logo משמאל
  - Home / Search / Upload / About
  - Login/Register או Profile + Dashboard + Logout בהתאם למצב Auth
- במובייל:
  - מופיע hamburger עם drawer צד (overlay) נקי, מהיר ואינטואיטיבי.
  - אותו סט פריטים מופיע בדראואר כדי לשמור על עקביות UX.

## הערות Phase 2/3 (מה עדיין חסר בקוד)
- Favorites + Watch history: עדיין Phase 2
- Comments פעילים: עדיין Phase 2 (כרגע רק Placeholder בעמוד Watch)
- עריכת/מחיקת סרטונים + toggle visibility: עדיין Phase 2/3
- Admin: user management, video moderation, reports, categories management — Phase 3

