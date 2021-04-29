const fs = require('fs');
const mimir = require('../../../../utils/mimir.js');
const genDict = require('./genDict.js');
const dirtyDataset = require('../datasets/dirtydataset-XXX.json');

// Cleaning dataset for input training
const cleanDataset = dirtyDataset.map(prod => {
    return {
        name: mimir.bow(prod.name, genDict.dict),
        brand: prod.brand,
        qs: prod.qs
    };
});

const dir = `../datasets`;
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
        recursive: true
    });
}

fs.writeFile(`../datasets/dataset-${Date.now()}.json`, JSON.stringify(cleanDataset), err => {
    if (err) throw err;
});
