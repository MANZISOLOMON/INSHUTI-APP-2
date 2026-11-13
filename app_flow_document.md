# App Flow Document

## 1. Overview
Maps user navigation flows from item reporting and discovery to verification, escrow lock, physical handover, and dispute escalation.

## 2. Key User Journeys
* **Finder Flow:** Upload photo -> Auto-blur & Mask -> Set location (District/Sector) -> Define delivery fee/meeting spot -> Receive claim request -> Confirm verification -> Meet claimer -> Display QR Code -> Receive escrow payout.
* **Claimer Flow:** Search registry -> Select potential match -> Pass Option A (Challenge Q&A) OR Option B (Visual Photo Check) -> Lock reward/fee in MoMo escrow -> Meet finder -> Scan QR Code -> Item recovered.
* **Admin Flow:** Flagged content/Dispute alert -> Inspect chat history & verification logs -> Override escrow (Release to finder OR Refund to claimer).

## 3. App Flow Diagram

```
                 +-----------------------+
                 |   Landing / Search    |
                 +-----------+-----------+
                             |
             +---------------+---------------+
             v                               v
    +-----------------+             +-----------------+
    | Finder: Upload  |             | Claimer: Search |
    |  Found Item     |             | & Lost Bounties |
    +--------+--------+             +--------+--------+
             |                               |
             +---------------+---------------+
                             v
                 +-----------------------+
                 | Dual Verification     |
                 | (Challenge / Visual)  |
                 +-----------+-----------+
                             v
                 +-----------------------+
                 | MoMo Escrow Lock      |
                 |  (+ SMS Alert Sent)   |
                 +-----------+-----------+
                             v
                 +-----------------------+
                 | Physical Handover &   |
                 |  QR Scanner Scan      |
                 +-----------+-----------+
                             v
                 +-----------------------+
                 | Escrow Instant Payout |
                 |  & Status: RESOLVED   |
                 +-----------------------+
```