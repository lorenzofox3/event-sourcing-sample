import {createApp, createHandlerFromReducer} from '../../common/src/lib/app.js';
import {createHistogram} from './models.js';

export const streamReducerFactory = (gateway) => (accountId, month, snapshotDate) => {
    const newHistogram = createHistogram({month, accountId});
    return gateway
        .replay(accountId, month, snapshotDate)
        .reduce((acc, {event_type: type, event_data: ev}) => {
            return type === 'transaction_created' ?
                acc.addTransactions(ev) :
                acc.changeTransactionBalance(ev.transaction_id, ev.balance);
        }, newHistogram);
};

export const handler = createHandlerFromReducer(streamReducerFactory);

export default createApp((app, {gateway, store}) => app.use(handler(gateway, store)));
