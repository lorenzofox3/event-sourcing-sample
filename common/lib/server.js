import Koa from 'koa';
import errors from '../middleware/errors.js';
import logger from '../middleware/logger.js';
import timing from '../middleware/server-timing.js';
import {middleware as schema} from 'koa-json-schema';
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

export const createApp = (handler) => (opts = {}) => {
    const app = new Koa();
    app.use(logger(opts));
    app.use(errors());
    app.use(schema(defaultSchema, {
        coerceTypes: true
    }));
    app.use(timing(`handler`));
    handler(app, opts);
    return app;
};
