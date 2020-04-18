export const formatAmount = val => (new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency:'EUR',
    maximumFractionDigits: 2
})).format(val / 100);
