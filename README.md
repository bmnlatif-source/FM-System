# Felix iQ ERP — Complete System Specification (Rebuild Blueprint)

> **Purpose.** This document specifies the Felix iQ ERP in enough detail to **reconstruct a functionally identical system** from scratch. Hand this file to Claude (or any senior engineer) and it should reproduce the architecture, data model, every module, all business rules, the design language, and the reference data.
>
> **How to use it.** Read §1–§2 for the shape of the system, §3–§6 for the foundations (design, data, persistence), §7 for each screen, §8 for the maths/rules, §9 for the exact seed/reference data to paste in, §10 for known gaps, §11 for the build order + acceptance tests.
>
> **Authoritative source.** The living code in `src/App.jsx` (+ `src/lib/`, `supabase/`) is the byte‑exact reference; this spec is the faithful functional blueprint. Where they ever disagree, the code wins — then update this doc. Keep them in the same Git repo.
>
> _Last generated: 2026‑07‑03, from the current `main` branch._

---

## 1. Product Overview

**Felix iQ** is the in‑house ERP of **Felix Maritime** — an Egyptian ship agency (Port Said HQ + Ismailia office, est. 1983) that operates **three agencies under one system**:

| Code | Agency | Focus |
|------|--------|-------|
| **FMA** | Felix Maritime Agency | General ship agency |
| **GRA** | German Agency | (second agency brand) |
| **CRA** | Cruising Agency | Yachts / leisure |

The ERP covers the full lifecycle of a vessel call: **enquiry → quotation (PDA) → execution → final invoice (FDA) → closure**, plus Suez Canal transits, crew change & FAL, visa inventory, supply/bunker logistics, finance, and the supporting registries (yachts, owners, companies, persons).

**16 modules** grouped into: Main (Dashboard, Operations, Vessel Movements), Entities (Yacht Directory, Owners, Companies, Persons DB), Operations (Suez Canal Transit, Crew Change, Visa Inventory), Supply Chain (Provision Supply, Bunker Supply, Logistics), Finance, Settings (Tariff Management, Access Control).

**Design language:** SAP Fiori structure dressed in the **Felix Maritime brand book** — Felix Navy primary, Sunset Coral single accent, Ocean Blue links, Felix Gray body text, Mulish font (free stand‑in for the licensed Avenir).

**Central design principle:** the *data* is shared live across users through a Supabase backend; the *app* is a single React file. Everything a user creates (ops, PDAs, yachts…) persists to Supabase and is visible to every logged‑in staff member.

---

## 2. Architecture & Tech Stack

- **Frontend:** React 18 + Vite 5. The **entire app is one file, `src/App.jsx` (~7,700 lines)**. Deps: `lucide-react` (icons), `@supabase/supabase-js`, `xlsx` (SheetJS, lazy‑loaded for Excel). **No CSS framework** — all styling is inline `style={{}}` objects referencing a global token object `S`.
- **Backend:** **Supabase** (managed Postgres + Auth + Row‑Level Security + Storage). Project ref `nukktzcshbmjbxjjccll`.
- **Auth:** Supabase email/password. A default‑export `App()` gates on the session and loads the `staff` profile; `FelixIQ` is the authenticated shell. When no Supabase client is configured, the app runs in a **local‑prototype fallback** (seed data, `STAFF[0]` as the user).
- **Data model:** hybrid **document model** — normalized header columns for queries/RLS **plus a `data jsonb` column** holding the full app object exactly as the UI uses it. App‑supplied **TEXT primary keys** (`y1`, `op1`, `o1`) so cross‑references survive; exception: `staff.id` is the Supabase Auth uuid.
- **Files:** `src/main.jsx`, `index.html` (loads Mulish font), `vite.config.js`, `package.json`; `src/lib/supabase.js` (client), `src/lib/db.js` (data layer); `supabase/schema.sql` + `supabase/policies.sql` + `supabase/migrations/*`; `scripts/setup-supabase.mjs` (staff auth bootstrap).
- **Env (`.env`, gitignored):** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (publishable, safe in the browser — protected by RLS), `SUPABASE_SERVICE_ROLE_KEY` (local scripts only). Vite inlines the two `VITE_` vars into the build.
- **Run:** `npm install`; `npm run dev` (localhost:5173); `npm run build` (→ `dist/`, a self‑contained static site that connects to the same Supabase).

---

## 3. Design System

### 3.1 The `S` token object (verbatim — the single source of colour)

```js
const S = {
  shell: "#0F4F73", brand: "#0F4F73", brandL: "#E8F1F5", brandD: "#0A3A55",
  bg: "#F1F6F9", surface: "#FFFFFF", border: "#D7E2E8", borderL: "#EAF1F4",
  text: "#4A4A4A", textS: "#6B7178", textH: "#999999",
  green: "#107E3E", greenBg: "#F1FDF6", orange: "#D85A30", orangeBg: "#FBEFE9",
  red: "#BB0000", redBg: "#FCEAEA", blue: "#1A6B9A", blueBg: "#E8F1F5",
  purple: "#6E5BA8", purpleBg: "#F0ECF8", cyan: "#1F8FA8", cyanBg: "#E4F4F7",
  gold: "#C08A2E", goldBg: "#F8F1E3",
  navy: "#0F4F73", line: "#B5D1DE",
};
```

Roles: `shell/brand/navy` = Felix Navy (chrome, headings, active nav, avatar). `brandL` = light tint (active nav, selected rows, chips). `orange` = **Sunset Coral, the single accent — reserved for the primary Create action** (never body text). `blue` = links/in‑progress. `green/red/gold/purple/cyan` = status + category. `text/textS/textH` = body/secondary/hint. `surface/bg/border/borderL` = cards/page/borders/hairlines.

**Incidental (hardcoded, not in `S`) — reproduce as‑is:** table header bg `#F2F2F2`, row hover `#FAFAFA`, sidebar hover `#F2F2F2`; agency chip colours **FMA `#0070F2`, GRA `#0C447C`, CRA `#1D9E75`**; InfoStrip warning text `#8A4B06`, gold `#7A6420`.

