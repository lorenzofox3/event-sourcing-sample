export const createStore = () => {
    const items = [];
    return {
        fromTransaction(transactionId) {
            return items.find(item => item.has(transactionId));
        },
        fromTuple(accountId, month) {
            return items.find(item => item.month === month && item.accountId === accountId);
        },
        add(item) {
            items.push(item);
            return item;
        }
    };
};
