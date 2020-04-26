import {formatAmount, formatShortDate} from '../../common/src/lib/util.js';

export const ledgerTag = `app-ledger`;
export const transactionTag = `app-transaction`;

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
        <input aria-controls="transactions-list" type="search" placeholder="id, label, category">
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
        this._transactions = val;
        this._update();
    }
    
    constructor() {
        super();
        this._transactions = [];
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(ledgerTemplate.content.cloneNode(true));
    }
    
    _update() {
        const fragment = document.createDocumentFragment();
        const range = document.createRange();
        const transasctionsListEl = this.shadowRoot.getElementById('transactions-list');
        range.selectNodeContents(transasctionsListEl);
        range.deleteContents();
        for (const transaction of this._transactions) {
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
        transasctionsListEl
            .appendChild(fragment);
    }
}

const transactionTemplate = document.createElement(`template`);
transactionTemplate.innerHTML = `
<style>
    :host{
        display: grid;
        grid-template-columns: auto 1fr var(--amount-column-width, 90px) var(--amount-column-width, 90px);
        grid-template-rows: 1.4em auto 1.4em;
        align-items: center;
        grid-template-areas:
            "date tr-id tr-id tr-id"
            ". label bl-pos bl-neg"
            ". cat cat cat";
        border: 1px solid var(--light-gray);
        padding: var(--layout-padding);
        border-radius: 4px;
    }
    
    #id{
        grid-area: tr-id;
        font-size: smaller;
        font-style: italic;
    }
    
    #id::before{
        content: '#';
    }
    
    #label{
        padding: 0.5em 0;
        color: var(--theme-color);
        font-weight: bold;
        grid-area: label;
    }
    
    
    #balance{
        text-align: right;
        padding: 0.2em;
    }
    #balance.positive{
        background: var(--positive-background, #c8f9ad);
        border-right: 1px dashed gray;
        color: var(--positive-color, #268226);
        grid-area: bl-pos;
    }
    #balance.negative{
        background:var(--negative-background, #ffd9db);
        color: var(--negative-color,#ff3c3c);
        border-left: 1px dashed gray;
        grid-area: bl-neg;
    }
    
    #category{
        grid-area: cat;
        color: #757575;
    }
    
    #date{
        grid-area: date;
        padding: 0.2em 0.8em;
        text-align: right;
        font-size: smaller;
        text-decoration: underline;
    }
    
    #category, #label, #id{
    padding-left: 0.5em;
    
}
</style>
<div id="date"></div>
<div id="id"></div>
<div id="label"></div>
<div id="category"></div>
<div id="balance"></div>
`;

export class Transaction extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({
            mode: 'open'
        });
        this.shadowRoot.appendChild(transactionTemplate.content.cloneNode(true));
    }
    
    get transactionId() {
        return this.getAttribute('transaction-id');
    }
    
    set transactionId(val) {
        this.setAttribute('transaction-id', val || '');
    }
    
    get balance() {
        return this.hasAttribute('balance') ?
            Number(this.getAttribute('balance')) :
            0;
    }
    
    set balance(val) {
        this.setAttribute('balance', val || '0');
    }
    
    get label() {
        return this.getAttribute('label') || '';
    }
    
    set label(val) {
        this.setAttribute('label', val || '');
    }
    
    get category() {
        return this.getAttribute('category') || '';
    }
    
    set category(val) {
        this.setAttribute('category', val || '');
    }
    
    get createdAt() {
        return this.hasAttribute('created-at') ?
            new Date(this.getAttribute('created-at')) :
            null;
    }
    
    set createdAt(val) {
        this.setAttribute('created-at', new Date(val).toDateString());
    }
    
    static get observedAttributes() {
        return [
            'transaction-id',
            'label',
            'category',
            'created-at',
            'balance'
        ];
    }
    
    attributeChangedCallback(name) {
        switch (name) {
            case 'transaction-id':
                this.shadowRoot.getElementById('id').textContent = this.transactionId;
                break;
            case 'label':
                this.shadowRoot.getElementById('label').textContent = this.label;
                break;
            case 'category':
                this.shadowRoot.getElementById('category').textContent = this.category ? `🔖 ${this.category}` : '';
                break;
            case 'balance': {
                const balance = this.shadowRoot.getElementById('balance');
                balance.textContent = formatAmount(this.balance);
                balance.classList.toggle('positive', this.balance >= 0);
                balance.classList.toggle('negative', this.balance < 0);
                break;
            }
            case 'created-at': {
                const createdAt = this.shadowRoot.getElementById('date');
                createdAt.textContent = `${formatShortDate(this.createdAt)}`;
                break;
            }
        }
    }
}
