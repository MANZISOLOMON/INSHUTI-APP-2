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
  - **Verified End-to-End & Built:** Validated complete flow (Verify -> Lock Escrow -> 6-Digit Check-in -> Release Payout -> Admin Refund) with 100% success. Production build (`next build --webpack`) verified with zero TypeScript or packaging errors.
* **2026-11-14 (Phase 6 Completed & Deployed):**
  - **Zero-Trust & PII Leak Audit:** Centralized validation in `/lib/validations.ts` using strict Zod schemas. Sanitized all API responses to ensure `privateRawUrl`, `secretAnswer`, `qrToken`, and phone numbers are completely shielded from unauthenticated access.
  - **Production Firebase Security Rules (`firestore.rules` & `storage.rules`):** Authored query-aligned public reads on `ACTIVE` items, RBAC protection, and client write denial on escrow and session collections.
  - **Automated Lifecycle Cron Job (`/api/cron/lifecycle/route.ts` & `vercel.json`):** Built protected cron endpoint running daily on Vercel Hobby tier. Auto-archives items where `expiresAt <= now` and flags 48h overdue items as `DISPUTED`.
  - **PWA & Production Polish:** Offline fallback (`public/offline.html`), high-res icons (192px/512px), iOS touch icons, and clean build.
  - **Vercel Cloud Production Infrastructure (Active & Live):**
    - Project: `lost-it-found-it` (`prj_gxunFtz3dC55wNJV0CrkREP1ar3T`)
    - Team: `iznam` (`team_iNXt1PoXbKsNCU65tldaYY2E`)
    - Primary Domain: `https://lost-it-found-it-rwanda.vercel.app`
    - Staging Domain: `https://lost-it-found-it-beta.vercel.app`
* **2026-11-15 (Serverless Storage Resilience & API Fix):**
  - **Root Cause Fix for 'Failed to fetch items':** Resolved Vercel AWS Lambda read-only filesystem crash (`ENOENT: mkdir '/var/task/.data'`) by routing all local persistence in `items-store.ts`, `escrow-store.ts`, `sms.ts`, and `match-engine.ts` to `os.tmpdir()` (`/tmp`) on serverless runtime and removing directory creation calls on read operations.
  - **ADC Unhandled Rejection Fix:** Attached `.catch(() => {})` in `timeout-helper.ts` to prevent late Google Cloud ADC promise rejections from causing Node 26 process crashes (exit code 128).
  - **Credential Guard:** Added `isFirebaseAdminConfigured()` checks before invoking `adminDb` calls. Embedded default fallback seed items so cold-start serverless instances return data immediately with zero downtime.
* **2026-11-15 (Frontend UX Refinements):**
  - **PWA Installation Banner:** Replaced floating bottom-right box with an elegant, dismissible top banner (`ServiceWorkerRegister.tsx`) and added an interactive PWA install trigger to `Footer.tsx`.
  - **Consumer-Facing Homepage:** Replaced developer-facing architecture block with an intuitive 'How It Works in 3 Steps' section (Upload Securely -> Verify Ownership -> Meet & Release via QR) with clean icons and benefit badges.
  - **Enhanced Search Bar:** Added dynamic Sector dropdown linked to the selected District (`rwanda-locations.ts`), fast 1-click Kigali district and sector shortcut pills (Gasabo, Kicukiro, Nyarugenge, Remera, Kimironko, Gisozi, Nyamirambo), and instant filter clear badges.
  - **Live Production Deployment:** Deployed commit `ea219b0` (`dpl_4cHtFRmBTYhA4QVf25uJRTPfuQmi`) to `https://lost-it-found-it-rwanda.vercel.app` and `https://lost-it-found-it-beta.vercel.app`. Verified `200 OK` on all routes and tested live filtered API queries.

