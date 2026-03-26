# Compass: Meaning & Purpose Discovery Tool

Compass is an open-source, interactive self-coaching application. It guides individuals through a structured sequence of reflection exercises — grounded in established coaching frameworks — to help them locate meaning, surface core values, and articulate a personal **Massive Transformational Purpose (MTP)**. The experience is designed to feel like a thoughtful conversation rather than a form: a structured journal that talks back.

---

## What You Can Expect

Working through Compass gives you a progressively richer picture of what actually matters to you and why. By the end of the full journey, you will have:

- A visual **meaning gap map** showing where your sense of importance and current fulfilment diverge most — your coaching priority, surfaced in minutes.
- A set of **candidate core values** drawn from your own lived experience, not a pre-baked list.
- A **peak experience pattern summary** identifying the themes that recur when you feel most alive, most useful, and most yourself.
- A map of your **highest-energy domains** — the areas of life and contribution where neglect and aliveness collide, pointing toward where your purpose likely lives.
- A **contribution inventory** grounding your MTP in real stakes: who would lose something if you disappeared.
- A first-draft **MTP statement**, synthesised from everything above and stress-tested against questions like *"Does this still matter if no one knows?"*
- A **90-day experiment** — one concrete action that enacts your purpose at minimal scale, with a named start date and a check-in commitment.

You can work through modules in a single session or return over time as your understanding evolves. Progress is saved against your verified email — no password required.

---

## Modules

### Module 1 — The Meaning Audit *(no AI required)*
You rate eight life domains — Work/Vocation, Relationships, Creative Life, Contemplative Life, Body/Health, Community Contribution, Nature, and Transcendent/Unknown — on two axes: current fulfilment and personal importance. The app renders a live **gap map** showing where importance and fulfilment diverge most sharply. This gap becomes the coaching priority and seeds every subsequent module. Takes roughly 5 minutes; no account required.

### Module 2 — Laddering: Values from Experience *(AI-augmented)*
This module applies **Kelly Laddering**, a technique from Personal Construct Psychology developed by George Kelly, to surface the core values that actually drive you — not the values you think you should hold. You describe a recent activity or decision that felt right. From there, the AI conducts a structured upward ladder: repeating a sequence of probing questions — *"Why does that matter to you?"*, *"What would it mean if you didn't have that?"* — using your exact words rather than paraphrasing, until the conversation reaches constructs that are clearly existential or deeply personal. The AI follows the therapist positions defined for Kelly Laddering: genuinely curious rather than leading, reflective rather than interpretive, unhurried enough to let core constructs surface. The result is 3–5 candidate core values, labelled in your own language. Takes 10–15 minutes.

### Module 3 — Peak Experience Archaeology *(no AI required)*
You recall three peak experiences using guided prompts — the moment you felt most alive, most useful, and most fully yourself. For each, you capture a brief description, who was present, what you were contributing, and what was at stake. The app identifies repeating themes across all three to produce a **pattern summary** of the conditions under which you operate at your best. Takes roughly 15 minutes.

### Module 4 — Domain Exploration *(no AI required)*
An interactive visual grid of post-scarcity domains — Creative Expression, Wisdom Transmission, Ecological Stewardship, and others — rated on two axes: *"How alive does this make me feel?"* and *"How neglected is this in my life?"* Domains that score high on both axes are surfaced as candidate MTP territory. Takes roughly 10 minutes.

### Module 5 — Contribution Calibration *(no AI required)*
A guided reflection on who would lose something if you disappeared — relationships, communities, projects, and knowledge only you carry. The output is a short **contribution inventory** that grounds your MTP in real-world stakes rather than abstract aspiration. Takes 5–10 minutes.

### Module 6 — MTP Drafting *(AI-augmented)*
The AI synthesises the outputs from all previous modules — your gap map, your laddered values, your peak experience patterns, your domain scores, and your contribution inventory — and produces a first-pass MTP statement. You iterate: editing, rejecting, or accepting elements. The draft is stress-tested with prompts like *"Would you pursue this without seeing its completion?"* and *"Does this still matter if no one knows?"* The result is a saved MTP statement you can return to and refine. Takes 15–20 minutes.

### Module 7 — 90-Day Experiment Design *(no AI required)*
You design one small, concrete action that enacts your MTP at minimal scale. You set a start date, a check-in date, and name one person who knows — the minimum accountability structure shown to increase follow-through. Takes roughly 5 minutes.

---

## The Role of Kelly Laddering and AI

The laddering module is the intellectual engine of Compass. **Kelly Laddering** is a structured interview technique that works by asking *why* a construct matters rather than accepting the first answer. Each response becomes the premise of the next question, climbing from surface preferences toward the deeper values that organise a person's experience. The technique was designed to map constructs in the client's own language — the practitioner never offers candidate answers, never paraphrases upward, and treats repetition or resistance as a signal rather than an obstacle.

In Compass, an AI practitioner (accessed securely via Firebase Cloud Functions) plays the role of the laddering interviewer. The system prompt encoding its behaviour is drawn directly from Kelly Laddering therapist positions: credulous listening, one question at a time, genuine pauses, and a tentative rather than conclusive framing of whatever core construct surfaces. The same AI is used in Module 6 to synthesise the full picture into an MTP draft — holding all prior module outputs in context and reflecting them back as a coherent purpose statement.

The AI layer is invoked only for these two modules. All other modules are static, client-side experiences with no AI calls and no ongoing cost.

---

## Architecture & Security
Built on **React / Vite / Tailwind UI** and powered by **Firebase** (Auth, Firestore, Hosting, Cloud Functions).
- **Passwordless Auth:** Users sign in via Magic Email Links.
- **Strict Data Isolation:** Firestore Security Rules ensure that a user can only query, read, and write their own data.
- **Zero-Ops AI:** Firebase Cloud Functions act as secure proxies to the AI backend, keeping API keys strictly hidden from the frontend.

## How to Set Up Your Own Instance (Cloning)

If you are cloning this repository to run your own private Compass coaching tool, follow these steps to securely set up your Firebase environment without exposing API keys.

### 1. Firebase Setup
1. Create a new project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** (Start in production mode, native mode).
3. Enable **Authentication** and activate the *Email Link (Passwordless)* provider.
4. Upgrade your Firebase project to the **Blaze (Pay-as-you-go) Plan** to enable Cloud Functions.

### 2. Frontend Configuration
1. Clone this repository.
2. In the project root, copy the provided environment template:
   ```bash
   cp .env.example .env.local
   ```
3. Look up your Firebase Project settings (Project Overview -> Settings -> General -> "Your apps").
4. Fill in the variables in `.env.local` using your Firebase config keys.
5. Install dependencies:
   ```bash
   npm install
   ```

### 3. Backend & AI Configuration
Compass uses Anthropic's Claude for the "Laddering" and "MTP Synthesis" modules. You need to provide the API key securely to the Cloud Functions.

1. Navigate to the functions folder:
   ```bash
   cd functions
   npm install
   ```
2. Log in to Firebase CLI:
   ```bash
   firebase login
   firebase use --add
   ```
   *(Select your new Firebase project and alias it as `default`)*
3. Set the Anthropic API key as a secret in Firebase Cloud:
   ```bash
   firebase functions:secrets:set ANTHROPIC_API_KEY
   ```
   *(Paste your Anthropic API key when prompted).*

### 4. Deployment
Deploy your security rules, database indexes, cloud functions, and web app:

```bash
# From the project root
npm run build
firebase deploy
```

Once deployed, your Compass instance will be live on your Firebase Hosting URL! Your API tokens are secure, and user data is locked exclusively to their verified email sessions.
# ladder-play
