# MTP (Massive Transformational Purpose) Discovery Tool

**Vision:** A low-friction, high-value web application that walks individuals through finding their purpose using established coaching frameworks (Peak Experiences, Meaning Audits, and Post-Scarcity Domains) to discover what they are meant to do in the world. It culminates in an AI-synthesized Massive Transformational Purpose (MTP) and a 90-day experiment.

**Core hook:** "Uncover your purpose. You have unique peak experiences and domains of mastery—let's map them to a Massive Transformational Purpose."

---

## 1. Vision and Design Principles

The goal is to convert the coaching toolkit document into a guided, conversational, self-directed experience that a person can move through alone — without a human coach present — and return to over time as their understanding evolves.

The experience should feel more like a thoughtful conversation than a form. It is not a quiz with a score at the end. It is closer to a structured journal that talks back.

**Design principles:**
- Low barrier to start: no account required to try the first module
- Progressive disclosure & immediate value: the depth of the tool reveals itself as the user engages. Users receive "breadcrumbs" of insight instantly during exercises to prevent abandonment, rather than waiting for a delayed pay-off at the end.
- Anti-spam & deep trust: explicit messaging that email registration is strictly for securely saving their state—no newsletters, no growth hacking, no selling data. Their personal data is fully isolated to them.
- Anonymised Analytics (Unauthenticated): the tool securely captures stripped session data into a global analytics pool to allow for post-hoc trend analysis. This occurs via local session IDs, meaning data is collected even if the user never creates an account, without compromising trust.
- State must persist: a user's answers and emerging MTP draft should be saveable and retrievable.
- Gamified Shareable Output Unlock: a user should be able to share their MTP draft or domain map as a PDF, but this is an *unlockable milestone*. They must complete enough foundational modules beforehand so the report has validity. It should clearly display their progress and a disclaimer that it is an interim draft.
- AI Context Optimization: Context mapping to AI backends must be structured (and potentially summarized over time) to prevent token window blowouts or "amnesic" responses while minimizing cost.

---

## 2. Tech Stack (aligned with your existing repos)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + TypeScript | Consistent with geodesic; Vite build |
| Styling | Tailwind CSS | Consistent with progress-framework |
| Hosting | Firebase Hosting | Same as existing projects |
| Voice (Optional) | Web Speech API (Free) or OpenAI/ElevenLabs (Premium) | End-user toggle for Voice-to-Text and Text-to-Voice |
| Auth | Firebase Auth — passwordless email link | Same pattern as geodesic |
| Database | Firestore | User sessions, answers, MTP drafts |
| AI backend | Firebase Cloud Functions → Anthropic API (Claude) | Only invoked for laddering/synthesis phases |
| Analytics | Firebase Analytics | Already in geodesic pattern |

No new infrastructure paradigm needed. The AI layer is the only genuinely new component and it slots in as a Cloud Function — a thin wrapper over the Anthropic API.

---

## 3. User Journey and Module Structure

The app is structured as a series of **modules** that can be completed in sequence or returned to independently. Each module maps to a coaching technique from the reference document.

### Module 1: The Meaning Audit *(no AI required)*
- User rates 8 life domains on two axes: current fulfilment (1–10) and personal importance (1–10)
- Domains: work/vocation, relationships, creative life, contemplative life, body/health, community contribution, nature, transcendent/unknown
- **Anti-abandonment features:** A dynamic progress bar. As users rate domains, mini "insights" or variable rewards appear (e.g., "Ah, high importance but low fulfillment—we'll want to look at that later").
- Output: a visual "gap map" showing where importance and fulfilment diverge most, revealed instantly without an email wall.
- This gap becomes the coaching priority and seeds the next modules
- Time: ~5 minutes

