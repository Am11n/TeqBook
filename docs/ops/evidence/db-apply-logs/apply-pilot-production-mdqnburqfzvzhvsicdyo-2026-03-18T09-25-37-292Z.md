# DB Apply Run
target=pilot-production
project_ref=mdqnburqfzvzhvsicdyo
manifest=supabase/supabase/migration-manifest.json
started_at=2026-03-18T09:25:37.293Z

## supabase/supabase/baseline/BASELINE.sql (attempt 1/5)
elapsed_ms=137
status=failed
Error: self-signed certificate in certificate chain
    at TLSSocket.onConnectSecure (node:_tls_wrap:1679:34)
    at TLSSocket.emit (node:events:519:28)
    at TLSSocket._finishInit (node:_tls_wrap:1078:8)
    at ssl.onhandshakedone (node:_tls_wrap:864:12)