**`TAG_PALETTE`** — 10 `[bg, fg]` pairs, chosen by a deterministic hash of the tag name (`tagColor(name)`): `[["#E1F5EE","#085041"],["#E6F1FB","#0C447C"],["#EAF3DE","#27500A"],["#EEEDFE","#3C3489"],["#FAEEDA","#633806"],["#FAECE7","#712B13"],["#FBEAF0","#72243E"],["#FCEBEB","#791F1F"],["#E1F0F0","#0F5C5C"],["#F1EFE8","#444441"]]`.

### 3.2 Typography
- **Mulish** loaded in `index.html` (Google Fonts, weights 400;500;600;700;800). Stack: `'Mulish','Segoe UI',-apple-system,sans-serif`.
- Brand font is **Avenir** (licensed) — Mulish is the free substitute; note this in a comment.
- Sizes: 10–13px body/labels, 16px subheader title, 22–26px KPI tile values. Weights: 400/500 mostly, up to 700/800 for emphasis. Sentence case.
- `index.html` title: "Felix Maritime — ERP".

### 3.3 Reusable component library

| Component | Purpose | Props |
|---|---|---|
| `Status` | Status pill (dot + label), colour by status map | `{ value }` |
| `Tile` | KPI card: top accent bar, title, big value, optional trend footer | `{ title, value, icon, accent, footer, footerType, onClick }` |
| `FilterBar` | Toggleable filter‑chip row + count | `{ filters, active, onToggle, count }` |
| `Table` | Generic table (header `#F2F2F2`, hover `#FAFAFA`, x‑scroll) | `{ columns:[{key,label,render?}], data }` |
| `Toolbar` | Section title + Create (orange) / Export / Column‑settings | `{ title, onCreate }` |
| `InfoStrip` | Left‑accent banner; `type`=info/warning/gold/critical | `{ children, type }` |
| `Tabs` | Underline tab bar with optional per‑tab count | `{ tabs:[{key,label,count?}], active, onChange }` |
| `Section` | Titled white panel (uppercase navy heading) | `{ title, children }` |
| `StatCard` | Colour‑tint stat block | `{ val, label, color }` |
| `Modal` | Centred modal shell | `{ title, children, onClose, width }` |
| `SearchSelect` | Single‑select **searchable** dropdown; accepts custom typed value; caps 300 + "+N more" | `{ value, options:[str], onChange, placeholder, width }` |
| `MultiSelect` | Checkbox multi‑select; value/onChange = **comma‑joined string** | same |
| `MultiSearchSelect` | Searchable multi‑select + custom entries; removable chips; comma‑joined string | same |
| `TagChips` / `TagBox` | Render / edit tag pills (hashed colours, autocomplete from `allTags`) | `{ tags, onClick?, active }` / `{ tags, allTags, onChange }` |
| `ActivityBell` | Top‑bar bell + unread badge + activity dropdown | `{ items, unread, onOpen }` |
| `OwnershipEditor` | Structured multi‑owner editor (Person/Company · Sole/Co‑owner · share%, 100% validation) | `{ value, onChange, owners, companies, openOwner, editing }` |
| `FW` / `FField` / `FSelect` / `SaveBtn` | Form field wrapper / compact input / compact select / save button | see code |
| `VoyageKpi` / `VoyageCostRow` | Voyage KPI card / cost row | `{ label, value, accent, bar }` / `{ k, v }` |
| `PortAutocomplete` | Text input backed by `<datalist>` of ports | `{ value, onChange, placeholder }` |

Operations‑local components: `VoyageTab`, `VoyagePortPicker`, `VoyageLegCard`, `VoyageRouteChart`, `VesselDocsTab`, `RosterTable`, `PersonRow`, `FalIssueModal`/`FalPreviewModal`/`UploadListModal`, `CrewGuestsTab`, `SCTransitCard`, `SmallVesselCanalCalc`, `Sub300Builder`, `SuezDuesCalculator`, `YachtDocCard`.

### 3.4 Global helpers
`imoDigits`/`formatIMO`/`isValidIMO` (IMO = "IMO" + 7 digits) · `cleanCallSign`/`isValidCallSign` (4–7 alnum, ITU) · `resolveTonnage(y)` → `{value,basis,missingSC}` priority **SCNT→SCGT→GT**, `tonnageOf(y)` → value · `fileToDataUrl(file, cb)` (base64) · `tagColor` · `timeAgo` · `portByCode` (checks `PORTS_EG` then `VIRTUAL_PORTS`) · `normalizeOwnership`/`primaryOwner` · `loadVoyageGoogleMaps(key)`. Money: `` `$${n.toLocaleString()}` `` or `$…K`. Currency conversion inline via `CURRENCIES` map.

---

## 4. App Shell & Navigation

### 4.1 Auth gate — `export default function App()`
State: `session` (`undefined`=checking, `null`=logged out, object=in), `profile`. On mount: if no `supabase` → render `<FelixIQ currentUser={STAFF[0]} onSignOut={()=>{}} />` (prototype). Else `supabase.auth.getSession()` + subscribe `onAuthStateChange`; on session, load `staff` row (`select * eq id maybeSingle`). Render: `undefined`→"Loading…"; `!session`→`<LoginScreen/>`; else build `cu = { id: profile.legacy_id||profile.id, authId, name, role, office }` → `<FelixIQ currentUser={cu} onSignOut={signOut} />`.

### 4.2 `LoginScreen`
Centred 360px card on `S.bg`: Felix logo, "Felix iQ" + "MARITIME ERP", email + password, `signInWithPassword({email:lowercased, password})`. Errors in `S.red`. Submit button orange when ready.

