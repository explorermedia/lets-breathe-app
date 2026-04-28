# Flowbreath Production Deployment Playbook
This document outlines the exact cloud infrastructure, database schemas, and integration steps required to transition the **Flowbreath MVP** from browser `localStorage` to a fully live, cloud-synced, commercial subscription app.

---

## Architecture Overview
The most cost-effective and scalable architecture for this React/Vite single-page application is a **Serverless / Jamstack** approach:
1. **Frontend Hosting:** Vercel or Netlify (Global CDN, automated git deployments).
2. **Backend & Database:** Supabase (PostgreSQL database, authentication, and auto-generated REST APIs).
3. **Payment Processor:** Stripe Checkout + Webhooks (Handles credit cards, security, and recurring billing).

---

## Step 1: Frontend Deployment
1. Push your local codebase to a repository on **GitHub**, **GitLab**, or **Bitbucket**.
2. Log into [Vercel](https://vercel.com) or [Netlify](https://netlify.com) using your Git account.
3. Click **"Add New Project"** and select the Flowbreath repository.
4. Configure the build settings:
   - **Framework Preset:** `Vite` (automatically detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **"Deploy"**. Your frontend is live globally on a secured SSL URL!
6. *Optional:* In the dashboard's Domain settings, add your custom domain (e.g., `flowbreath.com`) and point your Registrar's A/CNAME records to their IP.

---

## Step 2: Database Setup (Supabase)
1. Go to [Supabase.com](https://supabase.com) and create a free account.
2. Click **"New Project"** and name it `Flowbreath`. Choose a database region close to your target audience.
3. Once the database is provisioned, navigate to the **SQL Editor** on the left menu.
4. Click **"New Query"** and copy-paste the following SQL schema to create your relational tables:

```sql
-- 1. PROFILES TABLE (Ties auth users to subscription tier and visual preferences)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE NOT NULL,
    stripe_customer_id TEXT,
    selected_theme TEXT DEFAULT 'deep-ocean' NOT NULL,
    default_duration INTEGER DEFAULT 180 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. SESSIONS TABLE (Breathing session history logs)
CREATE TABLE public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    pattern_id TEXT NOT NULL,
    pattern_name TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    stress_before INTEGER,
    stress_after INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. CUSTOM PATTERNS TABLE (User-designed breathing ratios)
CREATE TABLE public.custom_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    name VARCHAR(25) NOT NULL,
    description TEXT,
    inhale INTEGER NOT NULL,
    hold_in INTEGER NOT NULL,
    exhale INTEGER NOT NULL,
    hold_out INTEGER NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS) so users can only access their own data
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_patterns ENABLE ROW LEVEL SECURITY;

-- 4. ROW LEVEL SECURITY POLICIES
-- Profiles: Users can view and update only their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Sessions: Users can CRUD only their own sessions
CREATE POLICY "Users can manage own sessions" ON public.sessions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Custom Patterns: Users can CRUD only their own custom patterns
CREATE POLICY "Users can manage own patterns" ON public.custom_patterns
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```
5. Click **Run**. Your cloud database is now fully built and locked down with enterprise-grade security (users cannot view each other's data).

---

## Step 3: Payment Gateway (Stripe)
To replace the simulated MVP checkout with real card processing:
1. Create a free account at [Stripe.com](https://stripe.com).
2. In your Stripe Dashboard, go to **Product Catalog** -> **Add Product**.
3. Create a Product named `Flowbreath Premium` and add two pricing intervals:
   - Recurring, Monthly: `$4.99`
   - Recurring, Yearly: `$29.99`
4. Copy the two generated **Price IDs** (e.g., `price_1Nk3...`).

### Connecting Stripe to Flowbreath (The Flow)
Since your React app cannot safely hold your Stripe Secret Key, the checkout flow operates like this:
1. **Trigger Checkout:** When the user clicks "Unlock Premium", your app makes an HTTP POST request to a serverless function (e.g. Supabase Edge Functions or Netlify Functions) containing the user's Supabase ID and the Price ID they selected.
2. **Create Session:** Your serverless function initializes a Stripe Checkout Session via the Stripe Node.js SDK and returns a checkout URL.
3. **Redirect:** Your frontend redirects the browser: `window.location.href = checkout_url`.
4. **Payment:** The user types their credit card directly into Stripe's ultra-secure, PCI-compliant checkout page.
5. **Success Return:** Once paid, Stripe redirects the user back to your app: `flowbreath.com?payment=success`.

### Webhook: Granting Access Automatically
To ensure the database flips `is_premium = true` securely, you use a Webhook serverless function:
1. In your Stripe dashboard, navigate to **Developers -> Webhooks** and add an endpoint pointing to your serverless function (e.g., `https://flowbreath.supabase.co/functions/v1/stripe-webhook`).
2. Listen for the event: `checkout.session.completed`.
3. When the user pays, Stripe fires a cryptographically signed network request to that URL.
4. Your function verifies the signature, extracts the user's ID (passed through the Checkout metadata), and runs a database query:
   ```typescript
   // Inside the serverless webhook function:
   const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
   await supabase
     .from('profiles')
     .update({ is_premium: true, stripe_customer_id: session.customer })
     .eq('id', session.metadata.user_id);
   ```

---

## Step 4: Connecting React to the Cloud
1. In your Supabase Dashboard, go to **Project Settings -> API**.
2. Copy the **Project URL** and the **anon public API key**.
3. In your Vercel/Netlify hosting dashboards, add these as environment variables:
   - `VITE_SUPABASE_URL=your_copied_url`
   - `VITE_SUPABASE_ANON_KEY=your_copied_anon_key`
4. In your project, the file `src/services/supabaseClient.ts` initializes the connection.
5. In `src/App.tsx`, create a standard Auth modal and swap out all `localStorage.getItem` and `localStorage.setItem` calls for asynchronous database calls, like this:

```typescript
// Fetching data from Supabase
const fetchSessionHistory = async () => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (data) setHistory(data);
};

// Saving data to Supabase
const handleSaveSession = async (sessionData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('sessions')
    .insert([{
      user_id: user.id,
      pattern_id: sessionData.patternId,
      pattern_name: sessionData.patternName,
      duration_seconds: sessionData.durationSeconds,
      stress_before: sessionData.stressBefore,
      stress_after: sessionData.stressAfter
    }]);

  if (!error) fetchSessionHistory(); // Refresh UI
};
```

## Step 5: Post-MVP Expansion
Once your database is connected, you unlock powerful features:
- **Email Marketing:** Sync user emails to Mailchimp or ConvertKit via Supabase webhooks to automatically send mindfulness tips or re-engage users who fall off their streaks.
- **Native Apps:** Wrap this exact web build using **CapacitorJS** or **Cordova** to generate an native iOS `.ipa` and Android `.apk` to submit directly to the Apple App Store and Google Play Store.
