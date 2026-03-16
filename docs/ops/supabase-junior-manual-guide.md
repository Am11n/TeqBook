# Supabase Junior Manual Guide (Before/After)

Use this guide for manual steps that CLI does not perform.

## Manual Tasks You Do in Supabase Dashboard

- Create/select correct project (`staging` or `pilot-production`).
- Confirm Auth settings and redirect URLs.
- Set Edge Function secrets.
- Manage team access and least privilege.
- Configure backup/PITR for pilot-production.

## Do Not Do Manually

- Do not run normal schema rollout by copy/paste in SQL Editor.
- Do not seed fake fixtures in pilot-production.
- Do not run reset operations in pilot-production.

## Before Change (Mandatory)

Fill this before running DB commands:

- Target env:
- Command(s):
- Why:
- Risk:
- Approved by:
- Rollback/recovery path:

## After Change (Mandatory)

Fill this immediately after command completion:

- What was executed:
- Result (`success` / `failed`):
- Evidence link:
- Any deviation from plan:
- Follow-up actions:

## Safe Command Flow

1. `cp .env.staging .env.local` or `cp .env.pilot .env.local`
2. `pnpm run db:manifest:verify`
3. `pnpm run db:apply`
4. `pnpm run db:verify`
5. Update before/after logs and decision log

