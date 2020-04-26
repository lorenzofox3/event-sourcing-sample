import {createGateway} from '../../common/src/lib/gateway.js';

export default createGateway(`
SELECT
    *
FROM
    stream_events($1, $2)
ORDER BY
    event_id
;`);

export const eventProcessor = (store) => (ev) => {
    const {event_data: data, event_type: type} = ev;
    const ledger = store.fromTransaction(data.transaction_id);
    if (ledger) {
        switch (type) {
            case 'transaction_created':
                return ledger.addTransactions(data);
            case 'transaction_balance_changed':
                return ledger.changeTransactionBalance(data.transaction_id, data.balance);
            case  'transaction_category_changed':
                return ledger.changeTransactionCategory(data.transaction_id, data.category);
            case  'transaction_label_changed':
                return ledger.changeTransactionLabel(data.transaction_id, data.label);
        }
    }
};
