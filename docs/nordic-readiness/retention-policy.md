# Retention Policy

## Kilde

Primær policy ligger i `docs/compliance/data-lifecycle.md`.

## Nøkkelperioder (nåværende policy)

- Bookingdata: 7 år (for regnskap/etterprøvbarhet)
- Inaktive kunder: 2 år etter siste booking
- Inaktive ansatte: 1 år etter deaktivering
- Kansellerte salonger: 1 år etter kansellering

## Krav til drift

- Retention skal håndheves konsistent i database og eventuelle bakgrunnsjobber.
- Endringer i retention-perioder skal oppdateres i:
  - `docs/compliance/data-lifecycle.md`
  - `docs/nordic-readiness/retention-policy.md`

## Status

- Policy er dokumentert.
- Full teknisk håndheving for alle policy-deler er delvis planlagt.