### Module 2: Laddering — Values from Experience *(AI-augmented)*
- User picks a recent activity or choice that felt good (free text, low barrier)
- The app (optionally AI-driven) iterates: "Why did that matter to you?" × 5–8 times
- AI version: Claude conducts the ladder dynamically, reflecting back and probing
- Non-AI version: a structured set of branching prompts based on common value clusters
- Output: 3–5 candidate core values surfaced and labelled
- Time: ~10–15 minutes

### Module 3: Peak Experience Archaeology *(no AI required)*
- User is prompted to recall 3 peak experiences (guided prompts: most alive, most useful, most yourself)
- For each: brief description, who was present, what they were contributing, what was at stake
- App identifies repeating patterns across all three (simple keyword/theme clustering, or AI-assisted)
- Output: a "pattern summary" of recurring themes
- Time: ~15 minutes

### Module 4: Domain Exploration *(no AI required, but AI can enrich)*
- Visual interactive grid of the 10 post-scarcity domains (Creative Expression, Wisdom Transmission, Ecological Stewardship, etc.)
- User rates each: "How alive does this make me feel?" and "How neglected is this in my life?"
- App highlights high-alive + high-neglected domains as candidate MTP territory
- Each domain links to its coaching prompt and a short description
- This module is the natural home for the progress-framework domain visualisation — the two projects could be linked or merged here
- Time: ~10 minutes

### Module 5: Contribution Calibration *(no AI required)*
- Guided reflection: "Who would suffer if you disappeared?"
- Prompts for: relationships, communities, projects, knowledge only you carry
- Output: a short "contribution inventory" that grounds the MTP in real stakes
- Time: ~5–10 minutes

### Module 6: MTP Drafting *(AI-augmented)*
- App synthesises outputs from modules 1–5 and presents a first-pass MTP draft
- User iterates: edits, rejects, or accepts elements
- Stress-test prompts: "Does this still matter if no one knows? Would you pursue it without seeing its completion?"
- Output: a saved MTP statement
- Time: ~15–20 minutes

### Module 7: 90-Day Experiment Design *(no AI required)*
- User designs one small concrete action that enacts their MTP at minimal scale
- Prompted to set a start date, a check-in date, and name one person who knows
- App can send a reminder email at the check-in date (Firebase trigger)
- Output: a saved experiment commitment
- Time: ~5 minutes

### Monthly Review *(lightweight, recurring)*
- Five questions (from the coaching doc)
- Tracks across months to show evolution
- Can be emailed as a prompt or done in-app

---

## 4. Access Model

| Tier | What's included | Auth required |
|---|---|---|
| Free (anonymous) | Module 1 (Meaning Audit) + Module 4 (Domain Exploration) | No |
| Free (registered) | All modules, save progress, shareable MTP output | Yes (email link) |
| Paid | AI-augmented laddering (Module 2) + AI MTP synthesis (Module 6) + monthly review reminders + Premium Voice Mode | Yes + payment |

This mirrors the pattern in progress-framework: free to use, login to save, optional premium features. The free tier is genuinely useful and gives the user a reason to register. The paid tier is where AI costs are covered.

---

## 5. Resource and Cost Model — 100 Users/Day

### Assumptions
- 100 unique users/day (non-concurrent, spread across the day)
- Average session: 2 modules completed per visit
- ~30% of users are registered (save state)
- ~15% of users are paid (AI features)
- 15 paid users/day using AI modules = ~15 laddering sessions + ~10 MTP synthesis sessions

### Firebase Costs

**Firestore (database reads/writes)**
- Per user session: ~20–50 reads, ~10–20 writes
- 100 users × 50 reads = 5,000 reads/day
- 100 users × 20 writes = 2,000 writes/day
- Free tier: 50,000 reads/day, 20,000 writes/day — **well within free tier**
- Even at 10× growth (1,000 users/day), cost would be ~$0.50–$1.00/day

**Firebase Hosting**
- Static assets served via CDN
- 100 users × ~500KB page load = 50MB/day
- Free tier: 10GB/month — **comfortably free**

