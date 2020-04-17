const Prototype = {
    get(transactionId) {
        return this.transactions.get(transactionId);
    },
    has(transactionId) {
        return this.transactions.has(transactionId);
    },
    changeBalance(delta) {
        if (delta > 0) {
            this.credit += delta;
        } else {
            this.debit += delta;
        }
        return this;
    },
    add(...transactions) {
        for (const transaction of transactions) {
            this.transactions.set(transaction.transaction_id, transaction);
            this.changeBalance(transaction.balance);
        }
        return this;
    }
}

export const createBalance = ({month, accountId}) => {
    const transactions = new Map();
    let debit = 0;
    let credit = 0;
    return Object.create(Prototype, {
        transactions: {value: transactions},
        accountId: {value: accountId, enumerable: true},
        month: {value: month, enumerable: true},
        debit: {
            get() {
                return debit;
            },
            set(val) {
                debit = val;
            },
            enumerable: true
        },
        credit: {
            get() {
                return credit;
            },
            set(val) {
                credit = val;
            },
            enumerable: true
        },
        balance: {
            get() {
                return debit + credit;
            },
            enumerable: true
        }
    });
};

export {createRegistry} from '../../common/lib/registry.js';
