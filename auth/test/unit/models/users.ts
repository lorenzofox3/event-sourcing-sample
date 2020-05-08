import * as crypto from 'crypto';
import {deepEqual} from 'assert';
import {promisify} from 'util';
import {Assert} from 'zora';
import {Connection} from '../../../src/lib/db.js';
import {createUsersModel} from '../../../src/models/users.js';
import {InvalidPasswordError, UserNotFoundError} from '../../../src/lib/errors.js';
import {TokensModel} from '../../../src/models/tokens.js';

const pbkdf2 = promisify(crypto.pbkdf2);

export default (t: Assert) => {
    t.test(`login when no user matches email should throw a UserNotFoundException`, async (t) => {
        // given
        const dbStub = {
            async query(query) {
                return {
                    rows: []
                };
            }
        } as Connection;
        const TokensStub = {} as TokensModel;
        const users = createUsersModel(dbStub, TokensStub);

        // do
        try {
            await users.login('foo@example.com', 'password', 'clientId');
            t.fail('should not get here');
        } catch (e) {
            //expect
            t.ok(e instanceof UserNotFoundError);
        }
    });

    t.test(`login when password is invalid should throw a InvalidPasswordError`, async (t) => {
        // given
        const hash = (await pbkdf2('pass', 'salt', 100000, 64, 'sha512')).toString('hex');
        const dbStub = {
            async query(query) {
                return {
                    rows: [{
                        password_salt: 'salt',
                        password_hash: hash
                    }]
                };
            }
        } as Connection;
        const TokensStub = {} as TokensModel;
        const users = createUsersModel(dbStub, TokensStub);

        // do
        try {
            await users.login('foo@example.com', 'pasz', 'clientId');
            t.fail('should not get here');
        } catch (e) {
            // expect
            t.ok(e instanceof InvalidPasswordError);
        }
    });

    t.test(`login with valid credential should return a signed token`, async (t) => {
        // given
        const hash = (await pbkdf2('pass', 'salt', 100000, 64, 'sha512')).toString('hex');
        const expectedUser = {
            id: '1234',
            email: 'foo@example.com',
            firstname: 'laurent',
            lastname: 'renard'
        };
        const dbStub = {
            async query(query) {
                return {
                    rows: [{
                        ...expectedUser,
                        password_salt: 'salt',
                        password_hash: hash
                    }]
                };
            }
        } as Connection;
        const TokensStub = {
            async createUserToken(user, clientId: string) {
                deepEqual(user, expectedUser);
                return 'token';
            }
        } as TokensModel;
        const users = createUsersModel(dbStub, TokensStub);

        // do
        const token = await users.login('foo@example.com', 'pass', 'clientId');

        // expect
        t.eq(token, 'token');
    });
}
