# Memory Document (PROJECT_MEMORY)

The living document that keeps your AI tool caught up across sessions.

## Project Status & Log
* **2026-11-11:** Initial project architecture initialized and documents created.
* **Decision 1 (Updated 2026-11-12):** Architecture officially migrated to **Firebase** (Google Cloud Firestore for NoSQL document storage, Firebase Authentication for Phone SMS OTP login, Firebase Cloud Storage with Zero-Trust storage rules, and Firebase Admin SDK).
* **Decision 2:** Locked UI design to **Clean Light Minimalist** aesthetic using white canvas (`#FFFFFF`), off-white background (`#F8FAF7`), light grey borders (`#E5E9E4`), and deep forest green accents (`#1B4D3E`). Strictly NO dark-mode components allowed.
* **Decision 3:** Implemented flexible **Dual Verification (Option C)**: Claimers must pass **EITHER** Secret Detail Challenge (Option A) **OR** Visual Photo Compare (Option B) to unlock contact info, safe meeting points, and raw images.
* **Decision 4:** Integrated Zero-Trust File Storage (Sharp Gaussian auto-blur trigger for public previews in `/items-public-blurred/{itemId}`) and locked raw images in `/items-private-raw/{itemId}` accessible only by verified claimers or admins.
* **Decision 5:** Added SMS Fallback Gateway for offline match alerts and a 30-day auto-expiration lifecycle rule for stale listings.
* **2026-11-12 (Phase 1 Completed):**
  - Next.js App Router (React 19) initialized with Tailwind CSS v3, TypeScript, and Lucide React.
  - Strict Light Mode tokens and theme configured. PWA manifest and service worker setup.
  - Responsive Navbar, Main Shell, and Footer created with foundational sample cards.
* **2026-11-12 (Phase 2 Completed):**
  - Installed `firebase`, `firebase-admin`, and `sharp`.
  - Configured `/lib/firebase/client.ts` and `/lib/firebase/admin.ts` with singleton and modular SDK patterns.
  - Defined comprehensive Firestore TypeScript models in `/types/database.ts` (`User`, `Item` with `searchKeywords: string[]`, `Verification`, `HandoverSession`, `EscrowTransaction`, `SmsNotification`).
  - Implemented Firebase Phone Authentication helpers in `/lib/firebase/auth.ts` (`setupRecaptcha`, `sendPhoneOtp`, `confirmPhoneOtp`, `formatRwandaPhoneNumber`).
  - Authored Firebase Storage security rules in `storage.rules` and linked in `firebase.json`.
  - Built `/lib/redact.ts` for masking document numbers (`119988****521`) and applying Sharp Gaussian blur with EXIF stripping.
* **2026-11-13 (Phase 3 Completed):**
  - Built server-side `/api/items/route.ts` (POST for multipart uploads with Sharp Gaussian auto-blur, zero-trust document masking, secret answer SHA-256 hashing, and keyword generation; GET with zero-trust stripping of raw files and contact phones).
  - Built Rwanda administrative location dataset in `/lib/rwanda-locations.ts` covering all Provinces, Districts, and Sectors.
  - Developed `FinderUploadForm` (`/report-found`): multi-step wizard with cascading Rwanda location dropdowns, live masking preview (`119988****521`), delivery fee input, and Option C verification setup.
  - Developed `ClaimerBountyForm` (`/post-lost`): lost property reporting with bounty incentive, last known location, and SMS notification setup.
  - Developed `ItemCatalog` component (`src/components/ItemCatalog.tsx`) with real-time Type tabs (Found vs Lost), Category filters, District dropdown, and keyword search.
  - Created dedicated `/search` page and integrated interactive feed on homepage (`/`).
* **2026-11-13 (Phase 4 Completed):**
  - Built Auto-Match Engine (`/api/match/route.ts`) calculating multi-factor cross-match scores (Category 35%, Masked ID 45%, District 15%, Sector 15%, Keywords 10%). Integrated automatic background execution into `POST /api/items`.
  - Built Africa's Talking / Local SMS Fallback Gateway in `/lib/sms.ts` dispatching cellular notifications for high-confidence matches and verification milestones, persisted to `smsNotifications` collection.
  - Built Dual Verification Engine (`/api/verify/route.ts`) handling Option A (SHA-256 hashed challenge verification) and Option B (Visual photo comparison approval). Verified that passing updates item status to `CLAIMED`, unlocks raw images and finder phone numbers, and starts the 48-hour handover grace timer.
  - Created interactive `VerificationModal.tsx` and wired it into `ItemCatalog.tsx` across the entire application.
  - Verified end-to-end with automated test generating a 100% cross-match and sending cellular SMS alerts.

