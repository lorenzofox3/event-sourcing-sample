import clientFactory from '../../common/src/lib/http-client.js';

// for the browser
const client = clientFactory();

export const balance = client(__BALANCE_PUBLIC__);
