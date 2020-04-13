DROP TABLE IF EXISTS events CASCADE;

CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    event_type VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_data JSONB,
    version INTEGER NOT NULL DEFAULT 1
);