### 4.3 `FelixIQ({ currentUser, onSignOut })` shell
Flex row, Mulish, `S.bg`, min‑height 100vh.
- **Left sidebar** (220px open / 0 collapsed): logo + "Felix iQ / MARITIME ERP"; nav from `MODULES` grouped by `groups = {main:"Main", entities:"Entities", operations:"Operations", supply:"Supply Chain", finance:"Finance", settings:"Settings"}`. Active item = `brandL` bg + `brand` text; hover `#F2F2F2`. Footer "FMA‑DEV‑SPEC‑2026‑002 / v2.0 · {N} modules".
- **Top shell bar** (h42, `S.shell`): sidebar toggle; Felix white icon; "Felix iQ"; search box (display‑only placeholder "Search operations, vessels, crew…"); **EET clock** (`toLocaleTimeString en-GB` + " EET"); **agency switcher** (FMA/GRA/CRA buttons → sets `entity` state); `ActivityBell`; settings gear (static); avatar circle (initials, click = `onSignOut`).
- **Subheader**: breadcrumb `Home > {module}`; title `{code} · {entity} — {module}`; right: date, `|`, `{user.name} ({user.role})`.
- **Content**: `render()` switches on `mod`.
- **Footer**: left "Felix iQ · … · 30 database tables · 80+ services"; right "Palace Tower 1, Palestine & El Salam St, Port Said · Est. 1983".
- **State plumbing:** `mod`, per‑entity `*Intent` (create/open deep links), `navStack` (breadcrumb back‑stack `{mod,type,id}`), `entity`, `sideOpen`. Cross‑module nav via `openYacht/openCompany/openOwner(id, from)` + `goBack()`; `backLabel`/`navDepth` derived. `logActivity(kind, action, entity, entityType)` feeds `ActivityBell`.

### 4.4 `MODULES` (16) — `{key, label, icon(lucide), group}`
`dashboard` Dashboard (LayoutDashboard, main) · `operations` Operations (ClipboardList, main) · `movements` Vessel Movements (Activity, main) · `yachts` Yacht Directory (Ship, entities) · `owners` Owners (UserCircle, entities) · `companies` Companies (Building2, entities) · `persons` Persons DB (Users, entities) · `transit` Suez Canal Transit (Compass, operations) · `crewchange` Crew Change (ArrowLeftRight, operations) · `visa` Visa Inventory (Stamp, operations) · `provisions` Provision Supply (ShoppingCart, supply) · `bunker` Bunker Supply (Fuel, supply) · `logistics` Logistics (Truck, supply) · `finance` Finance (DollarSign, finance) · `tariffs` Tariff Management (Receipt, settings) · `access` Access Control (Shield, settings).

---

## 5. Data Model & Supabase Schema

**Conventions:** TEXT app‑supplied PKs; `staff.id` = Auth uuid; every table has `created_at`/`updated_at` with a `public.touch()` trigger; RLS helpers `is_staff()`, `is_mgmt()` (role ∈ Product Manager/Admin/Management), `my_office()`. Run order `schema.sql → policies.sql → seed`.

**Tables** (columns summarized; full DDL in `supabase/schema.sql`):

- **agencies** — `code PK`, name, color, base_currency, active. Seeded FMA/GRA/CRA with colours `#0070F2/#0C447C/#1D9E75`.
- **staff** — `id uuid PK → auth.users`, `legacy_id text unique` (s1..s6), name, role (Product Manager|Standard|Ismailia), office, email unique, phone, active.
- **companies** — `id PK`, name, name_en, type, country, nationality, website, founded, employees, contact_email/phone, `addresses jsonb`, `tags jsonb`, **`data jsonb`**, created_by. (Real companies only; builder directory stays frontend‑only.)
- **persons** (unified crew/owners/guests/officials) — `id PK`, full_name, `rank` (distinguishes Owner/Captain/…), nationality, email, phone, passport_number, passport_expiry, net_worth, notes, `yacht_ids text[]`, company_id, `addresses/social/documents/tags jsonb`, **`data jsonb`**.
- **yachts** — `id PK`, name, `prev_names text[]`, type, category, model, status, loa, beam, draught, gt, nt, hull/superstructure material, year_built, flag, imo, mmsi, call_sign, official_number, classification_society, engines, max_speed, cruising_speed, range, fuel_capacity, guest/crew_capacity, owner_id, builder/exterior_designer/interior_designer/naval_architect/management/broker/central_agent/marina _id, charterable, charter_price, `documents/tags jsonb`, **`data jsonb`**. (`scnt`,`scgt`,`serial`,`forSale`,`askingPrice`,`ownership` live inside `data`.)
- **operations** (transactional heart) — `id PK`, `op_number unique`, agency_code, entity, status (default 'Enquiry'), yacht_id, vessel_name/loa/gt/flag, client_id/name/email, `ports text[]`, last_port, next_port, eta, etd, base_currency, staff_id, notes, lost_reason, lost_date, `timestamps/service_log/pdas/fdas/voyage/crew/guests/fal_docs/totals jsonb`, `rev int` (concurrency token). **Plus `data jsonb`** added by migration `2026-06-23_operations_data.sql` — the app persists the whole op object in `data` and leaves FK columns null.
- **crew_changes** — id PK, operation_id, yacht, type, crew_name, role, nationality, port, change_date, phase, status, visa, visa_method, flight, gl_status, restricted, `services jsonb`.
- **transits** — id PK, operation_id, yacht, direction, last/next_port, anchorage, convoy, pilot_etb, road_pilot, inspector, transit_day, ismailia_stop, ismailia_eta/etd, status, booking_ref, notes.
- **logistics** — id PK, operation_id, yacht, type, code, descr, port, log_date, status, value, currency, supplier_id, supplier, po_number, markup, markup_val, bunker_grade, qty_ordered, bunker_status, `data jsonb`.
- **visa_batches** — id PK, type, code, batch_ref, date_received, total_stickers, cost_per_sticker, available, assigned, used, expiry.
- **Finance:** `ga_expenses`, `supplier_bills`, `manual_journals` (with `lines jsonb`, `override_closed`), `closed_periods` (`period PK`).
- **Settings/reference:** `tariffs` (`config jsonb`, is_current), `sc_toll_table` (from_scnt/to_scnt/rate_sdr slabs), `sdr_rates` (rate_date PK), `fx_settings` (id=1, base_currency, `rates/history jsonb`).
- **Files/audit:** `attachments` (bucket, object_path, entity_type/id), `audit_log`.

