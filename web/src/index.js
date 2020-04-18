import {Balance} from '../../balance/src/ui-components.js';
import {balance} from './http-client.js';

customElements.define('app-balance', Balance);

const params = new URLSearchParams(document.location.search.substring(1));
const accountId = Number(params.get('account_id'));
const month = params.get('month');

if (!accountId || !month) {
    throw new Error(`you should provide 'month' and 'account_id' through the URL`);
}

(async () => {
    const balanceData = await balance(month, accountId);
    updateBalance(balanceData);
})();

function updateBalance(state) {
    const balanceEl = document.querySelector('app-balance');
    balanceEl.setAttribute('credit', state.credit);
    balanceEl.setAttribute('debit', state.debit);
}



