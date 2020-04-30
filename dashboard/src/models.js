import {BalancePrototype} from '../../common/src/lib/models.js';

const HistogramPrototype = {
    get(transactionId) {
        return this.bins.find(bin => bin.get(transactionId));
    },
    has(transactionId) {
        return this.bins.some(bin => bin.has(transactionId));
    },
    [Symbol.iterator]() {
        return this.bins[Symbol.iterator]();
    },
    addTransactions(...transactions) {
        for (const tr of transactions) {
            const day = new Date(tr.created_at).getDate();
            this.bins[day - 1].add(tr);
        }
        return this;
    },
    
    changeTransactionBalance(transactionId, newBalance) {
        const bin = this.bins.find((b) => b.has(transactionId));
        if (bin) {
            bin.changeTransactionBalance(transactionId, newBalance);
        }
        return this;
    }
};

const createBin = ({day}) => {
    const transactions = new Map();
    let debit = 0;
    let credit = 0;
    
    return Object.create(BalancePrototype, {
        transactions: {value: transactions},
        day: {value: day, enumerable: true},
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
        }
    });
};

// month being 0 indexed
const getNumberOfDayInMonth = (month, year = 2019) => {
    return new Date(year, month + 1, 0).getDate();
};

export const createHistogram = ({month, accountId}) => {
    const daysCount = getNumberOfDayInMonth(month);
    const bins = new Array(daysCount)
        .fill(null)
        .map((_, i) => createBin({day: i + 1}));
    
    return Object.create(HistogramPrototype, {
        bins: {
            get() {
                return bins;
            },
            enumerable: true
        },
        month: {value: month, enumerable: true},
        accountId: {value: accountId, enumerable: true}
    });
};
