export const createTransaction = (input = {}) => {
    let {label, balance = 0, category} = input;
    const {createdAt, id} = input;
    
    return Object.defineProperties({}, {
        id: {value: id, enumerable: true},
        createdAt: {value: createdAt, enumerable: true},
        label: {
            get() {
                return label;
            },
            set(v) {
                label = v;
            },
            enumerable: true
        },
        balance: {
            get() {
                return balance;
            },
            set(v) {
                balance = v;
            },
            enumerable: true
        },
        category: {
            get() {
                return category;
            },
            set(v) {
                category = v;
            },
            enumerable: true
        }
    });
};

const LedgerPrototype = {
    [Symbol.iterator]() {
        return this._transactions.values();
    },
    addTransactions(...transactions) {
        for (const transaction of transactions) {
            const {transaction_id: id, created_at: createdAt, label, category, balance = 0} = transaction;
            this._transactions.set(id, createTransaction({
                id,
                label,
                category,
                balance,
                createdAt:new Date(createdAt)
            }));
        }
        return this;
    },
    changeTransactionBalance(transactionId, delta) {
        if (this._transactions.has(transactionId)) {
            const tr = this._transactions.get(transactionId);
            tr.balance += Number(delta);
        }
        return this;
    },
    changeTransactionCategory(transactionId, category) {
        if (this._transactions.has(transactionId)) {
            const tr = this._transactions.get(transactionId);
            tr.category = category;
        }
        return this;
    },
    changeTransactionLabel(transactionId, label) {
        if (this._transactions.has(transactionId)) {
            const tr = this._transactions.get(transactionId);
            tr.label = label;
        }
        return this;
    }
};

export const createLedger = ({month, accountId}) => {
    const transactions = new Map();
    return Object.create(LedgerPrototype, {
        accountId: {value: accountId, enumerable: true},
        month: {value: month, enumerable: true},
        _transactions: {value: transactions},
        transactions: {
            get() {
                return [...this];
            },
            enumerable: true
        }
    });
};
