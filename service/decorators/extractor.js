const brandDictionary = require('../../data/brands/allBrands.json');
// const containerTypes = ["lata", "garrafa", "botella", "brik", ""]

function getBrand(product) {
    const result = [];
    const splitter = 0.3;

    const productName = ' ' + product.name.toUpperCase() + ' ';
    let isDirectCoincidence = false;
    for (brand of brandDictionary) {
        if (productName.includes(' ' + brand.toUpperCase() + ' ')) {
            result.push({
                name: product.name,
                brand: brand,
                qs: 1
            });
            isDirectCoincidence = true;
        }
    }

    if (result.length > 0) {
        return result.reduce((a, b) => a.brand.length > b.brand.length ? a : b).brand;
    }

    if (!isDirectCoincidence) {
        const splittedWord = product.name.split(/[ -]+/);


        splittedWord.forEach((word, idx, arr) => {
            brandDictionary.forEach(brand => {
                const fullNameCoefficient = sorensenDice(product.name, brand);
                const sorensenDiceCoefficient = sorensenDice(word, brand);
                if (sorensenDiceCoefficient * 0.7 + fullNameCoefficient * 0.3 > splitter) {
                    result.push({
                        name: product.name,
                        brand: brand,
                        qs: sorensenDiceCoefficient * 0.7 + fullNameCoefficient * 0.3
                    });
                }

                if (arr[idx + 1] != undefined) {
                    const sorensenDiceCoefficient2 = sorensenDice(word + ' ' + arr[idx + 1], brand);
                    if (sorensenDiceCoefficient2 * 0.7 + fullNameCoefficient * 0.3 > splitter) {
                        result.push({
                            name: product.name,
                            brand: brand,
                            qs: sorensenDiceCoefficient2 * 0.7 + fullNameCoefficient * 0.3
                        });
                    }
                }
            });
        });
    }

    return result.reduce((a, b) => {
        return a.qs > b.qs ? a.brand : b.brand;
    }, '_unknown');
}

function formatPrice(str) {
    str = str.replace("'", ".");
    str = str.replace(",", ".");
    if ((typeof str) === "string") {
        const splittedStr = str.split(' ');
        let price = 0;
        for (ss of splittedStr) {
            price = parseFloat(ss);
            if (price > 0) {
                return parseInt(price * 100);
            }
        }
        return -1;
    } else {
        return str * 100;
    }
}

function getPack(product_name) {
    const hasPack = product_name.includes('pack');
    if (hasPack) {
        const splittedName = product_name.split(' ');
        for (let i = 0; i < splittedName.length; i++) {
            if (splittedName[i].includes('pack')) {
                if (splittedName[i + 1] === "de") {
                    return parseInt(splittedName[i + 2]);
                } else {
                    return parseInt(splittedName[i + 1]);
                }
            }
        }
    }
    return null;
}

function getCategory(fileString) {
    return fileString.split(/[\/|\\]/g).pop().replace('.json', '');
}

function getContainer(product) {

}

function sorensenDice(l, r) {
    if (l.length < 2 || r.length < 2) return 0;

    let lBigrams = new Map();
    for (let i = 0; i < l.length - 1; i++) {
        const bigram = l.substr(i, 2);
        const count = lBigrams.has(bigram) ? lBigrams.get(bigram) + 1 : 1;

        lBigrams.set(bigram, count);
    }

    let intersectionSize = 0;
    for (let i = 0; i < r.length - 1; i++) {
        const bigram = r.substr(i, 2);
        const count = lBigrams.has(bigram) ? lBigrams.get(bigram) : 0;

        if (count > 0) {
            lBigrams.set(bigram, count - 1);
            intersectionSize++;
        }
    }

    return (2.0 * intersectionSize) / (l.length + r.length - 2);
}

module.exports = {
    getBrand: getBrand,
    formatPrice: formatPrice,
    getPack: getPack,
    getCategory: getCategory,
    getContainer: getContainer,
    sorensenDice: sorensenDice
};
