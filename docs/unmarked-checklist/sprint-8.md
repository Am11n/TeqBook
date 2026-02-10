## Sprint 8: Polish -- Global Search, Command Palette, Changelog, Feedback

### Command Palette / Global Search

- [x] Command Palette -- `apps/admin/src/components/shared/command-palette.tsx`
  - [x] Ctrl+K / Cmd+K keyboard shortcut
  - [x] Søk på salons, users, pages
  - [x] Resultater gruppert etter type (page, salon, user)
  - [x] Keyboard navigasjon (piltaster + Enter)
  - [x] Debounced search (200ms)
- [x] Integrert i AdminShell (globalt tilgjengelig)

### Changelog

- [x] DB-migrasjon: Changelog + Feedback -- `20260210000009_changelog_feedback.sql`
  - [x] `changelog_entries` tabell (title, description, version, type, published)
  - [x] `feedback_entries` tabell (title, description, type, status, votes)
- [x] Changelog page -- `apps/admin/src/app/(admin)/changelog/page.tsx`
  - [x] Kort-basert layout med type-ikoner (Feature, Improvement, Bug Fix, Breaking)
  - [x] Version badges
  - [x] Published/Draft status
  - [x] Publish/Unpublish toggle
  - [x] Add Entry button

### Feedback

- [x] Feedback page -- `apps/admin/src/app/(admin)/feedback/page.tsx`
  - [x] Status summary cards (6 statuser)
  - [x] DataTable med feedback entries sortert etter votes
  - [x] Row actions: Set status (open, under_review, planned, in_progress, completed, declined)
  - [x] DetailDrawer med status workflow buttons
  - [x] Vote count display

### Sidebar

- [x] Product seksjon lagt til i sidebar (Changelog, Feedback)
- [x] Desktop og mobil sidebar oppdatert
