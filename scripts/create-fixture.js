#!/usr/bin/env node
const {Readable} = require('stream');
const {createReadStream, createWriteStream} = require("fs");
const {resolve} = require("path");
const arg = require("arg");
const {Transform} = require('json2csv');
const faker = require('faker');

const {
    ['--help']: help = false,
    ['--csv']: csv = false,
    ['--accounts']: ACCOUNT_COUNT = 100,
    ['--transactions']: TRANSACTIONS_BY_ACCOUNT_COUNT = 1000,
    ['--output']: output
} = arg({
    '--help': Boolean,
    '--csv': Boolean,
    '--accounts': Number,
    '--transactions': Number,
    '--output': String,
    '-h': '--help',
    '-a': '--accounts',
    '-t': '--transactions',
    '-o': '--output'
}, {
    permissive: false,
    argv: process.argv.slice(2)
});

if (help) {
    createReadStream(resolve(__dirname, './create-fixture.txt'))
        .pipe(process.stdout);
    return;
}

const outputStream = output ?
    createWriteStream(resolve(process.cwd(), output)) :
    process.stdout;

const TRANSACTIONS_COUNT = ACCOUNT_COUNT * TRANSACTIONS_BY_ACCOUNT_COUNT;

const getLinearTimeScale = (start, end) => ratio => new Date(Math.round(start + ratio * (end - start)));
const yearScale = getLinearTimeScale((new Date(2019, 0, 1).getTime()), (new Date(2020, 0, 1).getTime()));

const createChangeBalanceEvent = (transaction_id) => ({
    event_type: 'transaction_balance_changed',
    event_data: {
        transaction_id,
        balance: faker.random.number({min: -10000, max: 10000})
    }
});

const createChangeCategoryEvent = (transaction_id) => ({
    event_type: 'transaction_category_changed',
    event_data: {
        transaction_id,
        category: faker.lorem.word()
    }
});

const createChangeLabelCategory = (transaction_id) => ({
    event_type: 'transaction_label_changed',
    event_data: {
        transaction_id,
        label: faker.finance.transactionType()
    }
});

const dataGenerator = async function* (limit = TRANSACTIONS_COUNT) {
    let i = 1;
    while (i <= limit) {
        yield JSON.stringify({
            event_type: 'transaction_created',
            event_data: {
                /*
                creation date is "derived" from id so later when we want to add new events related to this given transaction
                we can make sure it comes logically after it has been created. In a real system, it would be a bit different
                Roughly ~TRANSACTIONS_BY_ACCOUNT_COUNT transaction by account
                 */
                created_at: yearScale(i / TRANSACTIONS_COUNT), // stored as unix timestamp
                transaction_id: i,
                label: faker.finance.transactionType(),
                balance: faker.random.number({min: -20000, max: 20000}), // between -500 euros and +500 euros
                account_id: faker.random.number({min: 1, max: ACCOUNT_COUNT})
            }
        });
        i++;
    }

    /*
    add change category events, change balance, etc. We do it after transactions have been created to make the dataset coherent.
    In practice the whole data set would have more entropy and would be much less predictable.
    (Roughly ~3 sub sequent events for each transaction)
     */

    i = 1;

    while (i <= limit) {
        const transactionId = Math.ceil(Math.random() * TRANSACTIONS_COUNT)
        yield* [
            Math.random() > 0.4 ? createChangeCategoryEvent(transactionId) : createChangeBalanceEvent(transactionId),
            Math.random() > 0.6 ? createChangeCategoryEvent(transactionId) : createChangeLabelCategory(transactionId),
            Math.random() > 0.5 ? createChangeCategoryEvent(transactionId) : createChangeBalanceEvent(transactionId),
        ].map((ev) => JSON.stringify(ev));

        i++;
    }
};

let input = Readable.from(dataGenerator(ACCOUNT_COUNT * TRANSACTIONS_BY_ACCOUNT_COUNT));

if (csv) {
    input = input.pipe(new Transform())
}

input.pipe(outputStream);





