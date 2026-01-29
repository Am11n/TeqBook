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

Feilmeldingen «Access to fetch at ... rate-limit-check ... has been blocked by CORS policy: Response to preflight request doesn't pass access control check» betyr at Supabase Edge Function ikke godtar preflight (OPTIONS) fra `https://teqbook.com`.

1. **Redeploy Edge Function** etter CORS-endring:  
   `supabase functions deploy rate-limit-check`  
   (fra repo-rot, med Supabase CLI og riktig prosjekt.) Koden returnerer nå **200** for OPTIONS og tillater `teqbook.com` / `www.teqbook.com`.

2. I **Supabase Dashboard** → **Edge Functions** → **rate-limit-check**:  
   - Sjekk at funksjonen er deployet med nyeste kode.  
   - Under **Function settings** / **Invoke**: sørg for at funksjonen kan kalles uten auth for OPTIONS (preflight sendes uten `apikey` av nettleseren). Noen prosjekter har «Enforce JWT» – da kan OPTIONS bli avvist med 401; da må du tillate anonym invokasjon for denne funksjonen eller slå av JWT-sjekk for OPTIONS.

3. Innlogging fungerer ofte likevel (rate-limit har fallback); CORS påvirker da bare rate-limit-sjekken, ikke selve redirect til dashboard.

### 404 på dashboard/?_rsc=... etter innlogging

Hvis console viser «dashboard/?_rsc=... Failed to load resource: 404» etter innlogging, blir RSC-forespørselen ikke riktig sendt til Dashboard-appen.

1. **Sjekk at rewrites er aktive:** I **teqbook-public** → **Environment Variables** må `DASHBOARD_APP_URL` være satt (full URL til Dashboard-deploy, uten avsluttende `/`). Redeploy Public etter endring.
2. **Sjekk at du havner på riktig URL:** Etter login skal du havne på **https://teqbook.com/dashboard/** (med avsluttende `/`). Hvis du havner på feil path, kan RSC-requests gå til Public i stedet for Dashboard og gi 404.
3. **Chrome-extension-feil:** «Unexpected token 'export'» fra `chrome-extension://...` kommer fra en nettleserutvidelse, ikke fra TeqBook – du kan ignorere den eller deaktivere utvidelsen på teqbook.com.

### ERR_TOO_MANY_REDIRECTS på teqbook.com

Feilmeldingen «This page isn’t working – teqbook.com redirected you too many times» betyr en redirect-løkke.

1. **Public har ingen redirects for /dashboard og /admin** – kun rewrites (redirects er fjernet for å unngå løkke). Dashboard og Admin har `skipTrailingSlashRedirect: true`. Redeploy **alle tre** prosjekter (Public, Dashboard, Admin) etter slike endringer.

2. **Vercel Deployment Protection:** Slå av **Vercel Authentication** for **teqbook-public** under **Settings → Deployment Protection**. Hvis den er på, kan brukere bli sendt til vercel.com/login og tilbake → løkke.

3. **Domain-redirects (veldig vanlig årsak):** I **teqbook-public** → **Settings → Domains** – sørg for at **kun én** domain er «Primary». F.eks. velg **teqbook.com** som primary, og at **www.teqbook.com** (hvis du bruker den) kun **redirecter til** teqbook.com – aldri at teqbook.com redirecter til www og www tilbake til teqbook.com.

4. **Test:** Prøv åpne **https://teqbook.com/** (med avsluttende `/`) i privat vindu. Hvis det fungerer men teqbook.com uten slash gir løkke, er det sannsynligvis domain/HTTPS-oppsett i Vercel.
