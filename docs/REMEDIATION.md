# Felix iQ — Audit Remediation Tracker

Status of every item in the PRD Remediation Backlog (`Felix_iQ_Remediation_Backlog.xlsx`),
mapped to the **actual built system** (`src/App.jsx` + `supabase/`). The audit reviewed
the PRD; where the implementation already satisfied a finding it is marked accordingly.

Legend: ✅ fixed in code · 🟡 default implemented, needs human sign-off · 📋 documented/scoped · ⏳ deferred

| ID | Finding | Status | What was done |
|----|---------|--------|---------------|
| B01 | Pass-through vs agency fee; net revenue | 🟡 | Every PDA/FDA line carries `feeType` ("Disbursement" \| "Agency fee"), defaulted by service-name heuristic, overridable per line. `computeFinance` reports `netAgencyIncome` (fee lines only) and `passThroughBilled` separately; Finance → Sales shows the split with a pending-sign-off banner. **Needs: Finance Director / accountant sign-off** (Open Question 1). |
| B02 | Double-entry ledger + payments tables | ✅ | Migration `2026-07-04_ledger_payments.sql`: `ledger_entries` (postings, debit XOR credit check), `payments` (linked to FDA), `account_balances` view derives balances from postings. App-side posting flow is future work. |
| B03 | Complete chart of accounts | 🟡 | COA now includes 1220 VAT Receivable, 2040 Advances from Principals (client funds, fed by live pass-through), 3030 CTA, 4910 FX Gain/(Loss). **Needs: Finance sign-off on the full account list** (Open Question 2). |
| B04 | vessels.flag + private/commercial-charter | ✅ | Flag existed on yachts; added per-operation **Charter status** (Auto-from-vessel / Private / Commercial charter) stored as `op.charterStatus` — the field VAT/captain/visa rules read. |
| B05 | PDA rate/total fields + line port attribution | ✅ (partial) | Sub-300 PDAs now persist `sdrRate`, `egpRate`, `scnt`, and computed `total` on the document. Per-line `port` attribution deferred until multi-port PDAs exist in practice. |
| B06 | Missing fields: supply orders, visa batch status, restricted nationalities | ✅ | Bunker orders capture fuel grade + qty ordered (+ pipeline status); non-bunker orders take a customs entry no.; visa batches have a derived status (Active/Depleted/Expired); **new crew changes derive `restricted` from the nationality list instead of defaulting to false** (bug fix). Restricted list still a constant — making it admin-editable is Phase 1 follow-up. |
| B07 | Permission model rework | ✅ (config) / ⏳ (enforcement) | Matrix: added **Service Log** row with Field Operator = Write (lockout fixed); **Access Control is Administrator-only** (PM removed); Full vs Write defined in role descriptions. Runtime enforcement remains RLS + the `isMgmt` ops filter — full field-level RBAC is a Phase 1 build item. |
| B08 | Marginal slab math + worked examples | ✅ | `calcToll` was already marginal; the table now states **"Marginal (progressive)"** explicitly, names **SCNT** as the basis (not SCGT/GT), and worked examples include cross-boundary profiles (7,500 and 24,000 SCNT). |
| B09 | Conflicting <300 GT toll methods | ✅ | The SCA formula (L×W×D)/2.82 ×5 ×SDR was already the implemented calculator; the USD/ton card is now explicitly scoped as a documented exception **not** used for <300 T dues. |
| B10 | FX consolidation policy | 🟡 | Policy stated on the Balance Sheet tab: closing rate for monetary B/S, period-average for P&L, residual → CTA (3030), realised → FX Gain/(Loss) (4910). **Needs: Finance sign-off** (Open Question 5). |
| B11 | Transit event→status mapping + KPI restatement | ✅ | Event→status chain enumerated in the Transit view incl. the Ismailia branch and NB/SB mirroring; KPI restated as **"status reflects the last logged event"**; AIS = Phase 2. |
| B12 | FDA↔invoice relationship | ✅ | Stated in Finance: **the FDA is the authoritative invoice**; its status/payment state is the single source of truth. No separate invoice object exists in the app. |
| B13 | VAT by charter status, not flag-only | 🟡 | Bunker VAT note now reads: foreign-flag *private* in transit = exempt; Egyptian-flag **or commercial charter** = 14%. `op.charterStatus` (B04) carries the needed dimension. **Needs: Egyptian tax advisor confirmation** (Open Question 11). |
| B14 | Captain-replacement rule enforcement | ⏳ | Warning InfoStrip exists. Blocking Active→Completed and `persons.holds_poa` need the crew-change module linked to live ops first (it still runs on local seed state). Scheduled with the persistence work. |
| B15 | Entity-namespaced IDs | ✅ | New crew changes → `{ENTITY}-CC-{YEAR}-{SEQ}`, new supply orders → `{ENTITY}-LOG-{YEAR}-{SEQ}`, with an agency selector on both forms. |
| B16 | Per-rule acceptance criteria | ✅ | See "Acceptance criteria" below. |
| B17 | "80+ services" wording | ✅ | Footer now reads "80+ catalogued services" (service catalogue, not microservices). Architecture remains a modular monolith — appropriate at ≤50 users. |
| B18 | Government Letter Arabic output | 📋 | Scoped: GL documents get Arabic output in v1 while the UI stays English. Build with the FAL/GL document work. |
| B19 | Cross-slab vessel profiles in acceptance test | ✅ | Cross-boundary examples added to the Tariff view + acceptance criteria below. |
| B20 | Tokenised PDA-acceptance endpoint | ⏳ | Phase 2, per audit. Design noted: scoped, expiring, single-use token + audit logging. |
| B21 | Localization / RTL / bilingual PDF | ⏳ | Phase 2, per audit (B18 exception noted). |

