import { supabase } from "./supabase";

// Document-model data layer. Each registry table stores a normalized header
// (id + display name) plus the full app object in a `data` jsonb column, so the
// UI round-trips its objects untouched and cross-references (y1, op1, o1…) survive.

const unwrap = (rows) => (rows || []).map((r) => r.data);

// ---- Yachts ----------------------------------------------------------------
export async function listYachts() {
  const { data, error } = await supabase.from("yachts").select("id,data").order("name");
  if (error) throw error;
  return unwrap(data);
}
export async function saveYacht(y) {
  const { error } = await supabase.from("yachts").upsert({ id: y.id, name: y.name || "Unnamed", data: y });
  if (error) throw error;
}
export async function saveYachts(list) {
  if (!list?.length) return;
  const { error } = await supabase
    .from("yachts")
    .upsert(list.map((y) => ({ id: y.id, name: y.name || "Unnamed", data: y })));
  if (error) throw error;
}
export async function deleteYacht(id) {
  const { error } = await supabase.from("yachts").delete().eq("id", id);
  if (error) throw error;
}

// ---- Persons (crew / owners / guests / officials) ---------------------------
export async function listPersons() {
  const { data, error } = await supabase.from("persons").select("id,data").order("full_name");
  if (error) throw error;
  return unwrap(data);
}
export async function savePerson(p) {
  const { error } = await supabase
    .from("persons")
    .upsert({ id: p.id, full_name: p.fullName || p.name || "Unknown", data: p });
  if (error) throw error;
}
export async function savePersons(list) {
  if (!list?.length) return;
  const { error } = await supabase
    .from("persons")
    .upsert(list.map((p) => ({ id: p.id, full_name: p.fullName || p.name || "Unknown", data: p })));
  if (error) throw error;
}
export async function deletePersonRow(id) {
  const { error } = await supabase.from("persons").delete().eq("id", id);
  if (error) throw error;
}

// ---- Companies ---------------------------------------------------------------
export async function listCompanies() {
  const { data, error } = await supabase.from("companies").select("id,data").order("name");
  if (error) throw error;
  return unwrap(data);
}
export async function saveCompany(c) {
  const { error } = await supabase.from("companies").upsert({ id: c.id, name: c.name || "Unnamed", data: c });
  if (error) throw error;
}
export async function saveCompanies(list) {
  if (!list?.length) return;
  const { error } = await supabase
    .from("companies")
    .upsert(list.map((c) => ({ id: c.id, name: c.name || "Unnamed", data: c })));
  if (error) throw error;
}
export async function deleteCompanyRow(id) {
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw error;
}

// ---- Operations ---------------------------------------------------------------
const opRow = (o) => ({
  id: o.id,
  op_number: o.opNumber,
  status: o.status || "Enquiry",
  entity: o.entity,
  data: o,
});
export async function listOperations() {
  const { data, error } = await supabase.from("operations").select("id,data").order("op_number");
  if (error) throw error;
  return unwrap(data);
}
export async function saveOperation(o) {
  const { error } = await supabase.from("operations").upsert(opRow(o));
  if (error) throw error;
}
export async function saveOperations(list) {
  if (!list?.length) return;
  const { error } = await supabase.from("operations").upsert(list.map(opRow));
  if (error) throw error;
}
export async function deleteOperationRow(id) {
  const { error } = await supabase.from("operations").delete().eq("id", id);
  if (error) throw error;
}
