# DB Verification Run
target=staging
project_ref=qacgwgecrsinwjvuiobd
started_at=2026-03-17T09:03:13.647Z

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
DO
 verification_result 
---------------------
 data_quality_ok
(1 row)



completed_at=2026-03-17T09:03:15.187Z
status=success
