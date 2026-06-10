/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";
import { detectVisitorSpecs, fetchVisitorCountry } from "../utils";

// Retrieve environment variables using Vite's static import.meta.env.
// Statically referenced to ensure Vite correctly replaces them during production builds (e.g. on GitHub, Vercel, Netlify, or active host envs).
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  "https://empqrfflwdhwmmlrqais.supabase.co";

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
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

// Asynchronous promise barrier to secure configuration sync before database queries execute
let resolveInitPromise: () => void = () => {};
export const initPromise = new Promise<void>((resolve) => {
  resolveInitPromise = resolve;
});

// Check with Express server asynchronously for actual live backend credentials (in case build-time env vars were blank)
let isInitializing = false;
export async function initSupabaseRuntime(): Promise<void> {
  if (isInitializing) return;
  isInitializing = true;
  try {
    const res = await fetch("/api/supabase-config");
    if (res.ok) {
      const config = await res.json();
      if (config.supabaseUrl && config.supabaseAnonKey) {
        console.log("[Supabase Config Proxy] Successfully retrieved active runtime credentials from Express server.");
        supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey);
      }
    }
  } catch (err) {
    // Fail silently when server endpoint is unavailable (e.g. built statically on GitHub Pages)
  } finally {
    isInitializing = false;
    resolveInitPromise();
  }
}

// Instantly trigger dynamic credentials sync from active container
initSupabaseRuntime().catch(() => {});

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

    // Await configurations load before executing Supabase requests
    await initPromise;

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
    // Await configurations load before executing Supabase requests
    await initPromise;

    const { data, error } = await supabase
      .from("dynamic_qr")
      .select("id, original_url, clicks")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return { originalUrl: null, error: error?.message || "Link code not found" };
    }

    // Await click metric increment to guarantee update is registered before redirection
    try {
      const { error: clickError } = await supabase
        .from("dynamic_qr")
        .update({ clicks: (data.clicks || 0) + 1 })
        .eq("slug", slug);
      if (clickError) {
        console.error("[Supabase Click Increment Error]:", clickError);
      }
    } catch (upError) {
      console.warn("Could not increment click telemetry:", upError);
    }

    // Direct awaited insertion to ensure registration completes before page navigation triggers
    try {
      const { browser, device_type } = detectVisitorSpecs();
      
      let country = "Unknown";
      try {
        country = await fetchVisitorCountry();
      } catch (_) {}

      const { error: insertErr } = await supabase
        .from("qr_visits")
        .insert({
          qr_id: data.id,
          country: country || "Unknown",
          device_type: device_type || "Desktop",
          browser: browser || "Other"
        });

      if (insertErr) {
        console.error("🔴 [Supabase Insert Visit Error] Full Debugging Object:", {
          message: insertErr.message,
          code: insertErr.code,
          details: insertErr.details,
          hint: insertErr.hint
        });
      } else {
        console.log("🟢 [Supabase Resolution] Visitor visit successfully saved to public.qr_visits table!");
      }
    } catch (vErr) {
      console.warn("Visitor logging exception catch block:", vErr);
    }

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

    // Await configurations load before executing Supabase requests
    await initPromise;

    const { error } = await supabase
      .from("qr_visits")
      .insert({
        qr_id: qrId,
        country: country || "Unknown",
        device_type: deviceType || "Desktop",
        browser: browser || "Other"
      });

    if (error) {
      console.error("Failed to insert visitor log:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error during visitor log insertion:", err);
    return { success: false, error: err.message };
  }
}

