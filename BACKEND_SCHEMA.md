# Backend Schema Document (Firestore NoSQL Architecture)

## 1. Overview
Defines Cloud Firestore document structures, subcollections, relations, and indexed keyword fields for high-performance querying and zero-trust security.

## 2. Firestore Collections Overview

| Collection | Document ID | Purpose |
| :--- | :--- | :--- |
| `users` | `uid` (Firebase Auth) | Registered user profiles, phone numbers, and roles. |
| `items` | `itemId` (Auto-ID) | Lost and found listings with zero-trust masked fields and search keywords. |
| `verifications` | `itemId` | Challenge-question and visual photo comparison verification states. |
| `handoverSessions` | `itemId` | Active in-person handovers and dynamic QR code tokens. |
| `escrowTransactions`| `escrowId` (Auto-ID) | MoMo locked funds, delivery fees, bounties, and platform fee splits. |
| `smsNotifications`  | `notificationId` | Dispatched SMS notification records for offline fallbacks. |

---

## 3. Collection Schemas & Data Structures

### 3.1 `users` Collection
* **Document ID:** `uid` (Matches Firebase Auth UID)
* **Fields:**
  * `uid`: string (Unique User ID)
  * `phone`: string (E.164 formatted phone number, e.g. `+250788123456`)
  * `fullName`: string
  * `role`: `'USER'` | `'ADMIN'`
  * `createdAt`: Timestamp
  * `updatedAt`: Timestamp

### 3.2 `items` Collection
* **Document ID:** `itemId`
* **Fields:**
  * `id`: string
  * `type`: `'FOUND'` | `'LOST'`
  * `category`: `'NATIONAL_ID'` | `'DRIVING_LICENSE'` | `'PASSPORT'` | `'WALLET'` | `'KEYS'` | `'OTHER'`
  * `title`: string
  * `description`?: string
  * `publicBlurredUrl`?: string (Public Sharp Gaussian-blurred preview in Firebase Storage)
  * `privateRawUrl`?: string (Protected raw photo restricted to Admin or verified claimer)
  * `district`: string (e.g., 'Gasabo', 'Kicukiro', 'Nyarugenge')
  * `sector`: string (e.g., 'Kimironko', 'Remera')
  * `meetingPoint`?: string
  * `scheduledDate`?: Timestamp
  * `feeOrReward`: number (Delivery fee or owner bounty in RWF)
  * `maskedDocNumber`?: string (Masked identifier e.g. `119988****521`)
  * `searchKeywords`: string[] (Lowercased tokens of title, category, district, sector, and masked doc for fast `array-contains` Firestore queries)
  * `status`: `'ACTIVE'` | `'CLAIMED'` | `'EXPIRED'` | `'RESOLVED'`
  * `createdAt`: Timestamp
  * `expiresAt`: Timestamp (Defaults to 30 days from creation)
  * `claimedAt`?: Timestamp (Starts the 48-hour handover grace timer)
  * `finderId`?: string (UID of user who found the item)
  * `claimerId`?: string (UID of owner who claimed or posted bounty)

### 3.3 `verifications` Collection
* **Document ID:** `itemId` (1:1 with `items`)
* **Fields:**
  * `id`: string
  * `itemId`: string
  * `secretPrompt`?: string (Option A: Secret Challenge Question)
  * `secretAnswerHash`?: string (Salted/hashed expected answer)
  * `visualPassed`: boolean (Option B: Visual Photo comparison passed)
  * `isVerified`: boolean (True if EITHER Option A OR Option B passes)
  * `verifiedAt`?: Timestamp
  * `verifiedBy`?: string (Claimer UID)

### 3.4 `handoverSessions` Collection
* **Document ID:** `itemId` (1:1 with `items`)
* **Fields:**
  * `id`: string
  * `itemId`: string
  * `qrToken`: string (Cryptographically random, dynamic short-lived token)
  * `status`: `'PENDING'` | `'COMPLETED'` | `'DISPUTED'`
  * `scannedAt`?: Timestamp
  * `expiresAt`: Timestamp

### 3.5 `escrowTransactions` Collection
* **Document ID:** `escrowId`
* **Fields:**
  * `id`: string
  * `itemId`: string
  * `payerId`: string (Claimer UID)
  * `recipientId`?: string (Finder UID)
  * `amount`: number (Principal reward or delivery fee)
  * `platformFee`: number (Flat platform micro-fee e.g. 100 RWF for SMS & infra)
  * `totalLocked`: number (amount + platformFee)
  * `momoRef`: string (MTN MoMo / Airtel Money transaction reference)
  * `status`: `'LOCKED'` | `'RELEASED'` | `'REFUNDED'` | `'DISPUTED'`
  * `createdAt`: Timestamp
  * `releasedAt`?: Timestamp

### 3.6 `smsNotifications` Collection
* **Document ID:** `notificationId`
* **Fields:**
  * `id`: string
  * `userId`: string
  * `phoneNumber`: string
  * `message`: string
  * `type`: `'MATCH_ALERT'` | `'ESCROW_LOCKED'` | `'HANDOVER_REMINDER'` | `'DISPUTE_ALERT'`
  * `status`: `'QUEUED'` | `'SENT'` | `'FAILED'`
  * `sentAt`: Timestamp

