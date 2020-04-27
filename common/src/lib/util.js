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

const ISODateFormat = new Intl.DateTimeFormat('en-US');

// ISO 8601
export const ISOFormatDate = (date) => ISODateFormat.format(date).split('/').join('-');

