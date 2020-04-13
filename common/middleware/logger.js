const logger = require('koa-logger');

module.exports = (opts = {}) => {
    const debug = opts.namespace ? require('debug')(opts.namespace) : console.log;
    return logger({
        transporter: (str, args) => {
            debug(str);
        }
    });
};
