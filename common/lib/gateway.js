const {equal} = require('assert');
const {Pool} = require('pg');

const months = [
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

const monthToIndex = (month) => {
    const index = months.findIndex(month);
    if (index === -1) {
        throw new Error(`unknown month ${month}`);
    }

    return index + 1;
}

exports.createGateway = (opts = {}) => {

    const connections = new Pool(opts);

    return {
        replay: (accountId, month, snapshot) => {
            equal(!!accountId, true, 'accountId is required');
            equal(!!month, true, 'month is required');

            // todo
        }
    }
};
