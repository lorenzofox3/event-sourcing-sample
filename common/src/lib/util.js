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


export const MONTHS_LIST = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec'
];

// three letters month to 0 based index
export const monthToIndex = (month) => {
    const index = MONTHS_LIST.indexOf(month);
    if (index === -1) {
        throw new Error(`unknown month ${month}`);
    }
    return index;
};

export const formatAmount = val => numberFormat.format(val / 100);

export const formatShortDate = val => dateFormat.format(val);
// ISO 8601
export const formatISODate = (date) => date.toISOString().split('T')[0];


