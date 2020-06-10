import Koa from 'koa';
import mount from 'koa-mount';
import request from 'supertest';
import {Assert} from 'zora';
// @ts-ignore
import stub from 'sbuts';
import {User, UsersModel} from '../../../src/models/users.js';
import {TokensModel} from '../../../src/models/tokens.js';
import {createTokenHandler} from '../../../src/handlers/create-token.js';
import {InvalidPasswordError, UserNotFoundError} from '../../../src/lib/errors.js';

export default (t: Assert) => {

    const createTestRoute = (loginStub: Function, encodeStub: Function) => {
        const validClient = {
            id: 'client_id'
        };
        const app = new Koa();
        app.use(async (ctx, next) => {
            try {
                ctx.state.client = validClient;
                await next();
            } catch (e) {
                // silence error
                ctx.status = 500;
            }
        });
        const users = {
            async login(email, password, clientId) {
                return loginStub(email, password, clientId);
            }
        } as UsersModel;
        const tokens = <unknown>{
            createUserToken(user: User, clientId: string) {
                return encodeStub(user, clientId);
            }
        } as TokensModel;

        app.use(mount(createTokenHandler({
            users,
            tokens
        })));
        return app;
    };

    t.test(`create token handler should return an access token when provided with valid credentials (url-encoded)`, async (t) => {
        // given
        const validUser = {
            id: '345',
            email: 'laurent@example.com',
            firstname: 'laurent',
            lastname: 'renard'
        };
        const loginStub = stub().resolve(validUser);
        const tokenStub = stub().resolve(`access_token`);
        const app = createTestRoute(loginStub, tokenStub);
        const input = new URLSearchParams();
        input.set('username', 'laurent@example.com');
        input.set('password', 'pass');
        input.set('grant_type', 'password');

        // do
        const res = await request(app.callback())
            .post('/')
            .send(input.toString())
            .set('Content-Type', 'application/x-www-form-urlencoded');

        // expect
        t.eq(res.header.pragma, 'no-cache');
        t.eq(res.header['cache-control'], 'no-store');
        t.eq(res.status, 200);
        t.eq(res.body, {
            access_token: 'access_token',
            token_type: 'Bearer'
        });
        t.eq(loginStub.calls, [['laurent@example.com', 'pass', 'client_id']]);
        t.eq(tokenStub.calls, [[validUser, 'client_id']]);
    });

    t.test(`create token handler should return an access token when provided with valid credentials (json)`, async (t) => {
        // given
        const validUser = {
            id: '345',
            email: 'laurent@example.com',
            firstname: 'laurent',
            lastname: 'renard'
        };
        const loginStub = stub().resolve(validUser);
        const tokenStub = stub().resolve(`access_token`);
        const app = createTestRoute(loginStub, tokenStub);

        // do
        const res = await request(app.callback())
            .post('/')
            .send({
                username: 'laurent@example.com',
                password: 'pass',
                grant_type: 'password'
            })
            .set('Content-Type', 'application/json');

        // expect
        t.eq(res.header.pragma, 'no-cache');
        t.eq(res.header['cache-control'], 'no-store');
        t.eq(res.status, 200);
        t.eq(res.body, {
            access_token: 'access_token',
            token_type: 'Bearer'
        });
        t.eq(loginStub.calls, [['laurent@example.com', 'pass', 'client_id']]);
        t.eq(tokenStub.calls, [[validUser, 'client_id']]);
    });

    t.test(`create token handler should return an error if user can not be found`, async (t) => {
        // given
        const loginStub = stub().throw(new UserNotFoundError('laurent@example.com'));
        const tokenStub = stub(`access_token`);
        const app = createTestRoute(loginStub, tokenStub);

        // do
        const res = await request(app.callback())
            .post('/')
            .send({
                username: 'laurent@example.com',
                password: 'pass',
                grant_type: 'password'
            });

        // expect
        t.eq(res.status, 400);
        t.eq(res.body, {
            error: 'invalid_grant'
        });
        t.eq(loginStub.calls, [['laurent@example.com', 'pass', 'client_id']]);
        t.eq(tokenStub.calls, []);
    });

    t.test(`create token handler should return an error if password is invalid`, async (t) => {
        // given
        const loginStub = stub().throw(new InvalidPasswordError());
        const tokenStub = stub(`access_token`);
        const app = createTestRoute(loginStub, tokenStub);

        // do
        const res = await request(app.callback())
            .post('/')
            .send({
                username: 'laurent@example.com',
                password: 'pass',
                grant_type: 'password'
            });

        // expect
        t.eq(res.status, 400);
        t.eq(res.body, {
            error: 'invalid_grant'
        });
        t.eq(loginStub.calls, [['laurent@example.com', 'pass', 'client_id']]);
        t.eq(tokenStub.calls, []);
    });

    t.test(`create token handler should return an error if password is invalid`, async (t) => {
        // given
        const loginStub = stub().throw(new Error(`unexpected error`));
        const tokenStub = stub(`access_token`);
        const app = createTestRoute(loginStub, tokenStub);

        // do
        const res = await request(app.callback())
            .post('/')
            .send({
                username: 'laurent@example.com',
                password: 'pass',
                grant_type: 'password'
            });

        // expect
        t.eq(res.status, 500);
    });
}
