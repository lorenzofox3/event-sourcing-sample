const app = require('./app.js');
const {servers: {dashboard: port}} = require('../conf/index');

app({namespace: 'sample:dashboard'}).listen(port);
