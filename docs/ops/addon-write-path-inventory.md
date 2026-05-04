# Add-on / usage skriveveier (sjekkliste)

Alle stier som endrer **aktive ansatte** eller **`supported_languages`** må til slutt respektere invarianten `usage <= allowed` (RPC, trigger, eller eksplisitt server-side gate med samme logikk).

| Område | Sti | Merknad |
|--------|-----|--------|
| Dashboard | `dashboard_create_salon_employee` RPC via `repositories/employees/mutations.createEmployee` | Primær |
| Dashboard | `dashboard_update_salon_supported_languages` RPC via `repositories/salons.updateSalon` når `supported_languages` settes | Primær |
| Dashboard | `billing-set-pending-addons` edge (absolutt `pending_target_*`) via `setSalonPendingAddons` | Skriver kun `pending_target_*`; Stripe ved neste grense; se `model-a-addon-scheduling.md` |
| Dashboard | `employees/mutations.updateEmployee` (direkte `UPDATE`) | Dekket av trigger |
| Dashboard | Import batch `lib/services/import/execute.ts` (employee rows) | Dekket av trigger på `INSERT` |
| Dashboard | Øvrige `INSERT`/`UPDATE` employees eller `salons.supported_languages` (fremtidig API) | Må kartlegges; trigger fanger direkte SQL |
| Public app | `repositories/salons.updateSalon` med RPC for språk | Samme som dashboard |
| Admin app | `repositories/salons.updateSalon` med RPC for språk | Samme som dashboard |
| Postgres steg-0 | Migrasjon trim | Engangsopprydding |
| Edge | Ingen direkte mutasjon av employees/språk i add-on sync | Leser usage for Stripe |

Ny path: legg til rad her i PR + verifiser RPC eller trigger.
