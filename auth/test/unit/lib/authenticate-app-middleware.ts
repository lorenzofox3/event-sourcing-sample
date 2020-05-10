import {Assert} from 'zora';
import Koa from 'koa';
import auth from '../../../src/lib/authenticate-app-middleware.js';
import errorHandler from '../../../src/lib/error-handler-middleware.js';
import {ClientApplicationsModel} from '../../../src/models/client-applications.js';
import request from 'supertest';
import {InvalidApplicationCredentialsError} from '../../../src/lib/errors.js';

export default (t: Assert) => {
    t.test(`no Authorization header is present, should return a 401`, async (t) => {
        // given
        const app = new Koa();
        const applicationsStub = {} as ClientApplicationsModel;
        app.use(auth(applicationsStub));

        // do
        const res = await request(app.callback())
            .get('/');

        // expect
        t.eq(res.status, 401);
        t.eq(res.get('WWW-Authenticate'), 'Basic');
    });

    t.test(`Invalid credentials should return a 401`, async (t) => {
        // given
        const app = new Koa();
        const applicationsStub = <unknown>{
            async authenticate(appId: string, appSecret: string) {
                throw new InvalidApplicationCredentialsError();
            }
        } as ClientApplicationsModel;
        app.use(auth(applicationsStub));

        // do
        const res = await request(app.callback())
            .get('/')
            .auth('foo', 'bar');

        // expect
        t.eq(res.status, 401);
        t.eq(res.get('WWW-Authenticate'), 'Basic');
    });

    t.test(`Uncaught Errors should bubble up`, async (t) => {
        // given
        const app = new Koa();
        const applicationsStub = <unknown>{
            async authenticate(appId: string, appSecret: string) {
                throw new Error(`don't know what is going on`);
            }
        } as ClientApplicationsModel;

        app.use(errorHandler());
        app.use(auth(applicationsStub));

        // do
        const res = await request(app.callback())
            .get('/')
            .auth('foo', 'bar');

        // expect
        t.eq(res.status, 500);
    });

    t.test(`go through if client credentials are ok`, async (t) => {
        // given
        const app = new Koa();
        const applicationsStub = {
            async authenticate(user, password) {
                if (user === 'user' && password === 'password') {
                    return {name: 'myApp'};
                }
                return null;
            }
        } as ClientApplicationsModel;
        app
            .use(auth(applicationsStub))
            .use((ctx, next) => {
                ctx.body = ctx.state.client;
            });

        // do
        const res = await request(app.callback())
            .get('/')
            .auth('user', 'password');

        // expect
        t.eq(res.status, 200);
        t.eq(res.body, {name: 'myApp'});
    });
}
