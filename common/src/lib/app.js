import Koa from 'koa';
import cors from '@koa/cors';
import {middleware as schema} from 'koa-json-schema';
import errors from '../middleware/errors.js';
import logger from '../middleware/logger.js';
import timing from '../middleware/server-timing.js';

export const MONTHS_LIST = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec'
];

const monthToIndex = (month) => {
    const index = MONTHS_LIST.indexOf(month);
    if (index === -1) {
        throw new Error(`unknown month ${month}`);
    }
    return index + 1;
};

const defaultSchema = {
    type: 'object',
    properties: {
        account_id: {
            type: 'integer'
        },
        month: {
            type: 'string',
            enum: MONTHS_LIST
        }
    },
    required: ['account_id', 'month']
};

export const createHandlerFromReducer = (reducerFactory) => (gateway, store) => {
    const streamReducer = reducerFactory(gateway);
    return async (ctx, next) => {
        const {accountId, month} = ctx.params;
        ctx.body = store.add(
            store.fromTuple(accountId, month) ||
            await streamReducer(accountId, month)
        );
    };
};

export const createApp = (handler) => (deps = {}, opts = {}) => {
    const app = new Koa();
    app.use(logger(deps));
    app.use(errors(opts.errors));
    app.use(cors(opts.cors));
    app.use(schema(defaultSchema, {
        coerceTypes: true
    }));
    app.use(async (ctx, next) => {
        const {account_id, month} = ctx.request.query;
        ctx.params = {
            accountId: Number(account_id),
            month: monthToIndex(month)
        };
        await next();
    });
    app.use(timing(`handler`));
    handler(app, deps, opts);
    return app;
};
