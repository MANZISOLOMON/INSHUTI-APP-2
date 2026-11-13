# Technical Requirements Document (TRD)

## 1. Overview
This document lists the technical stack, tools, mobile PWA capabilities, and zero-trust security infrastructure powering the Lost & Found Registry.

## 2. Technical Goals
Achieve fast page loads (<1.5s on mobile networks), secure serverless image blurring/redaction, PWA camera integration, real-time message sync, and reliable Mobile Money micro-escrow transaction handlers.

## 3. Technology Stack

| Area | Tool / Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router, React 19) | Server-rendered pages, fast routing, PWA manifest setup. |
| **Mobile & PWA** | Web Service Workers & Web App Manifest | "Add to Home Screen" support, native camera access for QR scanning. |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Strict Light minimalist design (White `#FFFFFF`, Soft Grey `#F8FAF7`, Forest Green `#1B4D3E`). |
| **Backend & Cloud Services** | Firebase (Admin SDK + Client SDK) | Serverless API routes, admin verification, token verification. |
| **Database** | Google Cloud Firestore (NoSQL) | Real-time indexed document collections (`users`, `items`, `verifications`, `handoverSessions`, `escrowTransactions`, `smsNotifications`). |
| **Authentication** | Firebase Authentication | Phone number SMS OTP authentication and user session management. |
| **File Storage** | Firebase Cloud Storage | Zero-trust image buckets with dual-tier security: public blurred previews and protected raw uploads. |
| **Image Processing** | Sharp (Server-side) | Zero-Trust auto-blur Gaussian filter applied to public preview photos before storage. |
| **SMS & Alerts** | Africa's Talking / Local Gateway API | Instant SMS fallback notifications for matching and escrow alerts. |
| **Payments / Escrow** | MTN MoMo & Airtel Money API | Escrow locker holding and releasing rewards/delivery fees with micro-fee splits. |
| **Hosting** | Vercel / Firebase Hosting | Global edge hosting with automated deployment pipelines. |

## 4. Environment Variables Blueprint
* `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase web API key
* `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
* `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project identifier
* `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase Cloud Storage bucket
* `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
* `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase Web App ID
* `FIREBASE_PROJECT_ID`: Admin SDK project ID
* `FIREBASE_CLIENT_EMAIL`: Service account email
* `FIREBASE_PRIVATE_KEY`: Service account private key
* `MOMO_API_KEY`, `MOMO_SUBSCRIPTION_KEY`, `MOMO_TARGET_ENV`: Mobile money credentials
* `SMS_API_KEY`, `SMS_USERNAME`: Cellular gateway connection details
