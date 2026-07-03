# Felix iQ — Felix Maritime ERP

Internal CRM/ERP for **Felix Maritime** (Port Said HQ + Ismailia office, est. 1983):
yacht/owner/company/person registries, vessel-call operations, Suez Canal transit
& port disbursement (PDA/FDA), crew change & visa handling, supply chain, and
finance — three agencies (FMA / GRA / CRA) under one system.

Full functional blueprint: [`docs/SYSTEM_SPEC.md`](docs/SYSTEM_SPEC.md).
The living code (`src/App.jsx` + `src/lib/` + `supabase/`) is the authoritative
reference; the spec is the faithful functional blueprint.

---

## Current status

| Layer | Status |
|-------|--------|
| Frontend app (`src/App.jsx`) | ✅ Working — 16 modules, Supabase-wired |
| Build/deploy setup (Vite) | ✅ Done — `npm run dev` / `npm run build` |
| Database schema (`supabase/schema.sql`) | ✅ Done (v1, 20 tables) |
| Access policies (`supabase/policies.sql`) | ✅ Done (RLS, staff-gated) |
| Frontend ⇄ database wiring (`src/lib/db.js`) | ✅ Done — yachts / persons / companies / operations persist & sync |
| Auth (real staff logins) | ✅ Done — `scripts/setup-supabase.mjs` bootstraps 6 accounts |
| Transit / Crew / Visa / Logistics persistence | ⏳ Planned (currently seed data in local state) |
| Hosting / domain (`erp.felix-eg.com`) | ⏳ Planned |

Without a `.env`, the app runs in **local-prototype mode** (seed data, no login,
nothing persists) — handy for trying it out.

---

## 1. Prerequisites (one-time)

Install **Node.js LTS** from <https://nodejs.org>, then confirm:

```powershell
node --version
npm --version
```

## 2. Run the app locally

```powershell
npm install      # first time only
npm run dev      # prints a http://localhost:5173 URL
```

Others on the same office network can use the `http://<your-ip>:5173` URL it
also prints.

## 3. Connect the backend

1. Create a free project at <https://supabase.com> — click-by-click guide in
   [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).
2. In the Supabase dashboard → **SQL Editor**, run in order:
   - `supabase/schema.sql`
   - `supabase/policies.sql`
3. Copy `.env.example` to `.env` and fill in your **Project URL**, **anon
   public key**, and (for the next step only) the **service_role key**.
4. Create the 6 staff logins:
   ```powershell
   node scripts/setup-supabase.mjs
   ```
   Temp password for everyone: `Felix-iQ-2026` (change after first login).
5. Restart `npm run dev` and sign in. On first load the app seeds the database
   with the built-in reference data; from then on all data is live and shared
   between every logged-in user.

## 4. Build for production

```powershell
npm run build    # outputs to dist/ — a self-contained static site
npm run preview  # serve the production build locally to check it
```

`dist/` is what gets deployed (Netlify / Vercel / a server — TBD).

---

## Project layout

```
FM-System/
├─ index.html                 # app entry (loads Mulish font)
├─ package.json               # dependencies & scripts
├─ vite.config.js             # build config
├─ .env.example               # template for backend keys (copy to .env)
├─ src/
│  ├─ main.jsx                # React bootstrap
│  ├─ App.jsx                 # the ERP app (single file, ~7,700 lines)
│  └─ lib/
│     ├─ supabase.js          # backend client
│     └─ db.js                # data layer (document model)
├─ supabase/
│  ├─ schema.sql              # database tables (run first)
│  ├─ policies.sql            # row-level security (run second)
│  └─ migrations/             # incremental schema changes
├─ scripts/
│  └─ setup-supabase.mjs      # one-time staff auth bootstrap
└─ docs/
   ├─ SYSTEM_SPEC.md          # full functional blueprint
   └─ SUPABASE_SETUP.md       # click-by-click backend setup guide
```

## Security notes

- **Never commit `.env`.** The `service_role` key must never appear in frontend
  code, chat, or version control.
- The anon key is public by design — Row-Level Security
  (`supabase/policies.sql`) is what protects the data: the database refuses any
  read/write that isn't from a signed-in, active Felix staff account.
- The data is sensitive (financial records + personal data such as passport
  copies). Access is gated by Supabase Auth + RLS.
