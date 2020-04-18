export default (fetch = window.fetch, URL = window.URL) => (rootUrl) => {
    return async (month, accountId) => {
        const url = new URL(rootUrl);
        url.search = `?month=${month}&account_id=${accountId}`;
        const response = await fetch(url.href);
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }
        return response.json();
    };
};
