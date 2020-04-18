import {formatAmount} from '../../common/src/lib/util.js';

const template = document.createElement(`template`);
template.innerHTML = `
<style>
.positive{
    background: #c8f9ad;
    color: #268226;
}

.positive::before{
    content:'+'
}

.negative::before{
    content:'-'
}

.negative{
    background:#ffd9db;
    color: #ff3c3c;
}

#balance-row{
    font-weight: bolder;
}

span[role=cell]{
    text-align: right;
}
</style>
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

export class Balance extends HTMLElement {
    
    static get observedAttributes() {
        return ['credit', 'debit'];
    }
    
    get credit() {
        return this.hasAttribute('credit') ?
            Number(this.getAttribute('credit')) : 0;
    }
    
    get debit() {
        return this.hasAttribute('debit') ?
            Math.abs(Number(this.getAttribute('debit'))) : 0;
    }
    
    get balance() {
        return this.credit - this.debit;
    }
    
    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'credit') {
            this.shadowRoot.querySelector('#credit-row [role=cell]').textContent = formatAmount(this.credit);
        } else if (name === 'debit') {
            this.shadowRoot.querySelector('#debit-row [role=cell]').textContent = formatAmount(this.debit);
        }
        
        const balanceDisplay = this.shadowRoot.querySelector('#balance-row [role=cell]');
        balanceDisplay.textContent = formatAmount(Math.abs(this.balance));
        balanceDisplay.classList.toggle('positive', this.balance > 0);
        balanceDisplay.classList.toggle('negative', this.balance < 0);
    }
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}
