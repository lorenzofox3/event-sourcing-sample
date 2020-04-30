import {createApp, createHandlerFromReducer} from '../../common/src/lib/app.js';
import {createBalance} from './models.js';

export const streamReducerFactory = gateway => (accountId, month, snapshot_date) => {
    const newBalance = createBalance({
        month,
        accountId
    });
    return gateway
        .replay(accountId, month, snapshot_date)
        .reduce((acc, {event_type: type, event_data: ev}) => {
            return type === 'transaction_created' ?
                acc.add(ev) :
                acc.changeTransactionBalance(ev.transaction_id, ev.balance);
        }, newBalance);
};


export const handler = createHandlerFromReducer(streamReducerFactory);

export default createApp((app, {gateway, store}) =>
    app.use(handler(gateway, store)));

