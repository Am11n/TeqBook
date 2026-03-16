# DB Verification Run
target=staging
project_ref=qacgwgecrsinwjvuiobd
started_at=2026-03-16T16:06:19.468Z

## supabase/supabase/verification/00_schema_and_security.sql
DO
  verification_result   
------------------------
 schema_and_security_ok
(1 row)



## supabase/supabase/verification/01_booking_integrity.sql
DO
 verification_result  
----------------------
 booking_integrity_ok
(1 row)



## supabase/supabase/verification/02_data_quality.sql

psql: error: connection to server at "aws-1-eu-central-1.pooler.supabase.com" (3.65.151.229), port 5432 failed: FATAL:  password authentication failed for user "postgres"
