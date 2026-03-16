--
-- PostgreSQL database dump
--

\restrict vxdpoLHvEBGUmEZngUWsHnH1x7zPhckdacNSEx1vSqvkf3gd8db6nFYmemmoLr7

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_cron IS 'Enables scheduled jobs (cron) for processing reminders';


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA public;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_net IS 'Enables HTTP requests from PostgreSQL for calling Edge Functions';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_status AS ENUM (
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'no-show',
    'scheduled'
);


--
-- Name: calendar_provider; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.calendar_provider AS ENUM (
    'google',
    'outlook',
    'apple'
);


--
-- Name: employee_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.employee_role AS ENUM (
    'owner',
    'manager',
    'staff'
);


--
-- Name: notification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_status AS ENUM (
    'pending',
    'sent',
    'failed'
);


--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_type AS ENUM (
    'sms',
    'email',
    'whatsapp'
);


--
-- Name: owner_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.owner_role AS ENUM (
    'owner',
    'co_owner',
    'manager'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'in_salon',
    'online'
);


--
-- Name: plan_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.plan_type AS ENUM (
    'starter',
    'pro',
    'business'
);


--
-- Name: sync_direction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sync_direction AS ENUM (
    'push',
    'pull',
    'bidirectional'
);


--
-- Name: template_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.template_type AS ENUM (
    'staff',
    'service',
    'shift_schedule'
);