### 5.1 `db.js` — data layer (document model)
Row shape `{ id, name|full_name, data }`; `unwrap = rows => rows.map(r=>r.data)`. Functions:
- Yachts: `listYachts` (`select id,data order name`), `saveYacht` (`upsert {id, name:y.name||"Unnamed", data:y}`), `saveYachts`, `deleteYacht`.
- Persons: `listPersons` (order full_name), `savePerson` (`{id, full_name:p.fullName||p.name||"Unknown", data:p}`), `savePersons`, `deletePersonRow`.
- Companies: `listCompanies`, `saveCompany` (`{id, name, data}`), `saveCompanies`, `deleteCompanyRow`.
- Operations: `listOperations` (order op_number), `saveOperation` (`{id, op_number:o.opNumber, status:o.status||"Enquiry", entity:o.entity, data:o}`), `saveOperations`, `deleteOperationRow`.

`supabase.js`: one client from `import.meta.env.VITE_*`; exports `supabase` (null if unconfigured) + `isBackendConfigured`.

---

## 6. Persistence & State Patterns (in `FelixIQ`)

- **State:** `dbYachts`, `dbPersons`, `dbCompanies`, `dbOps` — all `useState(null)` (`null` = still loading → fall back to seed for instant paint).
- **Four load‑and‑seed effects** (one per entity, `[]` deps, guarded by `if(!supabase) return`, `active` flag + cleanup): `rows = await listX()`; **if `rows.length===0` → `await saveXs(SEED); rows = SEED`** (one‑time seed); `setDbX(rows)`. Companies seed only `[...BASE_COMPANIES, ...OWNER_COMPANIES]` (never the builder directory).
- **Effective lists (DB overrides seed):**
  - `allYachts = dbYachts ?? [...YACHTS, ...customYachts].map(applyEdit)`
  - `allCompanies = dbCompanies!==null ? [...DIRECTORY_COMPANIES, ...dbCompanies] : …` (the ~1,700 builder `DIRECTORY_COMPANIES` is a frontend constant, **always prepended**, never persisted)
  - `allPersons = dbPersons ?? [...PERSONS, ...customPersons](applyEdits)(filter deleted)`
  - `allOwners = [...allCompanies where type==="Owner / Principal", ...allPersons where rank==="Owner" → {…p, name:p.fullName}]`
  - `allOps = dbOps ?? OPERATIONS`
- **Optimistic handlers** (set state first, persist async, log activity): `addYacht/updYacht/importYachts`, `addOp/updOp` (**addOp rolls back + alerts on save failure**), `addOwner/updOwner`, `addCompany/updCompany/deleteCompany`, `addPerson/updPerson/deletePerson`, `linkContact/unlinkContact`. `addYacht`/`addCompany` **return the created record** (so callers can auto‑select it). `updOwner`/`updCompany` fall back to an edits‑overlay (`ownerEdits`/`companyEdits`) when editing a seed record with no DB row.
- **Import merge:** `mergeImportRows(list, existing, keyFn, idPrefix) → {out, added, updated}`; `importYachts` (key IMO‑or‑name), `importPersons` (key fullName), `importOwners` (forces rank Owner), `importCompanies` (key name). New ids `${prefix}${Date.now()}_${i}_${rand}`.
- **PDAs/FDAs onto the op** (`updateCreatedPdas`): PDAs/FDAs live in `createdPdas` state **keyed by document number**, but are persisted onto their parent op grouped by `opId`. On change, diff keys to find affected opIds, then `updOp(opId, {pdas, fdas, pdaCount, fdaCount})`. A **hydration effect** (`[allOps]`) rebuilds `createdPdas` from each op's `pdas`+`fdas` (key = `isFda ? fdaNumber : number`) and `voyagePlans` from `op.voyage`.

---

## 7. Modules (one section each)

> Only Dashboard, Vessel Movements, and Finance consume **live `allOps`**. Transit, Crew Change, Visa, Logistics, Tariff, and Access initialise from **seed constants into local `useState`** and do not yet persist (planned).

### 7.1 Dashboard (`DashboardView`, mod `dashboard`)
Props `{ setMod, onCreateOp, allOps }`. Greeting ("Good morning/afternoon/evening" by hour, name "Sarah") + **Create New Operation** button (orange, `onCreateOp()`) + date line "· Port Said". **Urgent banner** if any `ALERTS` type==="critical". **Three per‑agency KPI cards** = `FIN_HISTORY[code] + computeFinance(ops).per[code]` → invoices, USD (`$X.XXM`), paid/unpaid split bar, AR (`= history.ar + live.ar + live.unbilled`), ops count; card click → Finance. **Monthly revenue** stacked bar (hardcoded 5‑month array, GRA/FMA/CRA). **Active operations** list (first 5 with status Active/Upcoming/Enquiry). **Action feed** (all `ALERTS`, left‑border by type). **Quick actions** (New operation → onCreateOp; Create PDA/New transit/Crew change → setMod). **Today's numbers** (only "Active ops" live; rest hardcoded — a known placeholder).

### 7.2 Operations (`OperationsView`, mod `operations`) — the core
Props `{ activeEntity, intent, clearIntent, user, owners, allOps, addOp, updOp, allYachts, addYacht, updYacht }`.

**List view:** status tiles; filter tabs (`OP_STATUSES`); "list report" table; **Create** button opens the create form. Access filter: `isMgmt = role ∈ [Product Manager, Admin, Management]` → sees all; else only ops where `staffId===user.id` or same office (`visibleOps`).

**Create form (`showCreate`)** — `emptyForm` fields: vesselName, yachtId, clientName, clientEmail, vesselLoa, vesselGt, vesselFlag, vesselImo, ports[], eta, etd, lastPort, nextPort, baseCurrency, opType, staffId, notes, entity. Sections:
- **Agency selector** (FMA/GRA/CRA buttons, defaults to top‑bar `entity`) with a **live op‑number preview** `{code}-OPS-2026-{n}`. The chosen agency drives the op number **and** the stored `entity`.
- **Operation type**: Enquiry / quick quote (minimal — vessel TBC, needs ports + LOA/GT) vs Confirmed operation (needs vesselName + clientName + ports; status starts Upcoming).
- **Vessel picker** — `SearchSelect` over **live `allYachts`** (`{name} ({loa}m · {gt} GT · {flag})`); selecting autofills vessel + owner→client. **"Add new vessel"** inline sub‑form (controlled: name/type/flag/imo) → `handleAddVessel()` calls `addYacht(...)` (returns the new yacht), auto‑selects it, and creates the real Yacht Directory profile.
- **Voyage details**: transit/cruising row = `TRANSIT_TYPES` (SC‑SB/SC‑NB) + `CRUISING_AREAS` (Red Sea/Mediterranean) + a real **No transit** toggle; ports of call grid by `PORT_CATEGORIES` (incl. the island groups); Last/Next port `SearchSelect` over `["Other / TBC", …Egyptian ports "(Egypt)", …WORLD_PORTS, …FLAG_COUNTRIES]`.
- **`handleCreate()`**: builds `newOp` (`id:op${Date.now()}`, opNumber from chosen agency, status, entity, timestamps.enquiryReceived, rollup counters 0) → `addOp(newOp)`; if a linked vessel's flag/LOA/GT/IMO were refined in the form, **reciprocate to the Yacht Directory** via `updYacht`.

