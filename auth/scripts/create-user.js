#!/usr/bin/env node
import arg from 'arg';
import connection from '../src/lib/db.js';
import {createUsersModel} from '../src/models/users.js';

const {
    ['--firstname']: firstname,
    ['--lastname']: lastname,
    ['--email']: email,
    ['--password']: password
} = arg({
    '--firstname': String,
    '--lastname': String,
    '--email': String,
    '--password': String,
    '-f': '--firstname',
    '-l': '--lastname',
    '-e': '--email',
    '-w': '--password'
}, {
    permissive: false,
    argv: process.argv.slice(2)
});

(async () => {
    const db = connection;
    const users = createUsersModel(db);
    try {
        const user = await users.create({
            firstname,
            lastname,
            email,
            password
        });
        console.log(user);
    } catch (e) {
        console.error(e);
    } finally {
        db.end();
    }
})();
