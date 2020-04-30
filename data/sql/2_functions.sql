-- for a given account
-- find all events related to transactions created in a given time frame
-- note: all subsequents events for these transactions will be recorded too (label changed, etc)
-- even though the event occurred in a different month
CREATE OR REPLACE FUNCTION stream_transaction_events(
    account_id integer,
    start_date text,
    end_date text
) RETURNS SETOF events
AS $$
    WITH transactions_ids AS (
        SELECT
            (event_data ->> 'transaction_id')::integer as transaction_id
        FROM
            events
        WHERE
            (event_data ->> 'account_id')::integer=$1
        AND
            event_type = 'transaction_created'
        AND
            event_data ->> 'created_at' > $2
        AND
            event_data ->> 'created_at' <= $3
    )

    SELECT
        events.*
    FROM
        events
    JOIN
        transactions_ids
    ON
        transactions_ids.transaction_id = (events.event_data ->> 'transaction_id')::integer
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
