import SQL from 'sql-template-strings';
import {nanoid} from 'nanoid';
import {Connection, default as defaultConnection} from '../lib/db.js';
import {InvalidApplicationCredentialsError} from '../lib/errors.js';

const createLoginQuery = (id: string, secret: string) => SQL`
SELECT 
    client_id,
    name,
    secret
FROM 
    client_applications
WHERE 
    client_id=${id} 
AND 
    secret=${secret};
`;

const createInsertQuery = (id: string, name: string, secret: string) => SQL`
INSERT INTO 
    client_applications(client_id, name, secret)
VALUES
    (${id}, ${name}, ${secret})
RETURNING
    *
;`;

export const createClientApplication = ({name, client_id, secret}: Partial<ClientApplicationResult>): ClientApplication => Object.defineProperties({name}, {
    id: {value: client_id},
    secret: {value: secret}
});

export const createClientApplicationsModel = (db: Connection): ClientApplicationsModel => {
    return {
        async authenticate(appId: string, appSecret: string): Promise<ClientApplication | null> {
            const result = await db.query<ClientApplicationResult>(createLoginQuery(appId, appSecret));
            if (!result.rows[0]) {
                throw new InvalidApplicationCredentialsError();
            }
            return createClientApplication(result.rows[0]);
        },
        async create(application: ClientApplicationInput): Promise<ClientApplication> {
            const {name} = application;
            const id = nanoid(10);
            const secret = nanoid();
            const result = await db.query<ClientApplicationResult>(createInsertQuery(id, name, secret));
            return createClientApplication(result.rows[0]);
        }
    };
};

export default createClientApplicationsModel(defaultConnection);

interface ClientApplicationResult {
    client_id: string;
    secret: string;
    name: string
}

export interface ClientApplication {
    name: string;
    readonly secret: string;
    readonly id: string;
}

type ClientApplicationInput = Omit<ClientApplication, 'secret' | 'id'>;

export interface ClientApplicationsModel {
    authenticate(appId: string, appSecret: string): Promise<ClientApplication | null>;

    create(application: ClientApplicationInput): Promise<ClientApplication>;
}
