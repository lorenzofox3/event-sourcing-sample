import basic from 'basic-auth';
import {Context, Next} from 'koa';
import {ApplicationsModel} from '../models/applications.js';
import {InvalidApplicationCredentialsError} from './errors.js';

export default (applications: ApplicationsModel) => async (ctx: Context, next: Next) => {
    // @ts-ignore
    const clientCredentials = basic(ctx);
    if (clientCredentials) {
        const {name: appId, pass: appSecret} = clientCredentials;
        try {
            ctx.state.client = await applications.authenticate(appId, appSecret);
            return next();
        } catch (e) {
            if (!(e instanceof InvalidApplicationCredentialsError)) {
                throw e;
            }
        }
    }

    return ctx.throw(401, null, {
        headers: {
            'WWW-Authenticate': 'Basic'
        }
    });
}
