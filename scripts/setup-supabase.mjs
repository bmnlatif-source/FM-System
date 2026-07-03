// Felix iQ ERP — one-time staff auth bootstrap.
//
// Creates the 6 Felix staff accounts in Supabase Auth and their matching
// profile rows in public.staff. Safe to re-run: existing accounts are skipped.
//
// Usage:
//   1. Copy .env.example to .env and fill in VITE_SUPABASE_URL and
//      SUPABASE_SERVICE_ROLE_KEY (dashboard → Project Settings → API).
//   2. Run schema.sql + policies.sql in the Supabase SQL editor first.
//   3. node scripts/setup-supabase.mjs
//
// The service-role key is admin-level: local use only, never in the frontend.

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";

// Minimal .env loader (no dotenv dependency)
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env — aborting.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const TEMP_PASSWORD = "Felix-iQ-2026";
const STAFF = [
  { legacy_id: "s1", name: "Sarah Ahmed Salaheldin", role: "Product Manager", office: "HQ",       email: "sarah@felix-eg.com" },
  { legacy_id: "s2", name: "Bahi Naguib",            role: "Standard",        office: "HQ",       email: "bahi@felix-eg.com" },
  { legacy_id: "s3", name: "Capt. Mohamed Mostafa",  role: "Standard",        office: "HQ",       email: "mohamed@felix-eg.com" },
  { legacy_id: "s4", name: "Basent Naguib",          role: "Standard",        office: "HQ",       email: "basent@felix-eg.com" },
  { legacy_id: "s5", name: "Amany El Yamany",        role: "Standard",        office: "HQ",       email: "amany@felix-eg.com" },
  { legacy_id: "s6", name: "Mostafa",                role: "Ismailia",        office: "Ismailia", email: "ismailia@felix-eg.com" },
];

async function findUserByEmail(email) {
  // paginate through users (6 accounts — one page is plenty, but be safe)
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => (u.email || "").toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

for (const s of STAFF) {
  const email = s.email.toLowerCase();
  let user = await findUserByEmail(email);
  if (user) {
    console.log(`✓ auth user exists: ${email}`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: TEMP_PASSWORD,
      email_confirm: true,
      user_metadata: { name: s.name },
    });
    if (error) throw new Error(`createUser(${email}): ${error.message}`);
    user = data.user;
    console.log(`+ created auth user: ${email}`);
  }

  const { error: upErr } = await admin.from("staff").upsert({
    id: user.id,
    legacy_id: s.legacy_id,
    name: s.name,
    role: s.role,
    office: s.office,
    email,
    active: true,
  });
  if (upErr) throw new Error(`staff upsert(${email}): ${upErr.message}`);
  console.log(`  → staff profile ${s.legacy_id} (${s.role}, ${s.office})`);
}

console.log(`\nDone. All 6 accounts ready — temp password: ${TEMP_PASSWORD}`);
console.log("Ask everyone to change their password after first login.");
