import {createServer} from 'http';
import {
    createApp as createBalanceApp,
    createGateway,
    eventProcessor,
    createStore
} from './src/module.js';
import {servers, db} from '../conf/index.js';
import {createApp} from '../common/src/lib/app.js';
import loggerFactory from '../common/src/lib/logger.js';

const {balance: opts} = servers;

// create services
const gateway = createGateway(db);
const store = createStore();
const logger = loggerFactory({namespace: 'es:balance'});

// create server
const balanceApp = createBalanceApp({gateway, store});
const appFactory = createApp(balanceApp);
const app = appFactory({...opts, logger});
const server = createServer(app.callback());

// subscribe to events
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


server.listen(opts.port, () => {
    logger.log(`listening on port ${opts.port}`);
});
