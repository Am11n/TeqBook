# TeqBook – My Profile (Slim, Modern, Vertical) – AI Agent Checklist

## Goal
- [x] My Profile-siden skal kun håndtere personlig informasjon:
  - [x] Avatar / profilbilde
  - [x] Fornavn
  - [x] Etternavn
- [x] Siden skal vise (readonly):
  - [x] E-post
  - [x] Rolle i salongen
  - [x] Salongnavn
  - [x] Salongtype
- [x] Security, Settings, Danger Zone skal IKKE være på My Profile.

---

## Scope Rules (Non-negotiable)
- [x] Fjern Security-kort fra My Profile.
- [x] Fjern Preferences-kort fra My Profile.
- [x] Fjern Danger Zone fra My Profile (flyttes til Security-siden).
- [x] Fjern top-actions som "Security" og "Settings" fra My Profile header.
- [x] My Profile skal være en enkel side som ikke overlapper andre sider.

---

## Page Layout (Vertical Only)

### Overall layout
- [x] Bruk 1-kolonne layout.
- [x] Maks bredde for innhold: `max-w-3xl` eller `max-w-4xl`.
- [x] Kort skal ligge vertikalt:
  - [x] Profile (editable)
  - [x] Workspace (readonly)
- [x] Spacing mellom kort: `space-y-8` (32px)

### Page header
- [x] Tittel: "My Profile"
- [x] Undertekst: "Update your personal information"
- [x] Kun 1 action i header:
  - [x] "Save changes" (disabled hvis ingen endringer)
  - [x] Alternativ: Save inne i Profile card, ikke begge

---

## Cards (Only Two)

## Card 1: Profile (Editable)
### Content
- [x] Avatar section:
  - [x] Vis avatar (image eller initialer)
  - [x] "Upload new" / "Change photo"
  - [x] "Remove" (hvis dere støtter det)
- [x] Readonly info:
  - [x] Email (readonly)
  - [x] Role (readonly badge)
- [x] Editable fields:
  - [x] First name (required)
  - [x] Last name (required)

### Spacing and form layout
- [x] Bruk stacked labels over inputs (aldri label + input på samme linje)
- [x] Bruk form spacing standard:
  - [x] Field → Field: `space-y-6` (24px)
  - [x] Label → Input: `gap-2` (8px)
  - [x] Help text: `pt-1` eller `mt-1` (4–8px)
- [x] Inputs skal være full bredde
- [x] Save/Cancel UX:
  - [x] "Save changes" knapp
  - [x] "Cancel" som resetter endringer
  - [x] Save har loading state

### Validation
- [x] First name:
  - [x] trim whitespace
  - [x] min length 1
  - [x] max length (f.eks 50)
- [x] Last name:
  - [x] trim whitespace
  - [x] min length 1
  - [x] max length (f.eks 50)

---

## Card 2: Workspace (Readonly)
### Content (readonly)
- [x] Salon Name
- [x] Salon Type
- [x] Role (kan være her eller i Profile card, men ikke dupliser unødvendig)
- [x] Optional: "Go to Salon Settings" som en liten secondary/ghost knapp
  - [x] Denne skal være link-knapp, ikke primær handling på siden

### Layout
- [x] Bruk `InfoRow`-pattern:
  - [x] label (muted)
  - [x] value (font-medium)
- [x] Rows har consistent spacing: `space-y-4`

---

## Component Requirements (Prevent Future Layout Mistakes)

### Mandatory: Field component for inputs
- [x] Alle inputs i Profile card skal bruke standard `<Field />` komponent
- [x] `<Field />` skal sikre:
  - [x] label over input
  - [x] standard spacing
  - [x] consistent error/help text rendering

### Mandatory: InfoRow component for readonly rows
- [x] Alle readonly rader bruker `<InfoRow />`
- [x] `<InfoRow />` støtter:
  - [x] label
  - [x] value
  - [x] optional badge (role)

---

## Data & Backend

### Data sources
- [x] Hent fra backend:
  - [x] user: `email`, `first_name`, `last_name`, `avatar_url`
  - [x] membership: `role`
  - [x] salon: `name`, `type`
- [x] Ikke vis interne IDs på My Profile.

### Mutations
- [x] Update profile mutation oppdaterer:
  - [x] `first_name`
  - [x] `last_name`
  - [x] `avatar_url` (hvis upload støttes)

### Upload (avatar)
- [x] Støtt filtyper: jpg/png/webp
- [x] Size limit: f.eks 2MB
- [x] Auto-crop eller minimum:
  - [x] Square preview
- [x] Store i storage bucket og lagre `avatar_url`

---

## UX States (Must Have)

### Loading state
- [x] Skeleton for avatar + fields
- [x] Ikke hopp layout under load

### Error state
- [x] Vis tydelig feil på save
- [x] Ikke reset input values på failure

### Success state
- [x] Toast: "Profile updated"
- [x] Avatar oppdateres umiddelbart

### Dirty state
- [x] Save disabled hvis ingen endringer
- [x] "Cancel" vises kun hvis dirty

---

## Visual Design Requirements

- [x] Kort padding: `p-6`
- [x] Radius: `rounded-xl` (konsistent)
- [x] Subtil border + lett shadow
- [x] Tydelig spacing mellom seksjoner i Profile card:
  - [x] Avatar block
  - [x] Readonly block (email/role)
  - [x] Editable fields block (first/last name)

---

## Remove From My Profile (Hard Delete)
- [x] Remove: Security section (fullt)
- [x] Remove: Preferences section (fullt)
- [x] Remove: Danger Zone section (fullt)
- [x] Remove: "Manage Security" knapper og alt relatert
- [x] Remove: "Notification Preferences" etc

---

## QA Checklist (Before Merge)
- [x] Desktop: kortene ligger vertikalt og ser balansert ut
- [x] Mobil: alt er lesbart, ingen squish
- [x] Labels har riktig spacing fra inputs
- [x] Ingen inline label layouts
- [x] Save/Cancel fungerer korrekt
- [x] Avatar upload fungerer (happy path + fail path)
- [x] Rolle og salon info vises korrekt (readonly)

---

## Definition of Done
- [x] My Profile har kun to kort: Profile + Workspace
- [x] Siden lar deg endre kun avatar + first/last name
- [x] Email, role, salon name/type vises readonly
- [x] Spacing og form-standard er enforced via `<Field />`
- [x] Ingen Security/Danger Zone på denne siden
