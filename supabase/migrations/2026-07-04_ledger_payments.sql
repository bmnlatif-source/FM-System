-- Audit B02: double-entry foundations.
-- ledger_entries stores individual postings (debits/credits); account balances
-- are DERIVED from postings, never stored as authoritative figures. payments
-- records money in/out and links to the FDA (the authoritative invoice, B12).
-- Run in the Supabase SQL editor after schema.sql + policies.sql.

create table if not exists public.ledger_entries (
  id           bigserial primary key,
  entry_date   date not null,
  journal_id   text,                        -- groups the postings of one journal
  agency_code  text references public.agencies (code),
  account_code text not null,               -- chart-of-accounts code, e.g. 4010
  account_name text,
  debit        numeric not null default 0 check (debit  >= 0),
  credit       numeric not null default 0 check (credit >= 0),
  currency     text not null default 'USD',
  fx_rate      numeric,                     -- to base currency at posting time
  operation_id text,
  fda_number   text,
  memo         text,
  created_by   text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  check (debit = 0 or credit = 0)           -- a posting is either a debit or a credit
);

create table if not exists public.payments (
  id           text primary key,
  agency_code  text references public.agencies (code),
  direction    text not null check (direction in ('In', 'Out')),
  amount       numeric not null,
  currency     text not null default 'USD',
  fx_rate      numeric,
  payment_date date,
  method       text,                        -- bank transfer, cash, cheque…
  reference    text,                        -- bank/transaction reference
  operation_id text,
  fda_number   text,                        -- FDA is the authoritative invoice (audit B12)
  supplier_id  text,
  client_name  text,
  status       text default 'Confirmed',
  notes        text,
  created_by   text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

drop trigger if exists touch_ledger_entries on public.ledger_entries;
create trigger touch_ledger_entries before update on public.ledger_entries
  for each row execute function public.touch();
drop trigger if exists touch_payments on public.payments;
create trigger touch_payments before update on public.payments
  for each row execute function public.touch();

alter table public.ledger_entries enable row level security;
alter table public.payments       enable row level security;

drop policy if exists ledger_entries_staff_all on public.ledger_entries;
create policy ledger_entries_staff_all on public.ledger_entries
  for all using (is_staff()) with check (is_staff());
drop policy if exists payments_staff_all on public.payments;
create policy payments_staff_all on public.payments
  for all using (is_staff()) with check (is_staff());

create index if not exists idx_ledger_account on public.ledger_entries (account_code, entry_date);
create index if not exists idx_ledger_journal on public.ledger_entries (journal_id);
create index if not exists idx_payments_fda   on public.payments (fda_number);

-- Derived balances view: this is what "accounts_ledger" style balances come from.
create or replace view public.account_balances as
select agency_code, account_code, max(account_name) as account_name,
       sum(debit) as total_debit, sum(credit) as total_credit,
       sum(debit) - sum(credit) as balance
from public.ledger_entries
group by agency_code, account_code;
