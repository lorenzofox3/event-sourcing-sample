import {Balance, balanceTag} from '../../balance/src/ui-components.js';
import {Ledger, ledgerTag, Transaction, transactionTag} from '../../bookkeeping/src/ui-components.js';
import {barTag, balanceHistogramTag, Bar, BalanceHistogram} from '../../dashboard/src/ui-components.js';
import {balance, bookkeeping, dashboard} from './http-client.js';
import {connector} from './utils.js';

const staticBalanceTag = balanceTag + '-static';
const staticBalanceHistogramTag = balanceHistogramTag + '-static';
const staticLedgerTag = ledgerTag + '-static';

customElements.define(staticBalanceTag, Balance);
customElements.define(staticBalanceHistogramTag, BalanceHistogram);
customElements.define(staticLedgerTag, Ledger);
customElements.define(barTag, Bar);
customElements.define(transactionTag, Transaction);
customElements.define(balanceTag, connector(staticBalanceTag, balance, ({credit, debit}) => ({
    credit,
    debit
})));
customElements.define(balanceHistogramTag, connector(staticBalanceHistogramTag, dashboard, ({bins}) => ({bins})));
customElements.define(ledgerTag, connector(staticLedgerTag, bookkeeping, ({transactions}) => ({transactions})));
