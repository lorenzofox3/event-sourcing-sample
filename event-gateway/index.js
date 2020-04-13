const app = require('./app.js');
const {servers: {eventGateway: port}} = require('../conf/index');

app({namespace: 'sample:gateway'}).listen(port);
