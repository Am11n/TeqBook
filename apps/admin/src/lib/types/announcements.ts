export type AnnouncementStatus = "draft" | "published";
export type AnnouncementScopeType = "global";

export interface Announcement {
  id: string;
  scope_type: AnnouncementScopeType;
  title: string;
  body: string;
  status: AnnouncementStatus;
  is_pinned: boolean;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementListFilters {
  status?: "all" | AnnouncementStatus;
}

export interface AnnouncementInput {
  title: string;
  body: string;
  is_pinned?: boolean;
}