--
-- Name: template_visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.template_visibility AS ENUM (
    'private',
    'shared',
    'public'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: acquire_waitlist_lifecycle_lock(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.acquire_waitlist_lifecycle_lock() RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT pg_try_advisory_lock(9223372000001);
$$;


--
-- Name: check_salon_has_owner(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_salon_has_owner() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Check if there's at least one profile with this salon_id
  IF NOT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE salon_id = NEW.id
  ) THEN
    RAISE EXCEPTION 'Salon must have at least one owner. A profile with salon_id must be created when salon is created.';
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: claim_waitlist_offer_atomic(text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.claim_waitlist_offer_atomic(p_token text, p_action text DEFAULT 'accept'::text, p_response_channel text DEFAULT 'email_link'::text) RETURNS TABLE(ok boolean, message text, offer_id uuid, waitlist_entry_id uuid, booking_id uuid, result_status text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
DECLARE
  token_digest TEXT;
  selected_offer waitlist_offers%ROWTYPE;
  selected_entry waitlist_entries%ROWTYPE;
  policy_record RECORD;
  created_booking RECORD;
  apply_passive BOOLEAN;
BEGIN
  IF p_action NOT IN ('accept', 'decline') THEN
    RETURN QUERY SELECT false, 'Invalid action', NULL::UUID, NULL::UUID, NULL::UUID, 'invalid_action'::TEXT;
    RETURN;
  END IF;

  IF p_response_channel NOT IN ('sms_link', 'email_link', 'dashboard', 'system') THEN
    RETURN QUERY SELECT false, 'Invalid response channel', NULL::UUID, NULL::UUID, NULL::UUID, 'invalid_channel'::TEXT;
    RETURN;
  END IF;

  token_digest := encode(digest(p_token, 'sha256'), 'hex');

  SELECT *
  INTO selected_offer
  FROM waitlist_offers
  WHERE token_hash = token_digest
    AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Offer is invalid or already processed', NULL::UUID, NULL::UUID, NULL::UUID, 'offer_not_found'::TEXT;
    RETURN;
  END IF;

  IF selected_offer.token_expires_at <= now() THEN
    UPDATE waitlist_offers
    SET status = 'expired', responded_at = now(), response_channel = 'system', updated_at = now()
    WHERE id = selected_offer.id;

    RETURN QUERY
      SELECT false, 'Offer has expired', selected_offer.id, selected_offer.waitlist_entry_id, NULL::UUID, 'expired'::TEXT;
    RETURN;
  END IF;

  SELECT *
  INTO selected_entry
  FROM waitlist_entries
  WHERE id = selected_offer.waitlist_entry_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Waitlist entry not found', selected_offer.id, NULL::UUID, NULL::UUID, 'entry_not_found'::TEXT;
    RETURN;
  END IF;

  SELECT * INTO policy_record
  FROM resolve_waitlist_policy(selected_entry.salon_id, selected_entry.service_id);

  IF p_action = 'decline' THEN
    apply_passive := (COALESCE(selected_entry.decline_count, 0) + 1) >= COALESCE(policy_record.passive_decline_threshold, 3);

    UPDATE waitlist_entries
    SET
      status = 'cooldown',
      decline_count = COALESCE(decline_count, 0) + 1,
      cooldown_reason = 'declined',
      cooldown_until = now() + make_interval(mins => CASE
        WHEN apply_passive THEN COALESCE(policy_record.passive_cooldown_minutes, 10080)
        ELSE COALESCE(policy_record.cooldown_minutes, 60)
      END)
    WHERE id = selected_entry.id;

    UPDATE waitlist_offers
    SET
      status = 'declined',
      responded_at = now(),
      response_channel = p_response_channel,
      updated_at = now()
    WHERE id = selected_offer.id;

    INSERT INTO waitlist_lifecycle_events (
      waitlist_entry_id,
      salon_id,
      from_status,
      to_status,
      reason,
      metadata
    )
    VALUES (
      selected_entry.id,
      selected_entry.salon_id,
      selected_entry.status,
      'cooldown',
      'declined_offer',
      jsonb_build_object(
        'offer_id', selected_offer.id,
        'response_channel', p_response_channel,
        'passive_applied', apply_passive
      )
    );

    RETURN QUERY
      SELECT true, 'Offer declined', selected_offer.id, selected_entry.id, NULL::UUID, 'declined'::TEXT;
    RETURN;
  END IF;

  SELECT *
  INTO created_booking
  FROM create_booking_atomic(
    selected_entry.salon_id,
    selected_offer.employee_id,
    selected_entry.service_id,
    selected_offer.slot_start,
    selected_entry.customer_name,
    selected_entry.customer_email,
    selected_entry.customer_phone,
    NULL,
    false
  )
  LIMIT 1;

  UPDATE waitlist_entries
  SET
    status = 'booked',
    booking_id = created_booking.id,
    cooldown_until = NULL,
    cooldown_reason = NULL
  WHERE id = selected_entry.id;

  UPDATE waitlist_offers
  SET
    status = 'accepted',
    booking_id = created_booking.id,
    responded_at = now(),
    response_channel = p_response_channel,
    updated_at = now()
  WHERE id = selected_offer.id;

  INSERT INTO waitlist_lifecycle_events (
    waitlist_entry_id,
    salon_id,
    from_status,
    to_status,
    reason,
    metadata
  )
  VALUES (
    selected_entry.id,
    selected_entry.salon_id,
    selected_entry.status,
    'booked',
    'claim_accepted',
    jsonb_build_object(
      'offer_id', selected_offer.id,
      'booking_id', created_booking.id,
      'response_channel', p_response_channel
    )
  );

  RETURN QUERY
    SELECT true, 'Offer accepted and booking created', selected_offer.id, selected_entry.id, created_booking.id, 'accepted'::TEXT;
END;
$$;


--
-- Name: cleanup_old_audit_logs(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_old_audit_logs(retention_days integer DEFAULT 365) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM security_audit_log
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;


--
-- Name: cleanup_old_rate_limit_entries(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_old_rate_limit_entries() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM rate_limit_entries
  WHERE updated_at < NOW() - INTERVAL '24 hours'
    AND (blocked_until IS NULL OR blocked_until < NOW());
END;
$$;


--
-- Name: cleanup_old_sms_log(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_old_sms_log(retention_days integer DEFAULT 365) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sms_log
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;


--
-- Name: FUNCTION cleanup_old_sms_log(retention_days integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.cleanup_old_sms_log(retention_days integer) IS 'Deletes sms_log rows older than retention_days. Intended for scheduled cleanup.';


--
-- Name: cleanup_test_salon_data(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_test_salon_data(p_salon_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Delete related data first
  DELETE FROM bookings WHERE salon_id = p_salon_id;
  DELETE FROM customers WHERE salon_id = p_salon_id;
  DELETE FROM shifts WHERE salon_id = p_salon_id;
  DELETE FROM employees WHERE salon_id = p_salon_id;
  DELETE FROM services WHERE salon_id = p_salon_id;
  DELETE FROM products WHERE salon_id = p_salon_id;
  DELETE FROM opening_hours WHERE salon_id = p_salon_id;
  
  -- Temporarily disable triggers to allow profile/salon deletion
  ALTER TABLE profiles DISABLE TRIGGER ALL;
  ALTER TABLE salons DISABLE TRIGGER ALL;
  
  -- Delete profiles linked to this salon
  DELETE FROM profiles WHERE salon_id = p_salon_id;
  
  -- Delete the salon
  DELETE FROM salons WHERE id = p_salon_id;
  
  -- Re-enable triggers
  ALTER TABLE profiles ENABLE TRIGGER ALL;
  ALTER TABLE salons ENABLE TRIGGER ALL;
END;
$$;


--
-- Name: FUNCTION cleanup_test_salon_data(p_salon_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.cleanup_test_salon_data(p_salon_id uuid) IS 'Test helper function to clean up a test salon and all related data. Used only for integration tests.';


--
-- Name: convert_waitlist_entry_to_booking_atomic(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.convert_waitlist_entry_to_booking_atomic(p_salon_id uuid, p_waitlist_entry_id uuid, p_actor_user_id uuid DEFAULT NULL::uuid) RETURNS TABLE(ok boolean, message text, waitlist_entry_id uuid, booking_id uuid, offer_id uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  selected_entry waitlist_entries%ROWTYPE;
  selected_offer waitlist_offers%ROWTYPE;
  created_booking RECORD;
  effective_slot_start TIMESTAMPTZ;
  effective_employee_id UUID;
BEGIN
  SELECT *
  INTO selected_entry
  FROM waitlist_entries
  WHERE id = p_waitlist_entry_id
    AND salon_id = p_salon_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Waitlist entry not found', NULL::UUID, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  IF selected_entry.status <> 'notified' THEN
    RETURN QUERY SELECT false, 'Only notified entries can be converted to booking', selected_entry.id, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  SELECT w.*
  INTO selected_offer
  FROM waitlist_offers w
  WHERE w.waitlist_entry_id = selected_entry.id
    AND w.status = 'pending'
  ORDER BY w.created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    effective_slot_start := selected_offer.slot_start;
    effective_employee_id := selected_offer.employee_id;
  ELSE
    IF selected_entry.employee_id IS NULL OR selected_entry.preferred_time_start IS NULL THEN
      RETURN QUERY SELECT false, 'No pending offer and no explicit employee/time on entry', selected_entry.id, NULL::UUID, NULL::UUID;
      RETURN;
    END IF;
    effective_slot_start := (selected_entry.preferred_date::text || 'T' || selected_entry.preferred_time_start::text || 'Z')::timestamptz;
    effective_employee_id := selected_entry.employee_id;
  END IF;

  SELECT *
  INTO created_booking
  FROM create_booking_atomic(
    selected_entry.salon_id,
    effective_employee_id,
    selected_entry.service_id,
    effective_slot_start,
    selected_entry.customer_name,
    selected_entry.customer_email,
    selected_entry.customer_phone,
    NULL,
    false
  )
  LIMIT 1;

  UPDATE waitlist_entries
  SET
    status = 'booked',
    booking_id = created_booking.id,
    cooldown_until = NULL,
    cooldown_reason = NULL
  WHERE id = selected_entry.id;

  IF FOUND THEN
    UPDATE waitlist_offers
    SET
      status = 'accepted',
      booking_id = created_booking.id,
      responded_at = now(),
      response_channel = 'dashboard',
      updated_at = now()
    WHERE id = selected_offer.id
      AND status = 'pending';
  END IF;

  INSERT INTO waitlist_lifecycle_events (
    waitlist_entry_id,
    salon_id,
    from_status,
    to_status,
    reason,
    metadata
  )
  VALUES (
    selected_entry.id,
    selected_entry.salon_id,
    selected_entry.status,
    'booked',
    'dashboard_convert_to_booking',
    jsonb_build_object(
      'offer_id', selected_offer.id,
      'booking_id', created_booking.id,
      'actor_user_id', p_actor_user_id
    )
  );

  RETURN QUERY SELECT true, 'Booking created from waitlist entry', selected_entry.id, created_booking.id, selected_offer.id;
END;
$$;


--
-- Name: create_audit_log_entry(uuid, uuid, text, text, text, jsonb, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_audit_log_entry(p_user_id uuid, p_salon_id uuid, p_action text, p_resource_type text, p_resource_id text, p_metadata jsonb DEFAULT NULL::jsonb, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text) RETURNS TABLE(id uuid, user_id uuid, salon_id uuid, action text, resource_type text, resource_id text, metadata jsonb, ip_address text, user_agent text, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_current_user_id UUID;
  v_audit_log security_audit_log;
BEGIN
  -- Get current authenticated user
  v_current_user_id := auth.uid();
  
  -- Verify user is authenticated
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create audit log';
  END IF;
  
  -- Verify user has access to salon (if salon_id is provided)
  IF p_salon_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = v_current_user_id
        AND profiles.salon_id = p_salon_id
    ) THEN
      RAISE EXCEPTION 'User does not have access to salon %', p_salon_id;
    END IF;
  END IF;
  
  -- Insert audit log entry and return the full row
  INSERT INTO security_audit_log (
    user_id,
    salon_id,
    action,
    resource_type,
    resource_id,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_salon_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_metadata,
    p_ip_address,
    p_user_agent
  )
  RETURNING * INTO v_audit_log;
  
  -- Return the created audit log entry
  RETURN QUERY SELECT
    v_audit_log.id,
    v_audit_log.user_id,
    v_audit_log.salon_id,
    v_audit_log.action,
    v_audit_log.resource_type,
    v_audit_log.resource_id,
    v_audit_log.metadata,
    v_audit_log.ip_address,
    v_audit_log.user_agent,
    v_audit_log.created_at;
END;
$$;


--
-- Name: FUNCTION create_audit_log_entry(p_user_id uuid, p_salon_id uuid, p_action text, p_resource_type text, p_resource_id text, p_metadata jsonb, p_ip_address text, p_user_agent text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_audit_log_entry(p_user_id uuid, p_salon_id uuid, p_action text, p_resource_type text, p_resource_id text, p_metadata jsonb, p_ip_address text, p_user_agent text) IS 'Creates an audit log entry. Bypasses RLS but verifies user has access to salon.';


--
-- Name: create_booking_atomic(uuid, uuid, uuid, timestamp with time zone, text, text, text, text, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_booking_atomic(p_salon_id uuid, p_employee_id uuid, p_service_id uuid, p_start_time timestamp with time zone, p_customer_full_name text, p_customer_email text DEFAULT NULL::text, p_customer_phone text DEFAULT NULL::text, p_customer_notes text DEFAULT NULL::text, p_is_walk_in boolean DEFAULT false) RETURNS TABLE(id uuid, start_time timestamp with time zone, end_time timestamp with time zone, status text, is_walk_in boolean, notes text, customers jsonb, employees jsonb, services jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_service_duration INTEGER;
  v_prep INTEGER;
  v_cleanup INTEGER;
  v_end_time TIMESTAMPTZ;
  v_block_start TIMESTAMPTZ;
  v_block_end TIMESTAMPTZ;
  v_customer_id UUID;
  v_booking_id UUID;
  v_conflicting_booking_id UUID;
  v_conflicting_block_id UUID;
BEGIN
  -- Get service duration + buffers
  SELECT services.duration_minutes,
         COALESCE(services.prep_minutes, 0),
         COALESCE(services.cleanup_minutes, 0)
    INTO v_service_duration, v_prep, v_cleanup
    FROM services
   WHERE services.id = p_service_id AND services.salon_id = p_salon_id;

  IF v_service_duration IS NULL THEN
    RAISE EXCEPTION 'Service not found or does not belong to salon';
  END IF;

  -- Calculate end time and buffer zone
  v_end_time    := p_start_time + (v_service_duration || ' minutes')::INTERVAL;
  v_block_start := p_start_time - (v_prep || ' minutes')::INTERVAL;
  v_block_end   := v_end_time + (v_cleanup || ' minutes')::INTERVAL;

  -- ATOMIC CHECK: Lock and check for overlapping bookings (buffer-aware)
  SELECT bookings.id INTO v_conflicting_booking_id
  FROM bookings
  WHERE bookings.salon_id = p_salon_id
    AND bookings.employee_id = p_employee_id
    AND bookings.start_time < v_block_end
    AND bookings.end_time > v_block_start
    AND bookings.status NOT IN ('cancelled', 'no-show')
  FOR UPDATE
  LIMIT 1;

  IF v_conflicting_booking_id IS NOT NULL THEN
    RAISE EXCEPTION 'Time slot is already booked (including buffer time). Please select another time.';
  END IF;

  -- Check for time_block overlap
  SELECT tb.id INTO v_conflicting_block_id
  FROM time_blocks tb
  WHERE tb.salon_id = p_salon_id
    AND (tb.employee_id = p_employee_id OR tb.employee_id IS NULL)
    AND (
      (tb.is_all_day AND tb.start_time::DATE = p_start_time::DATE)
      OR (NOT tb.is_all_day AND tb.start_time < v_block_end AND tb.end_time > v_block_start)
    )
  LIMIT 1;

  IF v_conflicting_block_id IS NOT NULL THEN
    RAISE EXCEPTION 'Time slot overlaps with a blocked time period. Please select another time.';
  END IF;

  -- Upsert customer
  INSERT INTO customers (salon_id, full_name, email, phone, notes)
  VALUES (p_salon_id, p_customer_full_name, p_customer_email, p_customer_phone, p_customer_notes)
  ON CONFLICT (salon_id, email) WHERE email IS NOT NULL
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, customers.phone),
    notes = COALESCE(EXCLUDED.notes, customers.notes)
  RETURNING customers.id INTO v_customer_id;

  IF v_customer_id IS NULL THEN
    SELECT customers.id INTO v_customer_id
    FROM customers
    WHERE customers.salon_id = p_salon_id
      AND (
        (customers.email IS NOT NULL AND customers.email = p_customer_email)
        OR (customers.email IS NULL AND customers.full_name = p_customer_full_name)
      )
    LIMIT 1;
  END IF;

  -- Create booking
  INSERT INTO bookings (salon_id, employee_id, service_id, customer_id, start_time, end_time, status, is_walk_in, notes)
  VALUES (
    p_salon_id, p_employee_id, p_service_id, v_customer_id,
    p_start_time, v_end_time,
    CASE WHEN p_is_walk_in THEN 'pending' ELSE 'confirmed' END,
    p_is_walk_in, p_customer_notes
  )
  RETURNING bookings.id INTO v_booking_id;

  -- Return booking with related data
  RETURN QUERY
  SELECT b.id, b.start_time, b.end_time, b.status, b.is_walk_in, b.notes,
    jsonb_build_object('full_name', c.full_name) as customers,
    jsonb_build_object('full_name', e.full_name) as employees,
    jsonb_build_object('name', s.name) as services
  FROM bookings b
  LEFT JOIN customers c ON b.customer_id = c.id
  LEFT JOIN employees e ON b.employee_id = e.id
  LEFT JOIN services s ON b.service_id = s.id
  WHERE b.id = v_booking_id;
END;
$$;


--
-- Name: FUNCTION create_booking_atomic(p_salon_id uuid, p_employee_id uuid, p_service_id uuid, p_start_time timestamp with time zone, p_customer_full_name text, p_customer_email text, p_customer_phone text, p_customer_notes text, p_is_walk_in boolean); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_booking_atomic(p_salon_id uuid, p_employee_id uuid, p_service_id uuid, p_start_time timestamp with time zone, p_customer_full_name text, p_customer_email text, p_customer_phone text, p_customer_notes text, p_is_walk_in boolean) IS 'Creates a booking atomically with buffer-aware overlap checking. Checks time_blocks. Uses SELECT ... FOR UPDATE.';


--
-- Name: create_booking_with_validation(uuid, uuid, uuid, timestamp with time zone, text, text, text, text, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_booking_with_validation(p_salon_id uuid, p_employee_id uuid, p_service_id uuid, p_start_time timestamp with time zone, p_customer_full_name text, p_customer_email text DEFAULT NULL::text, p_customer_phone text DEFAULT NULL::text, p_customer_notes text DEFAULT NULL::text, p_is_walk_in boolean DEFAULT false) RETURNS TABLE(id uuid, start_time timestamp with time zone, end_time timestamp with time zone, status text, is_walk_in boolean, notes text, customers jsonb, employees jsonb, services jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_service_duration INTEGER;
  v_end_time TIMESTAMPTZ;
  v_customer_id UUID;
  v_booking_id UUID;
BEGIN
  -- Get service duration (using explicit table prefix)
  SELECT services.duration_minutes INTO v_service_duration
  FROM services
  WHERE services.id = p_service_id AND services.salon_id = p_salon_id;

  IF v_service_duration IS NULL THEN
    RAISE EXCEPTION 'Service not found or does not belong to salon';
  END IF;

  -- Calculate end time
  v_end_time := p_start_time + (v_service_duration || ' minutes')::INTERVAL;

  -- Check for overlapping bookings (using explicit table prefixes)
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.salon_id = p_salon_id
      AND bookings.employee_id = p_employee_id
      AND (
        (bookings.start_time < v_end_time AND bookings.end_time > p_start_time)
        OR (bookings.start_time = p_start_time)
      )
      AND bookings.status NOT IN ('cancelled', 'no-show')
  ) THEN
    RAISE EXCEPTION 'Time slot is already booked';
  END IF;

  -- Upsert customer
  INSERT INTO customers (salon_id, full_name, email, phone, notes)
  VALUES (p_salon_id, p_customer_full_name, p_customer_email, p_customer_phone, p_customer_notes)
  ON CONFLICT (salon_id, email) WHERE email IS NOT NULL
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, customers.phone),
    notes = COALESCE(EXCLUDED.notes, customers.notes)
  RETURNING customers.id INTO v_customer_id;

  -- If no email conflict, get the customer_id from the insert (using explicit table prefix)
  IF v_customer_id IS NULL THEN
    SELECT customers.id INTO v_customer_id
    FROM customers
    WHERE customers.salon_id = p_salon_id
      AND (
        (customers.email IS NOT NULL AND customers.email = p_customer_email)
        OR (customers.email IS NULL AND customers.full_name = p_customer_full_name)
      )
    LIMIT 1;
  END IF;

  -- Create booking with default status 'pending' for walk-ins, 'confirmed' for online
  INSERT INTO bookings (
    salon_id,
    employee_id,
    service_id,
    customer_id,
    start_time,
    end_time,
    status,
    is_walk_in,
    notes
  )
  VALUES (
    p_salon_id,
    p_employee_id,
    p_service_id,
    v_customer_id,
    p_start_time,
    v_end_time,
    CASE WHEN p_is_walk_in THEN 'pending' ELSE 'confirmed' END,
    p_is_walk_in,
    p_customer_notes
  )
  RETURNING bookings.id INTO v_booking_id;

  -- Return booking with related data (using explicit table prefixes)
  RETURN QUERY
  SELECT
    b.id,
    b.start_time,
    b.end_time,
    b.status,
    b.is_walk_in,
    b.notes,
    jsonb_build_object('full_name', c.full_name) as customers,
    jsonb_build_object('full_name', e.full_name) as employees,
    jsonb_build_object('name', s.name) as services
  FROM bookings b
  LEFT JOIN customers c ON b.customer_id = c.id
  LEFT JOIN employees e ON b.employee_id = e.id
  LEFT JOIN services s ON b.service_id = s.id
  WHERE b.id = v_booking_id;
END;
$$;


--
-- Name: FUNCTION create_booking_with_validation(p_salon_id uuid, p_employee_id uuid, p_service_id uuid, p_start_time timestamp with time zone, p_customer_full_name text, p_customer_email text, p_customer_phone text, p_customer_notes text, p_is_walk_in boolean); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_booking_with_validation(p_salon_id uuid, p_employee_id uuid, p_service_id uuid, p_start_time timestamp with time zone, p_customer_full_name text, p_customer_email text, p_customer_phone text, p_customer_notes text, p_is_walk_in boolean) IS 'Creates a booking with validation. Uses explicit table prefixes to avoid ambiguous column references.';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: feedback_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedback_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid,
    user_id uuid,
    type text DEFAULT 'feature_request'::text NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    title text NOT NULL,
    description text,
    votes integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    priority text DEFAULT 'medium'::text,
    admin_owner_id uuid,
    resolved_at timestamp with time zone,
    delivered_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    changelog_entry_id uuid,
    CONSTRAINT feedback_entries_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))),
    CONSTRAINT feedback_entries_status_check CHECK ((status = ANY (ARRAY['new'::text, 'planned'::text, 'in_progress'::text, 'delivered'::text, 'rejected'::text]))),
    CONSTRAINT feedback_entries_type_check CHECK ((type = ANY (ARRAY['feature_request'::text, 'bug_report'::text, 'improvement'::text, 'other'::text])))
);


--
-- Name: create_feedback_entry_for_salon(text, text, text, jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_feedback_entry_for_salon(p_title text, p_description text DEFAULT NULL::text, p_type text DEFAULT 'feature_request'::text, p_attachment_paths jsonb DEFAULT '[]'::jsonb, p_metadata jsonb DEFAULT '{}'::jsonb) RETURNS public.feedback_entries
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_caller_id UUID;
  v_salon_id UUID;
  v_salon_name TEXT;
  v_salon_plan TEXT;
  v_priority TEXT;
  v_recent_user_count INTEGER;
  v_recent_salon_count INTEGER;
  v_existing feedback_entries;
  v_new_entry feedback_entries;
BEGIN
  -- 1. Get caller info
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get salon_id from profiles (must be an owner)
  SELECT p.salon_id INTO v_salon_id
  FROM profiles p
  WHERE p.user_id = v_caller_id
    AND p.salon_id IS NOT NULL
    AND p.role = 'owner';

  IF v_salon_id IS NULL THEN
    RAISE EXCEPTION 'No salon found for this user or user is not a salon owner';
  END IF;

  -- Validate type
  IF p_type NOT IN ('feature_request', 'bug_report', 'improvement', 'other') THEN
    RAISE EXCEPTION 'Invalid feedback type: %', p_type;
  END IF;

  -- 2. Rate limiting
  -- Max 10 per day per user
  SELECT COUNT(*) INTO v_recent_user_count
  FROM feedback_entries fe
  WHERE fe.user_id = v_caller_id
    AND fe.created_at > NOW() - INTERVAL '1 day';

  IF v_recent_user_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded. You can submit up to 10 feedback entries per day. Please try again later.'
      USING ERRCODE = 'P0002';
  END IF;

  -- Max 20 per week per salon
  SELECT COUNT(*) INTO v_recent_salon_count
  FROM feedback_entries fe
  WHERE fe.salon_id = v_salon_id
    AND fe.created_at > NOW() - INTERVAL '7 days';

  IF v_recent_salon_count >= 20 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Your salon can submit up to 20 feedback entries per week. Please try again later.'
      USING ERRCODE = 'P0002';
  END IF;

  -- 3. Dupe check: same title (case-insensitive) + type within last 7 days for this salon
  SELECT * INTO v_existing
  FROM feedback_entries fe
  WHERE fe.salon_id = v_salon_id
    AND LOWER(TRIM(fe.title)) = LOWER(TRIM(p_title))
    AND fe.type = p_type
    AND fe.created_at > NOW() - INTERVAL '7 days'
  LIMIT 1;

  IF v_existing.id IS NOT NULL THEN
    -- Return existing entry so the client can show "already tracking this"
    RETURN v_existing;
  END IF;

  -- 4. Lookup salon plan and map to priority
  SELECT s.name, s.plan::TEXT INTO v_salon_name, v_salon_plan
  FROM salons s
  WHERE s.id = v_salon_id;

  CASE v_salon_plan
    WHEN 'business' THEN v_priority := 'high';
    WHEN 'pro'      THEN v_priority := 'medium';
    ELSE                  v_priority := 'low';
  END CASE;

  -- 5. Insert the feedback entry
  INSERT INTO feedback_entries (
    salon_id, user_id, type, status, priority,
    title, description, metadata
  )
  VALUES (
    v_salon_id,
    v_caller_id,
    p_type,
    'new',
    v_priority,
    TRIM(p_title),
    NULLIF(TRIM(COALESCE(p_description, '')), ''),
    jsonb_build_object(
      'source', 'dashboard',
      'salon_name', v_salon_name,
      'salon_plan', v_salon_plan,
      'attachments', p_attachment_paths
    ) || p_metadata
  )
  RETURNING * INTO v_new_entry;

  -- 6. Audit log
  INSERT INTO security_audit_log (
    user_id, action, resource_type, resource_id,
    metadata, ip_address
  )
  VALUES (
    v_caller_id,
    'feedback_entry_created',
    'feedback_entry',
    v_new_entry.id::TEXT,
    jsonb_build_object(
      'title', p_title,
      'type', p_type,
      'priority', v_priority,
      'salon_id', v_salon_id,
      'salon_plan', v_salon_plan
    ),
    '0.0.0.0'
  );

  -- 7. Return
  RETURN v_new_entry;
END;
$$;


--
-- Name: FUNCTION create_feedback_entry_for_salon(p_title text, p_description text, p_type text, p_attachment_paths jsonb, p_metadata jsonb); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_feedback_entry_for_salon(p_title text, p_description text, p_type text, p_attachment_paths jsonb, p_metadata jsonb) IS 'Salon owners submit feedback. Auto-sets salon_id/priority from profile/plan, enforces rate limit (10/day user, 20/week salon), detects duplicates, logs to audit.';


--
-- Name: create_notification_for_user(uuid, uuid, text, text, text, jsonb, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_notification_for_user(p_user_id uuid, p_salon_id uuid, p_type text, p_title text, p_body text, p_metadata jsonb DEFAULT NULL::jsonb, p_action_url text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Validate type
  IF p_type NOT IN ('booking', 'system', 'staff', 'info') THEN
    RAISE EXCEPTION 'Invalid notification type: %', p_type;
  END IF;

  -- Insert the notification
  INSERT INTO notifications (
    user_id,
    salon_id,
    type,
    title,
    body,
    metadata,
    action_url,
    read
  ) VALUES (
    p_user_id,
    p_salon_id,
    p_type,
    p_title,
    p_body,
    p_metadata,
    p_action_url,
    FALSE
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;


--
-- Name: FUNCTION create_notification_for_user(p_user_id uuid, p_salon_id uuid, p_type text, p_title text, p_body text, p_metadata jsonb, p_action_url text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_notification_for_user(p_user_id uuid, p_salon_id uuid, p_type text, p_title text, p_body text, p_metadata jsonb, p_action_url text) IS 'Create an in-app notification for any user (bypasses RLS)';


--
-- Name: create_salon_for_current_user(text, text, text, boolean, boolean, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_salon_for_current_user(salon_name text, salon_type_param text DEFAULT 'barber'::text, preferred_language_param text DEFAULT 'en'::text, online_booking_enabled_param boolean DEFAULT false, is_public_param boolean DEFAULT true, whatsapp_number_param text DEFAULT NULL::text, timezone_param text DEFAULT 'Europe/Oslo'::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_user_id UUID;
  v_salon_id UUID;
  v_slug TEXT;
BEGIN
  -- Get the current authenticated user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Generate a slug from the salon name
  v_slug := lower(regexp_replace(regexp_replace(salon_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

  -- Ensure slug is unique by appending a number if needed
  WHILE EXISTS (SELECT 1 FROM salons WHERE slug = v_slug) LOOP
    v_slug := v_slug || '-' || floor(random() * 1000)::TEXT;
  END LOOP;

  -- Create the salon with explicit timezone
  INSERT INTO salons (
    name,
    slug,
    salon_type,
    preferred_language,
    online_booking_enabled,
    is_public,
    whatsapp_number,
    timezone,
    created_at,
    updated_at
  )
  VALUES (
    salon_name,
    v_slug,
    COALESCE(salon_type_param, 'barber'),
    COALESCE(preferred_language_param, 'en'),
    COALESCE(online_booking_enabled_param, false),
    COALESCE(is_public_param, true),
    whatsapp_number_param,
    COALESCE(timezone_param, 'Europe/Oslo'),
    NOW(),
    NOW()
  )
  RETURNING id INTO v_salon_id;

  -- Create or update the profile to link the user to the salon
  INSERT INTO profiles (
    user_id,
    salon_id,
    updated_at
  )
  VALUES (
    v_user_id,
    v_salon_id,
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    salon_id = v_salon_id,
    updated_at = NOW();

  RETURN v_salon_id;
END;
$$;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    booking_id uuid,
    customer_name text NOT NULL,
    rating integer NOT NULL,
    comment text,
    is_approved boolean DEFAULT true NOT NULL,
    source text DEFAULT 'manual'::text NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: create_salon_review(uuid, text, integer, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_salon_review(p_salon_id uuid, p_customer_name text, p_rating integer, p_comment text DEFAULT NULL::text, p_booking_id uuid DEFAULT NULL::uuid) RETURNS public.reviews
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_review public.reviews;
BEGIN
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'rating must be between 1 and 5';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id = p_salon_id
      AND p.salon_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Not allowed to create review for this salon';
  END IF;

  INSERT INTO public.reviews (
    salon_id,
    booking_id,
    customer_name,
    rating,
    comment,
    is_approved,
    source
  )
  VALUES (
    p_salon_id,
    p_booking_id,
    p_customer_name,
    p_rating,
    NULLIF(TRIM(COALESCE(p_comment, '')), ''),
    true,
    'manual'
  )
  RETURNING * INTO v_review;

  RETURN v_review;
END;
$$;


--
-- Name: support_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_cases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid,
    user_id uuid,
    type text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    title text NOT NULL,
    description text,
    assignee_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    category text,
    CONSTRAINT support_cases_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))),
    CONSTRAINT support_cases_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'waiting_on_salon'::text, 'resolved'::text, 'closed'::text]))),
    CONSTRAINT support_cases_type_check CHECK ((type = ANY (ARRAY['onboarding_stuck'::text, 'payment_issue'::text, 'login_problems'::text, 'booking_errors'::text, 'high_cancellation'::text, 'audit_spike'::text, 'manual'::text, 'salon_request'::text])))
);


--
-- Name: TABLE support_cases; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.support_cases IS 'Support cases (tickets) for the admin operations center. Auto-generated or manually created.';


--
-- Name: COLUMN support_cases.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.support_cases.type IS 'Case type: onboarding_stuck, payment_issue, login_problems, booking_errors, high_cancellation, audit_spike, manual';


--
-- Name: COLUMN support_cases.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.support_cases.status IS 'Case status: open, in_progress, resolved, closed';


--
-- Name: COLUMN support_cases.priority; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.support_cases.priority IS 'Case priority: low, medium, high, critical';


--
-- Name: COLUMN support_cases.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.support_cases.metadata IS 'Additional context data as JSON';


--
-- Name: COLUMN support_cases.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.support_cases.category IS 'Topic category: general, booking_issue, payment_issue, account_issue, feature_request, other';


--
-- Name: create_support_case_for_salon(text, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_support_case_for_salon(p_title text, p_description text, p_category text DEFAULT 'general'::text, p_attachment_paths jsonb DEFAULT '[]'::jsonb) RETURNS public.support_cases
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_caller_id UUID;
  v_salon_id UUID;
  v_salon_name TEXT;
  v_salon_plan TEXT;
  v_priority TEXT;
  v_recent_count INTEGER;
  v_new_case support_cases;
BEGIN
  -- 1. Get caller info
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get salon_id from profiles (must be an owner)
  SELECT p.salon_id INTO v_salon_id
  FROM profiles p
  WHERE p.user_id = v_caller_id
    AND p.salon_id IS NOT NULL
    AND p.role = 'owner';

  IF v_salon_id IS NULL THEN
    RAISE EXCEPTION 'No salon found for this user or user is not a salon owner';
  END IF;

  -- 2. Rate limiting: max 5 cases per hour per salon
  SELECT COUNT(*) INTO v_recent_count
  FROM support_cases sc
  WHERE sc.salon_id = v_salon_id
    AND sc.type = 'salon_request'
    AND sc.created_at > NOW() - INTERVAL '1 hour';

  IF v_recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. You can create up to 5 support cases per hour. Please try again later.'
      USING ERRCODE = 'P0002';
  END IF;

  -- 3. Lookup salon plan and map to priority
  SELECT s.name, s.plan::TEXT INTO v_salon_name, v_salon_plan
  FROM salons s
  WHERE s.id = v_salon_id;

  CASE v_salon_plan
    WHEN 'business' THEN v_priority := 'high';
    WHEN 'pro'      THEN v_priority := 'medium';
    ELSE                  v_priority := 'low';
  END CASE;

  -- 4. Insert the support case
  INSERT INTO support_cases (
    salon_id, user_id, type, status, priority,
    title, description, category, metadata
  )
  VALUES (
    v_salon_id,
    v_caller_id,
    'salon_request',
    'open',
    v_priority,
    p_title,
    p_description,
    p_category,
    jsonb_build_object(
      'source', 'dashboard',
      'salon_name', v_salon_name,
      'salon_plan', v_salon_plan,
      'attachments', p_attachment_paths
    )
  )
  RETURNING * INTO v_new_case;

  -- 5. Audit log
  INSERT INTO security_audit_log (
    user_id, action, resource_type, resource_id,
    metadata, ip_address
  )
  VALUES (
    v_caller_id,
    'support_case_created',
    'support_case',
    v_new_case.id::TEXT,
    jsonb_build_object(
      'title', p_title,
      'category', p_category,
      'priority', v_priority,
      'salon_id', v_salon_id,
      'salon_plan', v_salon_plan
    ),
    '0.0.0.0'
  );

  -- 6. Return
  RETURN v_new_case;
END;
$$;


--
-- Name: FUNCTION create_support_case_for_salon(p_title text, p_description text, p_category text, p_attachment_paths jsonb); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_support_case_for_salon(p_title text, p_description text, p_category text, p_attachment_paths jsonb) IS 'Salon owners create a support case. Auto-sets priority from plan, enforces rate limit (5/hour), logs to audit.';


--
-- Name: create_test_salon_with_owner(uuid, text, text, text, boolean, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_test_salon_with_owner(p_owner_user_id uuid, p_name text, p_salon_type text DEFAULT 'barber'::text, p_preferred_language text DEFAULT 'nb'::text, p_online_booking_enabled boolean DEFAULT true, p_is_public boolean DEFAULT true) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_salon_id UUID;
BEGIN
  -- Temporarily disable the trigger to allow creating salon and profile in sequence
  ALTER TABLE salons DISABLE TRIGGER ensure_salon_has_owner;

  -- Create the salon
  INSERT INTO salons (
    name,
    salon_type,
    preferred_language,
    online_booking_enabled,
    is_public
  )
  VALUES (
    p_name,
    p_salon_type,
    p_preferred_language,
    p_online_booking_enabled,
    p_is_public
  )
  RETURNING id INTO v_salon_id;

  -- Create or update the profile to link the user to the salon
  INSERT INTO profiles (
    user_id,
    salon_id
  )
  VALUES (
    p_owner_user_id,
    v_salon_id
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    salon_id = v_salon_id;

  -- Re-enable the trigger
  ALTER TABLE salons ENABLE TRIGGER ensure_salon_has_owner;

  RETURN v_salon_id;
END;
$$;


--
-- Name: FUNCTION create_test_salon_with_owner(p_owner_user_id uuid, p_name text, p_salon_type text, p_preferred_language text, p_online_booking_enabled boolean, p_is_public boolean); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_test_salon_with_owner(p_owner_user_id uuid, p_name text, p_salon_type text, p_preferred_language text, p_online_booking_enabled boolean, p_is_public boolean) IS 'Test helper function to create a salon with an owner profile in a single transaction. Used only for integration tests.';


--
-- Name: sms_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sms_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    included_quota integer DEFAULT 0 NOT NULL,
    hard_cap integer,
    used_count integer DEFAULT 0 NOT NULL,
    overage_count integer DEFAULT 0 NOT NULL,
    overage_cost_estimate numeric(12,4) DEFAULT 0 NOT NULL,
    hard_cap_reached boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sms_usage_count_consistency CHECK ((used_count >= overage_count)),
    CONSTRAINT sms_usage_hard_cap_check CHECK (((hard_cap IS NULL) OR (hard_cap >= 0))),
    CONSTRAINT sms_usage_included_quota_check CHECK ((included_quota >= 0)),
    CONSTRAINT sms_usage_overage_cost_estimate_check CHECK ((overage_cost_estimate >= (0)::numeric)),
    CONSTRAINT sms_usage_overage_count_check CHECK ((overage_count >= 0)),
    CONSTRAINT sms_usage_period_valid CHECK ((period_end > period_start)),
    CONSTRAINT sms_usage_used_count_check CHECK ((used_count >= 0))
);


--
-- Name: TABLE sms_usage; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.sms_usage IS 'SMS usage counters per salon and Stripe billing period.';


--
-- Name: COLUMN sms_usage.included_quota; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sms_usage.included_quota IS 'Included SMS units locked for the billing period at first usage row creation.';


--
-- Name: COLUMN sms_usage.hard_cap; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sms_usage.hard_cap IS 'Plan cap for the period. NULL means no plan hard cap, but abuse/rate guards can still block sends.';


--
-- Name: ensure_sms_usage_row_for_period(uuid, timestamp with time zone, timestamp with time zone, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.ensure_sms_usage_row_for_period(p_salon_id uuid, p_period_start timestamp with time zone, p_period_end timestamp with time zone, p_included_quota integer, p_hard_cap integer DEFAULT NULL::integer) RETURNS public.sms_usage
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_row sms_usage%ROWTYPE;
BEGIN
  IF p_salon_id IS NULL THEN
    RAISE EXCEPTION 'p_salon_id is required' USING ERRCODE = 'P0001';
  END IF;

  IF p_period_start IS NULL OR p_period_end IS NULL OR p_period_end <= p_period_start THEN
    RAISE EXCEPTION 'Invalid period window' USING ERRCODE = 'P0001';
  END IF;

  IF p_included_quota < 0 THEN
    RAISE EXCEPTION 'p_included_quota must be >= 0' USING ERRCODE = 'P0001';
  END IF;

  IF p_hard_cap IS NOT NULL AND p_hard_cap < 0 THEN
    RAISE EXCEPTION 'p_hard_cap must be >= 0 when provided' USING ERRCODE = 'P0001';
  END IF;

  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE user_id = auth.uid()
        AND salon_id = p_salon_id
    ) THEN
      RAISE EXCEPTION 'Access denied for salon %', p_salon_id USING ERRCODE = 'P0001';
    END IF;
  END IF;

  INSERT INTO sms_usage (
    salon_id,
    period_start,
    period_end,
    included_quota,
    hard_cap
  )
  VALUES (
    p_salon_id,
    p_period_start,
    p_period_end,
    p_included_quota,
    p_hard_cap
  )
  ON CONFLICT (salon_id, period_start, period_end) DO NOTHING;

  SELECT *
  INTO v_row
  FROM sms_usage
  WHERE salon_id = p_salon_id
    AND period_start = p_period_start
    AND period_end = p_period_end;

  RETURN v_row;
END;
$$;


--
-- Name: FUNCTION ensure_sms_usage_row_for_period(p_salon_id uuid, p_period_start timestamp with time zone, p_period_end timestamp with time zone, p_included_quota integer, p_hard_cap integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.ensure_sms_usage_row_for_period(p_salon_id uuid, p_period_start timestamp with time zone, p_period_end timestamp with time zone, p_included_quota integer, p_hard_cap integer) IS 'Creates usage row for billing period if missing. Locks included_quota/hard_cap for the period.';


--
-- Name: expire_waitlist_entries(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.expire_waitlist_entries(max_rows integer DEFAULT 200) RETURNS TABLE(entry_id uuid, salon_id uuid, expired_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT w.id, w.salon_id, w.status
    FROM waitlist_entries w
    WHERE w.status = 'notified'
      AND w.expires_at IS NOT NULL
      AND w.expires_at < now()
    ORDER BY w.expires_at ASC
    LIMIT max_rows
    FOR UPDATE SKIP LOCKED
  ),
  updated AS (
    UPDATE waitlist_entries w
    SET status = 'expired'
    FROM candidates c
    WHERE w.id = c.id
    RETURNING w.id AS entry_id, w.salon_id, now() AS expired_at
  ),
  logged AS (
    INSERT INTO waitlist_lifecycle_events (
      waitlist_entry_id,
      salon_id,
      from_status,
      to_status,
      reason,
      metadata
    )
    SELECT
      c.id,
      c.salon_id,
      c.status,
      'expired',
      'expiry_job',
      jsonb_build_object('processor', 'expire_waitlist_entries')
    FROM candidates c
    RETURNING waitlist_entry_id
  )
  SELECT u.entry_id, u.salon_id, u.expired_at
  FROM updated u;
END;
$$;


--
-- Name: find_first_available_slots_batch(uuid, uuid, uuid[], date, date, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.find_first_available_slots_batch(p_salon_id uuid, p_service_id uuid, p_employee_ids uuid[] DEFAULT NULL::uuid[], p_date_from date DEFAULT CURRENT_DATE, p_date_to date DEFAULT NULL::date, p_limit integer DEFAULT 10) RETURNS TABLE(slot_start timestamp with time zone, slot_end timestamp with time zone, employee_id uuid, employee_name text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_date_to DATE;
  v_current_date DATE;
  v_found INTEGER := 0;
  emp RECORD;
  slot_rec RECORD;
BEGIN
  -- Default date_to: 14 days from date_from
  v_date_to := COALESCE(p_date_to, p_date_from + 14);

  -- Get employee list
  -- Loop through dates, then employees, collecting slots
  v_current_date := p_date_from;
  WHILE v_current_date <= v_date_to AND v_found < p_limit LOOP
    FOR emp IN
      SELECT e.id AS emp_id, e.full_name AS emp_name
        FROM employees e
       WHERE e.salon_id = p_salon_id
         AND e.is_active = true
         AND (p_employee_ids IS NULL OR e.id = ANY(p_employee_ids))
       ORDER BY e.full_name
    LOOP
      FOR slot_rec IN
        SELECT ga.slot_start, ga.slot_end
          FROM generate_availability(p_salon_id, emp.emp_id, p_service_id, v_current_date) ga
         ORDER BY ga.slot_start
         LIMIT (p_limit - v_found)
      LOOP
        slot_start := slot_rec.slot_start;
        slot_end := slot_rec.slot_end;
        employee_id := emp.emp_id;
        employee_name := emp.emp_name;
        RETURN NEXT;
        v_found := v_found + 1;
        IF v_found >= p_limit THEN
          RETURN;
        END IF;
      END LOOP;
    END LOOP;
    v_current_date := v_current_date + 1;
  END LOOP;
END;
$$;


--
-- Name: FUNCTION find_first_available_slots_batch(p_salon_id uuid, p_service_id uuid, p_employee_ids uuid[], p_date_from date, p_date_to date, p_limit integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.find_first_available_slots_batch(p_salon_id uuid, p_service_id uuid, p_employee_ids uuid[], p_date_from date, p_date_to date, p_limit integer) IS 'Finds the first N available slots across multiple employees and dates. Uses generate_availability internally.';


--
-- Name: generate_availability(uuid, uuid, uuid, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_availability(p_salon_id uuid, p_employee_id uuid, p_service_id uuid, p_day date) RETURNS TABLE(slot_start timestamp with time zone, slot_end timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_timezone TEXT;
  v_plan TEXT;
  v_has_shifts_feature BOOLEAN;
  v_duration INTEGER;
  v_prep INTEGER;
  v_cleanup INTEGER;
  v_dow_pg INTEGER; -- 0=Sunday..6=Saturday (PG/JS)
  v_dow_oh INTEGER; -- 0=Monday..6=Sunday (opening_hours)
  v_work_start TIME;
  v_work_end TIME;
  v_slot_start TIMESTAMPTZ;
  v_slot_end TIMESTAMPTZ;
  v_block_start TIMESTAMPTZ;
  v_block_end TIMESTAMPTZ;
  v_day_start TIMESTAMPTZ;
  v_day_end TIMESTAMPTZ;
  rec RECORD;
BEGIN
  SELECT s.timezone, s.plan::TEXT
    INTO v_timezone, v_plan
    FROM salons s
   WHERE s.id = p_salon_id;

  IF v_timezone IS NULL THEN
    v_timezone := 'UTC';
  END IF;

  SELECT COALESCE(sv.duration_minutes, 30),
         COALESCE(sv.prep_minutes, 0),
         COALESCE(sv.cleanup_minutes, 0)
    INTO v_duration, v_prep, v_cleanup
    FROM services sv
   WHERE sv.id = p_service_id;

  IF v_duration IS NULL THEN
    v_duration := 30;
    v_prep := 0;
    v_cleanup := 0;
  END IF;

  -- Stable weekday from DATE (no timezone-shift surprises)
  v_dow_pg := EXTRACT(DOW FROM p_day);
  IF v_dow_pg = 0 THEN
    v_dow_oh := 6;
  ELSE
    v_dow_oh := v_dow_pg - 1;
  END IF;

  IF EXISTS (
    SELECT 1 FROM salon_closures sc
     WHERE sc.salon_id = p_salon_id AND sc.closed_date = p_day
  ) THEN
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1
      FROM plan_features pf
      JOIN features f ON f.id = pf.feature_id
     WHERE pf.plan_type = v_plan::plan_type
       AND f.key = 'SHIFTS'
  ) INTO v_has_shifts_feature;

  IF v_has_shifts_feature THEN
    -- STRICT mapping for shifts: 0=Sunday..6=Saturday
    FOR rec IN
      SELECT sh.start_time AS w_start, sh.end_time AS w_end
        FROM shifts sh
       WHERE sh.salon_id = p_salon_id
         AND sh.employee_id = p_employee_id
         AND sh.weekday = v_dow_pg
       ORDER BY sh.start_time
    LOOP
      v_day_start := (p_day::TEXT || ' ' || rec.w_start::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;
      v_day_end   := (p_day::TEXT || ' ' || rec.w_end::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;

      v_slot_start := v_day_start;
      WHILE v_slot_start + (v_duration || ' minutes')::INTERVAL <= v_day_end LOOP
        v_slot_end   := v_slot_start + (v_duration || ' minutes')::INTERVAL;
        v_block_start := v_slot_start - (v_prep || ' minutes')::INTERVAL;
        v_block_end   := v_slot_end + (v_cleanup || ' minutes')::INTERVAL;

        IF v_block_start >= v_day_start AND v_block_end <= v_day_end
        AND NOT EXISTS (
          SELECT 1 FROM bookings b
           WHERE b.salon_id = p_salon_id
             AND b.employee_id = p_employee_id
             AND b.status IN ('pending', 'confirmed', 'scheduled')
             AND b.start_time < v_block_end
             AND b.end_time > v_block_start
        )
        AND NOT EXISTS (
          SELECT 1 FROM time_blocks tb
           WHERE tb.salon_id = p_salon_id
             AND (tb.employee_id = p_employee_id OR tb.employee_id IS NULL)
             AND (
               (tb.is_all_day AND tb.start_time::DATE = p_day)
               OR (NOT tb.is_all_day AND tb.start_time < v_block_end AND tb.end_time > v_block_start)
             )
        )
        AND NOT EXISTS (
          SELECT 1 FROM opening_hours_breaks brk
           WHERE brk.salon_id = p_salon_id
             AND brk.day_of_week = v_dow_oh
             AND (brk.employee_id = p_employee_id OR brk.employee_id IS NULL)
             AND brk.start_time < (v_block_end AT TIME ZONE v_timezone)::TIME
             AND brk.end_time   > (v_block_start AT TIME ZONE v_timezone)::TIME
        )
        THEN
          slot_start := v_slot_start;
          slot_end   := v_slot_end;
          RETURN NEXT;
        END IF;

        v_slot_start := v_slot_start + (v_duration || ' minutes')::INTERVAL;
      END LOOP;
    END LOOP;

    RETURN;
  ELSE
    SELECT oh.open_time, oh.close_time
      INTO v_work_start, v_work_end
      FROM opening_hours oh
     WHERE oh.salon_id = p_salon_id
       AND oh.day_of_week = v_dow_oh
       AND (oh.is_closed IS NULL OR oh.is_closed = false);

    IF v_work_start IS NULL THEN
      RETURN;
    END IF;

    BEGIN
      INSERT INTO security_audit_log (user_id, action, resource_type, resource_id, metadata)
      VALUES (
        auth.uid(),
        'availability_fallback_used',
        'salon',
        p_salon_id::TEXT,
        jsonb_build_object('date', p_day, 'employee_id', p_employee_id, 'reason', 'shifts_feature_disabled', 'plan', v_plan)
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

    v_day_start := (p_day::TEXT || ' ' || v_work_start::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;
    v_day_end   := (p_day::TEXT || ' ' || v_work_end::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;

    v_slot_start := v_day_start;
    WHILE v_slot_start + (v_duration || ' minutes')::INTERVAL <= v_day_end LOOP
      v_slot_end   := v_slot_start + (v_duration || ' minutes')::INTERVAL;
      v_block_start := v_slot_start - (v_prep || ' minutes')::INTERVAL;
      v_block_end   := v_slot_end + (v_cleanup || ' minutes')::INTERVAL;

      IF v_block_start >= v_day_start AND v_block_end <= v_day_end
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
         WHERE b.salon_id = p_salon_id
           AND b.employee_id = p_employee_id
           AND b.status IN ('pending', 'confirmed', 'scheduled')
           AND b.start_time < v_block_end
           AND b.end_time > v_block_start
      )
      AND NOT EXISTS (
        SELECT 1 FROM opening_hours_breaks brk
         WHERE brk.salon_id = p_salon_id
           AND brk.day_of_week = v_dow_oh
           AND (brk.employee_id = p_employee_id OR brk.employee_id IS NULL)
           AND brk.start_time < (v_block_end AT TIME ZONE v_timezone)::TIME
           AND brk.end_time   > (v_block_start AT TIME ZONE v_timezone)::TIME
      )
      AND NOT EXISTS (
        SELECT 1 FROM time_blocks tb
         WHERE tb.salon_id = p_salon_id
           AND (tb.employee_id = p_employee_id OR tb.employee_id IS NULL)
           AND (
             (tb.is_all_day AND tb.start_time::DATE = p_day)
             OR (NOT tb.is_all_day AND tb.start_time < v_block_end AND tb.end_time > v_block_start)
           )
      )
      THEN
        slot_start := v_slot_start;
        slot_end   := v_slot_end;
        RETURN NEXT;
      END IF;

      v_slot_start := v_slot_start + (v_duration || ' minutes')::INTERVAL;
    END LOOP;

    RETURN;
  END IF;
END;
$$;


--
-- Name: FUNCTION generate_availability(p_salon_id uuid, p_employee_id uuid, p_service_id uuid, p_day date); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.generate_availability(p_salon_id uuid, p_employee_id uuid, p_service_id uuid, p_day date) IS 'Generates available slots. Strict shifts weekday mapping (0=Sun..6=Sat) to avoid false cross-day availability.';


--
-- Name: generate_high_cancellation_cases(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_high_cancellation_cases() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE created_count INTEGER := 0; salon_rec RECORD;
BEGIN
  FOR salon_rec IN
    SELECT s.id, s.name, COUNT(*) FILTER (WHERE b.status = 'cancelled') AS cancelled, COUNT(*) AS total
    FROM salons s JOIN bookings b ON b.salon_id = s.id WHERE b.created_at > NOW() - INTERVAL '7 days'
    GROUP BY s.id, s.name HAVING COUNT(*) >= 10 AND (COUNT(*) FILTER (WHERE b.status = 'cancelled')::NUMERIC / COUNT(*)::NUMERIC) > 0.30
  LOOP
    IF NOT EXISTS (SELECT 1 FROM support_cases sc WHERE sc.salon_id = salon_rec.id AND sc.type = 'high_cancellation' AND sc.status IN ('open', 'in_progress')) THEN
      INSERT INTO support_cases (salon_id, type, priority, title, description)
      VALUES (salon_rec.id, 'high_cancellation', 'medium', 'High cancellation: ' || salon_rec.name, salon_rec.cancelled || '/' || salon_rec.total || ' cancelled.');
      created_count := created_count + 1;
    END IF;
  END LOOP;
  RETURN created_count;
END; $$;


--
-- Name: FUNCTION generate_high_cancellation_cases(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.generate_high_cancellation_cases() IS 'Auto-generate support cases for salons with >30% cancellation rate in 7 days';


--
-- Name: generate_login_problem_cases(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_login_problem_cases() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE created_count INTEGER := 0; user_rec RECORD;
BEGIN
  FOR user_rec IN
    SELECT sal.user_id, COUNT(*) AS failure_count FROM security_audit_log sal
    WHERE sal.action = 'login_failed' AND sal.created_at > NOW() - INTERVAL '1 hour' AND sal.user_id IS NOT NULL
    GROUP BY sal.user_id HAVING COUNT(*) > 5
  LOOP
    IF NOT EXISTS (SELECT 1 FROM support_cases sc WHERE sc.user_id = user_rec.user_id AND sc.type = 'login_problems' AND sc.status IN ('open', 'in_progress')) THEN
      INSERT INTO support_cases (user_id, type, priority, title, description)
      VALUES (user_rec.user_id, 'login_problems', 'high', 'Multiple login failures', user_rec.failure_count || ' failed attempts in last hour.');
      created_count := created_count + 1;
    END IF;
  END LOOP;
  RETURN created_count;
END; $$;


--
-- Name: FUNCTION generate_login_problem_cases(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.generate_login_problem_cases() IS 'Auto-generate support cases for users with >5 login failures in 1 hour';


--
-- Name: generate_onboarding_stuck_cases(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_onboarding_stuck_cases() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE created_count INTEGER := 0; salon_rec RECORD;
BEGIN
  FOR salon_rec IN
    SELECT s.id, s.name FROM salons s
    WHERE s.created_at < NOW() - INTERVAL '48 hours'
      AND NOT EXISTS (SELECT 1 FROM employees e WHERE e.salon_id = s.id)
      AND NOT EXISTS (SELECT 1 FROM support_cases sc WHERE sc.salon_id = s.id AND sc.type = 'onboarding_stuck' AND sc.status IN ('open', 'in_progress'))
  LOOP
    INSERT INTO support_cases (salon_id, type, priority, title, description)
    VALUES (salon_rec.id, 'onboarding_stuck', 'medium', 'Onboarding stuck: ' || salon_rec.name, 'Salon created >48h ago with no employees.');
    created_count := created_count + 1;
  END LOOP;
  RETURN created_count;
END; $$;


--
-- Name: FUNCTION generate_onboarding_stuck_cases(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.generate_onboarding_stuck_cases() IS 'Auto-generate support cases for salons with stalled onboarding (>48h, no employees)';


--
-- Name: get_admin_activation_funnel(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_admin_activation_funnel(period_days integer DEFAULT 90) RETURNS TABLE(step text, count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY SELECT 'Created salon'::TEXT, COUNT(*)::BIGINT FROM salons WHERE created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL;
  RETURN QUERY SELECT 'Added employee'::TEXT, COUNT(DISTINCT e.salon_id)::BIGINT FROM employees e JOIN salons s ON s.id = e.salon_id WHERE s.created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL;
  RETURN QUERY SELECT 'Added service'::TEXT, COUNT(DISTINCT sv.salon_id)::BIGINT FROM services sv JOIN salons s ON s.id = sv.salon_id WHERE s.created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL;
  RETURN QUERY SELECT 'First booking'::TEXT, COUNT(DISTINCT b.salon_id)::BIGINT FROM bookings b JOIN salons s ON s.id = b.salon_id WHERE s.created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL;
END;
$$;


--
-- Name: get_admin_activity_timeseries(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_admin_activity_timeseries(metric text DEFAULT 'bookings'::text, period_days integer DEFAULT 30) RETURNS TABLE(day date, value bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF metric = 'bookings' THEN
    RETURN QUERY
      SELECT d::DATE, COALESCE(COUNT(b.id), 0)::BIGINT
      FROM generate_series(CURRENT_DATE - (period_days || ' days')::INTERVAL, CURRENT_DATE, '1 day') d
      LEFT JOIN bookings b ON b.created_at::DATE = d::DATE
      GROUP BY d ORDER BY d;
  ELSIF metric = 'new_salons' THEN
    RETURN QUERY
      SELECT d::DATE, COALESCE(COUNT(s.id), 0)::BIGINT
      FROM generate_series(CURRENT_DATE - (period_days || ' days')::INTERVAL, CURRENT_DATE, '1 day') d
      LEFT JOIN salons s ON s.created_at::DATE = d::DATE
      GROUP BY d ORDER BY d;
  ELSIF metric = 'active_salons' THEN
    RETURN QUERY
      SELECT d::DATE, COALESCE(COUNT(DISTINCT b.salon_id), 0)::BIGINT
      FROM generate_series(CURRENT_DATE - (period_days || ' days')::INTERVAL, CURRENT_DATE, '1 day') d
      LEFT JOIN bookings b ON b.created_at::DATE = d::DATE
      GROUP BY d ORDER BY d;
  ELSE
    RAISE EXCEPTION 'Unknown metric: %', metric;
  END IF;
END;
$$;


--
-- Name: get_admin_cohort_retention(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_admin_cohort_retention(period_weeks integer DEFAULT 8) RETURNS TABLE(cohort_week date, week_offset integer, retention_pct numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
    WITH salon_cohorts AS (
      SELECT id, DATE_TRUNC('week', created_at)::DATE AS cohort
      FROM salons
      WHERE created_at >= CURRENT_DATE - (period_weeks * 7 || ' days')::INTERVAL
    ),
    activity AS (
      SELECT DISTINCT b.salon_id, DATE_TRUNC('week', b.created_at)::DATE AS activity_week
      FROM bookings b
      WHERE b.created_at >= CURRENT_DATE - (period_weeks * 7 || ' days')::INTERVAL
    )
    SELECT
      sc.cohort,
      ((a.activity_week - sc.cohort) / 7)::INT AS w_offset,
      ROUND(COUNT(DISTINCT a.salon_id)::NUMERIC / NULLIF(COUNT(DISTINCT sc.id), 0)::NUMERIC * 100, 1)
    FROM salon_cohorts sc
    LEFT JOIN activity a ON a.salon_id = sc.id AND a.activity_week >= sc.cohort
    GROUP BY sc.cohort, w_offset
    ORDER BY sc.cohort, w_offset;
END;
$$;


--
-- Name: get_admin_dashboard_kpis(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_admin_dashboard_kpis(period_days integer DEFAULT 7) RETURNS TABLE(active_salons bigint, active_salons_prev bigint, new_salons bigint, new_salons_prev bigint, activated_salons bigint, total_bookings bigint, total_bookings_prev bigint, open_support_cases bigint, total_users bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  period_start TIMESTAMPTZ := NOW() - (period_days || ' days')::INTERVAL;
  prev_period_start TIMESTAMPTZ := NOW() - (period_days * 2 || ' days')::INTERVAL;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;
  RETURN QUERY SELECT
    (SELECT COUNT(DISTINCT b.salon_id) FROM bookings b WHERE b.created_at >= period_start)::BIGINT,
    (SELECT COUNT(DISTINCT b.salon_id) FROM bookings b WHERE b.created_at >= prev_period_start AND b.created_at < period_start)::BIGINT,
    (SELECT COUNT(*) FROM salons s WHERE s.created_at >= period_start)::BIGINT,
    (SELECT COUNT(*) FROM salons s WHERE s.created_at >= prev_period_start AND s.created_at < period_start)::BIGINT,
    (SELECT COUNT(*) FROM salons s WHERE EXISTS (SELECT 1 FROM employees e WHERE e.salon_id = s.id) AND EXISTS (SELECT 1 FROM services sv WHERE sv.salon_id = s.id) AND EXISTS (SELECT 1 FROM bookings b WHERE b.salon_id = s.id))::BIGINT,
    (SELECT COUNT(*) FROM bookings b WHERE b.created_at >= period_start)::BIGINT,
    (SELECT COUNT(*) FROM bookings b WHERE b.created_at >= prev_period_start AND b.created_at < period_start)::BIGINT,
    (SELECT COUNT(*) FROM support_cases sc WHERE sc.status IN ('open', 'in_progress'))::BIGINT,
    (SELECT COUNT(DISTINCT user_id) FROM profiles)::BIGINT;
END; $$;


--
-- Name: FUNCTION get_admin_dashboard_kpis(period_days integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_admin_dashboard_kpis(period_days integer) IS 'Returns all dashboard KPI values + previous period for delta calculation. Superadmin only.';


--
-- Name: get_admin_kpi_trend(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_admin_kpi_trend(metric text DEFAULT 'bookings'::text, period_days integer DEFAULT 7) RETURNS TABLE(day date, value bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;
  IF metric = 'bookings' THEN
    RETURN QUERY SELECT d.day::DATE, COALESCE(COUNT(b.id), 0)::BIGINT
      FROM generate_series((NOW() - (period_days || ' days')::INTERVAL)::DATE, NOW()::DATE, '1 day'::INTERVAL) AS d(day)
      LEFT JOIN bookings b ON b.created_at::DATE = d.day::DATE GROUP BY d.day ORDER BY d.day;
  ELSIF metric = 'new_salons' THEN
    RETURN QUERY SELECT d.day::DATE, COALESCE(COUNT(s.id), 0)::BIGINT
      FROM generate_series((NOW() - (period_days || ' days')::INTERVAL)::DATE, NOW()::DATE, '1 day'::INTERVAL) AS d(day)
      LEFT JOIN salons s ON s.created_at::DATE = d.day::DATE GROUP BY d.day ORDER BY d.day;
  ELSIF metric = 'active_salons' THEN
    RETURN QUERY SELECT d.day::DATE, COALESCE(COUNT(DISTINCT b.salon_id), 0)::BIGINT
      FROM generate_series((NOW() - (period_days || ' days')::INTERVAL)::DATE, NOW()::DATE, '1 day'::INTERVAL) AS d(day)
      LEFT JOIN bookings b ON b.created_at::DATE = d.day::DATE GROUP BY d.day ORDER BY d.day;
  ELSE RAISE EXCEPTION 'Unknown metric: %', metric;
  END IF;
END; $$;


--
-- Name: FUNCTION get_admin_kpi_trend(metric text, period_days integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_admin_kpi_trend(metric text, period_days integer) IS 'Returns daily data points for sparkline charts. Metrics: bookings, new_salons, active_salons. Superadmin only.';


--
-- Name: get_admin_notes(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_admin_notes(p_entity_type text, p_entity_id uuid) RETURNS TABLE(id uuid, entity_type text, entity_id uuid, author_id uuid, author_email text, content text, tags text[], created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true) THEN
    RAISE EXCEPTION 'Only superadmins can read admin notes';
  END IF;
  RETURN QUERY
    SELECT n.id, n.entity_type, n.entity_id, n.author_id, u.email::TEXT, n.content, n.tags, n.created_at
    FROM admin_notes n LEFT JOIN auth.users u ON u.id = n.author_id
    WHERE n.entity_type = p_entity_type AND n.entity_id = p_entity_id ORDER BY n.created_at DESC;
END; $$;


--
-- Name: FUNCTION get_admin_notes(p_entity_type text, p_entity_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_admin_notes(p_entity_type text, p_entity_id uuid) IS 'Get all admin notes for an entity, including author email. Superadmin only.';


--
-- Name: get_admin_plan_distribution(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_admin_plan_distribution() RETURNS TABLE(plan text, count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT COALESCE(s.plan, 'starter')::TEXT, COUNT(*)::BIGINT FROM salons s GROUP BY COALESCE(s.plan, 'starter') ORDER BY count DESC;
END;
$$;


--
-- Name: get_admin_top_salons(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_admin_top_salons(period_days integer DEFAULT 30, lim integer DEFAULT 10) RETURNS TABLE(salon_id uuid, salon_name text, booking_count bigint, growth_pct numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
    WITH current_period AS (
      SELECT b.salon_id, COUNT(*)::BIGINT AS cnt
      FROM bookings b
      WHERE b.created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL
      GROUP BY b.salon_id
    ),
    prev_period AS (
      SELECT b.salon_id, COUNT(*)::BIGINT AS cnt
      FROM bookings b
      WHERE b.created_at >= CURRENT_DATE - (2 * period_days || ' days')::INTERVAL
        AND b.created_at < CURRENT_DATE - (period_days || ' days')::INTERVAL
      GROUP BY b.salon_id
    )
    SELECT
      c.salon_id,
      s.name::TEXT,
      c.cnt,
      CASE WHEN COALESCE(p.cnt, 0) = 0 THEN 100.0
           ELSE ROUND(((c.cnt - p.cnt)::NUMERIC / p.cnt::NUMERIC) * 100, 1)
      END
    FROM current_period c
    JOIN salons s ON s.id = c.salon_id
    LEFT JOIN prev_period p ON p.salon_id = c.salon_id
    ORDER BY c.cnt DESC
    LIMIT lim;
END;
$$;


--
-- Name: get_booking_customer_email(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_booking_customer_email(p_booking_id uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT c.email INTO v_email
  FROM bookings b
  JOIN customers c ON b.customer_id = c.id
  WHERE b.id = p_booking_id;
  
  RETURN v_email;
END;
$$;


--
-- Name: get_needs_attention_items(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_needs_attention_items(lim integer DEFAULT 10) RETURNS TABLE(item_id text, item_type text, entity_type text, entity_id uuid, entity_name text, severity text, title text, description text, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Verify superadmin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.is_superadmin = true
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;

  RETURN QUERY
  SELECT
    sub.item_id,
    sub.item_type,
    sub.entity_type,
    sub.entity_id,
    sub.entity_name,
    sub.severity,
    sub.title,
    sub.description,
    sub.created_at
  FROM (

    -- ── 1. Open support cases ─────────────────────────────
    SELECT
      'case-' || sc.id::TEXT        AS item_id,
      sc.type                       AS item_type,
      CASE WHEN sc.salon_id IS NOT NULL
        THEN 'salon'::TEXT
        ELSE 'user'::TEXT
      END                           AS entity_type,
      COALESCE(sc.salon_id, sc.user_id) AS entity_id,
      COALESCE(s.name, 'User ' || LEFT(sc.user_id::TEXT, 8)) AS entity_name,
      sc.priority                   AS severity,
      sc.title                      AS title,
      COALESCE(sc.description, '')  AS description,
      sc.created_at                 AS created_at
    FROM support_cases sc
    LEFT JOIN salons s ON s.id = sc.salon_id
    WHERE sc.status IN ('open', 'in_progress')

    UNION ALL

    -- ── 2. Inactive salons (14+ days no bookings) ────────
    SELECT
      'inactive-' || sa.id::TEXT,
      'onboarding_stuck'::TEXT,
      'salon'::TEXT,
      sa.id,
      sa.name,
      'medium'::TEXT,
      sa.name || ' inactive for 14+ days',
      'No bookings in the last 14 days'::TEXT,
      sa.created_at
    FROM salons sa
    WHERE sa.is_public = true
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.salon_id = sa.id
          AND b.created_at > NOW() - INTERVAL '14 days'
      )
      AND EXISTS (
        SELECT 1 FROM bookings b WHERE b.salon_id = sa.id
      )

    UNION ALL

    -- ── 3. Stuck onboarding (48h+ missing employees or services)
    SELECT
      'stuck-' || sa.id::TEXT,
      'onboarding_stuck'::TEXT,
      'salon'::TEXT,
      sa.id,
      sa.name,
      'high'::TEXT,
      sa.name || ' stuck on onboarding',
      CASE
        WHEN NOT EXISTS (SELECT 1 FROM employees e WHERE e.salon_id = sa.id)
          THEN 'No employees added after ' || EXTRACT(DAY FROM NOW() - sa.created_at)::INT::TEXT || ' days'
        WHEN NOT EXISTS (SELECT 1 FROM services sv WHERE sv.salon_id = sa.id)
          THEN 'No services added after ' || EXTRACT(DAY FROM NOW() - sa.created_at)::INT::TEXT || ' days'
        ELSE 'Onboarding incomplete after ' || EXTRACT(DAY FROM NOW() - sa.created_at)::INT::TEXT || ' days'
      END::TEXT,
      sa.created_at
    FROM salons sa
    WHERE sa.created_at < NOW() - INTERVAL '48 hours'
      AND (
        NOT EXISTS (SELECT 1 FROM employees e WHERE e.salon_id = sa.id)
        OR NOT EXISTS (SELECT 1 FROM services sv WHERE sv.salon_id = sa.id)
      )

    UNION ALL

    -- ── 4. Booking drop alerts (50%+ drop week-over-week) ─
    SELECT
      'drop-' || tw.sid::TEXT,
      'high_cancellation'::TEXT,
      'salon'::TEXT,
      tw.sid,
      sa.name,
      'high'::TEXT,
      sa.name || ' sudden booking drop',
      'Bookings dropped ' || ROUND((1.0 - tw.cnt::NUMERIC / GREATEST(lw.cnt, 1)) * 100)::TEXT || '% vs previous week',
      NOW()
    FROM (
      SELECT b.salon_id AS sid, COUNT(*)::INT AS cnt
      FROM bookings b
      WHERE b.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY b.salon_id
    ) tw
    JOIN (
      SELECT b.salon_id AS sid, COUNT(*)::INT AS cnt
      FROM bookings b
      WHERE b.created_at >= NOW() - INTERVAL '14 days'
        AND b.created_at < NOW() - INTERVAL '7 days'
      GROUP BY b.salon_id
    ) lw ON lw.sid = tw.sid
    JOIN salons sa ON sa.id = tw.sid
    WHERE lw.cnt >= 5
      AND tw.cnt::NUMERIC / GREATEST(lw.cnt, 1) < 0.5

  ) sub
  ORDER BY
    CASE sub.severity
      WHEN 'critical' THEN 1
      WHEN 'high'     THEN 2
      WHEN 'medium'   THEN 3
      WHEN 'low'      THEN 4
      ELSE 5
    END,
    sub.created_at DESC
  LIMIT lim;
END;
$$;


--
-- Name: FUNCTION get_needs_attention_items(lim integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_needs_attention_items(lim integer) IS 'Smart attention feed: open cases, inactive salons, stuck onboarding, booking drops. Superadmin only.';


--
-- Name: get_query_budget_violations(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_query_budget_violations(p_min_calls integer DEFAULT 20, p_booking_budget_ms integer DEFAULT 20, p_dashboard_budget_ms integer DEFAULT 50) RETURNS TABLE(queryid bigint, calls bigint, mean_exec_time double precision, budget_ms integer, query text)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
  SELECT
    s.queryid,
    s.calls,
    s.mean_exec_time,
    CASE
      WHEN s.query ILIKE '%bookings%' THEN p_booking_budget_ms
      ELSE p_dashboard_budget_ms
    END AS budget_ms,
    LEFT(s.query, 240) AS query
  FROM pg_stat_statements s
  WHERE s.calls >= p_min_calls
    AND (
      (s.query ILIKE '%bookings%' AND s.mean_exec_time > p_booking_budget_ms)
      OR
      (s.query NOT ILIKE '%bookings%' AND s.mean_exec_time > p_dashboard_budget_ms)
    )
  ORDER BY s.mean_exec_time DESC;
$$;


--
-- Name: get_salon_onboarding_status(uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_salon_onboarding_status(salon_ids uuid[]) RETURNS TABLE(salon_id uuid, has_employee boolean, has_service boolean, has_booking boolean)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Verify superadmin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.is_superadmin = true
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;

  RETURN QUERY
  SELECT
    sid AS salon_id,
    EXISTS(SELECT 1 FROM employees e WHERE e.salon_id = sid) AS has_employee,
    EXISTS(SELECT 1 FROM services sv WHERE sv.salon_id = sid) AS has_service,
    EXISTS(SELECT 1 FROM bookings b WHERE b.salon_id = sid) AS has_booking
  FROM unnest(salon_ids) AS sid;
END;
$$;


--
-- Name: FUNCTION get_salon_onboarding_status(salon_ids uuid[]); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_salon_onboarding_status(salon_ids uuid[]) IS 'Returns onboarding completion flags (has employee/service/booking) for a batch of salons. Superadmin only.';


--
-- Name: get_salons_paginated(jsonb, text, text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_salons_paginated(filters jsonb DEFAULT '{}'::jsonb, sort_col text DEFAULT 'created_at'::text, sort_dir text DEFAULT 'desc'::text, lim integer DEFAULT 25, off integer DEFAULT 0) RETURNS TABLE(id uuid, name text, slug text, plan text, is_public boolean, salon_type text, preferred_language text, created_at timestamp with time zone, updated_at timestamp with time zone, owner_email text, employee_count bigint, booking_count_7d bigint, last_active timestamp with time zone, total_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  total BIGINT;
  q TEXT;
BEGIN
  -- Verify superadmin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.is_superadmin = true
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;

  q := NULLIF(trim(filters->>'search'), '');

  -- Get total count (with filters)
  SELECT COUNT(*) INTO total
  FROM salons s
  WHERE (filters->>'plan' IS NULL OR s.plan::TEXT = filters->>'plan')
    AND (filters->>'is_public' IS NULL OR s.is_public = (filters->>'is_public')::BOOLEAN)
    AND (filters->>'salon_type' IS NULL OR s.salon_type = filters->>'salon_type')
    AND (
      q IS NULL
      OR s.name ILIKE '%' || q || '%'
      OR COALESCE(s.slug, '') ILIKE '%' || q || '%'
      OR s.plan::TEXT ILIKE '%' || q || '%'
      OR COALESCE(s.salon_type, '') ILIKE '%' || q || '%'
      OR CASE WHEN s.is_public THEN 'active' ELSE 'inactive' END ILIKE '%' || q || '%'
      OR TO_CHAR(s.created_at, 'YYYY-MM-DD HH24:MI') ILIKE '%' || q || '%'
      OR EXISTS (
        SELECT 1
        FROM profiles pr
        JOIN auth.users u ON u.id = pr.user_id
        WHERE pr.salon_id = s.id
          AND u.email::TEXT ILIKE '%' || q || '%'
      )
      OR (SELECT COUNT(*) FROM employees e WHERE e.salon_id = s.id)::TEXT ILIKE '%' || q || '%'
      OR (SELECT COUNT(*) FROM bookings b WHERE b.salon_id = s.id AND b.created_at >= NOW() - INTERVAL '7 days')::TEXT ILIKE '%' || q || '%'
    )
    AND (filters->>'created_after' IS NULL OR s.created_at >= (filters->>'created_after')::TIMESTAMPTZ)
    AND (filters->>'created_before' IS NULL OR s.created_at <= (filters->>'created_before')::TIMESTAMPTZ);

  -- Return paginated results
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.slug,
    s.plan::TEXT,
    s.is_public,
    s.salon_type,
    s.preferred_language,
    s.created_at,
    s.updated_at,
    (SELECT u.email::TEXT
     FROM profiles pr
     JOIN auth.users u ON u.id = pr.user_id
     WHERE pr.salon_id = s.id
     LIMIT 1) AS owner_email,
    (SELECT COUNT(*) FROM employees e WHERE e.salon_id = s.id)::BIGINT AS employee_count,
    (SELECT COUNT(*) FROM bookings b WHERE b.salon_id = s.id AND b.created_at >= NOW() - INTERVAL '7 days')::BIGINT AS booking_count_7d,
    GREATEST(
      s.created_at,
      COALESCE((SELECT MAX(b.created_at) FROM bookings b WHERE b.salon_id = s.id), s.created_at),
      COALESCE((SELECT MAX(e.created_at) FROM employees e WHERE e.salon_id = s.id), s.created_at),
      COALESCE((SELECT MAX(c.created_at) FROM customers c WHERE c.salon_id = s.id), s.created_at),
      COALESCE((SELECT MAX(sv.created_at) FROM services sv WHERE sv.salon_id = s.id), s.created_at),
      COALESCE(s.updated_at, s.created_at)
    ) AS last_active,
    total AS total_count
  FROM salons s
  WHERE (filters->>'plan' IS NULL OR s.plan::TEXT = filters->>'plan')
    AND (filters->>'is_public' IS NULL OR s.is_public = (filters->>'is_public')::BOOLEAN)
    AND (filters->>'salon_type' IS NULL OR s.salon_type = filters->>'salon_type')
    AND (
      q IS NULL
      OR s.name ILIKE '%' || q || '%'
      OR COALESCE(s.slug, '') ILIKE '%' || q || '%'
      OR s.plan::TEXT ILIKE '%' || q || '%'
      OR COALESCE(s.salon_type, '') ILIKE '%' || q || '%'
      OR CASE WHEN s.is_public THEN 'active' ELSE 'inactive' END ILIKE '%' || q || '%'
      OR TO_CHAR(s.created_at, 'YYYY-MM-DD HH24:MI') ILIKE '%' || q || '%'
      OR EXISTS (
        SELECT 1
        FROM profiles pr
        JOIN auth.users u ON u.id = pr.user_id
        WHERE pr.salon_id = s.id
          AND u.email::TEXT ILIKE '%' || q || '%'
      )
      OR (SELECT COUNT(*) FROM employees e WHERE e.salon_id = s.id)::TEXT ILIKE '%' || q || '%'
      OR (SELECT COUNT(*) FROM bookings b WHERE b.salon_id = s.id AND b.created_at >= NOW() - INTERVAL '7 days')::TEXT ILIKE '%' || q || '%'
    )
    AND (filters->>'created_after' IS NULL OR s.created_at >= (filters->>'created_after')::TIMESTAMPTZ)
    AND (filters->>'created_before' IS NULL OR s.created_at <= (filters->>'created_before')::TIMESTAMPTZ)
  ORDER BY
    CASE WHEN sort_col = 'name' AND sort_dir = 'asc' THEN s.name END ASC,
    CASE WHEN sort_col = 'name' AND sort_dir = 'desc' THEN s.name END DESC,
    CASE WHEN sort_col = 'created_at' AND sort_dir = 'asc' THEN s.created_at END ASC,
    CASE WHEN sort_col = 'created_at' AND sort_dir = 'desc' THEN s.created_at END DESC,
    CASE WHEN sort_col = 'plan' AND sort_dir = 'asc' THEN s.plan::TEXT END ASC,
    CASE WHEN sort_col = 'plan' AND sort_dir = 'desc' THEN s.plan::TEXT END DESC,
    s.created_at DESC
  LIMIT lim
  OFFSET off;
END;
$$;


--
-- Name: FUNCTION get_salons_paginated(filters jsonb, sort_col text, sort_dir text, lim integer, off integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_salons_paginated(filters jsonb, sort_col text, sort_dir text, lim integer, off integer) IS 'Paginated salon list with stats, last_active, and global search. Superadmin only.';


--
-- Name: get_schedule_segments(uuid, date, uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_schedule_segments(p_salon_id uuid, p_date date, p_employee_ids uuid[] DEFAULT NULL::uuid[]) RETURNS TABLE(employee_id uuid, segment_type text, start_time timestamp with time zone, end_time timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_timezone TEXT;
  v_plan TEXT;
  v_has_shifts_feature BOOLEAN;
  v_dow_pg INTEGER;   -- PostgreSQL DOW: 0=Sunday, 1=Monday, ..., 6=Saturday (same as JS getDay)
  v_dow_oh INTEGER;   -- Opening hours convention: 0=Monday, 1=Tuesday, ..., 6=Sunday
  v_day_start_ts TIMESTAMP;
  v_day_end_ts TIMESTAMP;
  v_is_closed BOOLEAN;
  emp RECORD;
  shift_rec RECORD;
  oh_rec RECORD;
  brk_rec RECORD;
  tb_rec RECORD;
  bk_rec RECORD;
  v_work_start TIMESTAMPTZ;
  v_work_end TIMESTAMPTZ;
  v_has_working_window BOOLEAN;
BEGIN
  -- ─── Lookup salon ─────────────────────────────────────
  SELECT s.timezone, s.plan::TEXT
    INTO v_timezone, v_plan
    FROM salons s WHERE s.id = p_salon_id;

  IF v_timezone IS NULL THEN v_timezone := 'UTC'; END IF;

  -- ─── Weekday calculation ──────────────────────────────
  -- IMPORTANT: Use p_date directly (DATE type), NOT p_date::TIMESTAMP AT TIME ZONE.
  -- The AT TIME ZONE conversion shifts midnight to the previous day in UTC,
  -- causing EXTRACT(DOW) to return the wrong weekday for timezones east of UTC.
  -- v_dow_pg: 0=Sunday, 1=Monday, ..., 6=Saturday (matches JS getDay AND shifts.weekday)
  v_dow_pg := EXTRACT(DOW FROM p_date);
  -- v_dow_oh: 0=Monday, ..., 6=Sunday (matches opening_hours.day_of_week)
  IF v_dow_pg = 0 THEN v_dow_oh := 6;
  ELSE v_dow_oh := v_dow_pg - 1;
  END IF;

  -- ─── Check salon closure ──────────────────────────────
  v_is_closed := EXISTS (
    SELECT 1 FROM salon_closures sc WHERE sc.salon_id = p_salon_id AND sc.closed_date = p_date
  );

  -- ─── Check SHIFTS feature ────────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM plan_features pf JOIN features f ON f.id = pf.feature_id
    WHERE pf.plan_type = v_plan::plan_type AND f.key = 'SHIFTS'
  ) INTO v_has_shifts_feature;

  -- ─── Loop through employees ───────────────────────────
  FOR emp IN
    SELECT e.id AS emp_id, e.full_name AS emp_name
      FROM employees e
     WHERE e.salon_id = p_salon_id
       AND e.is_active = true
       AND (p_employee_ids IS NULL OR e.id = ANY(p_employee_ids))
     ORDER BY e.full_name
  LOOP
    -- If salon is closed, emit a single 'closed' segment
    IF v_is_closed THEN
      employee_id := emp.emp_id;
      segment_type := 'closed';
      start_time := (p_date::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone;
      end_time := (p_date::TEXT || ' 23:59:59')::TIMESTAMP AT TIME ZONE v_timezone;
      metadata := jsonb_build_object('reason_code', 'salon_closed');
      RETURN NEXT;
      CONTINUE;
    END IF;

    v_has_working_window := false;

    -- ─── Working windows ──────────────────────────────────
    IF v_has_shifts_feature THEN
      FOR shift_rec IN
        SELECT sh.start_time AS w_start, sh.end_time AS w_end
          FROM shifts sh
         WHERE sh.salon_id = p_salon_id
           AND sh.employee_id = emp.emp_id
           AND sh.weekday = v_dow_pg   -- FIX: use JS/PG convention (0=Sun) for shifts table
         ORDER BY sh.start_time
      LOOP
        v_has_working_window := true;
        v_work_start := (p_date::TEXT || ' ' || shift_rec.w_start::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;
        v_work_end := (p_date::TEXT || ' ' || shift_rec.w_end::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;

        employee_id := emp.emp_id;
        segment_type := 'working';
        start_time := v_work_start;
        end_time := v_work_end;
        metadata := jsonb_build_object('source', 'shift');
        RETURN NEXT;
      END LOOP;

      IF NOT v_has_working_window THEN
        employee_id := emp.emp_id;
        segment_type := 'closed';
        start_time := (p_date::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone;
        end_time := (p_date::TEXT || ' 23:59:59')::TIMESTAMP AT TIME ZONE v_timezone;
        metadata := jsonb_build_object('reason_code', 'no_shifts');
        RETURN NEXT;
        CONTINUE;
      END IF;
    ELSE
      -- Opening hours fallback (uses v_dow_oh which matches opening_hours.day_of_week)
      SELECT oh.open_time, oh.close_time
        INTO oh_rec
        FROM opening_hours oh
       WHERE oh.salon_id = p_salon_id
         AND oh.day_of_week = v_dow_oh
         AND (oh.is_closed IS NULL OR oh.is_closed = false);

      IF oh_rec IS NOT NULL AND oh_rec.open_time IS NOT NULL THEN
        v_has_working_window := true;
        v_work_start := (p_date::TEXT || ' ' || oh_rec.open_time::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;
        v_work_end := (p_date::TEXT || ' ' || oh_rec.close_time::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;

        employee_id := emp.emp_id;
        segment_type := 'working';
        start_time := v_work_start;
        end_time := v_work_end;
        metadata := jsonb_build_object('source', 'opening_hours');
        RETURN NEXT;
      ELSE
        employee_id := emp.emp_id;
        segment_type := 'closed';
        start_time := (p_date::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone;
        end_time := (p_date::TEXT || ' 23:59:59')::TIMESTAMP AT TIME ZONE v_timezone;
        metadata := jsonb_build_object('reason_code', 'no_opening_hours');
        RETURN NEXT;
        CONTINUE;
      END IF;
    END IF;

    -- ─── Breaks (salon-wide + employee-specific) ──────────
    FOR brk_rec IN
      SELECT brk.start_time AS b_start, brk.end_time AS b_end, brk.label
        FROM opening_hours_breaks brk
       WHERE brk.salon_id = p_salon_id
         AND brk.day_of_week = v_dow_oh
         AND (brk.employee_id IS NULL OR brk.employee_id = emp.emp_id)
       ORDER BY brk.start_time
    LOOP
      employee_id := emp.emp_id;
      segment_type := 'break';
      start_time := (p_date::TEXT || ' ' || brk_rec.b_start::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;
      end_time := (p_date::TEXT || ' ' || brk_rec.b_end::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;
      metadata := jsonb_build_object('break_label', COALESCE(brk_rec.label, 'Break'));
      RETURN NEXT;
    END LOOP;

    -- ─── Time blocks (salon-wide + employee-specific) ─────
    FOR tb_rec IN
      SELECT tb.id AS tb_id, tb.title, tb.block_type,
             tb.start_time AS tb_start, tb.end_time AS tb_end,
             tb.is_all_day, tb.notes AS tb_notes
        FROM time_blocks tb
       WHERE tb.salon_id = p_salon_id
         AND (tb.employee_id IS NULL OR tb.employee_id = emp.emp_id)
         AND (
           (tb.is_all_day AND tb.start_time::DATE = p_date)
           OR (NOT tb.is_all_day AND tb.start_time::DATE = p_date)
           OR (NOT tb.is_all_day AND tb.start_time < ((p_date + 1)::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone
               AND tb.end_time > (p_date::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone)
         )
       ORDER BY tb.start_time
    LOOP
      employee_id := emp.emp_id;
      segment_type := 'time_block';
      IF tb_rec.is_all_day THEN
        start_time := (p_date::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone;
        end_time := (p_date::TEXT || ' 23:59:59')::TIMESTAMP AT TIME ZONE v_timezone;
      ELSE
        start_time := tb_rec.tb_start;
        end_time := tb_rec.tb_end;
      END IF;
      metadata := jsonb_build_object(
        'block_id', tb_rec.tb_id,
        'block_type', tb_rec.block_type,
        'title', tb_rec.title,
        'notes', tb_rec.tb_notes
      );
      RETURN NEXT;
    END LOOP;

    -- ─── Bookings + buffers ───────────────────────────────
    FOR bk_rec IN
      SELECT b.id AS bk_id, b.start_time AS bk_start, b.end_time AS bk_end,
             b.status AS bk_status, b.is_walk_in AS bk_walk_in, b.notes AS bk_notes,
             b.customer_id AS bk_customer_id,
             c.full_name AS customer_name, c.phone AS customer_phone,
             s.name AS service_name, s.price_cents AS service_price,
             s.duration_minutes AS service_duration,
             COALESCE(s.prep_minutes, 0) AS svc_prep,
             COALESCE(s.cleanup_minutes, 0) AS svc_cleanup
        FROM bookings b
        LEFT JOIN customers c ON b.customer_id = c.id
        LEFT JOIN services s ON b.service_id = s.id
       WHERE b.salon_id = p_salon_id
         AND b.employee_id = emp.emp_id
         AND b.status NOT IN ('cancelled')
         AND b.start_time < ((p_date + 1)::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone
         AND b.end_time > (p_date::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone
       ORDER BY b.start_time
    LOOP
      -- Emit prep buffer segment (if any)
      IF bk_rec.svc_prep > 0 THEN
        employee_id := emp.emp_id;
        segment_type := 'buffer';
        start_time := bk_rec.bk_start - (bk_rec.svc_prep || ' minutes')::INTERVAL;
        end_time := bk_rec.bk_start;
        metadata := jsonb_build_object('buffer_type', 'prep', 'booking_id', bk_rec.bk_id);
        RETURN NEXT;
      END IF;

      -- Emit booking segment
      employee_id := emp.emp_id;
      segment_type := 'booking';
      start_time := bk_rec.bk_start;
      end_time := bk_rec.bk_end;
      metadata := jsonb_build_object(
        'booking_id', bk_rec.bk_id,
        'status', bk_rec.bk_status,
        'is_walk_in', bk_rec.bk_walk_in,
        'customer_name', bk_rec.customer_name,
        'customer_phone', bk_rec.customer_phone,
        'service_name', bk_rec.service_name,
        'service_price', bk_rec.service_price,
        'service_duration', bk_rec.service_duration,
        'notes', bk_rec.bk_notes
      );
      RETURN NEXT;

      -- Emit cleanup buffer segment (if any)
      IF bk_rec.svc_cleanup > 0 THEN
        employee_id := emp.emp_id;
        segment_type := 'buffer';
        start_time := bk_rec.bk_end;
        end_time := bk_rec.bk_end + (bk_rec.svc_cleanup || ' minutes')::INTERVAL;
        metadata := jsonb_build_object('buffer_type', 'cleanup', 'booking_id', bk_rec.bk_id);
        RETURN NEXT;
      END IF;
    END LOOP;

  END LOOP; -- employees
END;
$$;


--
-- Name: FUNCTION get_schedule_segments(p_salon_id uuid, p_date date, p_employee_ids uuid[]); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_schedule_segments(p_salon_id uuid, p_date date, p_employee_ids uuid[]) IS 'Returns all schedule segments for a date: working windows, breaks, time_blocks, bookings, buffers, closed. Backend is source of truth. FIX: uses v_dow_pg (0=Sunday, JS getDay convention) for shifts.weekday queries.';


--
-- Name: get_support_cases_list(jsonb, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_support_cases_list(filters jsonb DEFAULT '{}'::jsonb, lim integer DEFAULT 25, off integer DEFAULT 0) RETURNS TABLE(id uuid, salon_id uuid, salon_name text, user_id uuid, type text, status text, priority text, title text, description text, category text, assignee_id uuid, assignee_email text, metadata jsonb, resolved_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone, total_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  total BIGINT;
  q TEXT;
BEGIN
  -- Verify superadmin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.is_superadmin = true
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;

  q := NULLIF(trim(filters->>'search'), '');

  -- Count with all filters
  SELECT COUNT(*) INTO total
  FROM support_cases sc
  LEFT JOIN salons s ON s.id = sc.salon_id
  WHERE (filters->>'type' IS NULL OR sc.type = filters->>'type')
    AND (filters->>'status' IS NULL OR sc.status = filters->>'status')
    AND (filters->>'priority' IS NULL OR sc.priority = filters->>'priority')
    AND (filters->>'assignee_id' IS NULL OR sc.assignee_id = (filters->>'assignee_id')::UUID)
    AND (
      q IS NULL
      OR sc.title ILIKE '%' || q || '%'
      OR COALESCE(sc.description, '') ILIKE '%' || q || '%'
      OR COALESCE(sc.category, '') ILIKE '%' || q || '%'
      OR sc.type ILIKE '%' || q || '%'
      OR sc.status ILIKE '%' || q || '%'
      OR sc.priority ILIKE '%' || q || '%'
      OR COALESCE(s.name, '') ILIKE '%' || q || '%'
      OR EXISTS (
        SELECT 1
        FROM auth.users u
        WHERE u.id = sc.assignee_id
          AND u.email::TEXT ILIKE '%' || q || '%'
      )
    );

  RETURN QUERY
  SELECT
    sc.id,
    sc.salon_id,
    s.name AS salon_name,
    sc.user_id,
    sc.type,
    sc.status,
    sc.priority,
    sc.title,
    sc.description,
    sc.category,
    sc.assignee_id,
    (SELECT u.email::TEXT FROM auth.users u WHERE u.id = sc.assignee_id) AS assignee_email,
    sc.metadata,
    sc.resolved_at,
    sc.created_at,
    sc.updated_at,
    total AS total_count
  FROM support_cases sc
  LEFT JOIN salons s ON s.id = sc.salon_id
  WHERE (filters->>'type' IS NULL OR sc.type = filters->>'type')
    AND (filters->>'status' IS NULL OR sc.status = filters->>'status')
    AND (filters->>'priority' IS NULL OR sc.priority = filters->>'priority')
    AND (filters->>'assignee_id' IS NULL OR sc.assignee_id = (filters->>'assignee_id')::UUID)
    AND (
      q IS NULL
      OR sc.title ILIKE '%' || q || '%'
      OR COALESCE(sc.description, '') ILIKE '%' || q || '%'
      OR COALESCE(sc.category, '') ILIKE '%' || q || '%'
      OR sc.type ILIKE '%' || q || '%'
      OR sc.status ILIKE '%' || q || '%'
      OR sc.priority ILIKE '%' || q || '%'
      OR COALESCE(s.name, '') ILIKE '%' || q || '%'
      OR EXISTS (
        SELECT 1
        FROM auth.users u
        WHERE u.id = sc.assignee_id
          AND u.email::TEXT ILIKE '%' || q || '%'
      )
    )
  ORDER BY
    CASE sc.priority
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    sc.created_at DESC
  LIMIT lim
  OFFSET off;
END;
$$;


--
-- Name: get_unread_notification_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_unread_notification_count(p_user_id uuid) RETURNS integer
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  SELECT COUNT(*)::INTEGER
  FROM notifications
  WHERE user_id = p_user_id AND read = FALSE;
$$;


--
-- Name: get_user_emails(uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_emails(user_ids uuid[]) RETURNS TABLE(user_id uuid, email text, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Check if current user is superadmin
  IF NOT EXISTS (
    SELECT 1 
    FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND p.is_superadmin = TRUE
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;

  -- Return user emails and created_at
  RETURN QUERY
  SELECT 
    u.id::UUID as user_id,
    u.email::TEXT as email,
    u.created_at::TIMESTAMPTZ as created_at
  FROM auth.users u
  WHERE u.id = ANY(user_ids);
END;
$$;


--
-- Name: get_user_salons(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_salons(p_user_id uuid) RETURNS TABLE(salon_id uuid, salon_name text, role public.owner_role)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    so.salon_id,
    s.name,
    so.role
  FROM salon_ownerships so
  JOIN salons s ON so.salon_id = s.id
  WHERE so.user_id = p_user_id
  ORDER BY s.name;
END;
$$;


--
-- Name: FUNCTION get_user_salons(p_user_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_user_salons(p_user_id uuid) IS 'Get all salons a user has access to';


--
-- Name: get_users_paginated(jsonb, text, text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_users_paginated(filters jsonb DEFAULT '{}'::jsonb, sort_col text DEFAULT 'created_at'::text, sort_dir text DEFAULT 'desc'::text, lim integer DEFAULT 25, off integer DEFAULT 0) RETURNS TABLE(user_id uuid, email text, is_superadmin boolean, salon_id uuid, salon_name text, user_created_at timestamp with time zone, last_sign_in_at timestamp with time zone, total_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  total BIGINT;
  q TEXT;
BEGIN
  -- Verify superadmin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.is_superadmin = true
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;

  q := NULLIF(trim(filters->>'search'), '');

  -- Get total count (with filters)
  SELECT COUNT(*) INTO total
  FROM profiles pr
  JOIN auth.users u ON u.id = pr.user_id
  LEFT JOIN salons s ON s.id = pr.salon_id
  WHERE (filters->>'is_superadmin' IS NULL OR pr.is_superadmin = (filters->>'is_superadmin')::BOOLEAN)
    AND (filters->>'salon_id' IS NULL OR pr.salon_id = (filters->>'salon_id')::UUID)
    AND (
      q IS NULL
      OR u.email ILIKE '%' || q || '%'
      OR COALESCE(s.name, '') ILIKE '%' || q || '%'
      OR COALESCE(pr.role::TEXT, '') ILIKE '%' || q || '%'
      OR COALESCE(pr.first_name, '') ILIKE '%' || q || '%'
      OR COALESCE(pr.last_name, '') ILIKE '%' || q || '%'
      OR CONCAT_WS(' ', COALESCE(pr.first_name, ''), COALESCE(pr.last_name, '')) ILIKE '%' || q || '%'
      OR CASE WHEN pr.is_superadmin THEN 'super admin' ELSE 'user' END ILIKE '%' || q || '%'
      OR TO_CHAR(u.created_at, 'YYYY-MM-DD HH24:MI') ILIKE '%' || q || '%'
      OR TO_CHAR(COALESCE(u.last_sign_in_at, u.created_at), 'YYYY-MM-DD HH24:MI') ILIKE '%' || q || '%'
      OR pr.user_id::TEXT ILIKE '%' || q || '%'
    );

  RETURN QUERY
  SELECT
    pr.user_id,
    u.email::TEXT,
    pr.is_superadmin,
    pr.salon_id,
    s.name AS salon_name,
    u.created_at AS user_created_at,
    u.last_sign_in_at,
    total AS total_count
  FROM profiles pr
  JOIN auth.users u ON u.id = pr.user_id
  LEFT JOIN salons s ON s.id = pr.salon_id
  WHERE (filters->>'is_superadmin' IS NULL OR pr.is_superadmin = (filters->>'is_superadmin')::BOOLEAN)
    AND (filters->>'salon_id' IS NULL OR pr.salon_id = (filters->>'salon_id')::UUID)
    AND (
      q IS NULL
      OR u.email ILIKE '%' || q || '%'
      OR COALESCE(s.name, '') ILIKE '%' || q || '%'
      OR COALESCE(pr.role::TEXT, '') ILIKE '%' || q || '%'
      OR COALESCE(pr.first_name, '') ILIKE '%' || q || '%'
      OR COALESCE(pr.last_name, '') ILIKE '%' || q || '%'
      OR CONCAT_WS(' ', COALESCE(pr.first_name, ''), COALESCE(pr.last_name, '')) ILIKE '%' || q || '%'
      OR CASE WHEN pr.is_superadmin THEN 'super admin' ELSE 'user' END ILIKE '%' || q || '%'
      OR TO_CHAR(u.created_at, 'YYYY-MM-DD HH24:MI') ILIKE '%' || q || '%'
      OR TO_CHAR(COALESCE(u.last_sign_in_at, u.created_at), 'YYYY-MM-DD HH24:MI') ILIKE '%' || q || '%'
      OR pr.user_id::TEXT ILIKE '%' || q || '%'
    )
  ORDER BY
    CASE WHEN sort_col = 'email' AND sort_dir = 'asc' THEN u.email END ASC,
    CASE WHEN sort_col = 'email' AND sort_dir = 'desc' THEN u.email END DESC,
    CASE WHEN sort_col = 'created_at' AND sort_dir = 'asc' THEN u.created_at END ASC,
    CASE WHEN sort_col = 'created_at' AND sort_dir = 'desc' THEN u.created_at END DESC,
    u.created_at DESC  -- fallback
  LIMIT lim
  OFFSET off;
END;
$$;


--
-- Name: get_users_to_notify(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_users_to_notify(p_notification_type text, p_salon_id uuid DEFAULT NULL::uuid) RETURNS TABLE(user_id uuid, endpoint text, p256dh text, auth text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.user_id,
    ps.endpoint,
    ps.p256dh,
    ps.auth
  FROM push_subscriptions ps
  JOIN notification_preferences np ON ps.user_id = np.user_id
  LEFT JOIN employees e ON ps.user_id = e.user_id
  WHERE 
    -- Check notification type preference
    CASE p_notification_type
      WHEN 'new_booking' THEN np.new_booking
      WHEN 'booking_reminder' THEN np.booking_reminder
      WHEN 'booking_cancelled' THEN np.booking_cancelled
      WHEN 'booking_rescheduled' THEN np.booking_rescheduled
      WHEN 'daily_summary' THEN np.daily_summary
      ELSE true
    END = true
    -- Check quiet hours (if set)
    AND (
      np.quiet_hours_start IS NULL 
      OR np.quiet_hours_end IS NULL
      OR NOT (
        CURRENT_TIME >= np.quiet_hours_start 
        AND CURRENT_TIME < np.quiet_hours_end
      )
    )
    -- Filter by salon if provided
    AND (p_salon_id IS NULL OR e.salon_id = p_salon_id);
END;
$$;


--
-- Name: FUNCTION get_users_to_notify(p_notification_type text, p_salon_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_users_to_notify(p_notification_type text, p_salon_id uuid) IS 'Returns push subscription data for users who should receive a notification';


--
-- Name: increment_sms_usage_and_log(uuid, timestamp with time zone, timestamp with time zone, uuid, text, text, integer, integer, numeric, public.plan_type, uuid, uuid, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_sms_usage_and_log(p_salon_id uuid, p_period_start timestamp with time zone, p_period_end timestamp with time zone, p_idempotency_key uuid, p_recipient_phone text, p_sms_type text, p_included_quota integer, p_hard_cap integer DEFAULT NULL::integer, p_effective_unit_price_at_send numeric DEFAULT 0, p_plan_at_send public.plan_type DEFAULT NULL::public.plan_type, p_booking_id uuid DEFAULT NULL::uuid, p_waitlist_id uuid DEFAULT NULL::uuid, p_currency text DEFAULT 'NOK'::text, p_metadata jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_usage sms_usage%ROWTYPE;
  v_existing_log sms_log%ROWTYPE;
  v_new_used_count INTEGER;
  v_new_overage_count INTEGER;
  v_overage_cost_delta NUMERIC(12, 4);
  v_blocked BOOLEAN := false;
BEGIN
  IF p_salon_id IS NULL THEN
    RAISE EXCEPTION 'p_salon_id is required' USING ERRCODE = 'P0001';
  END IF;

  IF p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'p_idempotency_key is required' USING ERRCODE = 'P0001';
  END IF;

  IF COALESCE(TRIM(p_recipient_phone), '') = '' THEN
    RAISE EXCEPTION 'p_recipient_phone is required' USING ERRCODE = 'P0001';
  END IF;

  IF COALESCE(TRIM(p_sms_type), '') = '' THEN
    RAISE EXCEPTION 'p_sms_type is required' USING ERRCODE = 'P0001';
  END IF;

  IF p_period_start IS NULL OR p_period_end IS NULL OR p_period_end <= p_period_start THEN
    RAISE EXCEPTION 'Invalid period window' USING ERRCODE = 'P0001';
  END IF;

  IF p_included_quota < 0 THEN
    RAISE EXCEPTION 'p_included_quota must be >= 0' USING ERRCODE = 'P0001';
  END IF;

  IF p_hard_cap IS NOT NULL AND p_hard_cap < 0 THEN
    RAISE EXCEPTION 'p_hard_cap must be >= 0 when provided' USING ERRCODE = 'P0001';
  END IF;

  IF p_effective_unit_price_at_send < 0 THEN
    RAISE EXCEPTION 'p_effective_unit_price_at_send must be >= 0' USING ERRCODE = 'P0001';
  END IF;

  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE user_id = auth.uid()
        AND salon_id = p_salon_id
    ) THEN
      RAISE EXCEPTION 'Access denied for salon %', p_salon_id USING ERRCODE = 'P0001';
    END IF;
  END IF;

  SELECT *
  INTO v_existing_log
  FROM sms_log
  WHERE salon_id = p_salon_id
    AND idempotency_key = p_idempotency_key;

  IF FOUND THEN
    SELECT *
    INTO v_usage
    FROM sms_usage
    WHERE salon_id = p_salon_id
      AND period_start = p_period_start
      AND period_end = p_period_end;

    RETURN jsonb_build_object(
      'allowed', v_existing_log.status <> 'blocked',
      'idempotent_replay', true,
      'log_id', v_existing_log.id,
      'status', v_existing_log.status,
      'provider_message_id', v_existing_log.provider_message_id,
      'used_count', COALESCE(v_usage.used_count, 0),
      'overage_count', COALESCE(v_usage.overage_count, 0),
      'hard_cap_reached', COALESCE(v_usage.hard_cap_reached, false)
    );
  END IF;

  PERFORM ensure_sms_usage_row_for_period(
    p_salon_id,
    p_period_start,
    p_period_end,
    p_included_quota,
    p_hard_cap
  );

  SELECT *
  INTO v_usage
  FROM sms_usage
  WHERE salon_id = p_salon_id
    AND period_start = p_period_start
    AND period_end = p_period_end
  FOR UPDATE;

  IF v_usage.hard_cap IS NOT NULL AND v_usage.used_count >= v_usage.hard_cap THEN
    v_blocked := true;
  END IF;

  IF v_blocked THEN
    INSERT INTO sms_log (
      salon_id,
      booking_id,
      waitlist_id,
      recipient_phone,
      sms_type,
      status,
      idempotency_key,
      plan_at_send,
      effective_unit_price_at_send,
      cost_estimate,
      cost_source,
      currency,
      metadata,
      error_message
    ) VALUES (
      p_salon_id,
      p_booking_id,
      p_waitlist_id,
      p_recipient_phone,
      p_sms_type,
      'blocked',
      p_idempotency_key,
      p_plan_at_send,
      p_effective_unit_price_at_send,
      0,
      'estimate',
      p_currency,
      p_metadata,
      'Hard cap reached for billing period'
    )
    RETURNING * INTO v_existing_log;

    UPDATE sms_usage
    SET hard_cap_reached = true
    WHERE id = v_usage.id;

    RETURN jsonb_build_object(
      'allowed', false,
      'idempotent_replay', false,
      'log_id', v_existing_log.id,
      'status', v_existing_log.status,
      'provider_message_id', NULL,
      'used_count', v_usage.used_count,
      'overage_count', v_usage.overage_count,
      'hard_cap_reached', true
    );
  END IF;

  v_new_used_count := v_usage.used_count + 1;
  v_new_overage_count := GREATEST(v_new_used_count - v_usage.included_quota, 0);
  v_overage_cost_delta := GREATEST(v_new_overage_count - v_usage.overage_count, 0) * p_effective_unit_price_at_send;

  INSERT INTO sms_log (
    salon_id,
    booking_id,
    waitlist_id,
    recipient_phone,
    sms_type,
    status,
    idempotency_key,
    plan_at_send,
    effective_unit_price_at_send,
    cost_estimate,
    cost_source,
    currency,
    metadata
  ) VALUES (
    p_salon_id,
    p_booking_id,
    p_waitlist_id,
    p_recipient_phone,
    p_sms_type,
    'pending',
    p_idempotency_key,
    p_plan_at_send,
    p_effective_unit_price_at_send,
    p_effective_unit_price_at_send,
    'estimate',
    p_currency,
    p_metadata
  )
  RETURNING * INTO v_existing_log;

  UPDATE sms_usage
  SET
    used_count = v_new_used_count,
    overage_count = v_new_overage_count,
    overage_cost_estimate = overage_cost_estimate + v_overage_cost_delta,
    hard_cap_reached = CASE
      WHEN hard_cap IS NULL THEN false
      WHEN v_new_used_count >= hard_cap THEN true
      ELSE false
    END
  WHERE id = v_usage.id
  RETURNING * INTO v_usage;

  RETURN jsonb_build_object(
    'allowed', true,
    'idempotent_replay', false,
    'log_id', v_existing_log.id,
    'status', v_existing_log.status,
    'provider_message_id', v_existing_log.provider_message_id,
    'used_count', v_usage.used_count,
    'overage_count', v_usage.overage_count,
    'hard_cap_reached', v_usage.hard_cap_reached
  );
END;
$$;


--
-- Name: FUNCTION increment_sms_usage_and_log(p_salon_id uuid, p_period_start timestamp with time zone, p_period_end timestamp with time zone, p_idempotency_key uuid, p_recipient_phone text, p_sms_type text, p_included_quota integer, p_hard_cap integer, p_effective_unit_price_at_send numeric, p_plan_at_send public.plan_type, p_booking_id uuid, p_waitlist_id uuid, p_currency text, p_metadata jsonb); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.increment_sms_usage_and_log(p_salon_id uuid, p_period_start timestamp with time zone, p_period_end timestamp with time zone, p_idempotency_key uuid, p_recipient_phone text, p_sms_type text, p_included_quota integer, p_hard_cap integer, p_effective_unit_price_at_send numeric, p_plan_at_send public.plan_type, p_booking_id uuid, p_waitlist_id uuid, p_currency text, p_metadata jsonb) IS 'Atomically enforces quota/hard cap, writes pending/blocked sms_log, increments usage, and supports deterministic idempotent retries.';


--
-- Name: is_superadmin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_superadmin() RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles
    WHERE user_id = auth.uid() 
    AND is_superadmin = TRUE
  );
END;
$$;


--
-- Name: mark_all_notifications_read(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_all_notifications_read(p_user_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Only allow users to mark their own notifications
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE notifications
  SET read = TRUE
  WHERE user_id = p_user_id AND read = FALSE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;


--
-- Name: notify_salon_staff_booking_cancelled(uuid, text, text, timestamp with time zone, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_salon_staff_booking_cancelled(p_salon_id uuid, p_customer_name text, p_service_name text, p_booking_time timestamp with time zone, p_booking_id uuid, p_timezone text DEFAULT 'UTC'::text) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_staff RECORD;
  v_count INTEGER := 0;
  v_title TEXT;
  v_body TEXT;
  v_formatted_time TEXT;
BEGIN
  -- Format booking time in salon timezone
  -- Use the provided timezone, or default to UTC
  v_formatted_time := to_char(p_booking_time AT TIME ZONE COALESCE(p_timezone, 'UTC'), 'DD.MM.YYYY HH24:MI');
  
  -- Create notification title and body
  v_title := 'Booking Cancelled';
  v_body := format('%s cancelled their booking for %s on %s', 
    p_customer_name, 
    COALESCE(p_service_name, 'a service'),
    v_formatted_time
  );

  -- Find all owners and managers for this salon
  FOR v_staff IN 
    SELECT user_id 
    FROM profiles 
    WHERE salon_id = p_salon_id 
      AND role IN ('owner', 'manager')
  LOOP
    -- Create notification for each staff member
    INSERT INTO notifications (
      user_id,
      salon_id,
      type,
      title,
      body,
      metadata,
      action_url,
      read
    ) VALUES (
      v_staff.user_id,
      p_salon_id,
      'booking',
      v_title,
      v_body,
      jsonb_build_object('booking_id', p_booking_id, 'event_type', 'booking_cancelled'),
      '/bookings?id=' || p_booking_id::TEXT,
      FALSE
    );
    
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;


--
-- Name: FUNCTION notify_salon_staff_booking_cancelled(p_salon_id uuid, p_customer_name text, p_service_name text, p_booking_time timestamp with time zone, p_booking_id uuid, p_timezone text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.notify_salon_staff_booking_cancelled(p_salon_id uuid, p_customer_name text, p_service_name text, p_booking_time timestamp with time zone, p_booking_id uuid, p_timezone text) IS 'Notify all salon owners/managers about a cancelled booking. p_timezone is the IANA timezone identifier (e.g., Europe/Oslo) for formatting the booking time.';


--
-- Name: notify_salon_staff_new_booking(uuid, text, text, timestamp with time zone, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_salon_staff_new_booking(p_salon_id uuid, p_customer_name text, p_service_name text, p_booking_time timestamp with time zone, p_booking_id uuid, p_timezone text DEFAULT 'UTC'::text) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_staff RECORD;
  v_count INTEGER := 0;
  v_title TEXT;
  v_body TEXT;
  v_formatted_time TEXT;
BEGIN
  -- Format booking time in salon timezone
  -- Use the provided timezone, or default to UTC
  v_formatted_time := to_char(p_booking_time AT TIME ZONE COALESCE(p_timezone, 'UTC'), 'DD.MM.YYYY HH24:MI');
  
  -- Create notification title and body
  v_title := 'New Booking';
  v_body := format('%s booked %s for %s', 
    p_customer_name, 
    COALESCE(p_service_name, 'a service'),
    v_formatted_time
  );

  -- Find all owners and managers for this salon
  FOR v_staff IN 
    SELECT user_id 
    FROM profiles 
    WHERE salon_id = p_salon_id 
      AND role IN ('owner', 'manager')
  LOOP
    -- Create notification for each staff member
    INSERT INTO notifications (
      user_id,
      salon_id,
      type,
      title,
      body,
      metadata,
      action_url,
      read
    ) VALUES (
      v_staff.user_id,
      p_salon_id,
      'booking',
      v_title,
      v_body,
      jsonb_build_object('booking_id', p_booking_id, 'event_type', 'new_booking'),
      '/bookings?id=' || p_booking_id::TEXT,
      FALSE
    );
    
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;


--
-- Name: FUNCTION notify_salon_staff_new_booking(p_salon_id uuid, p_customer_name text, p_service_name text, p_booking_time timestamp with time zone, p_booking_id uuid, p_timezone text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.notify_salon_staff_new_booking(p_salon_id uuid, p_customer_name text, p_service_name text, p_booking_time timestamp with time zone, p_booking_id uuid, p_timezone text) IS 'Notify all salon owners/managers about a new booking. p_timezone is the IANA timezone identifier (e.g., Europe/Oslo) for formatting the booking time.';


--
-- Name: prevent_delete_last_owner(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_delete_last_owner() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  owner_count INTEGER;
BEGIN
  -- Count remaining owners for this salon
  SELECT COUNT(*) INTO owner_count
  FROM profiles
  WHERE salon_id = OLD.salon_id
  AND user_id != OLD.user_id;
  
  -- If this is the last owner, prevent deletion
  IF owner_count = 0 THEN
    RAISE EXCEPTION 'Cannot delete the last owner of a salon. Salon must have at least one owner.';
  END IF;
  
  RETURN OLD;
END;
$$;


--
-- Name: prevent_nullify_last_owner(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_nullify_last_owner() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  owner_count INTEGER;
BEGIN
  -- Only check if salon_id is being set to NULL
  IF NEW.salon_id IS NULL AND OLD.salon_id IS NOT NULL THEN
    -- Count remaining owners for this salon
    SELECT COUNT(*) INTO owner_count
    FROM profiles
    WHERE salon_id = OLD.salon_id
    AND user_id != OLD.user_id;
    
    -- If this is the last owner, prevent nullification
    IF owner_count = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last owner of a salon. Salon must have at least one owner.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: prevent_salon_id_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_salon_id_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Check if salon_id is being changed
  IF OLD.salon_id IS DISTINCT FROM NEW.salon_id THEN
    RAISE EXCEPTION 'salon_id cannot be changed after INSERT. Attempted to change from % to %', 
      OLD.salon_id, NEW.salon_id;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: FUNCTION prevent_salon_id_change(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.prevent_salon_id_change() IS 'Prevents salon_id from being changed after INSERT. This ensures tenant isolation cannot be bypassed by updating salon_id.';


--
-- Name: release_waitlist_lifecycle_lock(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.release_waitlist_lifecycle_lock() RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT pg_advisory_unlock(9223372000001);
$$;


--
-- Name: resolve_waitlist_policy(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.resolve_waitlist_policy(p_salon_id uuid, p_service_id uuid) RETURNS TABLE(claim_expiry_minutes integer, reminder_after_minutes integer, cooldown_minutes integer, passive_decline_threshold integer, passive_cooldown_minutes integer, auto_notify_on_reactivation boolean)
    LANGUAGE sql STABLE
    AS $$
  SELECT
    w.claim_expiry_minutes,
    w.reminder_after_minutes,
    w.cooldown_minutes,
    w.passive_decline_threshold,
    w.passive_cooldown_minutes,
    w.auto_notify_on_reactivation
  FROM waitlist_policies w
  WHERE
    (w.salon_id IS NULL AND w.service_id IS NULL)
    OR (w.salon_id = p_salon_id AND w.service_id IS NULL)
    OR (w.salon_id = p_salon_id AND w.service_id = p_service_id)
  ORDER BY
    CASE WHEN w.salon_id IS NULL THEN 0 ELSE 1 END DESC,
    CASE WHEN w.service_id IS NULL THEN 0 ELSE 1 END DESC
  LIMIT 1;
$$;


--
-- Name: rpc_bookings_per_service(uuid, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rpc_bookings_per_service(p_salon_id uuid, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE(service_id uuid, service_name text, booking_count bigint, revenue_cents bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Verify user has access to this salon
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND (salon_id = p_salon_id OR is_superadmin = TRUE)
  ) THEN
    RAISE EXCEPTION 'Access denied to salon';
  END IF;

  RETURN QUERY
  SELECT 
    s.id as service_id,
    s.name as service_name,
    COUNT(*)::BIGINT as booking_count,
    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN s.price_cents ELSE 0 END), 0)::BIGINT as revenue_cents
  FROM bookings b
  INNER JOIN services s ON b.service_id = s.id
  WHERE b.salon_id = p_salon_id
    AND (p_start_date IS NULL OR b.start_time >= p_start_date)
    AND (p_end_date IS NULL OR b.start_time <= p_end_date)
  GROUP BY s.id, s.name
  ORDER BY booking_count DESC;
END;
$$;


--
-- Name: rpc_bookings_per_service(uuid, timestamp with time zone, timestamp with time zone, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rpc_bookings_per_service(p_salon_id uuid, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_employee_id uuid DEFAULT NULL::uuid) RETURNS TABLE(service_id uuid, service_name text, booking_count bigint, revenue_cents bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Verify user has access to this salon
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND (salon_id = p_salon_id OR is_superadmin = TRUE)
  ) THEN
    RAISE EXCEPTION 'Access denied to salon';
  END IF;

  RETURN QUERY
  SELECT 
    s.id as service_id,
    s.name as service_name,
    COUNT(*)::BIGINT as booking_count,
    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN s.price_cents ELSE 0 END), 0)::BIGINT as revenue_cents
  FROM bookings b
  INNER JOIN services s ON b.service_id = s.id
  WHERE b.salon_id = p_salon_id
    AND (p_start_date IS NULL OR b.start_time >= p_start_date)
    AND (p_end_date IS NULL OR b.start_time <= p_end_date)
    AND (p_employee_id IS NULL OR b.employee_id = p_employee_id)
  GROUP BY s.id, s.name
  ORDER BY booking_count DESC;
END;
$$;


--
-- Name: rpc_capacity_utilisation(uuid, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rpc_capacity_utilisation(p_salon_id uuid, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE(total_hours_booked numeric, total_hours_available numeric, utilisation_percentage numeric, total_bookings bigint, average_booking_duration_minutes numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
  v_total_hours_booked NUMERIC;
  v_total_hours_available NUMERIC;
  v_total_bookings BIGINT;
  v_avg_duration NUMERIC;
BEGIN
  -- Verify user has access to this salon
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND (salon_id = p_salon_id OR is_superadmin = TRUE)
  ) THEN
    RAISE EXCEPTION 'Access denied to salon';
  END IF;

  -- Set default date range to last 30 days if not provided
  v_start_date := COALESCE(p_start_date, NOW() - INTERVAL '30 days');
  v_end_date := COALESCE(p_end_date, NOW());

  -- Calculate total hours booked (only confirmed/completed bookings)
  SELECT 
    COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600.0), 0),
    COUNT(*),
    COALESCE(AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60.0), 0)
  INTO v_total_hours_booked, v_total_bookings, v_avg_duration
  FROM bookings
  WHERE salon_id = p_salon_id
    AND status IN ('confirmed', 'completed', 'scheduled')
    AND start_time >= v_start_date
    AND start_time <= v_end_date;

  -- Calculate total available hours
  -- This is a simplified calculation: assumes 8 hours per day for all active employees
  -- In a real scenario, this would consider opening hours and employee shifts
  SELECT 
    COALESCE(
      COUNT(DISTINCT DATE(start_time)) * 
      COUNT(DISTINCT employee_id) * 
      8.0, -- 8 hours per day per employee
      0
    )
  INTO v_total_hours_available
  FROM bookings
  WHERE salon_id = p_salon_id
    AND start_time >= v_start_date
    AND start_time <= v_end_date;

  -- If no bookings, use employee count * days * 8 hours
  IF v_total_hours_available = 0 THEN
    SELECT 
      COALESCE(
        (v_end_date::DATE - v_start_date::DATE + 1) * 
        COUNT(*) * 
        8.0,
        0
      )
    INTO v_total_hours_available
    FROM employees
    WHERE salon_id = p_salon_id
      AND is_active = TRUE;
  END IF;

  -- Calculate utilisation percentage
  RETURN QUERY
  SELECT 
    v_total_hours_booked,
    v_total_hours_available,
    CASE 
      WHEN v_total_hours_available > 0 
      THEN (v_total_hours_booked / v_total_hours_available * 100.0)
      ELSE 0
    END as utilisation_percentage,
    v_total_bookings,
    v_avg_duration;
END;
$$;


--
-- Name: rpc_capacity_utilisation(uuid, timestamp with time zone, timestamp with time zone, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rpc_capacity_utilisation(p_salon_id uuid, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_employee_id uuid DEFAULT NULL::uuid) RETURNS TABLE(total_hours_booked numeric, total_hours_available numeric, utilisation_percentage numeric, total_bookings bigint, average_booking_duration_minutes numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
  v_total_hours_booked NUMERIC;
  v_total_hours_available NUMERIC;
  v_total_bookings BIGINT;
  v_avg_duration NUMERIC;
BEGIN
  -- Verify user has access to this salon
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND (salon_id = p_salon_id OR is_superadmin = TRUE)
  ) THEN
    RAISE EXCEPTION 'Access denied to salon';
  END IF;

  -- Set default date range to last 30 days if not provided
  v_start_date := COALESCE(p_start_date, NOW() - INTERVAL '30 days');
  v_end_date := COALESCE(p_end_date, NOW());

  -- Calculate total hours booked (only confirmed/completed bookings)
  SELECT 
    COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600.0), 0),
    COUNT(*),
    COALESCE(AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60.0), 0)
  INTO v_total_hours_booked, v_total_bookings, v_avg_duration
  FROM bookings
  WHERE salon_id = p_salon_id
    AND status IN ('confirmed', 'completed', 'scheduled')
    AND start_time >= v_start_date
    AND start_time <= v_end_date
    AND (p_employee_id IS NULL OR employee_id = p_employee_id);

  -- Calculate total available hours
  -- This is a simplified calculation: assumes 8 hours per day for all active employees
  -- In a real scenario, this would consider opening hours and employee shifts
  SELECT 
    COALESCE(
      COUNT(DISTINCT DATE(start_time)) * 
      COUNT(DISTINCT employee_id) * 
      8.0, -- 8 hours per day per employee
      0
    )
  INTO v_total_hours_available
  FROM bookings
  WHERE salon_id = p_salon_id
    AND start_time >= v_start_date
    AND start_time <= v_end_date
    AND (p_employee_id IS NULL OR employee_id = p_employee_id);

  -- If no bookings, use employee count * days * 8 hours
  IF v_total_hours_available = 0 THEN
    SELECT 
      COALESCE(
        (v_end_date::DATE - v_start_date::DATE + 1) * 
        COUNT(*) * 
        8.0,
        0
      )
    INTO v_total_hours_available
    FROM employees
    WHERE salon_id = p_salon_id
      AND is_active = TRUE
      AND (p_employee_id IS NULL OR id = p_employee_id);
  END IF;

  -- Calculate utilisation percentage
  RETURN QUERY
  SELECT 
    v_total_hours_booked,
    v_total_hours_available,
    CASE 
      WHEN v_total_hours_available > 0 
      THEN (v_total_hours_booked / v_total_hours_available * 100.0)
      ELSE 0
    END as utilisation_percentage,
    v_total_bookings,
    v_avg_duration;
END;
$$;


--
-- Name: rpc_revenue_by_month(uuid, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rpc_revenue_by_month(p_salon_id uuid, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE(month date, revenue_cents bigint, booking_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Verify user has access to this salon
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND (salon_id = p_salon_id OR is_superadmin = TRUE)
  ) THEN
    RAISE EXCEPTION 'Access denied to salon';
  END IF;

  RETURN QUERY
  SELECT 
    DATE_TRUNC('month', b.start_time)::DATE as month,
    COALESCE(SUM(s.price_cents), 0)::BIGINT as revenue_cents,
    COUNT(*)::BIGINT as booking_count
  FROM bookings b
  INNER JOIN services s ON b.service_id = s.id
  WHERE b.salon_id = p_salon_id
    AND b.status = 'completed'
    AND (p_start_date IS NULL OR b.start_time >= p_start_date)
    AND (p_end_date IS NULL OR b.start_time <= p_end_date)
  GROUP BY DATE_TRUNC('month', b.start_time)
  ORDER BY month ASC;
END;
$$;


--
-- Name: rpc_revenue_by_month(uuid, timestamp with time zone, timestamp with time zone, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rpc_revenue_by_month(p_salon_id uuid, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_employee_id uuid DEFAULT NULL::uuid) RETURNS TABLE(month date, revenue_cents bigint, booking_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Verify user has access to this salon
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND (salon_id = p_salon_id OR is_superadmin = TRUE)
  ) THEN
    RAISE EXCEPTION 'Access denied to salon';
  END IF;

  RETURN QUERY
  SELECT 
    DATE_TRUNC('month', b.start_time)::DATE as month,
    COALESCE(SUM(s.price_cents), 0)::BIGINT as revenue_cents,
    COUNT(*)::BIGINT as booking_count
  FROM bookings b
  INNER JOIN services s ON b.service_id = s.id
  WHERE b.salon_id = p_salon_id
    AND b.status = 'completed'
    AND (p_start_date IS NULL OR b.start_time >= p_start_date)
    AND (p_end_date IS NULL OR b.start_time <= p_end_date)
    AND (p_employee_id IS NULL OR b.employee_id = p_employee_id)
  GROUP BY DATE_TRUNC('month', b.start_time)
  ORDER BY month ASC;
END;
$$;


--
-- Name: rpc_total_bookings(uuid, text, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rpc_total_bookings(p_salon_id uuid, p_status text DEFAULT NULL::text, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE(total_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Verify user has access to this salon
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND (salon_id = p_salon_id OR is_superadmin = TRUE)
  ) THEN
    RAISE EXCEPTION 'Access denied to salon';
  END IF;

  RETURN QUERY
  SELECT COUNT(*)::BIGINT as total_count
  FROM bookings b
  WHERE b.salon_id = p_salon_id
    AND (p_status IS NULL OR b.status = p_status)
    AND (p_start_date IS NULL OR b.start_time >= p_start_date)
    AND (p_end_date IS NULL OR b.start_time <= p_end_date);
END;
$$;


--
-- Name: rpc_total_bookings(uuid, text, timestamp with time zone, timestamp with time zone, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rpc_total_bookings(p_salon_id uuid, p_status text DEFAULT NULL::text, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_employee_id uuid DEFAULT NULL::uuid) RETURNS TABLE(total_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Verify user has access to this salon
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND (salon_id = p_salon_id OR is_superadmin = TRUE)
  ) THEN
    RAISE EXCEPTION 'Access denied to salon';
  END IF;

  RETURN QUERY
  SELECT COUNT(*)::BIGINT as total_count
  FROM bookings b
  WHERE b.salon_id = p_salon_id
    AND (p_status IS NULL OR b.status = p_status)
    AND (p_start_date IS NULL OR b.start_time >= p_start_date)
    AND (p_end_date IS NULL OR b.start_time <= p_end_date)
    AND (p_employee_id IS NULL OR b.employee_id = p_employee_id);
END;
$$;


--
-- Name: save_plan_features(jsonb, jsonb, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.save_plan_features(p_upserts jsonb DEFAULT '[]'::jsonb, p_deletes jsonb DEFAULT '[]'::jsonb, p_snapshot_at timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_latest TIMESTAMPTZ;
  v_upsert JSONB;
  v_delete JSONB;
  v_upsert_count INT := 0;
  v_delete_count INT := 0;
  v_caller UUID;
BEGIN
  -- 1. Auth check: only superadmins
  v_caller := auth.uid();
  IF v_caller IS NULL OR NOT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = v_caller AND is_superadmin = true
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function'
      USING ERRCODE = 'P0001';
  END IF;

  -- 2. Concurrency check
  IF p_snapshot_at IS NOT NULL THEN
    SELECT MAX(created_at) INTO v_latest FROM plan_features;
    IF v_latest IS NOT NULL AND v_latest > p_snapshot_at THEN
      RAISE EXCEPTION 'CONFLICT: plan_features were modified after your snapshot (% > %). Please reload.',
        v_latest, p_snapshot_at
        USING ERRCODE = 'P0002';
    END IF;
  END IF;

  -- 3. Process deletes
  -- Each element: { "plan_type": "starter", "feature_id": "uuid" }
  FOR v_delete IN SELECT * FROM jsonb_array_elements(p_deletes)
  LOOP
    DELETE FROM plan_features
    WHERE plan_type = (v_delete->>'plan_type')::plan_type
      AND feature_id = (v_delete->>'feature_id')::UUID;
    v_delete_count := v_delete_count + 1;
  END LOOP;

  -- 4. Process upserts (insert or update limit_value)
  -- Each element: { "plan_type": "pro", "feature_id": "uuid", "limit_value": 5 }
  FOR v_upsert IN SELECT * FROM jsonb_array_elements(p_upserts)
  LOOP
    INSERT INTO plan_features (plan_type, feature_id, limit_value)
    VALUES (
      (v_upsert->>'plan_type')::plan_type,
      (v_upsert->>'feature_id')::UUID,
      CASE WHEN v_upsert->>'limit_value' IS NULL THEN NULL
           ELSE (v_upsert->>'limit_value')::NUMERIC END
    )
    ON CONFLICT (plan_type, feature_id)
    DO UPDATE SET limit_value = CASE
      WHEN v_upsert->>'limit_value' IS NULL THEN NULL
      ELSE (v_upsert->>'limit_value')::NUMERIC
    END;
    v_upsert_count := v_upsert_count + 1;
  END LOOP;

  -- 5. Audit log
  INSERT INTO security_audit_log (user_id, action, resource_type, metadata)
  VALUES (
    v_caller,
    'plan_features_updated',
    'plan_features',
    jsonb_build_object(
      'upserts', v_upsert_count,
      'deletes', v_delete_count,
      'snapshot_at', p_snapshot_at
    )
  );

  -- 6. Return summary
  RETURN jsonb_build_object(
    'success', true,
    'upserts', v_upsert_count,
    'deletes', v_delete_count
  );
END;
$$;


--
-- Name: FUNCTION save_plan_features(p_upserts jsonb, p_deletes jsonb, p_snapshot_at timestamp with time zone); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.save_plan_features(p_upserts jsonb, p_deletes jsonb, p_snapshot_at timestamp with time zone) IS 'Atomic batch save for plan features matrix. Accepts upserts/deletes, checks concurrency, writes audit log.';


--
-- Name: set_waitlist_lifecycle_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_waitlist_lifecycle_fields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  policy_claim_expiry_minutes INTEGER;
BEGIN
  SELECT p.claim_expiry_minutes
  INTO policy_claim_expiry_minutes
  FROM resolve_waitlist_policy(NEW.salon_id, NEW.service_id) p;

  policy_claim_expiry_minutes := COALESCE(policy_claim_expiry_minutes, 15);

  IF NEW.status = 'notified' THEN
    NEW.notified_at := COALESCE(NEW.notified_at, now());
    NEW.expires_at := COALESCE(
      NEW.expires_at,
      NEW.notified_at + make_interval(mins => policy_claim_expiry_minutes)
    );
    NEW.cooldown_until := NULL;
    NEW.cooldown_reason := NULL;
  ELSIF NEW.status = 'waiting' THEN
    NEW.notified_at := NULL;
    NEW.expires_at := NULL;
    NEW.cooldown_until := NULL;
    NEW.cooldown_reason := NULL;
  ELSIF NEW.status = 'cooldown' THEN
    NEW.notified_at := NULL;
    NEW.expires_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: trigger_process_reminders(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_process_reminders() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  PERFORM
    net.http_post(
      url := COALESCE(
        current_setting('app.supabase_url', true),
        current_setting('app.supabase_url')
      ) || '/functions/v1/process-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(
          current_setting('app.supabase_service_role_key', true),
          current_setting('app.supabase_service_role_key')
        )
      ),
      body := jsonb_build_object('limit', 100)
    );
END;
$$;


--
-- Name: FUNCTION trigger_process_reminders(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.trigger_process_reminders() IS 'Manually trigger the process-reminders Edge Function. Useful for testing.';


--
-- Name: update_addons_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_addons_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_booking_atomic(uuid, uuid, timestamp with time zone, timestamp with time zone, uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_booking_atomic(p_salon_id uuid, p_booking_id uuid, p_start_time timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_time timestamp with time zone DEFAULT NULL::timestamp with time zone, p_employee_id uuid DEFAULT NULL::uuid, p_status text DEFAULT NULL::text, p_notes text DEFAULT NULL::text) RETURNS TABLE(id uuid, start_time timestamp with time zone, end_time timestamp with time zone, status text, is_walk_in boolean, notes text, customers jsonb, employees jsonb, services jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_booking RECORD;
  v_target_start TIMESTAMPTZ;
  v_target_end TIMESTAMPTZ;
  v_target_employee UUID;
  v_target_status TEXT;
  v_target_notes TEXT;
  v_duration INTERVAL;
BEGIN
  SELECT b.*
  INTO v_booking
  FROM bookings b
  WHERE b.id = p_booking_id
    AND b.salon_id = p_salon_id
  FOR UPDATE;

  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  v_target_employee := COALESCE(p_employee_id, v_booking.employee_id);
  v_target_status := COALESCE(p_status, v_booking.status);
  v_target_notes := COALESCE(p_notes, v_booking.notes);

  v_duration := v_booking.end_time - v_booking.start_time;
  v_target_start := COALESCE(p_start_time, v_booking.start_time);
  v_target_end := COALESCE(p_end_time, CASE WHEN p_start_time IS NOT NULL THEN p_start_time + v_duration ELSE v_booking.end_time END);

  IF v_target_end <= v_target_start THEN
    RAISE EXCEPTION 'Invalid booking time range';
  END IF;

  -- Explicit pre-check improves error clarity for API clients.
  PERFORM 1
  FROM bookings b
  WHERE b.salon_id = p_salon_id
    AND b.employee_id = v_target_employee
    AND b.id <> p_booking_id
    AND b.status IN ('pending', 'confirmed', 'scheduled')
    AND tstzrange(b.start_time, b.end_time, '[)') && tstzrange(v_target_start, v_target_end, '[)');

  IF FOUND THEN
    RAISE EXCEPTION 'Time slot is already booked. Please select another time.';
  END IF;

  UPDATE bookings
  SET
    employee_id = v_target_employee,
    start_time = v_target_start,
    end_time = v_target_end,
    status = v_target_status,
    notes = v_target_notes,
    updated_at = NOW()
  WHERE bookings.id = p_booking_id
    AND bookings.salon_id = p_salon_id;

  RETURN QUERY
  SELECT
    b.id,
    b.start_time,
    b.end_time,
    b.status,
    b.is_walk_in,
    b.notes,
    jsonb_build_object('full_name', c.full_name) as customers,
    jsonb_build_object('id', e.id, 'full_name', e.full_name) as employees,
    jsonb_build_object('name', s.name) as services
  FROM bookings b
  LEFT JOIN customers c ON b.customer_id = c.id
  LEFT JOIN employees e ON b.employee_id = e.id
  LEFT JOIN services s ON b.service_id = s.id
  WHERE b.id = p_booking_id;
END;
$$;


--
-- Name: FUNCTION update_booking_atomic(p_salon_id uuid, p_booking_id uuid, p_start_time timestamp with time zone, p_end_time timestamp with time zone, p_employee_id uuid, p_status text, p_notes text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_booking_atomic(p_salon_id uuid, p_booking_id uuid, p_start_time timestamp with time zone, p_end_time timestamp with time zone, p_employee_id uuid, p_status text, p_notes text) IS 'Atomically updates booking schedule/employee/state with conflict checks to prevent race-condition double booking.';


--
-- Name: update_email_log_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_email_log_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_features_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_features_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_notification_events_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_notification_events_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_notification_jobs_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_notification_jobs_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_notification_preferences_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_notification_preferences_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_ohb_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_ohb_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_opening_hours_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_opening_hours_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_products_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_products_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_rate_limit_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_rate_limit_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_reminders_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_reminders_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_salon_ownerships_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_salon_ownerships_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: sms_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sms_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    booking_id uuid,
    waitlist_id uuid,
    recipient_phone text NOT NULL,
    sms_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    provider_name text,
    provider_message_id text,
    idempotency_key uuid NOT NULL,
    plan_at_send public.plan_type,
    effective_unit_price_at_send numeric(12,4) DEFAULT 0 NOT NULL,
    cost_estimate numeric(12,4) DEFAULT 0 NOT NULL,
    cost_actual numeric(12,4),
    cost_source text DEFAULT 'estimate'::text NOT NULL,
    currency text DEFAULT 'NOK'::text NOT NULL,
    metadata jsonb,
    error_message text,
    sent_at timestamp with time zone,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sms_log_cost_actual_check CHECK (((cost_actual IS NULL) OR (cost_actual >= (0)::numeric))),
    CONSTRAINT sms_log_cost_estimate_check CHECK ((cost_estimate >= (0)::numeric)),
    CONSTRAINT sms_log_cost_source_check CHECK ((cost_source = ANY (ARRAY['estimate'::text, 'provider'::text]))),
    CONSTRAINT sms_log_effective_unit_price_at_send_check CHECK ((effective_unit_price_at_send >= (0)::numeric)),
    CONSTRAINT sms_log_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text, 'blocked'::text, 'delivered'::text, 'undelivered'::text])))
);


--
-- Name: TABLE sms_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.sms_log IS 'SMS message log. Append-only for content fields; status fields may be updated by trusted service-role callbacks.';


--
-- Name: COLUMN sms_log.recipient_phone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sms_log.recipient_phone IS 'Normalized E.164 phone number used for provider delivery.';


--
-- Name: COLUMN sms_log.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sms_log.status IS 'Lifecycle: pending -> sent/failed/blocked -> delivered/undelivered.';


--
-- Name: COLUMN sms_log.idempotency_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sms_log.idempotency_key IS 'Request idempotency key unique per salon for deterministic retries.';


--
-- Name: update_sms_log_provider_result(uuid, text, text, text, text, timestamp with time zone, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_sms_log_provider_result(p_log_id uuid, p_status text, p_provider_name text DEFAULT NULL::text, p_provider_message_id text DEFAULT NULL::text, p_error_message text DEFAULT NULL::text, p_sent_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_metadata jsonb DEFAULT NULL::jsonb) RETURNS public.sms_log
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_row sms_log%ROWTYPE;
BEGIN
  IF p_log_id IS NULL THEN
    RAISE EXCEPTION 'p_log_id is required' USING ERRCODE = 'P0001';
  END IF;

  IF p_status IS NULL OR p_status NOT IN ('sent', 'failed', 'delivered', 'undelivered', 'pending', 'blocked') THEN
    RAISE EXCEPTION 'Invalid p_status: %', p_status USING ERRCODE = 'P0001';
  END IF;

  SELECT *
  INTO v_row
  FROM sms_log
  WHERE id = p_log_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'sms_log row not found: %', p_log_id USING ERRCODE = 'P0001';
  END IF;

  -- Access guard: service role or salon member.
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM profiles
      WHERE user_id = auth.uid()
        AND salon_id = v_row.salon_id
    ) THEN
      RAISE EXCEPTION 'Access denied for sms_log row %', p_log_id USING ERRCODE = 'P0001';
    END IF;
  END IF;

  UPDATE sms_log
  SET
    status = p_status,
    provider_name = COALESCE(p_provider_name, provider_name),
    provider_message_id = COALESCE(p_provider_message_id, provider_message_id),
    error_message = p_error_message,
    sent_at = COALESCE(p_sent_at, sent_at),
    metadata = COALESCE(metadata, '{}'::jsonb) || COALESCE(p_metadata, '{}'::jsonb)
  WHERE id = p_log_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;


--
-- Name: FUNCTION update_sms_log_provider_result(p_log_id uuid, p_status text, p_provider_name text, p_provider_message_id text, p_error_message text, p_sent_at timestamp with time zone, p_metadata jsonb); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_sms_log_provider_result(p_log_id uuid, p_status text, p_provider_name text, p_provider_message_id text, p_error_message text, p_sent_at timestamp with time zone, p_metadata jsonb) IS 'Controlled update for sms_log provider/status fields. Allows service_role or salon members via SECURITY DEFINER.';


--
-- Name: update_sms_usage_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_sms_usage_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_templates_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_templates_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_time_blocks_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_time_blocks_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: user_has_role(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.user_has_role(p_role_name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = p_role_name
  );
END;
$$;


--
-- Name: FUNCTION user_has_role(p_role_name text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.user_has_role(p_role_name text) IS 'Checks if the current user has a specific role. Returns true if user''s profile has matching role.';


--
-- Name: user_has_salon_permission(uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.user_has_salon_permission(p_user_id uuid, p_salon_id uuid, p_permission text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM salon_ownerships
    WHERE user_id = p_user_id
    AND salon_id = p_salon_id
    AND (permissions->>p_permission)::boolean = true
  );
END;
$$;


--
-- Name: FUNCTION user_has_salon_permission(p_user_id uuid, p_salon_id uuid, p_permission text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.user_has_salon_permission(p_user_id uuid, p_salon_id uuid, p_permission text) IS 'Check if user has specific permission for a salon';


--
-- Name: validate_booking_change(uuid, uuid, timestamp with time zone, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_booking_change(p_booking_id uuid, p_new_employee_id uuid DEFAULT NULL::uuid, p_new_start_time timestamp with time zone DEFAULT NULL::timestamp with time zone, p_new_service_id uuid DEFAULT NULL::uuid) RETURNS TABLE(is_valid boolean, conflicts jsonb, suggested_slots jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_salon_id UUID;
  v_employee_id UUID;
  v_service_id UUID;
  v_start_time TIMESTAMPTZ;
  v_duration INTEGER;
  v_prep INTEGER;
  v_cleanup INTEGER;
  v_end_time TIMESTAMPTZ;
  v_block_start TIMESTAMPTZ;
  v_block_end TIMESTAMPTZ;
  v_timezone TEXT;
  v_dow_pg INTEGER;
  v_dow_oh INTEGER;
  v_conflicts JSONB := '[]'::JSONB;
  v_suggestions JSONB := '[]'::JSONB;
  v_has_conflict BOOLEAN := false;
  conf_rec RECORD;
  slot_rec RECORD;
BEGIN
  -- Get current booking details
  SELECT b.salon_id, b.employee_id, b.service_id, b.start_time
    INTO v_salon_id, v_employee_id, v_service_id, v_start_time
    FROM bookings b WHERE b.id = p_booking_id;

  IF v_salon_id IS NULL THEN
    is_valid := false;
    conflicts := jsonb_build_array(jsonb_build_object('type', 'not_found', 'message_code', 'booking_not_found'));
    suggested_slots := '[]'::JSONB;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Apply changes (use new values or keep existing)
  v_employee_id := COALESCE(p_new_employee_id, v_employee_id);
  v_start_time := COALESCE(p_new_start_time, v_start_time);
  v_service_id := COALESCE(p_new_service_id, v_service_id);

  -- Get salon timezone
  SELECT s.timezone INTO v_timezone FROM salons s WHERE s.id = v_salon_id;
  IF v_timezone IS NULL THEN v_timezone := 'UTC'; END IF;

  -- Get service duration + buffers
  SELECT COALESCE(sv.duration_minutes, 30),
         COALESCE(sv.prep_minutes, 0),
         COALESCE(sv.cleanup_minutes, 0)
    INTO v_duration, v_prep, v_cleanup
    FROM services sv WHERE sv.id = v_service_id;

  IF v_duration IS NULL THEN
    v_duration := 30; v_prep := 0; v_cleanup := 0;
  END IF;

  -- Calculate new times
  v_end_time := v_start_time + (v_duration || ' minutes')::INTERVAL;
  v_block_start := v_start_time - (v_prep || ' minutes')::INTERVAL;
  v_block_end := v_end_time + (v_cleanup || ' minutes')::INTERVAL;

  -- ─── Check booking overlaps (exclude self) ─────────────
  FOR conf_rec IN
    SELECT b.id, b.start_time AS c_start, b.end_time AS c_end,
           c.full_name AS customer_name, s.name AS service_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN services s ON b.service_id = s.id
     WHERE b.salon_id = v_salon_id
       AND b.employee_id = v_employee_id
       AND b.id != p_booking_id
       AND b.status NOT IN ('cancelled', 'no-show')
       AND b.start_time < v_block_end
       AND b.end_time > v_block_start
  LOOP
    v_has_conflict := true;
    v_conflicts := v_conflicts || jsonb_build_array(jsonb_build_object(
      'type', 'booking_overlap',
      'start', conf_rec.c_start,
      'end', conf_rec.c_end,
      'source_id', conf_rec.id,
      'message_code', 'overlaps_booking',
      'customer_name', conf_rec.customer_name,
      'service_name', conf_rec.service_name
    ));
  END LOOP;

  -- ─── Check time_block overlaps ─────────────────────────
  FOR conf_rec IN
    SELECT tb.id, tb.start_time AS c_start, tb.end_time AS c_end,
           tb.title, tb.block_type
      FROM time_blocks tb
     WHERE tb.salon_id = v_salon_id
       AND (tb.employee_id = v_employee_id OR tb.employee_id IS NULL)
       AND (
         (tb.is_all_day AND tb.start_time::DATE = v_start_time::DATE)
         OR (NOT tb.is_all_day AND tb.start_time < v_block_end AND tb.end_time > v_block_start)
       )
  LOOP
    v_has_conflict := true;
    v_conflicts := v_conflicts || jsonb_build_array(jsonb_build_object(
      'type', 'time_block_overlap',
      'start', conf_rec.c_start,
      'end', conf_rec.c_end,
      'source_id', conf_rec.id,
      'message_code', 'overlaps_time_block',
      'title', conf_rec.title,
      'block_type', conf_rec.block_type
    ));
  END LOOP;

  -- ─── Check break overlaps ─────────────────────────────
  v_dow_pg := EXTRACT(DOW FROM (v_start_time AT TIME ZONE v_timezone));
  IF v_dow_pg = 0 THEN v_dow_oh := 6;
  ELSE v_dow_oh := v_dow_pg - 1;
  END IF;

  FOR conf_rec IN
    SELECT brk.id, brk.start_time AS b_start, brk.end_time AS b_end, brk.label
      FROM opening_hours_breaks brk
     WHERE brk.salon_id = v_salon_id
       AND brk.day_of_week = v_dow_oh
       AND (brk.employee_id IS NULL OR brk.employee_id = v_employee_id)
       AND brk.start_time < (v_block_end AT TIME ZONE v_timezone)::TIME
       AND brk.end_time > (v_block_start AT TIME ZONE v_timezone)::TIME
  LOOP
    v_has_conflict := true;
    v_conflicts := v_conflicts || jsonb_build_array(jsonb_build_object(
      'type', 'break_overlap',
      'start', (v_start_time::DATE::TEXT || ' ' || conf_rec.b_start::TEXT)::TIMESTAMP AT TIME ZONE v_timezone,
      'end', (v_start_time::DATE::TEXT || ' ' || conf_rec.b_end::TEXT)::TIMESTAMP AT TIME ZONE v_timezone,
      'source_id', conf_rec.id,
      'message_code', 'overlaps_break',
      'break_label', COALESCE(conf_rec.label, 'Break')
    ));
  END LOOP;

  -- ─── Generate suggestions if conflicts exist ───────────
  IF v_has_conflict THEN
    FOR slot_rec IN
      SELECT ga.slot_start, ga.slot_end
        FROM generate_availability(v_salon_id, v_employee_id, v_service_id, v_start_time::DATE) ga
       LIMIT 5
    LOOP
      v_suggestions := v_suggestions || jsonb_build_array(jsonb_build_object(
        'start', slot_rec.slot_start,
        'end', slot_rec.slot_end,
        'employee_id', v_employee_id
      ));
    END LOOP;
  END IF;

  -- Return result
  is_valid := NOT v_has_conflict;
  conflicts := v_conflicts;
  suggested_slots := v_suggestions;
  RETURN NEXT;
END;
$$;


--
-- Name: FUNCTION validate_booking_change(p_booking_id uuid, p_new_employee_id uuid, p_new_start_time timestamp with time zone, p_new_service_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.validate_booking_change(p_booking_id uuid, p_new_employee_id uuid, p_new_start_time timestamp with time zone, p_new_service_id uuid) IS 'Validates a proposed booking change. Returns conflicts and suggested alternative slots.';


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: addons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.addons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    type text NOT NULL,
    qty integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT addons_qty_check CHECK ((qty > 0)),
    CONSTRAINT addons_type_check CHECK ((type = ANY (ARRAY['extra_staff'::text, 'extra_languages'::text])))
);


--
-- Name: TABLE addons; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.addons IS 'Add-ons purchased by salons to extend plan limits. Types: extra_staff (additional employees), extra_languages (additional languages).';


--
-- Name: COLUMN addons.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.addons.type IS 'Type of add-on: extra_staff (additional employees beyond plan limit) or extra_languages (additional languages beyond plan limit).';


--
-- Name: COLUMN addons.qty; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.addons.qty IS 'Quantity of the add-on (e.g., number of extra staff members or extra languages).';


--
-- Name: admin_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    author_id uuid NOT NULL,
    content text NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT admin_notes_entity_type_check CHECK ((entity_type = ANY (ARRAY['salon'::text, 'user'::text, 'case'::text])))
);


--
-- Name: TABLE admin_notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.admin_notes IS 'Internal admin notes on salons, users, or support cases. Visible only to super admins. Immutable.';


--
-- Name: COLUMN admin_notes.entity_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_notes.entity_type IS 'Target entity type: salon, user, or case';


--
-- Name: COLUMN admin_notes.entity_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_notes.entity_id IS 'UUID of the target entity';


--
-- Name: COLUMN admin_notes.tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_notes.tags IS 'Tags array: vip, high_risk, needs_follow_up';


--
-- Name: booking_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price_cents integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE booking_products; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.booking_products IS 'Junction table linking bookings to products sold';


--
-- Name: COLUMN booking_products.quantity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.booking_products.quantity IS 'Quantity of product sold in this booking';


--
-- Name: COLUMN booking_products.price_cents; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.booking_products.price_cents IS 'Price per unit at time of sale (snapshot for historical accuracy)';


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    service_id uuid NOT NULL,
    customer_id uuid,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status text DEFAULT 'scheduled'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_walk_in boolean DEFAULT false,
    payment_source text DEFAULT 'cash'::text NOT NULL,
    gift_card_id uuid,
    customer_package_id uuid,
    is_imported boolean DEFAULT false,
    import_batch_id uuid,
    CONSTRAINT bookings_status_check CHECK (((status IS NULL) OR (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'no-show'::text, 'completed'::text, 'cancelled'::text, 'scheduled'::text]))))
);


--
-- Name: COLUMN bookings.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bookings.status IS 'Booking status: pending, confirmed, no-show, completed, cancelled, or scheduled';


--
-- Name: COLUMN bookings.is_walk_in; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bookings.is_walk_in IS 'Whether this booking was made as a walk-in (true) or online (false)';


--
-- Name: calendar_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    salon_id uuid NOT NULL,
    provider public.calendar_provider NOT NULL,
    access_token text NOT NULL,
    refresh_token text,
    token_expires_at timestamp with time zone,
    provider_user_id text,
    provider_email text,
    calendar_id text,
    calendar_name text,
    sync_direction public.sync_direction DEFAULT 'push'::public.sync_direction,
    sync_enabled boolean DEFAULT true,
    last_sync_at timestamp with time zone,
    last_sync_error text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE calendar_connections; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.calendar_connections IS 'OAuth tokens and settings for calendar provider connections';


--
-- Name: COLUMN calendar_connections.access_token; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.calendar_connections.access_token IS 'OAuth access token - should be encrypted before storage';


--
-- Name: COLUMN calendar_connections.refresh_token; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.calendar_connections.refresh_token IS 'OAuth refresh token - should be encrypted before storage';


--
-- Name: calendar_event_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_event_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    connection_id uuid NOT NULL,
    external_event_id text NOT NULL,
    external_calendar_id text NOT NULL,
    last_synced_at timestamp with time zone DEFAULT now(),
    sync_hash text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE calendar_event_mappings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.calendar_event_mappings IS 'Maps TeqBook bookings to external calendar events for sync tracking';


--
-- Name: COLUMN calendar_event_mappings.sync_hash; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.calendar_event_mappings.sync_hash IS 'Hash of booking data to detect changes needing sync';


--
-- Name: changelog_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.changelog_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    version text,
    type text DEFAULT 'feature'::text NOT NULL,
    published boolean DEFAULT false NOT NULL,
    published_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT changelog_entries_type_check CHECK ((type = ANY (ARRAY['feature'::text, 'improvement'::text, 'bugfix'::text, 'breaking'::text])))
);


--
-- Name: commission_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.commission_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    employee_id uuid,
    commission_type text DEFAULT 'percentage'::text NOT NULL,
    rate numeric DEFAULT 0 NOT NULL,
    applies_to text DEFAULT 'services'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    consent boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contact_submissions_email_check CHECK ((char_length(email) <= 200)),
    CONSTRAINT contact_submissions_message_check CHECK (((char_length(message) >= 10) AND (char_length(message) <= 2000))),
    CONSTRAINT contact_submissions_name_check CHECK (((char_length(name) >= 2) AND (char_length(name) <= 100)))
);


--
-- Name: TABLE contact_submissions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.contact_submissions IS 'Public contact form submissions from the marketing site.';


--
-- Name: customer_packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    package_id uuid NOT NULL,
    remaining_services jsonb DEFAULT '[]'::jsonb NOT NULL,
    purchased_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    full_name text NOT NULL,
    email text,
    phone text,
    notes text,
    gdpr_consent boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    no_show_count integer DEFAULT 0 NOT NULL,
    is_blocked boolean DEFAULT false NOT NULL,
    blocked_reason text,
    blocked_at timestamp with time zone,
    import_batch_id uuid
);


--
-- Name: data_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    entity_name text,
    requested_by uuid,
    approved_by uuid,
    executed_by uuid,
    reason text,
    metadata jsonb DEFAULT '{}'::jsonb,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT data_requests_entity_type_check CHECK ((entity_type = ANY (ARRAY['salon'::text, 'user'::text]))),
    CONSTRAINT data_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'processing'::text, 'completed'::text, 'rejected'::text]))),
    CONSTRAINT data_requests_type_check CHECK ((type = ANY (ARRAY['export'::text, 'deletion'::text, 'anonymization'::text])))
);


--
-- Name: email_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid,
    recipient_email text NOT NULL,
    subject text NOT NULL,
    email_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    provider_id text,
    error_message text,
    metadata jsonb,
    sent_at timestamp with time zone,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE email_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.email_log IS 'Tracks email delivery status for all sent emails';


--
-- Name: COLUMN email_log.email_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.email_log.email_type IS 'Type of email: booking_confirmation, booking_reminder, payment_failure, etc.';


--
-- Name: COLUMN email_log.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.email_log.status IS 'Delivery status: pending, sent, delivered, failed, bounced';


--
-- Name: COLUMN email_log.provider_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.email_log.provider_id IS 'ID returned from email provider (e.g., Resend email ID)';


--
-- Name: employee_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    service_id uuid NOT NULL,
    salon_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE employee_services; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.employee_services IS 'Junction table linking employees to services they can provide';


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    full_name text NOT NULL,
    email text,
    phone text,
    role text DEFAULT 'staff'::text NOT NULL,
    color text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    preferred_language text DEFAULT 'nb'::text,
    deleted_at timestamp with time zone,
    import_batch_id uuid,
    public_profile_visible boolean DEFAULT true NOT NULL,
    public_title text,
    bio text,
    profile_image_url text,
    specialties text[] DEFAULT '{}'::text[] NOT NULL,
    public_sort_order integer,
    CONSTRAINT employees_preferred_language_check CHECK (((preferred_language IS NULL) OR (preferred_language = ANY (ARRAY['nb'::text, 'en'::text, 'ar'::text, 'so'::text, 'ti'::text, 'am'::text, 'tr'::text, 'pl'::text, 'vi'::text, 'tl'::text, 'zh'::text, 'fa'::text, 'dar'::text, 'ur'::text, 'hi'::text]))))
);


--
-- Name: COLUMN employees.preferred_language; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employees.preferred_language IS 'Preferred language for employee interface (matches AppLocale)';


--
-- Name: COLUMN employees.public_profile_visible; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employees.public_profile_visible IS 'Controls whether employee is visible on public salon profile page.';


--
-- Name: COLUMN employees.public_title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employees.public_title IS 'Public-facing employee title shown on team cards.';


--
-- Name: COLUMN employees.bio; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employees.bio IS 'Public-facing employee bio shown in team modal.';


--
-- Name: COLUMN employees.profile_image_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employees.profile_image_url IS 'Public-facing employee profile image URL.';


--
-- Name: COLUMN employees.specialties; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employees.specialties IS 'Public-facing specialty tags shown on team cards/modal.';


--
-- Name: COLUMN employees.public_sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employees.public_sort_order IS 'Optional sort order for public team display.';


--
-- Name: feature_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feature_flags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid,
    flag_key text NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.features (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE features; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.features IS 'Available features in the system. Features represent modules/areas like BOOKINGS, CALENDAR, SHIFTS, etc.';


--
-- Name: COLUMN features.key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.features.key IS 'Unique feature identifier (e.g., "BOOKINGS", "CALENDAR", "SHIFTS", "ADVANCED_REPORTS")';


--
-- Name: COLUMN features.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.features.name IS 'Display name for the feature (e.g., "Bookings", "Calendar View")';


--
-- Name: COLUMN features.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.features.description IS 'Description of what this feature provides';


--
-- Name: feedback_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedback_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    feedback_id uuid NOT NULL,
    author_user_id uuid NOT NULL,
    author_role text DEFAULT 'salon'::text NOT NULL,
    message text NOT NULL,
    is_internal boolean DEFAULT false NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT feedback_comments_author_role_check CHECK ((author_role = ANY (ARRAY['salon'::text, 'admin'::text])))
);


--
-- Name: TABLE feedback_comments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.feedback_comments IS 'Threaded comments on feedback entries. is_internal=true means admin-only notes.';


--
-- Name: gift_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gift_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    code text NOT NULL,
    initial_value_cents integer NOT NULL,
    remaining_value_cents integer NOT NULL,
    purchased_by_customer_id uuid,
    recipient_name text,
    recipient_email text,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: import_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.import_batches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    import_type text NOT NULL,
    file_name text,
    total_rows integer DEFAULT 0 NOT NULL,
    success_count integer DEFAULT 0 NOT NULL,
    failed_count integer DEFAULT 0 NOT NULL,
    error_log jsonb DEFAULT '[]'::jsonb,
    column_mapping jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


--
-- Name: incidents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incidents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    severity text DEFAULT 'minor'::text NOT NULL,
    status text DEFAULT 'investigating'::text NOT NULL,
    description text,
    affected_services text[] DEFAULT '{}'::text[],
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    postmortem text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT incidents_severity_check CHECK ((severity = ANY (ARRAY['critical'::text, 'major'::text, 'minor'::text]))),
    CONSTRAINT incidents_status_check CHECK ((status = ANY (ARRAY['investigating'::text, 'identified'::text, 'monitoring'::text, 'resolved'::text])))
);


--
-- Name: no_show_policies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.no_show_policies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    max_strikes integer DEFAULT 3 NOT NULL,
    auto_block boolean DEFAULT false NOT NULL,
    warning_threshold integer DEFAULT 2 NOT NULL,
    reset_after_days integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notification_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    notification_job_id uuid NOT NULL,
    attempt_no integer NOT NULL,
    channel text NOT NULL,
    provider_used text,
    result text NOT NULL,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notification_attempts_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'sms'::text, 'in_app'::text]))),
    CONSTRAINT notification_attempts_result_check CHECK ((result = ANY (ARRAY['success'::text, 'failed'::text])))
);


--
-- Name: notification_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    event_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    last_error text,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    next_retry_at timestamp with time zone,
    dead_letter_reason text,
    provider_used text,
    CONSTRAINT notification_events_event_type_check CHECK ((event_type = ANY (ARRAY['confirmation'::text, 'reminder_24h'::text, 'reminder_2h'::text, 'cancellation'::text]))),
    CONSTRAINT notification_events_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'sent'::text, 'failed'::text, 'dead_letter'::text])))
);


--
-- Name: TABLE notification_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.notification_events IS 'Idempotency tracking for notification sending. Prevents duplicate emails when endpoint is called multiple times.';


--
-- Name: COLUMN notification_events.booking_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notification_events.booking_id IS 'The booking this notification is for';


--
-- Name: COLUMN notification_events.event_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notification_events.event_type IS 'Type of notification: confirmation, reminder_24h, reminder_2h, cancellation';


--
-- Name: COLUMN notification_events.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notification_events.status IS 'Current status: pending (queued), processing (being sent), sent (success), failed';


--
-- Name: COLUMN notification_events.attempts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notification_events.attempts IS 'Number of send attempts made';


--
-- Name: COLUMN notification_events.last_error; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notification_events.last_error IS 'Last error message if status is failed';


--
-- Name: COLUMN notification_events.next_retry_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notification_events.next_retry_at IS 'When failed events should be retried next.';


--
-- Name: COLUMN notification_events.dead_letter_reason; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notification_events.dead_letter_reason IS 'Reason event moved to dead-letter state.';


--
-- Name: COLUMN notification_events.provider_used; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notification_events.provider_used IS 'Provider used for last send attempt (email/sms).';


--
-- Name: notification_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    event_type text NOT NULL,
    delivery_status text DEFAULT 'queued'::text NOT NULL,
    provider_used text,
    dead_letter_reason text,
    next_retry_at timestamp with time zone,
    attempts_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notification_jobs_delivery_status_check CHECK ((delivery_status = ANY (ARRAY['queued'::text, 'processing'::text, 'sent'::text, 'failed'::text, 'dead_letter'::text]))),
    CONSTRAINT notification_jobs_event_type_check CHECK ((event_type = ANY (ARRAY['confirmation'::text, 'reminder_24h'::text, 'reminder_2h'::text, 'cancellation'::text])))
);


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_preferences (
    user_id uuid NOT NULL,
    new_booking boolean DEFAULT true NOT NULL,
    booking_reminder boolean DEFAULT true NOT NULL,
    booking_cancelled boolean DEFAULT true NOT NULL,
    booking_rescheduled boolean DEFAULT true NOT NULL,
    daily_summary boolean DEFAULT false NOT NULL,
    reminder_hours_before integer DEFAULT 24 NOT NULL,
    quiet_hours_start time without time zone,
    quiet_hours_end time without time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notification_preferences_reminder_hours_before_check CHECK (((reminder_hours_before >= 1) AND (reminder_hours_before <= 168)))
);


--
-- Name: TABLE notification_preferences; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.notification_preferences IS 'User preferences for notification types and timing';


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    salon_id uuid,
    type text DEFAULT 'info'::text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    metadata jsonb,
    action_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notifications_body_length CHECK ((char_length(body) <= 1000)),
    CONSTRAINT notifications_title_length CHECK ((char_length(title) <= 200)),
    CONSTRAINT notifications_type_check CHECK ((type = ANY (ARRAY['booking'::text, 'system'::text, 'staff'::text, 'info'::text])))
);


--
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.notifications IS 'In-app notifications. Realtime enabled for instant updates when new notifications are created.';


--
-- Name: COLUMN notifications.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.user_id IS 'The user who should see this notification';


--
-- Name: COLUMN notifications.salon_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.salon_id IS 'Optional salon context for the notification';


--
-- Name: COLUMN notifications.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.type IS 'Category of notification (booking, system, staff, info)';


--
-- Name: COLUMN notifications.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.title IS 'Short notification title (max 200 chars)';


--
-- Name: COLUMN notifications.body; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.body IS 'Full notification message (max 1000 chars)';


--
-- Name: COLUMN notifications.read; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.read IS 'Whether the user has read/dismissed this notification';


--
-- Name: COLUMN notifications.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.metadata IS 'Additional JSON data (booking_id, event_type, etc.)';


--
-- Name: COLUMN notifications.action_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.action_url IS 'URL to navigate to when notification is clicked';


--
-- Name: opening_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.opening_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    open_time time without time zone NOT NULL,
    close_time time without time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_closed boolean DEFAULT false NOT NULL,
    CONSTRAINT opening_hours_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: TABLE opening_hours; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.opening_hours IS 'Stores opening hours for each salon per day of the week';


--
-- Name: COLUMN opening_hours.day_of_week; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.opening_hours.day_of_week IS 'Day of week: 0 = Monday, 1 = Tuesday, ..., 6 = Sunday';


--
-- Name: COLUMN opening_hours.open_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.opening_hours.open_time IS 'Opening time in HH:MM format';


--
-- Name: COLUMN opening_hours.close_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.opening_hours.close_time IS 'Closing time in HH:MM format';


--
-- Name: COLUMN opening_hours.is_closed; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.opening_hours.is_closed IS 'Whether the salon is closed on this day of the week';


--
-- Name: opening_hours_breaks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.opening_hours_breaks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    label text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    employee_id uuid,
    applies_to_all_employees boolean DEFAULT true NOT NULL,
    CONSTRAINT opening_hours_breaks_check CHECK ((end_time > start_time)),
    CONSTRAINT opening_hours_breaks_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: TABLE opening_hours_breaks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.opening_hours_breaks IS 'Breaks (e.g. lunch) per day of week per salon. Max 1 per day enforced by unique constraint.';


--
-- Name: COLUMN opening_hours_breaks.day_of_week; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.opening_hours_breaks.day_of_week IS 'Day of week: 0 = Monday, 1 = Tuesday, ..., 6 = Sunday';


--
-- Name: COLUMN opening_hours_breaks.label; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.opening_hours_breaks.label IS 'Optional label, e.g. "Lunch", "Short break"';


--
-- Name: owner_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.owner_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    email text NOT NULL,
    role public.owner_role DEFAULT 'manager'::public.owner_role NOT NULL,
    invited_by uuid NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    accepted_at timestamp with time zone
);


--
-- Name: TABLE owner_invitations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.owner_invitations IS 'Pending invitations for new salon owners/managers';


--
-- Name: packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    included_services jsonb DEFAULT '[]'::jsonb NOT NULL,
    price_cents integer NOT NULL,
    validity_days integer DEFAULT 365 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: personalliste_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personalliste_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    date date NOT NULL,
    check_in timestamp with time zone NOT NULL,
    check_out timestamp with time zone,
    duration_minutes integer,
    status text DEFAULT 'ok'::text NOT NULL,
    changed_by uuid,
    changed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT personalliste_entries_status_check CHECK ((status = ANY (ARRAY['ok'::text, 'edited'::text])))
);


--
-- Name: TABLE personalliste_entries; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.personalliste_entries IS 'Staff register (personalliste): legal record of who was at work, check-in/check-out. Compliance documentation, not operational config.';


--
-- Name: plan_features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_features (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plan_type public.plan_type NOT NULL,
    feature_id uuid NOT NULL,
    limit_value numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE plan_features; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.plan_features IS 'Maps plan types (starter, pro, business) to features. Determines which features are available in each plan.';


--
-- Name: COLUMN plan_features.plan_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan_features.plan_type IS 'Plan type enum value (starter, pro, business)';


--
-- Name: COLUMN plan_features.feature_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan_features.feature_id IS 'Reference to the feature';


--
-- Name: COLUMN plan_features.limit_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan_features.limit_value IS 'Optional limit for this feature in this plan (e.g., max employees, max languages). NULL means unlimited or no limit.';


--
-- Name: portfolio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    image_url text NOT NULL,
    caption text,
    sort_order integer,
    is_featured boolean DEFAULT false NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    name text NOT NULL,
    price_cents integer DEFAULT 0 NOT NULL,
    stock integer DEFAULT 0,
    sku text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE products; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.products IS 'Products/inventory items that can be sold during bookings';


--
-- Name: COLUMN products.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.name IS 'Product name';


--
-- Name: COLUMN products.price_cents; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.price_cents IS 'Product price in cents (e.g., 2500 = $25.00)';


--
-- Name: COLUMN products.stock; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.stock IS 'Current stock quantity (can be negative for unlimited)';


--
-- Name: COLUMN products.sku; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.sku IS 'Stock Keeping Unit (optional product identifier)';


--
-- Name: COLUMN products.is_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.is_active IS 'Whether the product is active and available for sale';


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    user_id uuid NOT NULL,
    salon_id uuid,
    role text DEFAULT 'owner'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    is_superadmin boolean DEFAULT false NOT NULL,
    preferred_language text,
    user_preferences jsonb DEFAULT '{}'::jsonb,
    first_name text,
    last_name text,
    avatar_url text,
    admin_role text,
    CONSTRAINT profiles_role_check CHECK (((role IS NULL) OR (role = ANY (ARRAY['owner'::text, 'manager'::text, 'staff'::text, 'superadmin'::text]))))
);


--
-- Name: COLUMN profiles.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp when the profile was last updated';


--
-- Name: COLUMN profiles.is_superadmin; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.is_superadmin IS 'Whether this user is a super admin with access to the admin dashboard and all salons.';


--
-- Name: COLUMN profiles.preferred_language; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.preferred_language IS 'User preferred language (matches AppLocale)';


--
-- Name: COLUMN profiles.first_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.first_name IS 'User first name';


--
-- Name: COLUMN profiles.last_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.last_name IS 'User last name';


--
-- Name: COLUMN profiles.avatar_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image';


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


--
-- Name: TABLE push_subscriptions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.push_subscriptions IS 'Stores Web Push subscription data for users';


--
-- Name: rate_limit_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_limit_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    identifier_type text DEFAULT 'email'::text NOT NULL,
    endpoint_type text DEFAULT 'login'::text NOT NULL,
    attempts integer DEFAULT 1 NOT NULL,
    window_start timestamp with time zone DEFAULT now() NOT NULL,
    blocked_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE rate_limit_entries; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.rate_limit_entries IS 'Stores rate limit entries for server-side rate limiting';


--
-- Name: COLUMN rate_limit_entries.identifier; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rate_limit_entries.identifier IS 'The identifier being rate limited (email, IP, user_id, etc.)';


--
-- Name: COLUMN rate_limit_entries.identifier_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rate_limit_entries.identifier_type IS 'Type of identifier: email, ip, user_id';


--
-- Name: COLUMN rate_limit_entries.endpoint_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rate_limit_entries.endpoint_type IS 'Type of endpoint: login, api, booking, etc.';


--
-- Name: COLUMN rate_limit_entries.attempts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rate_limit_entries.attempts IS 'Number of attempts in current window';


--
-- Name: COLUMN rate_limit_entries.window_start; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rate_limit_entries.window_start IS 'Start of the rate limit window';


--
-- Name: COLUMN rate_limit_entries.blocked_until; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rate_limit_entries.blocked_until IS 'Timestamp when the identifier will be unblocked (NULL if not blocked)';


--
-- Name: reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reminders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    reminder_type text NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    sent_at timestamp with time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    next_attempt_at timestamp with time zone,
    last_error text,
    locked_at timestamp with time zone,
    locked_by text,
    CONSTRAINT reminders_reminder_type_check CHECK ((reminder_type = ANY (ARRAY['24h'::text, '2h'::text]))),
    CONSTRAINT reminders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sending'::text, 'sent'::text, 'failed'::text, 'cancelled'::text])))
);


--
-- Name: TABLE reminders; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.reminders IS 'Scheduled reminders for bookings (24h and 2h before appointment)';


--
-- Name: COLUMN reminders.reminder_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reminders.reminder_type IS 'Type of reminder: 24h (24 hours before) or 2h (2 hours before)';


--
-- Name: COLUMN reminders.scheduled_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reminders.scheduled_at IS 'When the reminder should be sent (in UTC)';


--
-- Name: COLUMN reminders.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reminders.status IS 'Reminder status: pending, sending (being processed), sent, failed, cancelled';


--
-- Name: COLUMN reminders.attempts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reminders.attempts IS 'Number of send attempts made (for retry logic)';


--
-- Name: COLUMN reminders.next_attempt_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reminders.next_attempt_at IS 'When to retry if status is failed (backoff timing)';


--
-- Name: COLUMN reminders.last_error; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reminders.last_error IS 'Last error message if status is failed';


--
-- Name: COLUMN reminders.locked_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reminders.locked_at IS 'Timestamp when reminder was locked for processing (prevents concurrent processing)';


--
-- Name: COLUMN reminders.locked_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reminders.locked_by IS 'Identifier of process/function that locked this reminder (e.g., edge function instance ID)';


--
-- Name: salon_closures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salon_closures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    closed_date date NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE salon_closures; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.salon_closures IS 'Holidays and closed days per salon. Prevents bookings on these dates.';


--
-- Name: COLUMN salon_closures.closed_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salon_closures.closed_date IS 'The date the salon is closed';


--
-- Name: COLUMN salon_closures.reason; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salon_closures.reason IS 'Optional reason (e.g. "17. mai", "Christmas", "Staff training")';


--
-- Name: salon_ownerships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salon_ownerships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    salon_id uuid NOT NULL,
    role public.owner_role DEFAULT 'owner'::public.owner_role NOT NULL,
    permissions jsonb DEFAULT '{"canViewReports": true, "canInviteOwners": true, "canManageBilling": true, "canManageBookings": true, "canManageServices": true, "canManageSettings": true, "canManageEmployees": true}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE salon_ownerships; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.salon_ownerships IS 'Links users to salons with role and permissions';


--
-- Name: salons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text,
    is_public boolean DEFAULT true NOT NULL,
    salon_type text DEFAULT 'barber'::text,
    preferred_language text DEFAULT 'nb'::text,
    online_booking_enabled boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT now(),
    whatsapp_number text,
    supported_languages text[] DEFAULT ARRAY['en'::text],
    default_language text DEFAULT 'en'::text,
    theme jsonb DEFAULT '{}'::jsonb,
    plan public.plan_type DEFAULT 'starter'::public.plan_type,
    billing_customer_id text,
    billing_subscription_id text,
    current_period_end timestamp with time zone,
    trial_end timestamp with time zone,
    payment_failure_count integer DEFAULT 0,
    payment_failed_at timestamp with time zone,
    last_payment_retry_at timestamp with time zone,
    payment_status text DEFAULT 'active'::text,
    timezone text DEFAULT 'UTC'::text NOT NULL,
    currency text DEFAULT 'NOK'::text NOT NULL,
    business_address text,
    org_number text,
    cancellation_hours integer DEFAULT 24 NOT NULL,
    default_buffer_minutes integer DEFAULT 0 NOT NULL,
    time_format text DEFAULT '24h'::text,
    theme_pack_id text,
    theme_pack_version integer,
    theme_pack_hash text,
    theme_pack_snapshot jsonb,
    theme_overrides jsonb,
    description text,
    cover_image text,
    instagram_url text,
    website_url text,
    facebook_url text,
    twitter_url text,
    tiktok_url text,
    CONSTRAINT preferred_language_check CHECK (((preferred_language IS NULL) OR (preferred_language = ANY (ARRAY['nb'::text, 'en'::text, 'ar'::text, 'so'::text, 'ti'::text, 'am'::text, 'tr'::text, 'pl'::text, 'vi'::text, 'tl'::text, 'zh'::text, 'fa'::text, 'dar'::text, 'ur'::text, 'hi'::text])))),
    CONSTRAINT salon_type_check CHECK (((salon_type IS NULL) OR (salon_type = ANY (ARRAY['barber'::text, 'nails'::text, 'massage'::text, 'other'::text])))),
    CONSTRAINT salons_currency_iso CHECK ((currency ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT salons_time_format_check CHECK ((time_format = ANY (ARRAY['24h'::text, '12h'::text])))
);


--
-- Name: COLUMN salons.is_public; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.is_public IS 'Whether the public booking page is active for this salon';


--
-- Name: COLUMN salons.salon_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.salon_type IS 'Type of salon: barber, nails, massage, or other';


--
-- Name: COLUMN salons.preferred_language; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.preferred_language IS 'Preferred language for staff interface (matches AppLocale)';


--
-- Name: COLUMN salons.online_booking_enabled; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.online_booking_enabled IS 'Whether online booking is enabled for this salon';


--
-- Name: COLUMN salons.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.updated_at IS 'Timestamp when the salon was last updated';


--
-- Name: COLUMN salons.whatsapp_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.whatsapp_number IS 'WhatsApp contact number for the salon. Should include country code. Displayed on public booking page.';


--
-- Name: COLUMN salons.supported_languages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.supported_languages IS 'Array of supported languages for this salon (matches AppLocale values)';


--
-- Name: COLUMN salons.default_language; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.default_language IS 'Default language for this salon (matches AppLocale)';


--
-- Name: COLUMN salons.theme; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.theme IS 'Custom branding theme for the salon. JSON structure: {
        "primary": "#hex-color",
        "secondary": "#hex-color",
        "font": "font-family-name",
        "logo_url": "https://...",
        "presets": ["preset-name"]
      }';


--
-- Name: COLUMN salons.plan; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.plan IS 'Subscription plan for this salon. Determines feature limits (employees, languages, etc.).';


--
-- Name: COLUMN salons.billing_customer_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.billing_customer_id IS 'Stripe customer ID for this salon. Used to link salon to Stripe customer.';


--
-- Name: COLUMN salons.billing_subscription_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.billing_subscription_id IS 'Stripe subscription ID for this salon. Used to manage subscription lifecycle.';


--
-- Name: COLUMN salons.current_period_end; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.current_period_end IS 'End date of the current billing period. Updated via Stripe webhooks.';


--
-- Name: COLUMN salons.trial_end; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.trial_end IS 'End date of the trial period (if applicable). Null if no trial.';


--
-- Name: COLUMN salons.payment_failure_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.payment_failure_count IS 'Number of consecutive payment failures. Reset to 0 when payment succeeds.';


--
-- Name: COLUMN salons.payment_failed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.payment_failed_at IS 'Timestamp of the first payment failure. Used to calculate grace period.';


--
-- Name: COLUMN salons.last_payment_retry_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.last_payment_retry_at IS 'Timestamp of the last payment retry attempt.';


--
-- Name: COLUMN salons.payment_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.payment_status IS 'Payment status: active, failed, grace_period, restricted';


--
-- Name: COLUMN salons.timezone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.timezone IS 'IANA timezone identifier (e.g., "Europe/Oslo", "America/New_York"). All times displayed in the salon will use this timezone.';


--
-- Name: COLUMN salons.theme_pack_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.theme_pack_id IS 'Selected theme pack id (metadata only with snapshot strategy).';


--
-- Name: COLUMN salons.theme_pack_version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.theme_pack_version IS 'Theme pack version at time of selection (metadata).';


--
-- Name: COLUMN salons.theme_pack_hash; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.theme_pack_hash IS 'Deterministic hash of persisted snapshot tokens for introspection.';


--
-- Name: COLUMN salons.theme_pack_snapshot; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.theme_pack_snapshot IS 'Theme pack snapshot used as runtime source-of-truth.';


--
-- Name: COLUMN salons.theme_overrides; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.theme_overrides IS 'Validated and plan-gated override object.';


--
-- Name: COLUMN salons.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.description IS 'Public description shown on salon profile page.';


--
-- Name: COLUMN salons.cover_image; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.cover_image IS 'Public hero cover image URL for salon profile page.';


--
-- Name: COLUMN salons.instagram_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.instagram_url IS 'Public Instagram URL for salon profile page.';


--
-- Name: COLUMN salons.website_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.website_url IS 'Public website URL for salon profile page.';


--
-- Name: COLUMN salons.facebook_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.facebook_url IS 'Public Facebook URL for salon profile page.';


--
-- Name: COLUMN salons.twitter_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.twitter_url IS 'Public X/Twitter URL for salon profile page.';


--
-- Name: COLUMN salons.tiktok_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.tiktok_url IS 'Public TikTok URL for salon profile page.';


--
-- Name: security_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.security_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    salon_id uuid,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id text,
    metadata jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    correlation_id uuid,
    before_state jsonb,
    after_state jsonb
);


--
-- Name: TABLE security_audit_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.security_audit_log IS 'Security audit log for compliance and security monitoring. Immutable log of all sensitive operations.';


--
-- Name: COLUMN security_audit_log.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.security_audit_log.user_id IS 'User who performed the action (NULL for system actions)';


--
-- Name: COLUMN security_audit_log.salon_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.security_audit_log.salon_id IS 'Salon context for the action (NULL for global actions)';


--
-- Name: COLUMN security_audit_log.action; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.security_audit_log.action IS 'Action performed (e.g., login_failed, plan_changed, user_deleted)';


--
-- Name: COLUMN security_audit_log.resource_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.security_audit_log.resource_type IS 'Type of resource affected (e.g., auth, billing, admin, booking)';


--
-- Name: COLUMN security_audit_log.resource_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.security_audit_log.resource_id IS 'ID of the specific resource affected (e.g., booking_id, subscription_id)';


--
-- Name: COLUMN security_audit_log.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.security_audit_log.metadata IS 'Additional context data as JSON (e.g., {email: "user@example.com", reason: "Invalid password"})';


--
-- Name: COLUMN security_audit_log.ip_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.security_audit_log.ip_address IS 'IP address of the request';


--
-- Name: COLUMN security_audit_log.user_agent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.security_audit_log.user_agent IS 'User agent string from the request';


--
-- Name: COLUMN security_audit_log.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.security_audit_log.created_at IS 'Timestamp when the action occurred (immutable)';


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    name text NOT NULL,
    duration_minutes integer NOT NULL,
    price_cents integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    category text,
    sort_order integer DEFAULT 0,
    prep_minutes integer DEFAULT 0 NOT NULL,
    cleanup_minutes integer DEFAULT 0 NOT NULL,
    import_batch_id uuid,
    CONSTRAINT services_category_check CHECK (((category IS NULL) OR (category = ANY (ARRAY['cut'::text, 'beard'::text, 'color'::text, 'nails'::text, 'massage'::text, 'other'::text]))))
);


--
-- Name: COLUMN services.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.services.category IS 'Service category: cut, beard, color, nails, massage, or other';


--
-- Name: COLUMN services.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.services.sort_order IS 'Display order for services (lower numbers appear first)';


--
-- Name: COLUMN services.prep_minutes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.services.prep_minutes IS 'Setup/preparation time before service starts (blocks calendar, minutes)';


--
-- Name: COLUMN services.cleanup_minutes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.services.cleanup_minutes IS 'Cleanup time after service ends (blocks calendar, minutes)';


--
-- Name: shift_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_overrides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    override_date date NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    source text DEFAULT 'manual'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT shift_overrides_valid_times CHECK ((((start_time IS NULL) AND (end_time IS NULL)) OR ((start_time IS NOT NULL) AND (end_time IS NOT NULL) AND (end_time > start_time))))
);


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shifts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    weekday integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: stripe_webhook_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stripe_webhook_events (
    id bigint NOT NULL,
    event_id text NOT NULL,
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    processing_status text DEFAULT 'processing'::text NOT NULL,
    error_message text,
    received_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    CONSTRAINT stripe_webhook_events_processing_status_check CHECK ((processing_status = ANY (ARRAY['processing'::text, 'processed'::text, 'failed'::text])))
);


--
-- Name: stripe_webhook_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.stripe_webhook_events ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.stripe_webhook_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: support_case_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_case_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    case_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    body text NOT NULL,
    is_internal boolean DEFAULT false NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE support_case_messages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.support_case_messages IS 'Threaded messages on support cases. is_internal=true means admin-only notes.';


--
-- Name: template_shares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.template_shares (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    shared_with_salon_id uuid NOT NULL,
    shared_by uuid NOT NULL,
    can_edit boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE template_shares; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.template_shares IS 'Tracks which templates are shared with which salons';


--
-- Name: templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    type public.template_type NOT NULL,
    visibility public.template_visibility DEFAULT 'private'::public.template_visibility NOT NULL,
    data jsonb NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE templates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.templates IS 'Stores reusable templates for staff, services, and schedules';


--
-- Name: COLUMN templates.data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.templates.data IS 'JSON structure varies by type: staff has roles[], service has services[], shift_schedule has shifts[]';


--
-- Name: time_blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_blocks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    employee_id uuid,
    title text NOT NULL,
    block_type text DEFAULT 'other'::text NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    is_all_day boolean DEFAULT false NOT NULL,
    recurrence_rule text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT time_blocks_check CHECK (((end_time > start_time) OR is_all_day))
);


--
-- Name: TABLE time_blocks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.time_blocks IS 'Blocked time slots: meetings, vacation, training, private, etc. Per salon or per employee.';


--
-- Name: COLUMN time_blocks.employee_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.time_blocks.employee_id IS 'NULL means the block applies to the entire salon';


--
-- Name: COLUMN time_blocks.block_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.time_blocks.block_type IS 'meeting, vacation, training, private, lunch, other';


--
-- Name: COLUMN time_blocks.is_all_day; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.time_blocks.is_all_day IS 'If true, blocks the entire day regardless of start/end times';


--
-- Name: COLUMN time_blocks.recurrence_rule; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.time_blocks.recurrence_rule IS 'NULL = one-off event. Pro/Business plans can use WEEKLY:0,1,2 etc.';


--
-- Name: waitlist_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waitlist_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    customer_id uuid,
    customer_name text NOT NULL,
    customer_email text,
    customer_phone text,
    service_id uuid NOT NULL,
    employee_id uuid,
    preferred_date date NOT NULL,
    preferred_time_start time without time zone,
    preferred_time_end time without time zone,
    status text DEFAULT 'waiting'::text NOT NULL,
    notified_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    preference_mode text DEFAULT 'specific_time'::text NOT NULL,
    flex_window_minutes integer DEFAULT 0 NOT NULL,
    priority_score_snapshot integer,
    cooldown_until timestamp with time zone,
    cooldown_reason text,
    decline_count integer DEFAULT 0 NOT NULL,
    booking_id uuid,
    priority_override_score integer,
    priority_override_reason text,
    priority_overridden_by uuid,
    priority_overridden_at timestamp with time zone,
    CONSTRAINT waitlist_entries_flex_window_minutes_check CHECK (((flex_window_minutes >= 0) AND (flex_window_minutes <= 2880))),
    CONSTRAINT waitlist_entries_preference_mode_check CHECK ((preference_mode = ANY (ARRAY['specific_time'::text, 'day_flexible'::text]))),
    CONSTRAINT waitlist_entries_status_check CHECK ((status = ANY (ARRAY['waiting'::text, 'notified'::text, 'booked'::text, 'expired'::text, 'cancelled'::text, 'cooldown'::text])))
);


--
-- Name: waitlist_lifecycle_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waitlist_lifecycle_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    waitlist_entry_id uuid NOT NULL,
    salon_id uuid NOT NULL,
    from_status text NOT NULL,
    to_status text NOT NULL,
    reason text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: waitlist_offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waitlist_offers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    waitlist_entry_id uuid NOT NULL,
    service_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    slot_date date NOT NULL,
    slot_start timestamp with time zone NOT NULL,
    slot_end timestamp with time zone,
    token_hash text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    attempt_no integer DEFAULT 1 NOT NULL,
    reminder_sent_at timestamp with time zone,
    responded_at timestamp with time zone,
    token_expires_at timestamp with time zone NOT NULL,
    booking_id uuid,
    response_channel text,
    last_error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT waitlist_offers_channel_check CHECK (((response_channel IS NULL) OR (response_channel = ANY (ARRAY['sms_link'::text, 'email_link'::text, 'dashboard'::text, 'system'::text])))),
    CONSTRAINT waitlist_offers_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'expired'::text, 'cancelled'::text, 'notification_failed'::text])))
);


--
-- Name: waitlist_policies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waitlist_policies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid,
    service_id uuid,
    claim_expiry_minutes integer DEFAULT 15 NOT NULL,
    reminder_after_minutes integer DEFAULT 10 NOT NULL,
    cooldown_minutes integer DEFAULT 60 NOT NULL,
    passive_decline_threshold integer DEFAULT 3 NOT NULL,
    passive_cooldown_minutes integer DEFAULT 10080 NOT NULL,
    auto_notify_on_reactivation boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT waitlist_policies_claim_expiry_minutes_check CHECK (((claim_expiry_minutes >= 5) AND (claim_expiry_minutes <= 180))),
    CONSTRAINT waitlist_policies_cooldown_minutes_check CHECK (((cooldown_minutes >= 5) AND (cooldown_minutes <= 10080))),
    CONSTRAINT waitlist_policies_passive_cooldown_minutes_check CHECK (((passive_cooldown_minutes >= 30) AND (passive_cooldown_minutes <= 43200))),
    CONSTRAINT waitlist_policies_passive_decline_threshold_check CHECK (((passive_decline_threshold >= 1) AND (passive_decline_threshold <= 20))),
    CONSTRAINT waitlist_policies_reminder_after_minutes_check CHECK (((reminder_after_minutes >= 1) AND (reminder_after_minutes <= 120))),
    CONSTRAINT waitlist_policies_scope_check CHECK ((((salon_id IS NULL) AND (service_id IS NULL)) OR ((salon_id IS NOT NULL) AND (service_id IS NULL)) OR ((salon_id IS NOT NULL) AND (service_id IS NOT NULL))))
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: messages_2026_03_12; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_03_12 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2026_03_13; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_03_13 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2026_03_14; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_03_14 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2026_03_15; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_03_15 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2026_03_16; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_03_16 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2026_03_17; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_03_17 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2026_03_18; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_03_18 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages_2026_03_12; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_03_12 FOR VALUES FROM ('2026-03-12 00:00:00') TO ('2026-03-13 00:00:00');


--
-- Name: messages_2026_03_13; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_03_13 FOR VALUES FROM ('2026-03-13 00:00:00') TO ('2026-03-14 00:00:00');


--
-- Name: messages_2026_03_14; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_03_14 FOR VALUES FROM ('2026-03-14 00:00:00') TO ('2026-03-15 00:00:00');


--
-- Name: messages_2026_03_15; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_03_15 FOR VALUES FROM ('2026-03-15 00:00:00') TO ('2026-03-16 00:00:00');


--
-- Name: messages_2026_03_16; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_03_16 FOR VALUES FROM ('2026-03-16 00:00:00') TO ('2026-03-17 00:00:00');


--
-- Name: messages_2026_03_17; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_03_17 FOR VALUES FROM ('2026-03-17 00:00:00') TO ('2026-03-18 00:00:00');


--
-- Name: messages_2026_03_18; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_03_18 FOR VALUES FROM ('2026-03-18 00:00:00') TO ('2026-03-19 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: addons addons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addons
    ADD CONSTRAINT addons_pkey PRIMARY KEY (id);


--
-- Name: addons addons_salon_id_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addons
    ADD CONSTRAINT addons_salon_id_type_key UNIQUE (salon_id, type);


--
-- Name: admin_notes admin_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_notes
    ADD CONSTRAINT admin_notes_pkey PRIMARY KEY (id);


--
-- Name: booking_products booking_products_booking_product_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_products
    ADD CONSTRAINT booking_products_booking_product_unique UNIQUE (booking_id, product_id);


--
-- Name: booking_products booking_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_products
    ADD CONSTRAINT booking_products_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_no_overlapping_active_slots; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_no_overlapping_active_slots EXCLUDE USING gist (salon_id WITH =, employee_id WITH =, tstzrange(start_time, end_time, '[)'::text) WITH &&) WHERE ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'scheduled'::text])));


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: calendar_connections calendar_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_connections
    ADD CONSTRAINT calendar_connections_pkey PRIMARY KEY (id);


--
-- Name: calendar_connections calendar_connections_user_id_salon_id_provider_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_connections
    ADD CONSTRAINT calendar_connections_user_id_salon_id_provider_key UNIQUE (user_id, salon_id, provider);


--
-- Name: calendar_event_mappings calendar_event_mappings_booking_id_connection_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_event_mappings
    ADD CONSTRAINT calendar_event_mappings_booking_id_connection_id_key UNIQUE (booking_id, connection_id);


--
-- Name: calendar_event_mappings calendar_event_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_event_mappings
    ADD CONSTRAINT calendar_event_mappings_pkey PRIMARY KEY (id);


--
-- Name: changelog_entries changelog_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.changelog_entries
    ADD CONSTRAINT changelog_entries_pkey PRIMARY KEY (id);


--
-- Name: commission_rules commission_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_rules
    ADD CONSTRAINT commission_rules_pkey PRIMARY KEY (id);


--
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- Name: customer_packages customer_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_packages
    ADD CONSTRAINT customer_packages_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: customers customers_salon_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_salon_email_unique UNIQUE (salon_id, email);


--
-- Name: data_requests data_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_requests
    ADD CONSTRAINT data_requests_pkey PRIMARY KEY (id);


--
-- Name: email_log email_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_log
    ADD CONSTRAINT email_log_pkey PRIMARY KEY (id);


--
-- Name: employee_services employee_services_employee_id_service_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_services
    ADD CONSTRAINT employee_services_employee_id_service_id_key UNIQUE (employee_id, service_id);


--
-- Name: employee_services employee_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_services
    ADD CONSTRAINT employee_services_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: feature_flags feature_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_pkey PRIMARY KEY (id);


--
-- Name: feature_flags feature_flags_salon_id_flag_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_salon_id_flag_key_key UNIQUE (salon_id, flag_key);


--
-- Name: features features_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.features
    ADD CONSTRAINT features_key_key UNIQUE (key);


--
-- Name: features features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.features
    ADD CONSTRAINT features_pkey PRIMARY KEY (id);


--
-- Name: feedback_comments feedback_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_comments
    ADD CONSTRAINT feedback_comments_pkey PRIMARY KEY (id);


--
-- Name: feedback_entries feedback_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_entries
    ADD CONSTRAINT feedback_entries_pkey PRIMARY KEY (id);


--
-- Name: gift_cards gift_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_cards
    ADD CONSTRAINT gift_cards_pkey PRIMARY KEY (id);


--
-- Name: gift_cards gift_cards_salon_id_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_cards
    ADD CONSTRAINT gift_cards_salon_id_code_key UNIQUE (salon_id, code);


--
-- Name: import_batches import_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.import_batches
    ADD CONSTRAINT import_batches_pkey PRIMARY KEY (id);


--
-- Name: incidents incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_pkey PRIMARY KEY (id);


--
-- Name: no_show_policies no_show_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.no_show_policies
    ADD CONSTRAINT no_show_policies_pkey PRIMARY KEY (id);


--
-- Name: no_show_policies no_show_policies_salon_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.no_show_policies
    ADD CONSTRAINT no_show_policies_salon_id_key UNIQUE (salon_id);


--
-- Name: notification_attempts notification_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_attempts
    ADD CONSTRAINT notification_attempts_pkey PRIMARY KEY (id);


--
-- Name: notification_events notification_events_booking_type_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_events
    ADD CONSTRAINT notification_events_booking_type_unique UNIQUE (booking_id, event_type);


--
-- Name: CONSTRAINT notification_events_booking_type_unique ON notification_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT notification_events_booking_type_unique ON public.notification_events IS 'Ensures idempotency: only one event per booking per type';


--
-- Name: notification_events notification_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_events
    ADD CONSTRAINT notification_events_pkey PRIMARY KEY (id);


--
-- Name: notification_jobs notification_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_jobs
    ADD CONSTRAINT notification_jobs_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (user_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: opening_hours_breaks opening_hours_breaks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opening_hours_breaks
    ADD CONSTRAINT opening_hours_breaks_pkey PRIMARY KEY (id);


--
-- Name: opening_hours opening_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opening_hours
    ADD CONSTRAINT opening_hours_pkey PRIMARY KEY (id);


--
-- Name: opening_hours opening_hours_salon_id_day_of_week_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opening_hours
    ADD CONSTRAINT opening_hours_salon_id_day_of_week_key UNIQUE (salon_id, day_of_week);


--
-- Name: owner_invitations owner_invitations_email_salon_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_invitations
    ADD CONSTRAINT owner_invitations_email_salon_unique UNIQUE (email, salon_id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: owner_invitations owner_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_invitations
    ADD CONSTRAINT owner_invitations_pkey PRIMARY KEY (id);


--
-- Name: packages packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_pkey PRIMARY KEY (id);


--
-- Name: personalliste_entries personalliste_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personalliste_entries
    ADD CONSTRAINT personalliste_entries_pkey PRIMARY KEY (id);


--
-- Name: plan_features plan_features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_features
    ADD CONSTRAINT plan_features_pkey PRIMARY KEY (id);


--
-- Name: plan_features plan_features_plan_type_feature_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_features
    ADD CONSTRAINT plan_features_plan_type_feature_id_key UNIQUE (plan_type, feature_id);


--
-- Name: portfolio portfolio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio
    ADD CONSTRAINT portfolio_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (user_id);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_user_endpoint_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_endpoint_unique UNIQUE (user_id, endpoint);


--
-- Name: rate_limit_entries rate_limit_entries_identifier_identifier_type_endpoint_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limit_entries
    ADD CONSTRAINT rate_limit_entries_identifier_identifier_type_endpoint_type_key UNIQUE (identifier, identifier_type, endpoint_type);


--
-- Name: rate_limit_entries rate_limit_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limit_entries
    ADD CONSTRAINT rate_limit_entries_pkey PRIMARY KEY (id);


--
-- Name: reminders reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: salon_closures salon_closures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_closures
    ADD CONSTRAINT salon_closures_pkey PRIMARY KEY (id);


--
-- Name: salon_closures salon_closures_salon_id_closed_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_closures
    ADD CONSTRAINT salon_closures_salon_id_closed_date_key UNIQUE (salon_id, closed_date);


--
-- Name: salon_ownerships salon_ownerships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_ownerships
    ADD CONSTRAINT salon_ownerships_pkey PRIMARY KEY (id);


--
-- Name: salon_ownerships salon_ownerships_user_salon_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_ownerships
    ADD CONSTRAINT salon_ownerships_user_salon_unique UNIQUE (user_id, salon_id);


--
-- Name: salons salons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_pkey PRIMARY KEY (id);


--
-- Name: salons salons_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_slug_unique UNIQUE (slug);


--
-- Name: security_audit_log security_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_audit_log
    ADD CONSTRAINT security_audit_log_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: shift_overrides shift_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_overrides
    ADD CONSTRAINT shift_overrides_pkey PRIMARY KEY (id);


--
-- Name: shift_overrides shift_overrides_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_overrides
    ADD CONSTRAINT shift_overrides_unique UNIQUE (salon_id, employee_id, override_date, start_time);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: sms_log sms_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_log
    ADD CONSTRAINT sms_log_pkey PRIMARY KEY (id);


--
-- Name: sms_log sms_log_salon_idempotency_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_log
    ADD CONSTRAINT sms_log_salon_idempotency_unique UNIQUE (salon_id, idempotency_key);


--
-- Name: sms_usage sms_usage_period_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_usage
    ADD CONSTRAINT sms_usage_period_unique UNIQUE (salon_id, period_start, period_end);


--
-- Name: sms_usage sms_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_usage
    ADD CONSTRAINT sms_usage_pkey PRIMARY KEY (id);


--
-- Name: stripe_webhook_events stripe_webhook_events_event_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stripe_webhook_events
    ADD CONSTRAINT stripe_webhook_events_event_id_key UNIQUE (event_id);


--
-- Name: stripe_webhook_events stripe_webhook_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stripe_webhook_events
    ADD CONSTRAINT stripe_webhook_events_pkey PRIMARY KEY (id);


--
-- Name: support_case_messages support_case_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_case_messages
    ADD CONSTRAINT support_case_messages_pkey PRIMARY KEY (id);


--
-- Name: support_cases support_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_cases
    ADD CONSTRAINT support_cases_pkey PRIMARY KEY (id);


--
-- Name: template_shares template_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_shares
    ADD CONSTRAINT template_shares_pkey PRIMARY KEY (id);


--
-- Name: template_shares template_shares_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_shares
    ADD CONSTRAINT template_shares_unique UNIQUE (template_id, shared_with_salon_id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: time_blocks time_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_blocks
    ADD CONSTRAINT time_blocks_pkey PRIMARY KEY (id);


--
-- Name: waitlist_entries waitlist_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_entries
    ADD CONSTRAINT waitlist_entries_pkey PRIMARY KEY (id);


--
-- Name: waitlist_lifecycle_events waitlist_lifecycle_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_lifecycle_events
    ADD CONSTRAINT waitlist_lifecycle_events_pkey PRIMARY KEY (id);


--
-- Name: waitlist_offers waitlist_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_offers
    ADD CONSTRAINT waitlist_offers_pkey PRIMARY KEY (id);


--
-- Name: waitlist_offers waitlist_offers_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_offers
    ADD CONSTRAINT waitlist_offers_token_hash_key UNIQUE (token_hash);


--
-- Name: waitlist_policies waitlist_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_policies
    ADD CONSTRAINT waitlist_policies_pkey PRIMARY KEY (id);


--
-- Name: waitlist_policies waitlist_policies_salon_id_service_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_policies
    ADD CONSTRAINT waitlist_policies_salon_id_service_id_key UNIQUE (salon_id, service_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_03_12 messages_2026_03_12_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_03_12
    ADD CONSTRAINT messages_2026_03_12_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_03_13 messages_2026_03_13_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_03_13
    ADD CONSTRAINT messages_2026_03_13_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_03_14 messages_2026_03_14_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_03_14
    ADD CONSTRAINT messages_2026_03_14_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_03_15 messages_2026_03_15_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_03_15
    ADD CONSTRAINT messages_2026_03_15_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_03_16 messages_2026_03_16_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_03_16
    ADD CONSTRAINT messages_2026_03_16_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_03_17 messages_2026_03_17_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_03_17
    ADD CONSTRAINT messages_2026_03_17_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_03_18 messages_2026_03_18_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_03_18
    ADD CONSTRAINT messages_2026_03_18_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_addons_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_addons_salon_id ON public.addons USING btree (salon_id);


--
-- Name: idx_admin_notes_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_notes_author ON public.admin_notes USING btree (author_id);


--
-- Name: idx_admin_notes_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_notes_created_at ON public.admin_notes USING btree (created_at);


--
-- Name: idx_admin_notes_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_notes_entity ON public.admin_notes USING btree (entity_type, entity_id);


--
-- Name: idx_admin_notes_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_notes_tags ON public.admin_notes USING gin (tags);


--
-- Name: idx_audit_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_action ON public.security_audit_log USING btree (action);


--
-- Name: idx_audit_correlation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_correlation ON public.security_audit_log USING btree (correlation_id) WHERE (correlation_id IS NOT NULL);


--
-- Name: idx_audit_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_resource ON public.security_audit_log USING btree (resource_type);


--
-- Name: idx_booking_products_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_products_booking_id ON public.booking_products USING btree (booking_id);


--
-- Name: idx_booking_products_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_products_product_id ON public.booking_products USING btree (product_id);


--
-- Name: idx_bookings_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_customer_id ON public.bookings USING btree (customer_id);


--
-- Name: idx_bookings_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_employee_id ON public.bookings USING btree (employee_id);


--
-- Name: idx_bookings_import_batch; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_import_batch ON public.bookings USING btree (import_batch_id) WHERE (import_batch_id IS NOT NULL);


--
-- Name: idx_bookings_is_imported; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_is_imported ON public.bookings USING btree (salon_id, is_imported) WHERE (is_imported = true);


--
-- Name: idx_bookings_salon_date_range; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_salon_date_range ON public.bookings USING btree (salon_id, start_time, end_time);


--
-- Name: idx_bookings_salon_employee_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_salon_employee_start ON public.bookings USING btree (salon_id, employee_id, start_time) WHERE (employee_id IS NOT NULL);


--
-- Name: idx_bookings_salon_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_salon_start_time ON public.bookings USING btree (salon_id, start_time);


--
-- Name: idx_bookings_salon_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_salon_status ON public.bookings USING btree (salon_id, status);


--
-- Name: idx_bookings_upcoming; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_upcoming ON public.bookings USING btree (salon_id, start_time) WHERE (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'scheduled'::text]));


--
-- Name: idx_calendar_connections_enabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_connections_enabled ON public.calendar_connections USING btree (sync_enabled) WHERE (sync_enabled = true);


--
-- Name: idx_calendar_connections_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_connections_provider ON public.calendar_connections USING btree (provider);


--
-- Name: idx_calendar_connections_salon; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_connections_salon ON public.calendar_connections USING btree (salon_id);


--
-- Name: idx_calendar_connections_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_connections_user ON public.calendar_connections USING btree (user_id);


--
-- Name: idx_calendar_event_mappings_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_event_mappings_booking ON public.calendar_event_mappings USING btree (booking_id);


--
-- Name: idx_calendar_event_mappings_connection; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_event_mappings_connection ON public.calendar_event_mappings USING btree (connection_id);


--
-- Name: idx_calendar_event_mappings_external; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_event_mappings_external ON public.calendar_event_mappings USING btree (external_event_id);


--
-- Name: idx_commission_rules_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_commission_rules_employee_id ON public.commission_rules USING btree (salon_id, employee_id);


--
-- Name: idx_commission_rules_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_commission_rules_salon_id ON public.commission_rules USING btree (salon_id);


--
-- Name: idx_contact_submissions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions USING btree (created_at DESC);


--
-- Name: idx_customer_packages_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_packages_customer_id ON public.customer_packages USING btree (customer_id);


--
-- Name: idx_customer_packages_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_packages_salon_id ON public.customer_packages USING btree (salon_id);


--
-- Name: idx_customers_blocked; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_blocked ON public.customers USING btree (salon_id, is_blocked) WHERE (is_blocked = true);


--
-- Name: idx_customers_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_email ON public.customers USING btree (salon_id, email) WHERE (email IS NOT NULL);


--
-- Name: idx_customers_full_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_full_name_trgm ON public.customers USING gin (full_name public.gin_trgm_ops);


--
-- Name: idx_customers_import_batch; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_import_batch ON public.customers USING btree (import_batch_id) WHERE (import_batch_id IS NOT NULL);


--
-- Name: idx_customers_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_phone ON public.customers USING btree (salon_id, phone) WHERE (phone IS NOT NULL);


--
-- Name: idx_customers_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_salon_id ON public.customers USING btree (salon_id);


--
-- Name: idx_data_requests_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_data_requests_entity ON public.data_requests USING btree (entity_type, entity_id);


--
-- Name: idx_data_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_data_requests_status ON public.data_requests USING btree (status);


--
-- Name: idx_email_log_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_log_created ON public.email_log USING btree (created_at DESC);


--
-- Name: idx_email_log_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_log_created_at ON public.email_log USING btree (created_at DESC);


--
-- Name: idx_email_log_email_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_log_email_type ON public.email_log USING btree (email_type);


--
-- Name: idx_email_log_recipient_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_log_recipient_email ON public.email_log USING btree (recipient_email);


--
-- Name: idx_email_log_salon_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_log_salon_created ON public.email_log USING btree (salon_id, created_at DESC) WHERE (salon_id IS NOT NULL);


--
-- Name: idx_email_log_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_log_salon_id ON public.email_log USING btree (salon_id);


--
-- Name: idx_email_log_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_log_status ON public.email_log USING btree (status);


--
-- Name: idx_employee_services_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_services_employee ON public.employee_services USING btree (employee_id, service_id);


--
-- Name: idx_employee_services_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_services_salon_id ON public.employee_services USING btree (salon_id);


--
-- Name: idx_employee_services_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_services_service ON public.employee_services USING btree (service_id, employee_id);


--
-- Name: idx_employees_public_profile_visible; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_public_profile_visible ON public.employees USING btree (salon_id, public_profile_visible) WHERE (deleted_at IS NULL);


--
-- Name: idx_employees_salon_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_salon_active ON public.employees USING btree (salon_id, is_active) WHERE (is_active = true);


--
-- Name: idx_employees_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_salon_id ON public.employees USING btree (salon_id);


--
-- Name: idx_employees_salon_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_salon_role ON public.employees USING btree (salon_id, role);


--
-- Name: idx_fc_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fc_author ON public.feedback_comments USING btree (author_user_id);


--
-- Name: idx_fc_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fc_created ON public.feedback_comments USING btree (feedback_id, created_at);


--
-- Name: idx_fc_feedback_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fc_feedback_id ON public.feedback_comments USING btree (feedback_id);


--
-- Name: idx_feature_flags_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feature_flags_key ON public.feature_flags USING btree (flag_key);


--
-- Name: idx_feature_flags_salon; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feature_flags_salon ON public.feature_flags USING btree (salon_id);


--
-- Name: idx_features_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_features_key ON public.features USING btree (key);


--
-- Name: idx_feedback_admin_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedback_admin_owner ON public.feedback_entries USING btree (admin_owner_id);


--
-- Name: idx_feedback_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedback_priority ON public.feedback_entries USING btree (priority);


--
-- Name: idx_feedback_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedback_salon_id ON public.feedback_entries USING btree (salon_id);


--
-- Name: idx_feedback_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedback_status ON public.feedback_entries USING btree (status);


--
-- Name: idx_feedback_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedback_user_id ON public.feedback_entries USING btree (user_id);


--
-- Name: idx_feedback_votes; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedback_votes ON public.feedback_entries USING btree (votes DESC);


--
-- Name: idx_gift_cards_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gift_cards_code ON public.gift_cards USING btree (salon_id, code);


--
-- Name: idx_gift_cards_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gift_cards_salon_id ON public.gift_cards USING btree (salon_id);


--
-- Name: idx_import_batches_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_import_batches_salon_id ON public.import_batches USING btree (salon_id);


--
-- Name: idx_incidents_started; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_started ON public.incidents USING btree (started_at DESC);


--
-- Name: idx_incidents_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_status ON public.incidents USING btree (status);


--
-- Name: idx_no_show_policies_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_no_show_policies_salon_id ON public.no_show_policies USING btree (salon_id);


--
-- Name: idx_notification_attempts_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_attempts_job ON public.notification_attempts USING btree (notification_job_id, attempt_no DESC);


--
-- Name: idx_notification_events_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_events_booking_id ON public.notification_events USING btree (booking_id);


--
-- Name: idx_notification_events_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_events_created ON public.notification_events USING btree (created_at DESC);


--
-- Name: idx_notification_events_dead_letter; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_events_dead_letter ON public.notification_events USING btree (created_at DESC) WHERE (status = 'dead_letter'::text);


--
-- Name: idx_notification_events_next_retry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_events_next_retry ON public.notification_events USING btree (next_retry_at) WHERE (status = ANY (ARRAY['pending'::text, 'failed'::text]));


--
-- Name: idx_notification_events_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_events_status ON public.notification_events USING btree (status) WHERE (status = ANY (ARRAY['pending'::text, 'processing'::text]));


--
-- Name: idx_notification_jobs_booking_event; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_notification_jobs_booking_event ON public.notification_jobs USING btree (booking_id, event_type);


--
-- Name: idx_notification_jobs_delivery_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_jobs_delivery_status ON public.notification_jobs USING btree (delivery_status);


--
-- Name: idx_notification_jobs_next_retry_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_jobs_next_retry_at ON public.notification_jobs USING btree (next_retry_at) WHERE (delivery_status = ANY (ARRAY['queued'::text, 'failed'::text]));


--
-- Name: idx_notifications_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_salon_id ON public.notifications USING btree (salon_id) WHERE (salon_id IS NOT NULL);


--
-- Name: idx_notifications_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_created ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, read) WHERE (read = false);


--
-- Name: idx_ohb_salon_day; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ohb_salon_day ON public.opening_hours_breaks USING btree (salon_id, day_of_week);


--
-- Name: idx_ohb_salon_emp_day; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ohb_salon_emp_day ON public.opening_hours_breaks USING btree (salon_id, employee_id, day_of_week);


--
-- Name: idx_opening_hours_salon_day; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_opening_hours_salon_day ON public.opening_hours USING btree (salon_id, day_of_week);


--
-- Name: idx_opening_hours_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_opening_hours_salon_id ON public.opening_hours USING btree (salon_id);


--
-- Name: idx_owner_invitations_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_owner_invitations_email ON public.owner_invitations USING btree (email);


--
-- Name: idx_owner_invitations_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_owner_invitations_salon_id ON public.owner_invitations USING btree (salon_id);


--
-- Name: idx_packages_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_packages_salon_id ON public.packages USING btree (salon_id);


--
-- Name: idx_personalliste_entries_salon_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personalliste_entries_salon_date ON public.personalliste_entries USING btree (salon_id, date);


--
-- Name: idx_personalliste_entries_salon_employee_date; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_personalliste_entries_salon_employee_date ON public.personalliste_entries USING btree (salon_id, employee_id, date);


--
-- Name: idx_personalliste_entries_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personalliste_entries_salon_id ON public.personalliste_entries USING btree (salon_id);


--
-- Name: idx_plan_features_feature_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plan_features_feature_id ON public.plan_features USING btree (feature_id);


--
-- Name: idx_plan_features_plan_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plan_features_plan_type ON public.plan_features USING btree (plan_type);


--
-- Name: idx_portfolio_salon_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolio_salon_published ON public.portfolio USING btree (salon_id, is_published, is_featured, sort_order, created_at DESC) WHERE (deleted_at IS NULL);


--
-- Name: idx_products_salon_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_salon_active ON public.products USING btree (salon_id, is_active) WHERE (is_active = true);


--
-- Name: idx_products_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_salon_id ON public.products USING btree (salon_id);


--
-- Name: idx_profiles_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_salon_id ON public.profiles USING btree (salon_id) WHERE (salon_id IS NOT NULL);


--
-- Name: idx_profiles_superadmin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_superadmin ON public.profiles USING btree (user_id) WHERE (is_superadmin = true);


--
-- Name: idx_profiles_user_preferences; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_user_preferences ON public.profiles USING gin (user_preferences);


--
-- Name: idx_push_subscriptions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions USING btree (user_id);


--
-- Name: idx_rate_limit_blocked_until; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_limit_blocked_until ON public.rate_limit_entries USING btree (blocked_until) WHERE (blocked_until IS NOT NULL);


--
-- Name: idx_rate_limit_identifier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_limit_identifier ON public.rate_limit_entries USING btree (identifier, identifier_type, endpoint_type);


--
-- Name: idx_rate_limit_window_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_limit_window_start ON public.rate_limit_entries USING btree (window_start);


--
-- Name: idx_reminders_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reminders_booking_id ON public.reminders USING btree (booking_id);


--
-- Name: idx_reminders_booking_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reminders_booking_type ON public.reminders USING btree (booking_id, reminder_type);


--
-- Name: idx_reminders_pending_unlocked; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reminders_pending_unlocked ON public.reminders USING btree (status, scheduled_at) WHERE ((status = 'pending'::text) AND (locked_at IS NULL));


--
-- Name: idx_reminders_scheduled_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reminders_scheduled_at ON public.reminders USING btree (scheduled_at);


--
-- Name: idx_reminders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reminders_status ON public.reminders USING btree (status);


--
-- Name: idx_reminders_status_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reminders_status_scheduled ON public.reminders USING btree (status, scheduled_at) WHERE (status = 'pending'::text);


--
-- Name: idx_reviews_salon_approved_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_salon_approved_created ON public.reviews USING btree (salon_id, is_approved, created_at DESC) WHERE (deleted_at IS NULL);


--
-- Name: idx_salon_closures_salon_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salon_closures_salon_date ON public.salon_closures USING btree (salon_id, closed_date);


--
-- Name: idx_salon_ownerships_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salon_ownerships_salon_id ON public.salon_ownerships USING btree (salon_id);


--
-- Name: idx_salon_ownerships_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salon_ownerships_user_id ON public.salon_ownerships USING btree (user_id);


--
-- Name: idx_salons_billing_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salons_billing_customer_id ON public.salons USING btree (billing_customer_id) WHERE (billing_customer_id IS NOT NULL);


--
-- Name: idx_salons_billing_subscription_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salons_billing_subscription_id ON public.salons USING btree (billing_subscription_id) WHERE (billing_subscription_id IS NOT NULL);


--
-- Name: idx_salons_current_period_end; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salons_current_period_end ON public.salons USING btree (current_period_end) WHERE (current_period_end IS NOT NULL);


--
-- Name: idx_salons_payment_failed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salons_payment_failed_at ON public.salons USING btree (payment_failed_at) WHERE (payment_failed_at IS NOT NULL);


--
-- Name: idx_salons_payment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salons_payment_status ON public.salons USING btree (payment_status) WHERE (payment_status <> 'active'::text);


--
-- Name: idx_salons_theme; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salons_theme ON public.salons USING gin (theme);


--
-- Name: idx_scm_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scm_case_id ON public.support_case_messages USING btree (case_id);


--
-- Name: idx_scm_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scm_created_at ON public.support_case_messages USING btree (case_id, created_at);


--
-- Name: idx_scm_sender_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scm_sender_id ON public.support_case_messages USING btree (sender_id);


--
-- Name: idx_security_audit_log_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_audit_log_action ON public.security_audit_log USING btree (action);


--
-- Name: idx_security_audit_log_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_audit_log_created_at ON public.security_audit_log USING btree (created_at);


--
-- Name: idx_security_audit_log_resource_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_audit_log_resource_id ON public.security_audit_log USING btree (resource_id) WHERE (resource_id IS NOT NULL);


--
-- Name: idx_security_audit_log_resource_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_audit_log_resource_type ON public.security_audit_log USING btree (resource_type);


--
-- Name: idx_security_audit_log_salon_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_audit_log_salon_action ON public.security_audit_log USING btree (salon_id, action) WHERE (salon_id IS NOT NULL);


--
-- Name: idx_security_audit_log_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_audit_log_salon_id ON public.security_audit_log USING btree (salon_id);


--
-- Name: idx_security_audit_log_user_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_audit_log_user_action ON public.security_audit_log USING btree (user_id, action) WHERE (user_id IS NOT NULL);


--
-- Name: idx_security_audit_log_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log USING btree (user_id);


--
-- Name: idx_services_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_category ON public.services USING btree (salon_id, category) WHERE (category IS NOT NULL);


--
-- Name: idx_services_salon_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_salon_active ON public.services USING btree (salon_id, is_active, sort_order) WHERE (is_active = true);


--
-- Name: idx_services_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_salon_id ON public.services USING btree (salon_id);


--
-- Name: idx_shift_overrides_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_overrides_employee ON public.shift_overrides USING btree (employee_id, override_date);


--
-- Name: idx_shift_overrides_salon_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_overrides_salon_date ON public.shift_overrides USING btree (salon_id, override_date);


--
-- Name: idx_shifts_salon_employee_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shifts_salon_employee_start ON public.shifts USING btree (salon_id, employee_id, start_time) WHERE (employee_id IS NOT NULL);


--
-- Name: idx_shifts_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shifts_salon_id ON public.shifts USING btree (salon_id);


--
-- Name: idx_sms_log_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sms_log_booking_id ON public.sms_log USING btree (booking_id) WHERE (booking_id IS NOT NULL);


--
-- Name: idx_sms_log_provider_message_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sms_log_provider_message_id ON public.sms_log USING btree (provider_message_id) WHERE (provider_message_id IS NOT NULL);


--
-- Name: idx_sms_log_salon_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sms_log_salon_created_at ON public.sms_log USING btree (salon_id, created_at DESC);


--
-- Name: idx_sms_log_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sms_log_status ON public.sms_log USING btree (status);


--
-- Name: idx_sms_log_waitlist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sms_log_waitlist_id ON public.sms_log USING btree (waitlist_id) WHERE (waitlist_id IS NOT NULL);


--
-- Name: idx_sms_usage_period_window; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sms_usage_period_window ON public.sms_usage USING btree (period_start, period_end);


--
-- Name: idx_sms_usage_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sms_usage_salon_id ON public.sms_usage USING btree (salon_id);


--
-- Name: idx_sms_usage_salon_period_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sms_usage_salon_period_lookup ON public.sms_usage USING btree (salon_id, period_start, period_end);


--
-- Name: idx_stripe_webhook_events_processing_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stripe_webhook_events_processing_status ON public.stripe_webhook_events USING btree (processing_status);


--
-- Name: idx_stripe_webhook_events_received_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stripe_webhook_events_received_at ON public.stripe_webhook_events USING btree (received_at DESC);


--
-- Name: idx_support_cases_assignee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_cases_assignee_id ON public.support_cases USING btree (assignee_id) WHERE (assignee_id IS NOT NULL);


--
-- Name: idx_support_cases_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_cases_created_at ON public.support_cases USING btree (created_at);


--
-- Name: idx_support_cases_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_cases_priority ON public.support_cases USING btree (priority);


--
-- Name: idx_support_cases_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_cases_salon_id ON public.support_cases USING btree (salon_id) WHERE (salon_id IS NOT NULL);


--
-- Name: idx_support_cases_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_cases_status ON public.support_cases USING btree (status);


--
-- Name: idx_support_cases_status_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_cases_status_priority ON public.support_cases USING btree (status, priority);


--
-- Name: idx_support_cases_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_cases_type ON public.support_cases USING btree (type);


--
-- Name: idx_support_cases_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_cases_user_id ON public.support_cases USING btree (user_id) WHERE (user_id IS NOT NULL);


--
-- Name: idx_template_shares_shared_with; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_template_shares_shared_with ON public.template_shares USING btree (shared_with_salon_id);


--
-- Name: idx_template_shares_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_template_shares_template_id ON public.template_shares USING btree (template_id);


--
-- Name: idx_templates_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_created_by ON public.templates USING btree (created_by);


--
-- Name: idx_templates_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_salon_id ON public.templates USING btree (salon_id);


--
-- Name: idx_templates_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_type ON public.templates USING btree (type);


--
-- Name: idx_templates_visibility; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_visibility ON public.templates USING btree (visibility);


--
-- Name: idx_time_blocks_salon_emp_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_time_blocks_salon_emp_start ON public.time_blocks USING btree (salon_id, employee_id, start_time);


--
-- Name: idx_time_blocks_salon_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_time_blocks_salon_start ON public.time_blocks USING btree (salon_id, start_time);


--
-- Name: idx_waitlist_entries_cooldown_until; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_entries_cooldown_until ON public.waitlist_entries USING btree (status, cooldown_until) WHERE (status = 'cooldown'::text);


--
-- Name: idx_waitlist_entries_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_entries_lookup ON public.waitlist_entries USING btree (salon_id, status, preferred_date, service_id);


--
-- Name: idx_waitlist_entries_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_entries_priority ON public.waitlist_entries USING btree (salon_id, service_id, preferred_date, status, priority_score_snapshot, created_at);


--
-- Name: idx_waitlist_entries_priority_override; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_entries_priority_override ON public.waitlist_entries USING btree (salon_id, service_id, preferred_date, status, priority_override_score) WHERE (priority_override_score IS NOT NULL);


--
-- Name: idx_waitlist_entries_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_entries_salon_id ON public.waitlist_entries USING btree (salon_id);


--
-- Name: idx_waitlist_entries_status_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_entries_status_expires_at ON public.waitlist_entries USING btree (status, expires_at) WHERE (status = 'notified'::text);


--
-- Name: idx_waitlist_lifecycle_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_lifecycle_events_created_at ON public.waitlist_lifecycle_events USING btree (created_at DESC);


--
-- Name: idx_waitlist_lifecycle_events_entry_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_lifecycle_events_entry_id ON public.waitlist_lifecycle_events USING btree (waitlist_entry_id);


--
-- Name: idx_waitlist_offers_entry_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_offers_entry_status ON public.waitlist_offers USING btree (waitlist_entry_id, status, created_at DESC);


--
-- Name: idx_waitlist_offers_pending_expiry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_offers_pending_expiry ON public.waitlist_offers USING btree (status, token_expires_at) WHERE (status = 'pending'::text);


--
-- Name: idx_waitlist_offers_slot_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_offers_slot_status ON public.waitlist_offers USING btree (salon_id, slot_start, status);


--
-- Name: idx_waitlist_one_active_offer_per_slot; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_waitlist_one_active_offer_per_slot ON public.waitlist_offers USING btree (salon_id, employee_id, slot_start) WHERE (status = 'pending'::text);


--
-- Name: profiles_is_superadmin_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profiles_is_superadmin_idx ON public.profiles USING btree (is_superadmin) WHERE (is_superadmin = true);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_03_12_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_03_12_inserted_at_topic_idx ON realtime.messages_2026_03_12 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_03_13_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_03_13_inserted_at_topic_idx ON realtime.messages_2026_03_13 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_03_14_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_03_14_inserted_at_topic_idx ON realtime.messages_2026_03_14 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_03_15_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_03_15_inserted_at_topic_idx ON realtime.messages_2026_03_15 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_03_16_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_03_16_inserted_at_topic_idx ON realtime.messages_2026_03_16 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_03_17_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_03_17_inserted_at_topic_idx ON realtime.messages_2026_03_17 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_03_18_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_03_18_inserted_at_topic_idx ON realtime.messages_2026_03_18 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_key ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: messages_2026_03_12_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_03_12_inserted_at_topic_idx;


--
-- Name: messages_2026_03_12_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_03_12_pkey;


--
-- Name: messages_2026_03_13_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_03_13_inserted_at_topic_idx;


--
-- Name: messages_2026_03_13_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_03_13_pkey;


--
-- Name: messages_2026_03_14_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_03_14_inserted_at_topic_idx;


--
-- Name: messages_2026_03_14_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_03_14_pkey;


--
-- Name: messages_2026_03_15_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_03_15_inserted_at_topic_idx;


--
-- Name: messages_2026_03_15_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_03_15_pkey;


--
-- Name: messages_2026_03_16_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_03_16_inserted_at_topic_idx;


--
-- Name: messages_2026_03_16_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_03_16_pkey;


--
-- Name: messages_2026_03_17_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_03_17_inserted_at_topic_idx;


--
-- Name: messages_2026_03_17_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_03_17_pkey;


--
-- Name: messages_2026_03_18_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_03_18_inserted_at_topic_idx;


--
-- Name: messages_2026_03_18_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_03_18_pkey;


--
-- Name: salons ensure_salon_has_owner; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER ensure_salon_has_owner AFTER INSERT ON public.salons DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.check_salon_has_owner();


--
-- Name: notification_preferences notification_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_notification_preferences_updated_at();


--
-- Name: opening_hours_breaks opening_hours_breaks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER opening_hours_breaks_updated_at BEFORE UPDATE ON public.opening_hours_breaks FOR EACH ROW EXECUTE FUNCTION public.update_ohb_updated_at();


--
-- Name: opening_hours opening_hours_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER opening_hours_updated_at BEFORE UPDATE ON public.opening_hours FOR EACH ROW EXECUTE FUNCTION public.update_opening_hours_updated_at();


--
-- Name: profiles prevent_delete_last_salon_owner; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER prevent_delete_last_salon_owner BEFORE DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.prevent_delete_last_owner();


--
-- Name: profiles prevent_nullify_last_salon_owner; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER prevent_nullify_last_salon_owner BEFORE UPDATE ON public.profiles FOR EACH ROW WHEN ((old.salon_id IS NOT NULL)) EXECUTE FUNCTION public.prevent_nullify_last_owner();


--
-- Name: addons prevent_salon_id_change_addons; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER prevent_salon_id_change_addons BEFORE UPDATE ON public.addons FOR EACH ROW EXECUTE FUNCTION public.prevent_salon_id_change();


--
-- Name: bookings prevent_salon_id_change_bookings; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER prevent_salon_id_change_bookings BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.prevent_salon_id_change();


--
-- Name: customers prevent_salon_id_change_customers; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER prevent_salon_id_change_customers BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.prevent_salon_id_change();


--
-- Name: employees prevent_salon_id_change_employees; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER prevent_salon_id_change_employees BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.prevent_salon_id_change();


--
-- Name: opening_hours prevent_salon_id_change_opening_hours; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER prevent_salon_id_change_opening_hours BEFORE UPDATE ON public.opening_hours FOR EACH ROW EXECUTE FUNCTION public.prevent_salon_id_change();


--
-- Name: products prevent_salon_id_change_products; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER prevent_salon_id_change_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.prevent_salon_id_change();


--
-- Name: services prevent_salon_id_change_services; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER prevent_salon_id_change_services BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.prevent_salon_id_change();


--
-- Name: products products_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER products_updated_at_trigger BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_products_updated_at();


--
-- Name: rate_limit_entries rate_limit_entries_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER rate_limit_entries_updated_at BEFORE UPDATE ON public.rate_limit_entries FOR EACH ROW EXECUTE FUNCTION public.update_rate_limit_updated_at();


--
-- Name: salon_ownerships salon_ownerships_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER salon_ownerships_updated_at BEFORE UPDATE ON public.salon_ownerships FOR EACH ROW EXECUTE FUNCTION public.update_salon_ownerships_updated_at();


--
-- Name: calendar_connections set_calendar_connections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_calendar_connections_updated_at BEFORE UPDATE ON public.calendar_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: templates templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_templates_updated_at();


--
-- Name: time_blocks time_blocks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER time_blocks_updated_at BEFORE UPDATE ON public.time_blocks FOR EACH ROW EXECUTE FUNCTION public.update_time_blocks_updated_at();


--
-- Name: notification_jobs trg_notification_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_notification_jobs_updated_at BEFORE UPDATE ON public.notification_jobs FOR EACH ROW EXECUTE FUNCTION public.update_notification_jobs_updated_at();


--
-- Name: waitlist_entries trg_waitlist_set_lifecycle_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_waitlist_set_lifecycle_fields BEFORE INSERT OR UPDATE OF status, notified_at, expires_at ON public.waitlist_entries FOR EACH ROW EXECUTE FUNCTION public.set_waitlist_lifecycle_fields();


--
-- Name: addons trigger_update_addons_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_addons_updated_at BEFORE UPDATE ON public.addons FOR EACH ROW EXECUTE FUNCTION public.update_addons_updated_at();


--
-- Name: features trigger_update_features_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_features_updated_at BEFORE UPDATE ON public.features FOR EACH ROW EXECUTE FUNCTION public.update_features_updated_at();


--
-- Name: sms_usage trigger_update_sms_usage_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_sms_usage_updated_at BEFORE UPDATE ON public.sms_usage FOR EACH ROW EXECUTE FUNCTION public.update_sms_usage_updated_at();


--
-- Name: email_log update_email_log_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_email_log_updated_at BEFORE UPDATE ON public.email_log FOR EACH ROW EXECUTE FUNCTION public.update_email_log_updated_at();


--
-- Name: notification_events update_notification_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_notification_events_updated_at BEFORE UPDATE ON public.notification_events FOR EACH ROW EXECUTE FUNCTION public.update_notification_events_updated_at();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: reminders update_reminders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON public.reminders FOR EACH ROW EXECUTE FUNCTION public.update_reminders_updated_at();


--
-- Name: salons update_salons_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: support_cases update_support_cases_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_support_cases_updated_at BEFORE UPDATE ON public.support_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: addons addons_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addons
    ADD CONSTRAINT addons_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: admin_notes admin_notes_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_notes
    ADD CONSTRAINT admin_notes_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: booking_products booking_products_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_products
    ADD CONSTRAINT booking_products_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: booking_products booking_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_products
    ADD CONSTRAINT booking_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_customer_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_customer_package_id_fkey FOREIGN KEY (customer_package_id) REFERENCES public.customer_packages(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE RESTRICT;


--
-- Name: bookings bookings_gift_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_gift_card_id_fkey FOREIGN KEY (gift_card_id) REFERENCES public.gift_cards(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_import_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_import_batch_id_fkey FOREIGN KEY (import_batch_id) REFERENCES public.import_batches(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE RESTRICT;


--
-- Name: calendar_connections calendar_connections_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_connections
    ADD CONSTRAINT calendar_connections_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: calendar_connections calendar_connections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_connections
    ADD CONSTRAINT calendar_connections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: calendar_event_mappings calendar_event_mappings_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_event_mappings
    ADD CONSTRAINT calendar_event_mappings_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: calendar_event_mappings calendar_event_mappings_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_event_mappings
    ADD CONSTRAINT calendar_event_mappings_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.calendar_connections(id) ON DELETE CASCADE;


--
-- Name: changelog_entries changelog_entries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.changelog_entries
    ADD CONSTRAINT changelog_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: commission_rules commission_rules_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_rules
    ADD CONSTRAINT commission_rules_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: commission_rules commission_rules_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_rules
    ADD CONSTRAINT commission_rules_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: customer_packages customer_packages_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_packages
    ADD CONSTRAINT customer_packages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_packages customer_packages_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_packages
    ADD CONSTRAINT customer_packages_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;


--
-- Name: customer_packages customer_packages_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_packages
    ADD CONSTRAINT customer_packages_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: customers customers_import_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_import_batch_id_fkey FOREIGN KEY (import_batch_id) REFERENCES public.import_batches(id) ON DELETE SET NULL;


--
-- Name: customers customers_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: data_requests data_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_requests
    ADD CONSTRAINT data_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: data_requests data_requests_executed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_requests
    ADD CONSTRAINT data_requests_executed_by_fkey FOREIGN KEY (executed_by) REFERENCES auth.users(id);


--
-- Name: data_requests data_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_requests
    ADD CONSTRAINT data_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id);


--
-- Name: email_log email_log_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_log
    ADD CONSTRAINT email_log_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE SET NULL;


--
-- Name: employee_services employee_services_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_services
    ADD CONSTRAINT employee_services_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_services employee_services_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_services
    ADD CONSTRAINT employee_services_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: employee_services employee_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_services
    ADD CONSTRAINT employee_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: employees employees_import_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_import_batch_id_fkey FOREIGN KEY (import_batch_id) REFERENCES public.import_batches(id) ON DELETE SET NULL;


--
-- Name: employees employees_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: feature_flags feature_flags_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: feature_flags feature_flags_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: feedback_comments feedback_comments_author_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_comments
    ADD CONSTRAINT feedback_comments_author_user_id_fkey FOREIGN KEY (author_user_id) REFERENCES auth.users(id);


--
-- Name: feedback_comments feedback_comments_feedback_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_comments
    ADD CONSTRAINT feedback_comments_feedback_id_fkey FOREIGN KEY (feedback_id) REFERENCES public.feedback_entries(id) ON DELETE CASCADE;


--
-- Name: feedback_entries feedback_entries_admin_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_entries
    ADD CONSTRAINT feedback_entries_admin_owner_id_fkey FOREIGN KEY (admin_owner_id) REFERENCES auth.users(id);


--
-- Name: feedback_entries feedback_entries_changelog_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_entries
    ADD CONSTRAINT feedback_entries_changelog_entry_id_fkey FOREIGN KEY (changelog_entry_id) REFERENCES public.changelog_entries(id);


--
-- Name: feedback_entries feedback_entries_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_entries
    ADD CONSTRAINT feedback_entries_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE SET NULL;


--
-- Name: feedback_entries feedback_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_entries
    ADD CONSTRAINT feedback_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: gift_cards gift_cards_purchased_by_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_cards
    ADD CONSTRAINT gift_cards_purchased_by_customer_id_fkey FOREIGN KEY (purchased_by_customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: gift_cards gift_cards_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_cards
    ADD CONSTRAINT gift_cards_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: import_batches import_batches_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.import_batches
    ADD CONSTRAINT import_batches_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: incidents incidents_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: no_show_policies no_show_policies_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.no_show_policies
    ADD CONSTRAINT no_show_policies_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: notification_attempts notification_attempts_notification_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_attempts
    ADD CONSTRAINT notification_attempts_notification_job_id_fkey FOREIGN KEY (notification_job_id) REFERENCES public.notification_jobs(id) ON DELETE CASCADE;


--
-- Name: notification_events notification_events_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_events
    ADD CONSTRAINT notification_events_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: notification_jobs notification_jobs_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_jobs
    ADD CONSTRAINT notification_jobs_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: notification_preferences notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: opening_hours_breaks opening_hours_breaks_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opening_hours_breaks
    ADD CONSTRAINT opening_hours_breaks_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: opening_hours_breaks opening_hours_breaks_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opening_hours_breaks
    ADD CONSTRAINT opening_hours_breaks_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: opening_hours opening_hours_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opening_hours
    ADD CONSTRAINT opening_hours_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: owner_invitations owner_invitations_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_invitations
    ADD CONSTRAINT owner_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id);


--
-- Name: owner_invitations owner_invitations_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_invitations
    ADD CONSTRAINT owner_invitations_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: packages packages_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: personalliste_entries personalliste_entries_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personalliste_entries
    ADD CONSTRAINT personalliste_entries_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: personalliste_entries personalliste_entries_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personalliste_entries
    ADD CONSTRAINT personalliste_entries_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE RESTRICT;


--
-- Name: personalliste_entries personalliste_entries_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personalliste_entries
    ADD CONSTRAINT personalliste_entries_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: plan_features plan_features_feature_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_features
    ADD CONSTRAINT plan_features_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.features(id) ON DELETE CASCADE;


--
-- Name: portfolio portfolio_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio
    ADD CONSTRAINT portfolio_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: products products_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id);


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: push_subscriptions push_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reminders reminders_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: salon_closures salon_closures_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_closures
    ADD CONSTRAINT salon_closures_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: salon_ownerships salon_ownerships_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_ownerships
    ADD CONSTRAINT salon_ownerships_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: salon_ownerships salon_ownerships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_ownerships
    ADD CONSTRAINT salon_ownerships_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: security_audit_log security_audit_log_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_audit_log
    ADD CONSTRAINT security_audit_log_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE SET NULL;


--
-- Name: security_audit_log security_audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_audit_log
    ADD CONSTRAINT security_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: services services_import_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_import_batch_id_fkey FOREIGN KEY (import_batch_id) REFERENCES public.import_batches(id) ON DELETE SET NULL;


--
-- Name: services services_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: shift_overrides shift_overrides_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_overrides
    ADD CONSTRAINT shift_overrides_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: shift_overrides shift_overrides_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_overrides
    ADD CONSTRAINT shift_overrides_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: shifts shifts_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: shifts shifts_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: sms_log sms_log_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_log
    ADD CONSTRAINT sms_log_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;


--
-- Name: sms_log sms_log_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_log
    ADD CONSTRAINT sms_log_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: sms_log sms_log_waitlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_log
    ADD CONSTRAINT sms_log_waitlist_id_fkey FOREIGN KEY (waitlist_id) REFERENCES public.waitlist_entries(id) ON DELETE SET NULL;


--
-- Name: sms_usage sms_usage_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_usage
    ADD CONSTRAINT sms_usage_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: support_case_messages support_case_messages_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_case_messages
    ADD CONSTRAINT support_case_messages_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.support_cases(id) ON DELETE CASCADE;


--
-- Name: support_case_messages support_case_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_case_messages
    ADD CONSTRAINT support_case_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id);


--
-- Name: support_cases support_cases_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_cases
    ADD CONSTRAINT support_cases_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: support_cases support_cases_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_cases
    ADD CONSTRAINT support_cases_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE SET NULL;


--
-- Name: support_cases support_cases_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_cases
    ADD CONSTRAINT support_cases_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: template_shares template_shares_shared_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_shares
    ADD CONSTRAINT template_shares_shared_by_fkey FOREIGN KEY (shared_by) REFERENCES auth.users(id);


--
-- Name: template_shares template_shares_shared_with_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_shares
    ADD CONSTRAINT template_shares_shared_with_salon_id_fkey FOREIGN KEY (shared_with_salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: template_shares template_shares_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_shares
    ADD CONSTRAINT template_shares_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(id) ON DELETE CASCADE;


--
-- Name: templates templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: templates templates_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: time_blocks time_blocks_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_blocks
    ADD CONSTRAINT time_blocks_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: time_blocks time_blocks_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_blocks
    ADD CONSTRAINT time_blocks_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: waitlist_entries waitlist_entries_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_entries
    ADD CONSTRAINT waitlist_entries_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;


--
-- Name: waitlist_entries waitlist_entries_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_entries
    ADD CONSTRAINT waitlist_entries_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: waitlist_entries waitlist_entries_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_entries
    ADD CONSTRAINT waitlist_entries_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: waitlist_entries waitlist_entries_priority_overridden_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_entries
    ADD CONSTRAINT waitlist_entries_priority_overridden_by_fkey FOREIGN KEY (priority_overridden_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: waitlist_entries waitlist_entries_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_entries
    ADD CONSTRAINT waitlist_entries_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: waitlist_entries waitlist_entries_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_entries
    ADD CONSTRAINT waitlist_entries_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: waitlist_lifecycle_events waitlist_lifecycle_events_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_lifecycle_events
    ADD CONSTRAINT waitlist_lifecycle_events_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: waitlist_lifecycle_events waitlist_lifecycle_events_waitlist_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_lifecycle_events
    ADD CONSTRAINT waitlist_lifecycle_events_waitlist_entry_id_fkey FOREIGN KEY (waitlist_entry_id) REFERENCES public.waitlist_entries(id) ON DELETE CASCADE;


--
-- Name: waitlist_offers waitlist_offers_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_offers
    ADD CONSTRAINT waitlist_offers_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;


--
-- Name: waitlist_offers waitlist_offers_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_offers
    ADD CONSTRAINT waitlist_offers_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: waitlist_offers waitlist_offers_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_offers
    ADD CONSTRAINT waitlist_offers_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: waitlist_offers waitlist_offers_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_offers
    ADD CONSTRAINT waitlist_offers_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: waitlist_offers waitlist_offers_waitlist_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_offers
    ADD CONSTRAINT waitlist_offers_waitlist_entry_id_fkey FOREIGN KEY (waitlist_entry_id) REFERENCES public.waitlist_entries(id) ON DELETE CASCADE;


--
-- Name: waitlist_policies waitlist_policies_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_policies
    ADD CONSTRAINT waitlist_policies_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: waitlist_policies waitlist_policies_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_policies
    ADD CONSTRAINT waitlist_policies_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: reminders Allow inserts for reminders with valid booking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow inserts for reminders with valid booking" ON public.reminders FOR INSERT WITH CHECK (((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.salon_id IN ( SELECT salons.id
           FROM public.salons)))) OR ((auth.uid() IS NOT NULL) AND (booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.salon_id IN ( SELECT profiles.salon_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))))));


--
-- Name: POLICY "Allow inserts for reminders with valid booking" ON reminders; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY "Allow inserts for reminders with valid booking" ON public.reminders IS 'Allows server-side API routes to insert reminders for bookings in valid salons';


--
-- Name: email_log Allow inserts for valid salon_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow inserts for valid salon_id" ON public.email_log FOR INSERT WITH CHECK (((salon_id IS NULL) OR (salon_id IN ( SELECT salons.id
   FROM public.salons)) OR ((auth.uid() IS NOT NULL) AND (salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: POLICY "Allow inserts for valid salon_id" ON email_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY "Allow inserts for valid salon_id" ON public.email_log IS 'Allows server-side API routes to insert email logs for valid salons';


--
-- Name: security_audit_log Anonymous audit logs allowed; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anonymous audit logs allowed" ON public.security_audit_log FOR INSERT WITH CHECK (((auth.uid() IS NULL) AND (user_id IS NULL) AND (salon_id IS NOT NULL)));


--
-- Name: POLICY "Anonymous audit logs allowed" ON security_audit_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY "Anonymous audit logs allowed" ON public.security_audit_log IS 'Allows anonymous users to insert audit logs for public booking pages.';


--
-- Name: contact_submissions Anonymous can insert contact submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anonymous can insert contact submissions" ON public.contact_submissions FOR INSERT TO anon WITH CHECK ((consent = true));


--
-- Name: features Anyone can view features; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view features" ON public.features FOR SELECT USING (true);


--
-- Name: plan_features Anyone can view plan_features; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view plan_features" ON public.plan_features FOR SELECT USING (true);


--
-- Name: contact_submissions Authenticated can insert contact submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can insert contact submissions" ON public.contact_submissions FOR INSERT TO authenticated WITH CHECK ((consent = true));


--
-- Name: admin_notes No deletes on admin notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No deletes on admin notes" ON public.admin_notes FOR DELETE USING (false);


--
-- Name: support_case_messages No deletes on case messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No deletes on case messages" ON public.support_case_messages FOR DELETE USING (false);


--
-- Name: feedback_comments No deletes on feedback comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No deletes on feedback comments" ON public.feedback_comments FOR DELETE USING (false);


--
-- Name: support_cases No deletes on support cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No deletes on support cases" ON public.support_cases FOR DELETE USING (false);


--
-- Name: security_audit_log No deletes to audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No deletes to audit logs" ON public.security_audit_log FOR DELETE USING (false);


--
-- Name: admin_notes No updates to admin notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No updates to admin notes" ON public.admin_notes FOR UPDATE USING (false);


--
-- Name: security_audit_log No updates to audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No updates to audit logs" ON public.security_audit_log FOR UPDATE USING (false);


--
-- Name: features Only superadmins can modify features; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only superadmins can modify features" ON public.features USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: plan_features Only superadmins can modify plan_features; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only superadmins can modify plan_features" ON public.plan_features USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: owner_invitations Owners can create invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can create invitations" ON public.owner_invitations FOR INSERT WITH CHECK (((salon_id IN ( SELECT salon_ownerships.salon_id
   FROM public.salon_ownerships
  WHERE ((salon_ownerships.user_id = auth.uid()) AND (((salon_ownerships.permissions ->> 'canInviteOwners'::text))::boolean = true)))) AND (invited_by = auth.uid())));


--
-- Name: salon_ownerships Owners can delete salon ownerships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can delete salon ownerships" ON public.salon_ownerships FOR DELETE USING (((EXISTS ( SELECT 1
   FROM public.salon_ownerships so
  WHERE ((so.salon_id = salon_ownerships.salon_id) AND (so.user_id = auth.uid()) AND (so.role = 'owner'::public.owner_role)))) AND (user_id <> auth.uid())));


--
-- Name: salon_ownerships Owners can insert salon ownerships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can insert salon ownerships" ON public.salon_ownerships FOR INSERT WITH CHECK (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.salon_ownerships salon_ownerships_1
  WHERE ((salon_ownerships_1.salon_id = salon_ownerships_1.salon_id) AND (salon_ownerships_1.user_id = auth.uid()) AND (salon_ownerships_1.role = 'owner'::public.owner_role))))));


--
-- Name: owner_invitations Owners can view invitations for their salons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can view invitations for their salons" ON public.owner_invitations FOR SELECT USING ((salon_id IN ( SELECT salon_ownerships.salon_id
   FROM public.salon_ownerships
  WHERE ((salon_ownerships.user_id = auth.uid()) AND (((salon_ownerships.permissions ->> 'canInviteOwners'::text))::boolean = true)))));


--
-- Name: salon_ownerships Owners can view salon ownerships for their salons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can view salon ownerships for their salons" ON public.salon_ownerships FOR SELECT USING ((salon_id IN ( SELECT salon_ownerships_1.salon_id
   FROM public.salon_ownerships salon_ownerships_1
  WHERE ((salon_ownerships_1.user_id = auth.uid()) AND (salon_ownerships_1.role = 'owner'::public.owner_role)))));


--
-- Name: reviews Public can read approved reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read approved reviews" ON public.reviews FOR SELECT USING (((is_approved = true) AND (deleted_at IS NULL)));


--
-- Name: portfolio Public can read published portfolio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read published portfolio" ON public.portfolio FOR SELECT USING (((is_published = true) AND (deleted_at IS NULL)));


--
-- Name: salons Public can see public salons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can see public salons" ON public.salons FOR SELECT USING ((is_public = true));


--
-- Name: security_audit_log Salon members can read audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon members can read audit logs" ON public.security_audit_log FOR SELECT USING (((salon_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id = security_audit_log.salon_id))))));


--
-- Name: POLICY "Salon members can read audit logs" ON security_audit_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY "Salon members can read audit logs" ON public.security_audit_log IS 'Allows owner/manager/staff to read audit log rows for their own salon.';


--
-- Name: portfolio Salon members manage portfolio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon members manage portfolio" ON public.portfolio TO authenticated USING ((salon_id IN ( SELECT p.salon_id
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id IS NOT NULL))))) WITH CHECK ((salon_id IN ( SELECT p.salon_id
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id IS NOT NULL)))));


--
-- Name: reviews Salon members manage reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon members manage reviews" ON public.reviews TO authenticated USING ((salon_id IN ( SELECT p.salon_id
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id IS NOT NULL))))) WITH CHECK ((salon_id IN ( SELECT p.salon_id
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id IS NOT NULL)))));


--
-- Name: salon_closures Salon owners can delete closures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can delete closures" ON public.salon_closures FOR DELETE USING (((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id = salon_closures.salon_id) AND (p.role = ANY (ARRAY['owner'::text, 'manager'::text]))))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true))))));


--
-- Name: salon_closures Salon owners can insert closures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can insert closures" ON public.salon_closures FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id = salon_closures.salon_id) AND (p.role = ANY (ARRAY['owner'::text, 'manager'::text]))))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true))))));


--
-- Name: salon_closures Salon owners can read own closures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can read own closures" ON public.salon_closures FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id = salon_closures.salon_id) AND (p.role = ANY (ARRAY['owner'::text, 'manager'::text]))))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true))))));


--
-- Name: feedback_entries Salon owners can read own feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can read own feedback" ON public.feedback_entries FOR SELECT USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id = feedback_entries.salon_id) AND (p.role = 'owner'::text))))));


--
-- Name: support_cases Salon owners can read own support cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can read own support cases" ON public.support_cases FOR SELECT USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id = support_cases.salon_id) AND (p.role = 'owner'::text))))));


--
-- Name: support_case_messages Salon owners can read public case messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can read public case messages" ON public.support_case_messages FOR SELECT USING (((is_internal = false) AND (EXISTS ( SELECT 1
   FROM public.support_cases sc
  WHERE ((sc.id = support_case_messages.case_id) AND ((sc.user_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM public.profiles p
          WHERE ((p.user_id = auth.uid()) AND (p.salon_id = sc.salon_id) AND (p.role = 'owner'::text))))))))));


--
-- Name: feedback_comments Salon owners can read public feedback comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can read public feedback comments" ON public.feedback_comments FOR SELECT USING (((is_internal = false) AND (EXISTS ( SELECT 1
   FROM public.feedback_entries fe
  WHERE ((fe.id = feedback_comments.feedback_id) AND ((fe.user_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM public.profiles p
          WHERE ((p.user_id = auth.uid()) AND (p.salon_id = fe.salon_id) AND (p.role = 'owner'::text))))))))));


--
-- Name: salons Salon owners can read their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can read their salon" ON public.salons FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.salon_id = salons.id) AND (p.user_id = auth.uid()) AND (p.role = 'owner'::text)))));


--
-- Name: support_case_messages Salon owners can reply to own cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can reply to own cases" ON public.support_case_messages FOR INSERT WITH CHECK (((is_internal = false) AND (sender_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.support_cases sc
  WHERE ((sc.id = support_case_messages.case_id) AND ((sc.user_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM public.profiles p
          WHERE ((p.user_id = auth.uid()) AND (p.salon_id = sc.salon_id) AND (p.role = 'owner'::text))))))))));


--
-- Name: feedback_comments Salon owners can reply to own feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can reply to own feedback" ON public.feedback_comments FOR INSERT WITH CHECK (((is_internal = false) AND (author_user_id = auth.uid()) AND (author_role = 'salon'::text) AND (EXISTS ( SELECT 1
   FROM public.feedback_entries fe
  WHERE ((fe.id = feedback_comments.feedback_id) AND ((fe.user_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM public.profiles p
          WHERE ((p.user_id = auth.uid()) AND (p.salon_id = fe.salon_id) AND (p.role = 'owner'::text))))))))));


--
-- Name: salon_closures Salon owners can update closures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can update closures" ON public.salon_closures FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id = salon_closures.salon_id) AND (p.role = ANY (ARRAY['owner'::text, 'manager'::text]))))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true))))));


--
-- Name: feedback_entries Salon owners can update own feedback when new; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can update own feedback when new" ON public.feedback_entries FOR UPDATE USING (((user_id = auth.uid()) AND (status = 'new'::text))) WITH CHECK (((user_id = auth.uid()) AND (status = 'new'::text)));


--
-- Name: salons Salon owners can update their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can update their salon" ON public.salons FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.salon_id = salons.id) AND (p.user_id = auth.uid()) AND (p.role = 'owner'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.salon_id = salons.id) AND (p.user_id = auth.uid()) AND (p.role = 'owner'::text)))));


--
-- Name: bookings Salon owners manage their bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners manage their bookings" ON public.bookings USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.salon_id = bookings.salon_id) AND (p.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.salon_id = bookings.salon_id) AND (p.user_id = auth.uid())))));


--
-- Name: customers Salon owners manage their customers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners manage their customers" ON public.customers USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.salon_id = customers.salon_id) AND (p.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.salon_id = customers.salon_id) AND (p.user_id = auth.uid())))));


--
-- Name: shifts Salon owners manage their shifts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners manage their shifts" ON public.shifts USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.salon_id = shifts.salon_id) AND (p.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.salon_id = shifts.salon_id) AND (p.user_id = auth.uid())))));


--
-- Name: bookings Salon owners see their bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners see their bookings" ON public.bookings FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.salon_id = bookings.salon_id) AND (p.user_id = auth.uid())))));


--
-- Name: customers Salon owners see their customers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners see their customers" ON public.customers FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.salon_id = customers.salon_id) AND (p.user_id = auth.uid())))));


--
-- Name: shifts Salon owners see their shifts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners see their shifts" ON public.shifts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.salon_id = shifts.salon_id) AND (p.user_id = auth.uid())))));


--
-- Name: owner_invitations Service role can access all owner invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can access all owner invitations" ON public.owner_invitations USING ((auth.role() = 'service_role'::text));


--
-- Name: push_subscriptions Service role can access all push subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can access all push subscriptions" ON public.push_subscriptions USING ((auth.role() = 'service_role'::text));


--
-- Name: salon_ownerships Service role can access all salon ownerships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can access all salon ownerships" ON public.salon_ownerships USING ((auth.role() = 'service_role'::text));


--
-- Name: template_shares Service role can access all template shares; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can access all template shares" ON public.template_shares USING ((auth.role() = 'service_role'::text));


--
-- Name: templates Service role can access all templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can access all templates" ON public.templates USING ((auth.role() = 'service_role'::text));


--
-- Name: security_audit_log Service role can insert audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert audit logs" ON public.security_audit_log FOR INSERT WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: notifications Service role can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert notifications" ON public.notifications FOR INSERT TO authenticated, service_role WITH CHECK (true);


--
-- Name: email_log Service role can manage email logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage email logs" ON public.email_log USING ((auth.role() = 'service_role'::text));


--
-- Name: notification_events Service role can manage notification events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage notification events" ON public.notification_events USING ((auth.role() = 'service_role'::text));


--
-- Name: rate_limit_entries Service role can manage rate limit entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage rate limit entries" ON public.rate_limit_entries USING ((auth.role() = 'service_role'::text));


--
-- Name: reminders Service role can manage reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage reminders" ON public.reminders USING ((auth.role() = 'service_role'::text));


--
-- Name: sms_log Service role can manage sms_log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage sms_log" ON public.sms_log USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: sms_usage Service role can manage sms_usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage sms_usage" ON public.sms_usage USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: notification_attempts Service role manage notification_attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role manage notification_attempts" ON public.notification_attempts USING ((auth.role() = 'service_role'::text));


--
-- Name: notification_jobs Service role manage notification_jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role manage notification_jobs" ON public.notification_jobs USING ((auth.role() = 'service_role'::text));


--
-- Name: profiles Super admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_superadmin());


--
-- Name: admin_notes Superadmins can insert admin notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can insert admin notes" ON public.admin_notes FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))) AND (author_id = auth.uid())));


--
-- Name: support_case_messages Superadmins can insert case messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can insert case messages" ON public.support_case_messages FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true)))));


--
-- Name: feedback_comments Superadmins can insert feedback comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can insert feedback comments" ON public.feedback_comments FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true)))));


--
-- Name: support_cases Superadmins can insert support cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can insert support cases" ON public.support_cases FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: admin_notes Superadmins can read admin notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can read admin notes" ON public.admin_notes FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: support_case_messages Superadmins can read all case messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can read all case messages" ON public.support_case_messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true)))));


--
-- Name: feedback_comments Superadmins can read all feedback comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can read all feedback comments" ON public.feedback_comments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true)))));


--
-- Name: security_audit_log Superadmins can read audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can read audit logs" ON public.security_audit_log FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: support_cases Superadmins can read support cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can read support cases" ON public.support_cases FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: salons Superadmins can update all salons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can update all salons" ON public.salons FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: support_cases Superadmins can update support cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can update support cases" ON public.support_cases FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: booking_products Superadmins can view all booking_products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can view all booking_products" ON public.booking_products FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: bookings Superadmins can view all bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can view all bookings" ON public.bookings FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: customers Superadmins can view all customers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can view all customers" ON public.customers FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: employees Superadmins can view all employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can view all employees" ON public.employees FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: personalliste_entries Superadmins can view all personalliste; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can view all personalliste" ON public.personalliste_entries FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: products Superadmins can view all products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can view all products" ON public.products FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: salons Superadmins can view all salons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can view all salons" ON public.salons FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: services Superadmins can view all services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can view all services" ON public.services FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: shifts Superadmins can view all shifts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can view all shifts" ON public.shifts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: owner_invitations Users can accept their invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can accept their invitations" ON public.owner_invitations FOR UPDATE USING ((email = (( SELECT users.email
   FROM auth.users
  WHERE (users.id = auth.uid())))::text));


--
-- Name: template_shares Users can create shares; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create shares" ON public.template_shares FOR INSERT WITH CHECK (((template_id IN ( SELECT templates.id
   FROM public.templates
  WHERE (templates.created_by = auth.uid()))) AND (shared_by = auth.uid())));


--
-- Name: templates Users can create templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create templates" ON public.templates FOR INSERT WITH CHECK (((salon_id IN ( SELECT salon_ownerships.salon_id
   FROM public.salon_ownerships
  WHERE (salon_ownerships.user_id = auth.uid()))) AND (created_by = auth.uid())));


--
-- Name: addons Users can delete addons for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete addons for their salon" ON public.addons FOR DELETE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: booking_products Users can delete booking_products for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete booking_products for their salon" ON public.booking_products FOR DELETE USING ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.salon_id IN ( SELECT profiles.salon_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: bookings Users can delete bookings for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete bookings for their salon" ON public.bookings FOR DELETE USING (((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))) AND (public.user_has_role('owner'::text) OR public.user_has_role('manager'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))))));


--
-- Name: opening_hours_breaks Users can delete breaks for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete breaks for their salon" ON public.opening_hours_breaks FOR DELETE USING (((salon_id IN ( SELECT p.salon_id
   FROM public.profiles p
  WHERE (p.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true))))));


