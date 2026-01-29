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
