import app from './app.js';
import createGateway from './gateway.js';
import {createRegistry} from '../../common/lib/registry.js';
import {servers, db} from '../../conf/index.js';
import loggerFactory from '../../common/lib/logger.js';

const {balance: port} = servers;

// create services
const gateway = createGateway(db);
const registry = createRegistry();
const logger = loggerFactory({namespace: 'sample:balance'});

// subscribe from gateway
gateway.subscribe((err, ev) => {
    if (err) {
        logger(err);
        return;
    }
    logger(ev);
})

const options = {logger, gateway, registry};

// start http server
app(options).listen(port, () => {
    logger(`Listening on port:${port}`)
});
