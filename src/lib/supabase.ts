import { createClient } from "@supabase/supabase-js";

export function getSupabaseUrl(): string {
  return process.env.SUPABASE_URL || "https://empqrfflwdhwmmlrqais.supabase.co";
}

export function getSupabaseServiceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || "";
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceKey();
  return !!(url && key);
}

let supabaseClient: any = null;

export function getSupabase() {
  if (!supabaseClient && isSupabaseConfigured()) {
    supabaseClient = createClient(getSupabaseUrl(), getSupabaseServiceKey(), {
      auth: {
        persistSession: false,
      },
    });
  }
  return supabaseClient;
}

// Database Schema interfaces
export interface SupabaseCode {
  id: string; // The modern code / tracking ID (tid)
  created_at?: string;
  target: string;
  platform: string;
  total_scans: number;
}

export interface SupabaseScan {
  id?: string;
  code_id: string;
  timestamp: string;
  device: string;
  os: string;
  country: string;
  platform: string;
  target: string;
}

/**
 * Ensures a tracking code exists or creates/updates it in Supabase
 */
export async function dbUpsertCode(codeId: string, target: string, platform: string, incrementScan = true) {
  const client = getSupabase();
  if (!client) return null;
  try {
    // Check if code exists
    const { data: existing, error: fetchErr } = await client
      .from("qrytube_codes")
      .select("id, total_scans")
      .eq("id", codeId)
      .single();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      console.error("[Supabase Error] Fetching code:", fetchErr.message);
    }

    if (existing) {
      const newTotal = existing.total_scans + (incrementScan ? 1 : 0);
      const { error: updateErr } = await client
        .from("qrytube_codes")
        .update({
          target,
          platform,
          total_scans: newTotal,
        })
        .eq("id", codeId);

      if (updateErr) {
        console.error("[Supabase Error] Updating code scans:", updateErr.message);
      }
    } else {
      const { error: insertErr } = await client
        .from("qrytube_codes")
        .insert({
          id: codeId,
          target,
          platform,
          total_scans: incrementScan ? 1 : 0,
        });

      if (insertErr) {
        console.error("[Supabase Error] Inserting new code:", insertErr.message);
      }
    }
  } catch (err: any) {
    console.error("[Supabase Error] dbUpsertCode critical failure:", err.message);
  }
}

/**
 * Inserts a tracking scan event to Supabase
 */
export async function dbInsertScan(scan: SupabaseScan) {
  const client = getSupabase();
  if (!client) return null;
  try {
    const { error } = await client
      .from("qrytube_scans")
      .insert(scan);

    if (error) {
      console.error("[Supabase Error] Inserting scan log:", error.message);
    }
  } catch (err: any) {
    console.error("[Supabase Error] dbInsertScan critical failure:", err.message);
  }
}
