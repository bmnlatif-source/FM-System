# Felix iQ — Council Audit Report (code-level)

*Method: five independent reviewer agents (correctness, security, data integrity, finance/domain math, UX) audited the live codebase; findings were then adversarially verified. The UX reviewer and part of the verification wave were cut short by a usage limit; the findings below were verified by direct code inspection instead. 28 raw findings → deduplicated and ranked below.*

**Scope note:** documented-known gaps (Transit/Crew/Visa/Logistics not persisted, display-only permission matrix, PDF stubs, partly-hardcoded dashboard) were excluded by design — see `REMEDIATION.md`.

---

## Executive verdict

The system is functionally rich and the single-user happy path works well, but it is now a **multi-user production system, and that's where the risk concentrates**: whole-document saves with no conflict handling can silently discard a colleague's work; the PDA/FDA pipeline has lifecycle gaps (unsaved edits, reusable document numbers, hardcoded dates) that can corrupt financial documents; and several finance aggregates are computed on the wrong basis (VAT from estimates, drafts counted as invoices, EUR summed as USD). None of these are visible in a demo — all of them will surface with 6 staff using it daily. The security posture is decent (RLS everywhere, correct key handling) with four specific holes to close.

---

## Findings (ranked)

### CRITICAL

**C1 — Two users editing the same operation silently overwrite each other** *(data integrity — verified)*
Saves rewrite the entire operation document from the local session's copy; data loads once at sign-in with no refresh or conflict check, and the `rev` concurrency token in the schema is never used. Real scenario: A links three emails to an op at 09:00; B (whose tab loaded at 08:55) changes the same op's next port at 09:05 — A's emails are erased without any error. With 2–3 people per yacht (the new team feature encourages exactly this), this WILL eat data.
*Fix: use the `rev` token on save (reject stale writes), add periodic refetch or Supabase realtime, and merge-patch instead of whole-document overwrite.*

### HIGH

**H1 — PDA edits made in the document view are never saved** *(verified: `editPdaItems` is display-only)*
The PDA document says "Draft — editable" and lets you change quantities, prices, lines — but nothing writes those edits back. Send/Accept/Generate-FDA all use the original items. A corrected quote goes out uncorrected.
*Fix: persist `editPdaItems` into the document on change/Send.*

**H2 — PDA/FDA numbers can silently overwrite existing documents** *(verified)*
Numbers are assigned by counting existing documents (+ the month is hardcoded "05"). Delete a draft and the next PDA reuses an issued number — and because documents are keyed by number, it **replaces** the old one, even an Accepted one. Same-number collisions across two users do the same.
*Fix: key documents by unique id; allocate numbers from max+1 (ideally server-side); use the real month.*

**H3 — Saving while the app is still loading wipes the operations list** *(verified: `updOp` maps over `null→[]`, and skips the DB save)*
Edit an op in the first seconds after sign-in (or after a failed load) and the list empties client-side and the edit is never persisted. Also: `updOp` has no rollback/alert on save failure (unlike `addOp`), so failed saves look successful all day.
*Fix: guard `dbOps === null`, add rollback + alert.*

**H4 — Finance aggregates computed on the wrong basis** *(verified in `computeFinance`)*
Four related defects that make the Finance module misstate money:
- `fdaDocVat` ignores `actualAmount` and treats flat lines (qty = blank, the sub-300 default) as 0 → **VAT payable is understated or $0**;
- **Draft FDAs count as invoices/AR** the moment they're generated (only VAT is correctly gated on Released);
- **AR is net of VAT while the invoice total is gross** → books unbalanced by the VAT on every unpaid released FDA;
- **EUR operations are summed into USD totals at 1:1** (seed ops 2 & 6 alone misstate ~8%).
*Fix: one pass over computeFinance — same base for VAT as totals, gate on Released, book AR gross, convert currencies via the CURRENCIES table.*

