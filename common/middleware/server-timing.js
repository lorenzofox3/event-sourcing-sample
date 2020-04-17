const SERVER_TIMING_HEADER = 'Server-Timing';
export default (name = 'handler') => async (ctx, next) => {
    const now = Date.now();
    await next();
    const header_value = ctx.get(SERVER_TIMING_HEADER)
        .split(',')
        .filter(v => !!v);
    header_value.push(`${name};dur=${Date.now() - now}`);
    const new_header_value = header_value.join(', ');
    ctx.set(SERVER_TIMING_HEADER, new_header_value);
};
