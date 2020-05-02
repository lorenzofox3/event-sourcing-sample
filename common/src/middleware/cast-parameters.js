import {monthToIndex} from '../lib/util.js';

export default () => async (ctx, next) => {
    const {account_id, month, snapshot_date} = ctx.request.query;
    ctx.params = {
        accountId: Number(account_id),
        month: monthToIndex(month)
    };
    
    if (snapshot_date) {
        ctx.params.snapshot_date = new Date(snapshot_date);
    }
    
    await next();
}
