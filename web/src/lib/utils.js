export const connector = (contentTag, fetcher, mapFn = state => state) => class extends HTMLElement {
    
    static get observedAttributes() {
        return ['status'];
    }
    
    get status() {
        return this.getAttribute('status') || 'loading';
    }
    
    get month() {
        return this.getAttribute('month') || new URLSearchParams(document.location.search.substring(1)).get('month');
    }
    
    get snapshotDate() {
        if (this.hasAttribute('snapshot_date')) {
            return new Date(this.getAttribute('snapshot_date'));
        } else {
            const snapshotDate = new URLSearchParams(document.location.search.substring(1)).get('snapshot_date');
            if (snapshotDate) {
                return new Date(snapshotDate);
            }
        }
        return null;
    }
    
    get accountId() {
        return Number(this.getAttribute('account-id') ||
            new URLSearchParams(document.location.search.substring(1)).get('account_id')
        );
    }
    
    set status(val) {
        this.setAttribute('status', val);
    }
    
    attributeChangedCallback(name) {
        if (name === 'status') {
            if (this.status === 'loaded') {
                const range = document.createRange();
                range.selectNodeContents(this);
                range.deleteContents();
                this.appendChild(this._contentEl);
            } else if (this.status === 'error') {
                this.textContent = 'Oups something went wrong';
            }
        }
    }
    
    async connectedCallback() {
        try {
            const res = await fetcher(this.month, this.accountId, this.snapshotDate);
            const state = mapFn(res);
            for (const [prop, value] of Object.entries(state)) {
                this._contentEl[prop] = value;
            }
            this.status = 'loaded';
        } catch (e) {
            console.error(e);
            this.status = 'error';
        }
    }
    
    constructor() {
        super();
        this.status = 'loading';
        this.classList.add('connector');
        this._contentEl = document.createElement(contentTag);
    }
};

export const debounce = (fn, time = 300) => {
    let timeout = null;
    return (...args) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            fn(...args);
        }, time);
    };
};