**Detail view** (selected op): two header strips — (1) Ports of call, **editable Last→Next port** (`SearchSelect` → `patchOp`), Staff; (2) **editable IMO + SCGT** inputs → `patchVessel` (writes op **and** the yacht via `updYacht`), Services, PDAs/FDAs, Effort. Tabs: **Timeline** (6‑stage status machine `Enquiry→Upcoming→Active→Completed→Closed`, Lost branch, timestamps), **PDA**, **FDA**, **Voyage**, **Crew & Guests**, **Documents**.

**PDA tab:** list of PDAs for the op (matched by `opId` or number pattern) → open a document, or **Create PDA** → the builder. **Service Catalog builder** (left = catalog, right = cart): direction N.B./S.B. toggle, search, transit packages, `SERVICE_CATALOG` packages ("Add all"), `INDIVIDUAL_SERVICES` ("Add"), custom item. For vessels < 300 T the **sub‑300 hierarchical builder** (`Sub300Builder`) opens; the catalog **stays visible below** and "Add" routes items into the builder under an "ADDITIONAL SERVICES" group. **Save as draft** persists via `updateCreatedPdas` (status starts `Draft`).

**Sub‑300 builder (`Sub300Builder`):** groups → sub‑items (`SC_SUB300_PACKAGES[nb|sb]`). Columns: include ✓, SN, **Item (with two stacked notes under it: green "INTERNAL — employees only, never printed" textarea + a client‑facing "Add note… (shows on the PDA/FDA)")**, Qty (manual), Rate (USD — for the canal‑dues row this is the **calculated dues figure** SCNT×5×SDR from the calc bar; otherwise editable), VAT %, Amount (editable; auto = Qty×Rate; a **math check** blocks save on mismatch), remove. Calc bar: L/W/D → SCNT (override allowed), SDR (default `DEFAULT_SDR`, flagged if outside 1.0–2.0). Footer: math‑check status + **Payment terms dropdown** (`PAYMENT_TERMS`) + total + **Save as draft**. Add group / add sub‑item / add from catalog. Blank Qty or VAT ⇒ that column is omitted on the printed doc.

**Document renderer:** header shows **Operation number** (relates doc↔op), Client, Vessel, dates, currency, prepared‑by; line‑item table grouped by category with per‑line internal (employee‑only) + client notes, Qty/Rate/VAT/Amount, **Subtotal / VAT / Total** (VAT summed per‑line from qty×price×vat%); the sub‑300 doc appends `SUB300_TERMS` with the chosen payment‑terms line (editable dropdown until Accepted/locked). **Status toolbar:** Draft → **Send** → **Accept** (locks) / **Decline**; **Revise** (‑R{n}) / **Supplementary** (‑S{n}); **Delete draft**; "Download PDF" (stub). PDA/FDA numbering & letterhead follow **`opAgencyCode(op)`** (op‑number prefix wins).

**FDA tab:** generate an FDA from an Accepted PDA (`generateFda`) — copies items with `estimatedAmount`/`actualAmount`/`variance`; edit actuals; **Release** (posts to GL) / **Mark paid**. FDAs carry `opId` and persist onto the op.

**Voyage tab (`VoyageTab`):** itinerary **auto‑builds from the op's ports of call** (each becomes a numbered leg; canal transits & cruising areas resolve via `VIRTUAL_PORTS` so they appear as named stops); route chart; per‑port service checklist; **Indicative PDA (auto‑estimate)** = default clearance+berth per stop + 10% agency fee (superseded by the real PDA); "push to PDA".

### 7.3 Vessel Movements (`MovementsView`, mod `movements`)
Props `{ allYachts, allOps }`. Read‑only board: ops with status Active/Upcoming joined to `TRANSITS` by `opId`. Derives `movement` (S.B/N.B from transit, else RED SEA / MED by ports), transitStatus, ismailia, scgt, entryPoint. 5 KPI tiles; table Date/Vessel/Flag/SCGT/Entry/From/To/Movement(chip)/Ismailia/Transit Status/Op Status.

### 7.4 Yacht Directory (`YachtsView`, mod `yachts`)
Props include `allYachts, allOwners, allCompanies, allOps, addYacht, addCompany, importYachts, updYacht, openCompany, openOwner`. Card/table views, search, type & GT‑class filters, tag filter. Quick **Add yacht** form (name/type/category/flag/imo/loa/gt/beam/draught/year/guests/crew + Builder/Classification/Hull + **Exterior/Interior Designer + Naval Architect**; custom builder/designer entries **auto‑create a Companies profile** via `ensureCompany`). **Excel export/import** (see §8). Yacht profile: overview (Build & design; **Ownership & registration** with `OwnershipEditor`; GT‑impact panel; sub‑300 dues calculator), technical, commercial, documents (upload → base64 in `data`), and an `SCTransitCard`. Status is **system‑derived** (`getYachtStatus`).

### 7.5 Owners (`OwnersView`, mod `owners`)
Props `{ allOwners, allYachts, allOps, addOwner, importOwners, updOwner, openYacht, openCompany }`. Owners = persons rank Owner + owner‑companies. Cards/table, search, add‑owner form, **Excel export/import** (PERSON spec), CRM fields, notes log, contacts, owner documents, linked yachts & ops.

