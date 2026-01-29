// =====================================================
// Template Service
// =====================================================
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

// =====================================================
// Template CRUD
// =====================================================

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

// =====================================================
// Template Sharing
// =====================================================

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

// =====================================================
// Template Import/Export
// =====================================================

/**
 * Export a template to JSON format
 */
export async function exportTemplate(
  templateId: string
): Promise<{ data: TemplateExport | null; error: string | null }> {
  try {
    const { data: template, error } = await getTemplate(templateId);

    if (error || !template) {
      return { data: null, error: error || "Template not found" };
    }

    const exportData: TemplateExport = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      template: {
        name: template.name,
        description: template.description,
        type: template.type,
        data: template.data,
      },
    };

    return { data: exportData, error: null };
  } catch (error) {
    logError("Exception exporting template", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Import a template from JSON format
 */
export async function importTemplate(
  input: ImportTemplateInput
): Promise<TemplateResult> {
  try {
    // Validate version
    if (input.templateData.version !== "1.0") {
      return { data: null, error: "Unsupported template version" };
    }

    // Create new template
    const result = await createTemplate({
      salonId: input.salonId,
      name: input.name || input.templateData.template.name,
      description: input.templateData.template.description || undefined,
      type: input.templateData.template.type,
      visibility: "private",
      data: input.templateData.template.data,
    });

    if (result.data) {
      logInfo("Template imported", { templateId: result.data.id });
    }

    return result;
  } catch (error) {
    logError("Exception importing template", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// =====================================================
// Apply Templates
// =====================================================

/**
 * Apply a service template to a salon
 */
export async function applyServiceTemplate(
  templateId: string,
  salonId: string
): Promise<{ created: number; error: string | null }> {
  try {
    const { data: template, error: templateError } = await getTemplate(templateId);

    if (templateError || !template || template.type !== "service") {
      return { created: 0, error: templateError || "Invalid service template" };
    }

    const serviceData = template.data as ServiceTemplateData;
    let created = 0;

    for (const service of serviceData.services) {
      const { error } = await supabase.from("services").insert({
        salon_id: salonId,
        name: service.name,
        description: service.description,
        duration_minutes: service.duration_minutes,
        price_cents: service.price_cents,
        category: service.category,
        color: service.color,
        is_active: true,
      });

      if (!error) created++;
    }

    logInfo("Service template applied", { templateId, salonId, created });
    return { created, error: null };
  } catch (error) {
    logError("Exception applying service template", error);
    return { created: 0, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Apply a shift schedule template to an employee
 */
export async function applyShiftTemplate(
  templateId: string,
  employeeId: string
): Promise<{ created: number; error: string | null }> {
  try {
    const { data: template, error: templateError } = await getTemplate(templateId);

    if (templateError || !template || template.type !== "shift_schedule") {
      return { created: 0, error: templateError || "Invalid shift template" };
    }

    const shiftData = template.data as ShiftScheduleTemplateData;
    let created = 0;

    // Delete existing shifts for employee
    await supabase.from("shifts").delete().eq("employee_id", employeeId);

    // Create new shifts from template
    for (const shift of shiftData.shifts) {
      const { error } = await supabase.from("shifts").insert({
        employee_id: employeeId,
        weekday: shift.weekday,
        start_time: shift.start_time,
        end_time: shift.end_time,
      });

      if (!error) created++;
    }

    logInfo("Shift template applied", { templateId, employeeId, created });
    return { created, error: null };
  } catch (error) {
    logError("Exception applying shift template", error);
    return { created: 0, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Get template type display name
 */
export function getTemplateTypeLabel(type: TemplateType): string {
  const labels: Record<TemplateType, string> = {
    staff: "Staff Roles",
    service: "Services",
    shift_schedule: "Shift Schedule",
  };
  return labels[type];
}

/**
 * Get visibility display name
 */
export function getVisibilityLabel(visibility: TemplateVisibility): string {
  const labels: Record<TemplateVisibility, string> = {
    private: "Private",
    shared: "Shared",
    public: "Public",
  };
  return labels[visibility];
}

/**
 * Validate template data structure
 */
export function validateTemplateData(
  type: TemplateType,
  data: unknown
): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Data must be an object" };
  }

  switch (type) {
    case "staff": {
      const staffData = data as Partial<StaffTemplateData>;
      if (!Array.isArray(staffData.roles)) {
        return { valid: false, error: "Staff template must have roles array" };
      }
      break;
    }
    case "service": {
      const serviceData = data as Partial<ServiceTemplateData>;
      if (!Array.isArray(serviceData.services)) {
        return { valid: false, error: "Service template must have services array" };
      }
      break;
    }
    case "shift_schedule": {
      const shiftData = data as Partial<ShiftScheduleTemplateData>;
      if (!Array.isArray(shiftData.shifts)) {
        return { valid: false, error: "Shift template must have shifts array" };
      }
      break;
    }
  }

  return { valid: true };
}
