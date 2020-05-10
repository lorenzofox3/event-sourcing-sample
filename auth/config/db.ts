import {PoolConfig} from 'pg';

export default <unknown>Object.freeze({
    user: process.env.POSTGRES_USER || process.env.PGUSER,
    host: process.env.POSTGRES_HOST || process.env.PGHOST,
    database: process.env.POSTGRES_DB || process.env.PGDATABASE,
    password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD,
    port: process.env.POSTGRES_PORT || process.env.PGPORT
}) as PoolConfig;
