import {createApp} from '../../common/lib/server.js';
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


export const handler = (gateway, registry) => {
    const reduceStream = streamReducerFactory(gateway);
    return async (ctx, next) => {
        const {account_id, month} = ctx.request.query;
        ctx.body = registry.add(
            registry.fromTuple(account_id, month) ||
            await reduceStream(account_id, month)
        );
    };
};

export default createApp((app, {gateway, registry}) =>
    app.use(handler(gateway, registry)));

