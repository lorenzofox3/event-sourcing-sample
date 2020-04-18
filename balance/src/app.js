import {createApp} from '../../common/src/lib/server.js';
import {createBalance} from './models.js';

export const streamReducerFactory = gateway => (accountId, month) => {
    const newBalance = createBalance({
        month,
        accountId
    });
    return gateway
        .replay(accountId, month)
        .reduce((acc, {event_type: type, event_data}) => {
            return type === 'transaction_created' ?
                acc.add(event_data) :
                acc.changeBalance(event_data.delta);
        }, newBalance);
};


export const handler = (gateway, store) => {
    const reduceStream = streamReducerFactory(gateway);
    return async (ctx, next) => {
        const {account_id, month} = ctx.request.query;
        ctx.body = store.add(
            store.fromTuple(account_id, month) ||
            await reduceStream(account_id, month)
        );
    };
};

export default createApp((app, {gateway, store}) =>
    app.use(handler(gateway, store)));

