# ADR: Sekundært bevis (OTP) for public booking action tokens

- **Dato:** 2026-04-29
- **Status:** Akseptert
- **Kontekst:** Action tokens (`confirmation`, `notify`, `cancel`) kunne minter med kun kjent `bookingId`, `salonId` og riktig kunde-e-post (fra booking), uten at kunden beviste e-postkontroll i sanntid.

## Beslutning

Vi innfører **engangskode per e-post (6 siffer)**:

1. `POST /api/public-booking/request-proof` validerer booking + e-post, lagrer **hash** + utløp i `public_booking_action_proofs`, sender kode.
2. `POST /api/public-booking/action-token` krever `proofCode`; ved suksess slettes proof-raden (engangsbruk).
3. Legacy bekreftelseslenker med JWT i URL støttes for visning; full bekreftelses-e-post kan fortsatt trigges med `confirmationActionToken` i `send-notifications`.

## Konsekvenser

- **Positivt:** Reduserer risiko for at uvedkommende minter tokens kun ved å gjette eller kjenne e-post.
- **Negativt:** To steg for brukeren; telefon-only bookinger uten e-post kan ikke fullføre flyten uten annen kanal.
- **Hemmeligheter:** `TEQBOOK_PUBLIC_BOOKING_PROOF_SECRET` anbefales; fallback til avledning fra `PUBLIC_BOOKING_ACTION_TOKEN_SECRET` er dokumentert i kode for operasjonell enkelhet.
