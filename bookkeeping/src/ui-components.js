import {formatAmount} from '../../common/src/lib/util.js';

const ledgerTemplate = document.createElement(`template`);

export class Ledger extends HTMLElement {
    constructor() {
        super();
    }
}

const transactionTemplate = document.createElement(`template`);
transactionTemplate.innerHTML = `
<style>
    :host{
        display: grid;
        grid-template-columns: 1fr 80px 80px;
        grid-template-rows: 1.4em auto 1.4em;
        align-items: center;
        grid-template-areas:
            "tr-id tr-id tr-id"
            "label bl-pos bl-neg"
            "cat cat cat";
    }
    
    #id{
        grid-area: tr-id;
        font-size: 0.8em;
        font-style: italic;
    }
    
    #id::before{
        content: '#';
    }
    
    #label{
        padding: 0.5em 0;
        color: #3583e8;
        grid-area: label;
    }
    #balance{
        text-align: right;
    }
    #balance.positive{
        grid-area: bl-pos;
        background: var(--positive-background, #c8f9ad);
        color: var(--positive-color, #268226);
    }
    #balance.negative{
        grid-area: bl-neg;
        background:var(--negative-background, #ffd9db);
        color: var(--negative-color,#ff3c3c);
    }
    
    #category{
        grid-area: cat;
        color: #757575;
    }
    
    #category, #label, #id{
    padding-left: 0.5em;
    
}
</style>
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
    
    static get observedAttributes() {
        return [
            'transaction-id',
            'label',
            'category',
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
                this.shadowRoot.getElementById('category').textContent = this.category;
                break;
            case 'balance': {
                const balance = this.shadowRoot.getElementById('balance');
                balance.textContent = formatAmount(this.balance);
                balance.classList.toggle('positive', this.balance >= 0);
                balance.classList.toggle('negative', this.balance < 0);
                break;
            }
        }
    }
}
