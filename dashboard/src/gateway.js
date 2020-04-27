import {createGateway as gatewayFactory} from '../../common/src/lib/gateway.js';

export default gatewayFactory(`
SELECT
    *
FROM
    stream_transaction_events($1, $2, $3)
WHERE
    event_type = 'transaction_created'
OR
    event_type = 'transaction_balance_changed'
ORDER BY
    event_id
;`);

export const eventProcessor = (store) => (ev) => {
    const {event_data: data, event_type: type} = ev;
    const balance = store.fromTransaction(data.transaction_id);
    if (balance) {
        switch (type) {
            case 'transaction_created':
                return balance.addTransactions(data);
            case 'transaction_balance_changed':
                return balance.changeTransactionBalance(data.transaction_id, data.balance);
        }
    }
};