--
-- Name: commission_rules Users can delete commission rules for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete commission rules for their salon" ON public.commission_rules FOR DELETE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: customers Users can delete customers for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete customers for their salon" ON public.customers FOR DELETE USING (((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))) AND (public.user_has_role('owner'::text) OR public.user_has_role('manager'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))))));


--
-- Name: employee_services Users can delete employee_services for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete employee_services for their salon" ON public.employee_services FOR DELETE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: employees Users can delete employees for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete employees for their salon" ON public.employees FOR DELETE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: opening_hours Users can delete opening_hours for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete opening_hours for their salon" ON public.opening_hours FOR DELETE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: calendar_connections Users can delete own calendar connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own calendar connections" ON public.calendar_connections FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: calendar_event_mappings Users can delete own event mappings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own event mappings" ON public.calendar_event_mappings FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.calendar_connections cc
  WHERE ((cc.id = calendar_event_mappings.connection_id) AND (cc.user_id = auth.uid())))));


--
-- Name: notifications Users can delete own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: products Users can delete products for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete products for their salon" ON public.products FOR DELETE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: services Users can delete services for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete services for their salon" ON public.services FOR DELETE USING (((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))) AND (public.user_has_role('owner'::text) OR public.user_has_role('manager'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))))));


