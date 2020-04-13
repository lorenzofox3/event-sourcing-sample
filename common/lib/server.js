const Koa = require('koa');
const errors = require('../middleware/errors');
const logger = require('../middleware/logger');
const timing = require('../middleware/server-timing');

exports.createServer = (handler) => (opts = {}) => {
    const app = new Koa();
    app.use(logger(opts));
    app.use(errors());
    app.use(timing(`handler`));
    handler(app, opts);
    return app;
};
