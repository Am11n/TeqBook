# DB Verification Run
target=pilot-production
project_ref=mdqnburqfzvzhvsicdyo
started_at=2026-03-16T15:45:09.462Z

## supabase/supabase/verification/00_schema_and_security.sql

psql:/Users/aminismail/Documents/GitHub/TeqBook/supabase/supabase/verification/00_schema_and_security.sql:85: NOTICE:  Missing table: salons
psql:/Users/aminismail/Documents/GitHub/TeqBook/supabase/supabase/verification/00_schema_and_security.sql:85: NOTICE:  Missing table: profiles
psql:/Users/aminismail/Documents/GitHub/TeqBook/supabase/supabase/verification/00_schema_and_security.sql:85: NOTICE:  Missing table: bookings
psql:/Users/aminismail/Documents/GitHub/TeqBook/supabase/supabase/verification/00_schema_and_security.sql:85: NOTICE:  Missing table: services
psql:/Users/aminismail/Documents/GitHub/TeqBook/supabase/supabase/verification/00_schema_and_security.sql:85: NOTICE:  Missing table: employees
psql:/Users/aminismail/Documents/GitHub/TeqBook/supabase/supabase/verification/00_schema_and_security.sql:85: NOTICE:  Missing table: customers
psql:/Users/aminismail/Documents/GitHub/TeqBook/supabase/supabase/verification/00_schema_and_security.sql:85: NOTICE:  Missing table: opening_hours
psql:/Users/aminismail/Documents/GitHub/TeqBook/supabase/supabase/verification/00_schema_and_security.sql:85: NOTICE:  Missing table: shifts
psql:/Users/aminismail/Documents/GitHub/TeqBook/supabase/supabase/verification/00_schema_and_security.sql:85: NOTICE:  RLS not enabled on bookings
psql:/Users/aminismail/Documents/GitHub/TeqBook/supabase/supabase/verification/00_schema_and_security.sql:85: NOTICE:  No RLS policies found for bookings
psql:/Users/aminismail/Documents/GitHub/TeqBook/supabase/supabase/verification/00_schema_and_security.sql:85: NOTICE:  No RLS policies found for customers
psql:/Users/aminismail/Documents/GitHub/TeqBook/supabase/supabase/verification/00_schema_and_security.sql:85: NOTICE:  Missing core create booking function
psql:/Users/aminismail/Documents/GitHub/TeqBook/supabase/supabase/verification/00_schema_and_security.sql:85: ERROR:  Schema/security verification failed. Missing checks: 12
CONTEXT:  PL/pgSQL function inline_code_block line 80 at RAISE
