const brandNN = require('../neuralnets/brandMatcherNN/fetching/brandFetch.js');

function getBrand(product_name) {
    return brandNN.classify(product_name);
}

function formatPrice(str) {
    if ((typeof str) === "string") {
        const splittedStr = str.split(' ');
        let price = 0;
        splittedStr.forEach(ss => {
            price = parseFloat(ss);
            if (price !== NaN) {
                return price * 100;
            }
        });
        return 0;
    } else {
        return str * 100;
    }
}

function getPack(product_name) { }

function getCategory(fileString) {
    return fileString.split(/[\/|\\]/g).pop().replace('.json', '');
}

module.exports = {
    getBrand: getBrand,
    formatPrice: formatPrice,
    getPack: getPack,
    getCategory: getCategory
};
