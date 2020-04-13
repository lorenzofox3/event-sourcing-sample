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
