import {verify as verifyToken, sign as signToken} from 'jsonwebtoken';
import {promisify} from 'util';
import defaultDB from '../lib/db.js';
import cryptoConfig from '../../config/crypto.js';
import {Connection} from '../lib/db.js';
import {User} from './users.js';

const sign = promisify(signToken);
const verify = promisify(verifyToken);

interface TokensModelOption {
    secret: string,
    algorithm?: string; // todo should be enum
}

export type Token = string;

export interface TokensModel {
    createUserToken(user: User, clientId: string): Promise<Token>;

    decodeToken<T>(token: Token, clientId: string): Promise<T>;
}

// todo revoke old token, expiration time etc
export const createTokensModel = (db: Connection, options: TokensModelOption): TokensModel => {
    const {secret, algorithm = 'HS512'} = options;
    return {
        createUserToken(user: User, clientId: string): Promise<Token> {
            // @ts-ignore
            return sign({...user, clientId}, secret, {algorithm});
        },
        decodeToken<T>(token: Token, clientId: string): Promise<T> {
            // @ts-ignore
            return verify(token, secret, {algorithm});
        }
    };
};

export default createTokensModel(defaultDB, {
    secret: cryptoConfig.tokenSecret
});