**Firebase Auth**
- Free for email link auth regardless of volume

**Cloud Functions (AI proxy)**
- ~25 AI invocations/day (15 laddering + 10 synthesis)
- Each function run: ~2–5 seconds
- Free tier: 2 million invocations/month — **free**
- Compute cost: negligible at this scale

**Firebase total at 100 users/day: effectively $0**

### Anthropic API Costs (the real cost driver)

**Laddering module (Module 2):**
- ~8 back-and-forth exchanges per session
- ~300 tokens input + 150 tokens output per exchange
- Total per session: ~3,600 input tokens + 1,200 output tokens
- At Claude Sonnet pricing (~$3/M input, $15/M output):
- Per session: ~$0.011 + $0.018 = **~$0.03/session**
- 15 sessions/day = **~$0.45/day**

**MTP Synthesis module (Module 6):**
- One larger synthesis call: ~2,000 tokens input (all prior module outputs) + ~500 tokens output
- Per session: ~$0.006 + $0.0075 = **~$0.014/session**
- 10 sessions/day = **~$0.14/day**

**Total AI cost at 100 users/day: ~$0.60/day = ~$18/month**

### Voice Mode Costs (Optional Premium)
If using browser-native Web Speech API for voice features, the cost is **$0**. However, if you want a premium conversational feel (e.g., OpenAI Whisper for transcription and OpenAI TTS / ElevenLabs for natural speech generation):
- **Speech-to-Text (Whisper):** ~$0.006 / minute. A 15-minute laddering session is ~$0.09.
- **Text-to-Speech (OpenAI TTS):** ~$0.015 per 1,000 characters. ~10 AI responses per session = ~$0.03.
- **Estimated Premium Voice Cost:** ~$0.12 per AI session.
- At 15 sessions/day: **~$1.80/day = ~$54/month** (incurred only by users enabling the premium voice toggle).

### Infrastructure Summary at 100 Users/Day

| Item | Monthly Cost |
|---|---|
| Firebase (hosting, auth, firestore, functions) | $0 (free tier) |
| Anthropic API | ~$18 |
| Domain (prismism subdomain, existing) | $0 |
| **Total infrastructure** | **~$18/month** |

---

## 6. Human Cost and Operational Requirements

At 100 users/day, this is essentially **zero-ops** if the AI layer is well-prompted and the app is well-tested. However, there are real human costs to account for:

### Build Phase
- Initial development: ~40–80 hours depending on AI module complexity
- Primarily your time or outsourced dev
- The geodesic and progress-framework repos give you a reusable Firebase/auth/Firestore skeleton — probably saves 20+ hours

### Ongoing Operational Load (per month, steady state)
- Responding to user emails about the tool: ~1–2 hours (at 100 users/day, expect occasional questions)
- Monitoring AI quality (spot-checking laddering conversations): ~1–2 hours
- Content updates to domain descriptions or coaching prompts: as desired
- **Estimated: 3–5 hours/month**

### If a Human Coach Is in the Loop
The spec as written assumes a fully self-service product. If you want to offer an optional "reviewed by a coach" tier — where a human reviews a user's MTP draft and offers brief feedback — that changes the model significantly. Even at 5% of paid users requesting this, at 100 users/day that's ~5 coach reviews/day. At even a minimal 15 minutes per review, that's 1.25 hours/day of coach time. Not viable without either a coaching team or a premium price point ($50+/session).

**Recommendation:** keep the MVP fully self-service. Offer a "share with your coach" feature that generates a clean PDF/link of the user's outputs — this lets human coaches use the tool with their own clients without you bearing the labour cost.

---

## 7. Payment Viability Analysis

### Revenue needed to break even
- Infrastructure: ~$18/month
- Your time (5 hrs/month at notional $100/hr): ~$500/month
- Target: cover costs + time = ~$520/month

### At what price point and conversion rate?

