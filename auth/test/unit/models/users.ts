import * as crypto from 'crypto';
import {promisify} from 'util';
import {Assert} from 'zora';
import {Connection} from '../../../src/lib/db.js';
import {createUsersModel} from '../../../src/models/users.js';
import {InvalidPasswordError, UserAlreadyExistsError, UserNotFoundError} from '../../../src/lib/errors.js';

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
        const users = createUsersModel(dbStub);

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
        const users = createUsersModel(dbStub);

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
        const users = createUsersModel(dbStub);

        // do
        const user = await users.login('foo@example.com', 'pass', 'clientId');

        // expect
        t.eq(user, expectedUser);
    });

    t.test(`create with already existing user should throw UserAlreadyExisting`, async (t) => {
        // given
        const dbStub = <unknown>{
            async query() {
                return {
                    rows: [{
                        email: 'email@example.com'
                    }]
                };
            }
        } as Connection;
        const users = createUsersModel(dbStub);

        // do
        try {
            await users.create({
                email: 'email@example.com',
                password: 'pass',
                firstname: 'laurent',
                lastname: 'renard'
            });
            t.fail(`should not get here`);
        } catch (e) {
            //expect
            t.ok(e instanceof UserAlreadyExistsError);
        }
    });

    t.test(`create with non existing email should create a new user`, async (t) => {
        // given
        const user = {
            email: 'email@example.com',
            password: 'pass',
            firstname: 'laurent',
            lastname: 'renard'
        };
        let dbCalls = 0;
        const dbStub = <unknown>{
            async query() {
                if (dbCalls === 0) {
                    dbCalls++;
                    return {
                        rows: [] as unknown[]
                    };
                }

                return {
                    rows: [{
                        id: 'asdf',
                        password_hash: 'asdfdsf',
                        password_salt: 'adsfadsfd',
                        email: user.email,
                        firstname: user.firstname,
                        lastname: user.lastname
                    }]
                };
            }
        } as Connection;
        const users = createUsersModel(dbStub);

        // do
        const {id, ...newUser} = await users.create(user);

        // expect
        t.ok(id);
        t.eq(newUser, {
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname
        });
    });

}
