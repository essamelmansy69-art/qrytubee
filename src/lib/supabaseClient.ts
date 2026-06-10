/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

// Retrieve environment variables from Vite's import.meta.env
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

// Check if variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials are missing. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env settings."
  );
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
export async function getOriginalUrlAndTrackClick(slug: string): Promise<{ originalUrl: string | null; error?: string }> {
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

    return { originalUrl: data.original_url };
  } catch (err: any) {
    return { originalUrl: null, error: err.message || "An unexpected error occurred" };
  }
}

