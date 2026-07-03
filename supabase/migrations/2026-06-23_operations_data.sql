-- Add the document-model `data` column to operations. The app persists the
-- whole operation object here (see src/lib/db.js) and leaves the FK columns
-- null; the header columns remain for queries/RLS/reporting.
alter table public.operations
  add column if not exists data jsonb not null default '{}'::jsonb;
