export type BlockType =
  | "meeting"
  | "vacation"
  | "training"
  | "private"
  | "lunch"
  | "other";

export type TimeBlock = {
  id: string;
  salon_id: string;
  employee_id: string | null;
  title: string;
  block_type: BlockType;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  recurrence_rule: string | null;
  notes: string | null;
};

export type CreateTimeBlockInput = {
  salon_id: string;
  employee_id?: string | null;
  title: string;
  block_type: BlockType;
  start_time: string;
  end_time: string;
  is_all_day?: boolean;
  recurrence_rule?: string | null;
  notes?: string | null;
};

export type SegmentType =
  | "working"
  | "break"
  | "time_block"
  | "booking"
  | "buffer"
  | "closed";

export type ScheduleSegment = {
  employee_id: string;
  segment_type: SegmentType;
  start_time: string;
  end_time: string;
  metadata: {
    booking_id?: string;
    block_id?: string;
    block_type?: string;
    break_label?: string;
    reason_code?: string;
    source?: string;
    title?: string;
    notes?: string | null;
    status?: string;
    is_walk_in?: boolean;
    service_name?: string;
    service_price?: number;
    service_duration?: number;
    customer_name?: string;
    customer_phone?: string;
    buffer_type?: "prep" | "cleanup";
    [key: string]: unknown;
  };
};

export type ConflictItem = {
  type: string;
  start: string;
  end: string;
  source_id: string;
  message_code: string;
  customer_name?: string;
  service_name?: string;
  title?: string;
  block_type?: string;
  break_label?: string;
};

export type SuggestedSlot = {
  start: string;
  end: string;
  employee_id: string;
};

export type ConflictResponse = {
  is_valid: boolean;
  conflicts: ConflictItem[];
  suggested_slots: SuggestedSlot[];
};

export type AvailableSlotBatch = {
  slot_start: string;
  slot_end: string;
  employee_id: string;
  employee_name: string;
};
