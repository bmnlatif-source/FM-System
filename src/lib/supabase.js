import { createClient } from "@supabase/supabase-js";

// Vite inlines env vars at build time; the fallbacks below are the production
// project's URL and PUBLISHABLE key. Both are public by design (they ship in
// every browser anyway) — data access is protected by Row-Level Security, so
// hardcoding them here is safe and lets any host build the site with zero
// configuration. The service_role key must NEVER appear here.
const url = import.meta.env.VITE_SUPABASE_URL || "https://noaocbyytzfuvscdwmga.supabase.co";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_aql02zyhvTIFS5qe8Aq4hA_8__3mi4v";

export const isBackendConfigured = Boolean(url && anonKey);
export const supabase = isBackendConfigured ? createClient(url, anonKey) : null;
