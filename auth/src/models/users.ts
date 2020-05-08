import * as crypto from 'crypto';
import {promisify} from 'util';
import SQL from 'sql-template-strings';
import defaultTokensModel from './tokens.js';
import {Connection, default as defaultDB} from '../lib/db.js';
import {InvalidPasswordError, UserNotFoundError} from '../lib/errors.js';
import {Token, TokensModel} from './tokens.js';

const pbkdf2 = promisify(crypto.pbkdf2);

interface UserResult {
    id: string;
    password_hash: string;
    password_salt: string;
    email: string;
    firstname: string;
    lastname: string
}

export type User = Pick<UserResult, 'id' | 'email' | 'firstname' | 'lastname'>;

export interface UsersModel {
    login(email: string, password: string, clientId: string): Promise<Token>;
}

export interface UsersModelOptions {
    hashIterations?: number;
    keyLength?: number;
    hashingAlgorithm?: string;
}

const defaultCryptoOptions = {
    hashIterations: 100000,
    keyLength: 64,
    hashingAlgorithm: 'sha512'
};

const createUser = ({id, email, firstname, lastname}: UserResult): User => ({
    id,
    email,
    firstname,
    lastname
});

const createFetchUserQuery = (email: string) => SQL`
SELECT
    user_id as id,
    password_hash,
    password_salt,
    email,
    firstname,
    lastname
FROM
    users
WHERE
    email=${email}
;`;

export const createUsersModel = (db: Connection, tokens: TokensModel, options: UsersModelOptions = defaultCryptoOptions): UsersModel => {
    const {
        hashIterations = 100000,
        keyLength = 64,
        hashingAlgorithm = 'sha512'
    } = options;

    return {
        async login(email: string, password: string, clientId: string): Promise<Token> {
            const result = await db.query<UserResult>(createFetchUserQuery(email));
            const userRow = result.rows[0];

            if (!userRow) {
                throw new UserNotFoundError(email);
            }

            const passwordAttempt = await pbkdf2(
                password,
                userRow.password_salt,
                hashIterations,
                keyLength,
                hashingAlgorithm
            );

            if (passwordAttempt.toString('hex') !== userRow.password_hash) {
                throw new InvalidPasswordError();
            }

            const user = createUser(userRow);

            return tokens.createUserToken(user, clientId);
        }
    };
};

export default createUsersModel(defaultDB, defaultTokensModel);
