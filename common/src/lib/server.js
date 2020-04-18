import Koa from 'koa';
import cors from '@koa/cors';
import {middleware as schema} from 'koa-json-schema';
import errors from '../middleware/errors.js';
import logger from '../middleware/logger.js';
import timing from '../middleware/server-timing.js';
import {MONTHS_LIST} from './gateway.js';

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

export const createApp = (handler) => (deps = {}, opts = {}) => {
    const app = new Koa();
    app.use(logger(deps));
    app.use(errors(opts.errors));
    app.use(cors(opts.cors));
    app.use(schema(defaultSchema, {
        coerceTypes: true
    }));
    app.use(timing(`handler`));
    handler(app, deps, opts);
    return app;
};
