import {formatAmount} from '../../common/src/lib/util.js';

const barTemplate = document.createElement(`template`);
barTemplate.innerHTML = `<style>
:host {
    display: flex;
}
#bar{
    display: inline-block;
    position: relative;
    height: var(--size, 0%);
    width: 100%;
}

#tooltip {
    --width:100px;
    display: none;
    background: #333355;
    color:white;
    position: absolute;
    padding: 0.5em;
    z-index: 9;
    border:1px solid var(--gray);
    border-radius: 5px;
    width: var(--width);
    text-align: center;
    left: calc(-1 * var(--width) / 2)
}

:host(.credit){
    flex-direction: column-reverse;
}

:host(.credit) #tooltip{
    top: -3em;
}

:host(.debit) #tooltip{
    top: calc(100% + 0.5em);
}

:host(.credit) #bar{
    background: var(--positive-background, #c8f9ad);
}

:host(.credit) #bar:hover{
    background: var(--positive-color);
}

#bar:hover #tooltip{
    display: inline-block;
}

:host(.debit) #bar{
    background: var(--negative-background, #ffd9db);
}

:host(.debit) #bar:hover{
    background: var(--negative-color);
}

</style>
<div id="bar">
    <span id="tooltip"></span>
</div>`;

const histogramTemplate = document.createElement(`template`);
histogramTemplate.innerHTML = `
<style>
    :host{
        --bin-count:0;
        display: grid;
        grid-template-rows: auto 1fr;
    }
    
    h2{
        text-align: center;
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
    
    #histogram{
        display: grid;
        grid-template-rows: 1fr auto 1fr;
        grid-gap: 1em;
        grid-template-columns: repeat(var(--bin-count), 1fr);
    }
    
    .credit {
        grid-row:1;
    }
    
    .x-label{
        grid-row: 2;
        font-size: small;
    }

    .debit {
        grid-row:3;
    }
    
    .visually-hidden{
        position: absolute !important;
        clip: rect(1px, 1px, 1px, 1px);
        padding:0 !important;
        border:0 !important;
        height: 1px !important;
        width: 1px !important;
        overflow: hidden;
    }
    
</style>
<h2 id="header"><span>Daily balance</span></h2>
<div aria-hidden="true" id="histogram"></div>
<div aria-labelledby="header" class="visually-hidden" id="fallback-table"></div>
`;

export const balanceHistogramTag = `app-balance-histogram`;
export const barTag = `app-balance-bar`;

const norm = (bins = []) => {
    const maxCredit = Math.max(...bins.map(({credit}) => Math.abs(credit)));
    const maxDebit = Math.max(...bins.map(({debit}) => Math.abs(debit)));
    return (val) => Math.round(Math.abs(val) * 100 / Math.max(maxCredit, maxDebit));
};

export class BalanceHistogram extends HTMLElement {
    
    get bins() {
        return this._bins;
    }
    
    set bins(val) {
        this._bins = val;
        this._update();
    }
    
    constructor() {
        super();
        this._bins = [];
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(histogramTemplate.content.cloneNode(true));
    }
    
    _update() {
        this.style.setProperty('--bin-count', this._bins.length);
        // const range = document.createRange();
        // range.selectNodeContents(this.shadowRoot);
        // range.deleteContents();
        const newFragment = createBinElements(this.bins);
        
        this.shadowRoot.getElementById('histogram').appendChild(newFragment);
        this.shadowRoot.getElementById('fallback-table').appendChild(createTableElement(this.bins));
    }
}

const createBinElements = (bins) => {
    const computeNorm = norm(bins);
    const newFragment = document.createDocumentFragment();
    
    for (const bin of bins) {
        const {day, credit, debit} = bin;
        const creditBin = document.createElement(barTag);
        const dayLabel = document.createElement('span');
        const debitBin = document.createElement(barTag);
        creditBin.setAttribute('size', computeNorm(credit));
        creditBin.setAttribute('value', credit);
        creditBin.classList.add('credit');
        dayLabel.textContent = day;
        dayLabel.classList.add('x-label');
        debitBin.setAttribute('size', computeNorm(debit));
        debitBin.setAttribute('value', debit);
        debitBin.classList.add('debit');
        newFragment.appendChild(creditBin);
        newFragment.appendChild(dayLabel);
        newFragment.appendChild(debitBin);
    }
    
    return newFragment;
};

const createTableElement = (bins) => {
    const table = document.createElement('table');
    const headers = document.createElement('thead');
    headers.innerHTML = `<tr><th>day</th><th>credit</th><th>debit</th></tr>`;
    table.appendChild(headers);
    const tbody = document.createElement('tbody');
    for (const bin of bins) {
        const row = document.createElement('tr');
        row.innerHTML = `<th scope="row">${bin.day}</th><td>${formatAmount(bin.credit)}</td><td>${formatAmount(bin.debit)}</td>`;
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    return table;
};

export class Bar extends HTMLElement {
    static get observedAttributes() {
        return [
            `size`,
            `value`
        ];
    }
    
    get value() {
        return this.getAttribute('value');
    }
    
    set value(val) {
        this.setAttribute('value', val);
    }
    
    get size() {
        return this.getAttribute('size');
    }
    
    set size(val) {
        return this.setAttribute('size', val);
    }
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(barTemplate.content.cloneNode(true));
    }
    
    attributeChangedCallback(name) {
        if (name === 'size') {
            this.style.setProperty('--size', `${this.size}%`);
        } else if (name === 'value') {
            this.shadowRoot.getElementById('tooltip').textContent = formatAmount(this.value);
        }
    }
}
