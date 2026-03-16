# DB Verification Run
target=pilot-production
project_ref=mdqnburqfzvzhvsicdyo
started_at=2026-03-16T15:50:00.269Z

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
DO
 verification_result 
---------------------
 data_quality_ok
(1 row)



completed_at=2026-03-16T15:50:01.621Z
status=success
