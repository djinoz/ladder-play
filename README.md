# Compass: Meaning & Purpose Discovery Tool

Compass is an open-source, interactive self-coaching application. It provides a guided journal and AI-assisted exercises (like the "5 Whys" laddering technique) to help individuals locate meaning and articulate their Massive Transformational Purpose (MTP).

## Architecture & Security
Built on **React / Vite / Tailwind UI** and powered by **Firebase** (Auth, Firestore, Hosting, Cloud Functions).
- **Passwordless Auth:** Users sign in via Magic Email Links.
- **Strict Data Isolation:** Firestore Security Rules ensure that a user can only query, read, and write their own data.
- **Zero-Ops AI:** Firebase Cloud Functions act as secure proxies to the Anthropic API (Claude 3.5 Sonnet), keeping API keys strictly hidden from the frontend.

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
