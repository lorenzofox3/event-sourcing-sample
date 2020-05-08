import {Connection, default as defaultConnection} from '../lib/db.js';
import SQL from 'sql-template-strings';
import {InvalidApplicationCredentialsError} from '../lib/errors.js';

interface ApplicationResult {
    application_id: string;
    secret: string;
    name: string
}

export interface Application {
    name: string;
    readonly secret: string;
    readonly id: string;
}

export interface ApplicationsModel {
    authenticate(appId: string, appSecret: string): Promise<Application | null>;

    create(application: Application): Promise<Application>;
}

export const createApplication = ({name, application_id, secret}: Partial<ApplicationResult>): Application => Object.defineProperties({name}, {
    id: {value: application_id},
    secret: {value: secret}
});

const createLoginQuery = (id: string, secret: string) => SQL`
SELECT 
    application_id,
    name,
    secret
FROM 
    applications 
WHERE 
    application_id=${id} 
AND 
    application_secret=${secret};
`;

const createInsertQuery = (id: string, name: string, secret: string) => SQL`
INSERT INTO 
    applications(application_id, name, secret)
VALUES
    (${id}, ${name}, ${secret})
RETURNING
    *
;`;

export const createApplicationsModel = (db: Connection): ApplicationsModel => {
    return {
        async authenticate(appId: string, appSecret: string): Promise<Application | null> {
            const result = await db.query<ApplicationResult>(createLoginQuery(appId, appSecret));
            if (!result.rows[0]) {
                throw new InvalidApplicationCredentialsError();
            }
            return createApplication(result.rows[0]);
        },
        async create(application: Application): Promise<Application> {
            const {id, name, secret} = application;
            const result = await db.query<ApplicationResult>(createInsertQuery(id, name, secret));
            return createApplication(result.rows[0]);
        }
    };
};

export default createApplicationsModel(defaultConnection);
