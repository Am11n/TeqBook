// =====================================================
// Storage Service
// =====================================================
// Business logic for file uploads to Supabase Storage

import { supabase } from "@/lib/supabase-client";

/**
 * Upload logo to Supabase Storage
 */
export async function uploadLogo(
  file: File,
  salonId: string
): Promise<{ data: { url: string } | null; error: string | null }> {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { data: null, error: "File must be an image" };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { data: null, error: "File size must be less than 5MB" };
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${salonId}/${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("salon-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { data: null, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("salon-assets")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return { data: null, error: "Failed to get public URL" };
    }

    return { data: { url: urlData.publicUrl }, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Delete logo from Supabase Storage
 */
export async function deleteLogo(
  url: string,
  salonId: string
): Promise<{ error: string | null }> {
  try {
    // Extract file path from URL
    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `logos/${salonId}/${fileName}`;

    const { error } = await supabase.storage
      .from("salon-assets")
      .remove([filePath]);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

