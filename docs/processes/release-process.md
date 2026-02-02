# TeqBook – Release Process

Dette dokumentet beskriver release-prosessen for TeqBook.

---

## Release-strategi

TeqBook bruker **semantic versioning** (SemVer): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: Nye features (backward compatible)
- **PATCH**: Bugfixes (backward compatible)

---

## Pre-release Checklist

Før du starter en release:

- [ ] Alle tests passerer (`npm run test`)
- [ ] Lint passerer (`npm run lint`)
- [ ] Type check passerer (`npx tsc --noEmit`)
- [ ] Build er vellykket (`npm run build`)
- [ ] E2E tests passerer (`npm run test:e2e`)
- [ ] Dokumentasjon er oppdatert
- [ ] CHANGELOG.md er oppdatert (hvis relevant)
- [ ] Breaking changes er dokumentert

---

## Release-prosess

### 1. Opprett Release Branch

```bash
git checkout -b release/v1.2.0
```

### 2. Oppdater Versjon

**Hvis du bruker npm version:**

```bash
cd web
npm version patch  # for patch release
npm version minor  # for minor release
npm version major  # for major release
```

Dette oppdaterer automatisk `package.json` og oppretter en git tag.

**Eller manuelt:**

1. Oppdater `apps/dashboard/package.json` (eller den appen du utgir) versjon
2. Commit endringen:
   ```bash
   git add apps/dashboard/package.json
   git commit -m "chore: bump version to 1.2.0"
   ```

### 3. Merge til Main

```bash
git checkout main
git merge release/v1.2.0
git push origin main
```

### 4. Opprett Git Tag

```bash
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

### 5. Deploy

Deployment skjer automatisk via GitHub Actions når kode pushes til `main` branch.

**Manuell deployment (hvis nødvendig):**

1. Gå til **Actions** tab i GitHub
2. Velg **Deploy Next.js site to Pages**
3. Klikk **Run workflow**

---

## Post-release

### 1. Verifiser Deployment

1. Gå til repository **Settings** → **Pages**
2. Sjekk at deployment er vellykket
3. Test live URL

### 2. Opprett Release Notes

1. Gå til **Releases** i GitHub
2. Klikk **Draft a new release**
3. Velg tag (f.eks. `v1.2.0`)
4. Legg til release notes:
   - Nye features
   - Bugfixes
   - Breaking changes
   - Migration guide (hvis relevant)

### 3. Kommuniser Endringer

- Oppdater brukere om nye features
- Dokumenter breaking changes
- Gi migration guide hvis nødvendig

---

## Hotfix-prosess

For kritiske bugfixes som må til produksjon umiddelbart:

### 1. Opprett Hotfix Branch

```bash
git checkout -b hotfix/v1.2.1 main
```

### 2. Fix Buggen

```bash
# Fix bug
git add .
git commit -m "fix: resolve critical booking bug"
```

### 3. Oppdater Versjon

```bash
npm version patch
```

### 4. Merge til Main

```bash
git checkout main
git merge hotfix/v1.2.1
git push origin main
```

### 5. Tag og Deploy

```bash
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git push origin v1.2.1
```

---

## Rollback-prosess

Hvis noe går galt etter release:

### 1. Revert Commit

```bash
git revert <commit-hash>
git push origin main
```

### 2. Eller Deploy Forrige Versjon

1. Gå til **Actions** tab
2. Finn forrige vellykkede deployment
3. Re-run workflow

---

## Best Practices

1. **Test i staging først** (hvis du har staging-miljø)
2. **Kommuniser breaking changes** tydelig
3. **Dokumenter migrations** hvis nødvendig
4. **Monitor deployment** etter release
5. **Ha rollback-plan** klar

---

## Relaterte Dokumenter

- `CONTRIBUTING.md` - Branch-strategi og PR-prosess
- `docs/onboarding.md` - Developer onboarding
- `.github/workflows/ci.yml` - CI/CD pipeline

