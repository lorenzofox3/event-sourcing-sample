BEGIN;

CREATE ROLE auth;

--start schema creation
CREATE SCHEMA auth AUTHORIZATION auth
    --physical users
    CREATE TABLE users(
        user_id VARCHAR PRIMARY KEY,
        email VARCHAR NOT NULL,
        firstname VARCHAR,
        lastname VARCHAR,
        password_hash VARCHAR NOT NULL,
        password_salt VARCHAR NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
    )
    --client applications
    CREATE TABLE client_applications(
        client_id VARCHAR PRIMARY KEY,
        secret VARCHAR NOT NULL,
        name VARCHAR
    )
    CREATE INDEX users_email_idx ON users(email);
--end schema creation

COMMIT;
