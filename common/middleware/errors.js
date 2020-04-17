export default () => async (ctx, next) => {
    ctx.status = 200;
    try {
        await next();
    } catch (e) {
        console.error(e);
        ctx.status = e.status || 500;
    }
};
