// =====================================================
// Template Types
// =====================================================
// Task Group 37: Shared Staff Templates
// Type definitions for staff and service templates

// =====================================================
// Template Types
// =====================================================

export type TemplateType = "staff" | "service" | "shift_schedule";
export type TemplateVisibility = "private" | "shared" | "public";

export interface BaseTemplate {
  id: string;
  name: string;
  description: string | null;
  type: TemplateType;
  visibility: TemplateVisibility;
  created_by: string;
  salon_id: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Staff Template
// =====================================================

export interface StaffTemplateData {
  roles: Array<{
    name: string;
    permissions: string[];
  }>;
  defaultShifts: Array<{
    weekday: number;
    start_time: string;
    end_time: string;
  }>;
  onboardingSteps: string[];
}

export interface StaffTemplate extends BaseTemplate {
  type: "staff";
  data: StaffTemplateData;
}

// =====================================================
// Service Template
// =====================================================

export interface ServiceTemplateData {
  services: Array<{
    name: string;
    description: string | null;
    duration_minutes: number;
    price_cents: number;
    category: string | null;
    color: string | null;
  }>;
  categories: string[];
}

export interface ServiceTemplate extends BaseTemplate {
  type: "service";
  data: ServiceTemplateData;
}

// =====================================================
// Shift Schedule Template
// =====================================================

export interface ShiftScheduleTemplateData {
  name: string;
  shifts: Array<{
    weekday: number;
    start_time: string;
    end_time: string;
    break_start?: string;
    break_end?: string;
  }>;
  totalHoursPerWeek: number;
}

export interface ShiftScheduleTemplate extends BaseTemplate {
  type: "shift_schedule";
  data: ShiftScheduleTemplateData;
}

// Union type for all templates
export type Template = StaffTemplate | ServiceTemplate | ShiftScheduleTemplate;

// =====================================================
// Template Sharing
// =====================================================

export interface TemplateShare {
  id: string;
  template_id: string;
  shared_with_salon_id: string;
  shared_by: string;
  can_edit: boolean;
  created_at: string;
}

export interface ShareTemplateInput {
  templateId: string;
  salonIds: string[];
  canEdit?: boolean;
}

// =====================================================
// Template Import/Export
// =====================================================

export interface TemplateExport {
  version: string;
  exportedAt: string;
  template: {
    name: string;
    description: string | null;
    type: TemplateType;
    data: StaffTemplateData | ServiceTemplateData | ShiftScheduleTemplateData;
  };
}

export interface ImportTemplateInput {
  salonId: string;
  name?: string; // Override name
  templateData: TemplateExport;
}

// =====================================================
// Service Input/Output Types
// =====================================================

export interface CreateTemplateInput {
  salonId: string;
  name: string;
  description?: string;
  type: TemplateType;
  visibility?: TemplateVisibility;
  data: StaffTemplateData | ServiceTemplateData | ShiftScheduleTemplateData;
}

export interface UpdateTemplateInput {
  templateId: string;
  name?: string;
  description?: string;
  visibility?: TemplateVisibility;
  data?: StaffTemplateData | ServiceTemplateData | ShiftScheduleTemplateData;
}

export interface TemplateListFilter {
  type?: TemplateType;
  visibility?: TemplateVisibility;
  includeShared?: boolean;
}

export interface TemplateListResult {
  data: Template[] | null;
  error: string | null;
}

export interface TemplateResult {
  data: Template | null;
  error: string | null;
}
