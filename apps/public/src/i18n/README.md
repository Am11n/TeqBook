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
  - `lint:i18n-locale-gate` (ensures all supported locales exist in `public-pages/compose.ts`)
  - `lint:i18n-parity` (fails on missing keys, extra keys, and placeholder mismatch for core maps)
  - `lint:i18n-max-lines` (fails when any `*.ts` under `src/i18n`, `profile-i18n`, or `landing-copy` exceeds 300 lines)
  - `lint:i18n-english-leak` (fails when non-`en` locales reuse long English strings for `publicBooking`, login UI, profile page copy, contact page copy, and profile team dialog; uses allowlist for brand terms)

## Translated copy touchpoints (public)

| Area | Primary modules |
| --- | --- |
| Core booking, auth, onboarding | `locale-parts/<locale>/*.ts` (barreled as `i18n/<locale>.ts`), `translations-data.ts`, `login-ui.ts` |
| Marketing / shell / 2FA / 404 | `public-pages/en-base.ts`, `public-pages/compose.ts`, `public-pages/overrides/batch-*.ts` |
| Salon profile | `app/salon/[slug]/profile-i18n/*` |
| Landing / marketing body | `components/landing/landing-copy/locales/*.ts` |
| Contact, pricing | `contact-page-copy*.ts`, `pricing-locale-*.ts` |
| Legal | `privacy-page-copy.ts`, `terms-page-copy*.ts`, `security-page-copy.ts`, `security-page-ui-copy.ts` |

## Production-ready locale checklist

A locale is production-ready when:

- `lint:i18n-parity` is green for affected namespaces
- `lint:i18n-max-lines` and `lint:i18n-english-leak` are green
- placeholder checks are green (`{employee}`, `{count}`, etc. preserved)
- critical-route smoke QA is complete (`/book`, `/salon/[slug]`, `/login`, `/signup`, `/onboarding`, `/book/[salon_slug]/confirmation`, marketing and legal routes as applicable)
- no mixed-language defects remain in exposed public flows

## Release exposure policy

- Locale selector exposure is controlled in `src/i18n/exposed-locales.ts`.
- **Current policy:** all fifteen `AppLocale` values are exposed. Regressions are blocked in CI via the gates above rather than by hiding locales ad hoc. If a locale must be temporarily withdrawn, remove it from `EXPOSED_PUBLIC_LOCALES` in the same change that documents the reason (for example in the PR description).

## Key rename/removal policy

- Key renames/removals must be updated in all locale maps in the same PR.
- Orphan keys should be removed intentionally as part of the same change.

## Legal copy ownership

- Legal copy (`privacy`, `terms`, `security`) requires an explicit owner per release.
- Approval path must be documented per release as one of:
  - internal legal/content review, or
  - external legal language review.
- Non-English legal body text in this repo is a **draft for UX/locale completeness** until that sign-off is recorded for the release; do not treat it as final counsel-approved wording without the path above.
