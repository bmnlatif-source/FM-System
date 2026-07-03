import { createClient } from "@supabase/supabase-js";

// Vite inlines these at build time. When they're missing (no .env yet) the app
// runs in local-prototype mode: seed data only, no auth, nothing persists.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isBackendConfigured = Boolean(url && anonKey);
export const supabase = isBackendConfigured ? createClient(url, anonKey) : null;
