import {formatAmount} from '../../../../common/src/lib/util.js';

const template = document.createElement(`template`);

// language=HTML
template.innerHTML = `
<style>

:host{
    padding: var(--layout-padding);
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

.positive{
    background: var(--positive-background, #c8f9ad);
    color: var(--positive-color, #268226);
    grid-column: 2;
    border-right: 1px dashed var(--gray, gray);
}

.negative{
    background:var(--negative-background, #ffd9db);
    color: var(--negative-color,#ff3c3c);
    grid-column: 3;
    border-left: 1px dashed var(--gray, gray);
}

#balance-row{
    font-weight: bolder;
}

[role=cell]{
    text-align: right;
}

[role=rowheader]{
    text-align: right;
    padding-right: 0.5em;
}

[role=rowheader]::after{
    content: ':';
}

[role=row]{
    display: grid;
    padding: 0.2em 0;
    grid-template-columns: 1fr var(--amount-column-width, 90px) var(--amount-column-width, 90px);
}

[role=row]:last-child{
    border-top: 1px solid var(--gray, gray);
}


</style>
<h2><span>Monthly Balance</span></h2>
<div aria-label="balance" role="table">
    <div role="row" id="debit-row">
        <span role="rowheader">debit</span>
        <span role="cell" class="negative"></span>
    </div>
    <div role="row" id="credit-row">
        <span role="rowheader">credit</span>
        <span role="cell" class="positive"></span>
    </div>
    <div role="row" id="balance-row">
        <span role="rowheader">balance</span>
        <span role="cell"></span>
    </div>
</div>
`;

export const balanceTag = `app-balance`;

export class Balance extends HTMLElement {
    
    static get observedAttributes() {
        return ['credit', 'debit'];
    }
    
    get credit() {
        return this.hasAttribute('credit') ?
            Number(this.getAttribute('credit')) : 0;
    }
    
    set credit(val) {
        this.setAttribute('credit', val);
    }
    
    get debit() {
        return this.hasAttribute('debit') ?
            Number(this.getAttribute('debit')) : 0;
    }
    
    set debit(val) {
        this.setAttribute('debit', val);
    }
    
    get balance() {
        return this.credit + this.debit;
    }
    
    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'credit') {
            this.shadowRoot.querySelector('#credit-row [role=cell]').textContent = formatAmount(this.credit);
        } else if (name === 'debit') {
            this.shadowRoot.querySelector('#debit-row [role=cell]').textContent = formatAmount(this.debit);
        }
        
        const balanceDisplay = this.shadowRoot.querySelector('#balance-row [role=cell]');
        balanceDisplay.textContent = formatAmount(this.balance);
        balanceDisplay.classList.toggle('positive', this.balance > 0);
        balanceDisplay.classList.toggle('negative', this.balance < 0);
    }
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}
