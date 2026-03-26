export interface DashboardAnnouncement {
  id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  published_at: string | null;
  updated_at: string;
}