### 7.6 Companies (`CompaniesView`, mod `companies`)
Props include `allCompanies, allPersons, allYachts, allOps, addCompany, importCompanies, updCompany, deleteCompany, linkContact, unlinkContact, openYacht`. ~1,720 companies (43 real + ~1,677 auto builder directory). Type filters, search, add form (name/nameAr/type/country…), **Excel export/import** (COMPANY spec), company profile with linked contacts (persons), **vessels built/owned** (from live `allYachts`), and ops.

### 7.7 Persons DB (`PersonsView`, mod `persons`)
Props include `allPersons, allCompanies, allYachts, allOps, addPerson, importPersons, updPerson, deletePerson, linkContact, unlinkContact, openYacht`. Crew + owners (unified). Cards/table, search, add form, **Excel export/import** (PERSON spec), person profile: identity, passport/expiry, service history, documents, CRM & marketing, affiliations (linked companies), owned vessels & ops.

### 7.8 Suez Canal Transit (`TransitView`, mod `transit`)
Local `rows` from `TRANSITS`. 4 KPI tiles; add "New transit booking" (bookingRef*, vessel*, direction, transit day, convoy, status); table Booking Ref/Vessel/Direction/Transit Day/Convoy/Anchorage/Ismailia Stop/Status. InfoStrips explain the status chain and the Ismailia default rule (GT>300→No; ≤300+crew change→Yes; ETA/ETD editable only by Ismailia office + admin).

### 7.9 Crew Change (`CrewChangeView`, mod `crewchange`)
Local `rows` from `CREW_CHANGES`. 11‑phase workflow. 5 KPI tiles; filter All/Embark/Disembark; add form (vessel*, type, crew*, rank, nationality, port [`PORTS_EG`], date, visa method [`VISA_METHODS`]); table incl. Phase `{n}/11`, GL/Visa/Status chips, "⚠ RESTRICTED" for restricted nationalities. InfoStrip on foreign‑flag captain rule.

### 7.10 Visa Inventory (`VisaView`, mod `visa`)
Local `rows` from `VISA_BATCHES`. One KPI tile **per batch** (available, orange if <15). Add "New visa batch" (batchRef*, type*, code, total, cost/unit, received, expiry); table Batch/Type/Code/Total/Available/Assigned/Used/Cost/Received/Expiry. Lifecycle Available→Assigned→Used.

### 7.11 Supply Chain (`LogisticsView`, mods `provisions`/`bunker`/`logistics`)
One component, three routes with distinct `key` + `initialTab` (`provision`/`bunker`/`all`) — `initialTab` seeds both the active tab and the add‑form default type. Local `rows` from `LOGISTICS`. 4 KPI tiles; tabs All/Provisions/Bunker/Parts&Technical; add "New supply request" (vessel*, type, code, description*, port, supplier, value, currency); table Order ID/Vessel/Type(chip)/Code/Description/Port/Supplier/Date/Value/Status. Bunker tab InfoStrip (pipeline + VAT‑by‑flag: foreign exempt, Egyptian 14%).

### 7.12 Finance (`FinanceView`, mod `finance`)
Props `{ activeEntity, allOps }`. `live = computeFinance(allOps)`. Tabs: **Sales invoice analysis** (KPIs = history `INV` + live: total invoices, revenue `$X.XXM` + EGP/EUR, collection rate, cancelled; revenue by agency; top yachts; service mix; payment split bars), **Balance sheet** (per‑agency `bs`), **Chart of accounts** (`coa` with a **Balance column**: cash/AP from per‑agency balance sheets; **AR = bsSum(ar) + live.ar + live.unbilled**; **VAT = live only**; revenue/expense accounts). Historical figures (`INV`, `FIN_HISTORY`) are real imported accounting data **added on top of** live ERP figures.

### 7.13 Tariff Management (`TariffView`, mod `tariffs`)
Tabs **SCA Toll Table** and **Canal & Port Tariffs**. `sdrHistory` state (newest first) → `SDR_RATE = sdrHistory[0].rate` (fallback 1.3682). `fetchSDR()` is a **stubbed** CORS‑fail simulation (real impl = backend cron on IMF); manual‑rate entry prepends `{date:today, rate, source:"Manual", fetchedBy:"Sarah A."}`. `SmallVesselCanalCalc` (dues for <300 GT: `tons=(L×W×D)/2.82`, `dues=tons×5×SDR`, min/max SDR guard). **Slab toll table** (`slabs`, 7 bands, marginal `calcToll`), editable, with worked examples (300/880/2,940 SCNT). **Canal & Port Tariffs**: circular management (add/archive; file upload/view are **stubs**) + editable rate tables (SC transit foreign 6.65 / Egyptian 3.30 USD/ton; mooring tiers; pilotage brackets; port‑clearance tiers; fixed rates ETR/env/immigration/NS; national‑security tariff rows; sea‑trial Art.103).

### 7.14 Access Control (`AccessView`, mod `access`)
Tabs Users / Roles / Matrix. **`ROLE_DEFS`** (8): Administrator, Product Manager (both Full, columns locked), Operations Manager, Operation Specialist, Finance Manager (Write), Field Operator (Limited), Ismailia Office (Restricted), View Only (Read). Users tab (13 seeded users, editable role/entity/office/status). Roles tab (cards + assigned‑user counts). Matrix tab: 11 module rows × role columns, `PERM_LEVELS = [Full, Write, Read, None]`, click cycles; Admin/Product Manager locked. **Runtime enforcement** today is only `isMgmt` in Operations (`visibleOps`) — the matrix is configuration/display (not yet wired to enforcement; RLS is the real gate).

---

## 8. Business Logic & Algorithms

