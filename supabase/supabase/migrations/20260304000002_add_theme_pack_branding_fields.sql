-- Theme pack branding model (snapshot strategy A)
alter table public.salons
  add column if not exists theme_pack_id text,
  add column if not exists theme_pack_version integer,
  add column if not exists theme_pack_hash text,
  add column if not exists theme_pack_snapshot jsonb,
  add column if not exists theme_overrides jsonb;

comment on column public.salons.theme_pack_id is
  'Selected theme pack id (metadata only with snapshot strategy).';
comment on column public.salons.theme_pack_version is
  'Theme pack version at time of selection (metadata).';
comment on column public.salons.theme_pack_hash is
  'Deterministic hash of persisted snapshot tokens for introspection.';
comment on column public.salons.theme_pack_snapshot is
  'Theme pack snapshot used as runtime source-of-truth.';
comment on column public.salons.theme_overrides is
  'Validated and plan-gated override object.';
