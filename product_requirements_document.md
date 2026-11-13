# Product Requirements Document (PRD)

## 1. Overview
This document outlines what the **Lost & Found Registry** web application does feature by feature. It defines expected functionality, user roles, security boundaries, and operational behavior across every page and journey.

## 2. Product Goal
Bridge the local lost document and personal property gap by providing a centralized digital registry connecting finders (Good Samaritans, moto drivers, venue staff) with claimers through location-based indexing, automated cross-matching, privacy masking, SMS fallback alerts, QR-verified handovers, zero-trust image redacting, PWA mobile integration, and secure Mobile Money micro-escrow.

## 3. User Roles
* **Finder:** Citizens, moto drivers, or venue staff who find an item, upload a photo/description, set location, and specify delivery fees or handover points.
* **Claimer / Owner:** Citizens who lost property/documents, search the registry, post bounties, verify ownership, and lock rewards/fees in escrow.
* **Admin / Moderator:** System managers who review reported listings, oversee flagged dispute cases, override escrow payouts, and manage system metrics.

## 4. Features Matrix

| Feature | Description | Expected Behavior |
| :--- | :--- | :--- |
| **Finder Upload** | Upload photo, title, location (District/Sector), meeting point, date/time, delivery fee | Masks sensitive ID numbers automatically; applies serverless auto-blur to uploaded image; creates listing in found queue. |
| **Claimer Bounty** | Post lost item details, last known location, offered reward money | Creates lost item ticket; triggers auto-matching engine against active found items. |
| **Search & Filters** | Search by category (ID, License, Wallet, Keys), sector/district, or document name | Displays masked cards; hides finder contact details and unredacted photos until verification passes. |
| **Dual Verification (Option C)** | Challenge-question or visual photo comparison | Requires claimer to pass **at least 1** verification path before handover request and raw image unlock. |
| **MoMo Escrow & Fees** | Escrow locker with min/max caps & platform micro-fee | Locks delivery fee or bounty via MTN MoMo / Airtel Money API (with flat micro-fee split to cover SMS/infra); released automatically upon QR code scan. |
| **QR Code Handover** | In-person verification & instant payout trigger | Finder app displays dynamic QR code; claimer scans at meeting point to verify physical check-in and instantly trigger MoMo escrow payout. |
| **SMS Fallback Alerts** | Cellular notifications for key events | Triggers instant SMS for auto-matches, escrow fund locks, meeting confirmations, and pending payouts to keep offline/unconnected users informed. |
| **Item Lifecycle** | Automated 30-day archiving & 48-hour handover timers | Listings auto-archive after 30 days unless renewed; claimed items trigger a 48-hour handover timer before raising an auto-dispute flag. |
| **PWA Installation** | Web app installability via browser prompt | Supports "Add to Home Screen" on mobile devices with native camera integration for photo uploads and QR scanning. |
| **Admin Dashboard** | Dispute resolution, content moderation, escrow overrides | Moderates reported posts, reviews chat history, overrides/releases escrow funds. |