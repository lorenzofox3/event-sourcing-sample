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
    ['--balance']: balance = 0,
    ['--id']: id
} = arg({
    '--help': Boolean,
    '--balance': Number,
    '--id': Number,
    '-h': '--help',
    '-b': '--balance',
    '-i': '--id'
}, {
    permissive: false,
    argv: process.argv.slice(2)
});

if (help) {
    createReadStream(resolve(__dirname, './change-balance.txt'))
        .pipe(process.stdout);
    return;
}

const createBalanceChangedEvent = (transaction_id, balance) => ({
    event_type: 'transaction_balance_changed',
    event_data: {
        transaction_id,
        balance
    }
});

(async () => {
    const pool = new Pool(dbConf);
    try {
        const res = await pool.query(`
        INSERT INTO events(event_type, event_data)
        VALUES ('transaction_balance_changed', $1) RETURNING *;`, [
            createBalanceChangedEvent(id, balance).event_data
        ]);
        console.log(res);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
})();




