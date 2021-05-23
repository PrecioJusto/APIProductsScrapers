const brandDictionary = require('../../data/brands/allBrands.json');
const splitter = 0.3;

// const containerTypes = ["lata", "garrafa", "botella", "brik", ""]
function getLongestBrand(result) {
    return result.reduce((a, b) => a.length > b.length ? a : b);
}

function isMatchingBrand(brand, productName) {
    return productName.includes(brand);
}

function getMatchingBrands(productName) {
    return brandDictionary
        .filter(brand => isMatchingBrand(` ${brand.toUpperCase()} `, productName));
}

function getCoefficientResult({
    fullNameCoefficient,
    wordCoefficient
}) {
    if (fullNameCoefficient > 0 || wordCoefficient > 0) return fullNameCoefficient * 0.3 + wordCoefficient * 0.7;
    return 0;
}

function checkCoefficientTrust(coefficient) {
    return coefficient > splitter;
}

function generateObjectForCoefficient(brand, coefficient) {
    return {
        brand,
        qs: coefficient
    };
}

function generateThreads(name, brand) {
    return (word, idx, arr) => {
        return new Promise(resolve => {
            const fullNameCoefficient = sorensenDice(name, brand);
            const currentWordCoefficient = sorensenDice(word, brand);
            const nextWord = arr[idx + 1];
            const nextWordCoefficient = nextWord ? sorensenDice(`${word} ${nextWord}`, brand) : 0;

            const singleWordCoefficient = getCoefficientResult({
                fullNameCoefficient,
                currentWordCoefficient
            });

            const coupleWordCoefficient = getCoefficientResult({
                fullNameCoefficient,
                nextWordCoefficient
            });

            const isSingleWordTrustable = checkCoefficientTrust(singleWordCoefficient);
            const isCoupleWordsTrustable = checkCoefficientTrust(coupleWordCoefficient);

            if (isSingleWordTrustable || isCoupleWordsTrustable) {
                return resolve(generateObjectForCoefficient(brand, Math.max(singleWordCoefficient, coupleWordCoefficient)));
            } else {
                return '_unknown';
            }
        });
    }

    /*
    return brandDictionary.map(brand => {
        return new Promise(resolve => {
            const fullNameCoefficient = sorensenDice(name, brand);
            const currentWordCoefficient = sorensenDice(word, brand);
            const nextWord = arr[idx + 1];
            const nextWordCoefficient = nextWord ? sorensenDice(`${word} ${nextWord}`, brand) : 0;

            const singleWordCoefficient = getCoefficientResult({
                fullNameCoefficient,
                currentWordCoefficient
            });

            const coupleWordCoefficient = getCoefficientResult({
                fullNameCoefficient,
                nextWordCoefficient
            });

            const isSingleWordTrustable = checkCoefficientTrust(singleWordCoefficient);
            const isCoupleWordsTrustable = checkCoefficientTrust(coupleWordCoefficient);

            if (isSingleWordTrustable || isCoupleWordsTrustable) {
                return resolve(generateObjectForCoefficient(brand, Math.max(singleWordCoefficient, coupleWordCoefficient)));
            } else {
                return '_unknown';
            }
        });
    })
    */
}

async function getMatchingBrand(name) {
    const splittedWord = name.split(/[ -]+/);

    // const threadedWorks = splittedWord.map((word, idx) => generateThreads(name, word, splittedWord, idx));
    const threadedWorks = brandDictionary.map(brand => splittedWord.map(generateThreads(name, brand)));
    const resolvedThreads = await Promise.all(threadedWorks);
    const [trustworthyBrand] = resolvedThreads.sort((a, b) => b.qs - a.qs);

    // Esto no funciona porque en la primera iteración, a.qs vale '_unknown' y no un objeto que contenga qs
    // return resolvedThreads.reduce((a, b) => {
    //   return a.qs > b.qs ? a.brand : b.brand;
    // }, '_unknown')
    return `${trustworthyBrand}_unknown`;
}

async function getBrand(product) {
    const productName = ` ${product.name.toUpperCase()} `;
    const result = getMatchingBrands(productName);

    if (result.length > 0) {
        return getLongestBrand(result);
    }

    return getMatchingBrand(product.name);
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
    if (!hasPack) {
        return null;
    }
    const splittedName = product_name.split(' ');
    for (let i = 0; i < splittedName.length; i++) {
        if (!splittedName[i].includes('pack')) {
            continue;
        }
        const incr = splittedName[i + 1] === "de" ? 2 : 1;
        return parseInt(splittedName[i + incr]);
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