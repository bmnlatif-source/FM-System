# Supabase setup — click-by-click

Goal: create the free cloud database that will hold Felix ERP's shared data, then
send back two values so I can connect the app.

> The Supabase website wording changes occasionally. Where a label might differ,
> I note what to look for.

---

## Step 1 — Create your free account
1. Go to **https://supabase.com**
2. Click **Start your project** (top right).
3. Sign up with **GitHub** or an **email address**. It's free and needs no card.

## Step 2 — Create a new project
On the dashboard, click **New project**, then fill in:
- **Name:** `felix-erp`
- **Database password:** click **Generate a password**, then **save it in a
  password manager**. (You rarely need it again, but don't lose it.)
- **Region:** choose **Central EU (Frankfurt)** — the closest region to Egypt for
  good speed. (West EU / Ireland is also fine.)
- **Plan:** Free.
Click **Create new project**.

## Step 3 — Wait ~2 minutes
The project provisions a database. The page shows "Setting up project…". Grab a
coffee; it finishes on its own.

## Step 4 — Copy the two keys I need
1. In the left sidebar, click the **gear / Project Settings**.
2. Click **API**.
3. Copy these two values:
   - **Project URL** — looks like `https://abcdxyz.supabase.co`
   - **anon public key** — a long string starting `eyJ…`
     *(Newer projects label this **"Publishable key"** and it may start `sb_publishable_…`. Either is the correct one for the app.)*
4. **Do NOT send** the **`service_role`** (a.k.a. **secret**) key. That one is
   admin-level — it stays private and must never go in the app or in chat.

## Step 5 — Send me the two values
Paste them into the chat:

```
Project URL: https://________.supabase.co
anon public key: ________
```

I'll then:
1. Load the database (run `schema.sql` + `policies.sql`, plus a `seed.sql` I'll
   write that imports your existing yachts/owners/companies/persons).
2. Build the real login screen and create your 6 staff accounts.
3. Start connecting screens to live, shared data — registry first.

---

### Why it's safe to share those two keys
The Project URL and anon key are **public by design** — they ship inside every
web app's frontend. What protects your data is the **Row-Level Security**
policies (`supabase/policies.sql`): the database refuses any read/write that
isn't from a signed-in Felix staff account. The `service_role` key bypasses all
that, which is exactly why it must stay secret.