--
-- Name: template_shares Users can delete shares they created; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete shares they created" ON public.template_shares FOR DELETE USING ((shared_by = auth.uid()));


--
-- Name: shift_overrides Users can delete shift_overrides for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete shift_overrides for their salon" ON public.shift_overrides FOR DELETE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: shifts Users can delete shifts for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete shifts for their salon" ON public.shifts FOR DELETE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: push_subscriptions Users can delete their own push subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own push subscriptions" ON public.push_subscriptions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: templates Users can delete their templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their templates" ON public.templates FOR DELETE USING (((created_by = auth.uid()) OR (salon_id IN ( SELECT salon_ownerships.salon_id
   FROM public.salon_ownerships
  WHERE ((salon_ownerships.user_id = auth.uid()) AND (salon_ownerships.role = 'owner'::public.owner_role))))));


--
-- Name: time_blocks Users can delete time_blocks for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete time_blocks for their salon" ON public.time_blocks FOR DELETE USING (((salon_id IN ( SELECT p.salon_id
   FROM public.profiles p
  WHERE (p.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true))))));


--
-- Name: waitlist_entries Users can delete waitlist entries for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete waitlist entries for their salon" ON public.waitlist_entries FOR DELETE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: addons Users can insert addons for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert addons for their salon" ON public.addons FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: security_audit_log Users can insert audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert audit logs" ON public.security_audit_log FOR INSERT WITH CHECK (((auth.uid() IS NOT NULL) AND (salon_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.salon_id = profiles.salon_id))))));


