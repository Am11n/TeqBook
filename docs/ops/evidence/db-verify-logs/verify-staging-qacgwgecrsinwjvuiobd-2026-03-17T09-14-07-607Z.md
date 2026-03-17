# DB Verification Run
target=staging
project_ref=qacgwgecrsinwjvuiobd
started_at=2026-03-17T09:14:07.608Z

## supabase/supabase/verification/00_schema_and_security.sql (attempt 1/5)
DO
  verification_result   
------------------------
 schema_and_security_ok
(1 row)



## supabase/supabase/verification/01_booking_integrity.sql (attempt 1/5)
DO
 verification_result  
----------------------
 booking_integrity_ok
(1 row)



## supabase/supabase/verification/02_data_quality.sql (attempt 1/5)

psql: error: connection to server at "aws-1-eu-central-1.pooler.supabase.com" (3.65.151.229), port 5432 failed: FATAL:  password authentication failed for user "postgres"
retrying_after_ms=3000 reason=transient_connection_error

## supabase/supabase/verification/02_data_quality.sql (attempt 2/5)
DO
 verification_result 
---------------------
 data_quality_ok
(1 row)



completed_at=2026-03-17T09:14:12.059Z
status=success
