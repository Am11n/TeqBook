# Vurdering av SaaS-plans.md

## 📊 Status: Hva finnes allerede?

### ✅ Allerede implementert:

1. **Plan-system:**
   - `salons.plan` (enum: starter, pro, business) ✅
   - `plan-limits-service.ts` med limits-logikk ✅
   - `addons` tabell for å utvide limits ✅

2. **Access Control:**
   - `access-control.ts` med role-based permissions ✅
   - Role hierarchy (owner > manager > staff) ✅

3. **Error Handling:**
   - `ErrorBoundary` komponent eksisterer ✅
   - Domain errors (`domain-errors.ts`) ✅

4. **Testing:**
   - Vitest + Playwright setup ✅
   - Unit tests for services ✅
   - E2E tests ✅

---

## 🎯 Vurdering av planen

### Styrker:

1. **God struktur** - Tydelig delt i to deler (Plan/Features vs Arkitektur)
2. **Fleksibel datamodell** - `plans` + `features` + `plan_features` er mer fleksibelt enn hardkodede limits
3. **Separation of concerns** - Tydelig skille mellom plan/feature og roller
4. **Fremtidssikker** - Forbereder for multi-klient og monorepo

### Utfordringer/Justeringer nødvendig:

1. **Migrasjon fra eksisterende system:**
   - Planen foreslår `plans` tabell, men vi har allerede `salons.plan` (enum)
   - Må vurdere: Migrere til ny struktur eller bygge videre på eksisterende?
   - **Anbefaling:** Bygg videre på eksisterende, men legg til `features` tabell for fleksibilitet

2. **Organizations vs Salons:**
   - Planen snakker om `organizations`, men kodebasen bruker `salons`
   - **Anbefaling:** Bruk `salons` konsekvent (eller dokumenter at de er samme ting)

3. **Result type:**
   - Planen foreslår `Result<T>` type, men services bruker allerede `{ data, error }` pattern
   - **Anbefaling:** Vurder om Result-type gir nok verdi, eller behold eksisterende pattern

4. **Feature flags:**
   - Planen foreslår feature flags service, men vi har allerede plan-basert feature control
   - **Anbefaling:** Implementer feature flags service, men integrer med eksisterende plan-system

---

## 📋 Prioriterte anbefalinger

### Fase 1: Kritiske forbedringer (Start her)

1. **Legg til `features` tabell** (uten å fjerne eksisterende plan-system)
   - Opprett `features` tabell
   - Opprett `plan_features` tabell
   - Migrer eksisterende plan-limits til features
   - Behold `salons.plan` for bakoverkompatibilitet

2. **Feature flags service**
   - Opprett `feature-flags-service.ts`
   - Integrer med eksisterende `plan-limits-service.ts`
   - Opprett `useFeatures` hook

3. **Dokumentasjon**
   - `docs/backend/plan-and-feature-model.md`
   - Oppdater eksisterende dokumentasjon

### Fase 2: Forbedringer (Etter Fase 1)

4. **Result type** (valgfritt - vurder verdi)
   - Hvis du implementerer, gjør det gradvis
   - Start med nye services, migrer eksisterende over tid

5. **Error handling forbedringer**
   - Error boundary er på plass, men kan forbedres
   - Standardiser error message komponenter

6. **RLS dokumentasjon**
   - Dokumenter eksisterende RLS-strategi
   - Verifiser at alle tabeller har RLS

### Fase 3: Avanserte forbedringer (Nice-to-have)

7. **Teststrategi utvidelse**
   - Utvid eksisterende tester
   - Legg til flere E2E-tester

8. **Domeneprinsipper**
   - Dokumenter state machines
   - Dokumenter business rules

9. **Monorepo blueprint**
   - Planlegg fremtidig struktur
   - Dokumenter refaktoreringsbehov

---

## 🔄 Justerte forslag til implementering

### Justering 1: Bygg videre på eksisterende plan-system

**I stedet for:**
- Opprett ny `plans` tabell
- Migrer `salons.plan` til `salons.plan_id`

**Foreslå:**
- Behold `salons.plan` (enum) for enkelhet
- Legg til `features` tabell for fleksibilitet
- Legg til `plan_features` tabell som mapper enum-verdier til features
- Dette gir fleksibilitet uten å bryte eksisterende kode

### Justering 2: Integrer med eksisterende services

**I stedet for:**
- Ny `feature-flags-service.ts` fra scratch

**Foreslå:**
- Utvid `plan-limits-service.ts` med feature-sjekk
- Eller opprett `feature-flags-service.ts` som bruker `plan-limits-service.ts`
- Dette unngår duplisering og bygger på eksisterende logikk

### Justering 3: Result type er valgfritt

**Vurdering:**
- Eksisterende `{ data, error }` pattern fungerer godt
- Result type gir bedre type-safety, men krever refaktorering
- **Anbefaling:** Start uten Result type, vurder senere hvis behovet oppstår

---

## ✅ Konkrete neste steg

1. **Les gjennom eksisterende kode:**
   - `plan-limits-service.ts`
   - `access-control.ts`
   - `salons` tabell struktur

2. **Start med Fase 1:**
   - Opprett `features` tabell
   - Opprett `plan_features` tabell
   - Opprett `feature-flags-service.ts`
   - Opprett `useFeatures` hook

3. **Test gradvis:**
   - Test hver komponent isolert
   - Integrer med eksisterende kode
   - Verifiser at eksisterende funksjonalitet fortsatt fungerer

---

## 📝 Konklusjon

Planen er **solid og gjennomtenkt**, men bør justeres for å bygge videre på eksisterende infrastruktur i stedet for å erstatte den. 

**Hovedanbefaling:** Start med Fase 1 (features tabell + feature flags service), og bygg gradvis videre. Dette gir fleksibilitet uten å bryte eksisterende funksjonalitet.