- **Canal dues (< 300 T):** `SCNT = (LOA × beam × draught) / 2.82`; `dues_USD = SCNT × 5 × SDR`. SDR default 1.3682, guard 1.0–2.0. In the sub‑300 builder the dues row's **Rate = this computed figure**; Qty is manual; Amount = Qty×Rate unless overridden (math check).
- **Above‑300 toll:** marginal slab table (`slabs`, SDR/ton, decreasing by band), `calcToll(scnt)` sums `tons×rate` per band → `{totalSDR, totalUSD = totalSDR×SDR_RATE, bd[]}`.
- **Tonnage resolver:** always `resolveTonnage` (SCNT→SCGT→GT), never raw `gt`.
- **`computeFinance(ops)`** → per‑entity `{inv,usd,paid,unpaid,ar,unbilled}` + `gl`. FDA = invoice; `fdaDocTotal` = Σ `actualAmount ?? qty×price`; unpaid → AR; VAT from Released/glPosted FDAs (`Σ qty×price×vat/100`); revenue/cost from op rollups; **unbilled** = op revenue with no FDA issued (accrued, shown separately). `gl.netIncome = grossProfit − FIN_BASELINE.gaExpenses` (3200). `FIN_HISTORY` (pre‑ERP invoices) is added on top wherever shown.
- **Ownership model:** `{type:"Person"|"Company", id, name, role:"Sole"|"Co-owner", share}`. `normalizeOwnership` migrates legacy `ownerId`; `primaryOwner` (Sole → largest share → first) keeps `ownerId`/`ownerName` synced for cards/exports.
- **Entity from op number:** `opAgencyCode(o)` — op‑number prefix (FMA/GRA/CRA) wins, else map `entity`, else FMA. Drives PDA/FDA numbering + letterhead.
- **Auto‑create company on custom entry:** `ensureCompany(name, type)` returns existing (case‑insensitive) or creates it; `ensureCustomDesigners` applies it to multi‑value designer fields.
- **`getYachtStatus`:** Active if any live op for the yacht is Active/Upcoming/Enquiry, else Inactive (system‑derived).
- **Serials:** `Y000001` / `C000001` / `P000001` (explicit `serial` wins, else index‑derived, `nextYachtSerial` = max+1). Vessel name always uppercase.
- **Excel I/O:** yachts via `YACHT_XLSX_COLUMNS` (33 base) + `YACHT_REL_COLUMNS` (names↔ids) + **`Ownership` column** (`ownershipToString`/`parseOwnershipString`); `yachtToRow`/`rowToYacht` (status skipped on import, system‑derived). Owners/Persons via `PERSON_XLSX_SPEC` (24 cols, dotted CRM paths, addresses/tags), Companies via `COMPANY_XLSX_SPEC` (16). Generic `regToRow`/`rowToReg` + `exportRegistryToExcel`/`importRegistryFromExcel`. `getPath`/`setPath` handle `crm.tier` etc.; `addressesToStr`/`strToAddresses` for the addresses column.

---

## 9. Reference Datasets (paste‑in exact)

### `TRANSIT_TYPES`, `CRUISING_AREAS`, `VIRTUAL_PORTS`
```
TRANSIT_TYPES: SC-SB "Suez Canal Transit — Southbound", SC-NB "Suez Canal Transit — Northbound" (cat "Suez Canal Transit")
CRUISING_AREAS: AREA-RS "Red Sea — cruising area", AREA-MED "Mediterranean — cruising area" (cat "Cruising Area")
VIRTUAL_PORTS (keyed by code, give lat/lng so they plot as voyage stops):
  SC-SB→30.45,32.35 · SC-NB→30.45,32.35 · AREA-RS→26.5,34.5 · AREA-MED→31.6,30.0
```

