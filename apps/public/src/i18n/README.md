# Public i18n policy

This file documents the localization guardrails for the public app.

## Source locale

- Source locale is `en`.
- New keys are authored in `en` first, then replicated to all supported locales.

## Fallback policy

- Do not use runtime UI fallbacks such as `t.key || "English text"` in localized UI.
- Missing keys must be caught in development/CI.

## Locale completeness gate

- `npm run lint` includes i18n gates:
  - `lint:i18n-fallback-gate` (blocks inline fallback text in targeted public UI files)
  - `lint:i18n-locale-gate` (ensures all supported locales exist in `public-pages/translations.ts`)
  - `lint:i18n-parity` (fails on missing keys, extra keys, and placeholder mismatch)

## Production-ready locale checklist

A locale is production-ready only when:
- `lint:i18n-parity` is green for affected namespaces
- placeholder checks are green (`{employee}`, `{count}`, etc. preserved)
- critical-route smoke QA is complete (`/book`, `/salon`, `/login`, `/signup`, `/onboarding`, `/book/[salon_slug]/confirmation`)
- no mixed-language defects remain in exposed public flows

## Release exposure policy

- Locale selector exposure is controlled in `src/i18n/exposed-locales.ts`.
- Only production-ready locales may be exposed.
- Any locale with unresolved parity or QA issues must be hidden until fixed.

## Key rename/removal policy

- Key renames/removals must be updated in all locale maps in the same PR.
- Orphan keys should be removed intentionally as part of the same change.

## Legal copy ownership

- Legal copy (`privacy`, `terms`, `security`) requires an explicit owner per release.
- Approval path must be documented per release as one of:
  - internal legal/content review, or
  - external legal language review.