## Decisions still needed (from the audit's "Open Questions" sheet)

The audit's recommended defaults are implemented but these need human sign-off
before the finance build is treated as final:

1. **Pass-through vs revenue treatment** — Finance Director / external accountant (B01)
2. **Full chart of accounts** — Finance (B03)
3. **FX rate policy** — Finance (B10)
4. **VAT treatment by service + charter status** — Egyptian tax advisor (B13)
5. **Remaining PRD sections §§13–15** — PRD owner (audit covered through the truncation point)

## Acceptance criteria (Given / When / Then)

**Canal dues < 300 T (ER-PDA/Tariff)**
- Given a vessel with L=30, W=7, D=2 and SDR=1.3682, when a sub-300 PDA is built,
  then SCNT = (30×7×2)/2.82 = 148.9 and the dues line Rate = 148.9 × 5 × 1.3682 ≈ $1,018.7,
  and the saved PDA carries `sdrRate=1.3682`, `egpRate`, `scnt`, and `total`.
- Given the SDR is outside 1.0–2.0, when entered in the calc bar, then it is flagged.

**Marginal toll ≥ 300 SCNT (B08/B19)**
- Given SCNT = 7,500, when the toll is calculated, then slab 1 charges 5,000 tons × 11.98
  and slab 2 charges 2,500 tons × 7.94 (never 7,500 × any single rate).
- Given SCNT = 24,000, when calculated, then exactly 5,000 + 5,000 + 10,000 + 4,000 tons
  are charged at their own slab rates and the breakdown chips show all four slabs.

**Restricted nationality (ER-CC-03)**
- Given a new crew change with nationality "Russian", when saved, then the row is flagged
  ⚠ RESTRICTED and a GL draft is required — regardless of any manual input.

**Entity namespacing (B15)**
- Given a new GRA crew change in 2026, when saved, then its ref matches `GRA-CC-2026-NNN`
  and cannot collide with an FMA ref.

**Pass-through classification (B01)**
- Given an FDA containing "Canal transit dues" $10,000 and "Agency fee" $800, when finance
  is computed, then net agency income increases by $800 only and $10,000 lands in
  pass-through / Advances from Principals — while gross billings show $10,800.

**Charter status → VAT (B04/B13)**
- Given a foreign-flag vessel with charterable=true and no per-op override, when an op is
  created, then `charterStatus="Commercial charter"` and VAT-liable treatment applies to
  the relevant services; overriding to "Private" restores the transit exemption.

**Access control (B07)**
- Given the permission matrix, then Field Operator has Write on Service Log while
  Operations stays Read; and only Administrator has any access to Access Control.
