const fs = require('fs');
const path = require('path');
const brandDictionary = require('../../../../data/brands/allBrands.json');

const getAllFiles = (dirPath, arrayOfFiles) => {
    files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, '/', file));
        }
    });

    return arrayOfFiles;
};

const allFiles = getAllFiles(path.resolve(__dirname + "../../../../../data/products"));
function genDataset() {
    console.log('Generating dataset...');
    console.time();
    const dataset = allFiles.map(fileString => {
        const file = fs.readFileSync(fileString);
        const products = JSON.parse(file);
        return products
            .map(prod => {
                if (prod != null && prod != undefined) return brandMatcher(prod.name);
            })
            .flat(1);
    }).flat(1).sort((a, b) => b.qs - a.qs);

    console.timeEnd();

    saveDataset(dataset);
}

// Reformat func (please)
function brandMatcher(product) {
    const result = [];
    const splittedWord = product.split(/[ -]+/);


    splittedWord.forEach((word, idx, arr) => {
        let counter = splittedWord.length - idx;
        let possibleMatch = '';

        for (let i = idx; i < counter + idx; i++) {
            possibleMatch += arr[i] + ' ';
            brandDictionary.forEach(brand => {
                const sorensenDiceCoefficient = sorensenDice(possibleMatch, brand);
                result.push({
                    name: product,
                    brand: brand,
                    qs: sorensenDiceCoefficient
                });
            });
        }
    });


    /*
    const res = brandDictionary.map(brand => {
        return {
            name: product,
            brand: brand,
            qs: sorensenDice(product, brand)
        }
    }).sort((a, b) => b.qs - a.qs).shift();
    return res;
    */

    return result.sort((a, b) => b.qs - a.qs).shift();
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

function saveDataset(dataset) {
    const dir = path.resolve(__dirname + `/../datasets`);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
            recursive: true
        });
    }

    fs.writeFile(path.resolve(__dirname + `/../datasets/dirtydataset-${Date.now()}.json`), JSON.stringify(dataset), err => {
        if (err) throw err;
        console.log('Saved dataset');
    });
}

module.exports = {
    genDataset: genDataset
}