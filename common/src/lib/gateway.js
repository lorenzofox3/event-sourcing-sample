import {Pool} from 'pg';
import createSubscriber from 'pg-listen';
import {stream} from '@lorenzofox3/for-await';
import QueryStream from 'pg-query-stream';
import {formatISODate} from './util.js';

const CHANNEL_NAME = 'events';
const YEAR = 2019;

const SQL_QUERY = `
SELECT
    *
FROM
    stream_transaction_events($1, $2, $3)
ORDER BY
    event_id
;`;

const SNAPSHOT_SQL_QUERY = `
SELECT
    *
FROM
    stream_transaction_events($1, $2, $3)
WHERE
    created_at <= $4
ORDER BY
    event_id
;`;

// todo better connection handling for subscribe/unsubscribe, max subscribers, reconnect, etc
export const createGateway = (opts = {}) => {
    const connections = new Pool(opts);
    const subscriber = createSubscriber(opts);
    const listeners = [];
    let connected = false;
    
    subscriber.events.on('connected', () => {
        connected = true;
    });
    
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
        replay: (accountId, month, snapshot_date) => {
            const startDate = new Date(YEAR, month, 1);
            const endDate = new Date(YEAR, month + 1, 1);
            const snapshot = snapshot_date ? new Date(snapshot_date) : void 0;
            const sqlQuery = snapshot_date ? SNAPSHOT_SQL_QUERY : SQL_QUERY;
            const queryArgs = [accountId, formatISODate(startDate), formatISODate(endDate)];
            
            if (snapshot) {
                queryArgs.push(formatISODate(snapshot));
            }
            
            const query = new QueryStream(sqlQuery, queryArgs);
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
    };
};
