-- for a given account
-- find all events related to transactions created in a given month
-- note: all subsequents events for these transactions will be recorded too (label changed, etc)
-- even though the even occurred in a different month
CREATE OR REPLACE FUNCTION stream_events(
    account_id integer,
    month integer
) RETURNS SETOF events
AS $$
    WITH transactions AS (
        SELECT
            (event_data -> 'transaction_id')::integer as transaction_id
        FROM
            events
        WHERE
            (event_data -> 'account_id')::integer=$1
        AND
            date_part('month',(event_data ->> 'created_at')::date)=$2
    )
    SELECT
        *
    FROM
        events
    WHERE
        (events.event_data -> 'transaction_id')::integer
    IN (
        SELECT
            transaction_id
        FROM
            transactions
    )
    ORDER BY
        event_id
$$
LANGUAGE SQL
STABLE
LEAKPROOF
PARALLEL SAFE;

CREATE OR REPLACE FUNCTION stream_events_after(
    account_id integer,
    month integer,
    snapshot_id integer
) RETURNS SETOF events
AS $$
    WITH transactions AS (
        SELECT
            (event_data -> 'transaction_id')::integer as transaction_id
        FROM
            events
        WHERE
            (event_data -> 'account_id')::integer=$1
        AND
            date_part('month',(event_data ->> 'created_at')::date)=$2
    )
    SELECT
        *
    FROM
        events
    WHERE
        event_id > snapshot_id
    AND
        (events.event_data -> 'transaction_id')::integer
    IN (
        SELECT
            transaction_id
        FROM
            transactions
    )
    ORDER BY
        event_id
$$
LANGUAGE SQL
STABLE
LEAKPROOF
PARALLEL SAFE;

CREATE OR REPLACE FUNCTION notify_new_event_created()
  RETURNS trigger
AS $$
BEGIN
    PERFORM pg_notify('events', to_json(NEW.*)::TEXT);
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER new_event_created
  AFTER INSERT
  ON events
  FOR EACH ROW
  EXECUTE PROCEDURE notify_new_event_created();
