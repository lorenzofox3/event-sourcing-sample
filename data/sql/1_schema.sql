DROP TABLE IF EXISTS events CASCADE;

CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    event_type VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_data JSONB,
    version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX transaction_id_idx ON events (cast(event_data ->> 'transaction_id' as integer));
CREATE INDEX transaction_idx ON events (cast(event_data ->> 'account_id' as integer) nulls last,(event_data ->> 'created_at') nulls last, event_type);

