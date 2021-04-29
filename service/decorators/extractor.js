const brandNN = require('../neuralnets/brandMatcherNN/fetching/brandFetch.js');

function getBrand(product_name) {
    return brandNN.classify(product_name);
}

function formatPrice(str) {
    const splittedStr = str.split(' ');
    const price = 0;
    splittedStr.forEach(ss => {
        price = parseFloat(ss);
        if (price !== NaN) {
            return price * 100;
        }
    });

    return 0;
}

function getPack(product_name) {}

module.exports = {
    getBrand: getBrand,
    formatPrice: formatPrice,
    getPack: getPack
};
