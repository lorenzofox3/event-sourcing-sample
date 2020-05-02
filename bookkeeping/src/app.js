import {createApp, createHandlerFromReducer, defaultSchema} from '../../common/src/lib/app.js';
import {createLedger} from './models.js';
import Koa from 'koa';
import {middleware as schema} from 'koa-json-schema'
import cast from '../../common/src/middleware/cast-parameters.js';

export const streamReduceFactory = (gateway) => (accountId, month, snapshotId) => {
    const newLedger = createLedger({month, accountId});
    return gateway
        .replay(accountId, month, snapshotId)
        .reduce((ledger, {event_type, event_data: ev}) => {
            switch (event_type) {
                case 'transaction_created':
                    return ledger.addTransactions(ev);
                case 'transaction_balance_changed':
                    return ledger.changeTransactionBalance(ev.transaction_id, ev.balance);
                case 'transaction_category_changed':
                    return ledger.changeTransactionCategory(ev.transaction_id, ev.category);
                case 'transaction_label_changed':
                    return ledger.changeTransactionLabel(ev.transaction_id, ev.label);
                default:
                    return ledger;
            }
        }, newLedger);
};

export const handler = createHandlerFromReducer(streamReduceFactory);

export default ({gateway, store}) => {
    const app = new Koa();
    app.use(schema(defaultSchema, {
        coerceTypes: true
    }));
    app.use(cast());
    app.use(handler(gateway, store));
    return app;
}
