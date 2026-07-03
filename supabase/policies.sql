-- Felix iQ ERP — Row-Level Security (v1)
-- Run AFTER schema.sql.
--
-- Model: the anon key ships in the browser, so RLS is the real gate. Every
-- read/write requires a signed-in, active Felix staff account. Management
-- (Product Manager / Admin / Management) additionally controls staff records
-- and period closing.

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.staff s
    where s.id = auth.uid() and s.active
  );
$$;

create or replace function public.is_mgmt()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.staff s
    where s.id = auth.uid() and s.active
      and s.role in ('Product Manager', 'Admin', 'Management')
  );
$$;

create or replace function public.my_office()
returns text language sql stable security definer set search_path = public as $$
  select s.office from public.staff s where s.id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------
alter table public.agencies        enable row level security;
alter table public.staff           enable row level security;
alter table public.companies       enable row level security;
alter table public.persons         enable row level security;
alter table public.yachts          enable row level security;
alter table public.operations      enable row level security;
alter table public.crew_changes    enable row level security;
alter table public.transits        enable row level security;
alter table public.logistics       enable row level security;
alter table public.visa_batches    enable row level security;
alter table public.ga_expenses     enable row level security;
alter table public.supplier_bills  enable row level security;
alter table public.manual_journals enable row level security;
alter table public.closed_periods  enable row level security;
alter table public.tariffs         enable row level security;
alter table public.sc_toll_table   enable row level security;
alter table public.sdr_rates       enable row level security;
alter table public.fx_settings     enable row level security;
alter table public.attachments     enable row level security;
alter table public.audit_log       enable row level security;

-- ---------------------------------------------------------------------------
-- Staff table: everyone reads (needed for names/roles in the UI), each user can
-- read their own profile pre-activation; only management writes.
-- ---------------------------------------------------------------------------
drop policy if exists staff_select on public.staff;
create policy staff_select on public.staff
  for select using (is_staff() or id = auth.uid());

drop policy if exists staff_insert on public.staff;
create policy staff_insert on public.staff
  for insert with check (is_mgmt());

drop policy if exists staff_update on public.staff;
create policy staff_update on public.staff
  for update using (is_mgmt()) with check (is_mgmt());

drop policy if exists staff_delete on public.staff;
create policy staff_delete on public.staff
  for delete using (is_mgmt());

-- ---------------------------------------------------------------------------
-- Management-only tables
-- ---------------------------------------------------------------------------
drop policy if exists closed_periods_select on public.closed_periods;
create policy closed_periods_select on public.closed_periods
  for select using (is_staff());

drop policy if exists closed_periods_write on public.closed_periods;
create policy closed_periods_write on public.closed_periods
  for all using (is_mgmt()) with check (is_mgmt());

-- ---------------------------------------------------------------------------
-- All other tables: any active staff member can read and write.
-- (Finer-grained module permissions come later; today's runtime gate is the
-- isMgmt operations filter in the app + these staff-wide policies.)
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  for t in
    select unnest(array[
      'agencies','companies','persons','yachts','operations',
      'crew_changes','transits','logistics','visa_batches',
      'ga_expenses','supplier_bills','manual_journals',
      'tariffs','sc_toll_table','sdr_rates','fx_settings',
      'attachments','audit_log'
    ])
  loop
    execute format('drop policy if exists %I_staff_all on public.%I', t, t);
    execute format(
      'create policy %I_staff_all on public.%I for all using (is_staff()) with check (is_staff())',
      t, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Storage: documents bucket (create the bucket in the dashboard or via the
-- setup script, then these policies apply)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists documents_staff_read on storage.objects;
create policy documents_staff_read on storage.objects
  for select using (bucket_id = 'documents' and is_staff());

drop policy if exists documents_staff_write on storage.objects;
create policy documents_staff_write on storage.objects
  for insert with check (bucket_id = 'documents' and is_staff());

drop policy if exists documents_staff_update on storage.objects;
create policy documents_staff_update on storage.objects
  for update using (bucket_id = 'documents' and is_staff());

drop policy if exists documents_staff_delete on storage.objects;
create policy documents_staff_delete on storage.objects
  for delete using (bucket_id = 'documents' and is_staff());
