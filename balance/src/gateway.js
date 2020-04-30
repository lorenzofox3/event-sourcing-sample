import {createGateway as gatewayFactory} from '../../common/src/lib/gateway.js';

export default (opts) => {
    const base = gatewayFactory(opts);
    const replay = base.replay;
    
    return Object.assign(base, {
        replay(...args) {
            return replay(...args)
                .filter((ev) => ev.event_type === 'transaction_created'
                    || ev.event_type === 'transaction_balance_changed');
        }
    });
};

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
