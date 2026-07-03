-- Felix iQ ERP — database schema (v1)
-- Run order: schema.sql → policies.sql → (optional) seed.
-- Conventions: TEXT app-supplied primary keys (y1, op1, o1…) so cross-references
-- survive; exception: staff.id is the Supabase Auth uuid. Every table carries
-- created_at/updated_at maintained by the touch() trigger.

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current on every write
-- ---------------------------------------------------------------------------
create or replace function public.touch()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Agencies (3 brands under one system)
-- ---------------------------------------------------------------------------
create table if not exists public.agencies (
  code          text primary key,
  name          text not null,
  color         text,
  base_currency text default 'USD',
  active        boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

insert into public.agencies (code, name, color) values
  ('FMA', 'Felix Maritime Agency', '#0070F2'),
  ('GRA', 'German Agency',         '#0C447C'),
  ('CRA', 'Cruising Agency',       '#1D9E75')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Staff (profile row per Supabase Auth user)
-- ---------------------------------------------------------------------------
create table if not exists public.staff (
  id         uuid primary key references auth.users (id) on delete cascade,
  legacy_id  text unique,          -- s1..s6, matches seed data staffId refs
  name       text not null,
  role       text not null default 'Standard',  -- Product Manager | Standard | Ismailia | Admin | Management
  office     text default 'HQ',
  email      text unique not null,
  phone      text,
  active     boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Registries (document model: header columns + full app object in `data`)
-- ---------------------------------------------------------------------------
create table if not exists public.companies (
  id            text primary key,
  name          text not null,
  name_en       text,
  type          text,
  country       text,
  nationality   text,
  website       text,
  founded       text,
  employees     text,
  contact_email text,
  contact_phone text,
  addresses     jsonb,
  tags          jsonb,
  data          jsonb not null default '{}'::jsonb,
  created_by    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.persons (
  id              text primary key,
  full_name       text not null,
  rank            text,             -- 'Owner' distinguishes owners from crew/guests
  nationality     text,
  email           text,
  phone           text,
  passport_number text,
  passport_expiry text,
  net_worth       text,
  notes           text,
  yacht_ids       text[],
  company_id      text,
  addresses       jsonb,
  social          jsonb,
  documents       jsonb,
  tags            jsonb,
  data            jsonb not null default '{}'::jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists public.yachts (
  id                     text primary key,
  name                   text not null,
  prev_names             text[],
  type                   text,
  category               text,
  model                  text,
  status                 text,
  loa                    numeric,
  beam                   numeric,
  draught                numeric,
  gt                     numeric,
  nt                     numeric,
  hull_material          text,
  superstructure_material text,
  year_built             int,
  flag                   text,
  imo                    text,
  mmsi                   text,
  call_sign              text,
  official_number        text,
  classification_society text,
  engines                text,
  max_speed              text,
  cruising_speed         text,
  range                  text,
  fuel_capacity          text,
  guest_capacity         int,
  crew_capacity          int,
  owner_id               text,
  builder_id             text,
  exterior_designer_id   text,
  interior_designer_id   text,
  naval_architect_id     text,
  management_id          text,
  broker_id              text,
  central_agent_id       text,
  marina_id              text,
  charterable            boolean,
  charter_price          text,
  documents              jsonb,
  tags                   jsonb,
  data                   jsonb not null default '{}'::jsonb,  -- scnt/scgt/serial/forSale/askingPrice/ownership live here
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Operations — the transactional heart (enquiry → PDA → execution → FDA → close)
-- ---------------------------------------------------------------------------
create table if not exists public.operations (
  id            text primary key,
  op_number     text unique,
  agency_code   text references public.agencies (code),
  entity        text,
  status        text not null default 'Enquiry',
  yacht_id      text,
  vessel_name   text,
  vessel_loa    numeric,
  vessel_gt     numeric,
  vessel_flag   text,
  client_id     text,
  client_name   text,
  client_email  text,
  ports         text[],
  last_port     text,
  next_port     text,
  eta           text,
  etd           text,
  base_currency text default 'USD',
  staff_id      text,
  notes         text,
  lost_reason   text,
  lost_date     text,
  timestamps    jsonb,
  service_log   jsonb,
  pdas          jsonb,
  fdas          jsonb,
  voyage        jsonb,
  crew          jsonb,
  guests        jsonb,
  fal_docs      jsonb,
  totals        jsonb,
  rev           int default 0,      -- optimistic-concurrency token
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Operational registers
-- ---------------------------------------------------------------------------
create table if not exists public.crew_changes (
  id           text primary key,
  operation_id text,
  yacht        text,
  type         text,
  crew_name    text,
  role         text,
  nationality  text,
  port         text,
  change_date  text,
  phase        int,
  status       text,
  visa         text,
  visa_method  text,
  flight       text,
  gl_status    text,
  restricted   boolean default false,
  services     jsonb,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table if not exists public.transits (
  id            text primary key,
  operation_id  text,
  yacht         text,
  direction     text,
  last_port     text,
  next_port     text,
  anchorage     text,
  convoy        text,
  pilot_etb     text,
  road_pilot    text,
  inspector     text,
  transit_day   text,
  ismailia_stop text,
  ismailia_eta  text,
  ismailia_etd  text,
  status        text,
  booking_ref   text,
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.logistics (
  id            text primary key,
  operation_id  text,
  yacht         text,
  type          text,
  code          text,
  descr         text,
  port          text,
  log_date      text,
  status        text,
  value         numeric,
  currency      text,
  supplier_id   text,
  supplier      text,
  po_number     text,
  markup        numeric,
  markup_val    numeric,
  bunker_grade  text,
  qty_ordered   text,
  bunker_status text,
  data          jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.visa_batches (
  id               text primary key,
  type             text,
  code             text,
  batch_ref        text,
  date_received    text,
  total_stickers   int,
  cost_per_sticker numeric,
  available        int,
  assigned         int,
  used             int,
  expiry           text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Finance
-- ---------------------------------------------------------------------------
create table if not exists public.ga_expenses (
  id          text primary key,
  agency_code text,
  descr       text,
  amount      numeric,
  currency    text default 'USD',
  exp_date    text,
  category    text,
  data        jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists public.supplier_bills (
  id           text primary key,
  operation_id text,
  supplier_id  text,
  supplier     text,
  descr        text,
  amount       numeric,
  currency     text default 'USD',
  bill_date    text,
  due_date     text,
  status       text,
  data         jsonb,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table if not exists public.manual_journals (
  id              text primary key,
  journal_date    text,
  memo            text,
  lines           jsonb,           -- [{account, debit, credit, …}]
  override_closed boolean default false,
  created_by      text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists public.closed_periods (
  period     text primary key,     -- e.g. '2026-06'
  closed_by  text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Settings / reference
-- ---------------------------------------------------------------------------
create table if not exists public.tariffs (
  id         text primary key,
  name       text,
  config     jsonb,
  is_current boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sc_toll_table (
  id         serial primary key,
  from_scnt  numeric not null,
  to_scnt    numeric,              -- null = open-ended top band
  rate_sdr   numeric not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sdr_rates (
  rate_date  date primary key,
  rate       numeric not null,
  source     text default 'IMF',
  fetched_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.fx_settings (
  id            int primary key default 1,
  base_currency text default 'USD',
  rates         jsonb,
  history       jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  constraint fx_settings_singleton check (id = 1)
);

-- ---------------------------------------------------------------------------
-- Files & audit
-- ---------------------------------------------------------------------------
create table if not exists public.attachments (
  id          text primary key,
  bucket      text not null default 'documents',
  object_path text not null,
  entity_type text,
  entity_id   text,
  file_name   text,
  mime_type   text,
  size_bytes  bigint,
  uploaded_by text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists public.audit_log (
  id          bigserial primary key,
  actor_id    text,
  actor_name  text,
  action      text,
  entity_type text,
  entity_id   text,
  detail      jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- touch() triggers on every table
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public'
      and tablename in (
        'agencies','staff','companies','persons','yachts','operations',
        'crew_changes','transits','logistics','visa_batches',
        'ga_expenses','supplier_bills','manual_journals','closed_periods',
        'tariffs','sc_toll_table','sdr_rates','fx_settings',
        'attachments','audit_log'
      )
  loop
    execute format('drop trigger if exists touch_%I on public.%I', t, t);
    execute format(
      'create trigger touch_%I before update on public.%I for each row execute function public.touch()',
      t, t
    );
  end loop;
end $$;

-- Helpful indexes for the hot paths
create index if not exists idx_operations_status on public.operations (status);
create index if not exists idx_operations_entity on public.operations (entity);
create index if not exists idx_persons_rank      on public.persons (rank);
create index if not exists idx_yachts_owner      on public.yachts (owner_id);
create index if not exists idx_attachments_ent   on public.attachments (entity_type, entity_id);
