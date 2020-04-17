import koaLogger from 'koa-logger';

export default (opts) => {
    return koaLogger({
        transporter: (str, args) => {
            opts.logger(str);
        }
    });
};
