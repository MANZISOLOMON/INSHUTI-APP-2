# Phases Document (PROJECT_PHASES)

One piece at a time. Never the whole thing at once.

## Phase Execution Breakdown

### Phase 1: Environment & UI Foundations
* Setup Next.js workspace in Anti-Gravity IDE.
* Configure light theme color variables in `tailwind.config.js`.
* Set up PWA `manifest.json` and basic service worker.
* Build header, navigation bar, and foundational card components.

### Phase 2: Database, Auth & Zero-Trust Storage
* Connect Supabase PostgreSQL instance via Prisma ORM.
* Implement phone authentication flow.
* Configure public/private storage buckets in Supabase with auto-blur image trigger.

### Phase 3: Registries & Search Engine
* Build `FinderUploadForm` with auto-masking input fields and auto-blur upload.
* Build `ClaimerBountyForm`.
* Build `ItemCatalog` grid with district/sector dropdowns and category filters.

### Phase 4: Verification & SMS Alerts
* Build `VerificationModal` implementing Dual Verification (Option C).
* Build `/api/match/route.ts` cross-matching algorithm.
* Integrate SMS fallback service for instant match and claim notifications.

### Phase 5: Escrow Locker & QR Handover
* Implement MTN MoMo / Airtel Money escrow webhook endpoints with platform micro-fee split.
* Build dynamic QR code generator for finders.
* Build PWA camera scanner for claimer in-person check-in.
* Build Admin dispute dashboard (`/admin/disputes`).

### Phase 6: Security Audit & Deployment
* Run data leak audit on all REST/Server Action responses.
* Enforce Supabase Row Level Security (RLS) policies.
* Deploy production build on Vercel and verify SSL, domain routing, and environment variables.