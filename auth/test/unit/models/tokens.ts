import {Assert} from 'zora';
import {sign} from 'jsonwebtoken';
import {createTokensModel} from '../../../src/models/tokens.js';
import {Connection} from '../../../src/lib/db.js';
import {User} from '../../../src/models/users.js';

const dbStub = {} as Connection;

export default (t: Assert) => {
    t.test(`createUserToken should sign a user payload with the clientId`, async (t) => {
        // given
        const tokens = createTokensModel(dbStub, {secret: 'secret'});
        const user: User = {
            id: '123',
            email: 'laurent@foo.com',
            firstname: 'laurent',
            lastname: 'renard'
        };
        const clientId = 'client';

        // do
        const token = await tokens.createUserToken(user, clientId);

        //expect
        t.eq(token, sign({
            ...user,
            clientId
        }, 'secret', {algorithm: 'HS512'}));
    });

    t.test(`decodeToken should returned the signed payload`, async (t) => {
        // given
        const tokens = createTokensModel(dbStub, {secret: 'secret'});
        const user: User = {
            id: '123',
            email: 'laurent@foo.com',
            firstname: 'laurent',
            lastname: 'renard'
        };
        const clientId = 'client';
        const token = sign({
            ...user,
            clientId
        }, 'secret', {algorithm: 'HS512'});

        // do
        const {iat, ...rest} = await tokens.decodeToken(token, clientId);

        //expect
        t.eq(rest, {
            ...user,
            clientId
        });
    });
}
