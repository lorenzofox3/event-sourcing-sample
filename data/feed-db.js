import {Readable} from 'stream';
import {Transform} from "json2csv";
import faker from "faker";

const toCsv = new Transform();

const ACCOUNT_COUNT = 10000;
const TRANSACTIONS_BY_ACCOUNT = 1000;

const dataGenerator = async function* (limit = 10) {
    let i = limit;
    while (i > 0) {
        yield JSON.stringify({
            event_data: {
                created_at: faker.date.between('01-01-2019', '01-01-2020'),
                transaction_id: i,
                category: faker.lorem.word(),
                balance: faker.random.number({min: -50000, max: 50000}),
                account_id: faker.random.number({min: 1, max: 10000})
            }
        });
        i--;
    }
};

const stream = Readable.from(dataGenerator(ACCOUNT_COUNT * TRANSACTIONS_BY_ACCOUNT));

stream
    .pipe(toCsv)
    .pipe(process.stdout);





