# TeqBook – én domain (teqbook.com) med Public, Dashboard og Admin

Følg stegene **i rekkefølge**. Alt gjøres i [Vercel Dashboard](https://vercel.com/dashboard).

---

## Forutsetning

- Du har **tre Vercel-prosjekter** fra samme repo: **teqbook-public**, **teqbook-dashboard**, **teqbook-admin**.
- Hvert prosjekt har **Root Directory** satt til henholdsvis `apps/public`, `apps/dashboard`, `apps/admin`.
- Alle tre er deployet og har grønn build (deployment-URL-er som `*.vercel.app` fungerer).

---

## Steg 1: Finn deployment-URL-er for Dashboard og Admin

1. Gå til **teqbook-dashboard**-prosjektet → **Deployments**.
2. Åpne den siste **Production**-deployen.
3. Kopier URL-en øverst, f.eks. `https://teqbook-dashboard-xxx.vercel.app` – **uten** avsluttende `/`.
4. Gå til **teqbook-admin**-prosjektet → **Deployments** → siste Production-deploy.
5. Kopier Admin-URL-en, f.eks. `https://teqbook-admin-xxx.vercel.app` – **uten** avsluttende `/`.

Du trenger disse to URL-ene i Steg 3.

---

## Steg 2: Koble teqbook.com kun til Public

1. Gå til **teqbook-public**-prosjektet.
2. **Settings** → **Domains**.
3. Klikk **Add** og skriv **teqbook.com**.
4. Legg til **www.teqbook.com** om du vil.
5. Følg Vercel sine DNS-instruksjoner hos domeneleverandøren (A/CNAME) hvis du ikke har gjort det.
6. **Viktig:** Ikke legg til teqbook.com eller teqbook.com/dashboard eller teqbook.com/admin på **teqbook-dashboard** eller **teqbook-admin**. Kun Public skal ha hoveddomenet.

---

## Steg 3: Sett rewrites-URL-er i Public (avgjørende for /dashboard og /admin)

Uten dette vil **teqbook.com/dashboard** og **teqbook.com/admin** ikke fungere – du får 404 eller feil side.

1. Gå til **teqbook-public**-prosjektet.
2. **Settings** → **Environment Variables**.
3. Klikk **Add New** (eller **Add**).
4. Legg til **nøyaktig**:
   - **Name:** `DASHBOARD_APP_URL`  
     **Value:** Dashboard-URL fra Steg 1 (f.eks. `https://teqbook-dashboard-xxx.vercel.app`)  
     **Environment:** velg **Production** og **Preview**.
5. Legg til én til:
   - **Name:** `ADMIN_APP_URL`  
     **Value:** Admin-URL fra Steg 1 (f.eks. `https://teqbook-admin-xxx.vercel.app`)  
     **Environment:** **Production** og **Preview**.
6. **Save**.

Rewrites leses **ved build**. Så lenge Public ble bygget **før** du la til disse variablene, må du redeploye (neste steg).

---

## Steg 4: Redeploy Public (må gjøres etter Steg 3)

1. Gå til **teqbook-public** → **Deployments**.
2. Finn den siste deployen (grønn).
3. Klikk **⋮** (tre prikker) på den.
4. Velg **Redeploy**.
5. Bekreft **Redeploy** (du trenger ikke endre noe).
6. Vent til deployen er **Ready**.

Etter dette bygges Public på nytt med `DASHBOARD_APP_URL` og `ADMIN_APP_URL`, og rewrites blir aktive.

---

## Steg 5: Sjekk at alt er koblet

1. Åpne **teqbook.com** i nettleseren – du skal se **Public** (landing/booking).
2. Gå til **teqbook.com/login** og logg inn som **vanlig salong-eier** (ikke superadmin).
   - Etter innlogging skal du havne på **teqbook.com/dashboard** (Dashboard-appen).
3. Logg ut, logg inn som **superadmin**.
   - Etter innlogging skal du havne på **teqbook.com/admin** (Admin-appen).

Hvis du fortsatt ikke sendes til /dashboard eller /admin:

- Dobbeltsjekk at **DASHBOARD_APP_URL** og **ADMIN_APP_URL** i Public er skrevet **riktig** (ingen mellomrom, ingen `/` på slutten).
- Sjekk at du **redeployet Public** etter at variablene ble lagt til.
- Åpne **teqbook.com/dashboard/** og **teqbook.com/admin/** direkte – hvis de fungerer der, men ikke etter login, er problemet redirect etter login (da kan vi sjekke koden).

---

## Oppsummert

| URL | App | Hvor konfigureres |
|-----|-----|-------------------|
| teqbook.com | Public | Domain på Public; Public er den eneste med teqbook.com |
| teqbook.com/dashboard | Dashboard | Rewrite i Public (krever DASHBOARD_APP_URL + redeploy) |
| teqbook.com/admin | Admin | Rewrite i Public (krever ADMIN_APP_URL + redeploy) |

**Viktig:** Dashboard- og Admin-prosjektene trenger **ikke** teqbook.com på egne Domains. De brukes bare via rewrites fra Public.

---

## Feilsøking

### 404 på teqbook.com/dashboard eller /admin etter innlogging

1. **Åpne teqbook.com/dashboard/ direkte** i en ny fane (ikke etter login).  
   - **Hvis du får 404:** Rewrites er ikke aktive. Public ble bygget uten `DASHBOARD_APP_URL`/`ADMIN_APP_URL`, eller variablene er feil.
   - **Løsning:** I **teqbook-public** → **Settings** → **Environment Variables** sjekk at `DASHBOARD_APP_URL` og `ADMIN_APP_URL` finnes og er satt for **Production**. Deretter **Redeploy** Public (Deployments → ⋮ → Redeploy), og **fjern** huken på «Use project's Ignore Build Step» slik at build faktisk kjører.
   - **Sjekk build:** Etter redeploy, åpne **Build Logs** for den nye deployen. Du skal se linjen `[teqbook-public] rewrites: DASHBOARD_APP_URL=set ADMIN_APP_URL=set`. Hvis det står `MISSING`, er variablene ikke tilgjengelige ved build.

2. **Hvis teqbook.com/dashboard/ fungerer når du åpner direkte, men 404 etter login:** Da er rewrites ok; problemet kan være cache eller at nettleseren går til feil URL. Prøv hard refresh (Ctrl+Shift+R) eller åpne teqbook.com/dashboard/ i ny fane etter innlogging.

### CORS-feil mot rate-limit-check (Supabase)

Feilmeldingen «Access to fetch at ... rate-limit-check ... has been blocked by CORS policy» betyr at Supabase Edge Function ikke godtar forespørselen fra `https://teqbook.com`.

1. **Redeploy Edge Function** etter CORS-endring:  
   `supabase functions deploy rate-limit-check`  
   (fra repo-rot, med Supabase CLI og riktig prosjekt.)

2. I Supabase Dashboard: **Edge Functions** → **rate-limit-check** → sjekk at den er deployet og at den kjører med oppdatert kode (bl.a. `getCorsHeaders` som tillater `teqbook.com`).

3. Innlogging fungerer ofte likevel (rate-limit har fallback); CORS påvirker da bare rate-limit-sjekken, ikke selve redirect til dashboard.
