import {createServer} from 'http';
import {
    createApp as createBookkeepingApp,
    createStore,
    createGateway,
    eventProcessor
} from './src/module.js'
import {servers, db} from '../conf/index.js';
import loggerFactory from '../common/src/lib/logger.js';
import {createApp} from '../common/src/lib/app.js';

const {bookkeeping: opts} = servers;

// create services
const gateway = createGateway(db);
const store = createStore();
const logger = loggerFactory({namespace: 'es:bookkeeping'});

// create server
const bookkeepingApp = createBookkeepingApp({
    gateway, store
});
const appFactory = createApp(bookkeepingApp);
const app = appFactory({...opts, logger});
const server = createServer(app.callback());

// subscribe to even
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
