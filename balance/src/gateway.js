import {createGateway as gatewayFactory} from '../../common/src/lib/gateway.js';

export default gatewayFactory(`
SELECT
    *
FROM
    stream_events($1, $2)
WHERE
    event_type = 'transaction_created'
OR
    event_type = 'transaction_balance_changed'
ORDER BY
    event_id
;`);
