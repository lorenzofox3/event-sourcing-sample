import {formatAmount, formatShortDate} from '../../../../common/src/lib/util.js';

export const transactionTag = `app-transaction`;

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
