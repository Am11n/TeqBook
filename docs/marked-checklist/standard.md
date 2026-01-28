# Form Layout & Spacing Standard (TeqBook)

## Goal
- [x] All forms use consistent label, input, help text, and error spacing.
- [x] No field is allowed to render label and input "too close" or on the same row by accident.
- [x] The system prevents regressions through components + lint + tests.

---

## Non-negotiable UI Rules

### Label placement
- [ ] Labels MUST be stacked above inputs (default layout).
- [ ] Inline label (label left, input right) is ONLY allowed via an explicit `variant="inline"` API.
- [ ] No ad hoc inline layouts in feature code.

### Spacing tokens (Tailwind)
- [ ] Label → Input spacing: `gap-2` (8px)
- [ ] Field → Field spacing: `space-y-6` (24px)
- [ ] Input → Help text spacing: `pt-1` or `mt-1` (4–8px)
- [ ] Section → Section spacing: `space-y-8` (32px)

### Consistency
- [ ] Every field uses the same layout pattern.
- [ ] Every field supports: label, input/control, optional help/description, optional error.
- [ ] No one-off spacing fixes on single fields.

---

## Implementation Checklist

### 1) Create a single reusable Field component
- [x] Add `components/form/Field.tsx`
- [x] Component supports:
  - [x] `label`
  - [x] `htmlFor`
  - [x] `required` (renders `*`)
  - [x] `description` (help text)
  - [x] `error`
  - [x] `children` (input/control)
- [x] Default layout uses `flex flex-col gap-2`
- [x] Help and error text use small typography and consistent spacing

### 2) Replace all ad hoc label/input layouts
- [x] Find every place where a label and input are manually arranged
- [x] Replace with `<Field />` (Settings page completed)
- [x] Confirm Settings page fields are stacked consistently:
  - [x] Salon Name
  - [x] Salon Type
  - [x] WhatsApp Number
  - [x] Supported Languages
  - [x] Default Language
  - [x] Preferred Language
  - [x] Role
- [x] Replace in other pages (onboarding, etc.) - completed

### 3) Enforce standard with ESLint
- [x] Add ESLint rule to forbid direct `<label>` usage in feature code
- [x] Allow direct `<label>` only inside `components/form/**`
- [x] Error message must instruct to use `<Field />`

### 4) Enforce standard with UI tests (Playwright)
- [x] Add a screenshot test for the Settings form
- [x] Test must fail on spacing/layout regressions
- [x] Include stable selectors (data-testid) where needed:
  - [x] `data-testid="settings-form"`
  - [x] `data-testid="field-salon-name"`
  - [x] `data-testid="field-salon-type"`

### 5) Add PR self-review gates
- [x] PR includes confirmation:
  - [x] "All new/updated fields use `<Field />`" (added to CONTRIBUTING.md)
  - [x] "No inline label layouts added without `variant="inline"`" (added to CONTRIBUTING.md)
  - [x] "Settings form screenshot test passes" (added to CONTRIBUTING.md)
  - [x] "Lint passes (no restricted label violations)" (added to CONTRIBUTING.md)

---

## Definition of Done
- [x] No label/input appears on the same row unless explicitly intended (`variant="inline"`).
- [x] Spacing matches the standard tokens everywhere (Settings and Onboarding pages).
- [x] Lint blocks regressions.
- [x] Screenshot test blocks visual drift.
- [x] Code review checklist includes form-spacing verification (added to CONTRIBUTING.md).

---

## Quick Examples

### Correct (default)
- [x] Label above input
- [x] Uses `<Field />`
- [x] Uses `space-y-6` for the form container

### Incorrect (blocked)
- [x] Label and input in the same flex row without explicit variant (blocked by ESLint)
- [x] Manual spacing hacks like `ml-3`, `-mt-2`, random margins per field (prevented by Field component)
- [x] Direct `<label>` in feature code (blocked by ESLint)
