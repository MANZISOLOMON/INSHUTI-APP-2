# Rules Document (PROJECT_RULES)

What to use. What to avoid. No exceptions.

## What to Use
* **Styling Rules:** Strict Light Mode only using Tailwind CSS (`bg-[#F8FAF7]`, `bg-white`, accent `#1B4D3E`).
* **Firebase Architecture:** Use Cloud Firestore for data persistence, Firebase Authentication for phone OTP login, and Firebase Cloud Storage for images.
* **Safety & Privacy:** Always mask document numbers on front-end/back-end (`119988****521`) and apply server-side Sharp Gaussian auto-blur to public photo storage buckets.
* **Component Modularity:** Build clean, atomic UI components for cards, inputs, modals, and PWA camera/QR scanners.
* **IDE Prompting Protocol:** Prompt Anti-Gravity IDE module-by-module. Always reference `RULES.md` and `DESIGN_BRIEF.md` before generating new components.

## What to Avoid (Negative Constraints)
* **NO Dark-Mode Colors:** Never use dark slate canvas, dark backgrounds, or glowing neon accents.
* **NO Direct Raw Image Exposure:** Never serve raw, unblurred photos (`/items-private-raw/`) or unmasked ID numbers to unauthenticated users or public endpoints.
* **NO Uncapped Escrows:** Never process MoMo transactions without validating min/max bounds and platform micro-fee splits.
* **NO Bulk Prompts:** Never instruct the AI agent to build the entire app or multiple complex phases in a single prompt.
