import * as crypto from 'crypto';
import {promisify} from 'util';
import SQL from 'sql-template-strings';
import {nanoid} from 'nanoid';
import {Connection, default as defaultDB} from '../lib/db.js';
import {InvalidPasswordError, UserAlreadyExistsError, UserNotFoundError} from '../lib/errors.js';

const pbkdf2 = promisify(crypto.pbkdf2);
const randomBytes = promisify(crypto.randomBytes);

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

const createInsertUserQuery = (user: UserResult) => SQL`
INSERT INTO
    users(
        user_id,
        password_hash,
        password_salt,
        email,
        firstname,
        lastname
    )
VALUES(
    ${user.id}, 
    ${user.password_hash}, 
    ${user.password_salt}, 
    ${user.email}, 
    ${user.firstname}, 
    ${user.lastname}
)
RETURNING
    user_id as id,
    password_hash,
    password_salt,
    email,
    firstname,
    lastname
;`;

export const createUsersModel = (db: Connection, options: UsersModelOptions = defaultCryptoOptions): UsersModel => {
    const {
        hashIterations = 100000,
        keyLength = 64,
        hashingAlgorithm = 'sha512'
    } = options;

    const hashPassword = async (password: string, salt: string) => {
        return (await pbkdf2(
            password,
            salt,
            hashIterations,
            keyLength,
            hashingAlgorithm
        )).toString('hex');
    };

    return {
        async login(email: string, password: string, clientId: string): Promise<User> {
            const result = await db.query<UserResult>(createFetchUserQuery(email));
            const userRow = result.rows[0];

            if (!userRow) {
                throw new UserNotFoundError(email);
            }

            const passwordAttempt = await hashPassword(password, userRow.password_salt);

            if (passwordAttempt !== userRow.password_hash) {
                throw new InvalidPasswordError();
            }

            return createUser(userRow);
        },

        async create(user: UserInput) {

            const existingUser = await db.query(createFetchUserQuery(user.email));

            if (existingUser.rows.length) {
                throw new UserAlreadyExistsError(user.email);
            }

            const id = nanoid();
            const password_salt = (await randomBytes(256)).toString('hex');
            const password_hash = await hashPassword(user.password, password_salt);

            const result = await db.query<UserResult>(createInsertUserQuery({
                id,
                password_salt,
                password_hash,
                ...user
            }));

            return createUser(result.rows[0]);
        }
    };
};

export default createUsersModel(defaultDB);

interface UserResult {
    id: string;
    password_hash: string;
    password_salt: string;
    email: string;
    firstname: string;
    lastname: string
}

export type User = Omit<UserResult, 'password_hash' | 'password_salt'>;

type UserInput = Omit<User, 'id'> & { password: string };

export interface UsersModel {
    login(email: string, password: string, clientId: string): Promise<User>;

    create(user: UserInput): Promise<User>;
}

export interface UsersModelOptions {
    hashIterations?: number;
    keyLength?: number;
    hashingAlgorithm?: string;
}