### `PORTS_EG` (35 rows) — see the table in the extract; fields `{code,name,type,cat,lat,lng}`. Categories:
`PORT_CATEGORIES = ["Suez Canal Zone","Red Sea (Northern)","Red Sea (Central & Southern)","Gulf of Aqaba","Mediterranean","Hurghada & El Gouna — Islands","Sharm El-Sheikh & Sinai — Islands","Marsa Alam & Deep South — Islands"]`
(Islands: Giftun/Mahmya/Abu Minqar/Tawila · Tiran/White/Pharaoh's/SS Dunraven/Gordon/Marsa Breaks/Ras Mohamed · Hamata/Zabargad/The Brothers. Mediterranean now includes Marassi Marina + El Alamein.)

### `WORLD_PORTS` — ~215 "City (Country)" strings grouped by region (Red Sea & Gulf of Aden; Arabian Gulf & Oman; E./Central/W. Mediterranean; Greece & Turkey; Adriatic & Black Sea; Atlantic Europe & North Sea; Indian Ocean & E. Africa; Asia & Pacific; Americas & Caribbean; West Africa), terminated by "Other / TBC". `FOREIGN_PORTS = WORLD_PORTS`.
### `FLAG_COUNTRIES` — 195 country names (Afghanistan…Zimbabwe).

### `STAFF` (6)
```
s1 Sarah Ahmed Salaheldin  · Product Manager · HQ
s2 Bahi Naguib             · Standard        · HQ
s3 Capt. Mohamed Mostafa   · Standard        · HQ
s4 Basent Naguib           · Standard        · HQ
s5 Amany El Yamany         · Standard        · HQ
s6 Mostafa                 · Ismailia        · Ismailia
```
Auth: 6 accounts `sarah/bahi/mohamed/basent/amany/ismailia@felix-eg.com`, temp password `Felix-iQ-2026`.

### Statuses & lists
```
OP_STATUSES = [Enquiry, Upcoming, Active, Completed, Closed, Lost]
LOST_REASONS (9), VISA_METHODS (5), UNIT_OPTIONS (10: Per transit/person/each/day/vessel/operation/call/GT/CBM/night)
PAYMENT_TERMS (7; default "100% advance prior to vessel arrival.")
CURRENCIES = { USD:1, EUR:0.92, EGP:50.85, GBP:0.79, SAR:3.75, AED:3.67 }
FX_RATE = 50.85 (EGP/USD) · DEFAULT_SDR = 1.3682
SDR history (newest first): 2026-05-19/1.3682/IMF, 2026-04-03/1.3594/IMF, 2026-01-15/1.3450/Manual
```

### `SVC_MASTER` (24) — `SVC-01…SVC-24` (Transit, Embarking, Disembarking, Bunkering, Provisions, Land Trips, Spare Parts, Dry Dock, Sludge, Fresh Water, Oil, Garbage, Shipment Clearance, Cash To Master, Cruising Permits, Chartering, Customs Clearance, Port Call, Certificate Issuing, Meet & Assist, Berthing, Diving, Visa, Agency Fee).

### `SERVICE_CATALOG` (10 packages) & `INDIVIDUAL_SERVICES` (6 categories) — full item lists in §Reference extract (nb/sb under‑300 base/visa/embark/disembark with USD + EGP‑derived prices via `FX_RATE`; above‑300 transit packages "Rate TBC"). à‑la‑carte: Agency, Port & harbour, Crew services, Supplies & logistics, Waste & discharge, Transport & general.

### `SC_SUB300_PACKAGES` (hierarchical PDA builder) — `DEFAULT_SDR=1.3682`. Groups (shared): **SUEZ CANAL DUES** (autoCalc canalDues), **PORT CLEARANCE** (NB only — same‑day $60 rack $60–100 / weekend $180), **VISA** ($30/person), **IMMIGRATION** (check‑in/out/embark/disembark 2,000 EGP each), **NATIONAL SECURITY** (1,220 EGP each), **INSURANCE & INSPECTION** (Marine Inspection $10), **MARINA ISMAILIA** ($30 ≤10m / $40 10–20m / on‑request >20m, collected by marina). `nb` = all groups incl. PORT CLEARANCE; `sb` = same minus PORT CLEARANCE. Item fields `{name, autoCalc?, qty?, price?, vat?, include, internalNote?, note?}`; blank Qty/VAT ⇒ column hidden on the doc; `internalNote` never printed.

### `SUB300_TERMS` — title "TERMS & CONDITIONS — Vessels Below 300 T", intro, payment line, **8 clauses** (per‑vessel fees; client liable after submission; document‑accuracy/hold‑harmless; PDA→FDA; excludes Master's requirements; SCA electrical spec; SCA 5‑year tonnage‑claim right; Suez‑transit‑only scope).

### Other seed constants
`OPERATIONS` (8 seed ops op1–op8), `YACHTS` (20; y1–y14 detailed, y20–y25 stubs; y13/y14 have `documents[]` examples), `PERSONS` (crew + 8 owners o1–o8), `COMPANIES` = `BASE_COMPANIES` (~22) + `DIRECTORY_COMPANIES` (~1,677 auto from builder/designer picklists, frontend‑only) + `OWNER_COMPANIES`, `TRANSITS`, `CREW_CHANGES`, `VISA_BATCHES`, `LOGISTICS`, `ALERTS` (7), `FIN_HISTORY`, `FIN_BASELINE`, `INV` (finance history w/ topYachts + svcMix + bs), `TAG_PALETTE`, `VOYAGE_SVC`, `FELIX_LOGO`/`FELIX_ICON_WHITE` (base64 PNG data URIs).

---

## 10. Known Gaps, Stubs & Design Decisions (reproduce honestly)

- **Not yet persisted:** Transit, Crew Change, Visa, Logistics, Tariff, Access views hold local `useState` seeded from constants (lost on refresh). Wiring them follows the same db.js + load‑seed pattern as ops.
- **Stubs:** Tariff circular file upload/view (`alert`), `fetchSDR` (simulated CORS fail — real impl = backend cron), PDA "Download PDF" (`alert`), Dashboard "Today's numbers" (mostly hardcoded), monthly‑revenue chart (hardcoded).
- **Finance:** live from data (FDAs + op rollups) **plus** `FIN_HISTORY` pre‑ERP figures; `FIN_BASELINE.gaExpenses=3200` is the only hand‑entered value; full GL from source records is future work.
- **Access control:** matrix is display/config; real enforcement = RLS + the `isMgmt` op filter.
- **Documents:** stored base64 inside `data` JSONB — move to Supabase Storage for large files (schema `attachments` table + `documents` bucket already defined).
- **Secrets:** `.env` gitignored; anon key safe in the browser (RLS‑protected); service‑role key local‑only.
- **Fonts:** Mulish substitutes for licensed Avenir.
- **Deploy:** production build in `dist/`; hosting (e.g. Netlify) + `erp.felix-eg.com` planned.

---

## 11. Rebuild Instructions & Acceptance Criteria

**Build order:**
1. Scaffold Vite + React; add `lucide-react`, `@supabase/supabase-js`, `xlsx`; load Mulish in `index.html`.
2. Create the `S` token object and the reusable component library (§3.3) exactly.
3. Build `supabase/schema.sql` + `policies.sql` (§5); run them; seed 3 agencies + 6 staff auth users.
4. Implement `src/lib/supabase.js` + `src/lib/db.js` (§5.1).
5. Implement the auth gate + `FelixIQ` shell + `MODULES` nav (§4).
6. Implement the persistence layer (§6): `dbX` state, load‑seed effects, `allX` lists, optimistic handlers, `updateCreatedPdas` + hydration.
7. Paste in all reference datasets (§9) exactly.
8. Build each module (§7), starting with Operations (create form → detail → PDA/FDA builder → voyage) since everything hangs off it.
9. Implement the algorithms (§8): canal dues, `computeFinance`, ownership, `opAgencyCode`, `getYachtStatus`, `ensureCompany`, Excel I/O.
10. Wire the design brand throughout; verify against the acceptance tests.

**Acceptance criteria (functional):**
- Log in with a staff email; the shell shows the user's name/role and the FMA/GRA/CRA switcher.
- Create an operation choosing an agency → the op number carries that agency's prefix, the op stores the entity, and it **persists across refresh** (Supabase).
- Add a vessel from inside Create Operation → a real profile appears in the Yacht Directory; add an IMO on the op → it saves to the yacht too.
- Build a sub‑300 PDA: canal‑dues Rate = SCNT×5×SDR, Qty manual, Amount editable with a math check; internal vs client notes stacked under each item; payment‑terms dropdown; Save as draft; the PDA shows in the PDA tab tied to the op and survives refresh; issue an FDA from it.
- Registries (yachts/owners/companies/persons) support add/edit + Excel export/import including the structured Ownership column; custom builder/designer entries auto‑create Companies profiles.
- Dashboard/Movements/Finance reflect live ops (create an op → they update); Finance figures = history + live, AR includes unbilled, VAT from released FDAs.
- Voyage tab auto‑builds legs from the op's ports; canal transits appear as named stops.
- Two logged‑in users see each other's data (shared Supabase).

---

_End of specification. The canonical implementation is `src/App.jsx` + `src/lib/` + `supabase/`. This document + the Git repository together fully describe Felix iQ._
# FM-System
