import {createHandlerFromReducer, defaultSchema} from '../../common/src/lib/app.js';
import {createBalance} from './models.js';
import Koa from 'koa';
import {middleware as schema} from 'koa-json-schema';
import cast from '../../common/src/middleware/cast-parameters.js';

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

export default ({gateway, store}) => {
    const app = new Koa();
    app.use(schema(defaultSchema, {
        coerceTypes: true
    }));
    app.use(cast());
    app.use(handler(gateway, store));
    return app;
}
