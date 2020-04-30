// todo something is wrong with rollup
import {smartTable as st} from '../../../../node_modules/smart-table-core/dist/bundle/smart_table_core.js';
import {debounce} from '../../lib/utils.js';
import {transactionTag} from './transaction.js';

export const ledgerTag = `app-ledger`;

const ledgerTemplate = document.createElement(`template`);
ledgerTemplate.innerHTML = `
<style>

:host{
    display: flex;
    flex-direction: column;
}

#headers{
    border-radius: 4px;
    box-shadow:
    1px 1px 2px 0 var(--light-gray),
    2px 2px 4px 0 var(--light-gray);
    border: 1px solid var(--gray);
    padding: var(--layout-padding);
}

label{
    padding: var(--layout-padding) 0;
    display: flex;
    align-items: center;
}

label > :first-child{
    padding-right: var(--layout-padding);
}

label > :first-child::after{
    content: ':';
}

input {
    outline: none;
    transition: all 0.3s;
    border: 1px solid currentColor;
    font-size: 0.95em;
    padding: 4px;
}

input:focus{
  flex-grow: 1;
  border-color: var(--theme-color);
  box-shadow: 0 0 4px 0 var(--theme-color);
}

h2{
    margin: 0;
    font-size: larger;
}

h2 > * {
    display:inline-block;
    background-image: linear-gradient(to right, var(--theme-color), transparent);
    background-repeat: no-repeat;
    background-size: 100% 5px;
    background-position-y: bottom;
}

ul{
    padding: 0 var(--layout-padding);
    margin: 0;
    list-style: none;
    overflow: scroll;
}

li {
    padding: var(--layout-padding) 0;
}


</style>
<div id="headers">
    <h2 id="title"><span>Transactions list</span></h2>
    <label>
        <span>Search</span>
        <input id="search-input" aria-controls="transactions-list" type="search" placeholder="id, label, category">
    </label>
</div>
<div id="separator"></div>
<ul aria-labelledby="title" id="transactions-list">
</ul>`;

export class Ledger extends HTMLElement {
    
    get transactions() {
        return this._transactions;
    }
    
    set transactions(val) {
        // keep the same ref
        this._transactions.splice(0);
        this._transactions.push(...val);
        this._smartTable.exec();
    }
    
    search(val) {
        this._smartTable.search({
            value: val,
            scope: [
                'label',
                'category',
                'id'
            ],
            flags: 'i'
        });
    }
    
    constructor() {
        super();
        this._transactions = [];
        this._smartTable = st({
            data: this._transactions
        });
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(ledgerTemplate.content.cloneNode(true));
    }
    
    connectedCallback() {
        this._smartTable.onDisplayChange((newData) => {
            const values = newData.map(({value}) => value);
            const range = document.createRange();
            const transactionsListEl = this.shadowRoot.getElementById('transactions-list');
            range.selectNodeContents(transactionsListEl);
            range.deleteContents();
            transactionsListEl.appendChild(createTransactionList(values));
        });
        
        const input = this.shadowRoot
            .getElementById('search-input');
        
        input.addEventListener('input', debounce(() => {
            this.search(input.value);
        }));
    }
}

const createTransactionList = (transactions) => {
    const fragment = document.createDocumentFragment();
    for (const transaction of transactions) {
        const li = document.createElement('li');
        const transactionEl = document.createElement(transactionTag);
        transactionEl.transactionId = transaction.id;
        transactionEl.label = transaction.label;
        transactionEl.category = transaction.category;
        transactionEl.balance = transaction.balance;
        transactionEl.createdAt = transaction.createdAt;
        li.appendChild(transactionEl);
        fragment.appendChild(li);
    }
    return fragment;
};