--
-- Name: POLICY "Users can insert audit logs" ON security_audit_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY "Users can insert audit logs" ON public.security_audit_log IS 'Allows authenticated users to insert audit logs for salons they have access to.';


--
-- Name: booking_products Users can insert booking_products for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert booking_products for their salon" ON public.booking_products FOR INSERT WITH CHECK ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.salon_id IN ( SELECT profiles.salon_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: bookings Users can insert bookings for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert bookings for their salon" ON public.bookings FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: opening_hours_breaks Users can insert breaks for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert breaks for their salon" ON public.opening_hours_breaks FOR INSERT WITH CHECK (((salon_id IN ( SELECT p.salon_id
   FROM public.profiles p
  WHERE (p.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true))))));


--
-- Name: commission_rules Users can insert commission rules for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert commission rules for their salon" ON public.commission_rules FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: customer_packages Users can insert customer packages for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert customer packages for their salon" ON public.customer_packages FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: customers Users can insert customers for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert customers for their salon" ON public.customers FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: employee_services Users can insert employee_services for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert employee_services for their salon" ON public.employee_services FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: employees Users can insert employees for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert employees for their salon" ON public.employees FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: gift_cards Users can insert gift cards for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert gift cards for their salon" ON public.gift_cards FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: import_batches Users can insert import batches for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert import batches for their salon" ON public.import_batches FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: no_show_policies Users can insert no-show policy for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert no-show policy for their salon" ON public.no_show_policies FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: opening_hours Users can insert opening_hours for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert opening_hours for their salon" ON public.opening_hours FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: calendar_connections Users can insert own calendar connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own calendar connections" ON public.calendar_connections FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: calendar_event_mappings Users can insert own event mappings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own event mappings" ON public.calendar_event_mappings FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.calendar_connections cc
  WHERE ((cc.id = calendar_event_mappings.connection_id) AND (cc.user_id = auth.uid())))));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: packages Users can insert packages for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert packages for their salon" ON public.packages FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: personalliste_entries Users can insert personalliste for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert personalliste for their salon" ON public.personalliste_entries FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: products Users can insert products for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert products for their salon" ON public.products FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: services Users can insert services for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert services for their salon" ON public.services FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: shift_overrides Users can insert shift_overrides for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert shift_overrides for their salon" ON public.shift_overrides FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: shifts Users can insert shifts for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert shifts for their salon" ON public.shifts FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: notification_preferences Users can insert their own notification preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own notification preferences" ON public.notification_preferences FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: push_subscriptions Users can insert their own push subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own push subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: time_blocks Users can insert time_blocks for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert time_blocks for their salon" ON public.time_blocks FOR INSERT WITH CHECK (((salon_id IN ( SELECT p.salon_id
   FROM public.profiles p
  WHERE (p.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true))))));


