export default Object.freeze({
    user: process.env.POSTGRES_USER || process.env.PGUSER || 'docker',
    host: process.env.POSTGRES_HOST || process.env.PGHOST || 'localhost',
    database: process.env.POSTGRES_DB || process.env.PGDATABASE || 'dev',
    password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || 'docker',
    port: process.env.POSTGRES_PORT || process.env.PGPORT || 5432
});
