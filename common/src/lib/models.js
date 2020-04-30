// mixin requires (transactions:Map, debit:int, credit:int)
export const BalancePrototype = {
    get(transactionId) {
        return this.transactions.get(transactionId);
    },
    has(transactionId) {
        return this.transactions.has(transactionId);
    },
    
    changeTransactionBalance(transactionId, newBalance) {
        
        if (!this.has(transactionId)) {
            return this;
        }
        
        const oldBalance = this.transactions.get(transactionId);
        this.credit -= (oldBalance >= 0 ? oldBalance : 0);
        this.debit -= (oldBalance < 0 ? oldBalance : 0);
        this.credit += (newBalance >= 0 ? newBalance : 0);
        this.debit += (newBalance < 0 ? newBalance : 0);
        
        this.transactions.set(transactionId, newBalance);
        
        return this;
    },
    
    add(...transactions) {
        for (const {transaction_id: id, balance} of transactions) {
            this.transactions.set(id, balance);
            this.credit += (balance >= 0 ? balance : 0);
            this.debit += (balance < 0 ? balance : 0);
        }
        return this;
    }
};


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
