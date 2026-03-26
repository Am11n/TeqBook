import { listPublishedAnnouncements as listPublishedAnnouncementsRepo } from "@/lib/repositories/announcements";

export async function listPublishedAnnouncements() {
  return listPublishedAnnouncementsRepo();
}
