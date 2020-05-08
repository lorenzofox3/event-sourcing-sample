import {createServer} from 'http';
import Koa from 'koa';
import mount from 'koa-mount';
import {db} from './accounting/conf/index.js';
import {
    createApp as createBalanceApp,
    createStore as createBalanceStore,
    eventProcessor as balanceProcessor,
    createGateway as createBalanceGateway
} from './accounting/balance/src/module.js';
import {
    createApp as createBookkeepingApp,
    createStore as createBookkeepingStore,
    createGateway as createBookkeepingGateway,
    eventProcessor as bookkeepingProcessor
} from './accounting/bookkeeping/src/module.js';
import {
    createApp as createDashboardApp,
    createStore as createDashboardStore,
    createGateway as createDashboardGateway,
    eventProcessor as dashboardProcessor
} from './accounting/dashboard/src/module.js';

import {createGateway} from './accounting/common/src/lib/gateway.js';
import {createApp} from './accounting/common/src/lib/app.js';
import loggerFactory from './accounting/common/src/lib/logger.js';

const logger = loggerFactory();

//gateways
const balanceGateway = createBalanceGateway(db);
const bookkeepingGateway = createBookkeepingGateway(db);
const dashboardGateway = createDashboardGateway(db);

//stores
const balanceStore = createBalanceStore();
const bookkeepingStore = createBookkeepingStore();
const dashboardStore = createDashboardStore();

// apps
const balanceApp = createBalanceApp({gateway: balanceGateway, store: balanceStore});
const bookkeepingApp = createBookkeepingApp({gateway: bookkeepingGateway, store: bookkeepingStore});
const dashboardApp = createDashboardApp({gateway: dashboardGateway, store: dashboardStore});

// server
const app = new Koa();
app.use(mount('/balance', balanceApp));
app.use(mount('/bookkeeping', bookkeepingApp));
app.use(mount('/dashboard', dashboardApp));
app.use((ctx) => ctx.throw(404));

const server = createServer(createApp(app)({logger, cors: '*'}).callback());

// process events
const defaultGateway = createGateway(db);
const balanceProcess = balanceProcessor(balanceStore);
const dashboardProcess = dashboardProcessor(dashboardStore);
const bookkeepingProcess = bookkeepingProcessor(bookkeepingStore);

defaultGateway.subscribe((err, ev) => {
    if (err) {
        return logger.error(err);
    }
    balanceProcess(ev);
    dashboardProcess(ev);
    bookkeepingProcess(ev);
    logger.log(`event ${ev.event_id} has been processed`);
});


//process events
const processEvent = (processor, gateway) => {
    gateway.subscribe((err, ev) => {
        if (err) {
            logger.error(err);
            return;
        }
        processor(ev);
        logger.log(`event ${ev.event_id} processed`);
    });
    
    server.on('close', () => {
        gateway.close();
    });
};

const port = process.env.SERVER_PORT || 3000;
server.listen(port, () => {
    logger.log(`server listening on port ${port}`);
});