**H5 — Security: four specific holes** *(verified)*
1. `account_balances` view (new ledger migration) lacks `security_invoker` → **bypasses RLS**; readable via the public API with the anon key.
2. `audit_log` is updatable/deletable by any staff → not tamper-evident.
3. Stored file data is injected into `document.write`/`href` without scheme validation → stored **XSS** (a malicious `javascript:`/crafted data URL in a document field executes in a colleague's session).
4. Office/team visibility exists only client-side; RLS grants every staff member full read of everything (acceptable for 6 trusted staff — but then say so explicitly).
*Fix: recreate view with `security_invoker=on` + revoke anon; make audit_log insert-only; sanitize URL schemes on render.*

**H6 — Edits to directory companies are silently discarded** *(verified: DB mode ignores the edits overlay)*
Editing any of the ~1,700 builder/designer directory companies (or deleting one) appears to work but writes to a dead overlay that production mode never reads — no persistence, no error, reverts on refresh.
*Fix: promote a directory company into the persisted registry on first edit.*

### MEDIUM

- **M1 — Hardcoded dates:** new ops stamp `created: 2026-05-18`; PDAs get date "2026-05-19", expiry "2026-06-02" (born expired), and Send/Accept stamps are fiction. *Fix: `new Date()` everywhere (generateFda already does it right).*
- **M2 — Canal toll off-by-one:** first slab `from:0,to:5000` bills 5,001 tons at the top rate (~+4 SDR per transit). *Fix: `from:1` or clamp slab size.*
- **M3 — Viewing the Voyage tab writes to the DB** (auto-seed on view) and **cleared voyage plans resurrect** (the "cleared" state isn't distinguishable from "never planned" and the guard dies on tab switch).
- **M4 — First-run seeding races:** two users opening an empty DB can double-seed / overwrite a fresh edit; deleting all rows resurrects seed data. *Fix: seed server-side once, gate on a flag.*
- **M5 — Op numbers from `ops.length + 39`** collide across concurrent creators; after the unique-constraint rollback the user is left editing a phantom op that never saves.
- **M6 — Company↔person contact links are never persisted** (state only — lost on refresh); Excel import coerces unparseable numbers to 0 and can sever owner links.
- **M7 — `lineFeeType` heuristic overbroad:** bare "handling"/"attendance" classifies third-party pass-through as Felix revenue; cart-built PDAs never stamp an explicit feeType. *Fix: anchor the regex, stamp feeType at every save path, add a per-line toggle.*
- **M8 — PDA discount is one shared state:** bleeds across documents/operations, alters locked Accepted totals on screen, never saved.
- **M9 — Sub-300 PDAs show $0.00** in the PDA list and FDA picker (list totals use qty×price; flat lines have qty null). Cosmetic but alarming to staff.
- **M10 — Above-300 catalog dues line** models marginal slab dues as flat tonnage×rate — can overcharge ~$13.8k on a 7,500-SCNT vessel; it also falls back to GT when SCNT is missing.

---

## What's solid

RLS is enabled on every table with sane helper functions; the anon/publishable key handling is correct; the document model gives painless schema evolution; optimistic UI with seed fallback makes the app feel instant; `addOp` does rollback properly; the sub-300 dues math (SCNT×5×SDR), marginal slab concept, tonnage resolver, and the new pass-through/agency-fee split are directionally right; recent features (journey timeline, email linking, teams) reuse the op document cleanly so they inherited persistence for free.

## Top 5 fixes, in order

1. **Finance basis pass** (H4 + M2): fdaDocVat base, Release gating, AR gross, currency conversion, slab off-by-one — this is "wrong money now".
2. **PDA lifecycle integrity** (H1 + H2 + M1 + M8): save document edits, unique ids + max-based numbering, real dates, per-document discount.
3. **Save-path safety** (H3 + M5): updOp guard + rollback, op-number collision handling.
4. **Security migration** (H5): `security_invoker` view + revoke, append-only audit_log, URL-scheme sanitizer.
5. **Concurrency** (C1): rev-token check + refetch/realtime — the deepest change; schedule it before the team grows its usage.
