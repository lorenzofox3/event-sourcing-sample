import {Assert} from 'zora';
import {createApplication, createApplicationsModel} from '../../../src/models/applications.js';
import {Connection} from '../../../src/lib/db.js';
import {InvalidApplicationCredentialsError} from '../../../src/lib/errors.js';

export default (t: Assert) => {
    t.test(`createApplication should make id and secret non enumerable`, (t) => {
        // given
        const input = {
            name: 'foo',
            application_id: 'abc',
            secret: 'cde'
        };

        // do
        const output = createApplication(input);

        // expect
        t.eq(output.id, input.application_id);
        t.eq(output.secret, input.secret);
        t.eq(output.name, input.name);
        t.eq(JSON.stringify(output), JSON.stringify({name: 'foo'}));
    });

    t.test(`authenticate should return the application if credentials are valid`, async (t) => {
        // given
        const myApp = {
            application_id: '123',
            name: 'myApp',
            secret: 'someSecret'
        };
        const dbStub = {
            async query(_: any) {
                return {
                    rows: [myApp]
                };
            }
        } as Connection;
        const applications = createApplicationsModel(dbStub);

        //do
        const app = await applications.authenticate('appId', 'appsecret');

        //expect
        // @ts-ignore
        t.eq(app, {
            name: 'myApp'
        });
    });

    t.test(`authenticate should throw InvalidApplicationCredentialsError if credentials are not valid`, async (t) => {
        // given
        const dbStub = {
            async query(_: any) {
                return {
                    rows: []
                };
            }
        } as Connection;
        const applications = createApplicationsModel(dbStub);

        //do
        try {
            await applications.authenticate('appId', 'appsecret');
            t.fail('should not get there');
        } catch (e) {
            // expect
            t.ok(e instanceof InvalidApplicationCredentialsError);
        }
    });

    t.test(`create should return the newly created application`, async (t) => {
        // given
        const application = {
            id: '123',
            name: 'myAppBis',
            secret: 'secret'
        };
        const dbStub = {
            async query(query) {
                return {
                    rows: [application]
                };
            }
        } as Connection;
        const applications = createApplicationsModel(dbStub);

        // do
        const app = await applications.create(application);

        //expect
        // @ts-ignore
        t.eq(app, {
            name: application.name
        });
    });
}