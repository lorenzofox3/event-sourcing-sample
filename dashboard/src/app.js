import Koa from 'koa';
import {createHandlerFromReducer, defaultSchema} from '../../common/src/lib/app.js';
import cast from '../../common/src/middleware/cast-parameters.js';
import {createHistogram} from './models.js';
import {middleware as schema} from 'koa-json-schema';

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

export default ({gateway, store}) => {
    const app = new Koa();
    app.use(schema(defaultSchema, {
        coerceTypes: true
    }));
    app.use(cast());
    app.use(handler(gateway, store));
    return app;
}


