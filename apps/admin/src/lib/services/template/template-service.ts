// Task Group 37: Shared Staff Templates
// Service for managing staff and service templates

import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type {
  Template,
  TemplateType,
  TemplateVisibility,
  CreateTemplateInput,
  UpdateTemplateInput,
  ShareTemplateInput,
  ImportTemplateInput,
  TemplateExport,
  TemplateListFilter,
  TemplateListResult,
  TemplateResult,
  StaffTemplateData,
  ServiceTemplateData,
  ShiftScheduleTemplateData,
} from "@/lib/types/templates";

/**
 * Create a new template
 */
export async function createTemplate(
  input: CreateTemplateInput
): Promise<TemplateResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("templates")
      .insert({
        salon_id: input.salonId,
        name: input.name,
        description: input.description || null,
        type: input.type,
        visibility: input.visibility || "private",
        data: input.data,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    logInfo("Template created", { templateId: data.id, type: input.type });
    return { data: data as Template, error: null };
  } catch (error) {
    logError("Exception creating template", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get a template by ID
 */
export async function getTemplate(templateId: string): Promise<TemplateResult> {
  try {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Template, error: null };
  } catch (error) {
    logError("Exception getting template", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * List templates for a salon
 */
export async function listTemplates(
  salonId: string,
  filter?: TemplateListFilter
): Promise<TemplateListResult> {
  try {
    let query = supabase
      .from("templates")
      .select("*")
      .or(`salon_id.eq.${salonId},visibility.eq.public`);

    if (filter?.type) {
      query = query.eq("type", filter.type);
    }

    if (filter?.visibility) {
      query = query.eq("visibility", filter.visibility);
    }

    // Include shared templates
    if (filter?.includeShared) {
      const { data: shares } = await supabase
        .from("template_shares")
        .select("template_id")
        .eq("shared_with_salon_id", salonId);

      const sharedIds = (shares || []).map((s) => s.template_id);
      if (sharedIds.length > 0) {
        query = query.or(`id.in.(${sharedIds.join(",")})`);
      }
    }

    const { data, error } = await query.order("name", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Template[], error: null };
  } catch (error) {
    logError("Exception listing templates", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Update a template
 */
export async function updateTemplate(
  input: UpdateTemplateInput
): Promise<TemplateResult> {
  try {
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.visibility !== undefined) updates.visibility = input.visibility;
    if (input.data !== undefined) updates.data = input.data;

    const { data, error } = await supabase
      .from("templates")
      .update(updates)
      .eq("id", input.templateId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    logInfo("Template updated", { templateId: input.templateId });
    return { data: data as Template, error: null };
  } catch (error) {
    logError("Exception updating template", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(
  templateId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", templateId);

    if (error) {
      return { success: false, error: error.message };
    }

    logInfo("Template deleted", { templateId });
    return { success: true, error: null };
  } catch (error) {
    logError("Exception deleting template", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Share a template with other salons
 */
export async function shareTemplate(
  input: ShareTemplateInput
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Create share records
    const shares = input.salonIds.map((salonId) => ({
      template_id: input.templateId,
      shared_with_salon_id: salonId,
      shared_by: user.id,
      can_edit: input.canEdit || false,
    }));

    const { error } = await supabase
      .from("template_shares")
      .upsert(shares, { onConflict: "template_id,shared_with_salon_id" });

    if (error) {
      return { success: false, error: error.message };
    }

    // Update template visibility if it was private
    await supabase
      .from("templates")
      .update({ visibility: "shared" })
      .eq("id", input.templateId)
      .eq("visibility", "private");

    logInfo("Template shared", {
      templateId: input.templateId,
      sharedWith: input.salonIds.length,
    });
    return { success: true, error: null };
  } catch (error) {
    logError("Exception sharing template", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Unshare a template from a salon
 */
export async function unshareTemplate(
  templateId: string,
  salonId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from("template_shares")
      .delete()
      .eq("template_id", templateId)
      .eq("shared_with_salon_id", salonId);

    if (error) {
      return { success: false, error: error.message };
    }

    logInfo("Template unshared", { templateId, salonId });
    return { success: true, error: null };
  } catch (error) {
    logError("Exception unsharing template", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
