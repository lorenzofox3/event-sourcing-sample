import {Balance} from '../../balance/src/ui-components.js';
import {Transaction} from '../../bookkeeping/src/ui-components.js';
import {balance, bookkeeping} from './http-client.js';

customElements.define('app-balance', Balance);
customElements.define('app-transaction', Transaction);

const params = new URLSearchParams(document.location.search.substring(1));
const accountId = Number(params.get('account_id'));
const month = params.get('month');

if (!accountId || !month) {
    throw new Error(`you should provide 'month' and 'account_id' through the URL`);
}

(async () => {
    const balanceData = await balance(month, accountId);
    const bookkeepingData = await bookkeeping(month, accountId);
    console.log(bookkeepingData);
    updateBalance(balanceData);
    updateLedger(bookkeepingData);
})();

function updateBalance(state) {
    const balanceEl = document.querySelector('app-balance');
    balanceEl.setAttribute('credit', state.credit);
    balanceEl.setAttribute('debit', state.debit);
}

function updateLedger(state = {transactions: []}) {
    const ledgerEl = document.querySelector('app-ledger');
    const {transactions} = state;
    
    const fragment = document.createDocumentFragment();
    for (const transaction of transactions) {
        const transactionEl = document.createElement('app-transaction');
        transactionEl.transactionId = transaction.id;
        transactionEl.label = transaction.label;
        transactionEl.category = transaction.category;
        transactionEl.balance = transaction.balance;
        
        fragment.appendChild(transactionEl);
    }
    
    ledgerEl.appendChild(fragment);
}

