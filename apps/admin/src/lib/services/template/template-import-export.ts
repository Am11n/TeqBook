import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type {
  Template,
  TemplateType,
  TemplateVisibility,
  ImportTemplateInput,
  TemplateExport,
  StaffTemplateData,
  ServiceTemplateData,
  ShiftScheduleTemplateData,
} from "@/lib/types/templates";
import type { TemplateResult } from "@/lib/types/templates";
import { getTemplate, createTemplate } from "./template-service";

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
