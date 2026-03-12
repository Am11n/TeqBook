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
  - `lint:i18n-locale-gate` (ensures all supported locales exist in `public-pages.ts`)

## Key rename/removal policy

- Key renames/removals must be updated in all locale maps in the same PR.
- Orphan keys should be removed intentionally as part of the same change.

## Legal copy ownership

- Legal copy (`privacy`, `terms`, `security`) requires an explicit owner per release.
- Approval path must be documented per release as one of:
  - internal legal/content review, or
  - external legal language review.
