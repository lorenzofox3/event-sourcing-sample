import {formatAmount} from '../../../../common/src/lib/util.js';

export const barTag = `app-balance-bar`;

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
