import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseServiceKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

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
  if (!supabase) return null;
  try {
    // Check if code exists
    const { data: existing, error: fetchErr } = await supabase
      .from("qrytube_codes")
      .select("id, total_scans")
      .eq("id", codeId)
      .single();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      console.error("[Supabase Error] Fetching code:", fetchErr.message);
    }

    if (existing) {
      const newTotal = existing.total_scans + (incrementScan ? 1 : 0);
      const { error: updateErr } = await supabase
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
      const { error: insertErr } = await supabase
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
  if (!supabase) return null;
  try {
    const { error } = await supabase
      .from("qrytube_scans")
      .insert(scan);

    if (error) {
      console.error("[Supabase Error] Inserting scan log:", error.message);
    }
  } catch (err: any) {
    console.error("[Supabase Error] dbInsertScan critical failure:", err.message);
  }
}
