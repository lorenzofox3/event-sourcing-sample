import Koa from 'koa';
import body from 'koa-bodyparser';
// @ts-ignore
import schema from 'koa-jsonschema';
import tokensModel from '../models/tokens.js';
import {User} from '../models/users.js';

const inspectTokenSchema = {
    type: 'object',
    properties: {
        token: {
            type: 'string'
        }
    },
    required: ['token']
};
const defaultModels = {
    tokens: tokensModel
};

// https://tools.ietf.org/html/rfc7662
export const inspectTokenHandler = ({tokens = tokensModel} = defaultModels) => {
    const app = new Koa();
    app.use(body());
    app.use(schema(inspectTokenSchema));
    app.use(async (ctx, next) => {
        const {state, request: {body}} = ctx;
        const clientId = state.client.id;
        const {id: sub, email: username, firstname, lastname} = await tokens.decodeToken<User>(body.token, clientId);
        ctx.body = {
            active: true,
            client_id: clientId,
            username,
            sub,
            firstname,
            lastname
        };
    });
    return app;
};
