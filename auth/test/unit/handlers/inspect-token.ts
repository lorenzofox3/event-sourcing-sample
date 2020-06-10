import Koa from 'koa';
import {Assert} from 'zora';
import mount from 'koa-mount';
// @ts-ignore
import stub from 'sbuts';
import request from 'supertest';
import {TokensModel} from '../../../src/models/tokens.js';
import {inspectTokenHandler} from '../../../src/handlers/inspect-token.js';

export default (t: Assert) => {
    const validClient = {
        id: 'client_id'
    };

    const createTestRoute = (decodeTokenStub: Function) => {
        const app = new Koa();
        const tokens = <unknown>{
            decodeToken: decodeTokenStub
        } as TokensModel;
        app.use(async (ctx, next) => {
            try {
                ctx.state.client = validClient;
                await next();
            } catch (e) {
                // silence error
                ctx.status = 500;
            }
        });
        app.use(mount(inspectTokenHandler({tokens})));
        return app;
    };

    t.test(`inspect token should return a valid introspection response (url-encoded)`, async (t) => {
        // given
        const user = {
            id: '123',
            email: 'laurent@example.com',
            firstname: 'laurent',
            lastname: 'renard'
        };
        const decodeTokenStub = stub().resolve(user);
        const app = createTestRoute(decodeTokenStub);
        const input = new URLSearchParams();
        input.set('token', 'super_token');

        // do
        const res = await request(app.callback())
            .post('/')
            .send(input.toString())
            .set('Content-Type', 'application/x-www-form-urlencoded');

        // expect
        t.eq(res.status, 200);
        t.eq(res.body, {
            active: true,
            client_id: validClient.id,
            username: user.email,
            sub: user.id,
            firstname: user.firstname,
            lastname: user.lastname
        });
    });
}
