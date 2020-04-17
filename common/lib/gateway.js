import assert from 'assert';
import {Pool} from 'pg';
import createSubscriber from 'pg-listen';
import {stream} from '@lorenzofox3/for-await';
import QueryStream from 'pg-query-stream';

export const MONTHS_LIST = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec'
];

const CHANNEL_NAME = 'events';

const monthToIndex = (month) => {
    const index = MONTHS_LIST.indexOf(month);
    if (index === -1) {
        throw new Error(`unknown month ${month}`);
    }
    return index + 1;
}

// todo better connection handling for subscribe/unsubscribe, max subscribers, reconnect, etc
export const createGateway = (sqlQuery) => (opts = {}) => {
    const connections = new Pool(opts);
    const subscriber = createSubscriber(opts);
    const listeners = [];
    let connected = false;
    
    subscriber.events.on('connected', () => {
        connected = true;
    })
    
    subscriber.events.on('error', error => {
        for (const listener of listeners) {
            listener(error, null);
        }
    });
    
    subscriber.notifications.on(CHANNEL_NAME, (ev) => {
        for (const listener of listeners) {
            listener(null, ev);
        }
    });
    
    process.on('exit', () => subscriber.close());
    
    return {
        replay: (accountId, month) => {
            assert(accountId, 'accountId is required');
            assert(month, 'month is required');
            const monthIndex = monthToIndex(month);
            const query = new QueryStream(sqlQuery, [accountId, monthIndex]);
            connections
                .connect()
                .then((client) => {
                    const release = () => client.release();
                    query.on('end', release);
                    query.on('error', release);
                    client.query(query);
                });
            
            return stream(query);
        },
        async subscribe(cb) {
            listeners.push(cb);
            if (!connected) {
                await subscriber.connect();
                await subscriber.listenTo(CHANNEL_NAME);
            }
        }
    }
};
