import assert from 'assert';
import {Pool} from 'pg';
import createSubscriber from 'pg-listen';
import {stream} from '@lorenzofox3/for-await';
import QueryStream from 'pg-query-stream';
import {ISOFormatDate} from './util.js';


const CHANNEL_NAME = 'events';
const YEAR = 2019;

// todo better connection handling for subscribe/unsubscribe, max subscribers, reconnect, etc
export const createGateway = (sqlQuery) => (opts = {}) => {
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
        replay: (accountId, month) => {
            assert(accountId, 'accountId is required');
            assert(month, 'month is required');
            const startDate = new Date(YEAR, month, 1);
            const endDate = new Date(YEAR, month + 1, 1);
            const query = new QueryStream(sqlQuery, [accountId, ISOFormatDate(startDate), ISOFormatDate(endDate)]);
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
