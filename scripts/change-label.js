#!/usr/bin/env node
const arg = require('arg');
const {Pool} = require('pg');
const {createReadStream} = require('fs');
const {resolve} = require('path');

// todo read from conf or from argument
const dbConf = {
    user: 'docker',
    host: 'localhost',
    database: 'dev',
    password: 'docker',
    port: 5432
};

const {
    ['--help']: help = false,
    ['--label']: label = null,
    ['--id']: id
} = arg({
    '--help': Boolean,
    '--label': String,
    '--id': Number,
    '-h': '--help',
    '-l': '--label',
    '-i': '--id'
}, {
    permissive: false,
    argv: process.argv.slice(2)
});

if (help) {
    createReadStream(resolve(__dirname, './change-label.txt'))
        .pipe(process.stdout);
    return;
}

const createChangeLabelEvent = (transaction_id, label) => ({
    event_type: 'transaction_label_changed',
    event_data: {
        transaction_id,
        label
    }
});

(async () => {
    const pool = new Pool(dbConf);
    try {
        const res = await pool.query(`
        INSERT INTO events(event_type, event_data)
        VALUES ('transaction_label_changed', $1) RETURNING *;`, [
            createChangeLabelEvent(id, label).event_data
        ]);
        console.log(res);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
})();




