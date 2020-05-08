import {createServer} from 'http';
import {
    createApp as createDashboardApp,
    createStore,
    eventProcessor,
    createGateway
} from './src/module.js';
import loggerFactory from '../common/src/lib/logger.js';
import {createApp} from '../common/src/lib/app.js';
import {servers, db} from '../conf/index.js';

const {dashboard: opts} = servers;

// create services
const gateway = createGateway(db);
const store = createStore();
const logger = loggerFactory({namespace: 'es:dashboard'});

// create server
const dashboardApp = createDashboardApp({gateway, store});
const appFactory = createApp(dashboardApp);
const app = appFactory({...opts, logger});
const server = createServer(app.callback());

// subscribe from gateway
const processEvent = eventProcessor(store);

gateway.subscribe((err, ev) => {
    if (err) {
        logger.error(err);
        return;
    }
    processEvent(ev);
    logger.log(`event ${ev.event_id} processed`);
});

server.on('close', () => {
    gateway.close();
});


// start http server
server.listen(opts, () => {
    logger.log(`listening on port ${opts.port}`);
});
