import { supabase } from "@/lib/supabase-client";

export async function uploadAttachments(
  files: File[], salonId: string, caseId: string
): Promise<{ attachments: { path: string; name: string; size: number }[]; error: string | null }> {
  const attachments: { path: string; name: string; size: number }[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `${salonId}/${caseId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("support-attachments")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (uploadErr) {
      return { attachments: [], error: `Failed to upload ${file.name}: ${uploadErr.message}` };
    }
    attachments.push({ path, name: file.name, size: file.size });
  }
  return { attachments, error: null };
}
