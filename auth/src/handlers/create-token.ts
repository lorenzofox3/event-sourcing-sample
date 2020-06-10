import Koa from 'koa';
import body from 'koa-bodyparser';
// @ts-ignore todo ?
import schema from 'koa-jsonschema';
import usersModel from '../models/users.js';
import tokensModel from '../models/tokens.js';
import {InvalidPasswordError, UserNotFoundError} from '../lib/errors.js';

const createTokenSchema = {
    type: 'object',
    properties: {
        grant_type: {
            type: 'string',
            enum: ['password']
        },
        username: {
            type: 'string'
        },
        password: {
            type: 'string'
        }
    },
    required: ['grant_type', 'username', 'password']
};

const defaultModels = {
    users: usersModel,
    tokens: tokensModel
};

// https://tools.ietf.org/html/rfc6749#section-4.3
export const createTokenHandler = ({users = usersModel, tokens = tokensModel} = defaultModels) => {
    const app = new Koa();
    app
        .use(body())
        .use(schema(createTokenSchema))
        .use(async (ctx, next) => {
            const {state, request: {body}} = ctx;
            const clientId = state.client.id;
            try {
                const user = await users.login(body.username, body.password, clientId);
                const token = await tokens.createUserToken(user, clientId);
                ctx.body = {
                    access_token: token,
                    token_type: 'Bearer'
                };
            } catch (e) {
                if (e instanceof UserNotFoundError || e instanceof InvalidPasswordError) {
                    ctx.body = {error: 'invalid_grant'};
                    ctx.status = 400;
                    return;
                }
                throw e;
            }
            return next();
        })
        .use(async (ctx, next) => {
            ctx.set('Pragma', 'no-cache');
            ctx.set('Cache-Control', 'no-store');
        });
    return app;
};
