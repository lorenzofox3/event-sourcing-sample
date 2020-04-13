module.exports = Object.freeze({
    port: process.env.POSTGRES_PORT || process.env.PGPORT || 5432,
    host: process.env.POSTGRES_HOST || process.env.PGHOST || '127.0.0.1',
    user: process.env.POSTGRES_USER || process.env.PGUSER || 'docker',
    password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || 'docker',
    database: process.env.POSTGRES_DB || process.env.PGDATABASE || 'test'
});
