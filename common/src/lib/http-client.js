import {formatISODate} from './util.js';

export default (fetch = window.fetch, URL = window.URL) => (rootUrl) => {
    return async (month, accountId, snapshot_date) => {
        const url = new URL(rootUrl);
        url.search = `?month=${month}&account_id=${accountId}`;
        
        if(snapshot_date){
            url.search+=`&snapshot_date=${formatISODate(new Date(snapshot_date))}`
        }
        
        const response = await fetch(url.href);
        
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }
        
        return response.json();
    };
};
