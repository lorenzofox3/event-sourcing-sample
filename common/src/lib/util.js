const numberFormat = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
    useGrouping: true
});

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'numeric'
});

export const formatAmount = val => numberFormat.format(val / 100);

export const formatShortDate = val => dateFormat.format(val);
// ISO 8601
export const formatISODate = (date) => date.toISOString().split('T')[0];


