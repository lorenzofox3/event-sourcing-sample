const {createServer} = require('../common/lib/server');
module.exports = createServer((app, opts) => app.use(async (ctx, next) => {
    ctx.body = 'hello gateway';
}));

