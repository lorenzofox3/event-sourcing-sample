#!/usr/bin/env node
import arg from 'arg';
import connection from '../src/lib/db.js';
import {createClientApplicationsModel} from '../src/models/client-applications.js';

const {
    ['--name']: name
} = arg({
    '--name': String,
    '-n': '--name'
}, {
    permissive: false,
    argv: process.argv.slice(2)
});

(async () => {
    const db = connection;
    const applications = createClientApplicationsModel(db);
    try {
        const app = await applications.create({
            name
        });
        console.log(`id: ${app.id}`);
        console.log(`secret: ${app.secret}`);
    } catch (e) {
        console.error(e);
    } finally {
        db.end();
    }
})();