--
-- Name: waitlist_entries Users can insert waitlist entries for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert waitlist entries for their salon" ON public.waitlist_entries FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: waitlist_offers Users can insert waitlist offers for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert waitlist offers for their salon" ON public.waitlist_offers FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: waitlist_policies Users can insert waitlist policies for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert waitlist policies for their salon" ON public.waitlist_policies FOR INSERT WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: profiles Users can see own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can see own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: addons Users can update addons for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update addons for their salon" ON public.addons FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())))) WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: booking_products Users can update booking_products for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update booking_products for their salon" ON public.booking_products FOR UPDATE USING ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.salon_id IN ( SELECT profiles.salon_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid())))))) WITH CHECK ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.salon_id IN ( SELECT profiles.salon_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: bookings Users can update bookings for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update bookings for their salon" ON public.bookings FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())))) WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: opening_hours_breaks Users can update breaks for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update breaks for their salon" ON public.opening_hours_breaks FOR UPDATE USING (((salon_id IN ( SELECT p.salon_id
   FROM public.profiles p
  WHERE (p.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true))))));


--
-- Name: commission_rules Users can update commission rules for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update commission rules for their salon" ON public.commission_rules FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: customer_packages Users can update customer packages for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update customer packages for their salon" ON public.customer_packages FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: customers Users can update customers for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update customers for their salon" ON public.customers FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())))) WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: employees Users can update employees for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update employees for their salon" ON public.employees FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())))) WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: gift_cards Users can update gift cards for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update gift cards for their salon" ON public.gift_cards FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: import_batches Users can update import batches for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update import batches for their salon" ON public.import_batches FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: no_show_policies Users can update no-show policy for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update no-show policy for their salon" ON public.no_show_policies FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: opening_hours Users can update opening_hours for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update opening_hours for their salon" ON public.opening_hours FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())))) WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: calendar_connections Users can update own calendar connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own calendar connections" ON public.calendar_connections FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: calendar_event_mappings Users can update own event mappings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own event mappings" ON public.calendar_event_mappings FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.calendar_connections cc
  WHERE ((cc.id = calendar_event_mappings.connection_id) AND (cc.user_id = auth.uid())))));


