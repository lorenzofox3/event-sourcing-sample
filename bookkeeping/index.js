const app = require('./app.js');
const {servers: {bookkeeping: port}} = require('../conf/index');

app({namespace: 'sample:bookkeeping'}).listen(port);
