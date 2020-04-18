const {createApp} = require('../common/src/lib/server');
module.exports = createApp((app, opts) => app.use(async (ctx, next) => {
    await new Promise((resolve) => {
        setTimeout(() => resolve(), 200);
    })
    ctx.body = 'hello bookkeeping';
}));

