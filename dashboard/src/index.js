import app from './app.js';
import createGateway, {eventProcessor} from './gateway.js';
import {createStore} from '../../common/src/lib/models.js';
import {servers, db} from '../../conf/index.js';
import loggerFactory from '../../common/src/lib/logger.js';

const {dashboard: {port}} = servers;

// create services
const gateway = createGateway(db);
const store = createStore();
const logger = loggerFactory({namespace: 'es:dashboard'});
const processEvent = eventProcessor(store);

// subscribe from gateway
gateway.subscribe((err, ev) => {
    if (err) {
        logger(err);
        return;
    }
    processEvent(ev);
    logger(`event ${ev.event_id} processed`);
});

const deps = {logger, gateway, store};

// start http server
app(deps, servers.dashboard).listen(port, () => {
    logger(`Listening on port:${port}`);
});
