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

## Current Milestone Status
* **Phase 1: Completed** (Environment, Strict Light Theme, PWA Foundation, Main Shell, Navbar, Footer)
* **Phase 2: Completed** (Firebase Migration, Firestore Models, Auth Helpers, Storage Rules, Redaction & Blurring)
* **Phase 3: Completed** (Registries & Search Engine: FinderUploadForm, ClaimerBountyForm, ItemCatalog with District/Sector filters, Zero-Trust API routes)
* **Phase 4: Completed** (Auto-Matching Engine, SMS Fallback Gateway, Dual Verification Option C Modal & API, 48-hour Handover Timer Trigger)
* **Phase 5: Pending Execution** (Escrow Locker & QR Handover: MoMo API, QR Code Handover, Camera Scanner)
* **Phase 6: Pending Execution** (Security Audit & Deployment: RLS / Storage verification, Production build)