## Current Milestone Status
* **Phase 1: Completed** (Environment, Strict Light Theme, PWA Foundation, Main Shell, Navbar, Footer)
* **Phase 2: Completed** (Firebase Migration, Firestore Models, Auth Helpers, Storage Rules, Redaction & Blurring)
* **Phase 3: Completed** (Registries & Search Engine: FinderUploadForm, ClaimerBountyForm, ItemCatalog with District/Sector filters, Zero-Trust API routes)
* **Phase 4: Completed** (Auto-Matching Engine, SMS Fallback Gateway, Dual Verification Option C Modal & API, 48-hour Handover Timer Trigger)
* **Phase 5: Completed** (MoMo Escrow Locker, QR Handover Check-In & Camera Scanner, Admin Moderation & Dispute Dashboard)
* **Phase 6: Completed** (Pre-Launch Security Audit, Zod Validation, Hardened Security Rules, Lifecycle Cron Automation, PWA Offline Polish, Git & Vercel Provisioning)
* **2026-11-15 (Compliance, Legal, & Accessibility Updates):**
  - **Legal & Policy Pages (`/privacy`, `/terms`, `/refund`, `/cookies`):**
    - Built comprehensive, accessible static policy pages conforming to Rwanda Personal Data Protection Law No. 058/2021.
    - Outlined zero-trust Gaussian auto-blurring (sigma 28), cryptographic SHA-256 challenge hashing, masked document identifiers (`119988****521`), 48-hour handover grace periods, and transparent 100 RWF micro-fee splits covering SMS carrier costs.
  - **Cookie Consent & Mandatory Form Consents:**
    - Built `CookieBanner.tsx` at the bottom of the viewport with an *"Accept Essential"* button, disclosing essential security and offline local storage keys.
    - Added mandatory legal checkbox to both `FinderUploadForm.tsx` and `ClaimerBountyForm.tsx`: *"I agree to the Terms of Service and verify that I am legally authorized to post this item."*
  - **Account Data Deletion & Privacy Rights (`/api/user/delete-account` & `/settings`):**
    - Built server-side purge endpoint unlinking citizen item listings and wiping SMS records under Law No. 058/2021.
    - Built dedicated `/settings` page featuring a confirmation modal and self-service "Delete Account & Purge Data" control.
  - **Accessibility & Business Details:**
    - Added keyboard `Escape` listeners and `role="dialog"` accessibility tags to all modals (`VerificationModal.tsx`, `HandoverQRModal.tsx`).
    - Added descriptive `alt` tags across all image containers.
    - Updated `Footer.tsx` with business operator details (Digital Elevation Solutions, Kanombe, Kigali, Rwanda • support@digitalelevation.rw • +250 788 000 000).
  - **Live Production Deployment:** Deployed commit `3e5aa70` (`dpl_BCVCKb5Cy4LCvzmW6ZgQuHt1xqVP`) and verified HTTP 200 OK across `/privacy`, `/terms`, `/refund`, `/cookies`, and `/settings`.

## Current Milestone Status
* **Phase 1: Completed** (Environment, Strict Light Theme, PWA Foundation, Main Shell, Navbar, Footer)
* **Phase 2: Completed** (Firebase Migration, Firestore Models, Auth Helpers, Storage Rules, Redaction & Blurring)
* **Phase 3: Completed** (Registries & Search Engine: FinderUploadForm, ClaimerBountyForm, ItemCatalog with District/Sector filters, Zero-Trust API routes)
* **Phase 4: Completed** (Auto-Matching Engine, SMS Fallback Gateway, Dual Verification Option C Modal & API, 48-hour Handover Timer Trigger)
* **Phase 5: Completed** (MoMo Escrow Locker, QR Handover Check-In & Camera Scanner, Admin Moderation & Dispute Dashboard)
* **Phase 6: Completed** (Pre-Launch Security Audit, Zod Validation, Hardened Security Rules, Lifecycle Cron Automation, PWA Offline Polish, Git & Vercel Provisioning)
* **Phase 7 (Compliance, Legal & Accessibility): Live & Verified** (Rwanda Law 058/2021 privacy pages, cookie banner, mandatory terms consent checkboxes, account data purge endpoint, accessibility modal escape traps, and operator business details in footer)
