# Felix Maritime — ERP

Internal ERP for Felix Maritime: yacht/owner/company registry, vessel-call
operations, Suez Canal transit & port disbursement (PDA/FDA), crew & visa
handling, and finance.

This repository turns the original single-file prototype into a deployable web
app with a real backend (PostgreSQL via **Supabase**) so the whole company can
use it at the same time, with real logins and shared, durable data.

---

## Current status

| Layer | Status |
|-------|--------|
| Frontend app (`src/App.jsx`) | ✅ Working — currently runs on in-memory seed data |
| Build/deploy setup (Vite) | ✅ Done — `npm run dev` / `npm run build` |
| Database schema (`supabase/schema.sql`) | ✅ Designed (v1) |
| Access policies (`supabase/policies.sql`) | ✅ Designed (v1) |
| Frontend ⇄ database wiring | ⏳ Phase 3 (next) |
| Auth (real staff logins) | ⏳ Phase 2 |
| Hosting / domain | ⏳ Phase 5 |

See `docs/ARCHITECTURE.md` for the full plan.

---

## 1. Prerequisites (one-time)

**Node.js is required and is not yet installed on this machine.**

1. Download the LTS installer from <https://nodejs.org> (the "LTS" button) and
   run it. Accept the defaults.
2. Close and reopen your terminal, then confirm:
   ```powershell
   node --version
   npm --version
   ```
   Both should print a version number.

## 2. Run the app locally

From this folder (`Felix ERP SyS`):

```powershell
npm install      # first time only — downloads dependencies
npm run dev      # starts the app, prints a http://localhost:5173 URL
```

Open the printed URL in your browser. Others on the same office network can open
the `http://<your-ip>:5173` URL it also prints.

> At this stage the app still uses its built-in seed data. Connecting it to the
> live database is Phase 3.

## 3. Connect the backend (when ready — Phase 2/3)

1. Create a free project at <https://supabase.com>.
2. In the Supabase dashboard → **SQL Editor**, run, in order:
   - `supabase/schema.sql`
   - `supabase/policies.sql`
   - `supabase/seed.sql` *(optional — loads the existing reference data)*
3. Copy `.env.example` to `.env` and fill in your project URL + anon key
   (dashboard → **Project Settings → API**).
4. Restart `npm run dev`.

## 4. Build for production

```powershell
npm run build    # outputs to dist/
npm run preview  # serve the production build locally to check it
```

`dist/` is what gets deployed (Vercel / Netlify / a server in Egypt — TBD, see
ARCHITECTURE.md).

---

## Project layout

```
Felix ERP SyS/
├─ index.html              # app entry
├─ package.json            # dependencies & scripts
├─ vite.config.js          # build config
├─ .env.example            # template for backend keys (copy to .env)
├─ src/
│  ├─ main.jsx             # React bootstrap
│  ├─ App.jsx              # the ERP app (large, single component for now)
│  └─ lib/supabase.js      # backend client (used from Phase 3)
├─ supabase/
│  ├─ schema.sql           # database tables
│  └─ policies.sql         # row-level security (access rules)
└─ docs/
   └─ ARCHITECTURE.md      # the plan, decisions, and roadmap
```

## Security notes

- Never commit `.env`. The `service_role` key must never appear in frontend code.
- The data here is sensitive (financial records + personal data such as passport
  copies). Access is gated by Supabase Auth + row-level security.
