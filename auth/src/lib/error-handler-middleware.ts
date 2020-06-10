import {Context, Next} from 'koa';

export default ({logger = console} = {logger: console}) => async (ctx: Context, next: Next) => {
    ctx.status = 200;
    try {
        await next();
    } catch (e) {
        ctx.status = e.status || 500;
        logger.error(e);
    }
}