--
-- Name: notifications Users can update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: packages Users can update packages for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update packages for their salon" ON public.packages FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: personalliste_entries Users can update personalliste for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update personalliste for their salon" ON public.personalliste_entries FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: products Users can update products for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update products for their salon" ON public.products FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())))) WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: reminders Users can update reminders for their salon bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update reminders for their salon bookings" ON public.reminders FOR UPDATE USING ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.salon_id IN ( SELECT profiles.salon_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: POLICY "Users can update reminders for their salon bookings" ON reminders; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY "Users can update reminders for their salon bookings" ON public.reminders IS 'Allows users to update reminders for bookings in their salon. Uses explicit table prefixes to avoid ambiguous column references.';


--
-- Name: services Users can update services for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update services for their salon" ON public.services FOR UPDATE USING (((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))) AND (public.user_has_role('owner'::text) OR public.user_has_role('manager'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true))))))) WITH CHECK (((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))) AND (public.user_has_role('owner'::text) OR public.user_has_role('manager'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))))));


--
-- Name: shift_overrides Users can update shift_overrides for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update shift_overrides for their salon" ON public.shift_overrides FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: shifts Users can update shifts for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update shifts for their salon" ON public.shifts FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())))) WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: notification_preferences Users can update their own notification preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: push_subscriptions Users can update their own push subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own push subscriptions" ON public.push_subscriptions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: salons Users can update their own salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own salon" ON public.salons FOR UPDATE USING ((id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())))) WITH CHECK ((id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: templates Users can update their templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their templates" ON public.templates FOR UPDATE USING (((created_by = auth.uid()) OR (salon_id IN ( SELECT salon_ownerships.salon_id
   FROM public.salon_ownerships
  WHERE ((salon_ownerships.user_id = auth.uid()) AND (salon_ownerships.role = 'owner'::public.owner_role))))));


