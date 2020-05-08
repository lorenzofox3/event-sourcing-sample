import {BalancePrototype} from '../../common/src/lib/models.js';

export const createBalance = ({month, accountId}) => {
    const transactions = new Map();
    let debit = 0;
    let credit = 0;
    return Object.create(BalancePrototype, {
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

export {createStore} from '../../common/src/lib/models.js';
