const {createServer} = require('../common/lib/server');
module.exports = createServer((app, opts) => app.use(async (ctx, next) => {
    await new Promise((resolve) => {
        setTimeout(() => resolve(), 200);
    })
    ctx.body = 'hello bookkeeping';
}));

