import app from './app.js';
import createGateway from './gateway.js';
import {createStore} from '../../common/src/lib/store.js';
import {servers, db} from '../../conf/index.js';
import loggerFactory from '../../common/src/lib/logger.js';

const {balance: {port}} = servers;

// create services
const gateway = createGateway(db);
const store = createStore();
const logger = loggerFactory({namespace: 'sample:balance'});

// subscribe from gateway
gateway.subscribe((err, ev) => {
    if (err) {
        logger(err);
        return;
    }
    logger(ev);
});

const deps = {logger, gateway, store};

// start http server
app(deps, servers.balance).listen(port, () => {
    logger(`Listening on port:${port}`);
});
