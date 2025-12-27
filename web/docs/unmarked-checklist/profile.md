# TeqBook – My Profile (Slim, Modern, Vertical) – AI Agent Checklist

## Goal
- [ ] My Profile-siden skal kun håndtere personlig informasjon:
  - [ ] Avatar / profilbilde
  - [ ] Fornavn
  - [ ] Etternavn
- [ ] Siden skal vise (readonly):
  - [ ] E-post
  - [ ] Rolle i salongen
  - [ ] Salongnavn
  - [ ] Salongtype
- [ ] Security, Settings, Danger Zone skal IKKE være på My Profile.

---

## Scope Rules (Non-negotiable)
- [ ] Fjern Security-kort fra My Profile.
- [ ] Fjern Preferences-kort fra My Profile.
- [ ] Fjern Danger Zone fra My Profile (flyttes til Security-siden).
- [ ] Fjern top-actions som “Security” og “Settings” fra My Profile header.
- [ ] My Profile skal være en enkel side som ikke overlapper andre sider.

---

## Page Layout (Vertical Only)

### Overall layout
- [ ] Bruk 1-kolonne layout.
- [ ] Maks bredde for innhold: `max-w-3xl` eller `max-w-4xl`.
- [ ] Kort skal ligge vertikalt:
  - [ ] Profile (editable)
  - [ ] Workspace (readonly)
- [ ] Spacing mellom kort: `space-y-8` (32px)

### Page header
- [ ] Tittel: “My Profile”
- [ ] Undertekst: “Update your personal information”
- [ ] Kun 1 action i header:
  - [ ] “Save changes” (disabled hvis ingen endringer)
  - [ ] Alternativ: Save inne i Profile card, ikke begge

---

## Cards (Only Two)

## Card 1: Profile (Editable)
### Content
- [ ] Avatar section:
  - [ ] Vis avatar (image eller initialer)
  - [ ] “Upload new” / “Change photo”
  - [ ] “Remove” (hvis dere støtter det)
- [ ] Readonly info:
  - [ ] Email (readonly)
  - [ ] Role (readonly badge)
- [ ] Editable fields:
  - [ ] First name (required)
  - [ ] Last name (required)

### Spacing and form layout
- [ ] Bruk stacked labels over inputs (aldri label + input på samme linje)
- [ ] Bruk form spacing standard:
  - [ ] Field → Field: `space-y-6` (24px)
  - [ ] Label → Input: `gap-2` (8px)
  - [ ] Help text: `pt-1` eller `mt-1` (4–8px)
- [ ] Inputs skal være full bredde
- [ ] Save/Cancel UX:
  - [ ] “Save changes” knapp
  - [ ] “Cancel” som resetter endringer
  - [ ] Save har loading state

### Validation
- [ ] First name:
  - [ ] trim whitespace
  - [ ] min length 1
  - [ ] max length (f.eks 50)
- [ ] Last name:
  - [ ] trim whitespace
  - [ ] min length 1
  - [ ] max length (f.eks 50)

---

## Card 2: Workspace (Readonly)
### Content (readonly)
- [ ] Salon Name
- [ ] Salon Type
- [ ] Role (kan være her eller i Profile card, men ikke dupliser unødvendig)
- [ ] Optional: “Go to Salon Settings” som en liten secondary/ghost knapp
  - [ ] Denne skal være link-knapp, ikke primær handling på siden

### Layout
- [ ] Bruk `InfoRow`-pattern:
  - [ ] label (muted)
  - [ ] value (font-medium)
- [ ] Rows har consistent spacing: `space-y-4`

---

## Component Requirements (Prevent Future Layout Mistakes)

### Mandatory: Field component for inputs
- [ ] Alle inputs i Profile card skal bruke standard `<Field />` komponent
- [ ] `<Field />` skal sikre:
  - [ ] label over input
  - [ ] standard spacing
  - [ ] consistent error/help text rendering

### Mandatory: InfoRow component for readonly rows
- [ ] Alle readonly rader bruker `<InfoRow />`
- [ ] `<InfoRow />` støtter:
  - [ ] label
  - [ ] value
  - [ ] optional badge (role)

---

## Data & Backend

### Data sources
- [ ] Hent fra backend:
  - [ ] user: `email`, `first_name`, `last_name`, `avatar_url`
  - [ ] membership: `role`
  - [ ] salon: `name`, `type`
- [ ] Ikke vis interne IDs på My Profile.

### Mutations
- [ ] Update profile mutation oppdaterer:
  - [ ] `first_name`
  - [ ] `last_name`
  - [ ] `avatar_url` (hvis upload støttes)

### Upload (avatar)
- [ ] Støtt filtyper: jpg/png/webp
- [ ] Size limit: f.eks 2MB
- [ ] Auto-crop eller minimum:
  - [ ] Square preview
- [ ] Store i storage bucket og lagre `avatar_url`

---

## UX States (Must Have)

### Loading state
- [ ] Skeleton for avatar + fields
- [ ] Ikke hopp layout under load

### Error state
- [ ] Vis tydelig feil på save
- [ ] Ikke reset input values på failure

### Success state
- [ ] Toast: “Profile updated”
- [ ] Avatar oppdateres umiddelbart

### Dirty state
- [ ] Save disabled hvis ingen endringer
- [ ] “Cancel” vises kun hvis dirty

---

## Visual Design Requirements

- [ ] Kort padding: `p-6`
- [ ] Radius: `rounded-xl` (konsistent)
- [ ] Subtil border + lett shadow
- [ ] Tydelig spacing mellom seksjoner i Profile card:
  - [ ] Avatar block
  - [ ] Readonly block (email/role)
  - [ ] Editable fields block (first/last name)

---

## Remove From My Profile (Hard Delete)
- [ ] Remove: Security section (fullt)
- [ ] Remove: Preferences section (fullt)
- [ ] Remove: Danger Zone section (fullt)
- [ ] Remove: “Manage Security” knapper og alt relatert
- [ ] Remove: “Notification Preferences” etc

---

## QA Checklist (Before Merge)
- [ ] Desktop: kortene ligger vertikalt og ser balansert ut
- [ ] Mobil: alt er lesbart, ingen squish
- [ ] Labels har riktig spacing fra inputs
- [ ] Ingen inline label layouts
- [ ] Save/Cancel fungerer korrekt
- [ ] Avatar upload fungerer (happy path + fail path)
- [ ] Rolle og salon info vises korrekt (readonly)

---

## Definition of Done
- [ ] My Profile har kun to kort: Profile + Workspace
- [ ] Siden lar deg endre kun avatar + first/last name
- [ ] Email, role, salon name/type vises readonly
- [ ] Spacing og form-standard er enforced via `<Field />`
- [ ] Ingen Security/Danger Zone på denne siden
