import Koa from 'koa';
import log from 'log';
import cors from '@koa/cors';
import loggerMiddleware from 'koa-logger';
import errors from '../middleware/errors.js';
import timing from '../middleware/server-timing.js';
import mount from 'koa-mount';
import {MONTHS_LIST} from './util.js';

export const defaultSchema = {
    type: 'object',
    properties: {
        account_id: {
            type: 'integer'
        },
        month: {
            type: 'string',
            enum: MONTHS_LIST
        },
        snapshot_date: {
            type: 'string',
            format: 'date'
        }
    },
    required: ['account_id', 'month']
};

export const createHandlerFromReducer = (reducerFactory) => (gateway, store) => {
    const streamReducer = reducerFactory(gateway);
    return async (ctx) => {
        const {accountId, month, snapshot_date} = ctx.params;
        ctx.body = snapshot_date ?
            await streamReducer(accountId, month, snapshot_date) :
            store.add(
                store.fromTuple(accountId, month) ||
                await streamReducer(accountId, month)
            );
    };
};

export const createApp = (handler) => (opts = {}) => {
    const app = new Koa();
    const {logger = log.get('es:default')} = opts;
    app.use(loggerMiddleware({
        transporter: (str) => logger.log(str)
    }));
    app.use(errors());
    app.use(cors(opts.cors));
    app.use(timing(`handler`));
    app.use(mount(handler));
    return app;
};