| Price | Paid users needed/month | Conversion rate needed (of 3,000 users/month) |
|---|---|---|
| $5/month | 104 | 3.5% |
| $10/month | 52 | 1.7% |
| $20/month | 26 | 0.9% |
| One-time $15 | 35 | 1.2% |

A $10/month or $15 one-time payment at ~2% conversion of registered users is a plausible target. SaaS conversion benchmarks for free-to-paid in self-improvement apps typically run 2–5%.

### The real question is acquisition, not conversion
At 100 users/day (3,000/month), even 2% conversion yields $600/month — viable. But 100 users/day is not trivial to achieve without active distribution. Your Substack readership is the natural seeding channel given the thematic overlap with existing posts like "Not Becoming The Eloi" and "Beyond Maslow's Needs."

### Pinch points to watch
1. **AI cost scaling** — if a viral moment drives 10× usage, AI costs jump to ~$180/month. Still manageable, but the free tier would need a session cap or the AI modules need to be paid-only from the start.
2. **Prompt quality** — the laddering and synthesis prompts need careful engineering. A bad laddering conversation (where Claude goes too generic or too clinical) breaks the core value proposition. Budget time for prompt iteration.
3. **Retention** — the monthly review module is the retention mechanism. Without it, users complete the tool once and leave. Email reminders (Firebase triggers) are cheap and important.

---

## 8. Secure Operations & Open Source Distribution

To ensure the repository can be safely made public and cloned by others to run their own private instances, the architecture must strictly isolate configuration, keys, and user data.

### Secure `.gitignore` Strategy
The repository will contain a robust `.gitignore` ensuring no sensitive data is ever committed. Clones will use their own Firebase contexts.
- `.env`, `.env.*.local`, `.env.production` (Environment variables for the frontend, e.g., Firebase config — though Firebase config isn't highly sensitive, API keys for premium voice services should definitely be excluded).
- `functions/.env` and `functions/.runtimeconfig.json` (Where Anthropic/OpenAI API keys live for the backend).
- `firebase-export*` and `firestore-debug.log` (Local emulator data).
- `node_modules` and `dist`/`build` folders.

### Firestore Security Rules
User data will be tightly locked down via Firebase Security Rules. Since the app relies on Firebase Auth, the rules will ensure users can only ever read or write their own documents:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // User can only read/write their own overarching profile
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /sessions/{sessionId} {
        // User can only access their own session data (MTP drafts, module progress)
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    // Prevent global querying traversing across users
    match /{document=**} {
      allow read, write: if false; 
    }
  }
}
```

### Setup Instructions for Cloners (README template)
A `README.md` will be provided with explicit steps for setting up a personal instance:
1. **Firebase Setup:** Create a new Firebase project, enable Firestore (Native mode) and Authentication (Email Link).
2. **Environment Variables:**
   - Copy `.env.example` to `.env.local` and add the new Firebase Project config for the Vite frontend.
   - Run `firebase use --add` to connect the local repo to the new Firebase project.
3. **Cloud Functions Setup:** 
   - Navigate to `/functions`. Set the Anthropic/OpenAI API keys using Firebase environment variables: `firebase functions:secrets:set ANTHROPIC_API_KEY`.
4. **Deploy:** Run `npm run deploy` to push standard Firestore rules, indices, functions, and hosting to the new project.

*This structure ensures that you can share the codebase fully open-source as a "clonable coaching tool" without risking your own Anthropic billing quotas or the privacy of your users' deeply personal MTP data.*

---

## 9. Open Questions for Next Session

- Do you want to build the AI modules from the start, or launch without them and add later?
- One-time payment vs. subscription vs. credits model?
- Should this live under prismism.com or have its own domain/brand?
- Is there a role for the progress-framework domain visualisation inside this tool (Module 4 domain exploration is a natural fit)?
- Any interest in a "coach dashboard" view — where a human coach can see aggregated (anonymised) domain gaps across their client base?