* **2026-11-13 (Phase 5 Completed):**
  - **MoMo Escrow Locker API (`/api/escrow/lock`):** Validates `verification.isVerified === true` before locking funds. Enforces min 500 RWF / max 500,000 RWF boundaries and auto-appends 100 RWF flat platform fee for SMS gateway costs. Creates `EscrowTransaction` (status: `LOCKED`), generates dynamic `HandoverSession` with `qrToken` and 6-digit backup code, and dispatches SMS alert to finder.
  - **MTN MoMo / Airtel Money Integration (`/lib/momo.ts`):** Implemented collection, payout disbursement, and refund helpers with live credentials support and sandbox/mock fallback mode.
  - **In-Person QR Handover Modal (`HandoverQRModal.tsx`):** Built dual-view modal: Finder view (high-contrast QR code canvas + 6-digit fallback code + 48h timer) and Claimer view (`html5-qrcode` camera viewfinder + manual code input). Wired into `ItemCatalog.tsx` and `VerificationModal.tsx`.
  - **Escrow Release API (`/api/escrow/release`):** Validates QR token or 6-digit code, marks `HandoverSession` as `COMPLETED`, updates `EscrowTransaction` to `RELEASED`, triggers MoMo payout disbursement to finder, updates item to `RESOLVED`, and dispatches SMS receipts.
  - **Admin Moderation & Dispute Dashboard (`/admin`):** Protected by admin passkey gate (`rwanda-admin-2026`) with 3 clean tabs:
    1. *Active Disputes & 48h Overdue Claims:* Displays flagged disputes and overdue claims with one-click `Force Release to Finder` and `Refund to Payer` controls.
    2. *Listing Moderation Queue:* Displays all registered items with toggleable unblurred raw photo inspection (admin-only signed view), dispute flags, and deletion/ban actions.
    3. *Escrow Ledger Overview:* Summary cards for Total Locked (RWF), Total Released (RWF), Total Platform Micro-Fees (RWF), and full transaction audit table.
  - **Admin APIs:** Implemented `/api/admin/overview`, `/api/admin/escrow-override`, and `/api/admin/items`.
  - **Refactored Match Engine:** Isolated matching logic in `/lib/match-engine.ts` for clean Next.js App Router route separation.
  - **Verified End-to-End & Built:** Validated complete flow (Verify -> Lock Escrow -> 6-Digit Check-in -> Release Payout -> Admin Refund) with 100% success. Production build (`next build --webpack`) verified with zero TypeScript or packaging errors.

* **2026-11-13 (Phase 6 Completed & Deployed):**
  - **Zero-Trust & PII Leak Audit:** Centralized validation in `/lib/validations.ts` using strict Zod schemas (`ItemCreateSchema`, `VerifyClaimSchema`, `EscrowLockSchema`, `EscrowReleaseSchema`, `AdminEscrowOverrideSchema`, `AdminItemPatchSchema`). Sanitized all API responses to ensure `privateRawUrl`, `secretAnswer`, `qrToken`, and phone numbers are completely shielded from unauthenticated/public access.
  - **Production Firebase Security Rules (`firestore.rules` & `storage.rules`):**
    - `firestore.rules`: Authored with query-aligned public reads on `ACTIVE` items, RBAC protection, immutable ID/timestamp checks, and complete client write denial on `handoverSessions`, `escrowTransactions`, and `smsNotifications`.
    - `storage.rules`: Allow public read on `/items-public-blurred/**`, block direct client read/write on `/items-private-raw/**` (serving raw originals strictly via short-lived signed URLs after verification), and route all writes through the serverless Sharp pipeline.
  - **Automated Lifecycle Cron Job (`/api/cron/lifecycle/route.ts` & `vercel.json`):**
    - Built protected cron endpoint secured by `CRON_SECRET` and `ADMIN_SECRET_KEY`.
    - Auto-archives items where `expiresAt <= now` by marking `status: "EXPIRED"`.
    - Auto-flags items where `status === "CLAIMED"` and `claimedAt >= 48 hours` as `DISPUTED` and sends cellular SMS alerts.
    - Configured Vercel Cron in `vercel.json` to execute every 6 hours (`0 */6 * * *`).
  - **PWA & Production Polish:**
    - Generated high-resolution 192x192 and 512x512 PNG icons alongside SVG icons.
    - Built branded `public/offline.html` fallback screen and updated service worker (`public/sw.js`) to handle offline navigation gracefully.
    - Added iOS Safari `apple-touch-icon` and standalone meta tags in `src/app/layout.tsx`.
    - Compiled with `npm run build` (`next build --webpack`) with 0 errors across all 14 routes.
  - **Git & GitHub Remote:**
    - Initialized git repository, committed all source code, rules, and configs.
    - Pushed to GitHub remote repository: `https://github.com/MANZISOLOMON/INSHUTI-APP-2` (branch `main`).
  - **Vercel Cloud Production Infrastructure:**
    - **Project ID:** `prj_gxunFtz3dC55wNJV0CrkREP1ar3T` (`lost-it-found-it`)
    - **Team ID:** `team_iNXt1PoXbKsNCU65tldaYY2E` (`iznam`)
    - **Node Version:** `20.x` LTS
    - **SSO Protection:** Disabled for public accessibility.
    - **Environment Variables Provisioned:** 10 variables (`NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_PROJECT_ID`, `MOMO_TARGET_ENV`, `ADMIN_SECRET_KEY`, `CRON_SECRET`) configured for `production`, `preview`, and `development`.
    - **Verified Production URLs:**
      - Primary: `https://lost-it-found-it-rwanda.vercel.app`
      - Staging/Beta: `https://lost-it-found-it-beta.vercel.app`

## Current Milestone Status
* **Phase 1: Completed** (Environment, Strict Light Theme, PWA Foundation, Main Shell, Navbar, Footer)
* **Phase 2: Completed** (Firebase Migration, Firestore Models, Auth Helpers, Storage Rules, Redaction & Blurring)
* **Phase 3: Completed** (Registries & Search Engine: FinderUploadForm, ClaimerBountyForm, ItemCatalog with District/Sector filters, Zero-Trust API routes)
* **Phase 4: Completed** (Auto-Matching Engine, SMS Fallback Gateway, Dual Verification Option C Modal & API, 48-hour Handover Timer Trigger)
* **Phase 5: Completed** (MoMo Escrow Locker, QR Handover Check-In & Camera Scanner, Admin Moderation & Dispute Dashboard)
* **Phase 6: Completed** (Pre-Launch Security Audit, Zod Validation, Hardened Security Rules, Lifecycle Cron Automation, PWA Offline Polish, Git & Vercel Provisioning)
