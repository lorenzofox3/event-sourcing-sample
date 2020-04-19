import {createGateway} from '../../common/src/lib/gateway.js';

export default createGateway(`
SELECT
    *
FROM
    stream_events($1, $2)
ORDER BY
    event_id
;`);
