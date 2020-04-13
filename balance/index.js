const app = require('./app.js');
const {servers: {balance: port}} = require('../conf/index');

app({namespace: 'sample:balance'}).listen(port);
