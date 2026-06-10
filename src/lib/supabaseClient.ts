/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

// Retrieve environment variables from Vite's import.meta.env or use fallback credentials
const supabaseUrl = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  "https://empqrfflwdhwmmlrqais.supabase.co";

const supabaseAnonKey = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtcHFyZmZsd2Rod21tbHJxYWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDA3MzAsImV4cCI6MjA5NjYxNjczMH0.aVxvYaYayaVorYKQUGAuOpuwx2ExQ3kMEz5AMhUFxrI";

// Check if variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials are missing. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env settings."
  );
}

// Create and export the Supabase client safely with a Proxy to prevent runtime throwing on empty or invalid credentials during import
let supabaseInstance: any = null;
try {
  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http")) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.error("Failed to initialize Supabase client instance during startup:", e);
}

export const supabase: any = new Proxy({} as any, {
  get(target, prop) {
    if (!supabaseInstance) {
      throw new Error("Supabase is not fully configured. Please set a valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your browser env.");
    }
    return supabaseInstance[prop];
  }
});

/**
 * Generates a high-entropy random alphanumeric slug of the specified length.
 */
export function generateUniqueSlug(length: number = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Creates a new dynamic QR code record in Supabase database.
 * Auto-generates a unique 6-character slug and attempts RLS-safe insertion.
 * Handles collisions with up to 3 recursive mutative attempts.
 */
export async function createDynamicQR(originalUrl: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!originalUrl) {
      return { success: false, error: "Original URL is required" };
    }

    let slug = generateUniqueSlug(6);
    let attempts = 0;
    let inserted = false;
    let finalResult: any = null;

    while (!inserted && attempts < 3) {
      const { data, error } = await supabase
        .from("dynamic_qr")
        .insert({
          original_url: originalUrl.trim(),
          slug: slug,
          clicks: 0
        })
        .select()
        .single();

      if (error) {
        // Postgres error code 23505 is a unique violation error
        if (error.code === "23505" || error.message?.toLowerCase().includes("duplicate")) {
          slug = generateUniqueSlug(6);
          attempts++;
        } else {
          return { success: false, error: error.message };
        }
      } else {
        inserted = true;
        finalResult = data;
      }
    }

    if (!inserted) {
      return { success: false, error: "Failed to generate a unique QR slug due to collision limits." };
    }

    return { success: true, data: finalResult };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

/**
 * Resolves a unique slug into the target destination URL and triggers an asynchronous update to increment click metrics.
 */
export async function getOriginalUrlAndTrackClick(slug: string): Promise<{ originalUrl: string | null; qrId?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("dynamic_qr")
      .select("id, original_url, clicks")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return { originalUrl: null, error: error?.message || "Link code not found" };
    }

    // Fire-and-forget update to keep redirections ultra quick
    supabase
      .from("dynamic_qr")
      .update({ clicks: (data.clicks || 0) + 1 })
      .eq("slug", slug)
      .then(({ error: upError }) => {
        if (upError) console.warn("Could not increment click telemetry:", upError);
      });

    return { originalUrl: data.original_url, qrId: data.id };
  } catch (err: any) {
    return { originalUrl: null, error: err.message || "An unexpected error occurred" };
  }
}

/**
 * Tracks detailed visit metrics in the qr_visits table.
 */
export async function trackVisitorVisit(
  qrId: any,
  country: string,
  deviceType: string,
  browser: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!qrId) return { success: false, error: "qr_id is required" };

    const { data, error } = await supabase
      .from("qr_visits")
      .insert({
        qr_id: qrId,
        country: country || "Unknown",
        device_type: deviceType || "Desktop",
        browser: browser || "Other"
      })
      .select();

    if (error) {
      console.error("Failed to insert visitor log:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Error during visitor log insertion:", err);
    return { success: false, error: err.message };
  }
}

