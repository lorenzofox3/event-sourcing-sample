#!/usr/bin/env node
const arg = require('arg');
const {Pool} = require('pg');
const {createReadStream} = require('fs');
const {resolve} = require('path');

// todo read from conf or from argument
const dbConf = {
    user: 'docker',
    host: 'localhost',
    database: 'test',
    password: 'docker',
    port: 5432
};

const {
    ['--help']: help = false,
    ['--category']: category = null,
    ['--id']: id
} = arg({
    '--help': Boolean,
    '--category': String,
    '--id': Number,
    '-h': '--help',
    '-c': '--category',
    '-i': '--id'
}, {
    permissive: false,
    argv: process.argv.slice(2)
});

if (help) {
    createReadStream(resolve(__dirname, './change-category.txt'))
        .pipe(process.stdout);
    return;
}

const createChangeCategoryEvent = (transaction_id, category) => ({
    event_type: 'transaction_category_changed',
    event_data: {
        transaction_id,
        category
    }
});

(async () => {
    const pool = new Pool(dbConf);
    try {
        const res = await pool.query(`
        INSERT INTO events(event_type, event_data)
        VALUES ('transaction_category_changed', $1) RETURNING *;`, [
            createChangeCategoryEvent(id, category).event_data
        ]);
        console.log(res);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
})();




