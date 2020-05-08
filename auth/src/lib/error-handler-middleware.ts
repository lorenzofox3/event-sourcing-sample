import {Context, Next} from 'koa';

export default ({logger = console} = {logger: console}) => async (ctx: Context, next: Next) => {
    ctx.status = 200;
    try {
        return next();
    } catch (e) {
        logger.error(e);
        ctx.status = e.status || 500;
    }
}