--
-- Name: time_blocks Users can update time_blocks for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update time_blocks for their salon" ON public.time_blocks FOR UPDATE USING (((salon_id IN ( SELECT p.salon_id
   FROM public.profiles p
  WHERE (p.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true))))));


--
-- Name: waitlist_entries Users can update waitlist entries for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update waitlist entries for their salon" ON public.waitlist_entries FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: waitlist_offers Users can update waitlist offers for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update waitlist offers for their salon" ON public.waitlist_offers FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())))) WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: waitlist_policies Users can update waitlist policies for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update waitlist policies for their salon" ON public.waitlist_policies FOR UPDATE USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())))) WITH CHECK ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: addons Users can view addons for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view addons for their salon" ON public.addons FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: booking_products Users can view booking_products for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view booking_products for their salon" ON public.booking_products FOR SELECT USING ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.salon_id IN ( SELECT profiles.salon_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: bookings Users can view bookings for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view bookings for their salon" ON public.bookings FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: opening_hours_breaks Users can view breaks for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view breaks for their salon" ON public.opening_hours_breaks FOR SELECT USING (((salon_id IN ( SELECT p.salon_id
   FROM public.profiles p
  WHERE (p.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true))))));


--
-- Name: commission_rules Users can view commission rules for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view commission rules for their salon" ON public.commission_rules FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: customer_packages Users can view customer packages for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view customer packages for their salon" ON public.customer_packages FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: customers Users can view customers for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view customers for their salon" ON public.customers FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: email_log Users can view email logs for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view email logs for their salon" ON public.email_log FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: employee_services Users can view employee_services for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view employee_services for their salon" ON public.employee_services FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: employees Users can view employees for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view employees for their salon" ON public.employees FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: gift_cards Users can view gift cards for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view gift cards for their salon" ON public.gift_cards FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: import_batches Users can view import batches for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view import batches for their salon" ON public.import_batches FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: owner_invitations Users can view invitations for their email; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view invitations for their email" ON public.owner_invitations FOR SELECT USING ((email = (( SELECT users.email
   FROM auth.users
  WHERE (users.id = auth.uid())))::text));


--
-- Name: no_show_policies Users can view no-show policy for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view no-show policy for their salon" ON public.no_show_policies FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: notification_events Users can view notification events for their salon bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view notification events for their salon bookings" ON public.notification_events FOR SELECT USING ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.salon_id IN ( SELECT profiles.salon_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: opening_hours Users can view opening_hours for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view opening_hours for their salon" ON public.opening_hours FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: calendar_connections Users can view own calendar connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own calendar connections" ON public.calendar_connections FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: calendar_event_mappings Users can view own event mappings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own event mappings" ON public.calendar_event_mappings FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.calendar_connections cc
  WHERE ((cc.id = calendar_event_mappings.connection_id) AND (cc.user_id = auth.uid())))));


--
-- Name: notifications Users can view own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: packages Users can view packages for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view packages for their salon" ON public.packages FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: personalliste_entries Users can view personalliste for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view personalliste for their salon" ON public.personalliste_entries FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: products Users can view products for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view products for their salon" ON public.products FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: templates Users can view public templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view public templates" ON public.templates FOR SELECT USING ((visibility = 'public'::public.template_visibility));


--
-- Name: reminders Users can view reminders for their salon bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view reminders for their salon bookings" ON public.reminders FOR SELECT USING ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.salon_id IN ( SELECT profiles.salon_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: POLICY "Users can view reminders for their salon bookings" ON reminders; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY "Users can view reminders for their salon bookings" ON public.reminders IS 'Allows users to view reminders for bookings in their salon. Uses explicit table prefixes to avoid ambiguous column references.';


--
-- Name: services Users can view services for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view services for their salon" ON public.services FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: templates Users can view shared templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view shared templates" ON public.templates FOR SELECT USING ((id IN ( SELECT template_shares.template_id
   FROM public.template_shares
  WHERE (template_shares.shared_with_salon_id IN ( SELECT salon_ownerships.salon_id
           FROM public.salon_ownerships
          WHERE (salon_ownerships.user_id = auth.uid()))))));


--
-- Name: template_shares Users can view shares for their templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view shares for their templates" ON public.template_shares FOR SELECT USING (((template_id IN ( SELECT templates.id
   FROM public.templates
  WHERE (templates.created_by = auth.uid()))) OR (shared_with_salon_id IN ( SELECT salon_ownerships.salon_id
   FROM public.salon_ownerships
  WHERE (salon_ownerships.user_id = auth.uid())))));


--
-- Name: shift_overrides Users can view shift_overrides for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view shift_overrides for their salon" ON public.shift_overrides FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: shifts Users can view shifts for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view shifts for their salon" ON public.shifts FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: sms_log Users can view sms_log for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view sms_log for their salon" ON public.sms_log FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: sms_usage Users can view sms_usage for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view sms_usage for their salon" ON public.sms_usage FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: notification_preferences Users can view their own notification preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: push_subscriptions Users can view their own push subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own push subscriptions" ON public.push_subscriptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: salons Users can view their own salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own salon" ON public.salons FOR SELECT USING ((id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: salon_ownerships Users can view their own salon ownerships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own salon ownerships" ON public.salon_ownerships FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: templates Users can view their salon templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their salon templates" ON public.templates FOR SELECT USING ((salon_id IN ( SELECT salon_ownerships.salon_id
   FROM public.salon_ownerships
  WHERE (salon_ownerships.user_id = auth.uid()))));


--
-- Name: time_blocks Users can view time_blocks for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view time_blocks for their salon" ON public.time_blocks FOR SELECT USING (((salon_id IN ( SELECT p.salon_id
   FROM public.profiles p
  WHERE (p.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true))))));


--
-- Name: waitlist_entries Users can view waitlist for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view waitlist for their salon" ON public.waitlist_entries FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: waitlist_lifecycle_events Users can view waitlist lifecycle events for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view waitlist lifecycle events for their salon" ON public.waitlist_lifecycle_events FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: waitlist_offers Users can view waitlist offers for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view waitlist offers for their salon" ON public.waitlist_offers FOR SELECT USING ((salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: waitlist_policies Users can view waitlist policies for their salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view waitlist policies for their salon" ON public.waitlist_policies FOR SELECT USING (((salon_id IS NULL) OR (salon_id IN ( SELECT profiles.salon_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())))));


--
-- Name: addons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: booking_products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.booking_products ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: calendar_connections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;

--
-- Name: calendar_event_mappings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calendar_event_mappings ENABLE ROW LEVEL SECURITY;

--
-- Name: changelog_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: commission_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_packages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.customer_packages ENABLE ROW LEVEL SECURITY;

--
-- Name: customers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

--
-- Name: data_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.data_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: email_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

--
-- Name: employee_services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employee_services ENABLE ROW LEVEL SECURITY;

--
-- Name: employees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

--
-- Name: feature_flags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

--
-- Name: features; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

--
-- Name: feedback_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feedback_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: feedback_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feedback_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: gift_cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: import_batches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

--
-- Name: incidents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

--
-- Name: no_show_policies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.no_show_policies ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: opening_hours; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;

--
-- Name: opening_hours_breaks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.opening_hours_breaks ENABLE ROW LEVEL SECURITY;

--
-- Name: owner_invitations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.owner_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: packages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

--
-- Name: personalliste_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.personalliste_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: plan_features; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

--
-- Name: portfolio; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: push_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: rate_limit_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: reminders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: salon_closures; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salon_closures ENABLE ROW LEVEL SECURITY;

--
-- Name: salon_ownerships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salon_ownerships ENABLE ROW LEVEL SECURITY;

--
-- Name: salons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;

--
-- Name: security_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

--
-- Name: shift_overrides; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shift_overrides ENABLE ROW LEVEL SECURITY;

--
-- Name: shifts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

--
-- Name: sms_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sms_log ENABLE ROW LEVEL SECURITY;

--
-- Name: sms_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sms_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: changelog_entries superadmins_changelog; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmins_changelog ON public.changelog_entries USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: data_requests superadmins_data_requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmins_data_requests ON public.data_requests USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: feature_flags superadmins_feature_flags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmins_feature_flags ON public.feature_flags USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: feedback_entries superadmins_feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmins_feedback ON public.feedback_entries USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: incidents superadmins_incidents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmins_incidents ON public.incidents USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: support_case_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_case_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: support_cases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_cases ENABLE ROW LEVEL SECURITY;

--
-- Name: template_shares; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.template_shares ENABLE ROW LEVEL SECURITY;

--
-- Name: templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

--
-- Name: time_blocks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

--
-- Name: waitlist_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: waitlist_lifecycle_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.waitlist_lifecycle_events ENABLE ROW LEVEL SECURITY;

--
-- Name: waitlist_offers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.waitlist_offers ENABLE ROW LEVEL SECURITY;

--
-- Name: waitlist_policies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.waitlist_policies ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Public can read salon logos; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public can read salon logos" ON storage.objects FOR SELECT USING ((bucket_id = 'salon-assets'::text));


--
-- Name: objects Read feedback attachments; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Read feedback attachments" ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'feedback-attachments'::text) AND ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND ((p.salon_id)::text = (storage.foldername(objects.name))[1]) AND (p.role = 'owner'::text)))))));


--
-- Name: objects Salon members can delete cover images; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Salon members can delete cover images" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'salon-assets'::text) AND ((storage.foldername(name))[1] = 'covers'::text) AND ((storage.foldername(name))[2] IN ( SELECT (p.salon_id)::text AS salon_id
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id IS NOT NULL))))));


--
-- Name: objects Salon members can delete employee images; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Salon members can delete employee images" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'salon-assets'::text) AND ((storage.foldername(name))[1] = 'employees'::text) AND ((storage.foldername(name))[2] IN ( SELECT (p.salon_id)::text AS salon_id
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id IS NOT NULL))))));


--
-- Name: objects Salon members can delete portfolio images; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Salon members can delete portfolio images" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'salon-assets'::text) AND ((storage.foldername(name))[1] = 'portfolio'::text) AND ((storage.foldername(name))[2] IN ( SELECT (p.salon_id)::text AS salon_id
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id IS NOT NULL))))));


--
-- Name: objects Salon members can delete salon logos; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Salon members can delete salon logos" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'salon-assets'::text) AND ((storage.foldername(name))[1] = 'logos'::text) AND ((storage.foldername(name))[2] IN ( SELECT (p.salon_id)::text AS salon_id
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id IS NOT NULL))))));


--
-- Name: objects Salon members can upload cover images; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Salon members can upload cover images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'salon-assets'::text) AND ((storage.foldername(name))[1] = 'covers'::text) AND ((storage.foldername(name))[2] IN ( SELECT (p.salon_id)::text AS salon_id
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id IS NOT NULL))))));


--
-- Name: objects Salon members can upload employee images; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Salon members can upload employee images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'salon-assets'::text) AND ((storage.foldername(name))[1] = 'employees'::text) AND ((storage.foldername(name))[2] IN ( SELECT (p.salon_id)::text AS salon_id
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id IS NOT NULL))))));


--
-- Name: objects Salon members can upload portfolio images; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Salon members can upload portfolio images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'salon-assets'::text) AND ((storage.foldername(name))[1] = 'portfolio'::text) AND ((storage.foldername(name))[2] IN ( SELECT (p.salon_id)::text AS salon_id
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id IS NOT NULL))))));


--
-- Name: objects Salon members can upload salon logos; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Salon members can upload salon logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'salon-assets'::text) AND ((storage.foldername(name))[1] = 'logos'::text) AND ((storage.foldername(name))[2] IN ( SELECT (p.salon_id)::text AS salon_id
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.salon_id IS NOT NULL))))));


--
-- Name: objects Salon owners can read own support attachments; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Salon owners can read own support attachments" ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'support-attachments'::text) AND ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.is_superadmin = true)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND ((p.salon_id)::text = (storage.foldername(objects.name))[1]) AND (p.role = 'owner'::text)))))));


--
-- Name: objects Salon owners can upload feedback attachments; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Salon owners can upload feedback attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'feedback-attachments'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND ((p.salon_id)::text = (storage.foldername(objects.name))[1]) AND (p.role = 'owner'::text))))));


--
-- Name: objects Salon owners can upload support attachments; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Salon owners can upload support attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'support-attachments'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND ((p.salon_id)::text = (storage.foldername(objects.name))[1]) AND (p.role = 'owner'::text))))));


--
-- Name: objects Users can delete their own avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'user-assets'::text) AND ((storage.foldername(name))[1] = 'avatars'::text) AND ((storage.foldername(name))[2] = (auth.uid())::text)));


--
-- Name: objects Users can read avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can read avatars" ON storage.objects FOR SELECT TO authenticated USING ((bucket_id = 'user-assets'::text));


--
-- Name: objects Users can upload their own avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can upload their own avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'user-assets'::text) AND ((storage.foldername(name))[1] = 'avatars'::text) AND ((storage.foldername(name))[2] = (auth.uid())::text)));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime notifications; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.notifications;


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict vxdpoLHvEBGUmEZngUWsHnH1x7zPhckdacNSEx1vSqvkf3gd8db6nFYmemmoLr7

