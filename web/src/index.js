import {balance, bookkeeping, dashboard} from './lib/http-client.js';
import {connector} from './lib/utils.js';
import {Balance, balanceTag} from './components/balance/balance-table.js';
import {BalanceHistogram, balanceHistogramTag} from './components/dashboard/balance-histogram.js';
import {Ledger, ledgerTag} from './components/bookkeeping/ledger.js';
import {Bar, barTag} from './components/dashboard/balance-bar.js';
import {Transaction, transactionTag} from './components/bookkeeping/transaction.js';

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
