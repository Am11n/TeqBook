# CI/CD Strategy for Monorepo

## Overview

Use GitHub Action `dorny/paths-filter` for robust path-based deployment detection.

## Setup

### Vercel Configuration

Create three separate Vercel projects:

1. **Public App Project**
   - Root Directory: `apps/public`
   - Framework Preset: Next.js
   - Build Command: `cd apps/public && npm run build`
   - Output Directory: `.next`

2. **Dashboard App Project**
   - Root Directory: `apps/dashboard`
   - Framework Preset: Next.js
   - Build Command: `cd apps/dashboard && npm run build`
   - Output Directory: `.next`

3. **Admin App Project**
   - Root Directory: `apps/admin`
   - Framework Preset: Next.js
   - Build Command: `cd apps/admin && npm run build`
   - Output Directory: `.next`

### Ignored Build Step

For each Vercel project, set "Ignored Build Step" to:

```bash
# For public app
git diff HEAD^ HEAD --quiet . apps/public/ packages/ || echo "should-build"

# For dashboard app
git diff HEAD^ HEAD --quiet . apps/dashboard/ packages/ || echo "should-build"

# For admin app
git diff HEAD^ HEAD --quiet . apps/admin/ packages/ || echo "should-build"
```

**Note:** This is a simple approach. For more robust detection, use the GitHub Action workflow.

### GitHub Actions Workflow

The workflow in `.github/workflows/deploy.yml` uses `dorny/paths-filter` to:
- Detect which apps changed
- Trigger deployments only for changed apps
- Deploy all apps when `packages/*` changes

## Benefits

- Only deploy what changed
- Faster CI/CD cycles
- Lower risk per deployment
- Clear separation of concerns
